import { assertStrictEquals } from "assert/mod.ts";
import {
  chromeStub,
  createMockPopupElements,
  documentStub,
} from "./popup_test_helper.ts";
import type { DailyStats } from "../domain/types.ts";

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
    const elements = createMockPopupElements();
    const count = 12;

    // Act
    updateTabCountDisplay(elements.tabCount, count);

    // Assert
    assertStrictEquals(elements.tabCount.textContent, "12");
  });

  await t.step("countが未定義の場合にプレースホルダーを表示する", () => {
    // Arrange
    const elements = createMockPopupElements();

    // Act
    updateTabCountDisplay(elements.tabCount, undefined);

    // Assert
    assertStrictEquals(elements.tabCount.textContent, "...");
  });

  await t.step("要素がnullの場合に処理を行わない", () => {
    // Arrange
    const elements = createMockPopupElements();
    elements.tabCount.textContent = "10";

    // Act
    const result = updateTabCountDisplay(null, 99);

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(elements.tabCount.textContent, "10");
  });
});

Deno.test("updateDailyStatsDisplay", async (t) => {
  await t.step("最大値と最小値を更新する", () => {
    // Arrange
    const elements = createMockPopupElements();
    const stats: DailyStats = {
      date: "2024-01-01",
      high: 42,
      low: 3,
    };

    // Act
    updateDailyStatsDisplay(
      elements.highCount,
      elements.lowCount,
      stats,
    );

    // Assert
    assertStrictEquals(elements.highCount.textContent, "42");
    assertStrictEquals(elements.lowCount.textContent, "3");
  });

  await t.step("statsがundefinedの場合にプレースホルダーを表示する", () => {
    // Arrange
    const elements = createMockPopupElements();

    // Act
    updateDailyStatsDisplay(
      elements.highCount,
      elements.lowCount,
      undefined,
    );

    // Assert
    assertStrictEquals(elements.highCount.textContent, "...");
    assertStrictEquals(elements.lowCount.textContent, "...");
  });

  await t.step("highCountがnullの場合は処理を行わない", () => {
    // Arrange
    const elements = createMockPopupElements();
    elements.highCount.textContent = "50";
    elements.lowCount.textContent = "5";
    const stats: DailyStats = {
      date: "2024-01-01",
      high: 100,
      low: 1,
    };

    // Act
    updateDailyStatsDisplay(null, elements.lowCount, stats);

    // Assert
    assertStrictEquals(elements.highCount.textContent, "50");
    assertStrictEquals(elements.lowCount.textContent, "5");
  });

  await t.step("lowCountがnullの場合は処理を行わない", () => {
    // Arrange
    const elements = createMockPopupElements();
    elements.highCount.textContent = "50";
    elements.lowCount.textContent = "5";
    const stats: DailyStats = {
      date: "2024-01-01",
      high: 100,
      low: 1,
    };

    // Act
    updateDailyStatsDisplay(elements.highCount, null, stats);

    // Assert
    assertStrictEquals(elements.highCount.textContent, "50");
    assertStrictEquals(elements.lowCount.textContent, "5");
  });
});

Deno.test("updatePreviousDayDisplay", async (t) => {
  await t.step("カウントを表示する", () => {
    // Arrange
    const elements = createMockPopupElements();
    const count = 25;

    // Act
    updatePreviousDayDisplay(
      elements.previousDayContainer,
      elements.previousDayLastCount,
      count,
    );

    // Assert
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "25",
    );
  });

  await t.step("countが未定義の場合に「データなし」を表示する", () => {
    // Arrange
    const elements = createMockPopupElements();

    // Act
    updatePreviousDayDisplay(
      elements.previousDayContainer,
      elements.previousDayLastCount,
      undefined,
    );

    // Assert
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "データなし",
    );
  });

  await t.step("countがnullの場合に「データなし」を表示する", () => {
    // Arrange
    const elements = createMockPopupElements();

    // Act
    updatePreviousDayDisplay(
      elements.previousDayContainer,
      elements.previousDayLastCount,
      null as unknown as number,
    );

    // Assert
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "データなし",
    );
  });

  await t.step("containerがnullの場合に処理を行わない", () => {
    // Arrange
    const elements = createMockPopupElements();
    elements.previousDayLastCount.textContent = "25";

    // Act
    const result = updatePreviousDayDisplay(
      null,
      elements.previousDayLastCount,
      30,
    );

    // Assert
    assertStrictEquals(result, undefined);
    assertStrictEquals(
      elements.previousDayLastCount.textContent,
      "25",
    );
  });

  await t.step("countElementがnullの場合に処理を行わない", () => {
    // Arrange
    const elements = createMockPopupElements();

    // Act
    const result = updatePreviousDayDisplay(
      elements.previousDayContainer,
      null,
      30,
    );

    // Assert
    assertStrictEquals(result, undefined);
  });
});
