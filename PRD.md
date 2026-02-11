# PRD — Ineffable Website Redesign
## Product Requirements Document

> **Version:** 1.0
> **Date:** 2026-02-11
> **Status:** Approved for Build

---

## 1. Executive Summary

Redesign the existing single-page portfolio into a full multi-page business website for **Ineffable** — a custom software, web design, and consulting practice. The site itself must be the #1 portfolio piece: premium, interactive, technically impressive, and conversion-optimized.

**From:** Static single-page HTML portfolio ("Operations Architect")
**To:** Multi-page Astro site with page transitions, interactive persona selector, service-specific pages, and lead generation

---

## 2. Technical Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Astro 4+** | Static-first, islands for interactivity, file-based routing |
| Interactive Islands | **React** (via `@astrojs/react`) | Jarvis selector, dynamic components |
| Animation | **GSAP** + **ScrollTrigger** | Industry-standard, performant scroll animations |
| Page Transitions | **Astro ViewTransitions** | Native Astro feature, smooth page morphs |
| Styling | **CSS (custom properties)** | Existing design system, no utility framework needed |
| Fonts | Outfit + JetBrains Mono (Google Fonts) | Established brand typography |
| Hosting | **Netlify** | Free tier, static hosting, form handling |
| Package Manager | **npm** or **pnpm** | Standard Astro tooling |

---

## 3. Project Structure

```
C:\Users\ainef\Portfolio\
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── CLAUDE.md
├── PRD.md
│
├── public/                          # Static assets (copied as-is)
│   ├── assets/
│   │   ├── videos/                  # Demo videos
│   │   ├── screenshots/             # Project screenshots
│   │   └── images/                  # General images
│   ├── styles/                      # 9 style preset HTML files (standalone)
│   │   ├── index.html
│   │   ├── bold-playful.html
│   │   ├── ... (all 9 presets)
│   │   └── images/
│   └── freebies/                    # Lead magnet files (standalone)
│       ├── landing-pages/
│       ├── individual-downloads/
│       ├── download-package/
│       ├── images/
│       └── orchestrator-template-bundle/
│
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro         # Shared HTML shell: head, nav, footer, transitions
│   │
│   ├── components/
│   │   ├── Nav.astro                # Sticky nav with mobile drawer
│   │   ├── Footer.astro             # Site footer
│   │   ├── CTA.astro                # Reusable CTA block (Calendly)
│   │   ├── SectionLabel.astro       # Consistent section label component
│   │   ├── Card.astro               # Service/project card with 3D tilt
│   │   ├── ComingSoon.astro         # Coming soon template (teaser + email + CTA)
│   │   ├── BackgroundEffects.astro  # Grid, orbs, noise overlay
│   │   ├── MagneticCursor.astro     # Custom cursor (desktop only)
│   │   ├── TextReveal.astro         # Animated text entrance
│   │   ├── ScrollReveal.astro       # GSAP scroll-triggered wrapper
│   │   │
│   │   └── islands/                 # React interactive components
│   │       ├── JarvisSelector.tsx   # Persona selector + voice toggle
│   │       ├── EmailCapture.tsx     # Email capture form
│   │       └── VaultAccordion.tsx   # Expandable project vault
│   │
│   ├── pages/
│   │   ├── index.astro              # HOME
│   │   ├── automation.astro         # CUSTOM AUTOMATION
│   │   ├── websites.astro           # TAILORED WEBSITES
│   │   ├── platforms.astro          # CUSTOM PLATFORMS
│   │   ├── consulting.astro         # CONSULTING
│   │   ├── blog.astro               # BLOG index
│   │   ├── blog/[slug].astro        # Individual blog posts
│   │   ├── resources.astro          # RESOURCES / FREE GUIDES
│   │   └── tools.astro              # FREE TOOLS (Coming Soon)
│   │
│   ├── content/                     # Markdown content (Astro Content Collections)
│   │   ├── blog/                    # Blog posts as .md files
│   │   └── projects/                # Project case studies as .md files
│   │
│   ├── data/
│   │   ├── services.ts              # Service definitions
│   │   ├── projects.ts              # Project data (migrated from vault)
│   │   ├── quickwins.ts             # Quick wins data
│   │   └── stats.ts                 # Stats/numbers
│   │
│   └── styles/
│       ├── global.css               # CSS variables, reset, base styles
│       ├── animations.css           # GSAP-compatible animation classes
│       └── utilities.css            # Reusable utility classes
│
├── reference/                       # Keep for reference (not deployed)
│   ├── index.html                   # Original v1 site (preserved)
│   ├── career_comparison.html
│   └── coo_profile.html
│
└── tools/                           # Python tools (not deployed)
    ├── generate_image.py
    └── ...
```

