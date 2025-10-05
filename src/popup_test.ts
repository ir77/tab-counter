import { assertStrictEquals } from "assert/mod.ts";
import type { DailyStats } from "./domain/types.ts";

// DOM要素のモック
interface MockHTMLElement {
  textContent: string | null;
  style: {
    display: string;
  };
}

function createMockElement(): MockHTMLElement {
  return {
    textContent: null,
    style: {
      display: "",
    },
  };
}

// テスト用のグローバルなモック要素
let mockTabCountElement: MockHTMLElement | null;
let mockHighCountElement: MockHTMLElement | null;
let mockLowCountElement: MockHTMLElement | null;
let mockPreviousDayContainer: MockHTMLElement | null;
let mockPreviousDayLastCountElement: MockHTMLElement | null;



// テスト対象の関数をコピー（popup.tsから）
function updateTabCountDisplay(
  count?: number,
  tabCountElement?: MockHTMLElement | null,
) {
  if (!tabCountElement) return;

  tabCountElement.textContent = count !== undefined ? count.toString() : "...";
}

function updateDailyStatsDisplay(
  stats?: DailyStats,
  highCountElement?: MockHTMLElement | null,
  lowCountElement?: MockHTMLElement | null,
) {
  if (!highCountElement || !lowCountElement) return;

  if (stats) {
    highCountElement.textContent = stats.high.toString();
    lowCountElement.textContent = stats.low.toString();
  } else {
    highCountElement.textContent = "...";
    lowCountElement.textContent = "...";
  }
}

function updatePreviousDayDisplay(
  count?: number,
  previousDayContainer?: MockHTMLElement | null,
  previousDayLastCountElement?: MockHTMLElement | null,
) {
  if (!previousDayContainer || !previousDayLastCountElement) return;

  if (count !== undefined && count !== null) {
    previousDayLastCountElement.textContent = count.toString();
    previousDayContainer.style.display = "block";
  } else {
    previousDayContainer.style.display = "none";
  }
}

// ---- updateTabCountDisplay のテスト ----

Deno.test("updateTabCountDisplayはタブ数が定義されている場合にテキストを設定する", () => {
  // Arrange
  mockTabCountElement = createMockElement();
  const count = 10;

  // Act
  updateTabCountDisplay(count, mockTabCountElement);

  // Assert
  assertStrictEquals(mockTabCountElement.textContent, "10");
});

Deno.test("updateTabCountDisplayはタブ数がundefinedの場合に...を表示する", () => {
  // Arrange
  mockTabCountElement = createMockElement();

  // Act
  updateTabCountDisplay(undefined, mockTabCountElement);

  // Assert
  assertStrictEquals(mockTabCountElement.textContent, "...");
});

Deno.test("updateTabCountDisplayはタブ数が0の場合に0を表示する", () => {
  // Arrange
  mockTabCountElement = createMockElement();
  const count = 0;

  // Act
  updateTabCountDisplay(count, mockTabCountElement);

  // Assert
  assertStrictEquals(mockTabCountElement.textContent, "0");
});

Deno.test("updateTabCountDisplayは要素がnullの場合に何もしない", () => {
  // Arrange
  mockTabCountElement = null;
  const count = 5;

  // Act & Assert（エラーが発生しないことを確認）
  updateTabCountDisplay(count, mockTabCountElement);
  assertStrictEquals(mockTabCountElement, null);
});

Deno.test("updateTabCountDisplayは大きなタブ数でも正常に表示する", () => {
  // Arrange
  mockTabCountElement = createMockElement();
  const count = 999;

  // Act
  updateTabCountDisplay(count, mockTabCountElement);

  // Assert
  assertStrictEquals(mockTabCountElement.textContent, "999");
});

// ---- updateDailyStatsDisplay のテスト ----

Deno.test("updateDailyStatsDisplayは統計情報が定義されている場合に高値と安値を表示する", () => {
  // Arrange
  mockHighCountElement = createMockElement();
  mockLowCountElement = createMockElement();
  const stats: DailyStats = {
    date: "2025-10-02",
    high: 20,
    low: 5,
  };

  // Act
  updateDailyStatsDisplay(stats, mockHighCountElement, mockLowCountElement);

  // Assert
  assertStrictEquals(mockHighCountElement.textContent, "20");
  assertStrictEquals(mockLowCountElement.textContent, "5");
});

Deno.test("updateDailyStatsDisplayは統計情報がundefinedの場合に...を表示する", () => {
  // Arrange
  mockHighCountElement = createMockElement();
  mockLowCountElement = createMockElement();

  // Act
  updateDailyStatsDisplay(undefined, mockHighCountElement, mockLowCountElement);

  // Assert
  assertStrictEquals(mockHighCountElement.textContent, "...");
  assertStrictEquals(mockLowCountElement.textContent, "...");
});

