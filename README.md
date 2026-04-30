# FixMyPayments

> **"Financial sovereignty shouldn't be a luxury. It should be a standard."**

FixMyPayments is a next-generation **Financial Operating System** built on the Disruptor Design System. It bridges the gap between traditional Web2 banking and the future of Web3 DeFi — featuring privacy-first identity orchestration, AI-powered expense classification, real-time algorithmic budgeting, and gasless DeFi transaction bundling.

---

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Architecture](#️-architecture)
  - [Directory Structure](#directory-structure)
  - [Full System Flow](#full-system-flow)
  - [Request Lifecycle](#request-lifecycle)
- [Getting Started](#-getting-started)
  - [Prerequisites](#1-prerequisites)
  - [Installation](#2-installation)
  - [Environment Setup](#3-environment-setup)
  - [Database Setup](#4-database-setup)
  - [Start Development Server](#5-start-development-server)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Testing](#-testing)
- [Deployment](#-deployment-vercel)
- [Troubleshooting](#️-troubleshooting)
- [Design Philosophy](#-design-philosophy-the-disruptor)
- [License](#-license)

---

## 🌪️ Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | [Next.js 16.2](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Neo-Brutalist "Disruptor" Design System |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) |
| **Database & Auth** | [Firebase](https://firebase.google.com/) (Firestore + Authentication) |
| **AI Engine** | [Anthropic Claude 3.5 Sonnet](https://www.anthropic.com/claude) — Expense Classification |
| **Email Notifications** | [Resend](https://resend.com/) |
| **Web3 / DeFi** | [zkSync-ethers v6](https://zksync.io/) + ZAAP Account Abstraction |
| **Charts** | [Recharts](https://recharts.org/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## ⚡ Key Features

### 🛡️ Identity Orchestrator (ZKP)
Our flagship feature. LLM-driven Identity Orchestration simulates Zero-Knowledge Proofs for privacy-first KYC.
- **Privacy-First**: Verifies identity without exposing PII (Personally Identifiable Information).
- **Risk Analysis**: Real-time risk assessment for every verification request.
- **Privacy Impact Summary**: Transparent documentation of how user data is handled.

### 💰 Algorithmic Budgeting
Stop guessing where your money goes.
- **NLP Transactions**: Just type `"Starbucks 500"` or `"Swiggy 300"` — the AI handles classification, merchant extraction, and categorisation.
- **Smart Alerts**: 80% warning and 100% hard-block limits sent via Resend email.
- **Force Protocol**: Exceeded your budget? Use the **Force Proceed** override for genuine emergency transactions.

### ⛓️ Web3 ZAAP Bundler
Integrated DeFi capabilities for the modern investor.
- **Paymaster Config**: Gasless transactions via specialised paymasters.
- **ZAAP Bundling**: Group multiple transactions into a single batch to reduce gas.
- **AML Status**: Institutional-grade AML checks on all crypto interactions via PureFi.

### 🌓 Theme Orchestration
Neo-Brutalist Dark/Light Toggle that persists across sessions.
- **Industrial Contrast**: High-contrast light mode that maintains the Disruptor aesthetic.
- **Persistence**: Remembers preference via `localStorage` with system-level sync.

---

## 🏗️ Architecture

### Directory Structure

```text
fixmypayments/
├── app/
│   ├── api/             # Next.js API Routes
│   │   ├── classify/    # Claude 3.5 AI expense classification endpoint
│   │   ├── transactions/# Transaction processing & budget guardrails
│   │   └── email/       # Resend notification triggers
│   ├── auth/            # Firebase Authentication UI (Login / Signup)
│   ├── components/      # Shared Neo-Brutalist UI components
│   ├── dashboard/       # Financial Dashboard & Recharts analytics
│   ├── kyc/             # Identity Orchestration & ZKP simulation flow
│   ├── pay/             # Payment interface with budget guardrails
│   ├── profile/         # User settings & profile management
│   └── zaap/            # Web3/DeFi transaction bundler
├── contracts/           # zkSync smart contracts (ZAAP, Paymaster)
├── data/                # Static data & configuration files
├── lib/
│   ├── firebase.js      # Firebase Admin SDK initialisation
│   ├── ai.js            # Anthropic Claude classification logic
│   └── web3.js          # zkSync-ethers utilities
├── public/              # Static assets (images, icons, fonts)
├── setup-db.mjs         # Firestore initialisation script (budgets, schemas)
├── DEPLOYMENT.md        # Detailed Vercel deployment walkthrough
└── .env.local.template  # Environment variable template
```

### Full System Flow

```mermaid
graph TD
    User([User]) --> Auth{Authenticated?}
    Auth -- No --> Login[Auth Page: Login / Signup]
    Login --> FirebaseID[Firebase Auth]
    FirebaseID --> Auth

    Auth -- Yes --> Dashboard[Dashboard: Insights & Charts]
    Dashboard --> Pay[Payment Interface]

    Pay --> Input[Input Transaction — Text/Voice]
    Input --> Classify[app/api/transactions: POST]

    subgraph AI_Engine [AI & Classification]
        Classify --> AI[Anthropic Claude 3.5 Sonnet]
        AI --> Result{Merchant / Category / Amount}
        Result -- Success --> BudgetCheck
        Result -- Fail --> Rules[Rule-based Fallback]
        Rules --> BudgetCheck
    end

    subgraph Guardrails [Budget Guardrails]
        BudgetCheck[Check budgets in Firestore]
        BudgetCheck --> Over80{> 80% of budget?}
        Over80 -- Yes --> Alert[Warning / Blocked UI]
        Alert -- Blocked --> Force{Force Protocol?}
        Force -- Yes --> Persist
        Force -- No --> Cancel[Transaction Cancelled]
        Over80 -- No --> Persist
    end

    subgraph Persistence [Persistence & Notify]
        Persist[Save transaction to Firestore]
        Persist --> Email[Resend API: Email Alert]
        Persist --> UpdateDash[Update Dashboard Stats]
    end

    Dashboard --> ZAAP[Web3: ZAAP Bundler]
    ZAAP --> zkSync[zkSync Era: Paymaster & ZAAP Bundling]
```

### Request Lifecycle

When a user submits a transaction (e.g., `"Lunch 200"`), the following happens step by step:

1. **User Action** — The user types a natural-language transaction string in the Pay interface.
2. **API Call** — A `POST` request is sent to `app/api/transactions`.
3. **AI Classification** — The raw text is forwarded to Anthropic Claude 3.5 Sonnet via `app/api/classify`, which extracts the merchant name, spending category, and amount.
4. **Fallback** — If the AI response is malformed or times out, a rule-based regex fallback parses the text.
5. **Budget Check** — The classified result is verified against the user's category budgets stored in Firestore.
6. **Guardrails** — If spending is above 80%, a warning is surfaced in the UI. If at 100%, the transaction is hard-blocked. The Force Protocol allows override in genuine emergencies.
7. **Persistence** — The approved transaction is written to Firestore and the dashboard is refreshed in real time.
8. **Notification** — The Resend API dispatches a confirmation or alert email to the user.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure the following are installed on your machine before you begin:

- **Node.js** v20 or higher (`node --version` to check)
- **npm** or **yarn** (npm ships with Node.js)
- **Firebase project** with Firestore and Authentication enabled ([Create one here](https://console.firebase.google.com/))
- **Anthropic API Key** with access to Claude 3.5 Sonnet ([Get one here](https://console.anthropic.com/))
- **Resend API Key** for transactional emails ([Sign up here](https://resend.com/))

### 2. Installation

```bash
git clone https://github.com/Ibaner20065/fixmypayments.git
cd fixmypayments
npm install
```

### 3. Environment Setup

Copy the template environment file:

```bash
cp .env.local.template .env.local
```

Then open `.env.local` and fill in every variable (see [Environment Variables](#-environment-variables) section for details).

### 4. Database Setup

This script initialises Firestore with the default budget categories, user schema, and seed data. Run it once after setting up your environment:

```bash
node setup-db.mjs
```

You should see confirmation output for each Firestore collection created. If you encounter permission errors, verify that `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` are correctly set.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will hot-reload on file changes.

---

## 🔐 Environment Variables

### Client-Side (Public — safe to expose)

These are prefixed with `NEXT_PUBLIC_` and are bundled into the client-side JavaScript.

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project client API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `NEXT_PUBLIC_ZKSYNC_RPC_URL` | zkSync RPC URL (Sepolia testnet or mainnet) | `https://sepolia.era.zksync.dev` |

### Server-Side (Private — never expose)

These are only available in Next.js API Routes and server components. Never commit these to version control.

| Variable | Description | How to Get |
|---|---|---|
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key (JSON format, with `\n` newlines) | Firebase Console → Project Settings → Service Accounts → Generate Key |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email | Same JSON file as above |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude 3.5 Sonnet | [console.anthropic.com](https://console.anthropic.com/) |
| `RESEND_API_KEY` | Resend API key for transactional email | [resend.com/api-keys](https://resend.com/api-keys) |

> **Note on `FIREBASE_PRIVATE_KEY`**: When copying the private key from the Firebase JSON file, the newlines must be represented as literal `\n` strings (not real line breaks) for correct parsing. The value should look like `"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"`.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server with hot reload |
| `npm run build` | Compile and optimise the app for production |
| `npm run start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint across the codebase |
| `node setup-db.mjs` | Initialise Firestore with default budgets and schema |

---

## 🧪 Testing

FixMyPayments uses API-level testing and UI validation.

### Test the Classification Endpoint

Verify that the AI classification pipeline is working correctly:

```bash
curl -X POST http://localhost:3000/api/classify \
     -H "Content-Type: application/json" \
     -d '{"text": "Dinner at Swiggy 500"}'
```

Expected response shape:

```json
{
  "merchant": "Swiggy",
  "category": "Food & Dining",
  "amount": 500
}
```

### Test Budget Guardrails

Submit a transaction that should trigger the 80% warning:

```bash
curl -X POST http://localhost:3000/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"userId": "test-uid", "text": "Zomato 900"}'
```

### Verify Production Build

Before deploying, always confirm the build compiles without errors:

```bash
npm run build
```

A successful build will output page sizes and confirm zero TypeScript/ESLint errors.

---

## 🚢 Deployment (Vercel)

FixMyPayments is optimised for deployment on **Vercel** with zero configuration.

### Steps

1. Push your repository to GitHub (or fork it).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In the Vercel dashboard, navigate to **Settings → Environment Variables** and add every variable from the [Environment Variables](#-environment-variables) section.
4. Set the **Framework Preset** to `Next.js` (auto-detected).
5. Set the **Build Command** to `npm run build`.
6. Click **Deploy**.

Vercel will automatically redeploy on every push to your `main` branch.

For a detailed walkthrough of common deployment errors and how to fix them, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Custom Domain

After deployment, assign a custom domain in **Vercel → Project → Domains**. Update your `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` and add the domain to the **Authorised Domains** list in the Firebase Console under Authentication.

---

## 🛠️ Troubleshooting

### `FIREBASE NOT CONFIGURED ON SERVER`

**Cause**: The server-side Firebase Admin SDK cannot initialise.

**Fix**: Ensure `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` are set in your `.env.local`. The private key must contain literal `\n` escape sequences — not real newlines — for correct parsing. Restart the dev server after changing environment variables.

```bash
# Verify the key is loaded correctly
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.FIREBASE_PRIVATE_KEY?.slice(0,40))"
```

---

### Classification is Slow or Timing Out

**Cause**: Anthropic API latency or exhausted API credits.

**Fix**:
- Verify your `ANTHROPIC_API_KEY` is valid and has available credits at [console.anthropic.com](https://console.anthropic.com/).
- Check that you're using the `claude-3-5-sonnet` model identifier (not a deprecated model string).
- The rule-based fallback will activate automatically if the API times out — check logs for `[FALLBACK]` messages.

---

### Budget Alerts Not Sending

**Cause**: Resend is in sandbox mode or the recipient email is not verified.

**Fix**:
1. Verify your `RESEND_API_KEY` is valid.
2. If your Resend account is in sandbox mode, you can only send to email addresses you have explicitly verified in the Resend dashboard.
3. To send to any address, upgrade your Resend plan and verify your sending domain.

---

### zkSync / ZAAP Transactions Failing

**Cause**: Wrong RPC URL or the testnet paymaster address has changed.

**Fix**:
- Confirm `NEXT_PUBLIC_ZKSYNC_RPC_URL` points to a live RPC endpoint. Use the official zkSync Sepolia testnet (`https://sepolia.era.zksync.dev`) for development.
- Check `contracts/` for the latest paymaster address and update if needed.

---

### Firestore `permission-denied` Errors

**Cause**: Firestore Security Rules are blocking reads/writes for unauthenticated or incorrectly structured requests.

**Fix**: In the Firebase Console, go to **Firestore → Rules** and ensure your rules allow authenticated users to read and write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🎨 Design Philosophy: The Disruptor

FixMyPayments deliberately rejects the "minimalist-boring" trend in fintech UI. The Disruptor Design System is built on **Neo-Brutalism**:

- **High Contrast** — Pure blacks, pure whites, and Neon Yellow (`#CCFF00`) for accent. No wishy-washy pastels.
- **Heavy Strokes** — 4px to 8px borders for an industrial, tactile feel.
- **Space Mono** — Monospace fonts for all data-heavy sections to emphasise technical precision.
- **Dark/Light Duality** — Both modes maintain the industrial aesthetic. Dark mode is not an afterthought.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for full details.
