import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

type WhoAnswer = 'employee' | 'owner' | 'executive' | 'solopreneur';
type WhatAnswer = 'automation' | 'website' | 'platform' | 'strategy';
type FlowStep = 'hero' | 'q1' | 'q2' | 'loading' | 'result' | 'closed';

interface OverlayContent {
  tier: string;
  headline: string;
  subheadline: string;
  price: string;
  marketPrice: string;
  cta: string;
  ctaLink: string;
  services: ServiceBlock[];
  processSteps: string[];
}

interface ServiceBlock {
  title: string;
  desc: string;
  accent: 'gold' | 'cyan' | 'green';
}

// ─── Content Config ───────────────────────────────────────────────────────────

const WHO_OPTIONS: { id: WhoAnswer; label: string; sub: string }[] = [
  { id: 'employee', label: 'Employee', sub: 'I want to stop doing repetitive work manually' },
  { id: 'owner', label: 'Business Owner', sub: 'I need better systems without adding headcount' },
  { id: 'executive', label: 'Executive / Manager', sub: 'I need teams and tools to work together' },
  { id: 'solopreneur', label: 'Solopreneur', sub: 'I wear every hat — I need leverage' },
];

const WHAT_OPTIONS: { id: WhatAnswer; label: string; sub: string }[] = [
  { id: 'automation', label: 'Automation', sub: 'Scripts, macros, workflows that run themselves' },
  { id: 'website', label: 'Website', sub: 'Custom design built to convert, not just look good' },
  { id: 'platform', label: 'Platform / App', sub: 'Dashboard, CRM, full business system' },
  { id: 'strategy', label: 'Strategy / Consulting', sub: 'Roadmap, AI audit, ops optimization' },
];

// ─── Full 16-Entry Content Matrix ─────────────────────────────────────────────

