import type { Config } from "tailwindcss";

const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        danger: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        success: {
          DEFAULT: "#22c55e",
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },
    },
  },
};

export default baseConfig;
