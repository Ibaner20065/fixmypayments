'use client';

import React, { useState } from 'react';
import { type ZaapBundle } from '@/app/lib/zaap';

interface SwapSelectorProps {
  onSubmit: (fromToken: string, toToken: string, amount: string) => void;
  bundle: ZaapBundle;
}

const SWAP_ROUTES = [
  { from: 'ETH', to: 'USDC', label: 'ETH → USDC' },
  { from: 'USDC', to: 'ZAAP', label: 'USDC → ZAAP' },
  { from: 'ETH', to: 'ZAAP', label: 'ETH → ZAAP' },
  { from: 'USDT', to: 'ETH', label: 'USDT → ETH' },
];

export default function SwapSelector({ onSubmit, bundle }: SwapSelectorProps) {
  const [route, setRoute] = useState('ETH->USDC');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const [from, to] = route.split('->');
    onSubmit(from, to, amount);
  };

  return (
    <div>
      <h3
        style={{
          fontFamily: 'Ranchers',
          fontSize: '32px',
          textTransform: 'uppercase',
          margin: '0 0 30px 0',
          lineHeight: 0.85,
        }}
      >
        STEP 2: SWAP
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'Space Mono',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '8px',
            color: '#000',
          }}
        >
          SELECT SWAP ROUTE
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {SWAP_ROUTES.map((r) => {
            const routeKey = `${r.from}->${r.to}`;
            return (
              <button
                key={routeKey}
                onClick={() => setRoute(routeKey)}
                style={{
                  padding: '12px 16px',
                  border: route === routeKey ? '4px solid #CCFF00' : '4px solid #000',
                  background: route === routeKey ? '#CCFF00' : '#FFF',
                  fontFamily: 'Space Mono',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'Space Mono',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '8px',
            color: '#000',
          }}
        >
          SWAP AMOUNT
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.5"
          step="0.01"
          min="0"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '4px solid #000',
            fontFamily: 'Space Mono',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
        <p
          style={{
            fontSize: '12px',
            color: '#475569',
            marginTop: '8px',
            fontFamily: 'Plus Jakarta Sans',
          }}
        >
          Amount in {route.split('->')[0]}. Will receive corresponding {route.split('->')[1]}.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          onClick={() => {
            const steps = bundle.steps;
            if (steps.length > 0) {
              // Go back (would need parent handler)
            }
          }}
          style={{
            padding: '16px',
            border: '4px solid #000',
            background: '#FFF',
            fontFamily: 'Space Mono',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #000',
          }}
        >
          ← BACK
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: '16px',
            border: '4px solid #000',
            background: '#CCFF00',
            fontFamily: 'Space Mono',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '8px 8px 0 #000',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translate(4px, 4px)';
            (e.target as HTMLButtonElement).style.boxShadow = '4px 4px 0 #000';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translate(0, 0)';
            (e.target as HTMLButtonElement).style.boxShadow = '8px 8px 0 #000';
          }}
        >
          NEXT: TRANSFER →
        </button>
      </div>
    </div>
  );
}
