import db from './db';

// Fraud Detection & Risk Scoring Engine
// Identifies suspicious patterns and assigns risk scores

export interface RiskFactor {
  category: 'critical' | 'high' | 'medium' | 'low';
  factor: string;
  points: number;
  evidence: string;
}

export interface FraudAssessmentResult {
  user_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number; // 0-100
  factors: RiskFactor[];
  recommendation: string;
  safe_to_approve: boolean;
  requires_manual_review: boolean;
  timestamp: string;
}

// Calculate risk score for user
export function calculateRiskScore(userId: string): FraudAssessmentResult {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  try {
    // 1. CHECK FOR DUPLICATE CREDENTIALS
    const credentials = db
      .prepare(
        `SELECT credential_type, COUNT(*) as count, status
         FROM user_credentials 
         WHERE user_id = ? AND status = 'active'
         GROUP BY credential_type
         HAVING count > 1`
      )
      .all(userId) as any[];

    if (credentials.length > 0) {
      for (const cred of credentials) {
        factors.push({
          category: 'high',
          factor: `multiple_${cred.credential_type}_credentials`,
          points: 25,
          evidence: `User has ${cred.count} active credentials of type ${cred.credential_type}`,
        });
        totalScore += 25;
      }
    }

    // 2. CHECK FOR REVOKED CREDENTIALS
    const revokedCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM credential_revocation 
         WHERE credential_id IN (
           SELECT id FROM user_credentials WHERE user_id = ?
         )`
      )
      .get(userId) as any;

    if (revokedCount.count > 0) {
      const revokedReasons = db
        .prepare(
          `SELECT reason, COUNT(*) as count FROM credential_revocation 
           WHERE credential_id IN (
             SELECT id FROM user_credentials WHERE user_id = ?
           )
           GROUP BY reason`
        )
        .all(userId) as any[];

      for (const rev of revokedReasons) {
        if (rev.reason === 'fraud') {
          factors.push({
            category: 'critical',
            factor: 'fraud_flagged_credential',
            points: 50,
            evidence: `Credential revoked due to fraud (${rev.count} instances)`,
          });
          totalScore += 50;
        } else if (rev.reason === 'user_request') {
          factors.push({
            category: 'low',
            factor: 'user_revoked_credential',
            points: 0,
            evidence: `User requested credential revocation (${rev.count} instances)`,
          });
        }
      }
    }

    // 3. CHECK FOR RAPID CREDENTIAL CREATION
    const rapidCreatedCreds = db
      .prepare(
        `SELECT COUNT(*) as count FROM user_credentials 
         WHERE user_id = ? 
         AND issued_at > datetime('now', '-7 days')`
      )
      .get(userId) as any;

    if (rapidCreatedCreds.count > 3) {
      factors.push({
        category: 'medium',
        factor: 'rapid_credential_creation',
        points: 20,
        evidence: `${rapidCreatedCreds.count} credentials created in last 7 days`,
      });
      totalScore += 20;
    }

    // 4. CHECK FOR UNUSUAL TRANSACTION PATTERNS
    const transactionStats = db
      .prepare(
        `SELECT 
           COUNT(*) as count,
           SUM(amount) as total_amount,
           AVG(amount) as avg_amount,
           MAX(amount) as max_amount
         FROM transactions 
         WHERE user_id = ? 
         AND date > datetime('now', '-30 days')`
      )
      .get(userId) as any;

    if (transactionStats.count > 20 && transactionStats.avg_amount > 10000) {
      factors.push({
        category: 'medium',
        factor: 'unusual_spending_pattern',
        points: 15,
        evidence: `${transactionStats.count} transactions in 30 days, avg ₹${transactionStats.avg_amount.toFixed(2)}`,
      });
      totalScore += 15;
    }

    // 5. CHECK FOR RAPID TRANSACTION SPIKES
    if (transactionStats.max_amount > transactionStats.avg_amount * 5) {
      factors.push({
        category: 'medium',
        factor: 'transaction_spike_detected',
        points: 10,
        evidence: `Largest transaction (₹${transactionStats.max_amount}) is 5x average`,
      });
      totalScore += 10;
    }

    // 6. CHECK FOR ACCOUNT AGE
    const userCreatedAt = db
      .prepare(`SELECT created_at FROM users WHERE id = ?`)
      .get(userId) as any;

    if (userCreatedAt) {
      const accountAgeDays = Math.floor(
        (new Date().getTime() - new Date(userCreatedAt.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (accountAgeDays < 7) {
        factors.push({
          category: 'medium',
          factor: 'new_account',
          points: 15,
          evidence: `Account created ${accountAgeDays} days ago`,
        });
        totalScore += 15;
      }
    }

    // 7. CHECK FOR MULTIPLE WALLET CONNECTIONS (unusual behavior)
    const walletCount = db
      .prepare(`SELECT COUNT(*) as count FROM wallet_connections WHERE user_id = ?`)
      .get(userId) as any;

    if (walletCount.count > 5) {
      factors.push({
        category: 'medium',
        factor: 'multiple_wallet_addresses',
        points: 12,
        evidence: `User connected ${walletCount.count} different wallet addresses`,
      });
      totalScore += 12;
    }

    // 8. CHECK FOR CREDENTIAL EXPIRY PATTERNS
    const expiredCreds = db
      .prepare(
        `SELECT COUNT(*) as count FROM user_credentials 
         WHERE user_id = ? 
         AND status = 'active'
         AND expiry < datetime('now')`
      )
      .get(userId) as any;

    if (expiredCreds.count > 0) {
      factors.push({
        category: 'low',
        factor: 'expired_credentials_not_revoked',
        points: 5,
        evidence: `${expiredCreds.count} credentials expired but not revoked`,
      });
      totalScore += 5;
    }

    // 9. POSITIVE FACTOR: Verified credentials from trusted issuers
    const trustedIssuers = ['did:key:hdfc-bank', 'did:key:aditya-birla', 'did:key:kyc-provider'];
    const trustedCreds = db
      .prepare(
        `SELECT COUNT(*) as count FROM user_credentials 
         WHERE user_id = ? 
         AND status = 'active'
         AND issuer_did IN (${trustedIssuers.map(() => '?').join(',')})`
      )
      .get(userId, ...trustedIssuers) as any;

    if (trustedCreds.count >= 2) {
      factors.push({
        category: 'low',
        factor: 'trusted_issuer_credentials',
        points: -10, // Negative points = lower risk
        evidence: `${trustedCreds.count} credentials from trusted financial institutions`,
      });
      totalScore = Math.max(0, totalScore - 10);
    }

    // Cap score at 100
    totalScore = Math.min(totalScore, 100);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (totalScore >= 70) riskLevel = 'critical';
    else if (totalScore >= 50) riskLevel = 'high';
    else if (totalScore >= 30) riskLevel = 'medium';

    // Generate recommendation
    let recommendation = '';
    let safe_to_approve = true;
    let requires_manual_review = false;

    switch (riskLevel) {
      case 'low':
        recommendation = '✅ User is low risk. Safe to approve transactions.';
        break;
      case 'medium':
        recommendation = '⚠️ User is medium risk. Monitor transaction amounts and patterns.';
        safe_to_approve = true;
        break;
      case 'high':
        recommendation = '🔴 User is high risk. Consider additional verification before high-value transactions.';
        safe_to_approve = false;
        requires_manual_review = true;
        break;
      case 'critical':
        recommendation = '🚨 CRITICAL RISK. Require immediate manual review and enhanced verification.';
        safe_to_approve = false;
        requires_manual_review = true;
        break;
    }

    // Store result in database
    try {
      db.prepare(
        `INSERT INTO fraud_scores (id, user_id, risk_level, score, factors, calculated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        `fraud_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId,
        riskLevel,
        totalScore,
        JSON.stringify(factors),
        new Date().toISOString()
      );
    } catch (dbError) {
      console.warn('Could not store fraud score:', dbError);
    }

    return {
      user_id: userId,
      risk_level: riskLevel,
      risk_score: totalScore,
      factors,
      recommendation,
      safe_to_approve,
      requires_manual_review,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calculating risk score:', error);

    return {
      user_id: userId,
      risk_level: 'medium',
      risk_score: 50,
      factors: [
        {
          category: 'high',
          factor: 'assessment_error',
          points: 50,
          evidence: 'Error during risk assessment - treating as elevated risk',
        },
      ],
      recommendation: '⚠️ Error during risk assessment. Manual review required.',
      safe_to_approve: false,
      requires_manual_review: true,
      timestamp: new Date().toISOString(),
    };
  }
}

// Quick risk check (lightweight version for API responses)
export function quickRiskCheck(userId: string): {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
} {
  try {
    const result = calculateRiskScore(userId);
    return {
      risk_level: result.risk_level,
      score: result.risk_score,
    };
  } catch {
    return {
      risk_level: 'medium',
      score: 50,
    };
  }
}

// Trend analysis: Is user's risk improving or worsening?
export function getRiskTrend(userId: string): {
  trend: 'improving' | 'stable' | 'worsening';
  direction: number; // -10 to +10, negative = improving
  previous_score?: number;
  current_score: number;
} {
  try {
    // Get last 2 fraud scores
    const scores = db
      .prepare(
        `SELECT score, calculated_at FROM fraud_scores 
         WHERE user_id = ? 
         ORDER BY calculated_at DESC 
         LIMIT 2`
      )
      .all(userId) as any[];

    const current = calculateRiskScore(userId);
    const currentScore = current.risk_score;

    if (scores.length < 2) {
      return {
        trend: 'stable',
        direction: 0,
        current_score: currentScore,
      };
    }

    const previousScore = scores[1].score;
    const diff = currentScore - previousScore;
    const direction = Math.max(-10, Math.min(10, diff / 10)); // Normalize to -10 to +10

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (diff < -5) trend = 'improving';
    else if (diff > 5) trend = 'worsening';

    return {
      trend,
      direction,
      previous_score: previousScore,
      current_score: currentScore,
    };
  } catch (error) {
    return {
      trend: 'stable',
      direction: 0,
      current_score: calculateRiskScore(userId).risk_score,
    };
  }
}
