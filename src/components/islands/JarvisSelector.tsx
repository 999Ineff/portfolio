import { useState, useEffect, useCallback, useRef } from 'react';
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

function buildOverlay(who: WhoAnswer, what: WhatAnswer): OverlayContent {
  // Tier is driven by "who" — "what" reorders blocks
  const tiers: Record<WhoAnswer, OverlayContent> = {
    employee: {
      tier: 'Quick Win',
      headline: "Here's What I'd Build for You",
      subheadline: 'Fast automations that give you back hours every week — starting at $350.',
      price: '$350–$700',
      marketPrice: '$500–$1,000',
      cta: 'Tell Me Your Task',
      ctaLink: 'https://calendly.com/luis-aviles-khn',
      processSteps: ['You describe the task', 'I scope it in 24 hrs', 'Built & delivered in days'],
      services: [
        { title: 'Excel & Spreadsheet Macros', desc: 'One button. 30 minutes of work disappears.', accent: 'gold' },
        { title: 'Python Automation Scripts', desc: 'File sorting, data pulling, report generation — automated.', accent: 'cyan' },
        { title: 'Email & Notification Triggers', desc: 'Automated alerts, summaries, and follow-ups.', accent: 'green' },
      ],
    },
    owner: {
      tier: 'Growth Build',
      headline: "Here's What I'd Build for You",
      subheadline: 'A complete online presence or system that competes — 30% below agency rates.',
      price: '$4,200–$5,600',
      marketPrice: '$6,000–$8,000',
      cta: 'Book a 15-Minute Call',
      ctaLink: 'https://calendly.com/luis-aviles-khn',
      processSteps: ['Discovery call (30 min)', 'Proposal in 48 hrs', 'Build in 3–6 weeks'],
      services: [
        { title: 'Custom Website Design', desc: 'Built to convert, not just look good. Real SEO from day one.', accent: 'gold' },
        { title: 'Business Automation', desc: 'Systems that replace your manual bottlenecks.', accent: 'cyan' },
        { title: 'SEO & Lead Generation', desc: 'Show up when buyers search. Traffic that compounds.', accent: 'green' },
      ],
    },
    executive: {
      tier: 'Full System',
      headline: "Here's What I'd Build for You",
      subheadline: 'Integration, consolidation, and custom tools that make your teams faster.',
      price: '$10,500–$14,000',
      marketPrice: '$15,000–$20,000',
      cta: 'Schedule a Discovery Session',
      ctaLink: 'https://calendly.com/luis-aviles-khn',
      processSteps: ['Discovery session (60 min)', 'Architecture proposal', 'Phased delivery with check-ins'],
      services: [
        { title: 'System Integration', desc: 'Make your existing tools talk to each other. No more copy-paste.', accent: 'cyan' },
        { title: 'Custom Dashboards', desc: 'Real-time visibility across operations. One source of truth.', accent: 'gold' },
        { title: 'Team Workflow Automation', desc: 'Eliminate the manual coordination tax.', accent: 'green' },
      ],
    },
    solopreneur: {
      tier: 'Quick Win',
      headline: "Here's What I'd Build for You",
      subheadline: 'High-leverage automation and tools so you can do more with fewer hours.',
      price: '$350–$700',
      marketPrice: '$500–$1,000',
      cta: 'Tell Me Your Task',
      ctaLink: 'https://calendly.com/luis-aviles-khn',
      processSteps: ['You describe the task', 'I scope it in 24 hrs', 'Delivered in days, not weeks'],
      services: [
        { title: 'Content & Publishing Pipelines', desc: 'From idea to scheduled post — automated.', accent: 'gold' },
        { title: 'Client Workflow Tools', desc: 'Onboarding, invoicing, follow-ups on autopilot.', accent: 'cyan' },
        { title: 'Lead Capture & Nurture', desc: 'Capture emails, send sequences, without a monthly SaaS bill.', accent: 'green' },
      ],
    },
  };

  const content = { ...tiers[who] };

  // Reorder services based on "what"
  if (what === 'automation') {
    // Already ordered for automation — keep
  } else if (what === 'website') {
    // Promote website block
    content.services = [
      content.services.find(s => s.title.toLowerCase().includes('website') || s.title.toLowerCase().includes('content')) || content.services[0],
      ...content.services.filter((_, i) => i !== 0),
    ].slice(0, 3);
  } else if (what === 'platform') {
    content.services = [
      content.services.find(s => s.title.toLowerCase().includes('dashboard') || s.title.toLowerCase().includes('system') || s.title.toLowerCase().includes('platform')) || content.services[0],
      ...content.services.filter((_, i) => i !== 0),
    ].slice(0, 3);
  }

  return content;
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
        // Trigger voice if available
        try {
          const audio = new Audio('/assets/audio/jarvis-ready.mp3');
          audio.play().catch(() => {}); // Silently ignore if file not found
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
                Customize Again
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

      {/* ── Question Flow Modal ────────────────────────── */}
      {(step === 'q1' || step === 'q2' || step === 'loading') && (
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
        </div>
      )}

      {/* ── Result Overlay ─────────────────────────────── */}
      {step === 'result' && overlay && (
        <ResultOverlay
          overlay={overlay}
          who={who!}
          what={what!}
          onClose={persistAndClose}
          onReset={handleReset}
        />
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

        {/* Scrollable content */}
        <div className="jarvis-result-scroll" data-lenis-prevent>
          {/* Section 1: Headline */}
          <div className="jarvis-result-section jarvis-reveal">
            <h2 className="jarvis-result-heading">{overlay.headline}</h2>
            <p className="jarvis-result-sub">{overlay.subheadline}</p>
          </div>

          {/* Section 2: Services */}
          <div className="jarvis-result-section jarvis-reveal">
            <div className="jarvis-section-label">WHAT I BUILD FOR YOU</div>
            <div className="jarvis-svc-grid">
              {overlay.services.map((svc, i) => (
                <ServiceCard key={i} svc={svc} />
              ))}
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="jarvis-result-section jarvis-reveal">
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

          {/* Section 4: Process */}
          <div className="jarvis-result-section jarvis-reveal">
            <div className="jarvis-section-label">HOW IT WORKS</div>
            <ProcessFlow steps={overlay.processSteps} />
          </div>

          {/* Section 5: CTA */}
          <div className="jarvis-result-section jarvis-result-cta-section jarvis-reveal">
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
  );
}
