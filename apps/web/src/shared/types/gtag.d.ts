interface Window {
  gtag: (
    command: "config" | "event" | "js" | "set",
    targetOrAction: string | Date,
    params?: Record<string, unknown>
  ) => void;
  dataLayer: unknown[];
}
