import { useState, useEffect, useCallback } from 'react';

interface Persona {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const personas: Persona[] = [
  {
    id: 'solo-entrepreneur',
    title: 'Solo Entrepreneur',
    icon: '🚀',
    description: 'I wear every hat and need to save time wherever I can.',
  },
  {
    id: 'team-manager',
    title: 'Team Manager',
    icon: '👥',
    description: 'I manage people and processes — and want both to run smoother.',
  },
  {
    id: 'business-owner',
    title: 'Business Owner',
    icon: '🏢',
    description: 'I need systems that scale without adding headcount.',
  },
  {
    id: 'employee',
    title: 'Employee',
    icon: '💼',
    description: 'I want to automate my own work and become the office hero.',
  },
  {
    id: 'just-browsing',
    title: 'Just Browsing',
    icon: '👀',
    description: 'Checking things out — show me everything.',
  },
];

const STORAGE_KEY = 'ineffable-persona';

export default function JarvisSelector() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Only show if no persona stored
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay to let page render first
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const selectPersona = useCallback((id: string) => {
    setSelectedId(id);
    localStorage.setItem(STORAGE_KEY, id);

    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('persona-selected', { detail: { persona: id } }));

    // Exit animation
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 500);
    }, 300);
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'just-browsing');
    window.dispatchEvent(new CustomEvent('persona-selected', { detail: { persona: 'just-browsing' } }));
    setExiting(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`jarvis-overlay ${exiting ? 'jarvis-exit' : ''}`}
      role="dialog"
      aria-label="Choose your role"
      aria-modal="true"
    >
      <div className="jarvis-backdrop" onClick={skip} />

      <div className="jarvis-container">
        <div className="jarvis-header">
          <div className="jarvis-greeting">
            <span className="jarvis-dot" />
            <span className="jarvis-label">JARVIS</span>
          </div>
          <h2 className="jarvis-title">Who are you?</h2>
          <p className="jarvis-subtitle">
            I'll tailor the experience to what matters most to you.
          </p>
        </div>

        <div className="jarvis-cards">
          {personas.map((persona, i) => (
            <button
              key={persona.id}
              className={`jarvis-card ${selectedId === persona.id ? 'jarvis-card-selected' : ''}`}
              onClick={() => selectPersona(persona.id)}
              style={{ '--delay': `${i * 0.08 + 0.2}s` } as React.CSSProperties}
            >
              <span className="jarvis-card-icon">{persona.icon}</span>
              <div className="jarvis-card-text">
                <span className="jarvis-card-title">{persona.title}</span>
                <span className="jarvis-card-desc">{persona.description}</span>
              </div>
            </button>
          ))}
        </div>

        <button className="jarvis-skip" onClick={skip}>
          Skip — show me everything
        </button>
      </div>
    </div>
  );
}
