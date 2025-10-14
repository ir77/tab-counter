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
