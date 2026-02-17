import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const TEST_USER = {
  email: "e2e-test@contract-guardian.local",
  password: "e2e-test-password-2026!",
  name: "E2E 테스트",
};

/**
 * Global setup: ensures a test user exists in local Supabase.
 * Runs once before all test projects.
 */
async function globalSetup() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if test user already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email === TEST_USER.email
  );

  if (existing) {
    // Update password in case it changed
    await admin.auth.admin.updateUserById(existing.id, {
      password: TEST_USER.password,
      email_confirm: true,
    });

    // Ensure profile exists
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", existing.id)
      .single();

    if (!profile) {
      await admin.from("profiles").upsert({
        id: existing.id,
        display_name: TEST_USER.name,
        email: TEST_USER.email,
        free_analyses_remaining: 0,
      });
    } else {
      // Ensure free analyses is 0 so payment flow tests work
      await admin
        .from("profiles")
        .update({ free_analyses_remaining: 0 })
        .eq("id", existing.id);
    }

    console.log(`[e2e] Test user exists: ${TEST_USER.email} (${existing.id})`);
    return;
  }

  // Create test user
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: { display_name: TEST_USER.name },
  });

  if (error) {
    throw new Error(`[e2e] Failed to create test user: ${error.message}`);
  }

  // Create profile with 0 free analyses (so payment flow tests work)
  await admin.from("profiles").upsert({
    id: data.user.id,
    display_name: TEST_USER.name,
    email: TEST_USER.email,
    free_analyses_remaining: 0,
  });

  console.log(`[e2e] Created test user: ${TEST_USER.email} (${data.user.id})`);
}

export default globalSetup;
