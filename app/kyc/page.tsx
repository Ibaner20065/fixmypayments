'use client';

import React, { useState } from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

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

interface IdentityResult {
  requestType: string;
  dataRequired: string;
  verificationMethod: string;
  riskLevel: string;
  suggestedAction: string;
  privacyImpactSummary: string;
}

export default function KYCPage() {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentityResult | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!scenario.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Verification failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Network error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#121212', minHeight: '100vh', paddingBottom: 80 }}>
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 0' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ShieldCheck size={16} /> PRIVACY-FIRST IDENTITY
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
            KYC ORCHESTRATOR
          </h1>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1rem',
              color: '#475569',
              maxWidth: 600,
            }}
          >
            Simulate our AI-powered identity orchestrator. Enter a scenario (e.g., "User wants to open a bank account") to see how we verify identity using Zero-Knowledge Proofs without exposing raw data.
          </p>
        </div>

        {/* Input Area */}
        <div
          style={{
            background: '#FFFFFF',
            border: '8px solid #000000',
            boxShadow: '8px 8px 0px #000000',
            padding: 32,
            marginBottom: 40,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: -8,
              background: '#000000',
              color: '#CCFF00',
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
            INPUT SCENARIO
          </div>

          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="E.g., User wants to apply for a loan and needs to prove income > $50k..."
            style={{
              width: '100%',
              minHeight: 120,
              padding: '16px',
              border: '4px solid #000000',
              fontFamily: "'Space Mono', monospace",
              fontSize: '1rem',
              background: '#F8FAFC',
              resize: 'vertical',
              marginTop: 24,
              marginBottom: 24,
              outline: 'none',
            }}
          />

          <button
            onClick={handleVerify}
            disabled={loading || !scenario.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 32px',
              background: loading || !scenario.trim() ? '#333' : '#CCFF00',
              color: loading || !scenario.trim() ? '#666' : '#000000',
              border: '4px solid #000000',
              boxShadow: loading || !scenario.trim() ? 'none' : '4px 4px 0px #000000',
              fontFamily: "'Ranchers', cursive",
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              cursor: loading || !scenario.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && scenario.trim()) {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #000000';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && scenario.trim()) {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
              }
            }}
          >
            {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
            <ArrowRight size={20} />
          </button>

          {error && (
            <div style={{ marginTop: 16, color: '#DC2626', fontFamily: "'Space Mono', monospace", fontSize: '0.875rem', fontWeight: 'bold' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Output Area */}
        {result && (
          <div
            style={{
              background: '#000000',
              border: '8px solid #CCFF00',
              boxShadow: '8px 8px 0px #CCFF00',
              padding: 32,
              position: 'relative',
              animation: 'slideUp 0.3s ease-out forwards',
            }}
          >
            <style>{`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: -8,
                background: '#CCFF00',
                color: '#000000',
                border: '4px solid #000000',
                padding: '4px 16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transform: 'rotate(2deg)',
              }}
            >
              VERIFIED OUTPUT
            </div>

            <div style={{ display: 'grid', gap: 24, marginTop: 16 }}>
              {[
                { label: 'REQUEST TYPE', value: result.requestType },
                { label: 'DATA REQUIRED', value: result.dataRequired },
                { label: 'VERIFICATION METHOD', value: result.verificationMethod },
                { label: 'RISK LEVEL', value: result.riskLevel, isAlert: result.riskLevel === 'High' },
                { label: 'SUGGESTED ACTION', value: result.suggestedAction },
                { label: 'PRIVACY IMPACT', value: result.privacyImpactSummary, icon: <Lock size={14} /> },
              ].map((item, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.625rem',
                      color: '#64748B',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {item.icon} {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '1.125rem',
                      color: item.isAlert ? '#EF4444' : '#FFFFFF',
                      fontWeight: 600,
                      lineHeight: 1.4
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
