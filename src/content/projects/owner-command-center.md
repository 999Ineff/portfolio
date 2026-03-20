---
title: "Owner Command Center"
client: "Multi-Location Restaurant Group"
tier: "enterprise"
industry: "Food & Beverage / Multi-Location Franchise"
serviceType: "platform"
challenge: "Multi-location restaurant franchise operating 5+ locations with no unified visibility. Ownership was making decisions from week-old spreadsheets compiled manually by managers. Labor costs, sales, and inventory lived in disconnected systems — QuickBooks, paper logs, and point-of-sale exports that never talked to each other."
result: "Unified real-time analytics dashboard replacing 5 disconnected systems"
metrics:
  - label: "Systems consolidated"
    value: "5 → 1"
  - label: "Weekly reporting time"
    value: "4 hrs → 15 min"
    prefix: ""
  - label: "Data lag eliminated"
    value: "7 days → real-time"
  - label: "Locations connected"
    value: "5+"
tags: ["python", "react", "dashboard", "data-integration", "restaurant", "enterprise"]
date: "2025-06-15"
featured: true
placeholder: false
---

## The Challenge

This multi-location restaurant group ran a profitable franchise — but growth had outpaced its systems. With 5+ locations operating independently, ownership had no single view of the business.

Every Monday, a manager at each location would export data from the POS, manually compile it into a spreadsheet, and email it to ownership. By the time the numbers arrived, they were 3–7 days old. Decisions about staffing, menu pricing, and inventory were being made on stale data.

The fundamental problem: the tools existed. The data existed. But no one had connected them.

## The Process

**Phase 1 — Discovery Audit (Week 1)**

I mapped every data source across all locations:
- POS system (sales, item-level data, voids, comps)
- Scheduling software (labor hours, overtime)
- Inventory management (COGS, waste)
- QuickBooks (GL entries, payables)

Each system had an API or export capability. None of them had ever been connected.

**Phase 2 — Architecture (Week 2)**

Built a Python data pipeline to:
- Pull from each source on a scheduled basis (15-minute intervals for POS, hourly for the rest)
- Normalize and store in a PostgreSQL database
- Flag anomalies (unusual voids, overtime triggers, inventory shortfalls)

**Phase 3 — Dashboard (Weeks 3–4)**

Built the React frontend with role-based access:
- **Owner view:** P&L summary across all locations, location comparison, trend lines
- **Manager view:** Their location only — daily targets, labor vs. budget, real-time sales
- **Alerts:** Slack notifications for threshold breaches (labor overtime, low inventory)

**Phase 4 — Training and Handoff (Week 5)**

Documented every integration, trained the team, and set up monitoring. The system runs autonomously — no manual data entry, no weekly email compilations.

## The Results

Ownership went from weekly spreadsheet compilations to a live dashboard they check on their phones every morning. The Monday reporting meeting that used to take an hour now takes 10 minutes — the data is already there.

The real win wasn't the time saved. It was the decisions that could now be made. Labor adjustments based on real-time sales trends. Menu engineering informed by item-level profitability. Inventory orders driven by actual consumption rates, not gut feel.

**Stack:** Python (data pipeline) · PostgreSQL · React · Recharts · Netlify Functions · Slack API

This project is the clearest demonstration of what "building a platform" actually means: not adding another tool to the stack, but replacing a broken stack with one thing that works.
