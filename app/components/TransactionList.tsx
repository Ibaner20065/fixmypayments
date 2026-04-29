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
          background: 'var(--bg-secondary)',
          border: 'var(--d-border)',
          boxShadow: 'var(--d-shadow-lg)',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '2rem', marginBottom: 8, opacity: 0.2 }}>📋</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--d-muted)' }}>
          NO TRANSACTIONS YET
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: 'var(--d-border)',
        boxShadow: 'var(--d-shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 100px',
          padding: '12px 20px',
          borderBottom: 'var(--d-border)',
          background: 'var(--d-black)',
          color: 'var(--d-volt)',
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
            borderBottom: '2px solid var(--text-primary)',
            transition: 'background 0.1s ease',
            cursor: 'default',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Text */}
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {t.emoji} {t.raw_text}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.625rem',
                color: 'var(--d-muted)',
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
                border: '4px solid var(--d-black)',
                borderRadius: 100,
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.5625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'var(--d-volt)',
                color: 'var(--d-black)',
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
              color: 'var(--text-primary)',
            }}
          >
            ₹{t.amount.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
}
