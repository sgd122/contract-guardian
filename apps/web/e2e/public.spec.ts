import { test, expect } from "@playwright/test";

test.describe("Home Page (/)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("계약서 지킴이 - AI 계약서 검토 서비스");
  });

  test("should display header navigation links", async ({ page }) => {
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "홈" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "소개" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "가격" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "FAQ" })).toBeVisible();
  });

  test("should display hero section with correct content", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", {
        name: /AI가 계약서의.*위험을 찾아드립니다/,
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByText("프리랜서와 1인 사업자를 위한 AI 계약서 분석 서비스.")
    ).toBeVisible();
  });

  test("should have working CTA buttons with correct links", async ({
    page,
  }) => {
    // Use first() since "무료로 시작하기" appears multiple times on page
    const startButton = page
      .getByRole("link", { name: "무료로 시작하기" })
      .first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute("href", "/login");

    const pricingButton = page.getByRole("link", { name: "가격 보기" });
    await expect(pricingButton).toBeVisible();
    await expect(pricingButton).toHaveAttribute("href", "#pricing");
  });

  test("should display stats section", async ({ page }) => {
    await expect(page.getByText("분석 비용")).toBeVisible();
    await expect(page.getByText("분석 시간")).toBeVisible();
    await expect(page.getByText("이용 가능")).toBeVisible();
  });

  test("should display 이용 방법 section with 3 steps", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "이용 방법" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "계약서 업로드" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "AI 분석", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "결과 확인" })
    ).toBeVisible();
  });

  test("should display pricing section with 3 cards", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "투명한 가격" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "무료 체험" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "일반 분석" })
    ).toBeVisible();
    await expect(page.getByText("3,900원")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "확장 분석" })
    ).toBeVisible();
    await expect(page.getByText("5,900원")).toBeVisible();
  });

  test("should display 신뢰할 수 있는 서비스 section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "신뢰할 수 있는 서비스" })
    ).toBeVisible();
  });

  test("should display FAQ section with 5 questions", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "자주 묻는 질문" })
    ).toBeVisible();

    const faqButtons = page.getByRole("button").filter({
      hasText: /분석|계약서|환불/,
    });
    await expect(faqButtons).toHaveCount(5);
  });

  test("should expand and collapse FAQ items on click", async ({ page }) => {
    const firstFaqButton = page.getByRole("button", {
      name: "AI 분석 결과를 법적으로 사용할 수 있나요?",
    });
    await expect(firstFaqButton).toBeVisible();

    // Click to expand
    await firstFaqButton.click();
    await expect(
      page.getByText("아니요. 본 서비스의 AI 분석 결과는 참고용이며")
    ).toBeVisible();

    // Click to collapse
    await firstFaqButton.click();
  });

  test("should display bottom CTA section", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "지금 바로 계약서를 분석해보세요",
      })
    ).toBeVisible();
  });

  test("should display footer with correct links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: "서비스 소개" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "가격 정책" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "이용약관" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "개인정보처리방침" })
    ).toBeVisible();
  });

  test("should navigate to login page when clicking 무료로 시작하기", async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "무료로 시작하기" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate to how-it-works section via 소개 link", async ({
    page,
  }) => {
    // "소개" links to /#how-it-works (anchor on same page)
    const link = page.locator("header nav").getByRole("link", { name: "소개" });
    await expect(link).toHaveAttribute("href", "/#how-it-works");
  });

  test("should navigate to pricing section via 가격 link", async ({
    page,
  }) => {
    // "가격" links to /#pricing (anchor on same page)
    const link = page.locator("header nav").getByRole("link", { name: "가격" });
    await expect(link).toHaveAttribute("href", "/#pricing");
  });
});

test.describe("About Page (/about)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("should load with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("서비스 소개 - 계약서 지킴이");
  });

  test("should display main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /프리랜서의 계약을 지키는.*AI 파트너/,
      })
    ).toBeVisible();
  });

  test("should display 핵심 가치 section with 4 cards", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "핵심 가치" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "정확한 분석" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "빠른 결과" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "안전한 보관" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "프리랜서 특화" })
    ).toBeVisible();
  });

  test("should display 왜 계약서 검토가 중요한가요 section", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "왜 계약서 검토가 중요한가요?" })
    ).toBeVisible();
  });

  test("should display CTA section with link to login", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "지금 바로 계약서를 분석해보세요",
      })
    ).toBeVisible();
    const ctaButton = page.getByRole("link", { name: "무료로 시작하기" });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/login");
  });

  test("should navigate to login when clicking CTA", async ({ page }) => {
    await page.getByRole("link", { name: "무료로 시작하기" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should have working header navigation", async ({ page }) => {
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "홈" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "소개" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "가격" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "FAQ" })).toBeVisible();
  });
});

test.describe("Pricing Page (/pricing)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("should load with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("가격 정책 - 계약서 지킴이");
  });

  test("should display main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "가격 정책", level: 1 })
    ).toBeVisible();
  });

  test("should display 3 pricing cards with correct information", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "무료 체험" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "일반 분석" })
    ).toBeVisible();
    await expect(page.getByText("3,900원")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "확장 분석" })
    ).toBeVisible();
    await expect(page.getByText("5,900원")).toBeVisible();
  });

  test("should display pricing tier features", async ({ page }) => {
    // Check for features present in pricing cards
    await expect(page.getByText("PDF 계약서 분석").first()).toBeVisible();
    await expect(page.getByText("8대 체크 항목 검토").first()).toBeVisible();
    await expect(page.getByText("위험 조항 식별").first()).toBeVisible();
  });

  test("should display FAQ section with 5 questions", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "자주 묻는 질문" })
    ).toBeVisible();

    const faqButtons = page.getByRole("button").filter({
      hasText: /분석|계약서|환불/,
    });
    await expect(faqButtons).toHaveCount(5);
  });

  test("should expand and collapse FAQ items on click", async ({ page }) => {
    const firstFaqButton = page.getByRole("button", {
      name: "AI 분석 결과를 법적으로 사용할 수 있나요?",
    });
    await expect(firstFaqButton).toBeVisible();

    await firstFaqButton.click();
    await expect(
      page.getByText("아니요. 본 서비스의 AI 분석 결과는 참고용이며")
    ).toBeVisible();

    await firstFaqButton.click();
  });

  test("should have CTA buttons in pricing cards", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "무료로 시작하기" }).first()
    ).toBeVisible();
  });

  test("should navigate to login when clicking 무료로 시작하기", async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "무료로 시작하기" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should have working header navigation", async ({ page }) => {
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "홈" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "소개" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "가격" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "FAQ" })).toBeVisible();
  });

  test("should display footer with correct links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: "서비스 소개" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "가격 정책" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "이용약관" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "개인정보처리방침" })
    ).toBeVisible();
  });
});
