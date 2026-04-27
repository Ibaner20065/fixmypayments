'use client';

import React, { useState } from 'react';
import { type ZaapBundle } from '@/app/lib/zaap';

interface TransferSelectorProps {
  onSubmit: (recipient: string, amount: string) => void;
  bundle: ZaapBundle;
}

export default function TransferSelector({ onSubmit, bundle }: TransferSelectorProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transferType, setTransferType] = useState<'wallet' | 'nft'>('wallet');

  const handleSubmit = () => {
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      alert('Please enter valid recipient and amount');
      return;
    }
    onSubmit(recipient, amount);
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
        STEP 3: TRANSFER OR BUY NFT
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
          ACTION TYPE
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => setTransferType('wallet')}
            style={{
              padding: '12px 16px',
              border: transferType === 'wallet' ? '4px solid #CCFF00' : '4px solid #000',
              background: transferType === 'wallet' ? '#CCFF00' : '#FFF',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            WALLET TRANSFER
          </button>
          <button
            onClick={() => setTransferType('nft')}
            style={{
              padding: '12px 16px',
              border: transferType === 'nft' ? '4px solid #CCFF00' : '4px solid #000',
              background: transferType === 'nft' ? '#CCFF00' : '#FFF',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            BUY NFT
          </button>
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
          {transferType === 'wallet' ? 'RECIPIENT ADDRESS' : 'NFT COLLECTION / URL'}
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={transferType === 'wallet' ? '0x...' : 'OpenSea Collection URL'}
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
          {transferType === 'wallet' ? 'AMOUNT TO SEND' : 'BUDGET (USD)'}
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
        REVIEW BUNDLE →
      </button>
    </div>
  );
}
