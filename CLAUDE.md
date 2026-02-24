# Ineffable — Portfolio & Business Site

> **Status:** Redesign In Progress
> **Last Updated:** 2026-02-11
> **Purpose:** Full business website for Ineffable — custom software, web design, platforms, and consulting
> **Live:** https://ineffablesolutions.net
> **Netlify URL:** https://luis-f-portfolio.netlify.app/
> **Domain Registrar:** GoDaddy (ineffablesolutions.net)

---

## Brand

**Name:** Ineffable
**Tagline:** "Custom Software. Tailored Websites. Zero Busywork."
**Secondary Tagline:** "From Spreadsheets to Systems"
**Core Message:** "I build what others outsource"
**Logo Concept:** Single golden "I" that expands letter-by-letter to reveal "Ineffable"
**Owner:** Luis Aviles

---

## Agreed Decisions (2026-02-11 Planning Session)

| Item | Decision |
|------|----------|
| Framework | **Astro** (static-first, islands for interactivity) |
| Brand | **Ineffable** (standalone, no suffix) |
| Tagline | "Custom Software. Tailored Websites. Zero Busywork." |
| Nav Items | Custom Automation / Tailored Websites / Custom Platforms / Consulting / Blog / Resources |
| Homepage Feature | Jarvis-style persona selector (voice toggle, localStorage, defaults to full site) |
| Coming Soon Pages | Teaser + email capture + "Want this now? Book a call" CTA |
| Design | Dark theme evolved — GSAP animations, page transitions, magnetic cursor |
| Hosting | Netlify (or Vercel when server features needed) |
| Style Presets | 9 existing presets preserved and migrated |

---

## Site Architecture

```
HOME (/)
├── Hero: Ineffable branding + tagline + Jarvis persona selector
├── Service overview cards (route to service pages)
├── Social proof / stats
├── Featured case studies
├── Time savings math section (migrated)
└── CTA: Book a Call

CUSTOM AUTOMATION (/automation)
├── Small wins: macros, scripts, scrapers (30min/day savings story)
├── Integration systems: connecting tools
├── Full automation suites: end-to-end
├── Case studies with video demos
├── ROI calculator or visual
└── CTA

TAILORED WEBSITES (/websites)
├── Style Presets Gallery (9 existing presets — live demos)
├── Component/Animation Showcase (mini 21st.dev gallery)
├── SEO Tiers: Free Scan / 130-point / 130-plus
├── Process: how a website gets built
└── CTA

CUSTOM PLATFORMS (/platforms)
├── What a "platform" means (dashboards, team tools, full systems)
├── Case study: BCE Owner Dashboard (rich media)
├── Case study: Receipt tool → full office platform
├── Tech stack overview
└── CTA

CONSULTING (/consulting)
├── What I cover: AI, ops, automation strategy
├── Who it's for: employee / manager / C-suite / owner
├── Tiers & pricing (TBD — Coming Soon treatment if not ready)
└── CTA

BLOG (/blog)
├── LinkedIn content repurposed
└── Searchable/filterable

RESOURCES (/resources)
├── Free guides (existing 3 lead magnets)
├── Orchestrator template bundle
└── Downloadables

FREE TOOLS (/tools) — COMING SOON
├── SEO Scanner (input site → automated audit → results → upsell)
├── Site Preview Builder (scan site → choose preset → auto-generate preview)
└── Tiered access: free/paid
```

---

## Design System

**Fonts:**
- Headings: Outfit (Google Fonts)
- Code/Technical: JetBrains Mono

**Colors:**
- Background: #050508 (near black)
- Gold accent: #ffc13b
- Cyan accent: #00e5ff
- Green (success): #00ff88
- Red (negative): #ff4757

**Effects (Evolved):**
- Floating gradient orbs (cursor-reactive)
- Grid overlay background (parallax on scroll)
- Noise texture overlay
- GSAP scroll-linked animations
- Page transitions (clip-path or morph)
- Magnetic cursor (morphs on interactive elements)
- Text reveal animations (character/line)
- 3D card tilts on hover
- Staggered entrance choreography

