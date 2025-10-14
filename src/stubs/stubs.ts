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

export class FakeElement implements Pick<HTMLElement, "textContent"> {
  textContent = "";
}

export function toHTMLElement(element: FakeElement): HTMLElement {
  return element as unknown as HTMLElement;
}
