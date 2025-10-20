import { expect, test, type CDPSession } from "@playwright/test";

const EXTENSION_TARGET_TIMEOUT_MS = 15_000;

test("拡張機能が読み込まれていること", async ({ context }) => {
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  await client.send("Target.setDiscoverTargets", { discover: true });

  const target = await waitForExtensionServiceWorker(client);
  const extensionUrl = new URL(target.url);

  await expect(extensionUrl.host).toMatch(/^[a-z]{32}$/);
  await page.close();
});

async function waitForExtensionServiceWorker(client: CDPSession) {
  const existingTarget = await findExtensionTarget(client);
  if (existingTarget) {
    return existingTarget;
  }

  return await new Promise<TargetInfo>((resolve, reject) => {
    const onTargetCreated = (event: TargetCreatedEvent) => {
      if (isExtensionServiceWorker(event.targetInfo)) {
        clearTimeout(timeoutId);
        client.off("Target.targetCreated", onTargetCreated as never);
        resolve(event.targetInfo);
      }
    };

    const timeoutId = setTimeout(() => {
      client.off("Target.targetCreated", onTargetCreated as never);
      reject(new Error("extension service worker target not found"));
    }, EXTENSION_TARGET_TIMEOUT_MS);

    client.on("Target.targetCreated", onTargetCreated as never);
  });
}

async function findExtensionTarget(client: CDPSession) {
  const { targetInfos } = await client.send("Target.getTargets");
  return targetInfos.find(isExtensionServiceWorker);
}

function isExtensionServiceWorker(targetInfo: TargetInfo) {
  return targetInfo.type === "service_worker" &&
    targetInfo.url.startsWith("chrome-extension://");
}

type TargetInfo = {
  targetId: string;
  type: string;
  url: string;
};

type TargetCreatedEvent = {
  targetInfo: TargetInfo;
};
