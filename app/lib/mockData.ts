export const MOCK_TRANSACTIONS = [
  {
    id: 'mock-1',
    merchant: 'Starbucks',
    amount: 450,
    category: 'Food',
    date: new Date(Date.now() - 3600000).toISOString(),
    status: 'Confirmed',
    emoji: '☕'
  },
  {
    id: 'mock-2',
    merchant: 'Uniswap (zkSync)',
    amount: 12500,
    category: 'Web3',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'Confirmed',
    emoji: '🦄'
  },
  {
    id: 'mock-3',
    merchant: 'Zomato',
    amount: 890,
    category: 'Food',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'Confirmed',
    emoji: '🛵'
  },
  {
    id: 'mock-4',
    merchant: 'Apple Store',
    amount: 89000,
    category: 'Shopping',
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'Confirmed',
    emoji: '🍎'
  },
  {
    id: 'mock-5',
    merchant: 'Lenskart',
    amount: 2500,
    category: 'Medical',
    date: new Date(Date.now() - 432000000).toISOString(),
    status: 'Confirmed',
    emoji: '👓'
  }
];

export const MOCK_BUDGET = {
  total: 150000,
  Food: 15000,
  Transport: 8000,
  Shopping: 50000,
  Medical: 10000,
  Web3: 20000,
  Utilities: 12000,
  Entertainment: 10000,
  Health: 5000,
  Groceries: 15000
};
