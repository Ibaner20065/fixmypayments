import {
  checkKYCCredentials,
  getKYCRecommendation,
  calculateKYCScore,
  recordKYCDecision,
} from '../../../lib/kyc';
import { extractUserFromHeader } from '../../../lib/auth';
import { NextRequest } from 'next/server';

// GET /api/identity/kyc/check - Check for reusable KYC credentials
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserFromHeader(request.headers.get('authorization') || '');
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = checkKYCCredentials(userId);
    const recommendation = getKYCRecommendation(userId);
    const score = calculateKYCScore(userId);

    return Response.json({
      check: result,
      recommendation,
      kyc_score: score,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking KYC:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/identity/kyc/decide - Record user's decision and get next steps
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserFromHeader(request.headers.get('authorization') || '');
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { decision, credential_id } = await request.json();

    // Validate decision
    if (!['reuse', 'renew', 'create_new'].includes(decision)) {
      return Response.json({ error: 'Invalid decision' }, { status: 400 });
    }

    // Record decision
    recordKYCDecision(userId, decision, credential_id);

    // Return next steps based on decision
    let next_steps: string[] = [];
    let status = 'success';

    if (decision === 'reuse') {
      next_steps = [
        'Using existing KYC credential',
        'Proceed to next step in onboarding',
      ];
    } else if (decision === 'renew') {
      next_steps = [
        'Verify your identity with government ID',
        'Complete address verification',
        'Upload supporting documents',
        'Wait for verification (24-48 hours)',
      ];
    } else {
      // create_new
      next_steps = [
        'Start new KYC process',
        'Provide personal information',
        'Upload government ID',
        'Complete address verification',
        'Wait for verification',
      ];
    }

    return Response.json({
      decision,
      status,
      next_steps,
      credential_id: credential_id || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording KYC decision:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
