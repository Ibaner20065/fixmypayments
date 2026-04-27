'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  createZaapBundle,
  addWithdrawStep,
  addSwapStep,
  addTransferStep,
  isComplete,
  validateBundle,
  type ZaapBundle,
} from '@/app/lib/zaap';
import WithdrawSelector from './zaap/WithdrawSelector';
import SwapSelector from './zaap/SwapSelector';
import TransferSelector from './zaap/TransferSelector';
import BundlePreview from './zaap/BundlePreview';
import BundleProgress from './zaap/BundleProgress';

export default function ZaapBuilder() {
  const { address } = useAccount();
  const [bundle, setBundle] = useState<ZaapBundle | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [executing, setExecuting] = useState(false);

  const handleStartBundle = () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    setBundle(createZaapBundle(address));
    setCurrentStep(1);
  };

  const handleWithdraw = (poolName: string, tokenAddress: string, amount: string) => {
    if (!bundle) return;
    try {
      const updated = addWithdrawStep(
        bundle,
        poolName as 'AAVE' | 'MUTE',
        tokenAddress,
        amount
      );
      setBundle(updated);
      setCurrentStep(2);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Invalid step'}`);
    }
  };

  const handleSwap = (fromToken: string, toToken: string, amount: string) => {
    if (!bundle) return;
    try {
      const updated = addSwapStep(bundle, fromToken, toToken as 'ETH' | 'USDC' | 'ZAAP', amount);
      setBundle(updated);
      setCurrentStep(3);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Invalid step'}`);
    }
  };

  const handleTransfer = (recipient: string, amount: string) => {
    if (!bundle) return;
    try {
      const updated = addTransferStep(bundle, recipient, amount);
      setBundle(updated);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Invalid step'}`);
    }
  };

  const handleExecute = async () => {
    if (!bundle) return;

    const validation = validateBundle(bundle);
    if (!validation.valid) {
      alert(`Invalid bundle: ${validation.errors.join(', ')}`);
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch('/api/zaap/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setBundle({
        ...bundle,
        status: 'submitted',
        txHash: data.txHash,
      });

      // Simulate execution completion
      setTimeout(() => {
        setBundle((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
              }
            : null
        );
      }, 3000);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Execution failed'}`);
      setBundle({
        ...bundle,
        status: 'failed',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleReset = () => {
    setBundle(null);
    setCurrentStep(1);
  };

  if (!bundle) {
    return (
      <div
        style={{
          border: '8px solid #000',
          background: '#FFF',
          padding: '40px',
          maxWidth: '800px',
          margin: '40px auto',
          boxShadow: '8px 8px 0 #000',
        }}
      >
        <h2
          style={{
            fontFamily: 'Ranchers',
            fontSize: '48px',
            textTransform: 'uppercase',
            margin: '0 0 20px 0',
            lineHeight: 0.85,
            letterSpacing: '-2px',
          }}
        >
          ZAAP BUNDLER
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '30px', lineHeight: 1.6 }}>
          Execute 3-step DeFi transactions in one gasless bundle:
          <br />
          <strong>Withdraw</strong> from lending pool → <strong>Swap</strong> to target asset →{' '}
          <strong>Transfer</strong> or buy NFT
        </p>

        <button
          onClick={handleStartBundle}
          style={{
            fontFamily: 'Space Mono',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            padding: '16px 32px',
            border: '4px solid #000',
            background: '#CCFF00',
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
          {address ? 'START ZAAP BUNDLE' : 'CONNECT WALLET TO START'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <BundleProgress currentStep={currentStep} totalSteps={3} />

      <div
        style={{
          border: '8px solid #000',
          background: '#FFF',
          padding: '40px',
          margin: '30px 0',
          boxShadow: '8px 8px 0 #000',
        }}
      >
        {currentStep === 1 && (
          <WithdrawSelector onSubmit={handleWithdraw} bundle={bundle} />
        )}
        {currentStep === 2 && (
          <SwapSelector onSubmit={handleSwap} bundle={bundle} />
        )}
        {currentStep === 3 && (
          <TransferSelector onSubmit={handleTransfer} bundle={bundle} />
        )}

        {isComplete(bundle) && (
          <BundlePreview
            bundle={bundle}
            onExecute={handleExecute}
            onReset={handleReset}
            executing={executing}
          />
        )}
      </div>
    </div>
  );
}