const CONTENT_MATRIX: Record<`${WhoAnswer}-${WhatAnswer}`, OverlayContent> = {

  // ── Employee × Automation ──────────────────────────────────────────────────
  'employee-automation': {
    tier: 'Quick Win',
    headline: 'Kill the Task That Eats Your Morning',
    subheadline: 'I write a script that handles it — you hit run once and walk away. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You describe the task', 'I scope it in 24 hrs', 'Built & delivered in days'],
    services: [
      { title: 'Excel & Spreadsheet Macros', desc: 'One button. 30 minutes of work disappears.', accent: 'gold' },
      { title: 'Python Automation Scripts', desc: 'File sorting, data pulling, report generation — automated.', accent: 'cyan' },
      { title: 'Email & Notification Triggers', desc: 'Automated alerts, summaries, and follow-ups on schedule.', accent: 'green' },
    ],
  },

  // ── Employee × Website ─────────────────────────────────────────────────────
  'employee-website': {
    tier: 'Quick Win',
    headline: 'A Page That Makes You Look Like the Expert You Are',
    subheadline: 'Portfolio, department microsite, or internal tool — built fast, built clean. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You describe what you need', 'I design and scope in 24 hrs', 'Live in days'],
    services: [
      { title: 'Personal Portfolio Page', desc: 'Show your work, your skills, your story — professionally.', accent: 'gold' },
      { title: 'Department Microsite', desc: 'A dedicated page for your team, project, or initiative.', accent: 'cyan' },
      { title: 'Internal Link Hub', desc: 'One tidy page that replaces the "where is that link?" Slack message.', accent: 'green' },
    ],
  },

  // ── Employee × Platform ────────────────────────────────────────────────────
  'employee-platform': {
    tier: 'Quick Win',
    headline: 'A Dashboard That Shows You What Matters, Right Now',
    subheadline: 'Custom reporting tool or team tracker — no spreadsheet archaeology required. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You describe what you track', 'I scope the tool in 24 hrs', 'Built & delivered in days'],
    services: [
      { title: 'Personal Reporting Dashboard', desc: 'Pull your numbers into one live view — no more digging.', accent: 'gold' },
      { title: 'Team Task Tracker', desc: 'Lightweight internal tool your team will actually use.', accent: 'cyan' },
      { title: 'Data Aggregation Script', desc: 'Combine data from multiple sources into one clean output.', accent: 'green' },
    ],
  },

  // ── Employee × Strategy ────────────────────────────────────────────────────
  'employee-strategy': {
    tier: 'Quick Win',
    headline: 'Find Out Exactly Which Tasks You Should Never Do Again',
    subheadline: 'A focused audit of your workflow — I map what can be automated and hand you a priority list. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You walk me through your day', 'I audit and rank the wins', 'You get a clear action plan'],
    services: [
      { title: 'Workflow Audit', desc: 'Map every manual step — find the 20% that eats 80% of your time.', accent: 'gold' },
      { title: 'Tool Recommendations', desc: 'What to add, what to drop, what to automate with what you have.', accent: 'cyan' },
      { title: 'Quick Win Prioritization', desc: 'A ranked list of automations sorted by time saved vs. build effort.', accent: 'green' },
    ],
  },

  // ── Owner × Automation ────────────────────────────────────────────────────
  'owner-automation': {
    tier: 'Growth Build',
    headline: 'Systems That Replace Your Bottlenecks',
    subheadline: 'I automate the operations holding your business hostage — without hiring another person. 30% below agency rates.',
    price: '$4,200–$5,600',
    marketPrice: '$6,000–$8,000',
    cta: 'Book a 15-Minute Call',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery call (30 min)', 'Proposal in 48 hrs', 'Built in 2–4 weeks'],
    services: [
      { title: 'CRM & Lead Pipeline Automation', desc: 'Leads captured, scored, and followed up automatically.', accent: 'gold' },
      { title: 'Email & Client Sequences', desc: 'Onboarding, follow-up, and re-engagement — on autopilot.', accent: 'cyan' },
      { title: 'Business Process Integration', desc: 'Connect your tools so data stops living in 6 different places.', accent: 'green' },
    ],
  },

  // ── Owner × Website ────────────────────────────────────────────────────────
  'owner-website': {
    tier: 'Growth Build',
    headline: 'A Website That Sells While You Sleep',
    subheadline: 'Conversion-optimized, SEO-ready, and built to grow — not just to exist. 30% below agency rates.',
    price: '$4,200–$5,600',
    marketPrice: '$6,000–$8,000',
    cta: 'Book a 15-Minute Call',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery call (30 min)', 'Design + proposal in 48 hrs', 'Live in 3–5 weeks'],
    services: [
      { title: 'Custom Website Design', desc: 'Built to convert, not just look good. Every element earns its place.', accent: 'gold' },
      { title: 'SEO From Day One', desc: 'Technical SEO, page speed, and content structure baked in — not bolted on.', accent: 'cyan' },
      { title: 'Lead Capture & CTA System', desc: 'Forms, funnels, and CTAs engineered to turn visitors into contacts.', accent: 'green' },
    ],
  },

  // ── Owner × Platform ──────────────────────────────────────────────────────
  'owner-platform': {
    tier: 'Growth Build',
    headline: 'Run Your Business From One Dashboard',
    subheadline: 'Custom CRM, operations dashboard, or client portal — built for how your business actually works. 30% below agency rates.',
    price: '$4,200–$5,600',
    marketPrice: '$6,000–$8,000',
    cta: 'Book a 15-Minute Call',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery call (30 min)', 'Architecture scoped in 48 hrs', 'Built in 3–6 weeks'],
    services: [
      { title: 'Custom CRM', desc: 'Track leads, clients, and deals your way — not the way Salesforce wants you to.', accent: 'gold' },
      { title: 'Operations Dashboard', desc: 'One screen. Every metric that matters. Updated in real time.', accent: 'cyan' },
      { title: 'Client-Facing Portal', desc: 'Give clients a login to track projects, access deliverables, and pay invoices.', accent: 'green' },
    ],
  },

  // ── Owner × Strategy ──────────────────────────────────────────────────────
  'owner-strategy': {
    tier: 'Growth Build',
    headline: 'A Roadmap to Replace Chaos With Systems',
    subheadline: 'I audit your entire digital operation — tools, workflows, gaps — and hand you a prioritized build plan. 30% below agency rates.',
    price: '$4,200–$5,600',
    marketPrice: '$6,000–$8,000',
    cta: 'Book a 15-Minute Call',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery call (30 min)', 'Full audit delivered in 1 week', 'Roadmap walkthrough session'],
    services: [
      { title: 'Digital Operations Audit', desc: 'Every tool, every workflow, every gap — mapped and graded.', accent: 'gold' },
      { title: 'AI & Automation Opportunity Map', desc: 'Where AI can replace labor in your specific business model.', accent: 'cyan' },
      { title: 'Prioritized Build Roadmap', desc: 'Ranked by ROI — what to build first, what to defer, what to cut.', accent: 'green' },
    ],
  },

  // ── Executive × Automation ────────────────────────────────────────────────
  'executive-automation': {
    tier: 'Full System',
    headline: 'Enterprise Automation That Scales With Your Teams',
    subheadline: 'I design and build the data pipelines and workflow integrations your ops team has been asking for. 30% below agency rates.',
    price: '$10,500–$14,000',
    marketPrice: '$15,000–$20,000',
    cta: 'Schedule a Discovery Session',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery session (60 min)', 'Architecture & scope proposal', 'Phased delivery with stakeholder check-ins'],
    services: [
      { title: 'Cross-System Data Pipelines', desc: 'Automated data movement between your CRM, ERP, BI, and reporting tools.', accent: 'gold' },
      { title: 'Enterprise Workflow Automation', desc: 'Multi-team approval flows, notifications, and handoffs — codified and reliable.', accent: 'cyan' },
      { title: 'API & Middleware Integration', desc: 'Connect the systems your vendors say can\'t talk to each other.', accent: 'green' },
    ],
  },

  // ── Executive × Website ───────────────────────────────────────────────────
  'executive-website': {
    tier: 'Full System',
    headline: 'A Digital Presence That Matches the Scale of the Organization',
    subheadline: 'Corporate site or multi-department portal — architected for performance, security, and brand authority. 30% below agency rates.',
    price: '$10,500–$14,000',
    marketPrice: '$15,000–$20,000',
    cta: 'Schedule a Discovery Session',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery session (60 min)', 'Architecture & design proposal', 'Phased delivery with stakeholder review gates'],
    services: [
      { title: 'Corporate Website Architecture', desc: 'Scalable, CMS-ready structure built for multiple teams and departments.', accent: 'gold' },
      { title: 'Multi-Department Portal', desc: 'Unified digital hub with role-based access, team sections, and shared resources.', accent: 'cyan' },
      { title: 'Performance & Security Hardening', desc: 'Sub-2s load times, enterprise-grade security headers, and audit trails.', accent: 'green' },
    ],
  },

  // ── Executive × Platform ──────────────────────────────────────────────────
  'executive-platform': {
    tier: 'Full System',
    headline: 'The Custom Platform Your Vendors Can\'t Build',
    subheadline: 'Full SaaS product, BI platform, or enterprise team tool — designed from your requirements, not from a template. 30% below agency rates.',
    price: '$10,500–$14,000',
    marketPrice: '$15,000–$20,000',
    cta: 'Schedule a Discovery Session',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery session (60 min)', 'Technical architecture proposal', 'Phased delivery — MVP first, then full rollout'],
    services: [
      { title: 'Custom SaaS or BI Platform', desc: 'Built to your data model, your user roles, your business logic. Full ownership.', accent: 'gold' },
      { title: 'Executive Dashboard Suite', desc: 'Real-time KPIs, drill-downs, and cross-department visibility in one view.', accent: 'cyan' },
      { title: 'Team Collaboration Tools', desc: 'Internal tools that cut meeting overhead and make status updates automatic.', accent: 'green' },
    ],
  },

  // ── Executive × Strategy ──────────────────────────────────────────────────
  'executive-strategy': {
    tier: 'Full System',
    headline: 'The Technology Audit Your Leadership Team Needs',
    subheadline: 'Build-vs-buy analysis, vendor evaluation, and a phased modernization roadmap — grounded in your actual stack. 30% below agency rates.',
    price: '$10,500–$14,000',
    marketPrice: '$15,000–$20,000',
    cta: 'Schedule a Discovery Session',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Discovery session (60 min)', 'Full audit & analysis (1–2 weeks)', 'Executive briefing + written roadmap'],
    services: [
      { title: 'Technology Stack Audit', desc: 'Every tool evaluated: utilization, cost, redundancy, and strategic fit.', accent: 'gold' },
      { title: 'Build-vs-Buy Analysis', desc: 'Rigorous comparison for your highest-cost software decisions.', accent: 'cyan' },
      { title: 'Digital Transformation Roadmap', desc: 'A phased modernization plan your board can act on immediately.', accent: 'green' },
    ],
  },

  // ── Solopreneur × Automation ──────────────────────────────────────────────
  'solopreneur-automation': {
    tier: 'Quick Win',
    headline: 'Turn Your Repetitive Work Into a Button',
    subheadline: 'I automate your content pipeline, client workflows, or lead follow-up — so you can focus on the work only you can do. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You describe the repetitive task', 'I scope it in 24 hrs', 'Delivered in days, not weeks'],
    services: [
      { title: 'Content & Publishing Pipeline', desc: 'From idea to scheduled post — drafted, formatted, queued automatically.', accent: 'gold' },
      { title: 'Client Onboarding Automation', desc: 'Intake forms, welcome emails, and project kickoffs — without lifting a finger.', accent: 'cyan' },
      { title: 'Lead Nurture Sequences', desc: 'Capture emails, send sequences, convert leads — no monthly SaaS required.', accent: 'green' },
    ],
  },

  // ── Solopreneur × Website ─────────────────────────────────────────────────
  'solopreneur-website': {
    tier: 'Quick Win',
    headline: 'A Website That Makes You Look Twice as Big',
    subheadline: 'Portfolio, brand site, or landing page — custom-built to convert visitors into clients. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You share your brand & goals', 'Design scoped in 24 hrs', 'Live in days'],
    services: [
      { title: 'Personal Brand Site', desc: 'Your story, your work, your offer — built to convert.', accent: 'gold' },
      { title: 'Service Landing Page', desc: 'One focused page that explains what you do and drives bookings.', accent: 'cyan' },
      { title: 'SEO Foundations', desc: 'Show up when your ideal clients search. Built in from day one.', accent: 'green' },
    ],
  },

  // ── Solopreneur × Platform ────────────────────────────────────────────────
  'solopreneur-platform': {
    tier: 'Quick Win',
    headline: 'Your Own Client Portal — Without the SaaS Bill',
    subheadline: 'Scheduling, client access, project tracking — one custom tool built exactly for how you work. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['You describe how you work with clients', 'I scope the tool in 24 hrs', 'Built & live in days'],
    services: [
      { title: 'Client Portal', desc: 'Clients log in to view progress, download deliverables, and pay invoices.', accent: 'gold' },
      { title: 'Booking & Scheduling System', desc: 'Custom availability + calendar — no Calendly subscription required.', accent: 'cyan' },
      { title: 'Personal Business Dashboard', desc: 'All your projects, clients, and revenue in one place you actually control.', accent: 'green' },
    ],
  },

  // ── Solopreneur × Strategy ────────────────────────────────────────────────
  'solopreneur-strategy': {
    tier: 'Quick Win',
    headline: 'Figure Out Which Tools and Systems Are Costing You Time',
    subheadline: 'I audit your business stack and hand you a clear plan to consolidate, automate, and grow — without burning out. Starting at $350.',
    price: '$350–$700',
    marketPrice: '$500–$1,000',
    cta: 'Tell Me Your Task',
    ctaLink: 'https://calendly.com/luis-aviles-khn',
    processSteps: ['Walk me through your business', 'I audit your tools & workflows', 'You get a prioritized action plan'],
    services: [
      { title: 'Business Systems Audit', desc: 'Every tool you pay for, mapped against what it actually does for your revenue.', accent: 'gold' },
      { title: 'Tool Consolidation Plan', desc: 'Cut the subscriptions, keep the leverage. One streamlined stack.', accent: 'cyan' },
      { title: 'Growth Systems Roadmap', desc: 'A ranked list of what to automate, build, and stop doing manually.', accent: 'green' },
    ],
  },
};

