/**
 * Transaction classifier — rule-based keyword matching.
 * Maps merchant names and keywords to spending categories.
 */

const CATEGORY_KEYWORDS = {
  Food: [
    "swiggy", "zomato", "dominos", "pizza", "burger", "mcdonald", "kfc",
    "subway", "starbucks", "cafe", "coffee", "restaurant", "biryani",
    "chai", "tea", "lunch", "dinner", "breakfast", "snack", "food",
    "eat", "dine", "meal", "noodles", "pasta", "sushi", "chinese",
    "paneer", "dosa", "idli", "thali", "momos", "rolls", "sandwich",
    "maggi", "barbeque", "tandoori", "kebab", "pav bhaji"
  ],
  Transport: [
    "uber", "ola", "rapido", "auto", "cab", "taxi", "metro", "bus",
    "train", "flight", "petrol", "diesel", "fuel", "gas", "parking",
    "toll", "irctc", "railway", "airways", "transport", "ride",
    "rickshaw", "bike", "commute"
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa",
    "shopping", "clothes", "shoes", "shirt", "jeans", "dress",
    "electronics", "gadget", "phone", "laptop", "headphones",
    "watch", "bag", "accessories", "fashion", "order", "online"
  ],
  Utilities: [
    "electricity", "electric", "water", "gas", "wifi", "internet",
    "broadband", "phone bill", "mobile recharge", "recharge", "airtel",
    "jio", "vi", "vodafone", "bsnl", "bill", "rent", "maintenance",
    "society", "utility", "dth", "tata sky"
  ],
  Medical: [
    "doctor", "hospital", "medicine", "pharmacy", "medical",
    "clinic", "health", "test", "lab", "diagnostic", "prescription",
    "apollo", "medplus", "1mg", "pharmeasy", "netmeds", "dental",
    "eye", "checkup", "consultation", "insurance"
  ],
  Entertainment: [
    "netflix", "hotstar", "prime", "disney", "spotify", "youtube",
    "movie", "cinema", "theatre", "pvr", "inox", "concert", "show",
    "game", "gaming", "playstation", "xbox", "steam", "subscription",
    "ott", "music", "party", "event", "bookmyshow"
  ],
  Health: [
    "gym", "fitness", "yoga", "workout", "protein", "supplement",
    "vitamin", "whey", "cult", "curefit", "exercise", "running",
    "sports", "swim", "marathon", "healthify", "diet", "nutrition"
  ],
  Groceries: [
    "grocery", "groceries", "bigbasket", "blinkit", "zepto", "instamart",
    "dunzo", "dmart", "reliance", "supermarket", "vegetables", "fruits",
    "milk", "bread", "rice", "dal", "oil", "sugar", "atta", "flour",
    "eggs", "chicken", "mutton", "fish", "provisions", "kirana"
  ],
};

const CATEGORY_EMOJIS = {
  Food: "🍽️",
  Transport: "🚕",
  Shopping: "🛍️",
  Utilities: "💡",
  Medical: "🏥",
  Entertainment: "🎬",
  Health: "💪",
  Groceries: "🥬",
};

const CATEGORY_COLORS = {
  Food: "#E8927C",
  Transport: "#7BA7CC",
  Shopping: "#C490D1",
  Utilities: "#7CC5B8",
  Medical: "#E88B8B",
  Entertainment: "#F0B86E",
  Health: "#8BC48A",
  Groceries: "#B8C97E",
};

/**
 * Extract the numeric amount from transaction text.
 * Handles: "Swiggy 300", "300 Swiggy", "spent 300 on swiggy", "₹300"
 */
export function extractAmount(text) {
  const cleaned = text.replace(/[₹,]/g, "");
  const match = cleaned.match(/\d+(\.\d{1,2})?/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Classify transaction text into a category.
 * Returns the best matching category or "Other" if no match.
 */
export function classifyTransaction(text) {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return "Shopping"; // Sensible default
}

/**
 * Parse a raw transaction string into structured data.
 */
export function parseTransaction(text) {
  const amount = extractAmount(text);
  const category = classifyTransaction(text);

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    text: text.trim(),
    amount: amount || 0,
    category,
    date: new Date().toISOString(),
    emoji: CATEGORY_EMOJIS[category] || "📦",
  };
}

export { CATEGORY_EMOJIS, CATEGORY_COLORS, CATEGORY_KEYWORDS };
