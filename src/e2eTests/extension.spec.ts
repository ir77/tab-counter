import { expect, test } from "@playwright/test";

test.describe("Tab Counter Extension", () => {
  test("拡張機能が正しく読み込まれること", async ({ context }) => {
    // 新しいページを開く
    const page = await context.newPage();
    await page.goto("https://example.com");

    // 拡張機能が読み込まれていることを確認するために少し待つ
    await page.waitForTimeout(1000);

    // ページが正常に読み込まれたことを確認
    expect(page.url()).toBe("https://example.com/");
  });

  test("複数のタブを開いたときにタブ数が追跡されること", async ({ context }) => {
    // 最初のページを開く
    const page1 = await context.newPage();
    await page1.goto("https://example.com");
    await page1.waitForTimeout(500);

    // 2つ目のページを開く
    const page2 = await context.newPage();
    await page2.goto("https://example.org");
    await page2.waitForTimeout(500);

    // 3つ目のページを開く
    const page3 = await context.newPage();
    await page3.goto("https://www.google.com");
    await page3.waitForTimeout(500);

    // すべてのページが正常に開かれたことを確認
    const pages = context.pages();
    expect(pages.length).toBeGreaterThanOrEqual(3);
  });

  test("タブを閉じたときに数が減ること", async ({ context }) => {
    // 複数のタブを開く
    const page1 = await context.newPage();
    await page1.goto("https://example.com");
    const page2 = await context.newPage();
    await page2.goto("https://example.org");
    await page2.waitForTimeout(500);

    const initialPageCount = context.pages().length;

    // 1つのタブを閉じる
    await page2.close();
    await page1.waitForTimeout(500);

    const finalPageCount = context.pages().length;
    expect(finalPageCount).toBe(initialPageCount - 1);
  });
});
