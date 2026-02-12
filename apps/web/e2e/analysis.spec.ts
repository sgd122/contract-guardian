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
    const testAnalysisId = "dddddddd-0001-0001-0001-000000000001";
    const testUrl = `/analyze/${testAnalysisId}`;

    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl);
      // Wait for content to load (page shows "로딩 중..." initially)
      await page
        .getByRole("heading", { name: "웹개발_외주계약서.pdf" })
        .waitFor({ timeout: 15000 });
    });

    test("loads analysis detail page correctly", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "웹개발_외주계약서.pdf" })
      ).toBeVisible();

      await expect(page.getByText("분석 완료 | 4페이지")).toBeVisible();
    });

    test("displays risk score and badge", async ({ page }) => {
      // Risk score "75" is displayed in the score circle
      await expect(page.getByText("75", { exact: true })).toBeVisible();

      // "위험" badge near the score
      // Use the main content area to avoid matching multiple elements
      const mainContent = page.locator("main");
      await expect(mainContent.getByText("위험").first()).toBeVisible();
    });

    test("shows summary section", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "종합 분석 요약" })
      ).toBeVisible();

      await expect(
        page.getByText(/본 외주 개발 계약서는/)
      ).toBeVisible();
    });

    test("displays statistics correctly", async ({ page }) => {
      // Stats are structured as "위험 4 건", "주의 1 건", "안전 0 건"
      await expect(page.getByText("4", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("1", { exact: true }).first()).toBeVisible();

      await expect(
        page.getByText(/계약서 유형:.*freelance/)
      ).toBeVisible();
    });

    test("lists clause analysis items", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /조항별 분석/ })
      ).toBeVisible();

      // Clause items are buttons with risk level + clause name
      await expect(
        page.getByRole("button", { name: /대금 조건/ })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /지적재산권/ })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /보증\/하자/ })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /손해배상/ })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /계약 해지/ })
      ).toBeVisible();
    });

    test("can expand and collapse clause accordions", async ({ page }) => {
      const firstClause = page.getByRole("button", { name: /대금 조건/ });
      await expect(firstClause).toBeVisible();

      // Click to expand
      await firstClause.click();

      // The blockquote content should become visible
      await expect(
        page.getByText("총 1,500만원. 완료 후 일시 지급한다.")
      ).toBeVisible();

      // Click to collapse
      await firstClause.click();
    });

    test("shows missing clauses section", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /누락된 조항/ })
      ).toBeVisible();

      const missingList = page.getByRole("list").filter({
        has: page.getByText("비밀유지"),
      });
      await expect(missingList.getByText("비밀유지")).toBeVisible();
      await expect(missingList.getByText("업무 범위")).toBeVisible();
      await expect(missingList.getByText("분쟁 해결")).toBeVisible();
    });

    test("report download link has correct href", async ({ page }) => {
      const downloadLink = page.getByRole("link", { name: "리포트 다운로드" });
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute(
        "href",
        `/api/report/${testAnalysisId}`
      );
    });

    test("back button links to dashboard", async ({ page }) => {
      const backLink = page.getByRole("link", { name: "" }).filter({
        has: page.locator("svg"),
      });
      // The first link with only an SVG icon is the back button
      const firstIconLink = page.locator('a[href="/dashboard"]').first();
      await expect(firstIconLink).toBeVisible();
    });

    test("improvement recommendations section exists", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "개선 권고" })
      ).toBeVisible();
    });

    test("legal disclaimer is visible", async ({ page }) => {
      const mainContent = page.locator("main");
      await expect(
        mainContent.getByText(
          /중요한 계약 체결 시 반드시 법률 전문가의 자문을 받으시기 바랍니다/
        )
      ).toBeVisible();
    });
  });
});
