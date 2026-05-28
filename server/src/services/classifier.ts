import { env } from '../config/env';
import { ClassifiedTransaction } from '../types';

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
        const merchant = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        return { category, merchant, confidence: 0.8 };
      }
    }
  }

  const words = text.replace(/[\d₹,.\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const merchant = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Unknown';
  return { category: 'Shopping', merchant, confidence: 0.3 };
}

export function parseTransaction(text: string): ClassifiedTransaction {
  const amount = extractAmount(text);
  const { category, merchant, confidence } = classifyByKeywords(text);

  return { amount, category, merchant, confidence };
}

export async function classifyWithLLM(text: string): Promise<ClassifiedTransaction | null> {
  if (!env.ANTHROPIC_API_KEY) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: `You are a financial transaction classifier. Given raw transaction text, extract the merchant name, amount (as a number), and classify into exactly one of: Food, Transport, Shopping, Utilities, Medical, Entertainment, Health, Groceries. Respond ONLY with valid JSON, no markdown, no preamble: { "amount": number, "category": string, "merchant": string, "confidence": number }`,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const content = data.content?.[0]?.text;
    if (!content) return null;

    return JSON.parse(content) as ClassifiedTransaction;
  } catch {
    return null;
  }
}
