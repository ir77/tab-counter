import { DOMParser } from "deno-dom";

// カスタマイズ可能なモックChromeを作成する関数
export function createMockChromeStorage<T>(
  getData: (
    keys: string[],
    callback: (result: T) => void,
  ) => void,
) {
  return {
    storage: {
      local: {
        get: getData,
      },
      onChanged: {
        addListener: () => {},
      },
    },
  };
}

export const documentStub = {
  getElementById: (_id: string) => null,
};

// 実際のHTMLファイルから要素を作成するヘルパー関数
export function createTestDocument() {
  const htmlPath = new URL("../ui/popup.html", import.meta.url);
  const htmlContent = Deno.readTextFileSync(htmlPath);
  return new DOMParser().parseFromString(htmlContent, "text/html")!;
}

// 初期DOM要素を作成するヘルパー関数
export function createMockPopupElements() {
  const doc = createTestDocument();

  return {
    tabCount: doc.getElementById("tabCount") as unknown as HTMLElement,
    highCount: doc.getElementById("highCount") as unknown as HTMLElement,
    lowCount: doc.getElementById("lowCount") as unknown as HTMLElement,
    previousDayContainer: doc.getElementById(
      "previousDayContainer",
    ) as unknown as HTMLElement,
    previousDayLastCount: doc.getElementById(
      "previousDayLastCount",
    ) as unknown as HTMLElement,
  };
}

// モックDocumentを作成する関数
export function createMockDocument() {
  const elements = createMockPopupElements();
  return {
    getElementById: (id: string) => {
      const elementMap: Record<string, HTMLElement | null> = {
        tabCount: elements.tabCount,
        highCount: elements.highCount,
        lowCount: elements.lowCount,
        previousDayContainer: elements.previousDayContainer,
        previousDayLastCount: elements.previousDayLastCount,
      };
      return elementMap[id] || null;
    },
    _elements: elements, // テスト用に要素を公開
  };
}
