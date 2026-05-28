# AI Identity Orchestrator + FixMyPayments MVP

A privacy-first AI-powered identity and finance platform combining:
- **Identity Layer**: W3C DIDs, verifiable credentials, zero-knowledge proofs
- **Finance Tracking**: AI-powered transaction classification (Claude + rule-based fallback)
- **Web3 Integration**: zkSync gasless ZAAP bundler, PureFi AML verification
- **Design**: Dual neo-brutalist systems (Disruptor for app, Yellow-SaaS for landing)

## 🚀 Quick Start

### 1. Environment Setup

Copy the template:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual secrets:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
FIREBASE_PROJECT_ID=fixmypayments
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI
ANTHROPIC_API_KEY=sk_...

# Email
RESEND_API_KEY=re_...
GMAIL_USER=your@email.com
GMAIL_APP_PASSWORD=your_app_password

# Web3 (optional)
NEXT_PUBLIC_ZKSYNC_RPC_URL=https://sepolia.era.zksync.dev
```

⚠️ **SECURITY**: See [SECURITY.md](./SECURITY.md) — Never commit `.env.local`. Use `.env.example` for templates.

### 2. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Tech Stack

### Frontend
- **Next.js 16.2.4** (App Router) + React 19 + TypeScript
- **Animations**: GSAP 3.15 + Framer Motion
- **Charts**: Recharts
- **UI**: Lucide React icons + CSS-in-JS + design tokens

### Backend
- **Database**: SQLite (better-sqlite3)
- **API Routes**: Next.js API handlers (POST/GET)
- **LLM**: Claude API (Anthropic) with rule-based fallback
- **Web3**: ethers.js, zkSync Era RPC

### Design Systems
- **Disruptor** (App): Volt green (#CCFF00), Space Mono, 4px+ borders, neo-shadows
- **Yellow-SaaS** (Landing): Yellow (#ffe17c), Cabinet Grotesk, 2px borders

## 📊 Current Architecture

### Data Model
```
transactions
├─ id, raw_text, amount, category, merchant, date, confidence

wallet_connections
├─ address, aml_verified, aml_rule_id, aml_expiry

zaap_bundles
├─ wallet_address, bundle_type, status, tx_hash

(COMING) user_dids
├─ user_id, did, created_at

(COMING) user_credentials
├─ user_id, credential_type, claims, issued_at, expiry

(COMING) credential_revocation
├─ credential_id, revoked_at
```

### API Endpoints

#### POST /api/classify
Classify a transaction using LLM or rules.
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text":"Swiggy 300"}'
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

#### POST /api/transactions
Create a classified transaction.
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"raw_text":"Swiggy 300"}'
```

#### GET /api/transactions
Fetch all transactions + statistics.
```bash
curl http://localhost:3000/api/transactions
```

Response:
```json
{
  "transactions": [...],
  "total": 5000,
  "by_category": {"Food": 1500, "Transport": 1000}
}
```

## 🔐 Identity Roadmap

### Phase 1: User Authentication (Next)
- [ ] Firebase Auth integration
- [ ] User signup/login UI
- [ ] Session management

### Phase 2: Identity Layer
- [ ] W3C DID issuance & resolution
- [ ] Verifiable credentials schema
- [ ] Credential validation engine
- [ ] KYC optimizer (detect reusable creds)
- [ ] Zero-knowledge proofs (age, residency)

### Phase 3: Fraud Detection
- [ ] Risk scoring engine
- [ ] Duplicate credential detection
- [ ] Revocation registry

### Phase 4: Multi-System Integration
- [ ] Banking portal adapter
- [ ] Healthcare provider integration
- [ ] Government ID verification (optional)

See [plan.md](./plan.md) and [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md) for detailed roadmap.

## 🧪 Testing Scenarios

### Scenario 1: Transaction Classification
1. Go to `/dashboard`
2. Type "Zomato 450" in the input
3. **Expected**: Food category, instant chart update

### Scenario 2: LLM Fallback
1. Unset `ANTHROPIC_API_KEY`
2. Type "Coffee 150"
3. **Expected**: Rule-based classifier still works → Food category

