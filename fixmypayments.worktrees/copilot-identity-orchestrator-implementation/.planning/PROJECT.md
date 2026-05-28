# FixMyPayments

## What This Is

An AI-powered personal finance assistant that lets users log transactions in natural language ("Swiggy 300") and instantly see categorized spending insights. Designed with Apple-level minimalism — clean, premium, demo-ready. Built as a web app with Next.js.

## Core Value

Users can add a transaction in seconds by typing natural text, see it auto-categorized, and understand their spending at a glance. Speed and clarity above all.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Natural language transaction input ("Swiggy 300")
- [ ] Smart rule-based category classification (Food, Transport, Shopping, Utilities, Medical, Entertainment, Health, Groceries)
- [ ] Transaction storage with text, amount, category, date
- [ ] Dashboard with total spending summary
- [ ] Category-wise spending breakdown (pie/bar chart)
- [ ] Recent transactions list
- [ ] Apple-minimal UI with soft shadows, clean whitespace, premium typography
- [ ] Real-time dashboard updates on transaction add
- [ ] SQLite database via Prisma ORM

### Out of Scope

- Authentication / user accounts — MVP is single-user, no login required
- Payment processing — this is a tracker, not a payment system
- Complex forms or multi-step input — single text input only
- Heavy animations — subtle only, no gratuitous motion
- Mobile app — web-first
- Export/import — not needed for MVP
- Multi-currency — INR only for now

## Context

- Solo developer building a personal finance tracking MVP
- Target: demo-ready, production-quality minimal product
- Design philosophy: "If Apple built a finance tracker"
- Frontend-first approach — build UI, then wire up database
- Stitch MCP available for UI design refinement after code is built
- Indian market context (Swiggy, Zomato, Ola, Flipkart as common merchants)

## Constraints

- **Tech stack**: Next.js (React) + SQLite via Prisma + rule-based AI classifier
- **Design**: Maximum 3 sections per screen, 2 colors + neutrals, cards with soft shadows
- **Scope**: First half of product only — core input → classify → store → display loop
- **No auth**: Single user, no login
- **Layout**: Top (branding) → Middle (input) → Bottom (dashboard)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over plain React | API routes + SSR built in, no separate backend needed | — Pending |
| SQLite over Supabase | Zero setup, no cloud dependency, instant dev experience | — Pending |
| Rule-based classifier first | Faster to ship, no API key dependency; LLM pluggable later | — Pending |
| Frontend-first build order | See the product quickly, wire data layer after UI is solid | — Pending |
| Code-first then Stitch | Build working app, then refine UI design with Stitch MCP | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after initialization*
