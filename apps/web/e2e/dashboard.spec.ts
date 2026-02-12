import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Wait for analysis list to load
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

  test("should render analysis list with items", async ({ page }) => {
    // Wait for the first file name heading to appear (async data load)
    await page.getByRole("heading", { level: 3 }).first().waitFor({ timeout: 10000 });

    // Analysis items are rendered as links containing h3 headings
    const headingsInMain = page.locator("main").getByRole("heading", { level: 3 });
    const count = await headingsInMain.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display file names in analysis list", async ({ page }) => {
    const fileNames = [
      "웹개발_외주계약서.pdf",
      "상호_비밀유지계약서.pdf",
      "근로계약서_중소기업.pdf",
      "디자인_용역계약서.pdf",
    ];

    for (const fileName of fileNames) {
      await expect(
        page.getByRole("heading", { name: fileName })
      ).toBeVisible();
    }
  });

  test("should display status badges", async ({ page }) => {
    // Check for status text visible on the page
    await expect(page.getByText("완료").first()).toBeVisible();
    await expect(page.getByText("분석 중").first()).toBeVisible();
    await expect(page.getByText("실패").first()).toBeVisible();
    await expect(page.getByText("결제 대기")).toBeVisible();
  });

  test("should display risk level badges", async ({ page }) => {
    // Risk badges from seed data: 위험, 주의, 안전
    await expect(page.getByText("위험").first()).toBeVisible();
    await expect(page.getByText("주의").first()).toBeVisible();
    await expect(page.getByText("안전").first()).toBeVisible();
  });

  test("should navigate to analysis detail when clicking an item", async ({
    page,
  }) => {
    // Click on the completed analysis "웹개발_외주계약서.pdf"
    const item = page
      .getByRole("link")
      .filter({ hasText: "웹개발_외주계약서.pdf" });
    await item.click();

    await page.waitForURL(/\/analyze\/[a-f0-9-]+/);
    expect(page.url()).toMatch(/\/analyze\/[a-f0-9-]+$/);
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

  test("should display user profile button with '테스트계정'", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /테스트계정/ })
    ).toBeVisible();
  });

  test("should display date and page count for analysis items", async ({
    page,
  }) => {
    // Check that a seed data item shows date and page count
    const item = page
      .getByRole("link")
      .filter({ hasText: "웹개발_외주계약서.pdf" });
    await expect(item).toContainText(/2026년/);
    await expect(item).toContainText(/4페이지/);
  });
});
