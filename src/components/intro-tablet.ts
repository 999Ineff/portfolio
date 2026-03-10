/**
 * intro-tablet.ts — Tablet Intro Animation
 * Phase 2, Track A, Session 2A-3
 *
 * GSAP-only (no Three.js) intro for tablet devices (768–1199px).
 * Dynamically imported by IntroAnimation.astro when device tier === 'tablet'.
 *
 * API: initTabletIntro({ container, onComplete, gsap }) → { timeline, cleanup }
 *
 * Storyboard (~5s total):
 *   0.0–0.4s   Gradient orbs fade in
 *   0.8s       SVG laptop lid outline draws
 *   1.0s       Body outline draws + screen glow fades in
 *   1.2s       Keyboard lines draw
 *   1.5s       Screen glow intensifies + scanline begins
 *   2.0s       "Initializing..." text + gold progress bar starts
 *   2.5s       "Connecting..." + laptop scales up slightly
 *   3.0s       "Ready." in gold + progress bar 65%
 *   3.5s       IS monogram on screen + progress bar 90%
 *   4.0s       Progress bar 100% + chassis fades + screen expands
 *   4.5s       Screen fills viewport
 *   4.75s      Overlay opacity → 0
 *   5.0s       onComplete called
 */

/* ── Public Config Types ──────────────────────────────────────────────────── */

export interface TabletIntroConfig {
  container: HTMLElement;
  onComplete: () => void;
  gsap: any;
}

export interface TabletIntroHandle {
  timeline: any;
  cleanup: () => void;
}

/* ── Constants ────────────────────────────────────────────────────────────── */

/** Unique CSS prefix — avoids collision with IntroAnimation.astro styles */
const P = 'intro-tablet-';

/* ── SVG Geometry (viewport-relative, computed at call time) ────────────────
   All units are absolute px, placed in a 600×400 SVG viewBox.
   The SVG itself is sized as 65vw × auto (constrained), centred via CSS.
   ─────────────────────────────────────────────────────────────────────────── */

const VB_W = 600;
const VB_H = 400;

// Lid (screen housing)
const LID = { x: 80, y: 20, w: 440, h: 270, r: 10 };

// Screen area inside lid (inset 16px from lid)
const SCREEN = { x: LID.x + 16, y: LID.y + 16, w: LID.w - 32, h: LID.h - 32, r: 4 };

// Hinge bar
const HINGE = { x: LID.x + LID.w * 0.2, y: LID.y + LID.h, w: LID.w * 0.6, h: 6 };

// Base (laptop body)
const BASE = { x: LID.x - 20, y: HINGE.y + HINGE.h, w: LID.w + 40, h: 72, r: 6 };

// Keyboard lines inside base (3 rows)
const KB_X_START = BASE.x + 24;
const KB_X_END = BASE.x + BASE.w - 24;
const KB_Y_OFFSETS = [16, 32, 48]; // relative to BASE.y

// Progress bar inside screen (bottom strip)
const PROG = {
  x: SCREEN.x + 8,
  y: SCREEN.y + SCREEN.h - 20,
  w: SCREEN.w - 16,
  h: 6,
  r: 3,
};

/* ── Helper: create SVG element ──────────────────────────────────────────── */

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

/* ── Helper: rounded-rect path data ─────────────────────────────────────── */

