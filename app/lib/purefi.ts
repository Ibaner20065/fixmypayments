// PureFi AML integration for zkSync Era Paymaster

export interface PureFiPackage {
  sessionID: string;
  ruleID: string;
  expiry: number;
  verifiedUser: string;
  signature: string;
}

export interface AMLVerificationResult {
  verified: boolean;
  sessionID: string;
  ruleID: string;
  expiry: number;
  verifiedUser: string;
}

// Request AML package from PureFi Issuer API
export async function requestAMLPackage(
  userAddress: string,
  ruleType: 'deposit' | 'withdraw'
): Promise<PureFiPackage | null> {
  try {
    const issuerUrl = process.env.NEXT_PUBLIC_PUREFI_ISSUER_URL;
    if (!issuerUrl) {
      console.error('PureFi Issuer URL not configured');
      return null;
    }

    const ruleID = ruleType === 'deposit' ? 1 : 2; // Rule 1: deposit, Rule 2: withdraw

    const res = await fetch(`${issuerUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: userAddress,
        ruleId: ruleID,
      }),
    });

    if (!res.ok) {
      console.error('AML verification failed:', res.statusText);
      return null;
    }

    const data = await res.json();

    // PureFi returns: { data: [sessionID, ruleID, expiry, verifiedUser], signature }
    return {
      sessionID: data.data[0],
      ruleID: data.data[1],
      expiry: data.data[2],
      verifiedUser: data.data[3],
      signature: data.signature,
    };
  } catch (error) {
    console.error('PureFi request error:', error);
    return null;
  }
}

// Encode AML package for Paymaster input
export function encodePaymasterInput(amlPackage: PureFiPackage): string {
  // Paymaster expects: abi.encode((uint[4], bytes))
  // uint[4] = [sessionID, ruleID, expiry, verifiedUser]
  const encoded = `0x${[
    amlPackage.sessionID.padStart(64, '0'),
    amlPackage.ruleID.toString().padStart(64, '0'),
    amlPackage.expiry.toString(16).padStart(64, '0'),
    amlPackage.verifiedUser.replace('0x', '').padStart(64, '0'),
  ].join('')}${amlPackage.signature.replace('0x', '')}`;

  return encoded;
}

// Check if AML verification is valid (not expired)
export function isAMLValid(expiry: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiry > now;
}
