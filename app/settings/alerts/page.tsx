'use client';

import React, { useState } from 'react';
import CardNav from '../../components/CardNav';
import type { CardNavItem } from '../../components/CardNav';
import { Trash2, Plus } from 'lucide-react';

const navItems: CardNavItem[] = [
  {
    label: 'SETTINGS',
    bgColor: '#1a1a2e',
    textColor: '#CCFF00',
    links: [
      { label: 'API KEYS', href: '/settings/api-keys', ariaLabel: 'Manage API Keys' },
      { label: 'WALLET', href: '/settings/wallet', ariaLabel: 'Wallet Settings' },
      { label: 'ALERTS', href: '/settings/alerts', ariaLabel: 'Budget Alerts' },
    ],
  },
];

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  alertEmail: string;
  alertAt: number;
}

export default function AlertsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: '1', category: 'Food', limit: 5000, spent: 2300, alertEmail: 'user@example.com', alertAt: 80 },
    { id: '2', category: 'Transport', limit: 3000, spent: 1200, alertEmail: 'user@example.com', alertAt: 75 },
  ]);

  const [newBudget, setNewBudget] = useState({ category: 'Shopping', limit: 10000, alertAt: 80 });

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const addBudget = () => {
    if (newBudget.category && newBudget.limit > 0) {
      setBudgets([
        ...budgets,
        {
          id: Date.now().toString(),
          ...newBudget,
          spent: 0,
          alertEmail: 'user@example.com',
        },
      ]);
      setNewBudget({ category: 'Shopping', limit: 10000, alertAt: 80 });
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, color: '#000' }}>
          BUDGET ALERTS
        </h1>

        {/* Current Budgets */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: '#000' }}>
            Active Budgets
          </h2>
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isWarning = percentage >= budget.alertAt;
            return (
              <div
                key={budget.id}
                style={{
                  background: '#FFFFFF',
                  border: `4px solid ${isWarning ? '#FF6B6B' : '#000'}`,
                  padding: 24,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{budget.category}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                      ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    style={{
                      padding: '8px 12px',
                      background: '#FF6B6B',
                      color: '#FFFFFF',
                      border: '4px solid #000',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div style={{ background: '#f5f5f5', border: '2px solid #000', overflow: 'hidden', height: 24, marginBottom: 12 }}>
                  <div
                    style={{
                      background: isWarning ? '#FF6B6B' : '#CCFF00',
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
                  <span>{percentage.toFixed(0)}% Used</span>
                  <span>Alert at {budget.alertAt}%</span>
                </div>

                {isWarning && (
                  <div style={{ background: '#FFE8E8', border: '2px solid #FF6B6B', padding: 12, marginTop: 12 }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#CC0000', fontWeight: 600 }}>
                      ⚠️ BUDGET WARNING: You've exceeded {budget.alertAt}% of your {budget.category} budget
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                      Email alert sent to {budget.alertEmail}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Budget */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: '#000' }}>
            Add New Budget
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: '#000' }}>
              Category
            </label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '4px solid #000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Medical</option>
              <option>Health</option>
              <option>Groceries</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: '#000' }}>
              Monthly Budget Limit (₹)
            </label>
            <input
              type="number"
              value={newBudget.limit}
              onChange={(e) => setNewBudget({ ...newBudget, limit: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '4px solid #000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: '#000' }}>
              Alert at (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newBudget.alertAt}
              onChange={(e) => setNewBudget({ ...newBudget, alertAt: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '4px solid #000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={addBudget}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: '#CCFF00',
              border: '4px solid #000',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Plus size={16} /> ADD BUDGET
          </button>
        </div>
      </div>
    </>
  );
}