---

## 4. Page Specifications

### 4.1 HOME (/)

**Purpose:** Power overview that routes visitors to the right service. The site's strongest page.

**Sections (in order):**

1. **Hero**
   - Ineffable logo animation (I → Ineffable expand)
   - Tagline: "Custom Software. Tailored Websites. Zero Busywork."
   - Jarvis persona selector (React island):
     - "Who are you?" prompt with options: Solo Entrepreneur / Team Manager / Business Owner / Employee / Just Browsing
     - Voice toggle button ("Enable Voice Guide")
     - Selection saves to localStorage, adapts content order below
     - Skip option → default full-site view
     - Persistent toggle: "Viewing as: [Role] | Switch to Full Site"
   - CTAs: "See What I Build" / "Book a Call"

2. **Service Overview Cards**
   - 4 cards linking to service pages
   - Each card: icon + title + one-line description + hover animation
   - Order adapts based on Jarvis selection

3. **Social Proof / Stats Bar**
   - 9+ Years | 10+ Systems Built | 500+ Automation Rules | 91% Video Production Savings
   - Animated count-up on scroll

4. **Featured Case Studies** (2-3 highlights)
   - BCE Owner Dashboard (with screenshot)
   - Video Content Factory (with TikTok screenshot)
   - OneKey Writer (with video embed)
   - Each: image/video + title + 2-line description + "Read More" → service page

5. **The Reality / Time Savings**
   - Migrated math breakdown section
   - Employee A/B/C comparison → hours lost → gold "six full work weeks" callout
   - "Now multiply across your whole team" closer

6. **CTA Section**
   - "Tell Me Your Repetitive Task" heading
   - Calendly popup button
   - "Or explore what I build" with links to services

### 4.2 CUSTOM AUTOMATION (/automation)

**Purpose:** The #1 selling point. Walk visitors from "save 30 min" to "transform your entire operation."

**Sections:**

1. **Hero** — "Stop Doing What a Script Can Do"
2. **The Small Wins Ladder** — Three tiers visualized:
   - Tier 1: Quick Scripts (macros, file sorters, email generators) — "Saves 30 min/day"
   - Tier 2: Connected Automations (APIs, scrapers, multi-tool flows) — "Saves hours/day"
   - Tier 3: Full Automation Systems (end-to-end, AI-integrated) — "Saves entire roles"
3. **Common Use Cases** — Grid of relatable scenarios (report building, data entry, copy-paste between systems, file formatting, email responses, etc.)
4. **Video Demo Section** — Screen recordings of automations running (placeholder until videos created)
5. **Quick Wins** — Migrated 6 quick-win cards
6. **The Bigger Picture** — "Connect the small wins into a system" narrative → links to Custom Platforms
7. **CTA**

### 4.3 TAILORED WEBSITES (/websites)

**Purpose:** Show what web design looks like when done by someone who builds custom software, not just themes.

**Sections:**

1. **Hero** — "Your Website Should Work as Hard as You Do"
2. **Style Presets Gallery** — 9 presets as interactive cards with live preview links
   - Embed thumbnails or iframe previews
   - "Pick a style. I'll build it for you."
3. **Component/Animation Gallery** — Coming Soon treatment initially
   - Curated examples: scroll effects, hover interactions, loading animations
   - 5-10 per category, visual demos
4. **SEO Tiers** — Three-column pricing comparison
   - Free SEO Scan (Coming Soon — email capture)
   - 130-Point Audit
   - 130-Plus Enterprise Audit
5. **Process** — How a website gets built: Discovery → Design → Build → SEO → Launch → Maintain
6. **"You Show Us, We Build It"** — Copy about custom sites matching their vision
7. **CTA**

### 4.4 CUSTOM PLATFORMS (/platforms)

**Purpose:** Show the "full system" capability — dashboards, team tools, complete business platforms.

**Sections:**

1. **Hero** — "Not Just a Website. A System."
2. **What's a Platform?** — Visual explainer: dashboard + database + AI + integrations + user management
3. **Case Study: BCE Owner Dashboard** — Rich layout with screenshot, feature list, stats (500+ rules, 85% faster, 130+ hrs saved)
4. **Case Study: Receipt Tool → Office Platform** — Story of turning a simple automation into a full team tool
5. **Tech Stack Overview** — What technologies power these platforms (visual, not text-heavy)
6. **CTA**

### 4.5 CONSULTING (/consulting)

**Purpose:** Position as the expert who listens, diagnoses, and recommends — not just builds.

**Sections:**

