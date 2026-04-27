'use client';

import React, { useState } from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';
import { Search, Download, Filter } from 'lucide-react';

const navItems: CardNavItem[] = [
  {
    label: 'ACCOUNT',
    bgColor: '#121212',
    textColor: '#FFFFFF',
    links: [
      { label: 'DASHBOARD', href: '/dashboard', ariaLabel: 'Back to Dashboard' },
      { label: 'TRANSACTIONS', href: '/transactions', ariaLabel: 'View Transactions' },
      { label: 'ANALYTICS', href: '/analytics', ariaLabel: 'Spending Analytics' },
    ],
  },
];

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>([
    { id: 'tx1', date: '2024-01-15', description: 'API Gateway Fee', amount: 5.0, category: 'Platform', status: 'completed' },
    { id: 'tx2', date: '2024-01-14', description: 'Wallet Top-up', amount: 100.0, category: 'Deposit', status: 'completed' },
    { id: 'tx3', date: '2024-01-13', description: 'Bundle Execution (ZAAP)', amount: 2.5, category: 'Transactions', status: 'completed' },
    { id: 'tx4', date: '2024-01-12', description: 'Failed Transaction Retry', amount: 0.0, category: 'Transactions', status: 'failed' },
    { id: 'tx5', date: '2024-01-11', description: 'Paymaster Fee', amount: 1.5, category: 'Platform', status: 'completed' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = ['all', 'Platform', 'Deposit', 'Transactions'];
  const statuses = ['all', 'completed', 'pending', 'failed'];

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#00AA00';
      case 'pending':
        return '#FFC107';
      case 'failed':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  return (
    <>
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="#FFFFFF"
        menuColor="#000000"
        buttonBgColor="#CCFF00"
        buttonTextColor="#000000"
        buttonText="DASHBOARD"
        buttonHref="/dashboard"
        variant="disruptor"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8, color: '#000' }}>
          TRANSACTIONS
        </h1>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '0.875rem' }}>
          Total spent: <span style={{ fontWeight: 700, color: '#000' }}>${totalSpent.toFixed(2)}</span>
        </p>

        {/* Search & Filter Bar */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, color: '#000' }}>
                SEARCH
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 36px',
                    border: '4px solid #000',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, color: '#000' }}>
                CATEGORY
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, color: '#000' }}>
                STATUS
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '4px solid #000',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#CCFF00',
              border: '4px solid #000',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> EXPORT CSV
          </button>
        </div>

        {/* Transactions List */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No transactions found</p>
            </div>
          ) : (
            <div>
              {filtered.map((tx, idx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 100px 100px',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: idx < filtered.length - 1 ? '2px solid #f0f0f0' : 'none',
                    gap: 16,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>{tx.date}</p>
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{tx.description}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                      {tx.category}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                      ${tx.amount.toFixed(2)}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: getStatusColor(tx.status),
                        color: '#FFF',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '2px solid #000',
                      }}
                    >
                      {tx.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
