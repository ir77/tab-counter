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

async function expectTabCount(popupPage: Page, expected: number) {
  await expect(popupPage.locator("#tabCount")).toHaveText(String(expected));
}

test("拡張機能が読み込まれていること", async ({ extensionId }) => {
  await expect(extensionId).toMatch(/^[a-z]{32}$/);
});

test("popup.html に見出しが表示されること", async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByRole("heading", {
    name: /現在のタブ数は/,
    level: 1,
  })).toBeVisible();
  await expect(page.getByRole("heading", {
    name: /今日の最高:/,
    level: 2,
  })).toBeVisible();
  await expect(page.getByRole("heading", {
    name: /今日の最低:/,
    level: 2,
  })).toBeVisible();
  await expect(page.getByRole("heading", {
    name: /前日の最後の値:/,
    level: 2,
  })).toBeVisible();
});

test("現在のタブ数が実際のタブ数と一致すること", async ({ extensionId, page, context }) => {
  await closeOtherTabs(context, [page]);

  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const displayedCount = await readTabCount(page);
  const actualCount = context.pages().length;

  await expect(displayedCount).toBe(actualCount);
});

test("タブの増減に合わせてタブ数が更新されること", async ({ extensionId, page, context }) => {
  await closeOtherTabs(context, [page]);

  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const createdPages: Page[] = [];
  const initialCount = await readTabCount(page);

  try {
    for (const [index, tabNumber] of [1, 2, 3].entries()) {
      const newTab = await context.newPage();
      createdPages.push(newTab);

      await newTab.goto(`https://example.com/?tab=${tabNumber}`);

      await expectTabCount(page, initialCount + index + 1);
    }

    while (createdPages.length > 0) {
      const closedTabCount = createdPages.length - 1;
      const tabToClose = createdPages.pop();
      await tabToClose?.close();

      await expectTabCount(page, initialCount + closedTabCount);
    }
  } finally {
    for (const remaining of createdPages) {
      try {
        await remaining.close();
      } catch (_) {
        // すでに閉じている場合は無視
      }
    }
  }
});