1. **Hero** — "I've Sat in Your Seat"
2. **What I Cover** — AI strategy, ops optimization, automation roadmapping, team alignment, tool selection
3. **Who It's For** — Four persona cards: Employee / Manager / C-Suite / Owner — each with typical pain points
4. **How It Works** — Discovery Call → Assessment → Roadmap → (optional) Build
5. **Tiers & Pricing** — Coming Soon treatment if not finalized; otherwise 2-3 tier cards
6. **Background** — Brief ops management credentials, the "I manage AND build" differentiator
7. **CTA**

### 4.6 BLOG (/blog)

**Purpose:** LinkedIn content repurposed. Thought leadership and SEO.

- Blog index with card grid (title, date, excerpt, category tag)
- Individual post pages from Markdown (Astro Content Collections)
- Categories/tags for filtering
- Sidebar or bottom: related posts + CTA

### 4.7 RESOURCES (/resources)

**Purpose:** Lead magnets and downloadables.

- Three guide cards (existing): Orchestrator Blueprint, Build Tools Not Rent, DIY Automation Kit
- Each links to existing landing page HTMLs in `/freebies/`
- Orchestrator Template Bundle download
- Section for future downloadables

### 4.8 FREE TOOLS (/tools) — Coming Soon

**Purpose:** Tease upcoming interactive tools. Capture emails.

- ComingSoon component with:
  - SEO Scanner teaser + email capture
  - Site Preview Builder teaser + email capture
  - "Want this now? Book a call and I'll do it manually for you."

---

## 5. Shared Components Spec

### Nav
- Sticky, blurs on scroll (existing behavior)
- Logo: "Ineffable" in JetBrains Mono with golden "I" dot
- Links: Custom Automation | Tailored Websites | Custom Platforms | Consulting | Blog | Resources
- CTA button: "Book a Call" (gold border, fill on hover)
- Mobile: hamburger → full-screen overlay with staggered link animations

### Footer
- Logo + tagline
- Nav links repeated
- Social: LinkedIn
- Calendly link
- Copyright

### CTA Block
- Reusable across all pages
- Heading (customizable per page)
- Calendly popup button
- Secondary text link

### Background Effects
- Fixed grid overlay
- 3 floating gradient orbs (cursor-reactive on desktop)
- Noise texture overlay
- Applied globally via BaseLayout

### Magnetic Cursor
- Custom cursor (desktop only, hidden on mobile)
- Grows/morphs on hover over interactive elements
- Magnetic pull toward buttons/links

---

## 6. Animation Standards

| Trigger | Animation | Library |
|---------|-----------|---------|
| Page load | Logo reveal (I → Ineffable) | GSAP Timeline |
| Scroll into view | Fade up + stagger for groups | GSAP ScrollTrigger |
| Page navigation | ViewTransition (morph/clip-path) | Astro ViewTransitions |
| Hover on cards | 3D tilt + glow | Vanilla JS (mousemove) |
| Hover on buttons | Liquid/elastic fill | CSS + GSAP |
| Hover on nav links | Underline draw | CSS |
| Stats section | Count-up animation | GSAP / Intersection Observer |
| Text headings | Character or line reveal | GSAP SplitText or manual |
| Cursor | Magnetic pull + morph | Vanilla JS |

**Performance rules:**
- All animations use `transform` and `opacity` only (GPU-accelerated)
- ScrollTrigger uses `will-change: transform` sparingly
- Animations disabled for `prefers-reduced-motion`
- No animation blocks interaction (non-blocking)

---

## 7. Responsive Breakpoints

| Breakpoint | Target |
|-----------|--------|
| 1400px+ | Full desktop (max-width container) |
| 1024px | Tablet landscape / small desktop |
| 768px | Tablet portrait |
| 480px | Mobile |

**Mobile-specific:**
- Touch targets: minimum 44x44px
- No custom cursor
- Hamburger → full-screen nav overlay
- Fluid typography via `clamp()`
- Thumb-zone CTA placement (bottom third)
- Swipe gestures for galleries (Phase 2)

---

## 8. Performance Budget

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Total JS (initial) | < 100KB gzipped |
| Total CSS | < 50KB gzipped |
| Largest image | < 200KB (WebP/AVIF) |
| Lighthouse score | 90+ across all categories |

---

## 9. Build Order

### Sprint 1: Foundation
1. Initialize Astro project with config
2. Install dependencies (GSAP, React integration)
3. Create BaseLayout with ViewTransitions
4. Build global CSS (variables, reset, utilities, animations)
5. Build BackgroundEffects component
6. Build Nav component (desktop + mobile)
7. Build Footer component
8. Build reusable components: CTA, Card, SectionLabel, TextReveal, ScrollReveal, ComingSoon

