'use client';

import React, { useState } from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';
import { Send } from 'lucide-react';

const navItems: CardNavItem[] = [
  {
    label: 'WEB3',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
    ],
  },
];

interface BundleStep {
  id: number;
  type: string;
  amount: string;
  status: 'pending' | 'completed';
}

export default function ZaapPage() {
  const [steps, setSteps] = useState<BundleStep[]>([
    { id: 1, type: 'Approve Token', amount: 'USDC', status: 'completed' },
    { id: 2, type: 'Swap', amount: '100 USDC → ETH', status: 'completed' },
    { id: 3, type: 'Transfer', amount: '0.05 ETH', status: 'pending' },
  ]);

  const [newStep, setNewStep] = useState('');
  const [amlStatus, setAmlStatus] = useState('verified');
  const [paymasterStatus, setPaymasterStatus] = useState('active');

  const addStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, { id: steps.length + 1, type: newStep, amount: '', status: 'pending' }]);
      setNewStep('');
    }
  };

  const executeBundle = async () => {
    setSteps(steps.map(s => ({ ...s, status: 'completed' as const })));
    alert('✅ Bundle executed successfully! Tx: 0x123abc...');
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

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, color: '#000' }}>
          ZAAP BUNDLER
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>AML STATUS</h3>
            <div
              style={{
                background: amlStatus === 'verified' ? '#E8F8E8' : '#FFE8E8',
                border: `4px solid ${amlStatus === 'verified' ? '#00AA00' : '#FF6B6B'}`,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: amlStatus === 'verified' ? '#00AA00' : '#CC0000' }}>
                {amlStatus === 'verified' ? '✓ VERIFIED' : '✗ UNVERIFIED'}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
              Your wallet has passed AML verification. You can use PureFi Paymaster for gasless transactions.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>PAYMASTER</h3>
            <div
              style={{
                background: paymasterStatus === 'active' ? '#E8F8E8' : '#FFF3CD',
                border: `4px solid ${paymasterStatus === 'active' ? '#00AA00' : '#FFC107'}`,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: paymasterStatus === 'active' ? '#00AA00' : '#856404' }}>
                {paymasterStatus === 'active' ? '✓ ACTIVE' : '⚠ INACTIVE'}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
              Paymaster allows gasless transactions. No gas fees required for approved operations.
            </p>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700 }}>
            Bundle Steps
          </h2>

          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                background: step.status === 'completed' ? '#E8F8E8' : '#FFF3CD',
                border: `4px solid ${step.status === 'completed' ? '#00AA00' : '#FFC107'}`,
                padding: 16,
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                  {step.id}. {step.type}
                </p>
                {step.amount && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                    {step.amount}
                  </p>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: step.status === 'completed' ? '#00AA00' : '#856404',
                }}
              >
                {step.status === 'completed' ? '✓ DONE' : '⏳ PENDING'}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '2px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder="Add step (e.g., Swap to USDT)"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStep()}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={addStep}
                style={{
                  padding: '12px 20px',
                  background: '#CCFF00',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ADD
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={executeBundle}
          style={{
            width: '100%',
            padding: '16px',
            background: '#CCFF00',
            border: '4px solid #000',
            boxShadow: '4px 4px 0px #000',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Send size={18} /> EXECUTE BUNDLE (GASLESS)
        </button>
      </div>
    </>
  );
}
