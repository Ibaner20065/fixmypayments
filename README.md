# FixMyPayments 💰

A modern fintech application combining Web2 payments with Web3 DeFi capabilities, AI-powered transaction classification, and intelligent budget management with real-time spending alerts.

## 🎯 Vision

FixMyPayments simplifies personal finance by providing:
- **Instant payments** to friends and family
- **Smart budget tracking** with AI-powered expense categorization
- **Real-time alerts** via email when spending exceeds limits
- **DeFi integration** for gasless transactions on zkSync
- **Analytics dashboard** for spending insights

---

## 📊 Process Flow: Payment with Budget Checking & Email Alerts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT FLOW DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────┘

USER JOURNEY:
=============

1. ENTER RECIPIENT
   ├─ User types recipient name (e.g., "Swiggy")
   └─ System validates input

2. ENTER AMOUNT
   ├─ User enters amount (e.g., ₹5000)
   ├─ System validates positive number
   └─ User selects category (Food, Transport, Shopping, etc.)

3. REVIEW PAYMENT
   ├─ System fetches user's budgets from Firebase
   ├─ System fetches user's transaction history
   │
   └─ BUDGET CHECK LOGIC:
      ├─ Category Check: "Food" budget = ₹3000, payment = ₹5000
      │  └─ Alert: "Food budget at 166% (₹5000 / ₹3000)" ⚠️
      │
      ├─ Total Check: Monthly total = ₹38000, limit = ₹40000
      │  └─ No alert (78% used)
      │
      └─ Spike Check: Single transaction (₹5000) = 12% of monthly budget
         └─ No alert (<25% threshold)

4. SHOW ALERTS (If triggered)
   ├─ Red warning box appears on review screen
   ├─ Display each alert:
   │  ├─ Alert message
   │  ├─ Amount spent / Budget limit
   │  └─ Percentage used
   └─ Button changes to "Send Anyway" (red)

5. CONFIRM PAYMENT
   ├─ User clicks "Send Money" or "Send Anyway"
   │
   └─ PAYMENT PROCESSING:
      ├─ Generate transaction ID (tx_1234567890_abc123)
      ├─ Simulate 2.5s payment processing
      ├─ Update Firebase transactions
      └─ Mark as complete

6. SEND CONFIRMATION EMAIL
   ├─ Email type: "payment-confirmation"
   ├─ Recipient: user@email.com
   ├─ Subject: "Payment Sent: ₹5000 to Swiggy"
   │
   └─ Email template includes:
      ├─ Recipient name
      ├─ Amount
      ├─ Category
      └─ Transaction ID

7. SEND ALERT EMAIL (If alerts triggered)
   ├─ Email type: "budget-alert"
   ├─ Subject: "⚠️ Spending Alert — Food budget EXCEEDED"
   │
   └─ Email template includes:
      ├─ Header: Alert type (warning/blocked/forced)
      ├─ Alert table with:
      │  ├─ Category
      │  ├─ Spent / Limit
      │  └─ Percentage (color-coded)
      └─ Dashboard link for review

8. SUCCESS SCREEN
   ├─ Show transaction ID
   ├─ Display confirmation message
   └─ Button: "Back to Dashboard"
