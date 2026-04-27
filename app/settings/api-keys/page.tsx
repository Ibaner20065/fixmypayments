'use client';

import React, { useState } from 'react';
import CardNav from '../../components/CardNav';
import type { CardNavItem } from '../../components/CardNav';
import { Copy, RefreshCw } from 'lucide-react';

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

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState('sk_live_51234567890abcdef');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substr(2, 20)}`;
    setApiKey(newKey);
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
          API KEYS
        </h1>

        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32, marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, color: '#000' }}>
              Live API Key
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="password"
                value={apiKey}
                readOnly
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.875rem',
                  background: '#f5f5f5',
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '12px 20px',
                  background: '#CCFF00',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Copy size={16} /> {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          <button
            onClick={regenerateKey}
            style={{
              padding: '12px 20px',
              background: '#FF6B6B',
              color: '#FFFFFF',
              border: '4px solid #000',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> REGENERATE KEY
          </button>

          <p style={{ marginTop: 20, fontSize: '0.875rem', color: '#666' }}>
            ⚠️ Keep this key secret. Do not share it publicly or commit to version control.
          </p>
        </div>

        <div style={{ background: '#f5f5f5', border: '4px solid #000', padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>Usage</h3>
          <pre style={{ background: '#000', color: '#CCFF00', padding: 16, overflow: 'auto', fontSize: '0.75rem', fontFamily: "'Space Mono', monospace" }}>
{`curl -X POST https://api.fixmypayments.com/v1/classify \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Swiggy 300"}'`}
          </pre>
        </div>
      </div>
    </>
  );
}