---

## Integrations

**Calendly:** https://calendly.com/luis-aviles-khn
**LinkedIn:** https://www.linkedin.com/in/luis-aviles-0b969235a/

---

## Legacy Assets (from v1)

All content from the original `index.html` is preserved for migration:
- Hero copy, stats, CTAs
- About section + career timeline (Windstream → LTC → BCE)
- "You're Losing More Time Than You Think" math breakdown
- 2 featured project showcases (BCE Dashboard, Video Content Factory)
- OneKey Writer showcase
- The Vault (10 accordion projects)
- Quick Wins (6 cards)
- Services grid (6 cards)
- Free Resources (3 guide cards)
- CTA section with Calendly

**Style Presets (9):** `/styles/`
- bold-playful, corporate-saas, dark-tech, editorial, luxury, minimal, tierra-developer, warm-organic, warm-vibrant

**Lead Magnets:** `/freebies/`
- 3 HTML landing pages + PDFs + images + orchestrator template bundle

**Video Demos:** `/assets/`
- TeleGramImagetoDB.mp4, TextHelperDemo.mp4

**Screenshots:** `/assets/screenshots/`
- BCE Owner Dashboard.png, Tiktok Channel posts + views.png

---

## Gemini Image API

Location: `C:\Users\ainef\google-image-gen-api-starter\`

```bash
cd C:\Users\ainef\google-image-gen-api-starter
uv run python main.py output.png "prompt here"
uv run python main.py output.png "subject" --style styles/blue_glass_3d.md
```

---

## Phase Roadmap

### Phase 1 — "The Complete Site" (Current)
Full Astro multi-page site with all core pages, animations, Jarvis selector.
Service pages with full content. Coming Soon treatment for unbuilt features.

### Phase 2 — "The Platform"
- Free SEO scanner tool (site audit → results → upsell)
- Site preview builder (scan → choose preset → auto-generate)
- User accounts with tiered access (free/paid)
- Image asset database with prompt indexing
- SSR mode + API endpoints on Astro

### Phase 3 — "The Ecosystem"
- Paid tier tools
- Client dashboard
- Automated onboarding pipeline
- Full CRM integration

---

## Future Stage Notes

### VIDEO CONTENT FOR AUTOMATIONS PAGE
Need visual demos showing automations in action. Fast-paced (under 5 min total), wow-factor focus.
- Show a scraper opening browser, navigating, pulling data, saving to Excel
- Demo a macro running across spreadsheets
- The "click run and watch the browser move" moment is the hook
- BCE job scraper was the best demo but no longer have CRM access
- Possible demo: YouTube data scraper pulling stats → saving to Excel
- Possible demo: Multi-site property auditor scanning websites for criteria
- Investigate AI video generation (Google's video models, etc.) for supplementary content
- Combine: 2-3 real screen recordings + AI-generated explainer segments
- Common use case list for employees and owners who don't know what can be automated

### IMAGE ASSET INDEXING SYSTEM
Build a database indexing every generated image with its prompt.
Enables reuse across projects, reduces API spend.
System checks DB before generating — if similar image exists, reuse it.

### FREE TOOL — SEO SCANNER
Cloud-based version of the site audit system. Tiered access.
Free: 3 scans/month + basic SEO report.
Paid: unlimited + full 130-point audit + preset preview.
Goal: demonstrate failures → upsell fix + new website.

### FREE TOOL — SITE PREVIEW BUILDER
Scans visitor's site (content, colors, branding, industry).
Visitor chooses a preset from the gallery.
System rebuilds 1-2 pages in that preset with their content.
Loading animations while building. Notify when done.
Goal: let them SEE what their site could look like → contract to build it.

### COMPONENT/ANIMATION GALLERY
Mini 21st.dev — curated gallery of premium animations and UI components.
5-10 examples per category. Visual/video demos.
Message: "This is custom, not stock. You choose exactly what you want."
Once a paid customer, direct them to 21st.dev to pick components for their site.
