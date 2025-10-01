/// <reference types="npm:@types/chrome" />

import { assertEquals } from "assert/mod.ts";
import { ChromeMock } from "./chrome_mock.ts";

// === テストケース ===

Deno.test("Chrome API mock setup test", () => {
  const chromeMock = ChromeMock.create();
  chromeMock.setup();

  // chrome オブジェクトがグローバルに存在することを確認
  assertEquals(typeof globalThis.chrome, "object");
  assertEquals(typeof globalThis.chrome.tabs, "object");
  assertEquals(typeof globalThis.chrome.storage, "object");
  assertEquals(typeof globalThis.chrome.action, "object");
  assertEquals(typeof globalThis.chrome.runtime, "object");

  chromeMock.cleanup();
});

Deno.test("chrome.storage.local mock test", async () => {
  const chromeMock = ChromeMock.create();
  chromeMock.setup();

  // データの保存
  await chrome.storage.local.set({ testKey: "testValue" });

  // データの取得（文字列キー）
  const result1 = await chrome.storage.local.get("testKey");
  assertEquals(result1, { testKey: "testValue" });

  // データの取得（配列キー）
  await chrome.storage.local.set({ key1: "value1", key2: "value2" });
  const result2 = await chrome.storage.local.get(["key1", "key2"]);
  assertEquals(result2, { key1: "value1", key2: "value2" });

  // データのクリア
  await chrome.storage.local.clear();
  const result3 = await chrome.storage.local.get("testKey");
  assertEquals(result3, {});

  chromeMock.cleanup();
});

Deno.test("chrome.tabs.query mock test", async () => {
  const chromeMock = ChromeMock.create();
  chromeMock.setup();

  // タブクエリーの結果を設定
  chromeMock.setTabsQueryResult([
    { id: 1 } as chrome.tabs.Tab,
    { id: 2 } as chrome.tabs.Tab,
    { id: 3 } as chrome.tabs.Tab,
  ]);

  const tabs = await chrome.tabs.query({});
  assertEquals(tabs.length, 3);

  chromeMock.cleanup();
});

Deno.test("chrome.action mock test", async () => {
  const chromeMock = ChromeMock.create();
  chromeMock.setup();

  // バッジの色を設定
  await chrome.action.setBadgeBackgroundColor({ color: "green" });
  assertEquals(chromeMock.getBadgeColor(), "green");

  // バッジのテキストを設定
  await chrome.action.setBadgeText({ text: "5" });
  assertEquals(chromeMock.getBadgeText(), "5");

  chromeMock.cleanup();
});

Deno.test("chrome event listeners mock test", () => {
  const chromeMock = ChromeMock.create();
  chromeMock.setup();

  // リスナーが追加できることを確認
  const listener = () => {};
  chrome.runtime.onStartup.addListener(listener);

  const listeners = chromeMock.getListeners("runtimeStartup");
  assertEquals(listeners.length, 1);
  assertEquals(listeners[0], listener);

  chromeMock.cleanup();
});
