import process from "node:process";
import {
  type BrowserContext,
  chromium,
  expect as baseExpect,
  test as base,
} from "@playwright/test";

const EXTENSION_LOAD_TIMEOUT_MS = 15_000;
const EXTENSION_PATH = `${process.cwd()}/dist`;

// https://playwright.dev/docs/chrome-extensions
export const test = base.extend<
  { context: BrowserContext; extensionId: string }
>(
  {
    // deno-lint-ignore no-empty-pattern
    context: async ({}, use) => {
      const context = await chromium.launchPersistentContext("", {
        channel: "chromium",
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
        ],
      });

      try {
        await use(context);
      } finally {
        await context.close();
      }
    },
    extensionId: async ({ context }, use) => {
      let [serviceWorker] = context.serviceWorkers();
      if (!serviceWorker) {
        serviceWorker = await context.waitForEvent("serviceworker", {
          timeout: EXTENSION_LOAD_TIMEOUT_MS,
        });
      }

      const extensionId = new URL(serviceWorker.url()).host;
      await use(extensionId);
    },
  },
);

export const expect = baseExpect;
