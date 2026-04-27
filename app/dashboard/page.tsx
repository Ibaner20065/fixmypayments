'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CardNav from '../components/CardNav';
import TransactionInput from '../components/TransactionInput';
import CategoryChart from '../components/CategoryChart';
import TransactionList from '../components/TransactionList';
import BudgetManager from '../components/BudgetManager';
import StockWidget from '../components/StockWidget';
import PaymasterWidget from '../components/PaymasterWidget';
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
      { label: 'LOGOUT', href: '/logout', ariaLabel: 'Logout' },
    ],
  },
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<ClassifiedTransaction[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [cryptoSignal, setCryptoSignal] = useState<{
    averageChange: number;
    recommendation: string;
  } | null>(null);
  const [trendingCoins, setTrendingCoins] = useState<
    { name: string; symbol: string; market_cap_rank: number }[]
  >([]);
  const [authError, setAuthError] = useState('');
  const [pendingBlock, setPendingBlock] = useState<{
    rawText: string;
    amount: number;
    merchant: string;
    category: string;
    alerts: any[];
  } | null>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('fb-id-token') : null;

  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [budgetMap, setBudgetMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!accessToken) {
      setAuthError('Your session expired. Please login again.');
      return;
    }

    const loadTransactions = async () => {
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Could not load your dashboard data.');
        return;
      }

      setTransactions(
        (data.transactions || []).map((t: any) => ({
          ...t,
          amount: Number(t.amount) || 0,
          confidence: 1,
          emoji: '💳',
        }))
      );
      setByCategory(data.by_category || {});
    };

    const loadBudget = async () => {
      try {
        const res = await fetch('/api/budget', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok) setBudgetMap(data.budget || {});
      } catch (e) {}
    };

    void loadTransactions();
    void loadBudget();
  }, [accessToken]);

  useEffect(() => {
    const loadCryptoInsights = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch('/api/crypto-insights', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) return;
        setCryptoSignal(data.signal);
        setTrendingCoins(data.trending || []);
      } finally {
        setNewsLoading(false);
      }
    };

    void loadCryptoInsights();
  }, []);

  const handleAddTransaction = async (text: string) => {
    if (!accessToken) {
      showToast('⚠ LOGIN REQUIRED');
      return;
    }

    setIsLoading(true);
    let parsed: ClassifiedTransaction;

    try {
      parsed = await classifyWithLLM(text);
    } catch {
      parsed = parseTransaction(text);
    }

    setIsLoading(false);

    if (parsed.amount === 0) {
      showToast('⚠ COULD NOT FIND AN AMOUNT — TRY "SWIGGY 300"');
      return;
    }

    const saveRes = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ raw_text: text }),
    });
    const saved = await saveRes.json();

    if (!saveRes.ok) {
      if (saved.status === 'Blocked') {
        setPendingBlock({
          rawText: text,
          amount: saved.amount,
          merchant: saved.merchant,
          category: saved.category,
          alerts: saved.alerts,
        });
        showToast('🚨 BUDGET EXCEEDED. CONFIRMATION REQUIRED.');
        return;
      }
      showToast(`⚠ ${saved.error || 'SAVE FAILED'}`);
      return;
    }

    setTransactions((prev) => [
      ...prev,
      {
        ...parsed,
        ...saved,
        amount: Number(saved.amount) || parsed.amount,
        emoji: parsed.emoji,
      },
    ]);
    showToast(`${parsed.emoji} ₹${parsed.amount.toLocaleString('en-IN')} → ${parsed.category.toUpperCase()}`);

    if (Array.isArray(saved.alerts) && saved.alerts.length > 0) {
      showToast(`🚨 BUDGET ALERT: ${saved.alerts[0].message}`);
    }
  };

  const handleForceTransaction = async () => {
    if (!pendingBlock || !accessToken) return;
    setIsLoading(true);
    const saveRes = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ raw_text: pendingBlock.rawText, force: true }),
    });
    const saved = await saveRes.json();
    setIsLoading(false);
    setPendingBlock(null);

    if (!saveRes.ok) {
      showToast(`⚠ ${saved.error || 'SAVE FAILED'}`);
      return;
    }

    setTransactions((prev) => [
      ...prev,
      {
        ...pendingBlock,
        ...saved,
        amount: Number(saved.amount) || pendingBlock.amount,
        emoji: '🚨',
      },
    ]);
    showToast(`🚨 FORCED ₹${pendingBlock.amount} → ${pendingBlock.category.toUpperCase()}`);
  };

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    [transactions]
  );
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

        {authError && (
          <div
            style={{
              marginBottom: 24,
              border: '3px solid #ff0000',
              background: '#fff1f2',
              padding: '12px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#b91c1c',
              textTransform: 'uppercase',
            }}
          >
            {authError}
          </div>
        )}

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

        {/* Section: Crypto News + AI Analyzer */}
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
            📰 CRYPTO NEWS + AI ANALYSER
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '4px solid #000000',
                boxShadow: '8px 8px 0px #000000',
                padding: 20,
              }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, marginBottom: 12 }}>
                TRENDING COINS
              </div>
              {newsLoading ? (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>LOADING...</div>
              ) : (
                trendingCoins.map((coin) => (
                  <div key={`${coin.symbol}-${coin.name}`} style={{ marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>
                    {coin.name} ({coin.symbol?.toUpperCase()}) · Rank #{coin.market_cap_rank}
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '4px solid #000000',
                boxShadow: '8px 8px 0px #000000',
                padding: 20,
              }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, marginBottom: 12 }}>
                AI RECOMMENDATION
              </div>
              {newsLoading || !cryptoSignal ? (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>ANALYSING...</div>
              ) : (
                <>
                  <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '1.4rem', marginBottom: 8 }}>
                    24H MOMENTUM: {cryptoSignal.averageChange > 0 ? '+' : ''}
                    {cryptoSignal.averageChange}%
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {cryptoSignal.recommendation}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Transaction Input */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            ⚡ QUICK ADD
          </div>
          <div style={{ position: 'relative' }}>
            <TransactionInput onAdd={handleAddTransaction} isLoading={isLoading} budget={budgetMap} spentByCategory={byCategory} />
          </div>
        </div>

        {/* Section: Budget Manager */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            💰 BUDGET MANAGER
          </div>
          <BudgetManager accessToken={accessToken} spentByCategory={byCategory} />
        </div>

        {/* Section: Charts */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            📊 SPENDING BREAKDOWN
          </div>
          <CategoryChart transactions={transactions} />
        </div>

        {/* Section: Stock Recommendations */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            📈 STOCK RECOMMENDATIONS
          </div>
          <StockWidget />
        </div>

        {/* Section: Web3 Paymaster */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            ⚡ WEB3 DEFI
          </div>
          <PaymasterWidget />
        </div>

        {/* Section: Recent Transactions */}
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CCFF00', marginBottom: 12 }}>
            📋 RECENT ACTIVITY
          </div>
          <TransactionList transactions={transactions} />
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
      {/* Pending Block Modal */}
      {pendingBlock && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '4px solid #ff0000',
              boxShadow: '8px 8px 0px #ff0000',
              padding: 24,
              maxWidth: 400,
              width: '100%',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ff0000',
                marginBottom: 16,
              }}
            >
              🚨 BUDGET EXCEEDED
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              You are trying to spend <strong>₹{pendingBlock.amount.toLocaleString('en-IN')}</strong> on <strong>{pendingBlock.category}</strong>. 
              This will exceed your defined budget. Are you sure you want to proceed?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setPendingBlock(null)}
                style={{
                  flex: 1,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleForceTransaction}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: '#ff0000',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'FORCING...' : 'FORCE PROCEED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
