export interface Persona {
  id: string;
  title: string;
  icon: string;
  description: string;
  /** Preferred order of homepage section IDs */
  sectionOrder: string[];
}

export const personas: Persona[] = [
  {
    id: 'solo-entrepreneur',
    title: 'Solo Entrepreneur',
    icon: '🚀',
    description: 'I wear every hat and need to save time wherever I can.',
    sectionOrder: ['services', 'automation-highlight', 'stats', 'case-studies', 'time-savings', 'cta'],
  },
  {
    id: 'team-manager',
    title: 'Team Manager',
    icon: '👥',
    description: 'I manage people and processes — and want both to run smoother.',
    sectionOrder: ['time-savings', 'stats', 'services', 'automation-highlight', 'case-studies', 'cta'],
  },
  {
    id: 'business-owner',
    title: 'Business Owner',
    icon: '🏢',
    description: 'I need systems that scale without adding headcount.',
    sectionOrder: ['stats', 'case-studies', 'services', 'time-savings', 'automation-highlight', 'cta'],
  },
  {
    id: 'employee',
    title: 'Employee',
    icon: '💼',
    description: 'I want to automate my own work and become the office hero.',
    sectionOrder: ['automation-highlight', 'services', 'time-savings', 'stats', 'case-studies', 'cta'],
  },
  {
    id: 'just-browsing',
    title: 'Just Browsing',
    icon: '👀',
    description: 'Checking things out — show me everything.',
    sectionOrder: ['services', 'stats', 'case-studies', 'time-savings', 'automation-highlight', 'cta'],
  },
];

export const STORAGE_KEY = 'ineffable-persona';
