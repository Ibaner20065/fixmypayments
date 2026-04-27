'use client';

import React from 'react';
import CardNav from '../components/CardNav';
import type { CardNavItem } from '../components/CardNav';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

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

export default function AnalyticsPage() {
  const spendingByCategory = [
    { name: 'Platform Fees', amount: 12.5, percentage: 25 },
    { name: 'Deposits', amount: 25.0, percentage: 50 },
    { name: 'Transactions', amount: 7.5, percentage: 15 },
    { name: 'Other', amount: 5.0, percentage: 10 },
  ];

  const monthlyTrend = [
    { month: 'Dec', amount: 28.5 },
    { month: 'Jan', amount: 35.2 },
    { month: 'Feb', amount: 42.8 },
    { month: 'Mar', amount: 50.0 },
  ];

  const totalSpent = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
  const avgMonthly = monthlyTrend.reduce((sum, m) => sum + m.amount, 0) / monthlyTrend.length;

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
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32, color: '#000' }}>
          ANALYTICS
        </h1>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 24 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
              TOTAL SPENT (ALL TIME)
            </p>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#000' }}>
              ${totalSpent.toFixed(2)}
            </p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} style={{ color: '#00AA00' }} />
              <span style={{ fontSize: '0.75rem', color: '#00AA00', fontWeight: 600 }}>Stable</span>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 24 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
              AVERAGE MONTHLY
            </p>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#000' }}>
              ${avgMonthly.toFixed(2)}
            </p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} style={{ color: '#FFC107' }} />
              <span style={{ fontSize: '0.75rem', color: '#FFC107', fontWeight: 600 }}>+15% from Dec</span>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 24 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
              BUDGET UTILIZATION
            </p>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#000' }}>
              68%
            </p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={14} style={{ color: '#CCFF00' }} />
              <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>32% remaining</span>
            </div>
          </div>
        </div>

        {/* Spending by Category */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <PieChart size={20} /> SPENDING BY CATEGORY
          </h2>

          {spendingByCategory.map((category) => (
            <div key={category.name} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{category.name}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>${category.amount.toFixed(2)}</span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  background: '#f0f0f0',
                  border: '2px solid #000',
                  height: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#CCFF00',
                    border: '2px solid #000',
                    height: '100%',
                    width: `${category.percentage}%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#000',
                  }}
                >
                  {category.percentage > 10 && `${category.percentage}%`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trend */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000', padding: 32 }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart3 size={20} /> MONTHLY TREND
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {monthlyTrend.map((month) => (
              <div key={month.month} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    background: '#CCFF00',
                    border: '4px solid #000',
                    height: `${(month.amount / 60) * 150}px`,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '8px 0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#000',
                  }}
                >
                  <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    ${month.amount}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{month.month}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
