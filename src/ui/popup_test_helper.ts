import { DOMParser } from "deno-dom";

export const chromeStub = createMockChromeStorage((_keys, callback) => {
  callback({} as unknown);
});

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
