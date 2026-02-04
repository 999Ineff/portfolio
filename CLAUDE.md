# Portfolio Project

> **Status:** Ready for Deployment
> **Last Updated:** 2026-02-03
> **Purpose:** Client-facing portfolio website to showcase automation/ops skills and get clients

---

## What This Project Is

A personal portfolio site for positioning as an **Operations Architect** - someone who bridges operations management with technical building capabilities. Target clients: small businesses, solo entrepreneurs, employees who need automation.

**Tagline:** "From Spreadsheets to Systems"
**Core Message:** "I build what others outsource"

---

## Current State

### Completed
- [x] Full HTML/CSS/JS portfolio site (`index.html`)
- [x] Dark mode "Digital Command Center" design with gold/cyan/green accents
- [x] Responsive layout
- [x] Scroll animations and hover interactions
- [x] All content sections structured
- [x] Accordion-style vault with 10 projects
- [x] "You're Losing More Time Than You Think" math breakdown section
- [x] Calendly integration (popup widget)
- [x] LinkedIn link updated
- [x] Stats updated: 9+ Years, 10+ Systems Built, 500+ Automation Rules, 91% Video Production Savings
- [x] Video demos with playback controls
- [x] Free Resources section with 3 lead magnet guides
- [x] Orchestrator Template Bundle (downloadable)

### Lead Magnets Created (`freebies/`)
1. **01-ai-orchestrator-blueprint.html** (Advanced)
   - Full guide on project orchestration, CLAUDE.md, 9-stage pipeline
   - Includes downloadable template bundle with Python tools
   - Generated images: cover, ecosystem diagram, hybrid pipeline

2. **02-build-tools-not-rent.html** (Intermediate)
   - "AI should build tools, not be the tool" philosophy
   - Real examples and cost comparisons
   - Generated images: cover, build flow diagram

3. **03-diy-automation-starter-kit.html** (Beginner)
   - 10 ready-to-use prompts for any AI
   - Copy-paste templates for common tasks
   - Generated images: cover, process flow

### Orchestrator Template Bundle (`freebies/orchestrator-template-bundle/`)
Complete downloadable template including:
- `.claude/CLAUDE.md` - Main orchestrator template
- `.claude/WORK_QUEUE.md` - Task tracking
- `.claude/PIPELINE_STATE.md` - Progress tracking
- `.claude/SESSIONS.lock` - Session management
- `.claude/DECISIONS.md` - Decision log
- `tools/new_project.py` - Scaffold new projects
- `tools/update_state.py` - Safe state file updates
- `tools/parse_plan.py` - Dependency analysis
- `examples/sample-project-config.md` - Example configuration
- `README.md` - Quick start guide
- `ALTERNATIVES.md` - Guide for non-Claude Code users

### Remaining Tasks
- [ ] Deploy to Netlify
- [ ] Test all links after deployment
- [ ] Consider generating hero images with Gemini API (optional)

---

## Site Structure

```
index.html
├── Hero Section
│   ├── "Operations Architect" title
│   ├── "From Spreadsheets to Systems" tagline
│   ├── Stats: 9+ Years, 10+ Systems, 500+ Rules, 91% Savings
│   └── CTAs: "See My Work" / "Book a Call"
│
├── About Section
│   ├── Career philosophy ("I build solutions myself")
│   └── Timeline: Windstream → LTC → BCE
│
├── Time Savings Section
│   ├── Math breakdown showing 10 min/day = 60+ hrs/year
│   └── ROI calculation
│
├── Vault Section (accordion)
│   └── 10 projects with expandable details
│
├── Quick Wins Section (6 examples)
│   └── Excel macros, file scripts, email generators, etc.
│
├── Services Section (6 offerings)
│   └── Workflow Automation, AI Integrations, Dashboards, etc.
│
├── Free Resources Section (NEW)
│   ├── AI Orchestrator Blueprint (Advanced)
│   ├── Build Tools Not Rent (Intermediate)
│   └── DIY Automation Starter Kit (Beginner)
│
└── CTA Section
    └── "Tell Me Your Repetitive Task" + Calendly
```

---

## Folder Structure

```
C:\Users\ainef\Portfolio\
├── index.html              # Main portfolio site
├── CLAUDE.md               # This file
├── reference/              # Previous HTML designs for reference
│   ├── career_comparison.html
│   └── coo_profile.html
└── freebies/               # Lead magnet guides
    ├── 01-ai-orchestrator-blueprint.html
    ├── 02-build-tools-not-rent.html
    ├── 03-diy-automation-starter-kit.html
    ├── images/             # Generated images for guides
    │   ├── 01-cover.png
    │   ├── 01-claudemd-ecosystem.png
    │   ├── 01-hybrid-pipeline.png
    │   ├── 02-cover.png
    │   ├── 02-build-flow.png
    │   ├── 03-cover.png
    │   └── 03-process-flow.png
    └── orchestrator-template-bundle/
        ├── README.md
        ├── ALTERNATIVES.md
        ├── .claude/
        │   ├── CLAUDE.md
        │   ├── WORK_QUEUE.md
        │   ├── PIPELINE_STATE.md
        │   ├── SESSIONS.lock
        │   └── DECISIONS.md
        ├── tools/
        │   ├── new_project.py
        │   ├── update_state.py
        │   └── parse_plan.py
        └── examples/
            └── sample-project-config.md
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

**Effects:**
- Floating gradient orbs (animated)
- Grid overlay background
- Noise texture overlay
- Scroll-reveal animations
- Hover lift + glow effects

---

## Integrations

**Calendly:**
- URL: https://calendly.com/luis-aviles-khn
- Implementation: Popup widget (link in nav + CTA section)

**LinkedIn:**
- URL: https://www.linkedin.com/in/luis-aviles-0b969235a/

---

## Deployment

**Target:** Netlify
**Domain:** TBD (will get free .netlify.app subdomain)

To deploy:
1. Push to GitHub or drag-drop folder to Netlify
2. All files are static HTML/CSS/JS - no build step needed
3. Test video playback (needs byte-range support - Netlify provides this)
4. Test all links and Calendly popup

---

## Gemini Image API (for future use)

Location: `C:\Users\ainef\google-image-gen-api-starter\`

```bash
cd C:\Users\ainef\google-image-gen-api-starter
uv run python main.py output.png "prompt here"
uv run python main.py output.png "subject" --style styles/blue_glass_3d.md
```

Used for generating guide cover images and diagrams.
