'use client';

import React, { useEffect, useState } from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';

const navItems: CardNavItem[] = [
  {
    label: 'DASHBOARD',
    bgColor: 'var(--d-black)',
    textColor: 'var(--d-volt)',
    links: [
      { label: 'OVERVIEW', href: '/dashboard', ariaLabel: 'Dashboard Overview' },
      { label: 'TRANSACTIONS', href: '/dashboard', ariaLabel: 'All Transactions' },
    ],
  },
  {
    label: 'WEB3',
    bgColor: 'var(--d-dark)',
    textColor: 'var(--d-white)',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
      { label: 'KYC ORCHESTRATOR', href: '/kyc', ariaLabel: 'Identity Orchestrator' },
    ],
  },
  {
    label: 'SETTINGS',
    bgColor: 'var(--bg-secondary)',
    textColor: 'var(--d-volt)',
    links: [
      { label: 'API KEYS', href: '/dashboard', ariaLabel: 'Manage API Keys' },
      { label: 'WALLET', href: '/dashboard', ariaLabel: 'Wallet Settings' },
      { label: 'LOGOUT', href: '/logout', ariaLabel: 'Logout' },
    ],
  },
  {
    label: 'YOUR ACCOUNT',
    bgColor: 'var(--bg-secondary)',
    textColor: 'var(--text-primary)',
    links: [
      { label: 'PROFILE', href: '/profile', ariaLabel: 'View Profile' },
      { label: 'FIX YOUR ACCOUNT', href: '/profile', ariaLabel: 'Fix Your Account' },
    ],
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [budget, setBudget] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const [editBudget, setEditBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<Record<string, string>>({});

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('fb-id-token') : null;

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  useEffect(() => {
    if (!accessToken) {
      setAuthError('Your session expired. Please login again.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, budgetRes] = await Promise.all([
          fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/budget', { headers: { Authorization: `Bearer ${accessToken}` } })
        ]);

        if (!profileRes.ok || !budgetRes.ok) throw new Error('Failed to fetch user data');

        const profileData = await profileRes.json();
        const budgetData = await budgetRes.json();

        setProfile(profileData.profile);
        setStats(profileData.stats);
        setBudget(budgetData.budget || {});
        
        // Initialize editable form state
        const initialForm: Record<string, string> = {};
        Object.entries(budgetData.budget || {}).forEach(([k, v]) => {
          initialForm[k] = String(v);
        });
        setNewBudget(initialForm);

      } catch (err: any) {
        setAuthError(err.message || 'Error loading profile.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [accessToken]);

  const handleSaveBudget = async () => {
    if (!accessToken) return;
    try {
      const payload: Record<string, number> = {};
      Object.entries(newBudget).forEach(([k, v]) => {
        const parsed = Number(v);
        if (!isNaN(parsed) && parsed >= 0) payload[k] = parsed;
      });

      const res = await fetch('/api/budget', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update budget');
      
      const data = await res.json();
      setBudget(data.budget);
      setEditBudget(false);
      showToast('✅ BUDGETS UPDATED');
    } catch (err) {
      showToast('❌ FAILED TO UPDATE BUDGETS');
    }
  };

  return (
    <>
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="var(--bg-primary)"
        menuColor="var(--text-primary)"
        buttonBgColor="var(--d-volt)"
        buttonTextColor="var(--d-black)"
        buttonText="DASHBOARD"
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
          background: 'var(--d-black)',
          color: 'var(--d-volt)',
          padding: '10px 24px',
          border: '4px solid var(--d-volt)',
          boxShadow: 'var(--d-shadow-sm)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          zIndex: 500,
          opacity: toast.visible ? 1 : 0,
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        {toast.message}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        {authError && (
          <div
            style={{
              marginBottom: 24,
              border: '3px solid var(--d-volt)',
              background: 'var(--bg-secondary)',
              padding: '12px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            {authError}
          </div>
        )}

        {loading ? (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1rem', textAlign: 'center', marginTop: 40, color: 'var(--text-primary)' }}>
            LOADING PROFILE...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 40, border: 'var(--d-border)', padding: 32, background: 'var(--bg-secondary)', boxShadow: 'var(--d-shadow-lg)' }}>
              <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.5rem', fontWeight: 700, margin: '0 0 16px 0', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                USER PROFILE
              </h1>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>EMAIL:</strong> {profile?.email || 'N/A'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>LIFETIME TRANSACTIONS:</strong> {stats?.totalTransactions || 0}</p>
                <p style={{ margin: 0 }}><strong>LIFETIME SPENT:</strong> ₹{(stats?.lifetimeSpent || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div style={{ marginBottom: 40, border: 'var(--d-border)', padding: 32, background: 'var(--d-volt)', boxShadow: 'var(--d-shadow-lg)' }}>
              <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', textTransform: 'uppercase', color: 'var(--d-black)' }}>
                QUICK ACTIONS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <a
                  href="/kyc"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--d-black)',
                    color: 'var(--d-white)',
                    padding: '16px',
                    textDecoration: 'none',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: '2px solid var(--d-black)',
                    textAlign: 'center'
                  }}
                >
                  KYC VERIFICATION
                </a>
                <a
                  href="/pay"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    padding: '16px',
                    textDecoration: 'none',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: 'var(--d-border)',
                    textAlign: 'center'
                  }}
                >
                  PAYMENTS INTERFACE
                </a>
              </div>
            </div>

            <div style={{ border: 'var(--d-border)', padding: 32, background: 'var(--bg-secondary)', boxShadow: 'var(--d-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.25rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  BUDGET CONFIGURATION
                </h2>
                {!editBudget ? (
                  <button
                    onClick={() => setEditBudget(true)}
                    style={{
                      background: 'var(--d-black)',
                      color: 'var(--d-volt)',
                      border: 'none',
                      padding: '8px 16px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    EDIT BUDGETS
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                     <button
                      onClick={() => setEditBudget(false)}
                      style={{
                        background: 'var(--bg-primary)',
                        color: 'var(--text-muted)',
                        border: 'var(--d-border-thin)',
                        padding: '8px 16px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleSaveBudget}
                      style={{
                        background: 'var(--d-black)',
                        color: 'var(--d-volt)',
                        border: 'var(--d-border-thin)',
                        padding: '8px 16px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                {Object.entries(budget).map(([category, limit]) => (
                  <div key={category} style={{ borderBottom: '2px solid var(--text-muted)', paddingBottom: 16, opacity: 0.8 }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                      {category}
                    </div>
                    {editBudget ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.25rem', fontWeight: 700 }}>₹</span>
                        <input
                          type="number"
                          value={newBudget[category] || ''}
                          onChange={(e) => setNewBudget(prev => ({ ...prev, [category]: e.target.value }))}
                          style={{
                            width: '100%',
                            background: 'var(--bg-primary)',
                            border: '2px solid var(--d-black)',
                            color: 'var(--text-primary)',
                            padding: '8px 12px',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            outline: 'none',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{Number(limit).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <footer
        style={{
          borderTop: 'var(--d-border)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>FIXMYPAYMENTS © 2026</span>
        <span>·</span>
        <span>DISRUPTOR ENGINE</span>
      </footer>
    </>
  );
}