### Sprint 2: Homepage
1. Build homepage hero with Ineffable logo animation
2. Build JarvisSelector React island
3. Build service overview cards section
4. Build stats bar with count-up
5. Build featured case studies section (migrate BCE, Video Factory, OneKey)
6. Build time savings math section (migrate from v1)
7. Build homepage CTA section

### Sprint 3: Service Pages
1. Build Custom Automation page (all sections)
2. Build Tailored Websites page (integrate style presets gallery)
3. Build Custom Platforms page (BCE case study, receipt tool story)
4. Build Consulting page

### Sprint 4: Content & Polish
1. Build Blog index + post template (Content Collections)
2. Build Resources page
3. Build Free Tools Coming Soon page
4. Migrate all content from v1 index.html
5. Add MagneticCursor component
6. Polish all animations and transitions
7. Mobile testing and responsive fixes
8. Performance optimization (image compression, lazy loading)
9. SEO: meta tags, OG images, sitemap, robots.txt

### Sprint 5: Launch
1. Final cross-browser testing
2. Deploy to Netlify
3. Verify all links, Calendly, video playback
4. Move v1 index.html to reference/
5. Update DNS/domain if applicable

---

## 10. Content Migration Map

| V1 Section | New Location |
|-----------|-------------|
| Hero (title, tagline, stats, CTAs) | Home hero |
| About (philosophy + timeline) | Consulting page (background section) + Home |
| Time Savings math | Home (section 5) |
| BCE Dashboard showcase | Home (featured) + Platforms page (case study) |
| Video Content Factory showcase | Home (featured) + Automation page |
| OneKey Writer showcase | Home (featured) |
| The Vault (10 projects) | Automation + Platforms pages (distributed by type) |
| Quick Wins (6 cards) | Automation page |
| Services (6 cards) | Home (service overview) — restructured to 4 |
| Free Resources (3 guides) | Resources page |
| CTA section | Every page (reusable CTA component) |
| Style presets gallery | Websites page + keep `/styles/` standalone |

---

## 11. Success Criteria

- [ ] All 8 pages render and route correctly
- [ ] Jarvis selector works with localStorage persistence
- [ ] Page transitions are smooth (no flash of unstyled content)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Mobile experience is flawless (no horizontal scroll, proper touch targets)
- [ ] Lighthouse 90+ on all pages
- [ ] All v1 content is migrated (nothing lost)
- [ ] Calendly integration works
- [ ] Style presets gallery accessible from Websites page
- [ ] Coming Soon pages capture emails
- [ ] Site deploys successfully to Netlify

---

## 12. Progress Tracker (Updated 2026-02-11)

### What's Built (Complete)

#### Sprint 1: Foundation — DONE
- [x] Astro 5 project initialized with config (`astro.config.mjs`)
- [x] Dependencies: GSAP, React, Sitemap (`package.json`)
- [x] `BaseLayout.astro` — ViewTransitions, global GSAP scroll reveal system
- [x] `global.css` — Full design system (variables, reset, typography, grids, animations)
- [x] `BackgroundEffects.astro` — Grid, 3 orbs, noise, **mouse spotlight glow** (gold, 0.15 opacity)
- [x] `Nav.astro` — Sticky nav, scroll blur, mobile hamburger, active states
- [x] `Footer.astro` — 3-column footer with all links
- [x] `CTA.astro` — Reusable Calendly CTA block
- [x] `SectionLabel.astro` — Mono-font section labels (gold/cyan/green)
- [x] `ComingSoon.astro` — Coming soon template

#### Sprint 3: Service Pages — Partial (pages exist, content varies)
- [x] `/automation` — page exists with content
- [x] `/websites` — page exists with style presets gallery
- [x] `/platforms` — page exists with content
- [x] `/consulting` — page exists with content
- [x] `/resources` — page exists with guide cards
- [x] `/tools` — Coming Soon page

#### Sprint 4: Content — Partial
- [x] Blog index (`/blog`) — pulls from Content Collections, 2-col card grid
- [x] Blog posts (`/blog/[slug]`) — 4 full articles, 720px reading layout, prev/next nav, tags
- [x] `content.config.ts` — Astro 5 content layer with blog collection schema
- [x] Style presets — all 10 HTML files have "Back to Ineffable" nav bar
- [x] Sitemap generation via `@astrojs/sitemap`
- [x] SEO meta tags in BaseLayout (OG, Twitter, canonical, robots)

### What's NOT Built (Next Steps)

