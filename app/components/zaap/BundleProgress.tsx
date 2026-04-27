'use client';

import React from 'react';

interface BundleProgressProps {
  currentStep: 1 | 2 | 3;
  totalSteps: number;
}

export default function BundleProgress({ currentStep, totalSteps }: BundleProgressProps) {
  const steps = ['WITHDRAW', 'SWAP', 'TRANSFER'];

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', alignItems: 'center' }}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div
            style={{
              padding: '12px 20px',
              border: '4px solid #000',
              background: currentStep > idx + 1 ? '#CCFF00' : currentStep === idx + 1 ? '#CCFF00' : '#FFF',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              minWidth: '120px',
              textAlign: 'center',
              opacity: currentStep >= idx + 1 ? 1 : 0.5,
            }}
          >
            {step}
          </div>
          {idx < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '4px',
                background: currentStep > idx + 1 ? '#CCFF00' : '#ddd',
                minWidth: '20px',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
