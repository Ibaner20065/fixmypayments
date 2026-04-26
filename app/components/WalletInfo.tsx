'use client';

import { useAccount, useBalance } from 'wagmi';
import React from 'react';

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '2px solid #CCFF00',
          padding: '16px',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
          }}
        >
          🔗 No Wallet Connected
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '2px solid #000',
        padding: '16px',
        marginBottom: 20,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Wallet Address
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#CCFF00',
            wordBreak: 'break-all',
          }}
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Balance
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#CCFF00',
          }}
        >
          {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Network
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 700,
            color: chain?.id === 324 ? '#00BB00' : '#FF9900',
          }}
        >
          {chain?.name || 'Unknown'}
        </div>
      </div>
    </div>
  );
}