#### Sprint 2: Homepage — BUILT (found during audit, was already complete)
- [x] Homepage hero with logo animation (I → Ineffable expand), tagline, CTAs
- [x] Service overview cards (4 cards from `services.ts`, linked to service pages)
- [x] Stats bar (4 stats from `stats.ts`) — TODO: count-up animation
- [x] Featured case studies (BCE Dashboard, Video Factory, OneKey Writer from `stats.ts`)
- [x] Time savings math section ("The Reality" — Employee A/B/C comparison)
- [x] Homepage CTA section ("Tell Me Your Repetitive Task")
- [x] Background fix: `.reality-section` changed to `transparent` (was blocking BackgroundEffects)
- [x] Blog click-outside: clicking empty areas on blog post pages now navigates back to `/blog`

#### Jarvis Persona Selector — DEFERRED
- Code exists (`JarvisSelector.tsx`, `personas.ts`, `jarvis.css`) but **removed from render**
- Needs homepage sections built first so there's content to reorder
- Re-enable in `BaseLayout.astro` once Sprint 2 lands

#### Components Not Yet Built
- [ ] `Card.astro` — Service/project card with 3D tilt effect
- [ ] `MagneticCursor.astro` — Custom cursor (desktop only)
- [ ] `TextReveal.astro` — GSAP SplitText character reveal
- [ ] `ScrollReveal.astro` — GSAP scroll-triggered wrapper component
- [ ] `EmailCapture.tsx` — Email capture form (React island)
- [ ] `VaultAccordion.tsx` — Expandable project vault (React island)

#### Content Migration (from v1 `index.html`)
- [ ] Hero content (title, tagline, stats, CTAs)
- [ ] About section → Consulting page background
- [ ] Time Savings math breakdown → Homepage section 5
- [ ] BCE Dashboard showcase → Homepage featured + Platforms case study
- [ ] Video Content Factory → Homepage featured + Automation page
- [ ] OneKey Writer → Homepage featured
- [ ] The Vault (10 projects) → Distributed across Automation + Platforms pages
- [ ] Quick Wins (6 cards) → Automation page
- [ ] Services (6 cards) → Homepage (restructured to 4)

#### Service Page Content Enrichment
- [ ] Automation page — needs video demo section, more use case detail
- [ ] Websites page — needs component/animation gallery, SEO tiers pricing
- [ ] Platforms page — needs BCE case study deep-dive, receipt tool story
- [ ] Consulting page — needs persona pain points, tiers/pricing, background section

#### Animation Enhancements
- [ ] Logo reveal animation (I → Ineffable)
- [ ] Stats count-up on scroll
- [ ] Card 3D tilt + glow on hover
- [ ] Button liquid/elastic fill
- [ ] Text heading character/line reveal

#### Blog Enhancements
- [ ] Category/tag filtering on blog index
- [ ] Related posts at bottom of post pages
- [ ] More blog content (ongoing)

#### Sprint 5: Launch
- [ ] Performance optimization (image compression, lazy loading, WebP/AVIF)
- [ ] Lighthouse audit (target 90+)
- [ ] Cross-browser testing
- [ ] Deploy to Netlify
- [ ] Verify all links, Calendly, video playback
- [ ] OG images for social sharing

---

## 13. Next Sprint — Detailed Task Instructions (2026-02-11)

> **IMPORTANT:** These are engineering-ready instructions. Each task has enough detail for a fresh Claude session or sub-agent to execute without prior context. Read `PRD.md` Sections 1-12 for full background.

---

### TASK A: BCE Portfolio Rename + Video Recording
**Priority:** High | **Type:** Content + Chrome MCP
**Why:** The portfolio showcase currently says "Best Clean Ever" which looks unprofessional on video. Need a recorded demo video instead of a static screenshot.

**Steps:**
1. Open `C:\Users\ainef\Portfolio\src\pages\platforms.astro` — find all references to "Best Clean Ever" or "BCE"
2. Also check `src/data/stats.ts` (has project data including BCE)
3. Also check `src/pages/index.astro` for any BCE references
4. Rename to something professional — e.g. "CleanOps Dashboard" or "Owner Command Center" (user to confirm)
5. The BCE dashboard is a real project at a URL the user can provide. If accessible, use Chrome MCP to:
   - Navigate to the dashboard
   - Record a GIF/video walkthrough showing key features (use `gif_creator` tool)
   - Save the recording to `public/assets/videos/`
6. Replace the static screenshot reference with a `<video>` tag or embedded GIF in the page

**Files to edit:** `platforms.astro`, `index.astro`, `stats.ts`, any component referencing BCE

---

### TASK B: Freebie SaaS Template (Lead Magnet)
**Priority:** Medium | **Type:** Content creation
**Why:** The resources page offers downloadable guides. Add a SaaS starter kit as a freebie — but NOT the full `~/.claude/` codebase. Just enough to tease value and upsell consulting.

