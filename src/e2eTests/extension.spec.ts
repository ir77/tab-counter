import { expect, test } from "./fixtures.ts";

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
