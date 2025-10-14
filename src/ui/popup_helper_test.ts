import { assertStrictEquals } from "assert/mod.ts";
import { chromeStub, documentStub } from "../testdoubles/testdoubles.ts";

const globalRecord = globalThis as Record<string, unknown>;
globalRecord.document = documentStub as unknown as Document;
globalRecord.chrome = chromeStub as unknown;

const {
  updateTabCountDisplay,
  updateDailyStatsDisplay,
  updatePreviousDayDisplay,
} = await import("./popup.ts");

Deno.test("updateTabCountDisplay", async (t) => {
  await t.step("タブ数を文字列として表示する", () => {
    // Arrange
    const mockElement = { textContent: "" } as HTMLElement;
    const tabCount = 12;

    // Act
    updateTabCountDisplay(mockElement, tabCount);

    // Assert
    assertStrictEquals(mockElement.textContent, "12");
  });

  await t.step("countが未定義の場合にプレースホルダーを表示する", () => {
    // Arrange
    const mockElement = { textContent: "" } as HTMLElement;

    // Act
    updateTabCountDisplay(mockElement, undefined);

    // Assert
    assertStrictEquals(mockElement.textContent, "...");
  });

  await t.step("要素がnullの場合に処理を行わない", () => {
    // Arrange
    const mockElement = { textContent: "10" } as HTMLElement;

    // Act
    const result = updateTabCountDisplay(null, 99);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(mockElement.textContent, "10");
  });
});

Deno.test("updateDailyStatsDisplay", async (t) => {
  await t.step("統計情報を表示する", () => {
    // Arrange
    const mockHighElement = { textContent: "" } as HTMLElement;
    const mockLowElement = { textContent: "" } as HTMLElement;
    const stats = { date: "2025-10-14", high: 42, low: 5 };

    // Act
    updateDailyStatsDisplay(mockHighElement, mockLowElement, stats);

    // Assert
    assertStrictEquals(mockHighElement.textContent, "42");
    assertStrictEquals(mockLowElement.textContent, "5");
  });

  await t.step("statsが未定義の場合にプレースホルダーを表示する", () => {
    // Arrange
    const mockHighElement = { textContent: "" } as HTMLElement;
    const mockLowElement = { textContent: "" } as HTMLElement;

    // Act
    updateDailyStatsDisplay(mockHighElement, mockLowElement, undefined);

    // Assert
    assertStrictEquals(mockHighElement.textContent, "...");
    assertStrictEquals(mockLowElement.textContent, "...");
  });

  await t.step("highElementがnullの場合に処理を行わない", () => {
    // Arrange
    const mockLowElement = { textContent: "5" } as HTMLElement;
    const stats = { date: "2025-10-14", high: 42, low: 10 };

    // Act
    const result = updateDailyStatsDisplay(null, mockLowElement, stats);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(mockLowElement.textContent, "5");
  });

  await t.step("lowElementがnullの場合に処理を行わない", () => {
    // Arrange
    const mockHighElement = { textContent: "42" } as HTMLElement;
    const stats = { date: "2025-10-14", high: 100, low: 10 };

    // Act
    const result = updateDailyStatsDisplay(mockHighElement, null, stats);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(mockHighElement.textContent, "42");
  });
});

Deno.test("updatePreviousDayDisplay", async (t) => {
  await t.step("カウントを表示しコンテナを表示する", () => {
    // Arrange
    const mockContainer = { style: { display: "none" } } as HTMLElement;
    const mockCountElement = { textContent: "" } as HTMLElement;
    const count = 25;

    // Act
    updatePreviousDayDisplay(mockContainer, mockCountElement, count);

    // Assert
    assertStrictEquals(mockCountElement.textContent, "25");
    assertStrictEquals(mockContainer.style.display, "block");
  });

  await t.step("countが未定義の場合にコンテナを非表示にする", () => {
    // Arrange
    const mockContainer = { style: { display: "block" } } as HTMLElement;
    const mockCountElement = { textContent: "25" } as HTMLElement;

    // Act
    updatePreviousDayDisplay(mockContainer, mockCountElement, undefined);

    // Assert
    assertStrictEquals(mockContainer.style.display, "none");
  });

  await t.step("countがnullの場合にコンテナを非表示にする", () => {
    // Arrange
    const mockContainer = { style: { display: "block" } } as HTMLElement;
    const mockCountElement = { textContent: "25" } as HTMLElement;

    // Act
    updatePreviousDayDisplay(
      mockContainer,
      mockCountElement,
      null as unknown as number,
    );

    // Assert
    assertStrictEquals(mockContainer.style.display, "none");
  });

  await t.step("containerがnullの場合に処理を行わない", () => {
    // Arrange
    const mockCountElement = { textContent: "25" } as HTMLElement;

    // Act
    const result = updatePreviousDayDisplay(null, mockCountElement, 30);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(mockCountElement.textContent, "25");
  });

  await t.step("countElementがnullの場合に処理を行わない", () => {
    // Arrange
    const mockContainer = { style: { display: "none" } } as HTMLElement;

    // Act
    const result = updatePreviousDayDisplay(mockContainer, null, 30);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(mockContainer.style.display, "none");
  });
});
