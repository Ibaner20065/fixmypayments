import { NextRequest, NextResponse } from 'next/server';

// In-memory budget storage (in production, use database)
const budgets: Map<string, any> = new Map();

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('cookie')?.includes('session_token');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allBudgets = Array.from(budgets.values());
    return NextResponse.json({ success: true, budgets: allBudgets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('cookie')?.includes('session_token');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, limit, spent, category, emailAlert } = await request.json();

    // Validation
    if (!name || !limit || limit <= 0) {
      return NextResponse.json(
        { error: 'Invalid budget data' },
        { status: 400 }
      );
    }

    const budgetId = `budget_${Date.now()}`;
    const newBudget = {
      id: budgetId,
      name,
      limit: parseFloat(limit),
      spent: parseFloat(spent || 0),
      category: category || 'general',
      emailAlert: emailAlert ?? true,
      createdAt: new Date().toISOString(),
      threshold: 80, // Alert at 80% by default
    };

    budgets.set(budgetId, newBudget);

    console.log(`✅ Budget created: ${name} ($${limit})`);

    return NextResponse.json({
      success: true,
      budget: newBudget,
    });
  } catch (error) {
    console.error('Budget creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
