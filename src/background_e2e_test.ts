/// <reference types="npm:@types/chrome" />

import puppeteer, { type Browser, type Page } from "puppeteer";
import { assertEquals } from "assert/mod.ts";
import { join } from "std/path/mod.ts";

/**
 * E2E テストヘルパー関数
 * Chrome拡張機能をロードしてPuppeteerブラウザインスタンスを起動する
 */
async function launchBrowserWithExtension(): Promise<Browser> {
  const extensionPath = join(Deno.cwd(), "dist");

  // Chrome拡張機能を読み込んだブラウザを起動
  const browser = await puppeteer.launch({
    headless: false, // 拡張機能のテストにはheadless: falseが必要
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  return browser;
}

/**
 * 拡張機能のバックグラウンドページを取得する
 * 注: 将来のテスト拡張用に保持
 */
async function _getExtensionBackgroundPage(browser: Browser): Promise<Page> {
  // Service Workerターゲットを探す
  const targets = await browser.targets();
  const serviceWorkerTarget = targets.find((target) =>
    target.type() === "service_worker"
  );

  if (!serviceWorkerTarget) {
    throw new Error("拡張機能のService Workerが見つかりません");
  }

  const worker = await serviceWorkerTarget.worker();
  if (!worker) {
    throw new Error("Service Workerを取得できません");
  }

  // バックグラウンドページとして扱えるページを返す
  // 注: Service WorkerはPageではないため、evaluateなどを使用
  return serviceWorkerTarget.page() as unknown as Page;
}

/**
 * chrome.storage.local の内容を取得する
 */
async function getChromeStorageLocal(
  browser: Browser,
): Promise<Record<string, unknown>> {
  const targets = await browser.targets();
  const serviceWorkerTarget = targets.find((target) =>
    target.type() === "service_worker"
  );

  if (!serviceWorkerTarget) {
    throw new Error("拡張機能のService Workerが見つかりません");
  }

  const worker = await serviceWorkerTarget.worker();
  if (!worker) {
    throw new Error("Service Workerを取得できません");
  }

  // Service Worker内でchrome.storage.localからデータを取得
  const storageData = await worker.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        resolve(items);
      });
    });
  });

  return storageData as Record<string, unknown>;
}

/**
 * 指定したミリ秒待機する
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.test({
  name: "E2E: 拡張機能が正常にロードされる",
  ignore: Deno.env.get("CI") === "true", // CI環境ではスキップ
  async fn() {
    // Arrange & Act
    const browser = await launchBrowserWithExtension();

    try {
      // Assert: 拡張機能のService Workerが存在することを確認
      const targets = await browser.targets();
      const serviceWorkerTarget = targets.find((target) =>
        target.type() === "service_worker"
      );

      assertEquals(
        serviceWorkerTarget !== undefined,
        true,
        "拡張機能のService Workerが見つかりません",
      );
    } finally {
      await browser.close();
    }
  },
});

Deno.test({
  name: "E2E: タブを開くとストレージが更新される",
  ignore: Deno.env.get("CI") === "true", // CI環境ではスキップ
  async fn() {
    // Arrange
    const browser = await launchBrowserWithExtension();

    try {
      // 初期状態を待つ
      await sleep(1000);

      // Act: 新しいタブを開く
      const page = await browser.newPage();
      await page.goto("about:blank");
      await sleep(500); // background.tsがupdateTabCountを実行するのを待つ

      // Assert: ストレージにtabCountが保存されていることを確認
      const storage = await getChromeStorageLocal(browser);

      assertEquals(
        typeof storage.tabCount,
        "number",
        "tabCountがストレージに保存されていません",
      );
      assertEquals(
        (storage.tabCount as number) > 0,
        true,
        "tabCountが0より大きくありません",
      );

      // タブを閉じる
      await page.close();
      await sleep(500);

      // タブを閉じた後のストレージを確認
      const storageAfterClose = await getChromeStorageLocal(browser);
      assertEquals(
        typeof storageAfterClose.tabCount,
        "number",
        "タブを閉じた後もtabCountがストレージに保存されています",
      );
    } finally {
      await browser.close();
    }
  },
});

Deno.test({
  name: "E2E: dailyStatsがストレージに保存される",
  ignore: Deno.env.get("CI") === "true", // CI環境ではスキップ
  async fn() {
    // Arrange
    const browser = await launchBrowserWithExtension();

    try {
      // 初期状態を待つ
      await sleep(1000);

      // Act: タブを開いてdailyStatsが作成されるのを待つ
      const page = await browser.newPage();
      await page.goto("about:blank");
      await sleep(500);

      // Assert: dailyStatsがストレージに保存されていることを確認
      const storage = await getChromeStorageLocal(browser);

      assertEquals(
        storage.dailyStats !== undefined,
        true,
        "dailyStatsがストレージに保存されていません",
      );

      const dailyStats = storage.dailyStats as {
        date: string;
        high: number;
        low: number;
      };

      assertEquals(
        typeof dailyStats.date,
        "string",
        "dailyStats.dateが文字列ではありません",
      );
      assertEquals(
        typeof dailyStats.high,
        "number",
        "dailyStats.highが数値ではありません",
      );
      assertEquals(
        typeof dailyStats.low,
        "number",
        "dailyStats.lowが数値ではありません",
      );

      await page.close();
    } finally {
      await browser.close();
    }
  },
});

Deno.test({
  name: "E2E: 複数のタブを開閉してもカウントが正確",
  ignore: Deno.env.get("CI") === "true", // CI環境ではスキップ
  async fn() {
    // Arrange
    const browser = await launchBrowserWithExtension();

    try {
      await sleep(1000);

      // Act: 複数のタブを開く
      const page1 = await browser.newPage();
      await page1.goto("about:blank");
      await sleep(300);

      const page2 = await browser.newPage();
      await page2.goto("about:blank");
      await sleep(300);

      const page3 = await browser.newPage();
      await page3.goto("about:blank");
      await sleep(500);

      // Assert: タブ数が増加していることを確認
      const storageAfterOpen = await getChromeStorageLocal(browser);
      const tabCountAfterOpen = storageAfterOpen.tabCount as number;
      assertEquals(tabCountAfterOpen >= 3, true, "タブ数が3以上ではありません");

      // タブを1つ閉じる
      await page1.close();
      await sleep(300);

      const storageAfterClose1 = await getChromeStorageLocal(browser);
      const tabCountAfterClose1 = storageAfterClose1.tabCount as number;
      assertEquals(
        tabCountAfterClose1 < tabCountAfterOpen,
        true,
        "タブを閉じた後もカウントが減少していません",
      );

      // 残りのタブを閉じる
      await page2.close();
      await page3.close();
      await sleep(500);

      const storageAfterCloseAll = await getChromeStorageLocal(browser);
      assertEquals(
        typeof storageAfterCloseAll.tabCount,
        "number",
        "全タブを閉じた後もtabCountが保存されています",
      );
    } finally {
      await browser.close();
    }
  },
});
