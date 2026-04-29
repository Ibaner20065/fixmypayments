'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck } from 'lucide-react';

export default function PaymasterWidget() {
  return (
    <div
      style={{
        background: 'var(--d-volt)',
        border: 'var(--d-border)',
        boxShadow: 'var(--d-shadow-lg)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <Zap size={160} color="var(--d-black)" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
           <ShieldCheck size={24} color="var(--d-black)" />
          <h3
            style={{
              fontFamily: "'Ranchers', cursive",
              fontSize: '1.5rem',
               color: 'var(--d-black)',
              margin: 0,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            Paymaster Active
          </h3>
        </div>

        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
             color: 'var(--d-black)',
            marginBottom: 24,
            fontWeight: 600,
            maxWidth: '400px',
          }}
        >
          Gasless transactions are currently enabled on zkSync Era via the ZAAP Bundler. You can execute 3-step DeFi actions with 0 gas.
        </p>

        <Link
          href="/zaap"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
             background: 'var(--d-black)',
            color: 'var(--d-volt)',
            padding: '12px 24px',
            border: 'var(--d-border-thin)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textDecoration: 'none',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.2)';
          }}
        >
          <Zap size={16} />
          OPEN ZAAP BUILDER
        </Link>
      </div>
    </div>
  );
}