### Scenario 3: CardNav Animation
1. Click the menu icon
2. **Expected**: Smooth 0.5s height animation + staggered card reveal

## 📁 Project Structure

```
app/
├─ api/
│  ├─ classify/route.ts           # LLM classification endpoint
│  └─ transactions/route.ts       # CRUD + stats
├─ components/
│  ├─ CardNav.tsx                 # GSAP navigation
│  ├─ TransactionInput.tsx        # Input component
│  ├─ CategoryChart.tsx           # Recharts visualization
│  └─ TransactionList.tsx         # Transaction table
├─ lib/
│  ├─ db.ts                       # SQLite schema + connection
│  ├─ classify.ts                 # LLM + rule-based classifier
│  ├─ purefi.ts                   # AML verification (scaffolded)
│  └─ zaap.ts                     # ZAAP bundler logic (stub)
├─ dashboard/
│  ├─ layout.tsx                  # Dashboard layout
│  └─ page.tsx                    # Main dashboard
├─ zaap/
│  └─ page.tsx                    # ZAAP bundler UI (stub)
├─ globals.css                    # Design tokens + utilities
├─ layout.tsx                     # Root layout
└─ page.tsx                       # Landing page

contracts/                        # Hardhat (zkSync) — Paymaster, ZAAP
data/                            # SQLite database (auto-created)
public/                          # Static assets
.env.example                     # Secrets template (safe to commit)
```

## 🚫 Constraints (MANDATORY)

### FORBIDDEN
- ❌ Gradients, blur, or soft shadows
- ❌ Rounded corners > 8px (Disruptor) or > 12px (Yellow-SaaS)
- ❌ Pastel colors or glassmorphism
- ❌ Material UI, Ant Design, or heavy libraries
- ❌ Committing `.env` or secrets

### REQUIRED
- ✅ TypeScript throughout
- ✅ `useLayoutEffect` for GSAP (not `useEffect`)
- ✅ `gsap.context()` with cleanup
- ✅ Environment variables for all API keys
- ✅ Rule-based fallback if LLM API fails
- ✅ Real-time dashboard update (<500ms)
- ✅ Neo-shadows (solid, no blur/spread/transparency)

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)** — Secrets management, credential rotation, incident response
- **[INIT.md](./INIT.md)** — Project initialization notes
- **[plan.md](./plan.md)** — Implementation roadmap
- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** — Architecture deep-dive (in session folder)

## 🛠️ Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## 📖 Learn More

- **[Next.js Docs](https://nextjs.org/docs)** — Framework reference
- **[GSAP Docs](https://gsap.com/docs/)** — Animation library
- **[Recharts](https://recharts.org/)** — Chart library
- **[zkSync Era](https://docs.zksync.io/)** — Layer 2 blockchain
- **[Claude API](https://docs.anthropic.com/)** — LLM API
- **[W3C DID Spec](https://www.w3.org/TR/did-core/)** — Decentralized identifiers
- **[Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)** — Data interchange

## 🔄 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Transaction Classification | ✅ Ready | LLM + rule-based fallback working |
| Dashboard | ✅ Ready | Real-time stats, charts, transaction list |
| CardNav Animation | ✅ Ready | GSAP smooth expand/collapse |
| Web3 Wallet Integration | 🔨 Scaffolded | PureFi AML ready for integration |
| ZAAP Bundler | 🔨 Stub | UI exists, logic needs implementation |
| User Authentication | ❌ TODO | Firebase installed, not integrated |
| Identity Layer | ❌ TODO | DID/credential architecture ready to build |
| KYC Optimization | ❌ TODO | Requires identity layer first |
| Fraud Detection | ❌ TODO | Requires credential system |

## 🤝 Contributing

See [AGENTS.md](./AGENTS.md) for agent configuration and development guidelines.

## 📄 License

Built with ❤️ | MIT License

---

**Version**: 0.1.0 (Identity Orchestrator Implementation)  
**Last Updated**: 2026-04-28  
**Maintenance**: Active development
