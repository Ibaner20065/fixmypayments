import type { NextRequest } from 'next/server';
import db from '../../../lib/db';
import { randomUUID } from 'crypto';

/**
 * AML Verification Flow
 * 1. Frontend requests verification for a wallet address
 * 2. Backend fetches PureFi AML package (if API available)
 * 3. Stores verification in DB with expiry
 * 4. Returns verification status
 * 
 * In demo mode: auto-approves with default rule
 */

const PUREFI_ISSUER_URL = process.env.NEXT_PUBLIC_PUREFI_ISSUER_URL;
const PUREFI_PRIVATE_KEY = process.env.PUREFI_ISSUER_PRIVATE_KEY;

// Default demo rule for testing
const DEMO_RULE_ID = '0x01';
const DEMO_EXPIRY = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, action } = await request.json();

    if (!wallet_address || typeof wallet_address !== 'string') {
      return Response.json(
        { error: 'wallet_address is required' },
        { status: 400 }
      );
    }

    // Check if already verified and not expired
    const existing = db
      .prepare(
        'SELECT * FROM wallet_connections WHERE address = ? AND aml_verified = 1'
      )
      .get(wallet_address.toLowerCase());

    if (existing) {
      const existingData = existing as any;
      const isExpired = new Date(existingData.aml_expiry) < new Date();
      
      if (!isExpired) {
        return Response.json({
          verified: true,
          address: wallet_address.toLowerCase(),
          rule_id: existingData.aml_rule_id,
          expiry: existingData.aml_expiry,
          message: 'Already verified',
        });
      }
    }

    // Try PureFi API if configured
    let amlData: any = null;
    if (PUREFI_ISSUER_URL && PUREFI_PRIVATE_KEY) {
      try {
        const response = await fetch(`${PUREFI_ISSUER_URL}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PUREFI_PRIVATE_KEY}`,
          },
          body: JSON.stringify({
            wallet_address: wallet_address.toLowerCase(),
            action: action || 'transfer',
          }),
        });

        if (response.ok) {
          amlData = await response.json();
        }
      } catch (error) {
        console.warn('PureFi API unavailable, using demo mode:', error);
      }
    }

    // Use demo data if API unavailable
    if (!amlData) {
      amlData = {
        verified: true,
        rule_id: DEMO_RULE_ID,
        expiry: DEMO_EXPIRY,
        message: 'Demo mode - auto-approved',
      };
    }

    // Store verification in DB
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO wallet_connections 
      (id, address, aml_verified, aml_rule_id, aml_expiry)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      wallet_address.toLowerCase(),
      amlData.verified ? 1 : 0,
      amlData.rule_id || DEMO_RULE_ID,
      amlData.expiry || DEMO_EXPIRY
    );

    return Response.json({
      verified: amlData.verified === true,
      address: wallet_address.toLowerCase(),
      rule_id: amlData.rule_id,
      expiry: amlData.expiry,
      message: amlData.message || 'Verification successful',
    });
  } catch (error) {
    console.error('AML verification error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/aml/verify?address=0x... - Check AML status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return Response.json(
        { error: 'address query parameter is required' },
        { status: 400 }
      );
    }

    const wallet = db
      .prepare('SELECT * FROM wallet_connections WHERE address = ?')
      .get(address.toLowerCase());

    if (!wallet) {
      return Response.json({
        verified: false,
        address: address.toLowerCase(),
        message: 'Not verified',
      });
    }

    const walletData = wallet as any;
    const isExpired = new Date(walletData.aml_expiry) < new Date();

    return Response.json({
      verified: walletData.aml_verified === 1 && !isExpired,
      address: address.toLowerCase(),
      rule_id: walletData.aml_rule_id,
      expiry: walletData.aml_expiry,
      message: isExpired ? 'Verification expired' : 'Verified',
    });
  } catch (error) {
    console.error('AML check error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
