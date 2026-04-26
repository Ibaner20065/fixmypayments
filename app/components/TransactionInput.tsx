'use client';

import React, { useState, useRef } from 'react';

interface TransactionInputProps {
  onAdd: (text: string) => void;
  isLoading?: boolean;
}

export default function TransactionInput({ onAdd, isLoading }: TransactionInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onAdd(text);
    setValue('');
    inputRef.current?.focus();
  };

  return (
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
  );
}
