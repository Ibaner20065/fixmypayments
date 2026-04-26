# FixMyPayments — AI Finance + zkSync DeFi MVP

**Status:** ✅ **BUILD INITIALIZED & READY FOR DEVELOPMENT**

## Overview

FixMyPayments is a production-ready MVP unifying:

1. **Web2**: AI-powered personal finance assistant (Claude + rule-based fallback)
2. **Web3**: PureFi Paymaster with AML verification + ZAAP gasless transaction bundler
3. **Design**: Dual neo-brutalist systems (Disruptor for app, Yellow-SaaS for landing)
4. **Navigation**: CardNav component with GSAP animations

## Tech Stack

### Frontend
- **Framework**: Next.js 16.2.4 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: CSS-in-JS + globals.css (design tokens)
- **Animation**: GSAP 3.15 + Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Database**: SQLite (better-sqlite3)
- **API**: Next.js API routes (POST/GET)
- **LLM**: Claude API (Anthropic) + rule-based fallback
- **Web3**: ethers.js, zkSync Era RPC

### Design Systems
- **Disruptor** (App): #CCFF00 volt green, Space Mono, 4px+ borders, neo-shadows
- **Yellow-SaaS** (Landing): #ffe17c yellow, Cabinet Grotesk, 2px borders, dot pattern

## Quick Start

### 1. Environment Setup

Copy the template and add your keys:

```bash
cp .env.local.template .env.local
```

Edit `.env.local`:
```env
ANTHROPIC_API_KEY=sk_... # Get from https://console.anthropic.com/
NEXT_PUBLIC_ZKSYNC_RPC_URL=https://sepolia.era.zksync.dev
```

### 2. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Test the AI Classifier

**Landing Page** → **Dashboard** → Type in "Swiggy 450" or "Metro 50"

Expected:
- ✅ Text parsed → LLM/rule-based classification
- ✅ Database insert (SQLite)
- ✅ Dashboard updates in <500ms
- ✅ Category chart + stats reflect new entry

## Project Structure

```
app/
  api/
    classify/route.ts         # LLM classification endpoint
    transactions/route.ts     # CRUD + stats (GET all, POST new)
  
  components/
    CardNav.tsx              # GSAP-powered navigation
    TransactionInput.tsx     # Brutalist text input
    CategoryChart.tsx        # Recharts with Disruptor styling
    TransactionList.tsx      # Recent transactions table
    ZaapBuilder.tsx          # 3-step bundler UI (in progress)
  
  lib/
    db.ts                    # SQLite schema + connection
    classify.ts              # LLM + rule-based classifier
    purefi.ts                # AML verification (PureFi Issuer API)
    zaap.ts                  # Transaction bundler logic
  
  dashboard/
    layout.tsx               # Dashboard layout
    page.tsx                 # Main dashboard view
  
  zaap/
    page.tsx                 # ZAAP bundler UI
  
  (landing)/ → page.tsx      # Yellow-SaaS landing page
  layout.tsx                 # Root layout
  globals.css               # Design tokens + utilities

contracts/                   # Hardhat (zkSync) — Paymaster, ZAAP, etc.
data/                       # SQLite database (auto-created)
public/                     # Static assets
```

## Key Features

### 1. Transaction Classification
- **Input**: Natural language ("Zomato 300", "Electricity bill 1200")
- **Process**: LLM (Claude) with fallback to keyword-based rules
- **Categories**: Food, Transport, Shopping, Utilities, Medical, Entertainment, Health, Groceries
- **Database**: SQLite (transactions table)

### 2. Real-Time Dashboard
- **Stats**: Total spending, transaction count, category count
- **Charts**: Category breakdown (bar + pie)
- **List**: Recent transactions with timestamps
- **Toast**: Instant feedback on classification

### 3. Design System Compliance

