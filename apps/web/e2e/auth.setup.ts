import { test as setup, expect } from "@playwright/test";

/**
 * Logs in via the test account and saves the auth state for reuse.
 */
setup("authenticate via test account", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "테스트 계정으로 로그인" })
  ).toBeVisible();

  await page
    .getByRole("button", { name: "테스트 계정으로 로그인" })
    .click();

  await page.waitForURL("/dashboard");
  await expect(page.getByRole("heading", { name: "분석 내역" })).toBeVisible();

  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
