export const AI_PROVIDERS = {
  claude: {
    id: 'claude' as const,
    name: 'Claude',
    description: 'Anthropic Claude AI',
    model: 'claude-sonnet-4-20250514',
  },
  gemini: {
    id: 'gemini' as const,
    name: 'Gemini',
    description: 'Google Gemini AI',
    model: 'gemini-2.5-flash',
  },
} as const;

export const DEFAULT_AI_PROVIDER = 'claude' as const;

export const AI_PROVIDER_LABELS: Record<string, string> = {
  claude: 'Claude (Anthropic)',
  gemini: 'Gemini (Google)',
};
