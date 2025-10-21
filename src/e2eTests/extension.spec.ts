import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures.ts";

async function readTabCount(popupPage: Page): Promise<number> {
  const text = await popupPage.locator("#tabCount").textContent() as string;
  return Number.parseInt(text, 10);
}

async function readDailyStats(
  popupPage: Page,
): Promise<{ high: number; low: number }> {
  const highLocator = popupPage.locator("#highCount");
  const lowLocator = popupPage.locator("#lowCount");

  await Promise.all([
    expect(highLocator).toHaveText(/\d+/),
    expect(lowLocator).toHaveText(/\d+/),
  ]);

  const [highText, lowText] = await Promise.all([
    highLocator.textContent(),
    lowLocator.textContent(),
  ]);

  return {
    high: Number.parseInt(highText as string, 10),
    low: Number.parseInt(lowText as string, 10),
  };
}

test.describe("popup.html", () => {
  test.beforeEach(async ({ extensionId, page }) => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    await page.goto(popupUrl);
  });

  test("popup.html に見出しが表示されること", async ({ page }) => {
    const headings = [
      { level: 1, name: /現在のタブ数は/ },
      { level: 2, name: /今日の最高:/ },
      { level: 2, name: /今日の最低:/ },
      { level: 2, name: /前日の最後の値:/ },
    ];

    for (const heading of headings) {
      await expect(page.getByRole("heading", heading)).toBeVisible();
    }
  });

  test("現在のタブ数が実際のタブ数と一致すること", async ({ page, context }) => {
    const displayedCount = await readTabCount(page);
    const actualCount = context.pages().length;

    await expect(displayedCount).toBe(actualCount);
  });

  test("タブの増減に合わせてタブ数が更新されること", async ({ page, context }) => {
    const createdPages: Page[] = [];
    const initialCount = await readTabCount(page);
    const initialStats = await readDailyStats(page);
    let expectedHigh = initialStats.high;
    let expectedLow = initialStats.low;

    for (let step = 1; step <= 10; step++) {
      const newTab = await context.newPage();
      createdPages.push(newTab);

      await newTab.goto(`https://example.com/?tab=${step}`);

      const expectedCount = initialCount + step;
      expectedHigh = Math.max(expectedHigh, expectedCount);
      expectedLow = Math.min(expectedLow, expectedCount);

      await expect(page.locator("#tabCount")).toHaveText(String(expectedCount));
      await expect(page.locator("#highCount")).toHaveText(String(expectedHigh));
      await expect(page.locator("#lowCount")).toHaveText(String(expectedLow));
    }

    for (let i = createdPages.length - 1; i >= 0; i--) {
      const tabToClose = createdPages[i];
      await tabToClose.close();

      const expectedCount = initialCount + i;
      expectedHigh = Math.max(expectedHigh, expectedCount);
      expectedLow = Math.min(expectedLow, expectedCount);

      await expect(page.locator("#tabCount")).toHaveText(String(expectedCount));
      await expect(page.locator("#highCount")).toHaveText(String(expectedHigh));
      await expect(page.locator("#lowCount")).toHaveText(String(expectedLow));
    }
  });
});
