'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PaymentStep {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
}

export default function PayPage() {
  const router = useRouter();
  const [step, setStep] = useState<'recipient' | 'amount' | 'review' | 'processing' | 'success'>('recipient');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const paymentSteps: PaymentStep[] = [
    { id: 1, title: 'Recipient', completed: step !== 'recipient' && recipient !== '', current: step === 'recipient' },
    { id: 2, title: 'Amount', completed: step === 'review' || step === 'processing' || step === 'success', current: step === 'amount' },
    { id: 3, title: 'Review', completed: step === 'processing' || step === 'success', current: step === 'review' },
    { id: 4, title: 'Confirm', completed: step === 'success', current: step === 'processing' || step === 'success' },
  ];

  const handleRecipientSubmit = () => {
    if (recipient.trim()) {
      setStep('amount');
    }
  };

  const handleAmountSubmit = () => {
    if (amount && parseFloat(amount) > 0) {
      setStep('review');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTransactionId(txId);
      setStep('success');
      setIsProcessing(false);
    }, 2500);
  };

  const categories = [
    { value: 'friend', label: 'Friend' },
    { value: 'family', label: 'Family' },
    { value: 'work', label: 'Work' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: 600, margin: '0 auto', marginBottom: 40 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 24,
            textDecoration: 'underline',
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px 0', color: '#000' }}>
          Send Money
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
          Quick, secure, and instant transfers
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ maxWidth: 600, margin: '0 auto', marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {paymentSteps.map((s, idx) => (
            <div key={s.id} style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: s.completed || s.current ? '#000' : '#e0e0e0',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {s.completed ? <CheckCircle size={18} /> : s.id}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: s.current || s.completed ? '#000' : '#999',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.title}
                </span>
              </div>
              {idx < paymentSteps.length - 1 && (
                <div
                  style={{
                    height: 2,
                    background: s.completed ? '#000' : '#e0e0e0',
                    marginLeft: 16,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* STEP 1: RECIPIENT */}
        {step === 'recipient' && (
          <div style={{ padding: 32 }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700 }}>
              Who are you paying?
            </h2>
            <input
              type="text"
              placeholder="Name, email, or phone"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRecipientSubmit()}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: '1rem',
                marginBottom: 20,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleRecipientSubmit}
              disabled={!recipient.trim()}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: recipient.trim() ? '#000' : '#e0e0e0',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: recipient.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: AMOUNT */}
        {step === 'amount' && (
          <div style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#666', fontWeight: 600 }}>
                PAYING TO
              </p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {recipient}
              </p>
            </div>

            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700 }}>
              How much?
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 700, marginRight: 8 }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAmountSubmit()}
                autoFocus
                style={{
                  flex: 1,
                  fontSize: '3rem',
                  fontWeight: 700,
                  border: 'none',
                  borderBottom: '2px solid #000',
                  outline: 'none',
                  paddingBottom: 8,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#666', fontWeight: 600 }}>
                CATEGORY
              </p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#666', fontWeight: 600 }}>
                NOTE (optional)
              </p>
              <input
                type="text"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 8,
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => setStep('recipient')}
                style={{
                  padding: '12px 16px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleAmountSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                style={{
                  padding: '12px 16px',
                  background: amount && parseFloat(amount) > 0 ? '#000' : '#e0e0e0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Review <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 'review' && (
          <div style={{ padding: 32 }}>
            <h2 style={{ margin: '0 0 32px 0', fontSize: '1.25rem', fontWeight: 700 }}>
              Review Payment
            </h2>

            <div
              style={{
                background: '#f9f9f9',
                borderRadius: 12,
                padding: 20,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <span style={{ color: '#666', fontWeight: 600 }}>Recipient</span>
                <span style={{ fontWeight: 700 }}>{recipient}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <span style={{ color: '#666', fontWeight: 600 }}>Amount</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>₹{parseFloat(amount).toLocaleString('en-IN')}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <span style={{ color: '#666', fontWeight: 600 }}>Category</span>
                <span style={{ fontWeight: 700 }}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </div>

              {note && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: 600 }}>Note</span>
                  <span style={{ fontWeight: 700 }}>{note}</span>
                </div>
              )}
            </div>

            <div
              style={{
                background: '#fff9e6',
                border: '1px solid #ffe082',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} style={{ color: '#f57f17', flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                Payments are instant and cannot be reversed. Make sure all details are correct.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => setStep('amount')}
                style={{
                  padding: '12px 16px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                style={{
                  padding: '12px 16px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Send size={18} /> Send Money
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROCESSING */}
        {step === 'processing' && (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <Loader
                size={48}
                style={{
                  animation: 'spin 1s linear infinite',
                  color: '#000',
                  margin: '0 auto',
                }}
              />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>
              Processing Payment
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              Please don't close this window...
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'success' && (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: '#e8f5e9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <CheckCircle size={48} style={{ color: '#4caf50' }} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 700 }}>
              Payment Sent!
            </h2>
            <p style={{ margin: '0 0 32px 0', fontSize: '0.875rem', color: '#666' }}>
              ₹{parseFloat(amount).toLocaleString('en-IN')} sent to {recipient}
            </p>

            <div
              style={{
                background: '#f9f9f9',
                borderRadius: 12,
                padding: 16,
                marginBottom: 32,
                textAlign: 'left',
              }}
            >
              <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>
                TRANSACTION ID
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {transactionId}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '12px 16px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setStep('recipient');
                  setRecipient('');
                  setAmount('');
                  setNote('');
                  setCategory('general');
                }}
                style={{
                  padding: '12px 16px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Send Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
