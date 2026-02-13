import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  TOSS_SECRET_KEY: z.string().min(1, "TOSS_SECRET_KEY is required"),
});

// Known placeholder values that must not be used in production
const PLACEHOLDER_SECRETS = [
  "your-super-secret-and-long-postgres-password",
  "super-secret-jwt-token-with-at-least-32-characters-long",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // Supabase demo JWT prefix
];

function validateEnv() {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Missing or invalid environment variables:\n${missing}\n\nCheck your .env file or deployment configuration.`
    );
  }

  // In production runtime (not during build), reject known placeholder/demo secrets
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuildPhase) {
    const sensitiveKeys = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "TOSS_SECRET_KEY",
    ] as const;

    for (const key of sensitiveKeys) {
      const value = result.data[key];
      if (
        value &&
        PLACEHOLDER_SECRETS.some((placeholder) => value.includes(placeholder))
      ) {
        throw new Error(
          `SECURITY: ${key} contains a placeholder/demo value. Replace with a real secret before deploying to production.`
        );
      }
    }
  }

  return result.data;
}

export const env = validateEnv();
