export const AI_PROVIDERS = {
  claude: {
    id: 'claude' as const,
    name: 'Claude',
    description: 'Anthropic Claude AI',
    model: 'claude-sonnet-4-20250514',
    costPerInputToken: 0.000003, // $3 per 1M input tokens
    costPerOutputToken: 0.000015, // $15 per 1M output tokens
  },
  gemini: {
    id: 'gemini' as const,
    name: 'Gemini',
    description: 'Google Gemini AI',
    model: 'gemini-2.5-flash',
    costPerInputToken: 0.00000015, // $0.15 per 1M input tokens
    costPerOutputToken: 0.0000006, // $0.60 per 1M output tokens
  },
} as const;

export const DEFAULT_AI_PROVIDER = 'claude' as const;

export const AI_PROVIDER_LABELS: Record<string, string> = {
  claude: 'Claude (Anthropic)',
  gemini: 'Gemini (Google)',
};
