'use client';

import React, { useState, useRef } from 'react';

interface TransactionInputProps {
  onAdd: (text: string) => void;
  isLoading?: boolean;
  budget?: Record<string, number>;
  spentByCategory?: Record<string, number>;
}

export default function TransactionInput({ onAdd, isLoading, budget, spentByCategory = {} }: TransactionInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const predictCategory = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('swiggy') || t.includes('zomato') || t.includes('mcdonald') || t.includes('starbucks') || t.includes('kfc')) return 'Food';
    if (t.includes('uber') || t.includes('ola') || t.includes('metro') || t.includes('fuel') || t.includes('petrol')) return 'Transport';
    if (t.includes('amazon') || t.includes('netflix') || t.includes('spotify') || t.includes('cinema') || t.includes('pvr')) return 'Entertainment';
    if (t.includes('zara') || t.includes('hm') || t.includes('myntra') || t.includes('flipkart') || t.includes('mall')) return 'Shopping';
    if (t.includes('pharmacy') || t.includes('hospital') || t.includes('clinic') || t.includes('apollo')) return 'Medical';
    if (t.includes('gym') || t.includes('fitness') || t.includes('cult')) return 'Health';
    if (t.includes('grocery') || t.includes('mart') || t.includes('supermarket') || t.includes('blinkit') || t.includes('zepto') || t.includes('instamart')) return 'Groceries';
    if (t.includes('rent') || t.includes('electricity') || t.includes('water') || t.includes('wifi') || t.includes('jio') || t.includes('airtel')) return 'Utilities';
    return null;
  };

  const categoryMatch = predictCategory(value);
  const limit = categoryMatch && budget ? budget[categoryMatch] : null;
  const spent = categoryMatch ? spentByCategory[categoryMatch] || 0 : 0;
  const budgetExceeded = limit && spent >= limit;

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onAdd(text);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative' }}>
      {categoryMatch && limit && (
        <div
          style={{
            position: 'absolute',
            top: -42,
            left: 0,
            background: budgetExceeded ? '#ff0000' : '#CCFF00',
            color: budgetExceeded ? '#FFFFFF' : '#000000',
            padding: '8px 16px',
            border: '4px solid #000000',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '4px 4px 0px #000000',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
        >
          <span>DETECTED: {categoryMatch.toUpperCase()}</span>
          <span>|</span>
          <span>
            BUDGET: ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}
          </span>
          {budgetExceeded && <span>(⚠️ LIMIT EXCEEDED)</span>}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
        border: '4px solid #000000',
        boxShadow: '8px 8px 0px #000000',
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder='TYPE "SWIGGY 300" OR "METRO 45"'
        disabled={isLoading}
        id="transaction-input"
        style={{
          flex: 1,
          padding: '14px 20px',
          border: 'none',
          outline: 'none',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.875rem',
          fontWeight: 400,
          color: '#000',
          background: 'transparent',
          letterSpacing: '0.02em',
        }}
      />
      {/* Vertical divider */}
      <div style={{ width: 4, background: '#000000', alignSelf: 'stretch' }} />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !value.trim()}
        id="transaction-submit"
        style={{
          padding: '14px 28px',
          border: 'none',
          background: '#000000',
          color: '#FFFFFF',
          fontFamily: "'Ranchers', cursive",
          fontSize: '1rem',
          cursor: value.trim() && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s ease, color 0.15s ease',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          opacity: value.trim() && !isLoading ? 1 : 0.5,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (value.trim() && !isLoading) {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.color = '#000000';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#000000';
          e.currentTarget.style.color = '#FFFFFF';
        }}
      >
        {isLoading ? '...' : 'ADD →'}
      </button>
      </div>
    </div>
  );
}
