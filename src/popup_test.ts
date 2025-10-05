/// <reference types="npm:@types/chrome" />
import { assertEquals, assertStrictEquals } from "assert/mod.ts";
import type { StorageData } from "./domain/types.ts";

// ---- Chrome Storage API のスタブ/スパイ ----

interface StorageGetCall {
  keys: string[];
  callback: (result: StorageData) => void;
}

interface StorageChangeListener {
  callback: (
    changes: { [key: string]: chrome.storage.StorageChange },
    namespace: string,
  ) => void;
}

class ChromeStorageStub {
  private getCallHistory: StorageGetCall[] = [];
  private changeListeners: StorageChangeListener[] = [];
  private storedData: StorageData = {};

  // chrome.storage.local.get のスタブ
  get(
    keys: string[],
    callback: (result: StorageData) => void,
  ): void {
    this.getCallHistory.push({ keys, callback });

    // ストアされたデータを基にコールバックを呼び出す
    const result: StorageData = {};
    for (const key of keys) {
      if (key === "tabCount" && this.storedData.tabCount !== undefined) {
        result.tabCount = this.storedData.tabCount;
      } else if (key === "dailyStats" && this.storedData.dailyStats) {
        result.dailyStats = this.storedData.dailyStats;
      } else if (
        key === "lastAvailablePreviousDayCount" &&
        this.storedData.lastAvailablePreviousDayCount !== undefined
      ) {
        result.lastAvailablePreviousDayCount =
          this.storedData.lastAvailablePreviousDayCount;
      }
    }
    callback(result);
  }

  // chrome.storage.onChanged.addListener のスパイ
  addChangeListener(
    callback: (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string,
    ) => void,
  ): void {
    this.changeListeners.push({ callback });
  }

  // テストヘルパー: ストレージデータをセット
  setStoredData(data: StorageData): void {
    this.storedData = data;
  }

  // テストヘルパー: ストレージ変更をシミュレート
  simulateChange(
    changes: { [key: string]: chrome.storage.StorageChange },
    namespace: string,
  ): void {
    for (const listener of this.changeListeners) {
      listener.callback(changes, namespace);
    }
  }

  // スパイ用: get が呼ばれた回数を取得
  getGetCallCount(): number {
    return this.getCallHistory.length;
  }

  // スパイ用: 最後の get 呼び出しのキーを取得
  getLastGetKeys(): string[] | undefined {
    if (this.getCallHistory.length === 0) return undefined;
    return this.getCallHistory[this.getCallHistory.length - 1].keys;
  }

  // スパイ用: リスナーが登録された回数を取得
  getListenerCount(): number {
    return this.changeListeners.length;
  }

  // テストヘルパー: すべてのスパイ情報をクリア
  reset(): void {
    this.getCallHistory = [];
    this.changeListeners = [];
    this.storedData = {};
  }
}

// グローバルな chrome オブジェクトのスタブを作成
function setupChromeStorageStub(): ChromeStorageStub {
  const stub = new ChromeStorageStub();

  (globalThis as Record<string, unknown>).chrome = {
    storage: {
      local: {
        get: (keys: string[], callback: (result: StorageData) => void) => {
          stub.get(keys, callback);
        },
      },
      onChanged: {
        addListener: (
          callback: (
            changes: { [key: string]: chrome.storage.StorageChange },
            namespace: string,
          ) => void,
        ) => {
          stub.addChangeListener(callback);
        },
      },
    },
  };

  return stub;
}

// テストヘルパー: chrome オブジェクトをクリーンアップ
function cleanupChromeStub(): void {
  delete (globalThis as Record<string, unknown>).chrome;
}

// ---- テスト ----

