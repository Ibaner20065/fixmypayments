'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'N/A';
  sector: string;
  currency: string;
}

const REC_COLORS: Record<string, { bg: string; text: string }> = {
  BUY:  { bg: '#CCFF00', text: '#000' },
  HOLD: { bg: '#FFD700', text: '#000' },
  SELL: { bg: '#ff4444', text: '#fff' },
  'N/A': { bg: '#e0e0e0', text: '#666' },
};

export default function StockWidget() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch('/api/stocks');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not load stocks'); return; }
      setStocks(data.stocks || []);
      setCachedAt(data.cachedAt || null);
      setError('');
    } catch {
      setError('Network error loading stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStocks();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => void fetchStocks(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>FETCHING LIVE QUOTES...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fff1f2', border: '4px solid #ff0000', boxShadow: '8px 8px 0px #000', padding: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: '#cc0000', fontWeight: 700 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '4px solid #000', boxShadow: '8px 8px 0px #000', padding: 24 }}>
      {cachedAt && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', color: '#999', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          UPDATED {new Date(cachedAt).toLocaleTimeString()} · AUTO-REFRESH 5MIN
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {stocks.map((stock) => {
          const isUp = stock.changePercent >= 0;
          const rec = REC_COLORS[stock.recommendation] || REC_COLORS['N/A'];
          return (
            <div
              key={stock.ticker}
              style={{ border: '3px solid #000', padding: 16, background: '#fafafa', transition: 'box-shadow 0.15s', cursor: 'default' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '4px 4px 0px #CCFF00')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {stock.ticker}
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: '#555', marginTop: 2, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {stock.name}
                  </div>
                </div>
                <span style={{ background: rec.bg, color: rec.text, padding: '3px 8px', fontFamily: "'Space Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, border: '2px solid #000', flexShrink: 0 }}>
                  {stock.recommendation}
                </span>
              </div>

              {/* Price */}
              <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '1.5rem', lineHeight: 1.1, marginBottom: 4 }}>
                {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>

              {/* Change */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, color: isUp ? '#16a34a' : '#dc2626' }}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.5625rem', color: '#999' }}>
                  {isUp ? '+' : ''}{stock.currency === 'INR' ? '₹' : '$'}{stock.change.toFixed(2)} today
                </span>
              </div>

              {/* Sector badge */}
              <div style={{ marginTop: 8, display: 'inline-block', background: '#000', color: '#CCFF00', padding: '2px 8px', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stock.sector}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
