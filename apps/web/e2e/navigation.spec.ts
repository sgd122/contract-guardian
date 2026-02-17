import { test, expect } from "@playwright/test";

test.describe("Navigation and Common Elements", () => {
  test.describe("Authenticated Header", () => {
    test("shows correct nav links and logo", async ({ page }) => {
      await page.goto("/dashboard");

      const logo = page
        .getByRole("link", { name: "계약서 지킴이" })
        .first();
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute("href", "/");

      await expect(
        page.getByRole("link", { name: "대시보드" })
      ).toBeVisible();
      const nav = page.locator("header nav");
      await expect(
        nav.getByRole("link", { name: "분석하기" })
      ).toBeVisible();

      // User profile button should be visible in header
      const userButton = page.locator("header").getByRole("button").last();
      await expect(userButton).toBeVisible();
    });

    test("logo has correct href to home", async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByRole("heading", { name: "분석 내역" }).waitFor();

      const logo = page
        .getByRole("link", { name: "계약서 지킴이" })
        .first();
      await expect(logo).toHaveAttribute("href", "/");
    });

    test("dashboard nav link works", async ({ page }) => {
      await page.goto("/analyze");
      await page.getByRole("heading", { name: "계약서 분석" }).waitFor();

      await page.locator("header nav").getByRole("link", { name: "대시보드" }).click();

      await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    });

    test("analyze nav link works", async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByRole("heading", { name: "분석 내역" }).waitFor();

      await page.locator("header nav").getByRole("link", { name: "분석하기", exact: true }).click();

      await expect(page).toHaveURL("/analyze", { timeout: 10000 });
    });
  });

  test.describe("Footer", () => {
    test("displays on dashboard page", async ({ page }) => {
      await page.goto("/dashboard");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });

    test("has correct footer links", async ({ page }) => {
      await page.goto("/dashboard");

      const footer = page.locator("footer");

      await expect(
        footer.getByRole("link", { name: "서비스 소개" })
      ).toHaveAttribute("href", "/about");
      await expect(
        footer.getByRole("link", { name: "가격 정책" })
      ).toHaveAttribute("href", "/pricing");
      await expect(
        footer.getByRole("link", { name: "이용약관" })
      ).toHaveAttribute("href", "/terms");
      await expect(
        footer.getByRole("link", { name: "개인정보처리방침" })
      ).toHaveAttribute("href", "/privacy");
    });

    test("shows copyright and disclaimer text", async ({ page }) => {
      await page.goto("/dashboard");

      const footer = page.locator("footer");

      await expect(
        footer.getByText("© 2026 계약서 지킴이. All rights reserved.")
      ).toBeVisible();

      await expect(
        footer.getByText(
          "본 서비스는 AI 기반 참고 자료를 제공하며, 법률 자문을 대체하지 않습니다."
        )
      ).toBeVisible();
    });
  });

  test.describe("404 Page", () => {
    test("visiting non-existent route shows 404", async ({ page }) => {
      const response = await page.goto("/this-page-does-not-exist");

      expect(response?.status()).toBe(404);

      const bodyText = await page.textContent("body");
      expect(
        bodyText?.includes("404") ||
          bodyText?.includes("not found") ||
          bodyText?.includes("찾을 수 없습니다")
      ).toBeTruthy();
    });
  });

  // Auth Guard tests are covered in auth.spec.ts (runs in "auth" project
  // without stored auth state, avoiding browser-level session sharing).
});
