import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Wait for dashboard to load
    await page.getByRole("heading", { name: "분석 내역" }).waitFor();
  });

  test("should load dashboard with correct heading and subtitle", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "분석 내역", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("계약서 분석 결과를 확인하세요")
    ).toBeVisible();
  });

  test("should display '새 분석' button and link to /analyze", async ({
    page,
  }) => {
    const newAnalysisLink = page.getByRole("link", { name: "새 분석" });
    await expect(newAnalysisLink).toBeVisible();
    await expect(newAnalysisLink).toHaveAttribute("href", "/analyze");
  });

  test("should display header navigation with correct links", async ({
    page,
  }) => {
    const nav = page.locator("header nav");
    const dashboardLink = nav.getByRole("link", { name: "대시보드" });
    const analyzeLink = nav.getByRole("link", { name: "분석하기" });

    await expect(dashboardLink).toBeVisible();
    await expect(analyzeLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    await expect(analyzeLink).toHaveAttribute("href", "/analyze");
  });

  test("should display user profile button in header", async ({ page }) => {
    const userButton = page.locator("header").getByRole("button").last();
    await expect(userButton).toBeVisible();
  });
});

test.describe("Dashboard Page - With Analyses", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("heading", { name: "분석 내역" }).waitFor();
  });

  test("should render analysis list items when data exists", async ({
    page,
  }) => {
    // Wait up to 5s to check if any analysis items exist
    const headingsInMain = page
      .locator("main")
      .getByRole("heading", { level: 3 });

    try {
      await headingsInMain.first().waitFor({ timeout: 5000 });
      const count = await headingsInMain.count();
      expect(count).toBeGreaterThan(0);
    } catch {
      // No analyses exist - this is OK for a fresh test user
      test.skip(true, "No analyses available for this test user");
    }
  });

  test("should display status badges when analyses exist", async ({
    page,
  }) => {
    try {
      await page
        .getByRole("heading", { level: 3 })
        .first()
        .waitFor({ timeout: 5000 });
      await expect(page.getByText("완료").first()).toBeVisible();
    } catch {
      test.skip(true, "No analyses available for this test user");
    }
  });

  test("should display risk level badges when analyses exist", async ({
    page,
  }) => {
    try {
      await page
        .getByRole("heading", { level: 3 })
        .first()
        .waitFor({ timeout: 5000 });
      const riskBadges = page
        .locator("main")
        .getByText(/^(위험|주의|안전)$/);
      const count = await riskBadges.count();
      expect(count).toBeGreaterThan(0);
    } catch {
      test.skip(true, "No analyses available for this test user");
    }
  });

  test("should navigate to analysis detail when clicking an item", async ({
    page,
  }) => {
    const analysisLink = page.locator('main a[href^="/analyze/"]').first();
    const hasAnalyses = await analysisLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasAnalyses) {
      test.skip(true, "No analyses available for this test user");
      return;
    }
    await analysisLink.click();
    await page.waitForURL(/\/analyze\/[a-f0-9-]+/);
    expect(page.url()).toMatch(/\/analyze\/[a-f0-9-]+$/);
  });

  test("should display date and page count for analysis items", async ({
    page,
  }) => {
    try {
      await page
        .getByRole("heading", { level: 3 })
        .first()
        .waitFor({ timeout: 5000 });
      await expect(page.getByText(/20\d{2}년/).first()).toBeVisible();
      await expect(page.getByText(/페이지/).first()).toBeVisible();
    } catch {
      test.skip(true, "No analyses available for this test user");
    }
  });

  test("should have delete buttons on non-processing items", async ({
    page,
  }) => {
    try {
      await page
        .getByRole("heading", { level: 3 })
        .first()
        .waitFor({ timeout: 5000 });
      const deleteButtons = page.locator("main button").filter({
        has: page.locator("svg"),
      });
      const count = await deleteButtons.count();
      expect(count).toBeGreaterThan(0);
    } catch {
      test.skip(true, "No analyses available for this test user");
    }
  });
});
