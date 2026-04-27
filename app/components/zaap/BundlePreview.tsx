'use client';

import React from 'react';
import { type ZaapBundle } from '@/app/lib/zaap';

interface BundlePreviewProps {
  bundle: ZaapBundle;
  onExecute: () => void;
  onReset: () => void;
  executing: boolean;
}

export default function BundlePreview({ bundle, onExecute, onReset, executing }: BundlePreviewProps) {
  return (
    <div style={{ marginTop: '40px' }}>
      <h3
        style={{
          fontFamily: 'Ranchers',
          fontSize: '32px',
          textTransform: 'uppercase',
          margin: '0 0 30px 0',
          lineHeight: 0.85,
        }}
      >
        BUNDLE PREVIEW
      </h3>

      {bundle.steps.map((step, idx) => (
        <div
          key={idx}
          style={{
            padding: '16px',
            border: '4px solid #000',
            background: '#f9f9f9',
            marginBottom: '12px',
            fontFamily: 'Space Mono',
            fontSize: '12px',
          }}
        >
          <strong>STEP {step.stepNum}: {step.action.toUpperCase()}</strong>
          <pre
            style={{
              marginTop: '8px',
              fontSize: '11px',
              overflow: 'auto',
              background: '#fff',
              padding: '8px',
              border: '2px solid #ddd',
            }}
          >
            {JSON.stringify(step.params, null, 2)}
          </pre>
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '30px' }}>
        <button
          onClick={onReset}
          disabled={executing}
          style={{
            padding: '16px',
            border: '4px solid #000',
            background: '#FFF',
            fontFamily: 'Space Mono',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: executing ? 'not-allowed' : 'pointer',
            boxShadow: '4px 4px 0 #000',
            opacity: executing ? 0.5 : 1,
          }}
        >
          START OVER
        </button>
        <button
          onClick={onExecute}
          disabled={executing}
          style={{
            padding: '16px',
            border: '4px solid #000',
            background: '#CCFF00',
            fontFamily: 'Space Mono',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: executing ? 'not-allowed' : 'pointer',
            boxShadow: '8px 8px 0 #000',
            transition: 'all 0.15s ease',
            opacity: executing ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!executing) {
              (e.target as HTMLButtonElement).style.transform = 'translate(4px, 4px)';
              (e.target as HTMLButtonElement).style.boxShadow = '4px 4px 0 #000';
            }
          }}
          onMouseLeave={(e) => {
            if (!executing) {
              (e.target as HTMLButtonElement).style.transform = 'translate(0, 0)';
              (e.target as HTMLButtonElement).style.boxShadow = '8px 8px 0 #000';
            }
          }}
        >
          {executing ? 'EXECUTING...' : 'EXECUTE ZAAP!'}
        </button>
      </div>
    </div>
  );
}
