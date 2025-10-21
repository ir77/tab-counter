import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures.ts";

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
    const actualCount = context.pages().length;

    await expect(page.locator("#tabCount")).toHaveText(String(actualCount));
    await expect(page.locator("#highCount")).toHaveText(String(actualCount));
    await expect(page.locator("#lowCount")).toHaveText(String(actualCount));
  });

  test("タブの増減に合わせてタブ数が更新されること", async ({ page, context }) => {
    const createdPages: Page[] = [];
    const initialCount = context.pages().length;
    let expectedHigh = initialCount;
    const expectedLow = initialCount;

    for (let step = 1; step <= 10; step++) {
      const newTab = await context.newPage();
      createdPages.push(newTab);

      await newTab.goto(`https://example.com/?tab=${step}`);

      const expectedCount = initialCount + step;
      expectedHigh = Math.max(expectedHigh, expectedCount);

      await expect(page.locator("#tabCount")).toHaveText(String(expectedCount));
      await expect(page.locator("#highCount")).toHaveText(String(expectedHigh));
      await expect(page.locator("#lowCount")).toHaveText(String(expectedLow));
    }

    for (let i = createdPages.length - 1; i >= 0; i--) {
      const tabToClose = createdPages[i];
      await tabToClose.close();

      await expect(page.locator("#tabCount")).toHaveText(
        String(initialCount + i),
      );
      await expect(page.locator("#highCount")).toHaveText(String(expectedHigh));
      await expect(page.locator("#lowCount")).toHaveText(String(expectedLow));
    }
  });

  test("タブ数を最初より減らすと現在のタブ数と今日の最低だけ更新されること", async ({ page, context }) => {
    const initialCount = context.pages().length;

    await expect(page.locator("#tabCount")).toHaveText(String(initialCount));
    await expect(page.locator("#highCount")).toHaveText(String(initialCount));
    await expect(page.locator("#lowCount")).toHaveText(String(initialCount));

    const closablePages = context.pages().filter((candidate) =>
      candidate !== page
    );
    await closablePages[0].close();
    const expectedCount = initialCount - 1;

    await expect(page.locator("#tabCount")).toHaveText(String(expectedCount));
    await expect(page.locator("#highCount")).toHaveText(String(initialCount));
    await expect(page.locator("#lowCount")).toHaveText(String(expectedCount));
  });

  // previousDayLastCount のテスト
  // <div id="previousDayContainer">
  //   <h2>前日の最後の値: <span id="previousDayLastCount">...</span></h2>
  // </div>
});
