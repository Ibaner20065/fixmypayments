import db from './db';

// KYC Optimization Engine
// Detects existing credentials and suggests reuse instead of re-verification

export interface ExistingCredential {
  id: string;
  issuer: string;
  issuedAt: string;
  expiry?: string;
  status: 'active' | 'revoked' | 'expired';
  reusable: boolean;
  age_days: number;
}

export interface KYCCheckResult {
  has_existing_kyc: boolean;
  existing_credentials: ExistingCredential[];
  recommendation: 'reuse' | 'renew' | 'create_new';
  reasoning: string;
  action: {
    type: 'reuse' | 'renew' | 'create_new';
    credential_id?: string;
    message: string;
  };
}

// Check if user has reusable KYC credentials
export function checkKYCCredentials(userId: string): KYCCheckResult {
  try {
    // Query existing KYC credentials for user
    const credentials = db
      .prepare(
        `SELECT id, issuer_did, issued_at, expiry, status 
         FROM user_credentials 
         WHERE user_id = ? AND credential_type = 'kyc'
         ORDER BY issued_at DESC`
      )
      .all(userId) as any[];

    if (credentials.length === 0) {
      return {
        has_existing_kyc: false,
        existing_credentials: [],
        recommendation: 'create_new',
        reasoning: 'No existing KYC credentials found',
        action: {
          type: 'create_new',
          message: 'Please complete KYC process to proceed',
        },
      };
    }

    // Analyze credentials
    const now = new Date();
    const analyzed: ExistingCredential[] = credentials
      .map((cred: any) => {
        const issuedDate = new Date(cred.issued_at);
        const age_days = Math.floor((now.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));

        let isExpired = false;
        let reusable = false;

        if (cred.expiry) {
          const expiryDate = new Date(cred.expiry);
          isExpired = now > expiryDate;
        }

        // Credential is reusable if: active, not expired, and less than 2 years old
        reusable = cred.status === 'active' && !isExpired && age_days < 730;

        return {
          id: cred.id,
          issuer: cred.issuer_did,
          issuedAt: cred.issued_at,
          expiry: cred.expiry,
          status: cred.status,
          reusable,
          age_days,
        };
      })
      .sort((a, b) => (a.reusable === b.reusable ? 0 : a.reusable ? -1 : 1));

    // Determine recommendation
    const activeReusable = analyzed.filter((c) => c.reusable);

    if (activeReusable.length > 0) {
      // Found valid credentials - suggest reuse
      return {
        has_existing_kyc: true,
        existing_credentials: analyzed,
        recommendation: 'reuse',
        reasoning: `Found valid KYC credential(s) from ${activeReusable[0].issuer}. Re-using will save time and protect your privacy.`,
        action: {
          type: 'reuse',
          credential_id: activeReusable[0].id,
          message: `Use existing KYC from ${new Date(activeReusable[0].issuedAt).toLocaleDateString()}`,
        },
      };
    }

    // Found expired/revoked credentials - suggest renewal
    const expired = analyzed.filter((c) => !c.reusable && c.status === 'active');
    if (expired.length > 0) {
      return {
        has_existing_kyc: true,
        existing_credentials: analyzed,
        recommendation: 'renew',
        reasoning: `Your previous KYC credential has expired. Please renew to continue.`,
        action: {
          type: 'renew',
          credential_id: expired[0].id,
          message: `Your KYC expired on ${expired[0].expiry}. Please renew.`,
        },
      };
    }

    // Only revoked credentials
    return {
      has_existing_kyc: true,
      existing_credentials: analyzed,
      recommendation: 'create_new',
      reasoning: 'Previous KYC credentials were revoked. Please complete new KYC process.',
      action: {
        type: 'create_new',
        message: 'Previous credentials revoked. Start new KYC process.',
      },
    };
  } catch (error) {
    console.error('Error checking KYC credentials:', error);
    return {
      has_existing_kyc: false,
      existing_credentials: [],
      recommendation: 'create_new',
      reasoning: 'Error checking credentials',
      action: {
        type: 'create_new',
        message: 'System error. Please start new KYC process.',
      },
    };
  }
}

// Get recommended action for user
export function getKYCRecommendation(userId: string): {
  action: 'skip_kyc' | 'use_existing' | 'renew' | 'complete_kyc';
  credential_id?: string;
  explanation: string;
} {
  const result = checkKYCCredentials(userId);

  if (result.recommendation === 'reuse' && result.action.credential_id) {
    return {
      action: 'use_existing',
      credential_id: result.action.credential_id,
      explanation: result.action.message,
    };
  }

  if (result.recommendation === 'renew' && result.action.credential_id) {
    return {
      action: 'renew',
      credential_id: result.action.credential_id,
      explanation: result.action.message,
    };
  }

  return {
    action: 'complete_kyc',
    explanation: result.action.message,
  };
}

// Record KYC decision (for analytics)
export function recordKYCDecision(
  userId: string,
  decision: 'reuse' | 'renew' | 'create_new',
  credentialId?: string
): boolean {
  try {
    // Log for analytics/audit
    // In production, could write to analytics table or event log
    console.log(`[KYC Decision] User: ${userId}, Decision: ${decision}, Credential: ${credentialId || 'new'}`);
    return true;
  } catch {
    return false;
  }
}

// Calculate KYC score for user (0-100)
// Based on: credential age, issuer reputation, verification status
export function calculateKYCScore(userId: string): {
  score: number;
  level: 'unverified' | 'level1' | 'level2' | 'level3';
  description: string;
} {
  try {
    const credentials = db
      .prepare(
        `SELECT credential_type, status, issued_at, expiry
         FROM user_credentials 
         WHERE user_id = ? AND status = 'active'
         ORDER BY issued_at DESC
         LIMIT 5`
      )
      .all(userId) as any[];

    if (credentials.length === 0) {
      return {
        score: 0,
        level: 'unverified',
        description: 'No verified identity credentials',
      };
    }

    let score = 0;

    // Base score: 20 points for having any credential
    score += 20;

    // KYC credential: +30 points
    const hasKYC = credentials.some((c) => c.credential_type === 'kyc');
    if (hasKYC) score += 30;

    // Banking credential: +20 points
    const hasBanking = credentials.some((c) => c.credential_type === 'banking');
    if (hasBanking) score += 20;

    // Age credential: +15 points
    const hasAge = credentials.some((c) => c.credential_type === 'age');
    if (hasAge) score += 15;

    // Health credential: +10 points
    const hasHealth = credentials.some((c) => c.credential_type === 'health');
    if (hasHealth) score += 10;

    // Credential age (fresher = better): max 5 points
    const newestCred = credentials[0];
    const credAge = Math.floor(
      (new Date().getTime() - new Date(newestCred.issued_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (credAge < 30) score += 5;
    else if (credAge < 90) score += 3;
    else if (credAge < 365) score += 1;

    // Cap at 100
    score = Math.min(score, 100);

    // Determine level
    let level: 'unverified' | 'level1' | 'level2' | 'level3' = 'unverified';
    if (score >= 80) level = 'level3';
    else if (score >= 50) level = 'level2';
    else if (score >= 20) level = 'level1';

    const descriptions: Record<string, string> = {
      unverified: 'No verified credentials',
      level1: 'Basic identity verified',
      level2: 'Intermediate verification (KYC + additional credentials)',
      level3: 'Full verification (multiple credentials across services)',
    };

    return {
      score,
      level,
      description: descriptions[level],
    };
  } catch (error) {
    console.error('Error calculating KYC score:', error);
    return {
      score: 0,
      level: 'unverified',
      description: 'Error calculating score',
    };
  }
}
