# SaaS Infrastructure — Pricing & Productization Strategy

> **What this is:** How to price and sell SaaS development services powered by the `/saas-build` pipeline in Claude Code. This system (agents, skills, commands) lets you build complete SaaS products in 1-2 days instead of 2-4 weeks — the pricing reflects that speed advantage.

> Generated from war-room review session (2026-02-11)
> Contributors: Architecture Critic, DX Advocate, Business Strategist, Claude Code Expert

---

## The Promise: Idea to First Checkout in a Day

Someone comes to you with: an idea, a Python script, a local business, a spreadsheet workflow — anything with SaaS potential. You take it from zero to a deployed product where real customers can sign up, use the product, and pay.

**What the client gets at the end:**
- A live URL on Vercel (their product, deployed)
- User authentication (email/password, Google, GitHub login)
- Database with enterprise-grade row-level security
- Working payment checkout (Polar) — customers can actually pay
- Feature gating by subscription tier (free / pro / enterprise)
- Premium UI — Awwwards-level design, not generic AI templates
- Dashboard, settings page, billing management
- Everything production-ready, not a prototype

**What it looks like under the hood:**
```
Client has: idea / Python script / business process / spreadsheet
                              ↓
Phase 0: Analyze — Is there SaaS potential? What's the product?
Phase 1: PRD — Database schema, API routes, pages, pricing tiers
         ← CLIENT APPROVES →
Phase 2: Backend + Auth — Next.js, Supabase DB, RLS, auth flow, APIs
Phase 3: Frontend — Landing page, dashboard, settings (premium design)
Phase 4: Payments — Polar checkout, webhooks, pricing page, feature gating
Phase 5: Deploy — GitHub → Vercel → live URL
                              ↓
Result: Real SaaS product. Real URL. Real checkout. Real money.
```

**Timeline:** 1 day for MVP, 1-2 days for Standard, 2-3 days for Enterprise.
**Traditional agency timeline for the same work:** 2-4 weeks with a team of 3-5.

---

## Productized Service Pricing

**What you're selling:** Custom SaaS products built for clients using your Claude Code `/saas-build` pipeline. The client gets a fully deployed product. You use the orchestrator system to build it in a fraction of the time a traditional agency would take.

| Package | Deliverable | Price |
|---------|-------------|-------|
| **SaaS Audit Report** | `/siteaudit` + SaaS readiness check with HTML deliverable | $500 |
| **MVP Build** | Full `/saas-build --tier mvp` + deploy | $2,500 |
| **Standard Build** | `/saas-build --tier standard` + custom features | $5,000 |
| **Enterprise Build** | Full pipeline + multi-tenant + admin + CI/CD | $10,000+ |

### The Engagement Cycle

```
1. /siteaudit [url]        → Grade existing site (sales tool)
2. /saas-build [project]   → Build the SaaS product (delivery)
3. /deploy [project]       → Ship it live (handoff)
4. /linkedin               → Create content about the build (marketing)
5. Repeat                  → Next client sees the content
```

Each build takes **1-2 days** with the orchestrator vs **2-4 weeks** without.

---

## Selling the System Itself

Package the `~/.claude/` infrastructure for other Claude Code users.

| Product | What They Get | Price |
|---------|---------------|-------|
| **SaaS Builder Kit for Claude Code** | Entire `~/.claude/` infrastructure (agents, skills, commands) | $99-299 |
| **Custom builds using the toolkit** | Done-for-you SaaS using the pipeline | $2,500+ |

### What Would It Take to Productize?

1. Clean up the `.claude/` folder into a distributable package
2. Remove personal project references
3. Add setup instructions and env var documentation
4. Sell on Gumroad/Polar as "SaaS Builder Kit for Claude Code" ($99-299)
5. Upsell: custom builds using the toolkit ($2,500+)

---

## Revenue Timeline

### Near-term (0-3 months)
- Use `/saas-build` for own projects (ShowRoomInvoice, BCE tools) — proves the system
- LinkedIn content about the builds creates social proof

### Medium-term (3-6 months)
- Offer "SaaS Audit + Build" as a productized service
- $2,500 - $10,000 per engagement depending on tier
- Each build takes 1-2 days with the orchestrator vs 2-4 weeks without

### Long-term (6-12 months)
- saas-stack skill improves with every build (pattern library grows)
- Package entire `.claude/` infrastructure as a product for other Claude Code users
- "AI agency in a box" positioning: sell the CAPABILITY, not just individual builds
- Potential recurring revenue from maintained/updated toolkit

---

## Competitive Analysis

| Competitor | Price | What You Get | Our Advantage |
|-----------|-------|-------------|---------------|
| **Shipfast** | $199 | Static Next.js boilerplate | We generate CUSTOM features, not a template |
| **Supaboost** | Free/OSS | Supabase + Next.js starter | No audit, no orchestration, no design |
| **create-t3-app** | Free | T3 stack scaffold | No auth, no payments, no design, no deploy |
| **v0.dev** | Free/Pro | AI-generated UI components | Frontend only — no backend, no deploy |
| **Lovable/Bolt** | $20-50/mo | AI full-stack builder | Generic, not customized to the pipeline |

### The Moat

**The moat is the PIPELINE, not the code.**

Nobody else has:
1. Audit existing site
2. Score SaaS readiness
3. Generate custom PRD
4. Build with design research (godly.website, 21st.dev)
5. Deploy to production
6. Create marketing content about what was built

That's a **6-step automated consulting engagement** wrapped in slash commands.

---

## Tier Breakdown (What Clients Actually Get)

### MVP ($2,500)
- Landing page with premium design (Dark Tech / Corporate SaaS preset)
- User authentication (email/password + OAuth)
- Database with RLS security
- Core feature implementation
- Deployed to Vercel with live URL
- Timeline: 1 day

### Standard ($5,000)
- Everything in MVP
- Payment integration (Polar — subscriptions, checkout, billing)
- Pricing page
- Customer billing management
- Feature gating by plan
- Timeline: 1-2 days

### Enterprise ($10,000+)
- Everything in Standard
- Multi-tenant architecture (team workspaces)
- Admin dashboard
- Analytics (PostHog) + Error monitoring (Sentry)
- Email templates (Resend)
- CI/CD pipeline
- Timeline: 2-3 days

---

## Key Insight

> Traditional agency builds the same product in 2-4 weeks with a team of 3-5.
> This pipeline builds it in 1-2 days with one person + Claude Code.
> The margin on a $5,000 Standard build is nearly 100%.
