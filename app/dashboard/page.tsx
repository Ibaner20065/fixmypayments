'use client';

import React, { useState, useEffect } from 'react';
import CardNav from '../components/CardNav';
import { WalletConnectButton } from '../components/WalletConnectButton';
import TransactionInput from '../components/TransactionInput';
import CategoryChart from '../components/CategoryChart';
import TransactionRow from '../components/TransactionRow';
import { parseTransaction, classifyWithLLM } from '../lib/classify';
import type { ClassifiedTransaction } from '../lib/classify';
import type { CardNavItem } from '../components/CardNav';

const navItems: CardNavItem[] = [
  {
    label: 'DASHBOARD',
    bgColor: '#000000',
    textColor: '#CCFF00',
    links: [
      { label: 'OVERVIEW', href: '/dashboard', ariaLabel: 'Dashboard Overview' },
      { label: 'TRANSACTIONS', href: '/dashboard', ariaLabel: 'All Transactions' },
      { label: 'ANALYTICS', href: '/dashboard', ariaLabel: 'Spending Analytics' },
    ],
  },
  {
    label: 'WEB3',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
    ],
  },
  {
    label: 'SETTINGS',
    bgColor: '#1a1a2e',
    textColor: '#CCFF00',
    links: [
      { label: 'API KEYS', href: '/dashboard', ariaLabel: 'Manage API Keys' },
      { label: 'WALLET', href: '/dashboard', ariaLabel: 'Wallet Settings' },
    ],
  },
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<ClassifiedTransaction[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(true);

  // Load transactions from database on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoadingFromDB(false);
      }
    };

    fetchTransactions();
  }, []);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const handleAddTransaction = async (text: string) => {
    setIsLoading(true);

    try {
      // Send to API to classify and save
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text }),
      });

      if (!res.ok) {
        showToast('⚠ ERROR SAVING TRANSACTION');
        setIsLoading(false);
        return;
      }

      const newTransaction = await res.json();

      // Add emoji based on category
      const CATEGORY_EMOJIS: Record<string, string> = {
        Food: '🍔',
        Transport: '🚗',
        Shopping: '🛍️',
        Utilities: '⚡',
        Medical: '🏥',
        Entertainment: '🎬',
        Health: '💪',
        Groceries: '🛒',
      };

      const parsedTransaction = {
        ...newTransaction,
        emoji: CATEGORY_EMOJIS[newTransaction.category] || '📦',
      };

      if (newTransaction.amount === 0) {
        showToast('⚠ COULD NOT FIND AN AMOUNT — TRY "SWIGGY 300"');
      } else {
        // Update local state with new transaction
        setTransactions((prev) => [parsedTransaction, ...prev]);
        showToast(
          `${parsedTransaction.emoji} ₹${parsedTransaction.amount.toLocaleString('en-IN')} → ${parsedTransaction.category.toUpperCase()}`
        );
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('⚠ ERROR CLASSIFYING TRANSACTION');
    } finally {
      setIsLoading(false);
    }
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryCount = [...new Set(transactions.map((t) => t.category))].length;

  return (
    <>
      {/* CardNav */}
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="#FFFFFF"
        menuColor="#000000"
        buttonBgColor="#CCFF00"
        buttonTextColor="#000000"
        buttonText="LAUNCH APP"
        buttonHref="/dashboard"
        variant="disruptor"
      />

      {/* Toast */}
      <div
        style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: `translateX(-50%) translateY(${toast.visible ? 0 : -20}px)`,
          background: '#000000',
          color: '#CCFF00',
          padding: '10px 24px',
          border: '4px solid #CCFF00',
          boxShadow: '4px 4px 0px #CCFF00',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          zIndex: 500,
          opacity: toast.visible ? 1 : 0,
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {toast.message}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {[
            { label: 'TOTAL SPENDING', value: `₹${total.toLocaleString('en-IN')}` },
            { label: 'TRANSACTIONS', value: transactions.length.toString() },
            { label: 'CATEGORIES', value: categoryCount.toString() },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '4px solid #000000',
                boxShadow: '8px 8px 0px #000000',
                padding: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#475569',
                  marginBottom: 8,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "'Ranchers', cursive",
                  fontSize: '2rem',
                  color: '#000000',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: '#CCFF00',
                  marginTop: 12,
                }}
              />
            </div>
          ))}
        </div>

        {/* Wallet Connection */}
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'flex-end' }}>
          <WalletConnectButton />
        </div>

        {/* Section: Transaction Input */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#CCFF00',
              marginBottom: 12,
            }}
          >
            ⚡ QUICK ADD
          </div>
          <TransactionInput onAdd={handleAddTransaction} isLoading={isLoading} />
        </div>

        {/* Section: Charts */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#CCFF00',
              marginBottom: 12,
            }}
          >
            📊 SPENDING BREAKDOWN
          </div>
          <CategoryChart transactions={transactions} />
        </div>

        {/* Section: Recent Transactions */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#CCFF00',
              }}
            >
              📋 RECENT ACTIVITY
            </div>
            {transactions.length > 0 && (
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/api/export/csv';
                  (link as HTMLAnchorElement).download = '';
                  link.click();
                }}
                style={{
                  background: '#CCFF00',
                  border: '2px solid #000',
                  padding: '8px 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                📥 EXPORT CSV
              </button>
            )}
          </div>
          {transactions.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '2px dashed #CCFF00',
                padding: '32px',
                textAlign: 'center',
                color: '#475569',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              No transactions yet. Add one above!
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onUpdate={(updated) => {
                  setTransactions((prev) =>
                    prev.map((t) => (t.id === updated.id ? updated : t))
                  );
                  showToast('✓ TRANSACTION UPDATED');
                }}
                onDelete={(id) => {
                  setTransactions((prev) => prev.filter((t) => t.id !== id));
                  showToast('✓ TRANSACTION DELETED');
                }}
                onShowToast={showToast}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '4px solid #000000',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6875rem',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>FIXMYPAYMENTS © 2026</span>
        <span>·</span>
        <span>DISRUPTOR ENGINE</span>
      </footer>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
