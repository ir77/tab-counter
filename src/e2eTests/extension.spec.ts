import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "./fixtures.ts";

async function closeOtherTabs(
  context: BrowserContext,
  keepPages: Page[],
) {
  for (const existing of context.pages()) {
    if (keepPages.includes(existing)) continue;
    try {
      await existing.close();
    } catch (_error) {
      // 無視できる失敗はテストの安定性に影響しないため握りつぶす
    }
  }
}

async function readTabCount(popupPage: Page): Promise<number> {
  const tabCountLocator = popupPage.locator("#tabCount");
  await expect(tabCountLocator).toHaveText(/\d+/);
  const text = await tabCountLocator.textContent();
  return Number.parseInt(text ?? "NaN", 10);
}

test.describe("popup.html", () => {
  test.beforeEach(async ({ extensionId, page, context }) => {
    await closeOtherTabs(context, [page]);
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    await page.goto(popupUrl);
  });

  test.afterEach(async ({ context, page }) => {
    await closeOtherTabs(context, [page]);
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

    for (let step = 1; step <= 5; step++) {
      const newTab = await context.newPage();
      createdPages.push(newTab);

      await newTab.goto(`https://example.com/?tab=${step}`);

      await expect(page.locator("#tabCount")).toHaveText(
        String(initialCount + step),
      );
    }

    for (let i = createdPages.length - 1; i >= 0; i--) {
      const tabToClose = createdPages[i];
      await tabToClose.close();

      await expect(page.locator("#tabCount")).toHaveText(
        String(initialCount + i),
      );
    }
  });
});
