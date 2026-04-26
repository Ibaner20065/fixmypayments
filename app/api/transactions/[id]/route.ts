import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import db from '../../../lib/db';

// GET /api/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(id);

    if (!transaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
      });
    }

    return Response.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/transactions/[id] - Update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { category, merchant, amount } = await request.json();

    // Verify transaction exists
    const existing = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(id);

    if (!existing) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update only provided fields
    const updates: Record<string, any> = {};
    if (category !== undefined) updates.category = category;
    if (merchant !== undefined) updates.merchant = merchant;
    if (amount !== undefined) updates.amount = amount;

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    db.prepare(`UPDATE transactions SET ${setClause} WHERE id = ?`).run(
      ...values
    );

    const updated = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(id);

    return Response.json(updated);
  } catch (error) {
    console.error('Update transaction error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(id);

    if (!transaction) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);

    return Response.json({ success: true, deleted: transaction });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
