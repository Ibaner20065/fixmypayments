'use client';

import React from 'react';
import type { ClassifiedTransaction } from '../lib/classify';

interface TransactionListProps {
  transactions: ClassifiedTransaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '4px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '2rem', marginBottom: 8, opacity: 0.2 }}>📋</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>
          NO TRANSACTIONS YET
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '4px solid #000000',
        boxShadow: '8px 8px 0px #000000',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 100px',
          padding: '12px 20px',
          borderBottom: '4px solid #000000',
          background: '#000000',
          color: '#FFFFFF',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        <span>TRANSACTION</span>
        <span>CATEGORY</span>
        <span style={{ textAlign: 'right' }}>AMOUNT</span>
      </div>

      {/* Rows */}
      {[...transactions].reverse().map((t) => (
        <div
          key={t.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px',
            padding: '14px 20px',
            borderBottom: '2px solid #000000',
            transition: 'background 0.1s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Text */}
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#000',
              }}
            >
              {t.emoji} {t.raw_text}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.625rem',
                color: '#475569',
                marginTop: 2,
              }}
            >
              {t.merchant.toUpperCase()} · {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Category Chip */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '2px 10px',
                border: '4px solid #000000',
                borderRadius: 100,
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.5625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#CCFF00',
                color: '#000',
              }}
            >
              {t.category}
            </span>
          </div>

          {/* Amount */}
          <div
            style={{
              textAlign: 'right',
              fontFamily: "'Ranchers', cursive",
              fontSize: '1.125rem',
              color: '#000',
            }}
          >
            ₹{t.amount.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
}
