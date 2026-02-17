export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  analyses: {
    all: ["analyses"] as const,
    detail: (id: string) => ["analyses", id] as const,
    resume: (id: string) => ["analyses", "resume", id] as const,
  },
  payments: {
    history: ["payments", "history"] as const,
  },
} as const;
