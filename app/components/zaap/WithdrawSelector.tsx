'use client';

import React, { useState } from 'react';
import { type ZaapBundle } from '@/app/lib/zaap';

interface WithdrawSelectorProps {
  onSubmit: (poolName: string, tokenAddress: string, amount: string) => void;
  bundle: ZaapBundle;
}

const POOLS = [
  { name: 'AAVE', label: 'Aave Lending Pool' },
  { name: 'MUTE', label: 'Mute.io DEX' },
];

const TOKENS = [
  { symbol: 'ETH', address: '0x4f3afec4e5a3f2a6a1a1a1a1a1a1a1a1a1a1a1a' },
  { symbol: 'USDC', address: '0xcccccccccccccccccccccccccccccccccccccccc' },
  { symbol: 'USDT', address: '0xdddddddddddddddddddddddddddddddddddddddd' },
];

export default function WithdrawSelector({ onSubmit, bundle }: WithdrawSelectorProps) {
  const [pool, setPool] = useState('AAVE');
  const [token, setToken] = useState(TOKENS[0].address);
  const [amount, setAmount] = useState('1.0');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onSubmit(pool, token, amount);
  };

  const tokenLabel = TOKENS.find((t) => t.address === token)?.symbol || 'ETH';

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
        STEP 1: WITHDRAW
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
          SELECT LENDING POOL
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {POOLS.map((p) => (
            <button
              key={p.name}
              onClick={() => setPool(p.name)}
              style={{
                padding: '12px 16px',
                border: pool === p.name ? '4px solid #CCFF00' : '4px solid #000',
                background: pool === p.name ? '#CCFF00' : '#FFF',
                fontFamily: 'Space Mono',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (pool !== p.name) {
                  (e.target as HTMLButtonElement).style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (pool !== p.name) {
                  (e.target as HTMLButtonElement).style.background = '#FFF';
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

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
          TOKEN TO WITHDRAW
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {TOKENS.map((t) => (
            <button
              key={t.address}
              onClick={() => setToken(t.address)}
              style={{
                padding: '12px 16px',
                border: token === t.address ? '4px solid #CCFF00' : '4px solid #000',
                background: token === t.address ? '#CCFF00' : '#FFF',
                fontFamily: 'Space Mono',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.symbol}
            </button>
          ))}
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
          AMOUNT {tokenLabel}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.0"
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
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
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
        NEXT: SWAP →
      </button>
    </div>
  );
}
