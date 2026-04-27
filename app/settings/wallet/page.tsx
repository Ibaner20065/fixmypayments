'use client';

import React, { useState } from 'react';
import CardNav from '../../components/CardNav';
import type { CardNavItem } from '../../components/CardNav';

const navItems: CardNavItem[] = [
  {
    label: 'SETTINGS',
    bgColor: '#1a1a2e',
    textColor: '#CCFF00',
    links: [
      { label: 'API KEYS', href: '/settings/api-keys', ariaLabel: 'Manage API Keys' },
      { label: 'WALLET', href: '/settings/wallet', ariaLabel: 'Wallet Settings' },
      { label: 'ALERTS', href: '/settings/alerts', ariaLabel: 'Budget Alerts' },
    ],
  },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState('0x1234567890123456789012345678901234567890');
  const [connected, setConnected] = useState(false);

  const connectWallet = () => {
    setConnected(!connected);
  };

  return (
    <>
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="#FFFFFF"
        menuColor="#000000"
        buttonBgColor="#CCFF00"
        buttonTextColor="#000000"
        buttonText="DASHBOARD"
        buttonHref="/dashboard"
        variant="disruptor"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, color: '#000' }}>
          WALLET SETTINGS
        </h1>

        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32, marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, color: '#000' }}>
              Connected Wallet
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.875rem',
                  background: connected ? '#E8F8E8' : '#f5f5f5',
                  color: connected ? '#00AA00' : '#666',
                }}
              >
                {connected ? '✓ Connected' : 'Not Connected'}
              </div>
              <button
                onClick={connectWallet}
                style={{
                  padding: '12px 20px',
                  background: connected ? '#FF6B6B' : '#CCFF00',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: connected ? '#FFFFFF' : '#000000',
                }}
              >
                {connected ? 'DISCONNECT' : 'CONNECT'}
              </button>
            </div>
          </div>

          {connected && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, color: '#000' }}>
                Wallet Address
              </label>
              <input
                type="text"
                value={wallet}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  background: '#f5f5f5',
                  boxSizing: 'border-box',
                  marginBottom: 24,
                }}
              />

              <div style={{ background: '#E8F8E8', border: '4px solid #00AA00', padding: 16 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#00AA00', fontWeight: 600 }}>
                  ✓ Wallet Connected Successfully
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                  Your wallet is now connected to FixMyPayments. You can now use Web3 features.
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#FFF3CD', border: '4px solid #FFC107', padding: 24 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: '#856404' }}>
            Network: zkSync Era Testnet
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
            Make sure your wallet is connected to zkSync Era Testnet for ZAAP bundler and Paymaster features.
          </p>
        </div>
      </div>
    </>
  );
}