**What to create in `public/freebies/saas-starter/`:**
1. `README.md` — "SaaS Starter Kit by Ineffable" with overview of what's included
2. `PRD-TEMPLATE.md` — A blank PRD template based on the format in this project's PRD (sanitized, no client data)
3. `TECH-STACK-GUIDE.md` — Recommended stack (Next.js + Supabase + Vercel + Polar) with brief rationale for each
4. `AUTH-CHEATSHEET.md` — Quick reference for Supabase auth patterns (signup, login, RLS policies) — 1-2 pages max
5. `DB-SCHEMA-EXAMPLE.sql` — A sample Supabase schema for a generic SaaS (users, subscriptions, projects tables)
6. `DEPLOY-CHECKLIST.md` — Step-by-step Vercel deployment checklist
7. **DO NOT include:** Full orchestrator template, actual project code, API keys, or anything from `~/.claude/`

**Then update** `src/pages/resources.astro` to add a card for "SaaS Starter Kit" linking to a landing page or download.

---

### TASK C: Small Automation Demo Videos
**Priority:** High | **Type:** Code + Recording
**Why:** The automation page (`/automation`) needs video proof. Create 5 real micro-automations with demo data, run them, and record screen captures.

**Create directory:** `C:\Users\ainef\Portfolio\automation-demos\`

**Demo 1: File Organizer**
- `file_organizer.py` — Watches a folder, sorts files by extension into subfolders (PDFs → /documents, images → /images, etc.)
- Create `demo-files/` with 15-20 dummy files (mix of .pdf, .jpg, .xlsx, .docx, .csv)
- Record: Run script, show files getting sorted in real-time

**Demo 2: Email Report Generator**
- `report_generator.py` — Reads a CSV of sales data, generates a formatted summary with totals/averages, outputs as HTML
- Create `sample-data/sales_q1.csv` with 50 rows of fake sales data
- Record: Run script, show CSV → HTML report generation

**Demo 3: Invoice Renamer**
- `invoice_renamer.py` — Reads PDF filenames, extracts date/vendor patterns, renames to `YYYY-MM-DD_VendorName.pdf`
- Create 10 dummy PDFs with messy names like `scan001.pdf`, `INV-2026-feb.pdf`
- Record: Show before/after of file names

**Demo 4: Data Deduplicator**
- `deduplicator.py` — Reads a CSV with duplicate rows, identifies and removes duplicates, outputs clean version
- Create `contacts_messy.csv` with ~100 rows including ~20 duplicates
- Record: Run script, show duplicate count and cleaned output

**Demo 5: Slack-Style Daily Digest**
- `daily_digest.py` — Reads multiple data sources (2-3 CSVs), generates a formatted daily summary markdown
- Create sample CSVs (tasks completed, support tickets, revenue)
- Record: Run script, show the generated digest

**After creating all demos:**
1. Use Chrome MCP `gif_creator` or screen recording to capture each demo running
2. Save recordings to `public/assets/videos/automation-demos/`
3. Update `src/pages/automation.astro` — add a "See It In Action" video gallery section with all 5 demos
4. Each demo card: title, one-line description, video/GIF embed, "View Source" link to GitHub (optional)

---

### TASK D: Blog Click-Outside Fix
**Priority:** High | **Type:** Quick code fix
**Why:** When viewing a blog post at `/blog/[slug]`, clicking outside the content area should navigate back to `/blog`. Currently nothing happens.

**File:** `src/layouts/BlogPostLayout.astro`

**Implementation:**
1. The blog post content is inside `.post-body` with max-width 720px centered
2. Add a click handler on the `<article class="blog-post">` element
3. If the click target is the article itself (not a child), navigate to `/blog`
4. Don't interfere with clicks on links, text selection, or content interaction
5. The existing "Back to Blog" link at top already works — keep that too

**Code approach:**
```html
<script>
  function initBlogClickOutside() {
    const article = document.querySelector('.blog-post');
    if (!article) return;
    article.addEventListener('click', (e) => {
      // Only trigger if clicking the article background, not content
      if (e.target === article || e.target === article.querySelector('.post-body')) {
        window.location.href = '/blog';
      }
    });
  }
  initBlogClickOutside();
  document.addEventListener('astro:after-swap', initBlogClickOutside);
