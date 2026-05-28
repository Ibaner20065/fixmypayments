import { calculateRiskScore, quickRiskCheck, getRiskTrend } from '../../../lib/fraud';
import { extractUserFromHeader } from '../../../lib/auth';
import { NextRequest } from 'next/server';

// POST /api/identity/risk/assess - Full fraud risk assessment
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserFromHeader(request.headers.get('authorization') || '');
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate risk score
    const assessment = calculateRiskScore(userId);
    const trend = getRiskTrend(userId);

    return Response.json(
      {
        assessment,
        trend,
        action_items: generateActionItems(assessment),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assessing risk:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/identity/risk/quick - Quick risk check (lightweight)
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserFromHeader(request.headers.get('authorization') || '');
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quickCheck = quickRiskCheck(userId);
    const trend = getRiskTrend(userId);

    return Response.json(
      {
        risk: quickCheck,
        trend: trend.trend,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting quick risk check:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: Generate action items based on risk assessment
function generateActionItems(
  assessment: ReturnType<typeof calculateRiskScore>
): Array<{
  priority: 'high' | 'medium' | 'low';
  action: string;
  deadline?: string;
}> {
  const actions: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    deadline?: string;
  }> = [];

  if (assessment.risk_level === 'critical') {
    actions.push({
      priority: 'high',
      action: 'Contact support immediately - Account flagged for fraud review',
      deadline: 'Within 24 hours',
    });
    actions.push({
      priority: 'high',
      action: 'Complete enhanced identity verification',
      deadline: 'Before next transaction',
    });
  } else if (assessment.risk_level === 'high') {
    actions.push({
      priority: 'high',
      action: 'Review recent account activity',
      deadline: 'Within 48 hours',
    });
    actions.push({
      priority: 'medium',
      action: 'Consider credential refresh or renewal',
      deadline: 'Within 7 days',
    });
  } else if (assessment.risk_level === 'medium') {
    actions.push({
      priority: 'medium',
      action: 'Monitor account for unusual patterns',
      deadline: 'Ongoing',
    });
    if (assessment.factors.some((f) => f.factor === 'new_account')) {
      actions.push({
        priority: 'low',
        action: 'Complete email verification when ready',
        deadline: 'Within 30 days',
      });
    }
  }

  // Add factor-specific actions
  for (const factor of assessment.factors) {
    if (factor.factor === 'fraud_flagged_credential') {
      actions.push({
        priority: 'high',
        action: 'Verify identity - Previous credential flagged for fraud',
        deadline: 'Immediately',
      });
    }
    if (factor.factor === 'rapid_credential_creation') {
      actions.push({
        priority: 'medium',
        action: 'Review credential issuance requests',
        deadline: 'Within 48 hours',
      });
    }
    if (factor.factor === 'unusual_spending_pattern') {
      actions.push({
        priority: 'medium',
        action: 'Review recent transactions for suspicious activity',
        deadline: 'Within 24 hours',
      });
    }
  }

  return actions;
}
