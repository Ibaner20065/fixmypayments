// Transaction classifier — Claude API + rule-based fallback

export interface ClassifiedTransaction {
  amount: number;
  category: string;
  merchant: string;
  confidence: number;
  emoji: string;
  raw_text: string;
  date: string;
  id: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    'swiggy', 'zomato', 'dominos', 'pizza', 'burger', 'mcdonalds', 'kfc',
    'restaurant', 'cafe', 'coffee', 'tea', 'starbucks', 'chaayos', 'lunch',
    'dinner', 'breakfast', 'biryani', 'dosa', 'paneer', 'chicken', 'food',
    'eat', 'snack', 'bakery', 'cake', 'ice cream', 'subway', 'haldirams',
    'barbeque', 'sushi', 'noodles', 'momos',
  ],
  Transport: [
    'uber', 'ola', 'rapido', 'metro', 'bus', 'train', 'auto', 'rickshaw',
    'taxi', 'cab', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'flight',
    'irctc', 'makemytrip', 'goibibo', 'indigo', 'airasia',
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'tatacliq',
    'clothes', 'shoes', 'shirt', 'jeans', 'dress', 'watch', 'headphones',
    'electronics', 'phone', 'laptop', 'gadget', 'mall', 'market',
  ],
  Utilities: [
    'electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'jio',
    'airtel', 'vi', 'bsnl', 'phone bill', 'recharge', 'dth', 'rent',
    'maintenance', 'society',
  ],
  Medical: [
    'doctor', 'hospital', 'medicine', 'pharmacy', 'medplus', 'apollo',
    'dentist', 'clinic', 'health', 'lab', 'test', 'xray', 'scan',
    'insurance', 'pharmeasy', 'netmeds', '1mg',
  ],
  Entertainment: [
    'netflix', 'hotstar', 'prime', 'spotify', 'youtube', 'movie', 'cinema',
    'pvr', 'inox', 'concert', 'event', 'game', 'play', 'bookmyshow',
    'subscription', 'disney', 'jiocinema',
  ],
  Health: [
    'gym', 'fitness', 'yoga', 'protein', 'supplement', 'cult',
    'healthifyme', 'running', 'sports', 'workout', 'exercise',
  ],
  Groceries: [
    'grocery', 'bigbasket', 'blinkit', 'zepto', 'instamart', 'dmart',
    'vegetables', 'fruits', 'milk', 'bread', 'rice', 'dal', 'oil',
    'sugar', 'flour', 'atta', 'eggs', 'butter', 'cheese',
  ],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Utilities: '⚡',
  Medical: '🏥',
  Entertainment: '🎬',
  Health: '💪',
  Groceries: '🛒',
};

function extractAmount(text: string): number {
  const patterns = [
    /₹\s*([\d,]+(?:\.\d{1,2})?)/,
    /rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /inr\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:₹|rs|rupees?)/i,
    /([\d,]+(?:\.\d{1,2})?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 10_000_000) return amount;
    }
  }
  return 0;
}

function classifyByKeywords(text: string): { category: string; merchant: string; confidence: number } {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Capitalize first letter of matched keyword as merchant guess
        const merchant = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        return { category, merchant, confidence: 0.8 };
      }
    }
  }

  // Fallback
  const words = text.replace(/[\d₹,\.]/g, '').trim().split(/\s+/);
  const merchant = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Unknown';
  return { category: 'Shopping', merchant, confidence: 0.3 };
}

export function parseTransaction(text: string): ClassifiedTransaction {
  const amount = extractAmount(text);
  const { category, merchant, confidence } = classifyByKeywords(text);

  return {
    amount,
    category,
    merchant,
    confidence,
    emoji: CATEGORY_EMOJIS[category] || '📦',
    raw_text: text,
    date: new Date().toISOString(),
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  };
}

export async function classifyWithLLM(text: string): Promise<ClassifiedTransaction> {
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error('API failed');

    const data = await res.json();
    return {
      ...data,
      emoji: CATEGORY_EMOJIS[data.category] || '📦',
      raw_text: text,
      date: new Date().toISOString(),
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    };
  } catch {
    // Fallback to rule-based
    return parseTransaction(text);
  }
}