</script>
```

Add `cursor: pointer` on `.blog-post` areas outside the reading column, and `cursor: auto` on `.container-reading`.

---

### TASK E: Fix Homepage Background Consistency
**Priority:** High | **Type:** Quick code fix
**Why:** On the homepage (`/`), the background effects (grid, orbs, noise, spotlight) stop after the OneKey Writer section. Below that ("The Reality" section), it becomes a flat dark background. The effects should run top-to-bottom on ALL pages.

**Diagnosis:** `BackgroundEffects.astro` uses `position: fixed; inset: 0; z-index: -1` which should cover the full viewport. The issue is likely that a section on the homepage has `background: var(--bg-deep)` or similar that covers the fixed background.

**Fix:**
1. Open `src/pages/index.astro`
2. Find sections after OneKey Writer (likely "The Reality" / time-savings section)
3. Remove or change any `background` property that creates an opaque layer
4. Sections should use `background: transparent` or no background at all
5. If cards/containers need backgrounds, use `var(--bg-card)` which is semi-transparent
6. Test by scrolling the entire homepage — the grid/orbs should be visible behind all sections

---

### TASK F: Time Savings Math Section Visual Upgrade
**Priority:** Medium | **Type:** Design + Image Generation
**Why:** The "You're Losing More Time Than You Think" section has a basic box layout. Need a premium infographic-style visual.

**Approach:** Use the `nano-banana-pro` skill (Gemini image generation) to create a dark-themed pictograph/infographic.

**Image prompt concept:**
- Dark background (#050508) matching site theme
- Gold (#ffc13b) accent color for key numbers
- Cyan (#00e5ff) for secondary data
- Show: 3 employee silhouettes (A, B, C) with time bars
- Employee A: 45 min/day lost (small bar)
- Employee B: 90 min/day lost (medium bar)
- Employee C: 2+ hrs/day lost (large bar)
- Bottom callout: "= 6 Full Work Weeks Per Year" in gold
- Clean, minimal, infographic style (not clipart)

**After generating:**
1. Save to `public/assets/images/time-savings-infographic.webp`
2. Update the time-savings section in `src/pages/index.astro` to use the image
3. Keep the math text as supporting copy below/beside the image

---

### TASK G: Homepage Sprint 2 Build
**Priority:** CRITICAL | **Type:** Full page build
**Why:** The homepage is the front door. Currently minimal. Needs all 6 sections from PRD Section 4.1.

**Reference:** Read PRD Section 4.1 for full spec. Read `src/pages/index.astro` for current state. Read `src/data/stats.ts` and `src/data/services.ts` for existing data.

**Sections to build (in order):**

**1. Hero Section**
- Large heading: "Custom Software. Tailored Websites. Zero Busywork."
- Subtitle text explaining what Ineffable does
- Two CTAs: "See What I Build" (scrolls to services) + "Book a Call" (Calendly link)
- Use existing `reveal` classes for entrance animation
- Skip the logo animation for now (add later)
- Skip Jarvis selector for now (deferred)

**2. Service Overview Cards**
- Import services from `src/data/services.ts`
- 4 cards in a grid: Custom Automation, Tailored Websites, Custom Platforms, Consulting
- Each card: icon + title + one-line description + link to service page
- Use `.card` class from global CSS + hover effects
- Add `data-delay` stagger for scroll reveal

**3. Stats Bar**
- Import stats from `src/data/stats.ts`
- Horizontal bar with 4 stats: 9+ Years | 10+ Systems Built | 500+ Automation Rules | 91% Video Savings
- Use mono font for numbers, dim text for labels
- TODO comment for count-up animation (implement later)

**4. Featured Case Studies**
- Import projects from `src/data/stats.ts` (has `projects` array with BCE, Video Factory, OneKey)
- 2-3 cards with: title, description, stats, link to relevant service page
- Use screenshots from `public/assets/screenshots/` if they exist, placeholder if not
- Alternate layout (image left/right) for visual variety

**5. Time Savings Section ("The Reality")**
- Migrate the math breakdown from v1 `reference/index.html`
- Employee A/B/C comparison showing hours lost per day
- Gold callout: "That's six full work weeks per year"
- "Now multiply across your whole team"
- Use the infographic image from Task F if available, otherwise build with HTML/CSS

**6. CTA Section**
- Use the existing `<CTA>` component
- Heading: "Tell Me Your Repetitive Task"
- Calendly button

**Ensure all sections:**
- Have `id` attributes matching persona `sectionOrder` values from `src/data/personas.ts`
- Use `reveal` classes for scroll animations
- Are fully responsive (test 1024/768/480 breakpoints)
- Have transparent backgrounds so BackgroundEffects shows through

---

### TASK H: V1 Content Migration
**Priority:** High | **Type:** Content extraction + placement
**Why:** The original site at `reference/index.html` has production copy that shouldn't be rewritten — it should be migrated.

**Steps:**
1. Read `C:\Users\ainef\Portfolio\reference\index.html` (the v1 site)
2. Extract each content section and map to new location per PRD Section 10:
   - Hero copy → `index.astro` hero section
   - About/philosophy → `consulting.astro` background section
   - Time savings math → `index.astro` section 5
   - BCE showcase → `index.astro` featured + `platforms.astro` case study
   - Video Factory showcase → `index.astro` featured + `automation.astro`
   - OneKey Writer → `index.astro` featured
   - Vault projects → distribute across `automation.astro` + `platforms.astro`
   - Quick Wins → `automation.astro`
   - Services → `index.astro` service cards (restructure from 6 to 4)
   - Resources → already on `resources.astro`
3. Preserve the exact copy/stats — don't rewrite, just place in new components
4. Note any images/screenshots referenced and ensure they exist in `public/assets/`

---

### TASK I: Service Page Enrichment
**Priority:** Medium | **Type:** Page builds
**Why:** Each service page exists but needs full section content per PRD Sections 4.2-4.5.

**For each page, read the PRD section and build ALL listed sections:**

**Automation (`/automation`) — PRD 4.2:**
- Hero, 3-tier ladder visualization, use cases grid, video demos (from Task C), quick wins, bigger picture narrative, CTA

**Websites (`/websites`) — PRD 4.3:**
- Hero, style presets gallery (already exists), component gallery (Coming Soon), SEO tiers pricing, process timeline, custom build copy, CTA

**Platforms (`/platforms`) — PRD 4.4:**
- Hero, "What's a Platform?" visual explainer, BCE case study deep-dive, receipt tool story, tech stack overview, CTA

**Consulting (`/consulting`) — PRD 4.5:**
- Hero, what I cover list, persona pain point cards, how it works process, tiers (Coming Soon), background/credentials, CTA

---

### TASK J: Animation Polish
**Priority:** Low (after content is in place) | **Type:** Code
**Why:** Animations enhance the premium feel but need content first.

**Items:**
1. **Stats count-up** — In the stats bar on homepage, use GSAP to count numbers from 0 to target value when scrolled into view. Use `Intersection Observer` or `ScrollTrigger`. Numbers should animate over 2s with `power2.out` easing.
2. **Card 3D tilt** — On `.card` elements, add mousemove handler that applies `transform: perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)` based on cursor position relative to card center. Reset on mouseleave. Desktop only.
3. **Logo reveal** — On homepage load, animate the nav logo: start with just the gold dot, then expand to show "Ineffable" text sliding in from left. Use GSAP timeline, 1.5s total.
4. **MagneticCursor.astro** — Create component: custom cursor (8px gold dot + 44px ring). Follows mouse with slight delay (GSAP). Ring grows on hover over interactive elements. Hide on mobile (`pointer: fine` check). Add to `BaseLayout.astro`.

---

### Status (Updated end of session 2026-02-11)

| Task | Status | Notes |
|------|--------|-------|
| **D** Blog click-outside | **DONE** | Script added to `BlogPostLayout.astro` |
| **E** Background fix | **DONE** | `.reality-section` set to `transparent` in `index.astro` line 294 |
| **G** Homepage build | **ALREADY DONE** | Was built — all 6 sections exist in `index.astro`. Includes hero, services, stats, projects, time savings, CTA |
| **H** V1 content migration | **MOSTLY DONE** | Content is already in the new pages. Check `reference/index.html` for anything missed |
| **A** BCE rename + video | **TODO** | Need user's preferred new name. Then record video via Chrome MCP |
| **B** Freebie SaaS template | **TODO** | Create 6 markdown files in `public/freebies/saas-starter/`, update `resources.astro` |
| **C** Automation demos | **TODO** | Create 5 Python scripts with fake data in `automation-demos/`, record GIFs, add video gallery to `automation.astro` |
| **F** Time savings visual | **TODO** | Use `nano-banana-pro` skill to generate dark-themed infographic, replace math box in `index.astro` |
| **I** Service page enrichment | **TODO** | Each service page needs full sections per PRD 4.2-4.5 |
| **J** Animation polish | **TODO** | Count-up stats, 3D card tilt, magnetic cursor. Do LAST after content |

### Next Session Start Command
```
Read C:\Users\ainef\Portfolio\PRD.md Section 13 for detailed task instructions.
Tasks A-J are fully documented with file paths, code snippets, and step-by-step instructions.
Pick up from the TODO items in the status table above.
Run Task C (automation demos) and Task B (freebie) in parallel via team/agents.
Task F (infographic) needs the nano-banana-pro skill.
Task A needs user input on BCE rename.
```