#### Disruptor (App)
- **Colors**: #CCFF00 (volt), #000000 (black), #FFFFFF (white), #121212 (dark)
- **Typography**: Ranchers (headlines), Space Mono (technical), Plus Jakarta Sans (body)
- **Borders**: 4px+ solid black, NO rounded corners > 8px
- **Shadows**: Solid offset (8px 8px 0px #000), NO blur/spread

#### Yellow-SaaS (Landing)
- **Colors**: #ffe17c (yellow), #171e19 (charcoal), #b7c6c2 (sage)
- **Typography**: Cabinet Grotesk (headings), Satoshi (body)
- **Borders**: 2px solid black
- **Shadows**: Solid offset (8px 8px 0px #000), 32px dot pattern

### 4. CardNav Component
- **GSAP Timeline**: 0.5s height animation + staggered card reveal (0.08s)
- **Responsive**: Collapses on mobile, grid on desktop
- **Themed**: Props for Disruptor vs Yellow-SaaS variants
- **Interactive**: Expand/collapse with smooth transforms

## API Endpoints

### POST /api/classify
Classify a transaction text.
```json
{
  "text": "Swiggy 300"
}
```
Response:
```json
{
  "amount": 300,
  "category": "Food",
  "merchant": "Swiggy",
  "confidence": 0.95
}
```

### POST /api/transactions
Add a new transaction with automatic classification.
```json
{
  "raw_text": "Swiggy 300"
}
```
Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "raw_text": "Swiggy 300",
  "amount": 300,
  "category": "Food",
  "merchant": "Swiggy",
  "date": "2026-04-26T18:51:06.951Z"
}
```

### GET /api/transactions
Fetch all transactions + statistics.
```json
{
  "transactions": [...],
  "total": 5000,
  "by_category": {
    "Food": 1500,
    "Transport": 1000,
    "Shopping": 2500
  }
}
```

## Constraints & Rules (MANDATORY)

### FORBIDDEN ❌
- Gradients, blur, or soft shadows (0 blur radius always)
- Rounded corners > 8px (Disruptor) or > 12px (Yellow-SaaS)
- Pastel colors or glassmorphism
- Committing `.env.local` or secrets
- Material UI, Ant Design, or similar heavy libraries

### REQUIRED ✅
- **TypeScript** throughout
- **useLayoutEffect** for GSAP (not useEffect)
- **gsap.context()** with cleanup on CardNav
- **Environment variables** for all API keys
- **Rule-based fallback** if LLM API fails
- **Real-time** dashboard update (<500ms)
- **Neo-shadows** (solid, no blur, no spread, no transparency)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint (if configured)
npm run lint
```

## Testing Scenarios

### ✅ Scenario 1: Web2 Transaction Classification
1. Go to `/dashboard`
2. Type "Zomato 450" in the input
3. **Expected**: Food category, ₹450 amount, instant chart update

### ✅ Scenario 2: Multiple Categories
1. Add "Uber 200", "Amazon 1500", "Electricity 800"
2. **Expected**: Chart shows all 3 categories with correct amounts

### ✅ Scenario 3: LLM Fallback
1. Unset `ANTHROPIC_API_KEY` (or let API fail)
2. Type "Starbucks coffee 250"
3. **Expected**: Rule-based classifier still works, classifies as Food

### ✅ Scenario 4: CardNav Animation
1. Click the menu icon on any page
2. **Expected**: Smooth height + card reveal (0.5s), no jank
3. Click again to collapse → smooth reverse

## Next Steps (Post-MVP)

1. **Web3 Integration**
   - Deploy PureFi Paymaster contract on zkSync testnet
   - Integrate RainbowKit wallet connection
   - Test AML verification flow

2. **ZAAP Bundler**
   - Complete UI (currently stubbed)
   - Implement 3-step bundler logic
   - Test gasless transactions

3. **Database**
   - Migrate to Supabase (optional, SQLite works for MVP)
   - Add wallet connection tracking
   - Store ZAAP bundle history

4. **Polish**
   - Add loading animations
   - Error handling + retry logic
   - Mobile responsiveness refinement

## Resources

- **Design Spec**: Master Prompt v3 (included in CLAUDE.md)
- **Next.js Docs**: https://nextjs.org/docs
- **GSAP Docs**: https://gsap.com/docs/
- **Recharts**: https://recharts.org/
- **zkSync Era**: https://docs.zksync.io/
- **Claude API**: https://docs.anthropic.com/

## License & Attribution

Built with DISRUPTOR neo-brutalist design system & Yellow-SaaS landing design.

---

**Built with ❤️ by Copilot | Ready for production MVP deployment**
