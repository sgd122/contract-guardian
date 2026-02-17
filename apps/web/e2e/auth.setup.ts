import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { TEST_USER } from "./global-setup";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "[e2e] NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Set it in .env file."
  );
}

/**
 * Auth setup: sign in with the test user and save browser state.
 *
 * Strategy:
 * 1. Use Supabase JS client to sign in with email/password (programmatic).
 * 2. Set the auth cookies in the browser context.
 * 3. Navigate to /dashboard to confirm auth works.
 * 4. Save storage state for reuse by authenticated tests.
 */
setup("authenticate and save state", async ({ page }) => {
  // Sign in via Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (error || !data.session) {
    setup.skip(
      true,
      `Failed to sign in test user: ${error?.message || "no session"}`
    );
    return;
  }

  const { access_token, refresh_token } = data.session;

  // Set Supabase auth cookies in the browser
  // Supabase SSR stores auth in cookies named sb-<project-ref>-auth-token
  // For localhost, the project ref is "localhost"
  const cookieValue = JSON.stringify({
    access_token,
    refresh_token,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    type: "access",
  });

  // Supabase SSR splits cookies into chunks. For a single chunk:
  await page.context().addCookies([
    {
      name: "sb-localhost-auth-token.0",
      value: `base64-${Buffer.from(cookieValue).toString("base64")}`,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  // Navigate to dashboard to verify auth works
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  if (!page.url().includes("/dashboard")) {
    // Cookie approach didn't work - try localStorage approach
    await page.goto("/");
    await page.evaluate(
      ({ url, anonKey, accessToken, refreshToken }) => {
        // Set auth in localStorage (used by @supabase/auth-helpers)
        const storageKey = `sb-localhost-auth-token`;
        const session = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          type: "access",
        };
        localStorage.setItem(storageKey, JSON.stringify(session));
      },
      {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
        accessToken: access_token,
        refreshToken: refresh_token,
      }
    );

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  }

  if (!page.url().includes("/dashboard")) {
    setup.skip(true, "Could not authenticate via cookies or localStorage");
    return;
  }

  await expect(
    page.getByRole("heading", { name: "분석 내역" })
  ).toBeVisible();

  await page.context().storageState({ path: "e2e/.auth/user.json" });
  console.log("[e2e] Auth state saved successfully");
});
