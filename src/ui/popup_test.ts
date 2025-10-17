import { assertStrictEquals } from "assert/mod.ts";
import { StorageData } from "../domain/types.ts";
import { DOMParser } from "deno-dom";

// テスト用の定数
const TEST_DELAY_MS = 5;

// Chrome ストレージ変更の型定義
type StorageChanges = Record<
  string,
  { oldValue?: unknown; newValue?: unknown }
>;

// モックされた Chrome オブジェクトの型定義
interface MockChrome<T> {
  storage: {
    local: {
      get: (keys: string[], callback: (result: T) => void) => void;
    };
    onChanged: {
      addListener: (
        cb: (changes: StorageChanges, namespace: string) => void,
      ) => void;
    };
  };
  triggerOnChanged: (changes: StorageChanges, namespace?: string) => void;
  setGet: (fn: (keys: string[], cb: (result: T) => void) => void) => void;
}

// Chrome API をモックする関数（onChanged のリスナーをキャプチャして外部から発火できる）
function createMockChromeStorage<T>(
  initialGet: (
    keys: string[],
    callback: (result: T) => void,
  ) => void,
): MockChrome<T> {
  let listener:
    | ((changes: StorageChanges, namespace: string) => void)
    | null = null;

  const storage = {
    local: {
      get: initialGet,
    },
    onChanged: {
      addListener: (
        cb: (changes: StorageChanges, namespace: string) => void,
      ) => {
        listener = cb;
      },
    },
  };

  return {
    storage,
    // テストが呼び出すためのヘルパー: 変更イベントを発火する
    triggerOnChanged: (changes: StorageChanges, namespace = "local") => {
      if (listener) listener(changes, namespace);
    },
    // テストが storage.local.get の挙動を差し替えられるようにする
    setGet: (fn: (keys: string[], cb: (result: T) => void) => void) => {
      storage.local.get = fn;
    },
  };
}

// 実際の popup.html から DOM を作るヘルパー
function createTestDocument() {
  const htmlPath = new URL("../ui/popup.html", import.meta.url);
  const htmlContent = Deno.readTextFileSync(htmlPath);
  return new DOMParser().parseFromString(htmlContent, "text/html")!;
}

// グローバルをテスト用に初期化（popup.ts の import 前に行うこと）
const globalRecord = globalThis as Record<string, unknown>;
const chromeMock = createMockChromeStorage((_keys, cb) => cb({} as unknown));
globalRecord.chrome = chromeMock;
globalRecord.document = {
  getElementById: (_id: string) => null,
};

// import はモックセット後に行う（popup.ts は import 時に updateUI と addListener を登録する）
const {
  updateUI,
  getPopupElement,
  PopupElementId,
} = await import("./popup.ts");

// Utility: テスト用に document と chrome.get を差し替える
function setupDocumentAndGet(
  doc: Document,
  getImpl?: (keys: string[], cb: (r: Partial<StorageData>) => void) => void,
) {
  globalRecord.document = doc;
  if (getImpl) {
    chromeMock.setGet(getImpl);
  }
}

// ==== テストケース ====

// 1) tabCount の変更時にタブ数表示が更新される
Deno.test("onChanged - tabCount の変更でタブ数表示が更新される", async () => {
  const doc = createTestDocument();
  setupDocumentAndGet(doc);

  // 初期表示（…）にしておく
  updateUI();
  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

  // Act: tabCount の変更イベントを発火
  chromeMock.triggerOnChanged({
    tabCount: { oldValue: 5, newValue: 42 },
  }, "local");

  // 少し待つ（更新は同期だが DOM 操作のタイミング確保）
  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

  // Assert
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "42",
  );
});

// 2) dailyStats の変更時に high / low が更新される
Deno.test("onChanged - dailyStats の変更で high/low が更新される", async () => {
  const doc = createTestDocument();
  setupDocumentAndGet(doc);

  chromeMock.triggerOnChanged({
    dailyStats: {
      oldValue: null,
      newValue: { date: "2025-10-16", high: 99, low: 1 },
    },
  }, "local");

  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "99",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "1",
  );
});

// 3) lastAvailablePreviousDayCount の変更時に前日表示が更新される
Deno.test(
  "onChanged - lastAvailablePreviousDayCount の変更で前日表示が更新される",
  async () => {
    const doc = createTestDocument();
    setupDocumentAndGet(doc);

    chromeMock.triggerOnChanged({
      lastAvailablePreviousDayCount: { oldValue: null, newValue: 123 },
    }, "local");

    await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

    assertStrictEquals(
      getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
      "123",
    );
  },
);

// 4) 複数フィールド同時変更
Deno.test("onChanged - 複数フィールドの同時変更で全て更新される", async () => {
  const doc = createTestDocument();
  setupDocumentAndGet(doc);

  chromeMock.triggerOnChanged({
    tabCount: { oldValue: 1, newValue: 2 },
    dailyStats: {
      oldValue: null,
      newValue: { date: "2025-10-16", high: 10, low: 2 },
    },
    lastAvailablePreviousDayCount: { oldValue: null, newValue: 7 },
  }, "local");

  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "2",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.HighCount, doc)?.textContent,
    "10",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.LowCount, doc)?.textContent,
    "2",
  );
  assertStrictEquals(
    getPopupElement(PopupElementId.PreviousDayLastCount, doc)?.textContent,
    "7",
  );
});

// 5) namespace が local でない場合は更新されない
Deno.test("onChanged - namespace が local でない場合は更新されない", async () => {
  const doc = createTestDocument();

  // まず初期値をセットするために storage.get で明示的に初期データを入れる
  setupDocumentAndGet(
    doc,
    (_keys, cb) => cb({ tabCount: 11 } as Partial<StorageData>),
  );
  updateUI();
  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "11",
  );

  // Act: namespace が "sync" のイベントを発火（local 以外）
  chromeMock.triggerOnChanged({
    tabCount: { oldValue: 11, newValue: 88 },
  }, "sync");

  await new Promise((r) => setTimeout(r, TEST_DELAY_MS));

  // Assert: 値は変わらない
  assertStrictEquals(
    getPopupElement(PopupElementId.TabCount, doc)?.textContent,
    "11",
  );
});
