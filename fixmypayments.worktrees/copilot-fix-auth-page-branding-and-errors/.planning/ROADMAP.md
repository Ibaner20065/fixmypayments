# Roadmap: FixMyPayments

**Project:** FixMyPayments — AI-powered personal finance assistant
**Core Value:** Instant natural-language transaction logging with auto-categorization and spending insights
**Granularity:** Coarse (3 phases)
**Created:** 2026-04-20

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | UI Foundation & Input | Build the complete frontend with Apple-minimal design, transaction input, and mock dashboard | INPUT-01..04, UX-01..06 | 10 |
| 2 | Classification Engine & Dashboard | Wire up transaction processing, rule-based classifier, and live dashboard with charts | PROC-01..04, DASH-01..05 | 9 |
| 3 | Database & Persistence | Add SQLite via Prisma, API routes, and connect frontend to real data | DATA-01..04 | 4 |

## Phases

### Phase 1: UI Foundation & Input
**Status:** Not Started
**Goal:** Build the complete Next.js frontend with Apple-minimal design aesthetic. Transaction input that works (with local state). Mock dashboard layout with placeholder data. The app should look production-ready even before the backend exists.

**Requirements:** INPUT-01, INPUT-02, INPUT-03, INPUT-04, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06

**Success Criteria:**
1. Next.js project scaffolded and running locally
2. User can type "Swiggy 300" into input box and submit
3. Input clears after submission with subtle confirmation
4. Layout follows 3-section structure: branding → input → dashboard
5. Typography uses Inter font from Google Fonts
6. Cards have soft shadows, no heavy borders
7. Color palette limited to 2 accent colors + neutrals
8. Responsive on desktop and tablet viewports
9. Mock dashboard shows placeholder spending data
10. Overall aesthetic is premium, minimal, Apple-inspired

**Depends on:** Nothing

---

### Phase 2: Classification Engine & Dashboard
**Status:** Not Started
**Goal:** Build the rule-based transaction classifier that extracts amounts and maps merchants/keywords to categories. Wire up the dashboard to show real spending data from local state — total spending, category breakdown chart, and recent transaction list.

**Requirements:** PROC-01, PROC-02, PROC-03, PROC-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05

**Success Criteria:**
1. "Swiggy 300" correctly extracts amount=300 and category=Food
2. "Uber 150" correctly extracts amount=150 and category=Transport
3. Handles edge cases: "coffee 50" → Food, "random 200" → graceful fallback
4. No-amount input shows user-friendly error
5. Total spending updates immediately on new transaction
6. Pie/bar chart shows category-wise breakdown
7. Recent transactions list shows entries in reverse chronological order
8. Dashboard updates in real-time (no page reload needed)
9. At least 50 keyword mappings across all 8 categories

**Depends on:** Phase 1

---

### Phase 3: Database & Persistence
**Status:** Not Started
**Goal:** Add SQLite database via Prisma ORM. Create API routes for CRUD operations. Connect frontend to real persistent storage so transactions survive page refresh.

**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04

**Success Criteria:**
1. Prisma schema defines Transaction model with text, amount, category, date fields
2. SQLite database file created and migrations run successfully
3. POST /api/transactions creates a new transaction
4. GET /api/transactions returns all transactions (sorted by date desc)

**Depends on:** Phase 2

---

## Milestone

**v1.0 — FixMyPayments MVP**
- Phases 1-3
- Demo-ready personal finance tracker
- Natural language input → auto-classify → persist → display

---
*Roadmap created: 2026-04-20*
*Last updated: 2026-04-20 after initial creation*
