export const documentStub = {
  getElementById: (_id: string) => null,
};

export const chromeStub = {
  storage: {
    local: {
      get: (_keys: string[], callback: (result: unknown) => void) => {
        callback({} as unknown);
      },
    },
    onChanged: {
      addListener: () => {},
    },
  },
};

// popup_update_test.ts用のモックDOM要素
export const mockPopupElements = {
  tabCount: { textContent: "" } as HTMLElement,
  highCount: { textContent: "" } as HTMLElement,
  lowCount: { textContent: "" } as HTMLElement,
  previousDayContainer: {
    style: { display: "none" },
  } as HTMLElement,
  previousDayLastCount: { textContent: "" } as HTMLElement,
};

// モックDOM要素をリセットする関数
export function resetMockPopupElements() {
  mockPopupElements.tabCount.textContent = "";
  mockPopupElements.highCount.textContent = "";
  mockPopupElements.lowCount.textContent = "";
  mockPopupElements.previousDayContainer.style.display = "none";
  mockPopupElements.previousDayLastCount.textContent = "";
}

// モックDocumentを作成する関数
export function createMockDocument() {
  return {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement | null> = {
        tabCount: mockPopupElements.tabCount,
        highCount: mockPopupElements.highCount,
        lowCount: mockPopupElements.lowCount,
        previousDayContainer: mockPopupElements.previousDayContainer,
        previousDayLastCount: mockPopupElements.previousDayLastCount,
      };
      return elements[id] || null;
    },
  };
}

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
