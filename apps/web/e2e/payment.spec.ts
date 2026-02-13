import { test, expect } from "@playwright/test";
import path from "path";

const TEST_PDF_PATH = path.resolve(__dirname, "../../../test.pdf");

test.describe("Payment Flow", () => {
  test.describe("Upload & Payment UI", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/analyze");
      await expect(
        page.getByRole("heading", { name: "계약서 분석" })
      ).toBeVisible();
    });

    test("payment button is disabled without consent checkboxes", async ({
      page,
    }) => {
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_PDF_PATH);
      await expect(page.getByText("test.pdf")).toBeVisible();

      // Payment button should be disabled without checkboxes
      await expect(
        page.getByRole("button", { name: "결제하기" })
      ).toBeDisabled();
    });

    test("payment button enables after file upload and consent", async ({
      page,
    }) => {
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_PDF_PATH);
      await expect(page.getByText("test.pdf")).toBeVisible();

      // Check both consent checkboxes
      await page
        .getByRole("checkbox", {
          name: /AI 분석 결과는 법적 효력이 없으며/,
        })
        .check();
      await page
        .getByRole("checkbox", {
          name: /업로드한 계약서는 AI 분석 목적으로만/,
        })
        .check();

      // Payment button should now be enabled
      await expect(
        page.getByRole("button", { name: "결제하기" })
      ).toBeEnabled();
    });

    test("displays correct price for standard analysis", async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_PDF_PATH);

      await expect(page.getByText("분석 비용: 3,900원")).toBeVisible();
      await expect(page.getByText("일반 분석 (1~5페이지)")).toBeVisible();
    });

    test("can switch AI model between Claude and Gemini", async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_PDF_PATH);

      // Claude should be default selected
      const claudeButton = page.getByRole("button", {
        name: /Claude.*Anthropic/,
      });
      const geminiButton = page.getByRole("button", {
        name: /Gemini.*Google/,
      });

      await expect(claudeButton).toBeVisible();
      await expect(geminiButton).toBeVisible();

      // Select Gemini
      await geminiButton.click();

      // Select Claude back
      await claudeButton.click();
    });
  });

  test.describe("Payment Modal", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/analyze");

      // Upload file and consent
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_PDF_PATH);
      await page
        .getByRole("checkbox", {
          name: /AI 분석 결과는 법적 효력이 없으며/,
        })
        .check();
      await page
        .getByRole("checkbox", {
          name: /업로드한 계약서는 AI 분석 목적으로만/,
        })
        .check();
    });

    test("opens payment modal with correct amount", async ({ page }) => {
      await page.getByRole("button", { name: "결제하기" }).click();

      // Modal should appear
      const modal = page.getByRole("dialog", { name: "결제하기" });
      await expect(modal).toBeVisible();

      // Check amount display (use exact match to avoid matching the button text)
      await expect(modal.getByText("3,900원", { exact: true })).toBeVisible();
      await expect(modal.getByText("결제 금액")).toBeVisible();
    });

    test("payment modal shows info messages", async ({ page }) => {
      await page.getByRole("button", { name: "결제하기" }).click();

      const modal = page.getByRole("dialog", { name: "결제하기" });
      await expect(
        modal.getByText("결제 후 즉시 AI 분석이 시작됩니다.")
      ).toBeVisible();
      await expect(
        modal.getByText("분석 시작 전 전액 환불이 가능합니다.")
      ).toBeVisible();
    });

    test("can cancel payment modal", async ({ page }) => {
      await page.getByRole("button", { name: "결제하기" }).click();

      const modal = page.getByRole("dialog", { name: "결제하기" });
      await expect(modal).toBeVisible();

      // Click cancel button
      await modal.getByRole("button", { name: "취소" }).click();

      // Modal should close
      await expect(modal).not.toBeVisible();
    });

    test("can close payment modal with X button", async ({ page }) => {
      await page.getByRole("button", { name: "결제하기" }).click();

      const modal = page.getByRole("dialog", { name: "결제하기" });
      await expect(modal).toBeVisible();

      // Click close button
      await modal.getByRole("button", { name: "닫기" }).click();

      // Modal should close
      await expect(modal).not.toBeVisible();
    });

    test("Toss Payments widget loads in iframe after confirm", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "결제하기" }).click();

      const modal = page.getByRole("dialog", { name: "결제하기" });

      // Click the confirm payment button
      await modal
        .getByRole("button", { name: /원 결제하기/ })
        .click();

      // Toss iframe should appear with payment methods
      const tossFrame = page.frameLocator("iframe").first();
      await expect(
        tossFrame.getByText("결제 방법을 선택해주세요")
      ).toBeVisible({ timeout: 15000 });

      // Card companies should be listed
      await expect(tossFrame.getByText("신용·체크카드")).toBeVisible();
      await expect(tossFrame.getByRole("link", { name: "신한" })).toBeVisible();
    });
  });

  test.describe("Payment Result Pages", () => {
    test("fail page renders with error info", async ({ page }) => {
      await page.goto(
        "/payment/fail?code=USER_CANCEL&message=사용자가 결제를 취소했습니다."
      );

      await expect(page.getByText("결제에 실패했습니다")).toBeVisible();
      await expect(
        page.getByText("사용자가 결제를 취소했습니다.")
      ).toBeVisible();
      await expect(page.getByText("오류 코드: USER_CANCEL")).toBeVisible();

      // Navigation buttons
      await expect(
        page.getByRole("button", { name: "대시보드로 이동" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "다시 시도" })
      ).toBeVisible();
    });

    test("confirm page shows error for missing params", async ({ page }) => {
      await page.goto("/payment/confirm");

      await expect(page.getByText("결제 확인 실패")).toBeVisible({
        timeout: 10000,
      });
      await expect(
        page.getByText("결제 정보가 올바르지 않습니다.")
      ).toBeVisible();
    });

    test("confirm page shows loading state with valid params", async ({
      page,
    }) => {
      await page.goto(
        "/payment/confirm?orderId=test123&paymentKey=pk_test&amount=3900"
      );

      // Should show confirming state first
      await expect(
        page.getByText("결제를 확인하고 있습니다")
      ).toBeVisible();
    });
  });
});
