import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page renders correctly with all elements", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "계약서 지킴이" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "로그인하고 계약서를 분석하세요" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "카카오로 시작하기" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Google로 시작하기" })
    ).toBeVisible();
    await expect(page.getByText("개발 테스트 로그인")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "테스트 계정으로 로그인" })
    ).toBeVisible();
  });

  test("OAuth buttons are visible and clickable", async ({ page }) => {
    const kakaoButton = page.getByRole("button", {
      name: "카카오로 시작하기",
    });
    const googleButton = page.getByRole("button", {
      name: "Google로 시작하기",
    });

    await expect(kakaoButton).toBeVisible();
    await expect(kakaoButton).toBeEnabled();
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test("test login form has prefilled values", async ({ page }) => {
    // The inputs use Korean placeholder/label: "이메일" and "비밀번호"
    const emailInput = page.getByRole("textbox", { name: "이메일" });
    const passwordInput = page.getByRole("textbox", { name: "비밀번호" });

    await expect(emailInput).toHaveValue("test@test.com");
    await expect(passwordInput).toHaveValue("test1234");
  });

  test("test account login succeeds and redirects to dashboard", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "테스트 계정으로 로그인" })
      .click();

    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("after login, user name is visible in header", async ({ page }) => {
    await page
      .getByRole("button", { name: "테스트 계정으로 로그인" })
      .click();

    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page.getByText("테스트계정")).toBeVisible();
  });

  test("terms and privacy links have correct hrefs", async ({ page }) => {
    const termsLink = page.getByRole("link", { name: "이용약관" });
    const privacyLink = page.getByRole("link", { name: "개인정보처리방침" });

    await expect(termsLink).toHaveAttribute("href", "/terms");
    await expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  test("logo link navigates to home page", async ({ page }) => {
    const logoLink = page
      .getByRole("link", { name: "계약서 지킴이" })
      .first();

    await expect(logoLink).toHaveAttribute("href", "/");
    await logoLink.click();
    await page.waitForURL("/", { timeout: 5000 });
    await expect(page).toHaveURL("/");
  });
});

test.describe("Authentication State Persistence", () => {
  test("authenticated user stays logged in after page reload", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("button", { name: "테스트 계정으로 로그인" })
      .click();
    await page.waitForURL("/dashboard", { timeout: 10000 });

    await page.reload();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("테스트계정")).toBeVisible();
  });

  test("unauthenticated user is redirected to login when accessing dashboard", async ({
    browser,
  }) => {
    // Create fresh context without auth state
    const context = await browser.newContext({
      baseURL: "http://localhost:3000",
    });
    const page = await context.newPage();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});
