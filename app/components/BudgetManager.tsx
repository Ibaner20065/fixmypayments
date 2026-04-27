'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface BudgetConfig {
  total: number;
  Food: number;
  Transport: number;
  Shopping: number;
  Utilities: number;
  Medical: number;
  Entertainment: number;
  Health: number;
  Groceries: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍', Utilities: '💡',
  Medical: '🏥', Entertainment: '🎬', Health: '💪', Groceries: '🛒',
};

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Medical', 'Entertainment', 'Health', 'Groceries'];

interface Props {
  accessToken: string | null;
  spentByCategory?: Record<string, number>;
}

export default function BudgetManager({ accessToken, spentByCategory = {} }: Props) {
  const [budget, setBudget] = useState<BudgetConfig | null>(null);
  const [editing, setEditing] = useState<Partial<BudgetConfig>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadBudget = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/budget', { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (res.ok) setBudget(data.budget);
    } catch {/* silent */}
  }, [accessToken]);

  useEffect(() => { void loadBudget(); }, [loadBudget]);

  const handleSave = async () => {
    if (!accessToken || Object.keys(editing).length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (res.ok) {
        setBudget(data.budget);
        setEditing({});
        showToast('✅ BUDGET SAVED');
      } else {
        showToast(`⚠ ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!budget) {
    return (
      <div style={{ background: '#FFFFFF', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: '#666' }}>
          {accessToken ? 'LOADING BUDGETS...' : 'LOGIN TO MANAGE BUDGETS'}
        </div>
      </div>
    );
  }

  const merged = { ...budget, ...editing };

  return (
    <div style={{ background: '#FFFFFF', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: 24, position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#000', color: '#CCFF00', padding: '6px 14px', fontFamily: "'Space Mono', monospace", fontSize: '0.625rem', fontWeight: 700, border: '2px solid #CCFF00' }}>
          {toast}
        </div>
      )}

      {/* Total budget */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '3px solid #000' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>
            💰 MONTHLY TOTAL BUDGET
          </span>
          <input
            type="number" value={editing.total ?? budget.total} min={0} step={1000}
            onChange={(e) => setEditing((p) => ({ ...p, total: Number(e.target.value) }))}
            style={{ width: 110, padding: '6px 10px', border: '2px solid #000', fontFamily: "'Space Mono', monospace", fontSize: '0.875rem', fontWeight: 700, textAlign: 'right', outline: 'none' }}
          />
        </div>
        {/* Progress bar for total */}
        {(() => {
          const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);
          const pct = Math.min((totalSpent / merged.total) * 100, 100);
          return (
            <div>
              <div style={{ height: 10, background: '#f0f0f0', border: '2px solid #000', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ff0000' : pct >= 80 ? '#ff9900' : '#CCFF00', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: "'Space Mono', monospace", fontSize: '0.5625rem', color: '#666' }}>
                <span>₹{totalSpent.toLocaleString('en-IN')} SPENT</span>
                <span>{Math.round(pct)}%</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Per-category rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CATEGORIES.map((cat) => {
          const limit = (merged as any)[cat] ?? 5000;
          const spent = spentByCategory[cat] ?? 0;
          const pct = Math.min((spent / limit) * 100, 100);
          return (
            <div key={cat} style={{ padding: '10px 12px', border: '2px solid #000', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {CATEGORY_EMOJI[cat]} {cat}
                </span>
                <input
                  type="number" value={(editing as any)[cat] ?? (budget as any)[cat]} min={0} step={500}
                  onChange={(e) => setEditing((p) => ({ ...p, [cat]: Number(e.target.value) }))}
                  style={{ width: 80, padding: '3px 6px', border: '2px solid #000', fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textAlign: 'right', outline: 'none' }}
                />
              </div>
              <div style={{ height: 6, background: '#f0f0f0', border: '1px solid #ccc', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ff0000' : pct >= 80 ? '#ff9900' : '#CCFF00', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', color: '#888', marginTop: 3 }}>
                ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave} disabled={saving || Object.keys(editing).length === 0}
        style={{ marginTop: 16, width: '100%', padding: '12px 0', background: saving || Object.keys(editing).length === 0 ? '#ccc' : '#CCFF00', border: '3px solid #000', boxShadow: '4px 4px 0px #000', fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', cursor: saving || Object.keys(editing).length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
      >
        {saving ? 'SAVING...' : Object.keys(editing).length > 0 ? '💾 SAVE CHANGES' : 'NO CHANGES'}
      </button>
    </div>
  );
}
