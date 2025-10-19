/// <reference types="npm:@types/chrome" />

import { assertEquals, assertStrictEquals } from "assert/mod.ts";
import type { StorageData } from "./domain/types.ts";

// Chrome APIのモック型定義
type MockTab = chrome.tabs.Tab;
type MockStorageData = StorageData;

// テスト用のモックChrome APIを作成
function createMockChrome() {
  const mockTabs: MockTab[] = [];
  let mockStorage: MockStorageData = {};
  let badgeText = "";
  let badgeColor = "";

  return {
    tabs: {
      query: (_queryInfo: chrome.tabs.QueryInfo) => Promise.resolve(mockTabs),
      onCreated: {
        addListener: (_callback: () => void) => {},
      },
      onRemoved: {
        addListener: (_callback: () => void) => {},
      },
    },
    storage: {
      local: {
        get: (_keys: string[]) => Promise.resolve(mockStorage),
        set: (data: MockStorageData) => {
          mockStorage = { ...mockStorage, ...data };
          return Promise.resolve();
        },
      },
    },
    action: {
      setBadgeText: (details: chrome.action.BadgeTextDetails) => {
        badgeText = details.text || "";
      },
      setBadgeBackgroundColor: (details: chrome.action.BadgeColorDetails) => {
        badgeColor = details.color as string;
      },
    },
    runtime: {
      onStartup: {
        addListener: (_callback: () => void) => {},
      },
      onInstalled: {
        addListener: (_callback: () => void) => {},
      },
    },
    // テスト用のヘルパー
    _test: {
      setTabs: (tabs: MockTab[]) => {
        mockTabs.splice(0, mockTabs.length, ...tabs);
      },
      setStorage: (data: MockStorageData) => {
        mockStorage = data;
      },
      getBadgeText: () => badgeText,
      getBadgeColor: () => badgeColor,
      getStorage: () => mockStorage,
    },
  };
}

// グローバルモックを設定
const mockChrome = createMockChrome();
(globalThis as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;

// 実際の関数をインポート
const {
  getTabCount,
  getStorageData,
  setBadgeText,
  setBadgeColor,
  saveStorageData,
} = await import("./background.ts");

Deno.test("getTabCountは現在開いているタブの数を返す", async () => {
  // Arrange
  mockChrome._test.setTabs([
    { id: 1 } as MockTab,
    { id: 2 } as MockTab,
    { id: 3 } as MockTab,
  ]);

  // Act
  const count = await getTabCount();

  // Assert
  assertStrictEquals(count, 3);
});

Deno.test("getTabCountはタブがない場合0を返す", async () => {
  // Arrange
  mockChrome._test.setTabs([]);

  // Act
  const count = await getTabCount();

  // Assert
  assertStrictEquals(count, 0);
});

Deno.test("getStorageDataはストレージからデータを取得する", async () => {
  // Arrange
  const expectedData: StorageData = {
    tabCount: 5,
    dailyStats: { date: "2025-10-19", high: 10, low: 2 },
    lastPreviousDayCount: 8,
  };
  mockChrome._test.setStorage(expectedData);

  // Act
  const data = await getStorageData();

  // Assert
  assertEquals(data, expectedData);
});

Deno.test("getStorageDataは空のストレージの場合空オブジェクトを返す", async () => {
  // Arrange
  mockChrome._test.setStorage({});

  // Act
  const data = await getStorageData();

  // Assert
  assertEquals(data, {});
});

Deno.test("setBadgeTextはバッジのテキストを設定する", () => {
  // Arrange
  const text = "42";

  // Act
  setBadgeText(text);

  // Assert
  assertStrictEquals(mockChrome._test.getBadgeText(), text);
});

Deno.test("setBadgeTextは空文字列を設定できる", () => {
  // Arrange
  const text = "";

  // Act
  setBadgeText(text);

  // Assert
  assertStrictEquals(mockChrome._test.getBadgeText(), text);
});

Deno.test("setBadgeColorはバッジの背景色を設定する", () => {
  // Arrange
  const color = "red";

  // Act
  setBadgeColor(color);

  // Assert
  assertStrictEquals(mockChrome._test.getBadgeColor(), color);
});

Deno.test("setBadgeColorは緑色を設定できる", () => {
  // Arrange
  const color = "green";

  // Act
  setBadgeColor(color);

  // Assert
  assertStrictEquals(mockChrome._test.getBadgeColor(), color);
});

Deno.test("saveStorageDataはストレージにデータを保存する", async () => {
  // Arrange
  const dataToSave: StorageData = {
    tabCount: 7,
    dailyStats: { date: "2025-10-19", high: 15, low: 3 },
    lastPreviousDayCount: 6,
  };
  mockChrome._test.setStorage({});

  // Act
  await saveStorageData(dataToSave);

  // Assert
  assertEquals(mockChrome._test.getStorage(), dataToSave);
});

Deno.test("saveStorageDataは部分的なデータを保存できる", async () => {
  // Arrange
  const initialData: StorageData = {
    tabCount: 5,
  };
  mockChrome._test.setStorage(initialData);
  const dataToSave: StorageData = {
    dailyStats: { date: "2025-10-19", high: 10, low: 5 },
  };

  // Act
  await saveStorageData(dataToSave);

  // Assert
  assertEquals(mockChrome._test.getStorage(), {
    tabCount: 5,
    dailyStats: { date: "2025-10-19", high: 10, low: 5 },
  });
});
