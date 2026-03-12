import { useState, useCallback, useId } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ROIInputs {
  hoursPerWeek: number;
  hourlyCost: number;
  automationPercent: number;
}

interface ROIResults {
  weeklyHoursSaved: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
  annualSavings: number;
  paybackWeeks: number;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

// ─── Constants ────────────────────────────────────────────────────────────────

const CALENDLY_URL = 'https://calendly.com/luis-aviles-khn';

// Mid-point of Quick Win tier ($350–$700) for payback calc
const QUICK_WIN_MID = 525;

// ─── Task Type Presets ────────────────────────────────────────────────────────

interface TaskPreset {
  label: string;
  hoursPerWeek: number;
  hourlyCost: number;
  automationPercent: number;
}

const TASK_PRESETS: Record<string, TaskPreset> = {
  custom: {
    label: 'Custom (adjust manually)',
    hoursPerWeek: 10,
    hourlyCost: 50,
    automationPercent: 60,
  },
  data_entry: {
    label: 'Data entry & spreadsheets',
    hoursPerWeek: 8,
    hourlyCost: 45,
    automationPercent: 75,
  },
  report_gen: {
    label: 'Report generation',
    hoursPerWeek: 6,
    hourlyCost: 55,
    automationPercent: 80,
  },
  email_followups: {
    label: 'Email follow-ups',
    hoursPerWeek: 5,
    hourlyCost: 50,
    automationPercent: 70,
  },
  invoice: {
    label: 'Invoice processing',
    hoursPerWeek: 4,
    hourlyCost: 40,
    automationPercent: 85,
  },
  file_org: {
    label: 'File organization',
    hoursPerWeek: 3,
    hourlyCost: 35,
    automationPercent: 90,
  },
};

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 10000) {
    const k = value / 1000;
    return '$' + (Number.isInteger(k) ? k : k.toFixed(1)) + 'k';
  }
  return '$' + Math.round(value).toLocaleString('en-US');
}

function formatHours(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 1 ? '1 hr' : rounded.toFixed(1).replace(/\.0$/, '') + ' hrs';
}

// ─── ROI Calculation ──────────────────────────────────────────────────────────

function calculate(inputs: ROIInputs): ROIResults {
  const { hoursPerWeek, hourlyCost, automationPercent } = inputs;
  const frac = automationPercent / 100;

  const weeklyHoursSaved = hoursPerWeek * frac;
  const weeklyValueSaved = weeklyHoursSaved * hourlyCost;
  const dailySavings = weeklyValueSaved / 5;
  const weeklySavings = weeklyValueSaved;
  const monthlySavings = weeklyValueSaved * 4.33;
  const annualSavings = monthlySavings * 12;

  // Payback weeks = quick-win cost / weekly value recovered
  const paybackWeeks = weeklyValueSaved > 0 ? QUICK_WIN_MID / weeklyValueSaved : 0;

  return { weeklyHoursSaved, dailySavings, weeklySavings, monthlySavings, annualSavings, paybackWeeks };
}

// ─── Slider Sub-Component ─────────────────────────────────────────────────────

interface SliderProps {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  valueColor?: string;
}

