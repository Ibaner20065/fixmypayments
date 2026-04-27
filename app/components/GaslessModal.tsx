'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PaymasterSDK } from '@/app/lib/paymaster-sdk';

interface GaslessModalProps {
  isOpen: boolean;
  amount: number;
  merchant: string;
  onSponsor: () => Promise<void>;
  onCancel: () => void;
}

export function GaslessModal({
  isOpen,
  amount,
  merchant,
  onSponsor,
  onCancel,
}: GaslessModalProps) {
  const { address } = useAccount();
  const [amlStatus, setAmlStatus] = useState<'loading' | 'verified' | 'failed'>('loading');
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [paymasterReady, setPaymasterReady] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      verifyAML();
      initPaymaster();
    }
  }, [isOpen, address]);

  const initPaymaster = () => {
    // In production, this would initialize with real Paymaster address
    // For now, just mark as ready to indicate Paymaster integration is available
    setPaymasterReady(true);
  };

  const verifyAML = async () => {
    try {
      setAmlStatus('loading');
      const res = await fetch(`/api/aml/verify?address=${address}`);
      const data = await res.json();
      setAmlStatus(data.verified ? 'verified' : 'failed');

      // Estimate gas if verified
      if (data.verified) {
        estimateGas();
      }
    } catch (error) {
      setAmlStatus('failed');
    }
  };

  const estimateGas = async () => {
    try {
      // Mock gas estimate: transaction sponsorship costs ~50k gas
      const mockGasLimit = '50000';
      const mockGasPrice = '1'; // gwei
      const mockCost = (BigInt(mockGasLimit) * BigInt(mockGasPrice)).toString();
      setGasEstimate(`${mockGasLimit} gas (${mockCost} wei ≈ $0 with Paymaster)`);
    } catch (error) {
      console.error('Gas estimation error:', error);
    }
  };

  const handleSponsor = async () => {
    setIsSponsoring(true);
    try {
      // Verify AML first
      if (amlStatus !== 'verified') {
        throw new Error('AML verification required');
      }

      await onSponsor();

      // In production, this would be the actual Paymaster tx hash
      const mockTxHash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(mockTxHash);
    } catch (err) {
      console.error('Sponsor error:', err);
      setAmlStatus('failed');
    } finally {
      setIsSponsoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px #000',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: "'Ranchers', cursive",
            fontSize: '1.5rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
            marginBottom: 20,
            color: '#000',
          }}
        >
          ⛽ GASLESS
          <br />
          TRANSACTION
        </h2>

        {txHash ? (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                background: '#CCFF00',
                border: '2px solid #000',
                padding: '16px',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#000',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                ✓ Transaction Sponsored
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                  color: '#000',
                  wordBreak: 'break-all',
                }}
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                background: '#F5F5F5',
                border: '2px solid #000',
                padding: '16px',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 16,
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
                    Amount
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#CCFF00',
                    }}
                  >
                    ₹{amount}
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
                    Merchant
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#000',
                    }}
                  >
                    {merchant}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '2px solid #000',
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Network Fee
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#000',
                  }}
                >
                  {gasEstimate || (amlStatus === 'verified' ? 'Estimating...' : 'Verify AML first')}
                </div>
              </div>

              {paymasterReady && (
                <div
                  style={{
                    background: '#CCFF00',
                    padding: '8px 12px',
                    marginTop: 12,
                    borderRadius: 0,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#000',
                    textAlign: 'center',
                  }}
                >
                  ✓ Paymaster Sponsorship Ready
                </div>
              )}
            </div>

            <div
              style={{
                background:
                  amlStatus === 'verified'
                    ? '#E8F5E9'
                    : amlStatus === 'failed'
                    ? '#FFEBEE'
                    : '#F5F5F5',
                border: `2px solid ${
                  amlStatus === 'verified'
                    ? '#00BB00'
                    : amlStatus === 'failed'
                    ? '#FF3333'
                    : '#000'
                }`,
                padding: '12px',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color:
                    amlStatus === 'verified'
                      ? '#00BB00'
                      : amlStatus === 'failed'
                      ? '#FF3333'
                      : '#475569',
                  textTransform: 'uppercase',
                }}
              >
                {amlStatus === 'loading' && '🔄 Checking AML...'}
                {amlStatus === 'verified' && '✓ AML Verified - Ready to Sponsor'}
                {amlStatus === 'failed' && '⚠ AML Verification Required'}
              </div>
            </div>
          </>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <button
            onClick={onCancel}
            disabled={isSponsoring}
            style={{
              background: '#FFFFFF',
              border: '2px solid #000',
              padding: '12px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: isSponsoring ? 'not-allowed' : 'pointer',
              opacity: isSponsoring ? 0.6 : 1,
            }}
          >
            CANCEL
          </button>

          <button
            onClick={handleSponsor}
            disabled={amlStatus !== 'verified' || isSponsoring}
            style={{
              background: '#CCFF00',
              border: '2px solid #000',
              padding: '12px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor:
                amlStatus !== 'verified' || isSponsoring
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                amlStatus !== 'verified' || isSponsoring ? 0.5 : 1,
            }}
          >
            {isSponsoring ? 'SPONSORING...' : 'SPONSOR TX'}
          </button>
        </div>

        {txHash && (
          <button
            onClick={onCancel}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '2px solid #000',
              padding: '12px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginTop: 12,
              cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        )}
      </div>
    </div>
  );
}
