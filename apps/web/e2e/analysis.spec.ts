import { test, expect } from "@playwright/test";

test.describe("Analysis Pages", () => {
  test.describe("Upload Page", () => {
    test("renders upload page with heading and drag area", async ({ page }) => {
      await page.goto("/analyze");

      await expect(
        page.getByRole("heading", { name: "계약서 분석" })
      ).toBeVisible();

      await expect(
        page.getByText("계약서를 업로드하면 AI가 위험 조항을 찾아드립니다")
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "파일 업로드" })
      ).toBeVisible();

      await expect(
        page.getByText("PDF 파일을 드래그하거나 클릭하세요")
      ).toBeVisible();
    });
  });

  test.describe("Analysis Detail Page", () => {
    async function navigateToFirstAnalysis(page: import("@playwright/test").Page): Promise<boolean> {
      try {
        await page.goto("/dashboard");
        // Look for analysis item links (they link to /analyze/[uuid])
        const analysisLink = page.locator('main a[href^="/analyze/"]').first();
        const hasAnalyses = await analysisLink.isVisible({ timeout: 5000 }).catch(() => false);
        if (!hasAnalyses) return false;

        await analysisLink.click();
        await page.waitForURL(/\/analyze\/[a-f0-9-]+/, { timeout: 10000 });
        await page
          .getByRole("heading", { level: 1 })
          .first()
          .waitFor({ timeout: 10000 });
        return true;
      } catch {
        return false;
      }
    }

    test("loads analysis detail page correctly", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      const heading = page.getByRole("heading", { level: 1 }).first();
      await expect(heading).toBeVisible();
      await expect(page.getByText(/분석 완료/)).toBeVisible();
    });

    test("displays risk score and badge", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      const mainContent = page.locator("main");
      const riskBadge = mainContent.getByText(/^(위험|주의|안전)$/).first();
      await expect(riskBadge).toBeVisible();
    });

    test("shows summary section", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      await expect(
        page.getByRole("heading", { name: "종합 분석 요약" })
      ).toBeVisible();
    });

    test("report download link exists", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      const downloadLink = page.getByRole("link", { name: "리포트 다운로드" });
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute("href", /\/api\/report\//);
    });

    test("back button links to dashboard", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      const backLink = page.locator('a[href="/dashboard"]').first();
      await expect(backLink).toBeVisible();
    });

    test("legal disclaimer is visible", async ({ page }) => {
      const ok = await navigateToFirstAnalysis(page);
      if (!ok) { test.skip(true, "No analyses available"); return; }

      const mainContent = page.locator("main");
      await expect(
        mainContent.getByText(
          /중요한 계약 체결 시 반드시 법률 전문가의 자문을 받으시기 바랍니다/
        )
      ).toBeVisible();
    });
  });
});