function Slider({ id, label, hint, value, min, max, step, format, onChange, valueColor = '#ffc13b' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  // Gold fill from left to thumb, subtle white track to the right
  const trackBg = `linear-gradient(90deg, ${valueColor} 0%, ${valueColor} ${pct}%, rgba(255,255,255,0.09) ${pct}%, rgba(255,255,255,0.09) 100%)`;

  return (
    <div className="roi-slider-group">
      <div className="roi-slider-label-row">
        <label htmlFor={id} className="roi-slider-label">{label}</label>
        <span className="roi-slider-value" style={{ color: valueColor }}>{format(value)}</span>
      </div>
      {hint && <span className="roi-slider-hint">{hint}</span>}
      <input
        id={id}
        type="range"
        className="roi-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: trackBg }}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        data-accent={valueColor}
      />
      <div className="roi-slider-bounds">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Result Metric Card ───────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  large?: boolean;
}

function MetricCard({ label, value, sub, color, large }: MetricCardProps) {
  return (
    <div className="roi-metric-card">
      <span className="roi-metric-label">{label}</span>
      <span
        className="roi-metric-value"
        style={{
          color,
          fontSize: large ? '2.125rem' : '1.5rem',
        }}
      >
        {value}
      </span>
      <span className="roi-metric-sub">{sub}</span>
    </div>
  );
}

// ─── Before/After Visual Comparison ──────────────────────────────────────────

interface BeforeAfterBarProps {
  hoursPerWeek: number;
  hoursSaved: number;
}

function BeforeAfterBar({ hoursPerWeek, hoursSaved }: BeforeAfterBarProps) {
  const hoursAfter = Math.max(0, hoursPerWeek - hoursSaved);
  // afterPct is what remains as manual after automation
  const afterPct = hoursPerWeek > 0 ? Math.round((hoursAfter / hoursPerWeek) * 100) : 100;
  // savedPct is what's eliminated
  const savedPct = 100 - afterPct;

  return (
    <div className="roi-bar-comparison" aria-label="Before and after hours comparison">
      <div className="roi-bar-row">
        <span className="roi-bar-label">Now</span>
        <div className="roi-bar-track" role="img" aria-label={`Currently ${hoursPerWeek} hours per week manual`}>
          <div className="roi-bar-fill roi-bar-fill--before" style={{ width: '100%' }}>
            <span className="roi-bar-fill-label">{hoursPerWeek} hrs/wk manual</span>
          </div>
        </div>
      </div>
      <div className="roi-bar-row">
        <span className="roi-bar-label">After</span>
        <div className="roi-bar-track" role="img" aria-label={`After automation: ${formatHours(hoursAfter)} manual, ${formatHours(hoursSaved)} automated`}>
          {hoursAfter > 0 && (
            <div
              className="roi-bar-fill roi-bar-fill--after"
              style={{ width: `${afterPct}%` }}
            >
              {afterPct > 20 && (
                <span className="roi-bar-fill-label">{formatHours(hoursAfter)} left</span>
              )}
            </div>
          )}
          {savedPct > 0 && (
            <div
              className="roi-bar-fill roi-bar-fill--saved"
              style={{ width: `${savedPct}%` }}
            >
              {savedPct > 15 && (
                <span className="roi-bar-fill-label">−{formatHours(hoursSaved)} freed</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Agency Cost Comparison ───────────────────────────────────────────────────

interface AgencyComparisonProps {
  annualSavings: number;
}

function AgencyComparison({ annualSavings }: AgencyComparisonProps) {
  const roiPct = annualSavings > 0 ? Math.round((annualSavings / QUICK_WIN_MID) * 100) : 0;

  return (
    <div className="roi-agency-comparison" aria-label="Cost comparison">
      <div className="roi-agency-header">
        <span className="roi-agency-eyebrow">Cost Comparison</span>
        <span className="roi-agency-title">Why Ineffable vs. alternatives</span>
      </div>
      <div className="roi-agency-grid">
        <div className="roi-agency-card roi-agency-card--dim">
          <span className="roi-agency-card-label">Your manual cost</span>
          <span className="roi-agency-card-value" style={{ color: '#ff4757' }}>
            {formatCurrency(annualSavings)}
            <span className="roi-agency-card-period">/yr</span>
          </span>
          <span className="roi-agency-card-sub">Current state — doing it by hand</span>
        </div>
        <div className="roi-agency-card roi-agency-card--highlight">
          <span className="roi-agency-card-label">Ineffable Quick Win</span>
          <span className="roi-agency-card-value" style={{ color: '#ffc13b' }}>
            $350–$700
            <span className="roi-agency-card-period"> one-time</span>
          </span>
          <span className="roi-agency-card-sub">Eliminates the problem permanently</span>
        </div>
        <div className="roi-agency-card roi-agency-card--dim">
          <span className="roi-agency-card-label">Typical agency quote</span>
          <span className="roi-agency-card-value" style={{ color: '#6b7280' }}>
            $2k–$5k
            <span className="roi-agency-card-period"> one-time</span>
          </span>
          <span className="roi-agency-card-sub">Same deliverable, marked up 5–10×</span>
        </div>
        <div className="roi-agency-card roi-agency-card--roi">
          <span className="roi-agency-card-label">Your ROI with Ineffable</span>
          <span className="roi-agency-card-value" style={{ color: '#00ff88' }}>
            {roiPct > 0 ? `${roiPct.toLocaleString('en-US')}%` : '—'}
          </span>
          <span className="roi-agency-card-sub">Annual savings ÷ $525 avg investment</span>
        </div>
      </div>
    </div>
  );
}

// ─── Time Period Toggle ───────────────────────────────────────────────────────

interface TimePeriodToggleProps {
  value: TimePeriod;
  onChange: (v: TimePeriod) => void;
}

const TIME_PERIOD_OPTIONS: { key: TimePeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual', label: 'Annual' },
];

function TimePeriodToggle({ value, onChange }: TimePeriodToggleProps) {
  return (
    <div className="roi-time-toggle" role="group" aria-label="Savings display period">
      {TIME_PERIOD_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`roi-time-btn${value === key ? ' roi-time-btn--active' : ''}`}
          onClick={() => onChange(key)}
          aria-pressed={value === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ROICalculator({ compact = false }: { compact?: boolean }) {
  const uid = useId();

  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('annual');

  const [inputs, setInputs] = useState<ROIInputs>({
    hoursPerWeek: 10,
    hourlyCost: 50,
    automationPercent: 60,
  });

  const results = calculate(inputs);

  const setHours   = useCallback((v: number) => {
    setSelectedPreset('custom');
    setInputs((p) => ({ ...p, hoursPerWeek: v }));
  }, []);
  const setCost    = useCallback((v: number) => {
    setSelectedPreset('custom');
    setInputs((p) => ({ ...p, hourlyCost: v }));
  }, []);
  const setPercent = useCallback((v: number) => {
    setSelectedPreset('custom');
    setInputs((p) => ({ ...p, automationPercent: v }));
  }, []);

  const handlePresetChange = useCallback((key: string) => {
    setSelectedPreset(key);
    if (key !== 'custom') {
      const preset = TASK_PRESETS[key];
      setInputs({
        hoursPerWeek: preset.hoursPerWeek,
        hourlyCost: preset.hourlyCost,
        automationPercent: preset.automationPercent,
      });
    }
  }, []);

  // Payback display logic
  let paybackDisplay: string;
  let paybackSub: string;

  if (results.paybackWeeks <= 0) {
    paybackDisplay = '—';
    paybackSub = 'Adjust inputs above';
  } else if (results.paybackWeeks < 1) {
    paybackDisplay = '< 1 week';
    paybackSub = 'A $350–$700 Quick Win pays for itself';
  } else {
    const weeks = Math.ceil(results.paybackWeeks);
    paybackDisplay = `${weeks} week${weeks === 1 ? '' : 's'}`;
    paybackSub = 'A $350–$700 Quick Win pays for itself';
  }

  // Time-period-aware savings value and label
  const savingsForPeriod: Record<TimePeriod, number> = {
    daily: results.dailySavings,
    weekly: results.weeklySavings,
    monthly: results.monthlySavings,
    annual: results.annualSavings,
  };
  const periodLabel: Record<TimePeriod, string> = {
    daily: 'per day',
    weekly: 'per week',
    monthly: 'per month',
    annual: 'per year',
  };
  const periodSub: Record<TimePeriod, string> = {
    daily: '÷ 5 workdays',
    weekly: '4.33 weeks/mo basis',
    monthly: '4.33 weeks × weekly value',
    annual: 'Conservative floor estimate',
  };

  const currentSavings = savingsForPeriod[timePeriod];
  const currentPeriodLabel = periodLabel[timePeriod];

  return (
    <div className={`roi-root${compact ? ' roi-compact' : ''}`} role={compact ? undefined : 'region'} aria-label="ROI Calculator — estimate your automation savings">
      {/* Scoped styles — islands don't share global stylesheets */}
      <style>{SCOPED_CSS}</style>

      <div className="roi-container">
        {/* ── Header ──────────────────────────────────────────── */}
        {!compact && (
          <div className="roi-header">
            <span className="roi-eyebrow">ROI CALCULATOR</span>
            <h2 className="roi-heading">What's your busywork costing you?</h2>
            <p className="roi-subheading">Slide the numbers. See the math. No fluff.</p>
          </div>
        )}

        {/* ── Two-column layout ───────────────────────────────── */}
        <div className="roi-layout">

          {/* ── Input Panel ──────────────────────────────────── */}
          <div className="roi-input-panel">

            {/* Task Type Preset Dropdown */}
            <div className="roi-preset-group">
              <label htmlFor={`${uid}-preset`} className="roi-preset-label">
                Task type
              </label>
              <div className="roi-preset-select-wrap">
                <select
                  id={`${uid}-preset`}
                  className="roi-preset-select"
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  aria-label="Select a task type to auto-fill example values"
                >
                  {Object.entries(TASK_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.label}</option>
                  ))}
                </select>
                <svg className="roi-preset-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {selectedPreset !== 'custom' && (
                <span className="roi-preset-hint">
                  Preset loaded — adjust sliders to match your situation
                </span>
              )}
            </div>

            <Slider
              id={`${uid}-hours`}
              label="Manual task hours per week"
              hint="Time spent on repetitive work you'd love to eliminate"
              value={inputs.hoursPerWeek}
              min={1}
              max={40}
              step={1}
              format={(v) => `${v} hr${v === 1 ? '' : 's'}`}
              onChange={setHours}
              valueColor="#ffc13b"
            />

            <Slider
              id={`${uid}-cost`}
              label="Your effective hourly cost"
              hint="Salary + overhead ÷ hours — or your billing/consulting rate"
              value={inputs.hourlyCost}
              min={15}
              max={200}
              step={5}
              format={(v) => `$${v}`}
              onChange={setCost}
              valueColor="#00e5ff"
            />

            <Slider
              id={`${uid}-pct`}
              label="Percentage of that work automatable"
              hint="Most repetitive tasks: 50–80% can be fully eliminated"
              value={inputs.automationPercent}
              min={20}
              max={90}
              step={10}
              format={(v) => `${v}%`}
              onChange={setPercent}
              valueColor="#00ff88"
            />

            {/* Before/After Visual Comparison */}
            <BeforeAfterBar
              hoursPerWeek={inputs.hoursPerWeek}
              hoursSaved={results.weeklyHoursSaved}
            />

            <p className="roi-context-note">
              Based on{' '}
              <strong className="roi-context-strong">{inputs.hoursPerWeek} hrs/week</strong>
              {' '}at{' '}
              <strong className="roi-context-strong">${inputs.hourlyCost}/hr</strong>
              {' '}with{' '}
              <strong className="roi-context-strong">{inputs.automationPercent}%</strong>
              {' '}automated.
            </p>
          </div>

          {/* ── Results Panel ─────────────────────────────────── */}
          <div className="roi-results-panel" aria-live="polite" aria-atomic="true">

            {/* Time Period Toggle */}
            <TimePeriodToggle value={timePeriod} onChange={setTimePeriod} />

            {/* 2x2 metric grid */}
            <div className="roi-metrics-grid">
              <MetricCard
                label="Hours recovered"
                value={formatHours(results.weeklyHoursSaved)}
                sub={`${inputs.automationPercent}% of ${inputs.hoursPerWeek} hrs/week`}
                color="#ffc13b"
                large
              />
              <MetricCard
                label={`Savings ${currentPeriodLabel}`}
                value={formatCurrency(currentSavings)}
                sub={periodSub[timePeriod]}
                color="#00e5ff"
                large
              />
              <MetricCard
                label="Annual impact"
                value={formatCurrency(results.annualSavings)}
                sub="Conservative floor estimate"
                color="#00ff88"
                large
              />
              <MetricCard
                label="Payback period"
                value={paybackDisplay}
                sub={paybackSub}
                color="#ffc13b"
              />
            </div>

            {/* Agency Cost Comparison */}
            <AgencyComparison annualSavings={results.annualSavings} />

            {/* Gold callout strip */}
            <div className="roi-callout" role="note">
              <span className="roi-callout-bolt" aria-hidden="true">⚡</span>
              <p className="roi-callout-text">
                A Quick Win ($350–$700) that reclaims{' '}
                <strong className="roi-callout-strong">{formatHours(results.weeklyHoursSaved)}/week</strong>
                {' '}returns{' '}
                <strong className="roi-callout-strong">{formatCurrency(currentSavings)}/{timePeriod === 'annual' ? 'year' : timePeriod === 'monthly' ? 'month' : timePeriod === 'weekly' ? 'week' : 'day'}</strong>.
                {' '}That's not a cost — it's an investment.
              </p>
            </div>

            {/* CTA */}
            <div className="roi-cta-block">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="roi-cta-btn"
                aria-label="Book a free 15-minute call to discuss automating your tasks"
              >
                <span>Book a Call to Discuss</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <span className="roi-cta-note">Free 15-minute scoping call — no obligation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
// Injected via <style> so this island is fully self-contained.
// CSS custom properties from design-tokens.css are NOT available in React islands —
// all values are inlined here against the design system spec.

const SCOPED_CSS = `
  /* ── Reset scoping ── */
  .roi-root *,
  .roi-root *::before,
  .roi-root *::after {
    box-sizing: border-box;
  }

  /* ── Root ── */
  .roi-root {
    padding: clamp(3rem, 5vw, 5rem) 0;
    font-family: 'Satoshi', 'Outfit', system-ui, -apple-system, sans-serif;
    color: #e8eaf0;
    position: relative;
  }

  /* ── Container ── */
  .roi-container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 4vw, 2rem);
  }

  /* ── Header ── */
  .roi-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .roi-eyebrow {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ffc13b;
    margin-bottom: 0.875rem;
  }

  .roi-heading {
    font-family: 'Cabinet Grotesk', 'Outfit', system-ui, sans-serif;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #e8eaf0;
    margin: 0 0 0.75rem;
  }

  .roi-subheading {
    font-size: clamp(0.9375rem, 1.5vw, 1.0625rem);
    color: #a0a8bb;
    line-height: 1.6;
    margin: 0;
  }

  /* ── Layout ── */
  .roi-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
  }

  /* ── Input Panel ── */
  .roi-input-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: clamp(1.5rem, 3vw, 2rem);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  /* ── Preset Dropdown ── */
  .roi-preset-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .roi-preset-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e8eaf0;
    letter-spacing: 0.01em;
  }

  .roi-preset-select-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .roi-preset-select {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e8eaf0;
    font-family: 'Satoshi', 'Outfit', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.625rem 2.5rem 0.625rem 0.875rem;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
    outline: none;
  }

  .roi-preset-select:hover {
    border-color: rgba(255, 193, 59, 0.35);
    background: rgba(255, 193, 59, 0.04);
  }

  .roi-preset-select:focus-visible {
    border-color: #00e5ff;
    box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.18);
  }

  .roi-preset-select option {
    background: #141420;
    color: #e8eaf0;
  }

  .roi-preset-chevron {
    position: absolute;
    right: 0.75rem;
    color: #6b7280;
    pointer-events: none;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  .roi-preset-select:hover ~ .roi-preset-chevron,
  .roi-preset-select:focus-visible ~ .roi-preset-chevron {
    color: #ffc13b;
  }

  .roi-preset-hint {
    font-size: 0.72rem;
    color: #ffc13b;
    opacity: 0.75;
    line-height: 1.5;
    font-style: italic;
  }

  /* ── Slider group ── */
  .roi-slider-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .roi-slider-label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  .roi-slider-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e8eaf0;
    letter-spacing: 0.01em;
    cursor: pointer;
  }

  .roi-slider-value {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 4.5rem;
    text-align: right;
    transition: color 0.25s ease;
  }

  .roi-slider-hint {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.5;
  }

  /* ── Range input base ── */
  .roi-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    transition: background 0.1s ease;
    margin: 0.375rem 0 0;
  }

  /* WebKit thumb */
  .roi-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffc13b;
    border: 2.5px solid #0a0a12;
    box-shadow:
      0 0 0 3px rgba(255, 193, 59, 0.22),
      0 2px 8px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition:
      transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    margin-top: -8px;
  }

  .roi-slider::-webkit-slider-thumb:hover {
    transform: scale(1.25);
    box-shadow:
      0 0 0 5px rgba(255, 193, 59, 0.18),
      0 4px 12px rgba(0, 0, 0, 0.6);
  }

  .roi-slider:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  /* Firefox thumb */
  .roi-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffc13b;
    border: 2.5px solid #0a0a12;
    box-shadow:
      0 0 0 3px rgba(255, 193, 59, 0.22),
      0 2px 8px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition:
      transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .roi-slider::-moz-range-thumb:hover {
    transform: scale(1.25);
    box-shadow:
      0 0 0 5px rgba(255, 193, 59, 0.18),
      0 4px 12px rgba(0, 0, 0, 0.6);
  }

  /* WCAG 2.4.7 focus-visible ring (cyan per design tokens) */
  .roi-slider:focus-visible {
    outline: none;
  }

  .roi-slider:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 4px rgba(0, 229, 255, 0.55),
      0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .roi-slider:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 4px rgba(0, 229, 255, 0.55),
      0 2px 8px rgba(0, 0, 0, 0.5);
  }

  /* Slider bounds */
  .roi-slider-bounds {
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.6875rem;
    color: #4a4a5c;
    margin-top: 0.2rem;
  }

  /* ── Before/After Bar ── */
  .roi-bar-comparison {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 1.25rem;
  }

  .roi-bar-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .roi-bar-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b7280;
    width: 2.5rem;
    flex-shrink: 0;
  }

  .roi-bar-track {
    flex: 1;
    height: 28px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
  }

  .roi-bar-fill {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    border-radius: 6px;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    min-width: 0;
  }

  .roi-bar-fill--before {
    background: rgba(255, 71, 87, 0.25);
    border: 1px solid rgba(255, 71, 87, 0.35);
  }

  .roi-bar-fill--after {
    background: rgba(255, 71, 87, 0.12);
    border: 1px solid rgba(255, 71, 87, 0.18);
  }

  .roi-bar-fill--saved {
    background: rgba(0, 255, 136, 0.14);
    border: 1px solid rgba(0, 255, 136, 0.28);
  }

  .roi-bar-fill-label {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.6875rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #a0a8bb;
  }

  .roi-bar-fill--saved .roi-bar-fill-label {
    color: #00ff88;
  }

  /* Context note */
  .roi-context-note {
    font-size: 0.8125rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 1.25rem;
  }

  .roi-context-strong {
    color: #a0a8bb;
    font-weight: 600;
  }

  /* ── Results Panel ── */
  .roi-results-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* ── Time Period Toggle ── */
  .roi-time-toggle {
    display: flex;
    gap: 0.25rem;
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 100px;
    padding: 0.25rem;
    align-self: flex-start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  .roi-time-btn {
    padding: 0.3125rem 0.875rem;
    border-radius: 100px;
    border: none;
    background: transparent;
    color: #6b7280;
    font-family: 'Satoshi', 'Outfit', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease;
    white-space: nowrap;
  }

  .roi-time-btn:hover {
    color: #a0a8bb;
  }

  .roi-time-btn--active {
    background: rgba(255, 193, 59, 0.12);
    color: #ffc13b;
    box-shadow: 0 0 0 1px rgba(255, 193, 59, 0.25);
  }

  .roi-time-btn:focus-visible {
    outline: 2px solid #00e5ff;
    outline-offset: 2px;
  }

  /* ── Metrics grid ── */
  .roi-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .roi-metric-card {
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .roi-metric-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  }

  .roi-metric-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .roi-metric-value {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.1;
    transition: color 0.3s ease;
  }

  .roi-metric-sub {
    font-size: 0.72rem;
    color: #4a4a5c;
    line-height: 1.5;
  }

  /* ── Agency Comparison ── */
  .roi-agency-comparison {
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .roi-agency-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .roi-agency-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .roi-agency-title {
    font-family: 'Cabinet Grotesk', 'Outfit', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #e8eaf0;
    line-height: 1.3;
  }

  .roi-agency-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }

  .roi-agency-card {
    border-radius: 10px;
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: 1px solid transparent;
    transition: border-color 0.2s ease;
  }

  .roi-agency-card--dim {
    background: rgba(255, 255, 255, 0.025);
    border-color: rgba(255, 255, 255, 0.04);
  }

  .roi-agency-card--highlight {
    background: rgba(255, 193, 59, 0.06);
    border-color: rgba(255, 193, 59, 0.2);
    box-shadow: 0 0 20px rgba(255, 193, 59, 0.05);
  }

  .roi-agency-card--roi {
    background: rgba(0, 255, 136, 0.05);
    border-color: rgba(0, 255, 136, 0.15);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.04);
  }

  .roi-agency-card-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .roi-agency-card-value {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .roi-agency-card-period {
    font-size: 0.6875rem;
    font-weight: 500;
    opacity: 0.7;
    letter-spacing: 0;
  }

  .roi-agency-card-sub {
    font-size: 0.6875rem;
    color: #4a4a5c;
    line-height: 1.5;
  }

  /* ── Callout ── */
  .roi-callout {
    display: flex;
    gap: 0.875rem;
    align-items: flex-start;
    background: rgba(255, 193, 59, 0.06);
    border: 1px solid rgba(255, 193, 59, 0.18);
    border-radius: 12px;
    padding: 1.125rem 1.25rem;
    box-shadow: 0 0 24px rgba(255, 193, 59, 0.05);
  }

  .roi-callout-bolt {
    font-size: 1.125rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  .roi-callout-text {
    font-size: 0.875rem;
    color: #a0a8bb;
    line-height: 1.65;
    margin: 0;
  }

  .roi-callout-strong {
    color: #ffc13b;
    font-weight: 700;
  }

  /* ── CTA block ── */
  .roi-cta-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.625rem;
  }

  .roi-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #ffc13b 0%, #ff8f00 100%);
    color: #0a0a12;
    padding: 0.9375rem 2rem;
    border-radius: 6px;
    font-family: 'Satoshi', 'Outfit', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(255, 193, 59, 0.2);
    transition:
      transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  }

  .roi-cta-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 35px rgba(255, 193, 59, 0.38);
  }

  .roi-cta-btn:focus-visible {
    outline: 2px solid #00e5ff;
    outline-offset: 3px;
  }

  .roi-cta-note {
    font-size: 0.75rem;
    color: #4a4a5c;
    line-height: 1.5;
  }

  /* ── Responsive: single column below 720px ── */
  @media (max-width: 720px) {
    .roi-layout {
      grid-template-columns: 1fr;
    }

    .roi-metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .roi-agency-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .roi-time-toggle {
      align-self: stretch;
      justify-content: center;
    }
  }

  /* ── Responsive: stack metric grid on small phones ── */
  @media (max-width: 480px) {
    .roi-metrics-grid {
      grid-template-columns: 1fr;
    }

    .roi-agency-grid {
      grid-template-columns: 1fr;
    }

    .roi-cta-btn {
      width: 100%;
      justify-content: center;
    }

    .roi-cta-block {
      align-items: stretch;
    }

    .roi-time-toggle {
      justify-content: space-between;
    }

    .roi-time-btn {
      flex: 1;
      text-align: center;
    }
  }

  /* ── Compact mode (embedded in merged section) ── */
  .roi-compact {
    padding: 0;
  }
  .roi-compact .roi-container {
    max-width: 100%;
    padding: 0;
  }
  .roi-compact .roi-layout {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .roi-slider,
    .roi-cta-btn,
    .roi-metric-card,
    .roi-metric-value,
    .roi-slider-value,
    .roi-bar-fill,
    .roi-preset-select,
    .roi-time-btn {
      transition: none !important;
    }

    .roi-slider::-webkit-slider-thumb,
    .roi-slider::-moz-range-thumb {
      transition: none !important;
    }
  }
`;