```

---

## 🔄 System Architecture: Components & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                               │
└──────────────────────────────────────────────────────────────────────────┘

FRONTEND (Next.js 16 Client)
┌────────────────────────────────────────────────────┐
│  /app/pay/page.tsx (Payment Interface)             │
│  ├─ Step 1: Recipient Input                        │
│  ├─ Step 2: Amount + Category Selection            │
│  ├─ Step 3: Review with Budget Alerts              │
│  ├─ Step 4: Processing Loader                      │
│  └─ Step 5: Success Screen                         │
│                                                     │
│  State Management:                                  │
│  ├─ recipient, amount, category, note              │
│  ├─ budgets (fetched from /api/budget)            │
│  ├─ budgetAlerts (from /api/check-spending)       │
│  ├─ showAlertWarning                              │
│  └─ userEmail (from /api/profile)                 │
└────────────────────────────────────────────────────┘
           ↓
BACKEND API ENDPOINTS
┌────────────────────────────────────────────────────┐
│  POST /api/check-spending                         │
│  ├─ Input: newAmount, newCategory,                │
│  │          existingTransactions, budgets          │
│  ├─ Process: Calls checkSpendingAlerts()          │
│  └─ Output: { alerts, hasAlerts }                 │
│                                                     │
│  POST /api/send-alert                             │
│  ├─ Input: userEmail, userName, alerts            │
│  ├─ Process: Calls sendAlertEmail() → Resend API  │
│  └─ Output: { success, timestamp }                │
│                                                     │
│  POST /api/email/send                             │
│  ├─ Input: type, to, data                         │
│  ├─ Process: Selects template & sends via Resend  │
│  └─ Output: { success, timestamp }                │
│                                                     │
│  GET /api/budget                                  │
│  ├─ Fetch user's budget config from Firebase      │
│  └─ Output: { budget }                            │
│                                                     │
│  GET /api/transactions                            │
│  ├─ Fetch user's transaction history              │
│  └─ Output: { transactions }                      │
│                                                     │
│  GET /api/profile                                 │
│  ├─ Fetch user's profile info                     │
│  └─ Output: { email, name }                       │
└────────────────────────────────────────────────────┘
           ↓
BUSINESS LOGIC
┌────────────────────────────────────────────────────┐
│  /lib/alerts.ts (Budget Checking)                 │
│  ├─ checkSpendingAlerts(amount, category,         │
│  │     transactions, budgets)                      │
│  │  ├─ Check category budget (80% threshold)      │
│  │  ├─ Check total monthly budget (80%)           │
│  │  └─ Check spike detection (25% of total)       │
│  │                                                 │
│  └─ sendAlertEmail(userEmail, alerts)             │
│     ├─ Uses Resend API                            │
│     └─ Sends styled HTML email                    │
│                                                     │
│  /lib/email.ts (Email Service)                    │
│  ├─ sendEmail(options)                            │
│  ├─ emailTemplates.paymentConfirmation()          │
│  ├─ emailTemplates.budgetAlert()                  │
│  └─ emailTemplates.welcomeEmail()                 │
└────────────────────────────────────────────────────┘
           ↓
DATA STORAGE
┌────────────────────────────────────────────────────┐
│  Firebase Firestore (Database)                     │
│  ├─ users/{uid}/budget (Budget config)            │
│  ├─ users/{uid}/transactions[] (History)          │
│  ├─ users/{uid}/profile (Email, name)             │
│  └─ users/{uid}/alerts[] (Alert history)          │
└────────────────────────────────────────────────────┘
           ↓
EXTERNAL SERVICES
┌────────────────────────────────────────────────────┐
│  Resend API (Email Delivery)                       │
│  ├─ Sends payment confirmation emails             │
│  └─ Sends budget alert emails                     │
│                                                     │
│  Firebase Auth (Authentication)                    │
│  ├─ User sign-up / login                          │
│  └─ Token verification                            │
└────────────────────────────────────────────────────┘
```

---

## 🎬 Use Case: Budget Alert Scenario

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     USE CASE: PAYMENT EXCEEDS BUDGET                     │
└──────────────────────────────────────────────────────────────────────────┘

ACTOR: User (Indra)
PRECONDITION: User is logged in, has budgets configured

SCENARIO: Ordering food when budget is low
──────────────────────────────────────────

  User Action                          System Response
  ───────────────────────────────────  ────────────────────────────────
  
  1. Opens Payment Page                Dashboard → Click "Send Money"
                                       ✓ Loads /app/pay

  2. Enters: "Swiggy" (Recipient)      Validates recipient name
                                       ✓ Shows "Amount" step

  3. Enters: "5000" (Amount)           ✓ Shows category dropdown
     Selects: "Food"

  4. Clicks: "Review"                  System fetches:
                                       ├─ /api/budget
                                       │  └─ Returns: { Food: 3000, ... }
                                       │
                                       ├─ /api/transactions
                                       │  └─ Returns: [
                                       │     { amount: 1500, category: Food },
                                       │     { amount: 1200, category: Food }
                                       │    ]
                                       │
                                       └─ /api/check-spending
                                          INPUT:
                                          {
                                            newAmount: 5000,
                                            newCategory: "Food",
                                            existingTransactions: [...],
                                            budgets: { Food: 3000, ... }
                                          }
                                          
                                          LOGIC:
                                          categoryTotal = 1500 + 1200 + 5000
                                                        = 7700
                                          categoryPercent = (7700/3000)*100
                                                         = 256%
                                          
                                          ALERT TRIGGERED:
                                          type: "category_exceeded"
                                          message: "🚨 Food budget EXCEEDED!"
                                          currentAmount: 7700
                                          budgetLimit: 3000
                                          percentUsed: 256%

  5. Sees Alert Warning                ✓ Red box appears:
                                       ┌──────────────────────────┐
                                       │ ⚠️ Budget Alert          │
                                       │ 🚨 Food budget EXCEEDED! │
                                       │ ₹7700 / ₹3000 (256%)    │
                                       │                          │
                                       │ You can proceed but an   │
                                       │ alert email will be sent │
                                       └──────────────────────────┘

  6. Clicks: "Send Anyway"              ✓ Payment processing starts
                                       │ (2.5s loader animation)
                                       │
                                       ├─ Generate txId
                                       ├─ Update Firebase
                                       └─ Show success screen

  7. Success Screen                     Email 1: Payment Confirmation
                                       ├─ To: indra@example.com
                                       ├─ Subject: "Payment Sent: ₹5000"
                                       └─ Content: Recipient, Amount, TxID
                                       
                                       Email 2: Budget Alert
                                       ├─ To: indra@example.com
                                       ├─ Subject: "⚠️ Budget Alert: Food"
                                       ├─ Type: "forced" (proceeded anyway)
                                       └─ Content: Alert table, Dashboard link

  8. User receives 2 emails:
     ├─ ✉️ "Payment Sent: ₹5000 to Swiggy"
     └─ ✉️ "⚠️ Budget Alert: Food budget EXCEEDED!"

