# Requirements: FixMyPayments

**Defined:** 2026-04-20
**Core Value:** Users can add a transaction in seconds by typing natural text, see it auto-categorized, and understand their spending at a glance.

## v1 Requirements

### Transaction Input

- [ ] **INPUT-01**: User can type a natural language transaction (e.g., "Swiggy 300") into a single text input
- [ ] **INPUT-02**: User can submit transaction with a button click or Enter key
- [ ] **INPUT-03**: Input field clears after successful submission
- [ ] **INPUT-04**: User sees confirmation feedback after adding a transaction

### Transaction Processing

- [ ] **PROC-01**: System extracts amount from natural language text
- [ ] **PROC-02**: System classifies transaction into one of 8 categories: Food, Transport, Shopping, Utilities, Medical, Entertainment, Health, Groceries
- [ ] **PROC-03**: Classification uses rule-based matching with keyword-to-category mappings
- [ ] **PROC-04**: System handles edge cases (no amount found, unrecognized merchant) gracefully

### Data Storage

- [ ] **DATA-01**: Transaction stored with fields: text, amount, category, date
- [ ] **DATA-02**: SQLite database via Prisma ORM
- [ ] **DATA-03**: API route to create transactions (POST /api/transactions)
- [ ] **DATA-04**: API route to fetch transactions (GET /api/transactions)

### Dashboard

- [ ] **DASH-01**: Display total spending amount
- [ ] **DASH-02**: Display category-wise spending breakdown as a chart (pie or bar)
- [ ] **DASH-03**: Display list of recent transactions with text, amount, category, date
- [ ] **DASH-04**: Dashboard updates in real-time when new transaction is added
- [ ] **DASH-05**: Transactions listed in reverse chronological order

### Design & UX

- [ ] **UX-01**: Apple-minimal aesthetic — clean whitespace, soft typography, subtle colors
- [ ] **UX-02**: Maximum 3 sections: branding top, input middle, dashboard bottom
- [ ] **UX-03**: Cards with soft shadows, no heavy borders
- [ ] **UX-04**: 2 accent colors + neutral tones only
- [ ] **UX-05**: Premium Google Font (Inter or similar)
- [ ] **UX-06**: Responsive layout that works on desktop and tablet

## v2 Requirements

### AI Enhancement

- **AI-01**: LLM-powered classification for better accuracy
- **AI-02**: Transaction description auto-suggestion
- **AI-03**: Spending pattern insights and alerts

### Data Management

- **MGMT-01**: Edit existing transactions
- **MGMT-02**: Delete transactions
- **MGMT-03**: Date range filtering
- **MGMT-04**: Export to CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / login | MVP is single-user, no accounts needed |
| Payment processing | This is a tracker, not a payment gateway |
| Multi-currency support | INR only for MVP simplicity |
| Mobile native app | Web-first approach |
| Complex input forms | Single text input is the core UX principle |
| Budget setting / alerts | Phase 2 feature |
| Bank API integration | Too complex for MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPUT-01 | Phase 1 | Pending |
| INPUT-02 | Phase 1 | Pending |
| INPUT-03 | Phase 1 | Pending |
| INPUT-04 | Phase 1 | Pending |
| UX-01 | Phase 1 | Pending |
| UX-02 | Phase 1 | Pending |
| UX-03 | Phase 1 | Pending |
| UX-04 | Phase 1 | Pending |
| UX-05 | Phase 1 | Pending |
| UX-06 | Phase 1 | Pending |
| PROC-01 | Phase 2 | Pending |
| PROC-02 | Phase 2 | Pending |
| PROC-03 | Phase 2 | Pending |
| PROC-04 | Phase 2 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| DASH-05 | Phase 2 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
*Last updated: 2026-04-20 after initial definition*
