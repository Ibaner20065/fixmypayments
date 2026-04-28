'use client';

import React, { useState } from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';
import { ArrowRight, Wallet, RefreshCw, Zap } from 'lucide-react';

const navItems: CardNavItem[] = [
  {
    label: 'DASHBOARD',
    bgColor: '#000000',
    textColor: '#CCFF00',
    links: [
      { label: 'OVERVIEW', href: '/dashboard', ariaLabel: 'Dashboard Overview' },
      { label: 'TRANSACTIONS', href: '/dashboard', ariaLabel: 'All Transactions' },
    ],
  },
  {
    label: 'WEB3',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
      { label: 'KYC ORCHESTRATOR', href: '/kyc', ariaLabel: 'Identity Orchestrator' },
    ],
  },
  {
    label: 'SETTINGS',
    bgColor: '#1a1a2e',
    textColor: '#CCFF00',
    links: [
      { label: 'API KEYS', href: '/dashboard', ariaLabel: 'Manage API Keys' },
      { label: 'WALLET', href: '/dashboard', ariaLabel: 'Wallet Settings' },
    ],
  },
  {
    label: 'YOUR ACCOUNT',
    bgColor: '#f5f5f5',
    textColor: '#000000',
    links: [
      { label: 'PROFILE', href: '/profile', ariaLabel: 'View Profile' },
      { label: 'FIX YOUR ACCOUNT', href: '/profile', ariaLabel: 'Fix Your Account' },
      { label: 'CHANGE YOUR GMAIL', href: '/profile', ariaLabel: 'Change Gmail' },
    ],
  },
];

interface StepData {
  action: string;
  protocol: string;
  asset: string;
}

const STEPS_CONFIG = [
  {
    num: '01',
    title: 'WITHDRAW',
    desc: 'Exit LP or lending position',
    icon: <Wallet size={24} />,
    protocols: ['Aave', 'Mute.io LP', 'Compound', 'Custom Pool'],
    assets: ['ETH', 'USDC', 'USDT', 'ZAAP'],
  },
  {
    num: '02',
    title: 'SWAP',
    desc: 'Convert to bridge asset',
    icon: <RefreshCw size={24} />,
    protocols: ['Mute.io DEX', 'SyncSwap', '1inch', 'Custom Router'],
    assets: ['ETH', 'USDC', 'USDT', 'ZAAP'],
  },
  {
    num: '03',
    title: 'ZAAP!',
    desc: 'Gasless transfer or action',
    icon: <Zap size={24} />,
    protocols: ['Wallet Transfer', 'OpenSea', 'Blur', 'Custom'],
    assets: ['ETH', 'USDC', 'NFT', 'ZAAP'],
  },
];

export default function ZaapPage() {
  const [steps, setSteps] = useState<StepData[]>([
    { action: '', protocol: '', asset: '' },
    { action: '', protocol: '', asset: '' },
    { action: '', protocol: '', asset: '' },
  ]);
  const [walletConnected, setWalletConnected] = useState(false);

  const updateStep = (index: number, field: keyof StepData, value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const allStepsValid = steps.every((s) => s.protocol && s.asset);

  return (
    <div style={{ background: '#121212', minHeight: '100vh' }}>
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="#FFFFFF"
        menuColor="#000000"
        buttonBgColor="#CCFF00"
        buttonTextColor="#000000"
        buttonText="LAUNCH APP"
        buttonHref="/dashboard"
        variant="disruptor"
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#CCFF00',
              marginBottom: 8,
            }}
          >
            ZKSYNC ERA · GASLESS BUNDLER
          </div>
          <h1
            style={{
              fontFamily: "'Ranchers', cursive",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              textTransform: 'uppercase',
              lineHeight: 0.85,
              color: '#FFFFFF',
              marginBottom: 16,
            }}
          >
            ZAAP BUILDER
          </h1>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1rem',
              color: '#475569',
              maxWidth: 500,
            }}
          >
            Bundle 3 DeFi steps into 1 gasless transaction on zkSync Era.
            Withdraw → Swap → Transfer in a single click.
          </p>
        </div>

        {/* Wallet Connect */}
        <div style={{ marginBottom: 40 }}>
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            id="wallet-connect-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 28px',
              minHeight: 48,
              background: walletConnected ? '#CCFF00' : '#000000',
              color: walletConnected ? '#000000' : '#FFFFFF',
              border: '4px solid #000000',
              boxShadow: '8px 8px 0px ' + (walletConnected ? '#CCFF00' : '#FFFFFF'),
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '0 0 0 #000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = `8px 8px 0px ${walletConnected ? '#CCFF00' : '#FFFFFF'}`;
            }}
          >
            <Wallet size={18} />
            {walletConnected ? '0x1234...ABCD · CONNECTED' : 'CONNECT WALLET'}
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {STEPS_CONFIG.map((step, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '8px solid #000000',
                boxShadow: '8px 8px 0px #FFFFFF',
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Watermark step number */}
              <div
                style={{
                  position: 'absolute',
                  right: 20,
                  top: -10,
                  fontFamily: "'Ranchers', cursive",
                  fontSize: '8rem',
                  color: '#000000',
                  opacity: 0.03,
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {step.num}
              </div>

              {/* Step tag */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: -8,
                  background: '#CCFF00',
                  border: '4px solid #000000',
                  padding: '4px 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transform: 'rotate(-2deg)',
                }}
              >
                STEP {step.num}
              </div>

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: '#000000',
                    border: '4px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CCFF00',
                  }}
                >
                  {step.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Ranchers', cursive",
                      fontSize: '1.5rem',
                      textTransform: 'uppercase',
                      lineHeight: 1,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.6875rem',
                      color: '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    PROTOCOL
                  </label>
                  <select
                    value={steps[i].protocol}
                    onChange={(e) => updateStep(i, 'protocol', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '4px solid #000000',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.8125rem',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="">SELECT...</option>
                    {step.protocols.map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    ASSET
                  </label>
                  <select
                    value={steps[i].asset}
                    onChange={(e) => updateStep(i, 'asset', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '4px solid #000000',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.8125rem',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="">SELECT...</option>
                    {step.assets.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Execute Button */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button
            disabled={!allStepsValid || !walletConnected}
            id="zaap-execute-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 48px',
              minHeight: 56,
              background: allStepsValid && walletConnected ? '#CCFF00' : '#333',
              color: allStepsValid && walletConnected ? '#000000' : '#666',
              border: '4px solid #000000',
              boxShadow: allStepsValid && walletConnected ? '8px 8px 0px #000000' : 'none',
              fontFamily: "'Ranchers', cursive",
              fontSize: '1.5rem',
              textTransform: 'uppercase',
              cursor: allStepsValid && walletConnected ? 'pointer' : 'not-allowed',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (allStepsValid && walletConnected) {
                e.currentTarget.style.transform = 'translate(4px, 4px)';
                e.currentTarget.style.boxShadow = '0 0 0 #000000';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              if (allStepsValid && walletConnected) {
                e.currentTarget.style.boxShadow = '8px 8px 0px #000000';
              }
            }}
          >
            <Zap size={20} />
            ZAAP!
            <ArrowRight size={20} />
          </button>
          {!walletConnected && (
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6875rem',
                color: '#475569',
                textTransform: 'uppercase',
                marginTop: 12,
              }}
            >
              CONNECT WALLET TO EXECUTE
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '4px solid #000000',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6875rem',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>ZAAP BUNDLER © 2026</span>
        <span>·</span>
        <span>ZKSYNC ERA</span>
      </footer>
    </div>
  );
}