POSTCONDITION:
  ✓ Payment recorded in Firebase
  ✓ Transaction added to user's history
  ✓ Both emails delivered via Resend
  ✓ User notified of budget overage


ALTERNATIVE FLOW: User changes mind
────────────────────────────────────

  4b. Sees alert warning
  5b. Clicks: "Back" button
      → Returns to amount entry
      → Can change amount to ₹2000 (stays within budget)
      → No alert shown
      → Payment proceeds normally


EXCEPTION FLOW: No budget configured
──────────────────────────────────────

  If user hasn't set a budget for "Food":
  ├─ System uses DEFAULT_BUDGET = ₹5000
  ├─ Payment ₹5000 = 100% (borderline)
  ├─ Still triggers alert (≥90% threshold)
  └─ Warning shown
```

---

## 📱 Features & Routes

### Core Pages
- **`/auth`** - Login/Signup with Firebase
- **`/dashboard`** - Overview of budgets, transactions, spending alerts
- **`/pay`** - **NEW:** Payment portal with budget checking & alerts
- **`/profile`** - User settings, budget configuration
- **`/transactions`** - Transaction history with AI classification

### API Endpoints
- **`POST /api/check-spending`** - Check if payment triggers budget alerts
- **`POST /api/send-alert`** - Send budget alert emails
- **`POST /api/email/send`** - Generic email sending (payment confirmation, welcome)
- **`GET /api/budget`** - Fetch user's budget config
- **`POST /api/transactions`** - Log transaction with AI classification
- **`GET /api/transactions`** - Fetch transaction history
- **`GET /api/profile`** - Get user profile

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (React 19) - Modern SSR framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

### Backend
- **Firebase** - Authentication & Realtime Database
- **Firebase Admin SDK** - Server-side operations

### Services
- **Resend** - Email delivery (payment confirmations, budget alerts)
- **Claude API** - AI transaction classification
- **zkSync** - Layer 2 DeFi integration

### Development
- **TypeScript** - Type-safe code
- **Tailwind CSS** (inline styles) - Responsive design

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
```

### Setup

1. **Clone & Install**
```bash
git clone <repo>
cd fixmypayments
npm install
```

2. **Configure Environment** (`.env.local`)
```bash
# Firebase (public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase (server-only)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Email Service
RESEND_API_KEY=...

# AI Classification (optional)
ANTHROPIC_API_KEY=...
```

3. **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

4. **Build & Deploy**
```bash
npm run build
npm run start
```

---

## 📧 Email Notifications

### 1. Payment Confirmation
**When:** Immediately after payment completes
**Template:** Professional receipt with transaction details
```
Subject: Payment Sent: ₹5000 to Swiggy
├─ Header: "✓ Payment Sent"
├─ Recipient: Swiggy
├─ Amount: ₹5,000
├─ Category: Food
├─ Transaction ID: tx_1234567890_abc123
└─ CTA: "Go to Dashboard"
```

### 2. Budget Alert
**When:** Payment triggers spending thresholds
**Template:** Styled alert with budget breakdown
```
Subject: ⚠️ Spending Alert — Food budget EXCEEDED
├─ Header: Alert type (Warning/Blocked/Forced)
├─ Alert Table:
│  ├─ Category | Amount | Status
│  ├─ Food    | 7700/3000 | 256% 🔴
│  └─ ...
└─ Action: "Review your spending in dashboard"
```

---

## 🔐 Security

- ✅ Firebase Auth for secure login
- ✅ JWT tokens for API authentication
- ✅ RESEND_API_KEY stored server-side only
- ✅ No sensitive data in browser localStorage
- ✅ Rate limiting on auth endpoints (5/min signup, 10/15min login)

---

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Recurring payments
- [ ] Split payments with friends
- [ ] Investment recommendations
- [ ] Savings goals
- [ ] Bill reminders
- [ ] DeFi yield farming integration
- [ ] Crypto payments

---

## 📄 License

MIT

---

**Built with ❤️ by FixMyPayments Team**
