import { StockQuote } from '../types';

const WATCHLIST = [
  'RELIANCE.NS', 'INFY.NS', 'TCS.NS', 'HDFCBANK.NS',
  'AAPL', 'MSFT', 'GOOGL',
];

let cache: { data: StockQuote[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

const MOCK_FALLBACK: StockQuote[] = [
  { ticker: 'RELIANCE.NS', name: 'Reliance Ind.', price: 2950.4, change: 15.2, changePercent: 0.51, recommendation: 'BUY', sector: 'India', currency: 'INR' },
  { ticker: 'INFY.NS', name: 'Infosys', price: 1420.1, change: -5.4, changePercent: -0.38, recommendation: 'HOLD', sector: 'India', currency: 'INR' },
  { ticker: 'TCS.NS', name: 'TCS', price: 3890.5, change: 42.1, changePercent: 1.09, recommendation: 'BUY', sector: 'India', currency: 'INR' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1640.2, change: 8.5, changePercent: 0.52, recommendation: 'BUY', sector: 'India', currency: 'INR' },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 173.5, change: 1.2, changePercent: 0.69, recommendation: 'HOLD', sector: 'Global', currency: 'USD' },
  { ticker: 'MSFT', name: 'Microsoft', price: 415.2, change: -2.1, changePercent: -0.5, recommendation: 'BUY', sector: 'Global', currency: 'USD' },
  { ticker: 'GOOGL', name: 'Alphabet', price: 140.8, change: 0.4, changePercent: 0.28, recommendation: 'BUY', sector: 'Global', currency: 'USD' },
];

function generateRecommendation(ticker: string): StockQuote['recommendation'] {
  if (ticker.includes('A') || ticker.includes('R') || ticker.includes('T')) return 'BUY';
  if (ticker.includes('I')) return 'HOLD';
  return 'N/A';
}

export async function getStocks(): Promise<{ stocks: StockQuote[]; cachedAt: string; mocked?: boolean; stale?: boolean }> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { stocks: cache.data, cachedAt: new Date(cache.fetchedAt).toISOString() };
  }

  try {
    const results = await Promise.allSettled(
      WATCHLIST.map(async (ticker) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch ${ticker}: ${res.status}`);
        const data: any = await res.json();

        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error(`No meta found for ${ticker}`);

        const price = meta.regularMarketPrice ?? 0;
        const prevClose = meta.chartPreviousClose ?? price;
        const change = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

        return {
          ticker,
          name: meta.shortName || meta.symbol || ticker,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          recommendation: generateRecommendation(ticker),
          sector: ticker.endsWith('.NS') ? 'India' : 'Global',
          currency: meta.currency || (ticker.endsWith('.NS') ? 'INR' : 'USD'),
        } satisfies StockQuote;
      })
    );

    const stocks: StockQuote[] = results
      .filter((r) => r.status === 'fulfilled')
      .map((r: any) => r.value);

    if (stocks.length === 0) {
      cache = { data: MOCK_FALLBACK, fetchedAt: Date.now() };
      return { stocks: MOCK_FALLBACK, cachedAt: new Date(cache.fetchedAt).toISOString(), mocked: true };
    }

    cache = { data: stocks, fetchedAt: Date.now() };
    return { stocks, cachedAt: new Date(cache.fetchedAt).toISOString() };
  } catch (err) {
    console.error('Stocks API error:', err);
    if (cache) {
      return { stocks: cache.data, cachedAt: new Date(cache.fetchedAt).toISOString(), stale: true };
    }
    return { stocks: MOCK_FALLBACK, mocked: true, cachedAt: new Date().toISOString() };
  }
}
