import type { NextRequest } from 'next/server';
import db from '../../../lib/db';

// GET /api/export/csv - Export transactions as CSV
export async function GET(request: NextRequest) {
  try {
    const transactions = db
      .prepare('SELECT * FROM transactions ORDER BY date DESC')
      .all();

    if (transactions.length === 0) {
      return Response.json(
        { error: 'No transactions to export' },
        { status: 400 }
      );
    }

    // CSV headers
    const headers = ['ID', 'Date', 'Amount', 'Category', 'Merchant', 'Raw Text', 'Confidence'];

    // CSV rows
    const rows = (transactions as any[]).map((t) => [
      t.id,
      t.date,
      t.amount,
      t.category,
      t.merchant,
      `"${t.raw_text.replace(/"/g, '""')}"`, // Escape quotes
      t.confidence,
    ]);

    // Build CSV
    const csv =
      headers.join(',') +
      '\n' +
      rows.map((row) => row.join(',')).join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fixmypayments-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
