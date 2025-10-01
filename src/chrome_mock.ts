/// <reference types="npm:@types/chrome" />

// Chrome API Mock のヘルパー関数群
type Listener = (...args: unknown[]) => void | Promise<void>;

export class ChromeMock {
  private storage = new Map<string, unknown>();
  private badgeText = "";
  private badgeColor = "";
  private listeners: { [event: string]: Listener[] } = {};
  private tabsQueryResult: chrome.tabs.Tab[] = [];

  // シンプルなファクトリーメソッド
  static create(): ChromeMock {
    return new ChromeMock();
  }

  // Chrome API をグローバルに設定
  setup(): void {
    (globalThis as unknown as { chrome: unknown }).chrome = {
      tabs: {
        query: () => Promise.resolve(this.tabsQueryResult),
        onCreated: this.createEventListener("tabsCreated"),
        onRemoved: this.createEventListener("tabsRemoved"),
      },
      storage: {
        local: {
          get: this.storageGet.bind(this),
          set: this.storageSet.bind(this),
          clear: this.storageClear.bind(this),
        },
      },
      action: {
        setBadgeText: this.setBadgeText.bind(this),
        setBadgeBackgroundColor: this.setBadgeBackgroundColor.bind(this),
      },
      runtime: {
        onStartup: this.createEventListener("runtimeStartup"),
        onInstalled: this.createEventListener("runtimeInstalled"),
      },
    };
  }

  // クリーンアップ
  cleanup(): void {
    // deno-lint-ignore no-explicit-any
    delete (globalThis as any).chrome;
    this.storage.clear();
    this.badgeText = "";
    this.badgeColor = "";
    this.listeners = {};
    this.tabsQueryResult = [];
  }

  // イベントリスナーのヘルパー
  private createEventListener(name: string) {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    return {
      addListener: (callback: Listener) => {
        this.listeners[name].push(callback);
      },
      listeners: this.listeners[name], // テストでアクセス可能
    };
  }

  // Storage モック実装
  private storageGet(
    keys?: string | string[] | Record<string, unknown> | null,
  ): Promise<Record<string, unknown>> {
    if (!keys) {
      return Promise.resolve(Object.fromEntries(this.storage));
    }
    if (typeof keys === "string") {
      const value = this.storage.get(keys);
      return Promise.resolve(value !== undefined ? { [keys]: value } : {});
    }
    if (Array.isArray(keys)) {
      const result: Record<string, unknown> = {};
      for (const key of keys) {
        const value = this.storage.get(key);
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return Promise.resolve(result);
    }
    // オブジェクト（デフォルト値付き）
    const result: Record<string, unknown> = {};
    for (const [key, defaultValue] of Object.entries(keys)) {
      const value = this.storage.get(key);
      result[key] = value !== undefined ? value : defaultValue;
    }
    return Promise.resolve(result);
  }

  private storageSet(items: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      this.storage.set(key, value);
    }
    return Promise.resolve();
  }

  private storageClear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }

  // Action モック実装
  private setBadgeText(details: { text: string }): Promise<void> {
    this.badgeText = details.text;
    return Promise.resolve();
  }

  private setBadgeBackgroundColor(details: { color: string }): Promise<void> {
    this.badgeColor = details.color;
    return Promise.resolve();
  }

  // テスト用のゲッター
  getBadgeText(): string {
    return this.badgeText;
  }

  getBadgeColor(): string {
    return this.badgeColor;
  }

  getStorageData(): Map<string, unknown> {
    return this.storage;
  }

  getListeners(eventName: string): Listener[] {
    return this.listeners[eventName] || [];
  }

  // タブクエリーの結果を設定するヘルパー
  setTabsQueryResult(tabs: chrome.tabs.Tab[]): void {
    this.tabsQueryResult = tabs;
  }

  // イベントを発火するヘルパー
  async fireEvent(eventName: string, ...args: unknown[]): Promise<void> {
    const listeners = this.getListeners(eventName);
    for (const listener of listeners) {
      await listener(...args);
    }
  }
}