function rrectPath(x: number, y: number, w: number, h: number, r: number): string {
  return [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

/* ── Helper: inject scoped <style> ──────────────────────────────────────── */

function createStyleEl(css: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.dataset.introTablet = '1';
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════════════════ */

export function initTabletIntro(config: TabletIntroConfig): TabletIntroHandle {
  const { container, onComplete, gsap } = config;

  /* Track everything created so cleanup() can remove it all */
  const createdElements: (Element | null)[] = [];
  const createdStyles: HTMLStyleElement[] = [];

  /* ── 0. Hide mobile content if present ─────────────────────────────── */
  const mobileContent = document.getElementById('intro-mobile-content');
  if (mobileContent) mobileContent.style.display = 'none';

  /* ── 1. Inject scoped styles ────────────────────────────────────────── */

  const styleEl = createStyleEl(`
    /* ── Gradient Orbs ────────────────────────────────────────────────── */
    .${P}orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      will-change: opacity;
    }
    .${P}orb-cyan {
      width: 45vw;
      height: 45vw;
      top: -10%;
      left: -8%;
      background: radial-gradient(
        circle,
        rgba(0, 229, 255, 0.08) 0%,
        transparent 70%
      );
      filter: blur(80px);
    }
    .${P}orb-gold {
      width: 40vw;
      height: 40vw;
      bottom: -8%;
      right: -6%;
      background: radial-gradient(
        circle,
        rgba(255, 193, 59, 0.08) 0%,
        transparent 70%
      );
      filter: blur(80px);
    }

    /* ── SVG Laptop Container ─────────────────────────────────────────── */
    .${P}svg-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .${P}svg {
      width: 65vw;
      max-width: 560px;
      min-width: 380px;
      height: auto;
      overflow: visible;
    }

    /* ── Screen Glow (radial on screen rect via filter) ───────────────── */
    .${P}screen-glow {
      position: absolute;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(
        ellipse at 50% 40%,
        rgba(0, 229, 255, 0.18) 0%,
        rgba(0, 229, 255, 0.04) 60%,
        transparent 100%
      );
      will-change: opacity;
    }

    /* ── Scanline ─────────────────────────────────────────────────────── */
    .${P}scanline {
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(0, 229, 255, 0.15);
      pointer-events: none;
      opacity: 0;
      animation: ${P}scan 2.2s linear infinite;
    }

    @keyframes ${P}scan {
      0%   { top: 0%; }
      100% { top: 100%; }
    }

    /* ── Screen Text (foreignObject host) ────────────────────────────── */
    .${P}fo-root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 12px 16px;
      box-sizing: border-box;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      user-select: none;
    }

    .${P}status-text {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cyan, #00e5ff);
      opacity: 0;
      transition: opacity 0.3s ease;
      text-align: center;
      white-space: nowrap;
      margin-bottom: 8px;
    }
    .${P}status-text.visible { opacity: 1; }
    .${P}status-text.gold { color: var(--gold, #ffc13b); }

    .${P}monogram {
      font-family: var(--font-display, 'Cabinet Grotesk', sans-serif);
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.04em;
      background: var(--gradient-gold, linear-gradient(135deg, #ffc13b 0%, #ff8f00 100%));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .${P}monogram.visible { opacity: 1; }

    /* ── Progress Bar Host ────────────────────────────────────────────── */
    /* Rendered in SVG — no extra CSS needed, styled via SVG attrs */
  `);
  createdStyles.push(styleEl);

  /* ── 2. Build DOM: gradient orbs ────────────────────────────────────── */

  const orbCyan = document.createElement('div');
  orbCyan.className = `${P}orb ${P}orb-cyan`;

  const orbGold = document.createElement('div');
  orbGold.className = `${P}orb ${P}orb-gold`;

  container.appendChild(orbCyan);
  container.appendChild(orbGold);
  createdElements.push(orbCyan, orbGold);

  /* ── 3. Build SVG laptop ────────────────────────────────────────────── */

  const svgWrap = document.createElement('div');
  svgWrap.className = `${P}svg-wrap`;

  const svg = svgEl('svg', {
    class: `${P}svg`,
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  });

  /* ── SVG: defs (gradient for progress bar) ── */
  const defs = svgEl('defs', {});

  const progGrad = svgEl('linearGradient', {
    id: `${P}prog-grad`,
    x1: '0',
    y1: '0',
    x2: '1',
    y2: '0',
  });
  const s1 = svgEl('stop', { offset: '0%', 'stop-color': '#ffc13b' });
  const s2 = svgEl('stop', { offset: '100%', 'stop-color': '#ff8f00' });
  progGrad.appendChild(s1);
  progGrad.appendChild(s2);
  defs.appendChild(progGrad);

  const screenMask = svgEl('clipPath', { id: `${P}screen-clip` });
  const screenMaskRect = svgEl('rect', {
    x: SCREEN.x,
    y: SCREEN.y,
    width: SCREEN.w,
    height: SCREEN.h,
    rx: SCREEN.r,
  });
  screenMask.appendChild(screenMaskRect);
  defs.appendChild(screenMask);

  svg.appendChild(defs);

  /* ── SVG: Laptop lid outline ── */
  const lidPath = svgEl('path', {
    d: rrectPath(LID.x, LID.y, LID.w, LID.h, LID.r),
    stroke: 'var(--text-dim, #6b7280)',
    'stroke-width': '1.5',
    fill: 'none',
  });
  svg.appendChild(lidPath);

  /* ── SVG: Screen fill (dark interior) ── */
  const screenFill = svgEl('rect', {
    x: SCREEN.x,
    y: SCREEN.y,
    width: SCREEN.w,
    height: SCREEN.h,
    rx: SCREEN.r,
    fill: '#05050a',
    opacity: '0',
  });
  svg.appendChild(screenFill);

  /* ── SVG: Screen outline ── */
  const screenOutline = svgEl('rect', {
    x: SCREEN.x,
    y: SCREEN.y,
    width: SCREEN.w,
    height: SCREEN.h,
    rx: SCREEN.r,
    stroke: 'rgba(0, 229, 255, 0.25)',
    'stroke-width': '1',
    fill: 'none',
    opacity: '0',
  });
  svg.appendChild(screenOutline);

  /* ── SVG: Hinge ── */
  const hingePath = svgEl('rect', {
    x: HINGE.x,
    y: HINGE.y,
    width: HINGE.w,
    height: HINGE.h,
    rx: '2',
    stroke: 'var(--text-dim, #6b7280)',
    'stroke-width': '1.5',
    fill: 'rgba(107, 114, 128, 0.1)',
    opacity: '0',
  });
  svg.appendChild(hingePath);

  /* ── SVG: Base (body) outline ── */
  const basePath = svgEl('path', {
    d: rrectPath(BASE.x, BASE.y, BASE.w, BASE.h, BASE.r),
    stroke: 'var(--text-dim, #6b7280)',
    'stroke-width': '1.5',
    fill: 'none',
    opacity: '0',
  });
  svg.appendChild(basePath);

  /* ── SVG: Keyboard lines ── */
  const kbLines: SVGLineElement[] = KB_Y_OFFSETS.map((dy) => {
    const line = svgEl('line', {
      x1: KB_X_START,
      y1: BASE.y + dy,
      x2: KB_X_END,
      y2: BASE.y + dy,
      stroke: 'var(--cyan, #00e5ff)',
      'stroke-width': '1',
      'stroke-linecap': 'round',
      opacity: '0',
    });
    svg.appendChild(line);
    return line;
  });

  /* ── SVG: Touchpad ── */
  const touchpad = svgEl('rect', {
    x: BASE.x + BASE.w / 2 - 36,
    y: BASE.y + 16,
    width: 72,
    height: 40,
    rx: 4,
    stroke: 'rgba(107, 114, 128, 0.4)',
    'stroke-width': '1',
    fill: 'none',
    opacity: '0',
  });
  svg.appendChild(touchpad);

  /* ── SVG: Progress bar track ── */
  const progTrack = svgEl('rect', {
    x: PROG.x,
    y: PROG.y,
    width: PROG.w,
    height: PROG.h,
    rx: PROG.r,
    fill: 'rgba(255, 255, 255, 0.06)',
    opacity: '0',
  });
  svg.appendChild(progTrack);

  /* ── SVG: Progress bar fill ── */
  const progFill = svgEl('rect', {
    x: PROG.x,
    y: PROG.y,
    width: '0',
    height: PROG.h,
    rx: PROG.r,
    fill: `url(#${P}prog-grad)`,
    opacity: '0',
  });
  svg.appendChild(progFill);

  /* ── SVG: Scanline (clipped to screen) ── */
  const scanlineG = svgEl('g', { 'clip-path': `url(#${P}screen-clip)`, opacity: '0' });
  const scanlineLine = svgEl('line', {
    x1: SCREEN.x,
    y1: SCREEN.y,
    x2: SCREEN.x + SCREEN.w,
    y2: SCREEN.y,
    stroke: 'rgba(0, 229, 255, 0.12)',
    'stroke-width': '1.5',
  });
  scanlineG.appendChild(scanlineLine);
  svg.appendChild(scanlineG);

  /* ── SVG: Screen glow rect (pure SVG filter approach) ── */
  const screenGlowRect = svgEl('rect', {
    x: SCREEN.x,
    y: SCREEN.y,
    width: SCREEN.w,
    height: SCREEN.h,
    rx: SCREEN.r,
    fill: 'rgba(0, 229, 255, 0.06)',
    opacity: '0',
  });
  svg.appendChild(screenGlowRect);

  /* ── SVG: foreignObject for screen text content ── */
  const fo = svgEl('foreignObject', {
    x: SCREEN.x,
    y: SCREEN.y,
    width: SCREEN.w,
    height: SCREEN.h - 28, // leave room for progress bar
    opacity: '0',
  });

  // xhtml namespace div
  const foRoot = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  foRoot.className = `${P}fo-root`;

  const statusText = document.createElementNS('http://www.w3.org/1999/xhtml', 'div') as HTMLElement;
  statusText.className = `${P}status-text`;
  statusText.textContent = 'Initializing...';

  const monogram = document.createElementNS('http://www.w3.org/1999/xhtml', 'div') as HTMLElement;
  monogram.className = `${P}monogram`;
  monogram.textContent = 'IS';

  foRoot.appendChild(statusText);
  foRoot.appendChild(monogram);
  fo.appendChild(foRoot);
  svg.appendChild(fo);

  svgWrap.appendChild(svg);
  container.appendChild(svgWrap);
  createdElements.push(svgWrap);

  /* ── 4. Compute stroke lengths for path animations ───────────────────
     Must happen after SVG is in the DOM (getTotalLength requires layout).
     We append temporarily to document.body if container isn't in DOM,
     but since container IS the overlay (already in DOM), we're fine.
     ────────────────────────────────────────────────────────────────── */

  // Set up dasharray/dashoffset for lid draw animation
  function prepareDash(pathEl: SVGGeometryElement): number {
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(len);
    pathEl.style.strokeDashoffset = String(len);
    return len;
  }

  const lidLen = prepareDash(lidPath);
  const baseLen = prepareDash(basePath);

  // Keyboard line dash prep
  kbLines.forEach((line) => {
    const len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
  });

  /* ── 5. Scanline GSAP animation (continuous Y movement) ────────────── */
  // We'll drive the scanline's y1/y2 attributes via GSAP ticker
  let scanlineActive = false;
  let scanlineY = SCREEN.y;
  const scanlineTicker = () => {
    if (!scanlineActive) return;
    scanlineY += 1.8;
    if (scanlineY > SCREEN.y + SCREEN.h) scanlineY = SCREEN.y;
    scanlineLine.setAttribute('y1', String(scanlineY));
    scanlineLine.setAttribute('y2', String(scanlineY));
  };

  /* ── 6. Build GSAP master timeline ─────────────────────────────────── */

  const tl = gsap.timeline({
    onComplete: () => {
      onComplete();
    },
  });

  /* ─ t=0.0–0.4s: Orbs fade in ─ */
  tl.to([orbCyan, orbGold], {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.in',
    stagger: 0.08,
  }, 0.0);

  /* ─ t=0.5s: Screen interior becomes visible ─ */
  tl.to(screenFill, {
    opacity: 1,
    duration: 0.3,
    ease: 'power1.out',
  }, 0.5);

  /* ─ t=0.8s: Lid outline draws (strokeDashoffset 100% → 0%) ─ */
  tl.to(lidPath, {
    strokeDashoffset: 0,
    duration: 0.6,
    ease: 'power2.out',
  }, 0.8);

  /* ─ t=1.0s: Base + hinge appears + screen glow fades in (20% opacity) ─ */
  tl.to([basePath, hingePath, touchpad], {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
    stagger: 0.05,
  }, 1.0);

  tl.to(basePath, {
    strokeDashoffset: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, 1.0);

  tl.to(screenGlowRect, {
    opacity: 0.2,
    duration: 0.5,
    ease: 'power1.in',
  }, 1.0);

  tl.to(screenOutline, {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.out',
  }, 1.0);

  /* ─ t=1.2s: Keyboard lines draw + scanline prep ─ */
  tl.to(kbLines, {
    opacity: 1,
    strokeDashoffset: 0,
    duration: 0.4,
    ease: 'power2.out',
    stagger: 0.06,
  }, 1.2);

  /* ─ t=1.5s: Screen glow intensifies (20% → 60%) + scanline activates ─ */
  tl.to(screenGlowRect, {
    opacity: 0.6,
    duration: 0.5,
    ease: 'power1.in',
  }, 1.5);

  tl.to(scanlineG, {
    opacity: 1,
    duration: 0.3,
    ease: 'power1.out',
    onStart: () => {
      scanlineActive = true;
      gsap.ticker.add(scanlineTicker);
    },
  }, 1.5);

  /* ─ t=2.0s: "Initializing..." text + progress bar appears ─ */
  tl.to(fo, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => {
      statusText.classList.add('visible');
    },
  }, 2.0);

  tl.to([progTrack, progFill], {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out',
  }, 2.0);

  // Progress bar: 0% → 30% over 0.5s
  tl.to(progFill, {
    attr: { width: PROG.w * 0.3 },
    duration: 0.5,
    ease: 'power1.inOut',
  }, 2.0);

  /* ─ t=2.5s: "Connecting..." + laptop scales 1.0 → 1.08 ─ */
  tl.add(() => {
    statusText.classList.remove('visible');
    // Allow transition to play before swapping text
    setTimeout(() => {
      statusText.textContent = 'Connecting...';
      statusText.classList.add('visible');
    }, 120);
  }, 2.5);

  tl.to(svg, {
    scale: 1.08,
    duration: 0.6,
    ease: 'power2.inOut',
    transformOrigin: '50% 50%',
  }, 2.5);

  // Progress bar: 30% → 65%
  tl.to(progFill, {
    attr: { width: PROG.w * 0.65 },
    duration: 0.5,
    ease: 'power1.inOut',
  }, 2.5);

  /* ─ t=3.0s: "Ready." in gold + scale 1.05 ─ */
  tl.add(() => {
    statusText.classList.remove('visible');
    setTimeout(() => {
      statusText.textContent = 'Ready.';
      statusText.classList.add(`${P}status-text`, 'visible', 'gold');
    }, 120);
  }, 3.0);

  tl.to(svg, {
    scale: 1.05,
    duration: 0.4,
    ease: 'power2.inOut',
    transformOrigin: '50% 50%',
  }, 3.0);

  // Progress bar: 65% → 90%
  tl.to(progFill, {
    attr: { width: PROG.w * 0.9 },
    duration: 0.5,
    ease: 'power1.inOut',
  }, 3.0);

  /* ─ t=3.5s: IS monogram appears on screen ─ */
  tl.add(() => {
    statusText.classList.remove('visible');
    requestAnimationFrame(() => {
      statusText.style.display = 'none';
      monogram.classList.add('visible');
    });
  }, 3.5);

  // Progress bar: 90% → 100%
  tl.to(progFill, {
    attr: { width: PROG.w },
    duration: 0.5,
    ease: 'power1.inOut',
  }, 3.5);

  /* ─ t=4.0s: Progress bar done; chassis fades; screen rect scales up ─ */
  // Fade chassis structural elements
  tl.to([lidPath, basePath, hingePath, touchpad, ...kbLines, progTrack, progFill], {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
    stagger: 0.02,
  }, 4.0);

  // Screen expands: scale the screen group / the whole SVG up to cover viewport
  // We transform the entire svgWrap (the centering div) to fill the container
  tl.to(svgWrap, {
    scale: 8,
    duration: 0.55,
    ease: 'power2.inOut',
    transformOrigin: '50% 50%',
  }, 4.0);

  // Fade out scanline as screen blows up
  tl.to(scanlineG, {
    opacity: 0,
    duration: 0.3,
    ease: 'power1.out',
    onComplete: () => {
      scanlineActive = false;
      gsap.ticker.remove(scanlineTicker);
    },
  }, 4.0);

  /* ─ t=4.5s: Screen fill bleeds to edges; begin overlay fade ─ */
  tl.to(screenFill, {
    opacity: 1,
    duration: 0.25,
    ease: 'power1.inOut',
  }, 4.5);

  /* ─ t=4.75s: Overlay opacity → 0 ─ */
  tl.to(container, {
    opacity: 0,
    duration: 0.3,
    ease: 'power1.inOut',
  }, 4.75);

  /* ─ t=5.0s: onComplete fires via timeline's onComplete above ─ */

  /* ── 7. Cleanup function ─────────────────────────────────────────────── */
  function cleanup(): void {
    // Stop scanline ticker
    scanlineActive = false;
    gsap.ticker.remove(scanlineTicker);

    // Kill timeline
    tl.kill();

    // Remove created DOM elements
    for (const el of createdElements) {
      el?.parentElement?.removeChild(el);
    }

    // Remove injected styles
    for (const s of createdStyles) {
      s.parentElement?.removeChild(s);
    }

    // Restore mobile content visibility
    if (mobileContent) mobileContent.style.display = '';
  }

  return { timeline: tl, cleanup };
}
