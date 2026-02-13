import { z } from "zod";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// 빌드/런타임 공통 스키마 (서버 전용 키는 항상 optional로 파싱)
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  TOSS_SECRET_KEY: z.string().optional(),
});

// 런타임에서 보장되는 타입 (서버 전용 키 필수)
type RuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY: string;
  GOOGLE_GEMINI_API_KEY?: string;
  TOSS_SECRET_KEY: string;
};

// Known placeholder values that must not be used in production
const PLACEHOLDER_SECRETS = [
  "your-super-secret-and-long-postgres-password",
  "super-secret-jwt-token-with-at-least-32-characters-long",
  "eyJpc3MiOiJzdXBhYmFzZS1kZW1vIi", // Supabase demo JWT payload (iss: "supabase-demo")
];

function validateEnv(): RuntimeEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Missing or invalid environment variables:\n${missing}\n\nCheck your .env file or deployment configuration.`
    );
  }

  // 빌드 시에는 서버 전용 키 검증 건너뛰기
  if (!isBuildPhase) {
    const requiredServerKeys = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "ANTHROPIC_API_KEY",
      "TOSS_SECRET_KEY",
    ] as const;

    const missingKeys = requiredServerKeys.filter((key) => !result.data[key]);
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing or invalid environment variables:\n${missingKeys.map((k) => `  - ${k}: Required`).join("\n")}\n\nCheck your .env file or deployment configuration.`
      );
    }

    // In production runtime, reject known placeholder/demo secrets
    if (process.env.NODE_ENV === "production") {
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
  }

  return result.data as RuntimeEnv;
}

export const env = validateEnv();
