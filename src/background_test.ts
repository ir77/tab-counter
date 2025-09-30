/// <reference types="npm:@types/chrome" />

import { assertEquals } from "assert/mod.ts";

// Chrome API のモック型定義
type Listener = (...args: unknown[]) => void | Promise<void>;

interface MockStorageArea {
  data: Record<string, unknown>;
  get: (
    keys?: string | string[] | Record<string, unknown> | null,
  ) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  clear: () => Promise<void>;
}

interface MockChrome {
  tabs: {
    query: (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]>;
    onCreated: {
      addListener: (callback: Listener) => void;
      listeners: Listener[];
    };
    onRemoved: {
      addListener: (callback: Listener) => void;
      listeners: Listener[];
    };
  };
  storage: {
    local: MockStorageArea;
  };
  action: {
    setBadgeBackgroundColor: (
      details: { color: string },
    ) => Promise<void>;
    setBadgeText: (details: { text: string }) => Promise<void>;
    badgeColor?: string;
    badgeText?: string;
  };
  runtime: {
    onStartup: {
      addListener: (callback: Listener) => void;
      listeners: Listener[];
    };
    onInstalled: {
      addListener: (callback: Listener) => void;
      listeners: Listener[];
    };
  };
}

// Chrome API のモック実装
function createMockChrome(): MockChrome {
  const storageData: Record<string, unknown> = {};

  return {
    tabs: {
      query: (_queryInfo: chrome.tabs.QueryInfo) => {
        // デフォルトでは空の配列を返す（テストで上書き可能）
        return Promise.resolve([]);
      },
      onCreated: {
        addListener: (callback: Listener) => {
          mockChrome.tabs.onCreated.listeners.push(callback);
        },
        listeners: [],
      },
      onRemoved: {
        addListener: (callback: Listener) => {
          mockChrome.tabs.onRemoved.listeners.push(callback);
        },
        listeners: [],
      },
    },
    storage: {
      local: {
        data: storageData,
        get: (keys) => {
          if (!keys) {
            return Promise.resolve({ ...storageData });
          }
          if (typeof keys === "string") {
            const result: Record<string, unknown> = {};
            if (keys in storageData) {
              result[keys] = storageData[keys];
            }
            return Promise.resolve(result);
          }
          if (Array.isArray(keys)) {
            const result: Record<string, unknown> = {};
            for (const key of keys) {
              if (key in storageData) {
                result[key] = storageData[key];
              }
            }
            return Promise.resolve(result);
          }
          // keys がオブジェクトの場合（デフォルト値付き）
          const result: Record<string, unknown> = {};
          for (const [key, defaultValue] of Object.entries(keys)) {
            result[key] = key in storageData ? storageData[key] : defaultValue;
          }
          return Promise.resolve(result);
        },
        set: (items: Record<string, unknown>) => {
          Object.assign(storageData, items);
          return Promise.resolve();
        },
        clear: () => {
          Object.keys(storageData).forEach((key) => delete storageData[key]);
          return Promise.resolve();
        },
      },
    },
    action: {
      setBadgeBackgroundColor: (
        details: { color: string },
      ) => {
        mockChrome.action.badgeColor = details.color;
        return Promise.resolve();
      },
      setBadgeText: (details: { text: string }) => {
        mockChrome.action.badgeText = details.text;
        return Promise.resolve();
      },
    },
    runtime: {
      onStartup: {
        addListener: (callback: Listener) => {
          mockChrome.runtime.onStartup.listeners.push(callback);
        },
        listeners: [],
      },
      onInstalled: {
        addListener: (callback: Listener) => {
          mockChrome.runtime.onInstalled.listeners.push(callback);
        },
        listeners: [],
      },
    },
  };
}

// グローバルなモックインスタンス
let mockChrome: MockChrome;

// テスト前のセットアップ
function setupChromeApiMock() {
  mockChrome = createMockChrome();
  (globalThis as unknown as { chrome: MockChrome }).chrome = mockChrome;
}

// テスト後のクリーンアップ
function teardownChromeApiMock() {
  // deno-lint-ignore no-explicit-any
  delete (globalThis as any).chrome;
}

// === テストケース ===

Deno.test("Chrome API mock setup test", () => {
  setupChromeApiMock();

  // chrome オブジェクトがグローバルに存在することを確認
  assertEquals(typeof globalThis.chrome, "object");
  assertEquals(typeof globalThis.chrome.tabs, "object");
  assertEquals(typeof globalThis.chrome.storage, "object");
  assertEquals(typeof globalThis.chrome.action, "object");
  assertEquals(typeof globalThis.chrome.runtime, "object");

  teardownChromeApiMock();
});

Deno.test("chrome.storage.local mock test", async () => {
  setupChromeApiMock();

  // データの保存
  await mockChrome.storage.local.set({ testKey: "testValue" });

  // データの取得（文字列キー）
  const result1 = await mockChrome.storage.local.get("testKey");
  assertEquals(result1, { testKey: "testValue" });

  // データの取得（配列キー）
  await mockChrome.storage.local.set({ key1: "value1", key2: "value2" });
  const result2 = await mockChrome.storage.local.get(["key1", "key2"]);
  assertEquals(result2, { key1: "value1", key2: "value2" });

  // データのクリア
  await mockChrome.storage.local.clear();
  const result3 = await mockChrome.storage.local.get("testKey");
  assertEquals(result3, {});

  teardownChromeApiMock();
});

Deno.test("chrome.tabs.query mock test", async () => {
  setupChromeApiMock();

  // モックの動作を上書き
  mockChrome.tabs.query = (_queryInfo) => {
    return Promise.resolve([
      { id: 1 } as chrome.tabs.Tab,
      { id: 2 } as chrome.tabs.Tab,
      { id: 3 } as chrome.tabs.Tab,
    ]);
  };

  const tabs = await mockChrome.tabs.query({});
  assertEquals(tabs.length, 3);

  teardownChromeApiMock();
});

Deno.test("chrome.action mock test", async () => {
  setupChromeApiMock();

  // バッジの色を設定
  await mockChrome.action.setBadgeBackgroundColor({ color: "green" });
  assertEquals(mockChrome.action.badgeColor, "green");

  // バッジのテキストを設定
  await mockChrome.action.setBadgeText({ text: "5" });
  assertEquals(mockChrome.action.badgeText, "5");

  teardownChromeApiMock();
});

Deno.test("chrome event listeners mock test", () => {
  setupChromeApiMock();

  // リスナーが追加できることを確認
  const listener = () => {};
  mockChrome.runtime.onStartup.addListener(listener);
  assertEquals(mockChrome.runtime.onStartup.listeners.length, 1);
  assertEquals(mockChrome.runtime.onStartup.listeners[0], listener);

  teardownChromeApiMock();
});
