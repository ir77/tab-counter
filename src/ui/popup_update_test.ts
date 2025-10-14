import { assertStrictEquals } from "assert/mod.ts";
import { StorageData } from "../domain/types.ts";
import {
  createMockChromeStorage,
  createMockDocument,
} from "../testdoubles/testdoubles.ts";

// グローバルモックを設定（importの前に必要）
const globalRecord = globalThis as Record<string, unknown>;
const documentMock = createMockDocument();
const elements = documentMock._elements;

globalRecord.document = documentMock;

globalRecord.chrome = createMockChromeStorage(
  (_keys: string[], _callback: (result: unknown) => void) => {},
);

const { updateUI } = await import("./popup.ts");

Deno.test("updateUI", async (t) => {
  await t.step(
    "全てのデータをストレージから読み込んで表示を更新する",
    async () => {
      // Arrange
      // 要素の初期状態をリセット
      elements.tabCount.textContent = "...";
      elements.highCount.textContent = "...";
      elements.lowCount.textContent = "...";
      elements.previousDayLastCount.textContent = "...";

      const storageData: Partial<StorageData> = {
        tabCount: 15,
        dailyStats: { date: "2025-10-14", high: 20, low: 5 },
        lastAvailablePreviousDayCount: 12,
      };

      globalRecord.chrome = createMockChromeStorage(
        (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
          // コールバックを非同期的に実行してChrome APIの動作を模倣
          setTimeout(() => callback(storageData), 0);
        },
      );

      // Act
      updateUI();

      // コールバックが実行されるまで待機
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Assert
      assertStrictEquals(elements.tabCount.textContent, "15");
      assertStrictEquals(elements.highCount.textContent, "20");
      assertStrictEquals(elements.lowCount.textContent, "5");
      assertStrictEquals(
        elements.previousDayLastCount.textContent,
        "12",
      );
    },
  );

  await t.step("tabCountのみが存在する場合に正しく表示する", async () => {
    // Arrange
    // 要素の初期状態をリセット
    elements.tabCount.textContent = "...";
    elements.highCount.textContent = "...";
    elements.lowCount.textContent = "...";
    elements.previousDayLastCount.textContent = "...";

    const storageData: Partial<StorageData> = {
      tabCount: 8,
    };

    globalRecord.chrome = createMockChromeStorage(
      (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
        setTimeout(() => callback(storageData), 0);
      },
    );

    // Act
    updateUI();
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Assert
    assertStrictEquals(elements.tabCount.textContent, "8");
    assertStrictEquals(elements.highCount.textContent, "...");
    assertStrictEquals(elements.lowCount.textContent, "...");
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "データなし",
    );
  });

  await t.step("dailyStatsのみが存在する場合に正しく表示する", async () => {
    // Arrange
    // 要素の初期状態をリセット
    elements.tabCount.textContent = "...";
    elements.highCount.textContent = "...";
    elements.lowCount.textContent = "...";
    elements.previousDayLastCount.textContent = "...";

    const storageData: Partial<StorageData> = {
      dailyStats: { date: "2025-10-14", high: 30, low: 10 },
    };

    globalRecord.chrome = createMockChromeStorage(
      (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
        setTimeout(() => callback(storageData), 0);
      },
    );

    // Act
    updateUI();
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Assert
    assertStrictEquals(elements.tabCount.textContent, "...");
    assertStrictEquals(elements.highCount.textContent, "30");
    assertStrictEquals(elements.lowCount.textContent, "10");
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "データなし",
    );
  });

  await t.step(
    "lastAvailablePreviousDayCountが存在する場合に前日のセクションを表示する",
    async () => {
      // Arrange
      // 要素の初期状態をリセット
      elements.tabCount.textContent = "...";
      elements.highCount.textContent = "...";
      elements.lowCount.textContent = "...";
      elements.previousDayLastCount.textContent = "...";

      const storageData: Partial<StorageData> = {
        lastAvailablePreviousDayCount: 18,
      };

      globalRecord.chrome = createMockChromeStorage(
        (
          _keys: string[],
          callback: (result: Partial<StorageData>) => void,
        ) => {
          setTimeout(() => callback(storageData), 0);
        },
      );

      // Act
      updateUI();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Assert
      assertStrictEquals(elements.tabCount.textContent, "...");
      assertStrictEquals(elements.highCount.textContent, "...");
      assertStrictEquals(elements.lowCount.textContent, "...");
      assertStrictEquals(
        elements.previousDayLastCount.textContent,
        "18",
      );
    },
  );

  await t.step("ストレージが空の場合にプレースホルダーを表示する", async () => {
    // Arrange
    // 要素の初期状態をリセット
    elements.tabCount.textContent = "...";
    elements.highCount.textContent = "...";
    elements.lowCount.textContent = "...";
    elements.previousDayLastCount.textContent = "...";

    const storageData: Partial<StorageData> = {};

    globalRecord.chrome = createMockChromeStorage(
      (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
        setTimeout(() => callback(storageData), 0);
      },
    );

    // Act
    updateUI();
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Assert
    assertStrictEquals(elements.tabCount.textContent, "...");
    assertStrictEquals(elements.highCount.textContent, "...");
    assertStrictEquals(elements.lowCount.textContent, "...");
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "データなし",
    );
  });
});
