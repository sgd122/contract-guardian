import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    // Setup project: authenticate and save state
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Public pages: no auth needed
    {
      name: "public",
      testMatch: /public.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Auth tests: test login flow itself (no stored state)
    {
      name: "auth",
      testMatch: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Authenticated pages: depend on setup
    {
      name: "authenticated",
      testMatch: /(?:dashboard|analysis|navigation)\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
