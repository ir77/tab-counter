import { assertStrictEquals } from "assert/mod.ts";
import { StorageData } from "../domain/types.ts";
import { DOMParser } from "deno-dom";

type StorageChange = {
  oldValue?: unknown;
  newValue?: unknown;
};

type StorageChangeListener = (
  changes: Record<string, StorageChange>,
  namespace: string,
) => void;

type ChromeStorageGet<T> = (
  keys: string[],
  callback: (result: T) => void,
) => void;

type MockChromeStorage<T> = {
  storage: {
    local: {
      get: ChromeStorageGet<T>;
    };
    onChanged: {
      addListener: (listener: StorageChangeListener) => void;
    };
  };
  listeners: StorageChangeListener[];
};

// カスタマイズ可能なモックChromeを作成する関数
function createMockChromeStorage<T>(
  getData: ChromeStorageGet<T>,
): MockChromeStorage<T> {
  const listeners: StorageChangeListener[] = [];

  return {
    storage: {
      local: {
        get: getData,
      },
      onChanged: {
        addListener: (listener: StorageChangeListener) => {
          listeners.push(listener);
        },
      },
    },
    listeners,
  };
}

// 実際のHTMLファイルから要素を作成するヘルパー関数
function createTestDocument() {
  const htmlPath = new URL("../ui/popup.html", import.meta.url);
  const htmlContent = Deno.readTextFileSync(htmlPath);
  return new DOMParser().parseFromString(htmlContent, "text/html")!;
}

// グローバルモックを設定（importの前に必要）
const globalRecord = globalThis as Record<string, unknown>;
const defaultStorageGet: ChromeStorageGet<StorageData> = (
  _keys,
  callback,
) => {
  callback({});
};
const mockChrome = createMockChromeStorage(defaultStorageGet);
globalRecord.chrome = mockChrome;
globalRecord.document = { getElementById: (_id: string) => null };

const {
  updateUI,
  getPopupElement,
  PopupElementId,
} = await import("./popup.ts");

function setChromeLocalGet(getImpl: ChromeStorageGet<StorageData>) {
  mockChrome.storage.local.get = getImpl;
}

function getStorageChangeListener(): StorageChangeListener {
  const listener = mockChrome.listeners.at(-1);
  if (!listener) {
    throw new Error("storage change listenerが登録されていません");
  }
  return listener;
}

Deno.test("updateUI - ストレージのデータを表示に反映する", async () => {
  // arrange
  const storageData: StorageData = {
    tabCount: 15,
    dailyStats: { date: "2025-10-14", high: 20, low: 5 },
    lastPreviousDayCount: 12,
  };
  setChromeLocalGet((_, callback) => {
    callback(storageData);
  });
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

Deno.test("updateUI - 空ストレージのデータはプレースホルダーを表示する", async () => {
  // Arrange
  const storageData: StorageData = {};

  setChromeLocalGet((_, callback) => {
    setTimeout(() => callback(storageData), 0);
  });
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

Deno.test("chrome.storage.onChanged.addListener - changes.tabCount", () => {
  const listener = getStorageChangeListener();
  const doc = createTestDocument();
  globalRecord.document = doc;

  listener({
    tabCount: { newValue: 42 },
  }, "local");

  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "42",
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
    "...",
  );
});

Deno.test("chrome.storage.onChanged.addListener - changes.dailyStats", () => {
  const listener = getStorageChangeListener();
  const doc = createTestDocument();
  globalRecord.document = doc;

  listener({
    dailyStats: {
      newValue: { date: "2025-10-18", high: 7, low: 3 },
    },
  }, "local");

  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "7",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "3",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "...",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "...",
  );
});

Deno.test(
  "chrome.storage.onChanged.addListener - changes.lastPreviousDayCount",
  () => {
    const listener = getStorageChangeListener();
    const doc = createTestDocument();
    globalRecord.document = doc;

    listener({
      lastPreviousDayCount: {
        newValue: 11,
      },
    }, "local");

    assertStrictEquals(
      getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
      "11",
    );
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
  },
);
