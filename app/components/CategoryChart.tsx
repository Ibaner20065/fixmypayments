'use client';

import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ClassifiedTransaction } from '../lib/classify';

interface CategoryChartProps {
  transactions: ClassifiedTransaction[];
}

const COLORS = ['#CCFF00', '#000000', '#FFFFFF', '#475569', '#CCFF00', '#000000', '#FFFFFF', '#475569'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#000000',
        color: '#FFFFFF',
        border: '4px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        padding: '8px 14px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.75rem',
      }}
    >
      <div style={{ textTransform: 'uppercase', fontWeight: 700 }}>{label || payload[0].name}</div>
      <div style={{ color: '#CCFF00', fontWeight: 700 }}>₹{payload[0].value?.toLocaleString('en-IN')}</div>
    </div>
  );
};

export default function CategoryChart({ transactions }: CategoryChartProps) {
  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '4px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '2rem', marginBottom: 8, opacity: 0.2 }}>📊</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>
          ADD TRANSACTIONS TO SEE CHARTS
        </div>
      </div>
    );
  }

  // Aggregate by category
  const byCategory: Record<string, number> = {};
  transactions.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const data = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Bar Chart */}
      <div
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
            marginBottom: 16,
          }}
        >
          SPENDING BY CATEGORY
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fontFamily: "'Space Mono', monospace", fontSize: 9, textAnchor: 'end', fill: '#000' }}
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#CCFF00" stroke="#000" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div
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
            marginBottom: 16,
          }}
        >
          DISTRIBUTION
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              stroke="#000"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(val: string) => (
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.625rem', textTransform: 'uppercase' }}>
                  {val}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