function buildOverlay(who: WhoAnswer, what: WhatAnswer): OverlayContent {
  return CONTENT_MATRIX[`${who}-${what}`];
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_PERSONA = 'ineffable_persona';
const STORAGE_SERVICE = 'ineffable_service';

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <span className="jarvis-loading-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function ProcessFlow({ steps }: { steps: string[] }) {
  return (
    <div className="jarvis-process">
      {steps.map((step, i) => (
        <div key={i} className="jarvis-process-step">
          <div className="jarvis-process-num">{i + 1}</div>
          <div className="jarvis-process-text">{step}</div>
          {i < steps.length - 1 && <div className="jarvis-process-arrow" aria-hidden="true">→</div>}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ svc }: { svc: ServiceBlock }) {
  const accentMap = { gold: '#ffc13b', cyan: '#00e5ff', green: '#00ff88' };
  return (
    <div className="jarvis-svc-card" style={{ '--accent': accentMap[svc.accent] } as React.CSSProperties}>
      <div className="jarvis-svc-bar" />
      <h4 className="jarvis-svc-title">{svc.title}</h4>
      <p className="jarvis-svc-desc">{svc.desc}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JarvisSelector() {
  const [step, setStep] = useState<FlowStep>('hero');
  const [who, setWho] = useState<WhoAnswer | null>(null);
  const [what, setWhat] = useState<WhatAnswer | null>(null);
  const [overlay, setOverlay] = useState<OverlayContent | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  // Check if already completed — show compact "welcome back" state or nothing
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const savedPersona = localStorage.getItem(STORAGE_PERSONA);
    const savedService = localStorage.getItem(STORAGE_SERVICE);
    if (savedPersona && savedService) {
      setReturning(true);
    }
    // Create GSAP context for cleanup
    gsapCtxRef.current = gsap.context(() => {}, containerRef.current!);
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, []);

  // Animate cards in when step changes
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.jarvis-option-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 20, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.1,
      }
    );
  }, [step]);

  // Loading sequence
  useEffect(() => {
    if (step !== 'loading') return;
    const phases = [
      'Analyzing your needs...',
      'Building your view...',
      'Almost ready...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLoadingPhase(i);
      if (i >= phases.length) {
        clearInterval(interval);
        // Trigger Jarvis voice line if available
        try {
          const voicePref = localStorage.getItem('ineffable_jarvis_voice') || 'male';
          const audioFile = voicePref === 'female'
            ? '/assets/audio/jarvis-female.mp3'
            : '/assets/audio/jarvis-male.mp3';
          const audio = new Audio(audioFile);
          audio.volume = 0.6;
          audio.play().catch(() => {}); // Silently ignore if blocked by browser
        } catch {}
        setTimeout(() => {
          if (who && what) {
            setOverlay(buildOverlay(who, what));
            setStep('result');
          }
        }, 600);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [step, who, what]);

  const handleWho = useCallback((id: WhoAnswer) => {
    setWho(id);
    // Micro-animation feedback on selection
    const btn = document.querySelector(`[data-who="${id}"]`);
    if (btn) {
      gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    }
    setTimeout(() => setStep('q2'), 300);
  }, []);

  const handleWhat = useCallback((id: WhatAnswer) => {
    setWhat(id);
    const btn = document.querySelector(`[data-what="${id}"]`);
    if (btn) {
      gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    }
    setTimeout(() => setStep('loading'), 300);
  }, []);

  const handleClose = useCallback(() => {
    if (!containerRef.current) { setStep('closed'); return; }
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -16,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => setStep('closed'),
    });
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_PERSONA);
    localStorage.removeItem(STORAGE_SERVICE);
    setWho(null);
    setWhat(null);
    setOverlay(null);
    setReturning(false);
    setStep('q1');
  }, []);

  const persistAndClose = useCallback(() => {
    if (who) localStorage.setItem(STORAGE_PERSONA, who);
    if (what) localStorage.setItem(STORAGE_SERVICE, what);
    window.dispatchEvent(new CustomEvent('jarvis-complete', { detail: { persona: who, service: what } }));
    setReturning(true);
    setStep('hero');
  }, [who, what]);

  // Render nothing if flow is closed
  if (step === 'closed') return null;

  const loadingLabels = [
    'Analyzing your needs...',
    'Building your view...',
    'Almost ready...',
  ];

  return (
    <div className="jarvis-root" ref={containerRef}>
      {/* ── Hero Trigger State ─────────────────────────── */}
      {step === 'hero' && (
        <div className="jarvis-hero-cta">
          {returning ? (
            <div className="jarvis-returning">
              <span className="jarvis-dot-live" />
              <button
                className="jarvis-customize-btn"
                onClick={() => setStep('q1')}
                aria-label="Customize your experience again"
              >
                <span className="jarvis-customize-inner">Customize Again</span>
              </button>
            </div>
          ) : (
            <button
              className="jarvis-customize-btn jarvis-magnetic"
              onClick={() => setStep('q1')}
              aria-label="Customize your experience — personalized view"
            >
              <span className="jarvis-customize-inner">
                <span className="jarvis-dot-live" aria-hidden="true" />
                CUSTOMIZE YOUR EXPERIENCE
              </span>
              <span className="jarvis-customize-arrow" aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}

      {/* ── Question Flow Modal (portaled to body to escape <main> containment) ── */}
      {(step === 'q1' || step === 'q2' || step === 'loading') && createPortal(
        <div
          className="jarvis-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Personalize your experience"
        >
          <div
            className="jarvis-modal-backdrop-click"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="jarvis-modal">
            {/* Header */}
            <div className="jarvis-modal-header">
              <div className="jarvis-brand-line">
                <span className="jarvis-dot-live" aria-hidden="true" />
                <span className="jarvis-brand-label">JARVIS</span>
                <span className="jarvis-step-indicator">
                  {step === 'q1' ? '1 / 2' : step === 'q2' ? '2 / 2' : ''}
                </span>
              </div>
              <button
                className="jarvis-close-btn"
                onClick={handleClose}
                aria-label="Close personalization"
              >
                ✕
              </button>
            </div>

            {/* Q1 */}
            {step === 'q1' && (
              <div className="jarvis-question-pane">
                <h2 className="jarvis-q-heading">I am a...</h2>
                <div className="jarvis-options-grid">
                  {WHO_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={`jarvis-option-card ${who === opt.id ? 'jarvis-option-selected' : ''}`}
                      data-who={opt.id}
                      onClick={() => handleWho(opt.id)}
                      aria-pressed={who === opt.id}
                    >
                      <span className="jarvis-option-label">{opt.label}</span>
                      <span className="jarvis-option-sub">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q2 */}
            {step === 'q2' && (
              <div className="jarvis-question-pane">
                <h2 className="jarvis-q-heading">I&apos;m looking for...</h2>
                <div className="jarvis-options-grid">
                  {WHAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={`jarvis-option-card ${what === opt.id ? 'jarvis-option-selected' : ''}`}
                      data-what={opt.id}
                      onClick={() => handleWhat(opt.id)}
                      aria-pressed={what === opt.id}
                    >
                      <span className="jarvis-option-label">{opt.label}</span>
                      <span className="jarvis-option-sub">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <button className="jarvis-back-btn" onClick={() => setStep('q1')}>
                  ← Back
                </button>
              </div>
            )}

            {/* Loading */}
            {step === 'loading' && (
              <div className="jarvis-loading-pane" aria-live="polite">
                <div className="jarvis-loading-animation" aria-hidden="true">
                  <LoadingNodes />
                </div>
                <p className="jarvis-loading-label">
                  {loadingLabels[Math.min(loadingPhase, loadingLabels.length - 1)]}
                  <LoadingDots />
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── Result Overlay (portaled to body to escape <main> containment) ── */}
      {step === 'result' && overlay && createPortal(
        <ResultOverlay
          overlay={overlay}
          who={who!}
          what={what!}
          onClose={persistAndClose}
          onReset={handleReset}
        />,
        document.body
      )}
    </div>
  );
}

// ─── Loading SVG Animation ────────────────────────────────────────────────────

function LoadingNodes() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const nodes = svgRef.current.querySelectorAll('.lnode');
    const lines = svgRef.current.querySelectorAll('.lline');

    gsap.set(nodes, { scale: 0, transformOrigin: 'center center' });
    gsap.set(lines, { strokeDashoffset: 120 });

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(nodes, { scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(2)' })
      .to(lines, { strokeDashoffset: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.3')
      .to(nodes, { scale: 1.2, duration: 0.3, stagger: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '+=0.2')
      .to([nodes, lines], { opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.3')
      .set([nodes, lines], { opacity: 1, strokeDashoffset: 120 });
  }, []);

  return (
    <svg ref={svgRef} width="160" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Connection lines */}
      <line className="lline" x1="20" y1="40" x2="60" y2="20" stroke="#ffc13b" strokeWidth="1" strokeDasharray="120" strokeDashoffset="120" opacity="0.6" />
      <line className="lline" x1="20" y1="40" x2="60" y2="60" stroke="#ffc13b" strokeWidth="1" strokeDasharray="120" strokeDashoffset="120" opacity="0.6" />
      <line className="lline" x1="60" y1="20" x2="100" y2="40" stroke="#00e5ff" strokeWidth="1" strokeDasharray="120" strokeDashoffset="120" opacity="0.6" />
      <line className="lline" x1="60" y1="60" x2="100" y2="40" stroke="#00e5ff" strokeWidth="1" strokeDasharray="120" strokeDashoffset="120" opacity="0.6" />
      <line className="lline" x1="100" y1="40" x2="140" y2="40" stroke="#00ff88" strokeWidth="1.5" strokeDasharray="120" strokeDashoffset="120" opacity="0.8" />
      {/* Nodes */}
      <circle className="lnode" cx="20" cy="40" r="5" fill="#ffc13b" filter="url(#glow-gold)" />
      <circle className="lnode" cx="60" cy="20" r="4" fill="#ffc13b" opacity="0.7" />
      <circle className="lnode" cx="60" cy="60" r="4" fill="#ffc13b" opacity="0.7" />
      <circle className="lnode" cx="100" cy="40" r="5" fill="#00e5ff" filter="url(#glow-cyan)" />
      <circle className="lnode" cx="140" cy="40" r="6" fill="#00ff88" filter="url(#glow-cyan)" />
    </svg>
  );
}

// ─── Result Overlay ───────────────────────────────────────────────────────────

function ResultOverlay({
  overlay,
  who,
  what,
  onClose,
  onReset,
}: {
  overlay: OverlayContent;
  who: WhoAnswer;
  what: WhatAnswer;
  onClose: () => void;
  onReset: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.6, ease: 'power4.out' }
    );

    // Stagger content in
    const items = panelRef.current.querySelectorAll('.jarvis-reveal');
    gsap.fromTo(items,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  const handleClose = useCallback(() => {
    if (!panelRef.current) { onClose(); return; }
    gsap.to(panelRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: onClose,
    });
  }, [onClose]);

  return (
    <div
      className="jarvis-result-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Your personalized view"
    >
      <div
        className="jarvis-result-bg-click"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="jarvis-result-panel" ref={panelRef}>
        {/* Panel Header */}
        <div className="jarvis-result-header">
          <div className="jarvis-brand-line">
            <span className="jarvis-dot-live" aria-hidden="true" />
            <span className="jarvis-brand-label">YOUR PERSONALIZED VIEW</span>
            <span className="jarvis-tier-badge">{overlay.tier}</span>
          </div>
          <button
            className="jarvis-close-btn"
            onClick={handleClose}
            aria-label="Close — explore full site"
          >
            ✕
          </button>
        </div>

        {/* Two-column island layout — no scroll needed on desktop */}
        <div className="jarvis-result-body" data-lenis-prevent>
          {/* Left column: Headline + Services */}
          <div className="jarvis-result-col-left">
            <div className="jarvis-reveal">
              <h2 className="jarvis-result-heading">{overlay.headline}</h2>
              <p className="jarvis-result-sub">{overlay.subheadline}</p>
            </div>

            <div className="jarvis-reveal" style={{ marginTop: '1.25rem' }}>
              <div className="jarvis-section-label">WHAT I BUILD FOR YOU</div>
              <div className="jarvis-svc-grid">
                {overlay.services.map((svc, i) => (
                  <ServiceCard key={i} svc={svc} />
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Pricing + Process + CTA */}
          <div className="jarvis-result-col-right">
            <div className="jarvis-reveal">
              <div className="jarvis-section-label">INVESTMENT</div>
              <div className="jarvis-pricing-block">
                <div className="jarvis-price-main">{overlay.price}</div>
                <div className="jarvis-price-compare">
                  vs. <span className="jarvis-price-strike">{overlay.marketPrice}</span> at agencies
                </div>
                <div className="jarvis-price-note">
                  30% below market — same quality, no agency overhead.
                </div>
              </div>
            </div>

            <div className="jarvis-reveal" style={{ marginTop: '1.25rem' }}>
              <div className="jarvis-section-label">HOW IT WORKS</div>
              <ProcessFlow steps={overlay.processSteps} />
            </div>

            <div className="jarvis-result-cta-section jarvis-reveal" style={{ marginTop: '1.5rem' }}>
              <a
                href={overlay.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="jarvis-cta-primary"
                onClick={handleClose}
              >
                {overlay.cta}
                <span aria-hidden="true"> →</span>
              </a>
              <button className="jarvis-cta-secondary" onClick={handleClose}>
                Explore Full Site →
              </button>
              <button className="jarvis-redo-btn" onClick={onReset}>
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