Deno.test("updateDailyStatsDisplayは高値と安値が同じ場合も正常に表示する", () => {
  // Arrange
  mockHighCountElement = createMockElement();
  mockLowCountElement = createMockElement();
  const stats: DailyStats = {
    date: "2025-10-02",
    high: 10,
    low: 10,
  };

  // Act
  updateDailyStatsDisplay(stats, mockHighCountElement, mockLowCountElement);

  // Assert
  assertStrictEquals(mockHighCountElement.textContent, "10");
  assertStrictEquals(mockLowCountElement.textContent, "10");
});

Deno.test("updateDailyStatsDisplayは高値要素がnullの場合に何もしない", () => {
  // Arrange
  mockHighCountElement = null;
  mockLowCountElement = createMockElement();
  const stats: DailyStats = {
    date: "2025-10-02",
    high: 20,
    low: 5,
  };

  // Act & Assert（エラーが発生しないことを確認）
  updateDailyStatsDisplay(stats, mockHighCountElement, mockLowCountElement);
  assertStrictEquals(mockHighCountElement, null);
  assertStrictEquals(mockLowCountElement.textContent, null);
});

Deno.test("updateDailyStatsDisplayは安値要素がnullの場合に何もしない", () => {
  // Arrange
  mockHighCountElement = createMockElement();
  mockLowCountElement = null;
  const stats: DailyStats = {
    date: "2025-10-02",
    high: 20,
    low: 5,
  };

  // Act & Assert（エラーが発生しないことを確認）
  updateDailyStatsDisplay(stats, mockHighCountElement, mockLowCountElement);
  assertStrictEquals(mockHighCountElement.textContent, null);
  assertStrictEquals(mockLowCountElement, null);
});

Deno.test("updateDailyStatsDisplayは0の値でも正常に表示する", () => {
  // Arrange
  mockHighCountElement = createMockElement();
  mockLowCountElement = createMockElement();
  const stats: DailyStats = {
    date: "2025-10-02",
    high: 0,
    low: 0,
  };

  // Act
  updateDailyStatsDisplay(stats, mockHighCountElement, mockLowCountElement);

  // Assert
  assertStrictEquals(mockHighCountElement.textContent, "0");
  assertStrictEquals(mockLowCountElement.textContent, "0");
});

// ---- updatePreviousDayDisplay のテスト ----

Deno.test("updatePreviousDayDisplayは前日のタブ数が定義されている場合に表示する", () => {
  // Arrange
  mockPreviousDayContainer = createMockElement();
  mockPreviousDayLastCountElement = createMockElement();
  const count = 15;

  // Act
  updatePreviousDayDisplay(
    count,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );

  // Assert
  assertStrictEquals(mockPreviousDayLastCountElement.textContent, "15");
  assertStrictEquals(mockPreviousDayContainer.style.display, "block");
});

Deno.test("updatePreviousDayDisplayは前日のタブ数がundefinedの場合に非表示にする", () => {
  // Arrange
  mockPreviousDayContainer = createMockElement();
  mockPreviousDayLastCountElement = createMockElement();
  mockPreviousDayContainer.style.display = "block"; // 初期状態を表示にしておく

  // Act
  updatePreviousDayDisplay(
    undefined,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );

  // Assert
  assertStrictEquals(mockPreviousDayContainer.style.display, "none");
});

Deno.test("updatePreviousDayDisplayは前日のタブ数がnullの場合に非表示にする", () => {
  // Arrange
  mockPreviousDayContainer = createMockElement();
  mockPreviousDayLastCountElement = createMockElement();
  mockPreviousDayContainer.style.display = "block"; // 初期状態を表示にしておく

  // Act
  updatePreviousDayDisplay(
    null as unknown as number,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );

  // Assert
  assertStrictEquals(mockPreviousDayContainer.style.display, "none");
});

Deno.test("updatePreviousDayDisplayは前日のタブ数が0の場合に表示する", () => {
  // Arrange
  mockPreviousDayContainer = createMockElement();
  mockPreviousDayLastCountElement = createMockElement();
  const count = 0;

  // Act
  updatePreviousDayDisplay(
    count,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );

  // Assert
  assertStrictEquals(mockPreviousDayLastCountElement.textContent, "0");
  assertStrictEquals(mockPreviousDayContainer.style.display, "block");
});

Deno.test("updatePreviousDayDisplayはコンテナ要素がnullの場合に何もしない", () => {
  // Arrange
  mockPreviousDayContainer = null;
  mockPreviousDayLastCountElement = createMockElement();
  const count = 10;

  // Act & Assert（エラーが発生しないことを確認）
  updatePreviousDayDisplay(
    count,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );
  assertStrictEquals(mockPreviousDayContainer, null);
});

Deno.test("updatePreviousDayDisplayはカウント要素がnullの場合に何もしない", () => {
  // Arrange
  mockPreviousDayContainer = createMockElement();
  mockPreviousDayLastCountElement = null;
  const count = 10;

  // Act & Assert（エラーが発生しないことを確認）
  updatePreviousDayDisplay(
    count,
    mockPreviousDayContainer,
    mockPreviousDayLastCountElement,
  );
  assertStrictEquals(mockPreviousDayLastCountElement, null);
});
