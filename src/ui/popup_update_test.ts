import { assertStrictEquals } from "assert/mod.ts";
import { StorageData } from "../domain/types.ts";
import {
  chromeStub,
  createMockChromeStorage,
  createTestDocument,
  documentStub,
} from "./popup_test_helper.ts";

// グローバルモックを設定（importの前に必要）
const globalRecord = globalThis as Record<string, unknown>;
globalRecord.chrome = chromeStub;
globalRecord.document = documentStub;
const {
  updateUI,
  getPopupElement,
  PopupElementId,
} = await import("./popup.ts");

Deno.test("updateUI - 全てのデータをストレージから読み込んで表示を更新する", async () => {
  // arrange
  const storageData: Partial<StorageData> = {
    tabCount: 15,
    dailyStats: { date: "2025-10-14", high: 20, low: 5 },
    lastAvailablePreviousDayCount: 12,
  };
  const globalRecord = globalThis as Record<string, unknown>;
  globalRecord.chrome = createMockChromeStorage(
    (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
      callback(storageData);
    },
  );
  const doc = createTestDocument();
  globalRecord.document = doc;

  // act
  updateUI();
  await new Promise((resolve) => setTimeout(resolve, 10));

  // assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "15",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "20",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "5",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "12",
  );
});

Deno.test("updateUI - tabCountのみが存在する場合に正しく表示する", async () => {
  // Arrange
  const storageData: Partial<StorageData> = {
    tabCount: 8,
  };

  globalRecord.chrome = createMockChromeStorage(
    (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
      setTimeout(() => callback(storageData), 0);
    },
  );
  const doc = createTestDocument();
  globalRecord.document = doc;

  // Act
  updateUI();
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "8",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "データなし",
  );
});

Deno.test("updateUI - dailyStatsのみが存在する場合に正しく表示する", async () => {
  // Arrange
  const storageData: Partial<StorageData> = {
    dailyStats: { date: "2025-10-14", high: 30, low: 10 },
  };

  globalRecord.chrome = createMockChromeStorage(
    (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
      setTimeout(() => callback(storageData), 0);
    },
  );
  const doc = createTestDocument();
  globalRecord.document = doc;

  // Act
  updateUI();
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "30",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "10",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "データなし",
  );
});

Deno.test("updateUI - lastAvailablePreviousDayCountが存在する場合に前日のセクションを表示する", async () => {
  // Arrange
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
  const doc = createTestDocument();
  globalRecord.document = doc;

  // Act
  updateUI();
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "18",
  );
});

Deno.test("updateUI - ストレージが空の場合にプレースホルダーを表示する", async () => {
  // Arrange
  const storageData: Partial<StorageData> = {};

  globalRecord.chrome = createMockChromeStorage(
    (_keys: string[], callback: (result: Partial<StorageData>) => void) => {
      setTimeout(() => callback(storageData), 0);
    },
  );
  const doc = createTestDocument();
  globalRecord.document = doc;

  // Act
  updateUI();
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "データなし",
  );
});
