import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export interface SpendingAlert {
  type: 'category_exceeded' | 'total_exceeded' | 'spike_detected';
  category?: string;
  currentAmount: number;
  budgetLimit: number;
  percentUsed: number;
  message: string;
}

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'N/A';
  sector: string;
  currency: string;
}

export interface ClassifiedTransaction {
  amount: number;
  category: string;
  merchant: string;
  confidence: number;
}
