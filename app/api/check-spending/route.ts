import { NextRequest, NextResponse } from 'next/server';
import { checkSpendingAlerts } from '@/app/lib/alerts';

/**
 * POST /api/check-spending
 * Check if a new transaction triggers budget alerts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newAmount, newCategory, existingTransactions, budgets } = body;

    if (!newAmount || !newCategory || !existingTransactions || !budgets) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for spending alerts
    const alerts = checkSpendingAlerts(
      newAmount,
      newCategory,
      existingTransactions,
      budgets
    );

    return NextResponse.json({
      success: true,
      alerts: alerts,
      hasAlerts: alerts.length > 0,
    });
  } catch (error) {
    console.error('Spending check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