Deno.test("chrome.storage.local.get は正しいキーで呼び出される", () => {
  // Arrange
  const stub = setupChromeStorageStub();
  stub.setStoredData({
    tabCount: 5,
    dailyStats: { date: "2025-01-15", high: 10, low: 3 },
    lastAvailablePreviousDayCount: 7,
  });

  // Act
  chrome.storage.local.get(
    ["tabCount", "dailyStats", "lastAvailablePreviousDayCount"],
    (_result: StorageData) => {
      // コールバック内の処理は検証しない（DOMモック化は別のため）
    },
  );

  // Assert
  assertStrictEquals(stub.getGetCallCount(), 1);
  assertEquals(stub.getLastGetKeys(), [
    "tabCount",
    "dailyStats",
    "lastAvailablePreviousDayCount",
  ]);

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.local.get はストアされたデータをコールバックに渡す", () => {
  // Arrange
  const stub = setupChromeStorageStub();
  const testData: StorageData = {
    tabCount: 5,
    dailyStats: { date: "2025-01-15", high: 10, low: 3 },
    lastAvailablePreviousDayCount: 7,
  };
  stub.setStoredData(testData);

  let receivedData: StorageData | undefined;

  // Act
  chrome.storage.local.get(
    ["tabCount", "dailyStats", "lastAvailablePreviousDayCount"],
    (result: StorageData) => {
      receivedData = result;
    },
  );

  // Assert
  assertEquals(receivedData, testData);

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.local.get は一部のデータが欠けている場合も動作する", () => {
  // Arrange
  const stub = setupChromeStorageStub();
  stub.setStoredData({
    tabCount: 5,
  });

  let receivedData: StorageData | undefined;

  // Act
  chrome.storage.local.get(
    ["tabCount", "dailyStats", "lastAvailablePreviousDayCount"],
    (result: StorageData) => {
      receivedData = result;
    },
  );

  // Assert
  assertEquals(receivedData, { tabCount: 5 });
  assertStrictEquals(receivedData?.dailyStats, undefined);
  assertStrictEquals(receivedData?.lastAvailablePreviousDayCount, undefined);

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.onChanged.addListener はリスナーを登録できる", () => {
  // Arrange
  const stub = setupChromeStorageStub();

  // Act
  chrome.storage.onChanged.addListener(
    (
      _changes: { [key: string]: chrome.storage.StorageChange },
      _namespace: string,
    ) => {
      // リスナー登録のみテスト
    },
  );

  // Assert
  assertStrictEquals(stub.getListenerCount(), 1);

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.onChanged はストレージ変更を通知する", () => {
  // Arrange
  const stub = setupChromeStorageStub();

  let receivedChanges:
    | { [key: string]: chrome.storage.StorageChange }
    | undefined;
  let receivedNamespace: string | undefined;

  chrome.storage.onChanged.addListener(
    (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string,
    ) => {
      receivedChanges = changes;
      receivedNamespace = namespace;
    },
  );

  // Act
  const testChanges = {
    tabCount: {
      newValue: 10,
      oldValue: 5,
    } as chrome.storage.StorageChange,
  };
  stub.simulateChange(testChanges, "local");

  // Assert
  assertEquals(receivedChanges, testChanges);
  assertStrictEquals(receivedNamespace, "local");

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.onChanged は複数の変更を通知できる", () => {
  // Arrange
  const stub = setupChromeStorageStub();

  let receivedChanges:
    | { [key: string]: chrome.storage.StorageChange }
    | undefined;

  chrome.storage.onChanged.addListener(
    (
      changes: { [key: string]: chrome.storage.StorageChange },
      _namespace: string,
    ) => {
      receivedChanges = changes;
    },
  );

  // Act
  const testChanges = {
    tabCount: {
      newValue: 10,
      oldValue: 5,
    } as chrome.storage.StorageChange,
    dailyStats: {
      newValue: { date: "2025-01-15", high: 10, low: 3 },
      oldValue: { date: "2025-01-15", high: 8, low: 3 },
    } as chrome.storage.StorageChange,
  };
  stub.simulateChange(testChanges, "local");

  // Assert
  assertEquals(receivedChanges, testChanges);

  // Cleanup
  cleanupChromeStub();
});

Deno.test("chrome.storage.onChanged はnamespaceがlocalでない場合も通知する", () => {
  // Arrange
  const stub = setupChromeStorageStub();

  let receivedNamespace: string | undefined;

  chrome.storage.onChanged.addListener(
    (
      _changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string,
    ) => {
      receivedNamespace = namespace;
    },
  );

  // Act
  stub.simulateChange({}, "sync");

  // Assert
  assertStrictEquals(receivedNamespace, "sync");

  // Cleanup
  cleanupChromeStub();
});
