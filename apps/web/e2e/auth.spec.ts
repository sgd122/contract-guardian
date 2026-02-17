import { test, expect } from "@playwright/test";

/**
 * Helper: open login page in a completely fresh browser context.
 * Waits for either the login form or a dashboard redirect.
 * Returns { page, context, isLoggedIn }.
 */
async function openFreshLoginPage(browser: import("@playwright/test").Browser) {
  const context = await browser.newContext({
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Wait for either the login form or dashboard redirect
  // The login page shows a spinner while useAuth resolves the session
  try {
    await Promise.race([
      page
        .getByRole("button", { name: "Google로 시작하기" })
        .waitFor({ timeout: 15000 }),
      page
        .getByRole("heading", { name: "분석 내역" })
        .waitFor({ timeout: 15000 }),
    ]);
  } catch {
    // May still be loading - wait a bit more
    await page.waitForTimeout(3000);
  }

  const isLoggedIn = page.url().includes("/dashboard");
  return { page, context, isLoggedIn };
}

test.describe("Authentication Flow", () => {
  test("login page renders correctly with all elements", async ({
    browser,
  }) => {
    const { page, context, isLoggedIn } = await openFreshLoginPage(browser);

    if (isLoggedIn) {
      await context.close();
      test.skip(true, "User already authenticated in browser");
      return;
    }

    await expect(
      page.getByRole("link", { name: "계약서 지킴이" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "로그인하고 계약서를 분석하세요" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Google로 시작하기" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "GitHub로 시작하기" })
    ).toBeVisible();

    await context.close();
  });

  test("OAuth buttons are visible and clickable", async ({ browser }) => {
    const { page, context, isLoggedIn } = await openFreshLoginPage(browser);

    if (isLoggedIn) {
      await context.close();
      test.skip(true, "User already authenticated in browser");
      return;
    }

    const googleButton = page.getByRole("button", {
      name: "Google로 시작하기",
    });
    const githubButton = page.getByRole("button", {
      name: "GitHub로 시작하기",
    });

    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();

    await context.close();
  });

  test("terms and privacy links have correct hrefs", async ({ browser }) => {
    const { page, context, isLoggedIn } = await openFreshLoginPage(browser);

    if (isLoggedIn) {
      await context.close();
      test.skip(true, "User already authenticated in browser");
      return;
    }

    const termsLink = page.getByRole("link", { name: "이용약관" });
    const privacyLink = page.getByRole("link", { name: "개인정보처리방침" });

    await expect(termsLink).toHaveAttribute("href", "/terms");
    await expect(privacyLink).toHaveAttribute("href", "/privacy");

    await context.close();
  });

  test("logo link navigates to home page", async ({ browser }) => {
    const { page, context, isLoggedIn } = await openFreshLoginPage(browser);

    if (isLoggedIn) {
      await context.close();
      test.skip(true, "User already authenticated in browser");
      return;
    }

    const logoLink = page
      .getByRole("link", { name: "계약서 지킴이" })
      .first();

    await expect(logoLink).toHaveAttribute("href", "/");
    await logoLink.click();
    await page.waitForURL("/", { timeout: 5000 });
    await expect(page).toHaveURL("/");

    await context.close();
  });
});

test.describe("Auth Guard", () => {
  test("unauthenticated user is redirected to login when accessing dashboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://localhost:3000",
    });
    const page = await context.newPage();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await context.close();
  });
});
