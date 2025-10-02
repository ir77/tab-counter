import { assertEquals, assertStrictEquals } from "assert/mod.ts";
import type { DailyStats } from "./types.ts";
import { calculateUpdatedStats } from "./stats_calculator.ts";

function withFixedDate<T>(isoDate: string, fn: () => T): T {
  const realDate = Date;
  const fixedTime = new Date(isoDate).getTime();

  class FixedDate extends Date {
    constructor(value?: number | string | Date) {
      super(value ?? fixedTime);
    }

    static override now(): number {
      return fixedTime;
    }
  }

  FixedDate.parse = realDate.parse;
  FixedDate.UTC = realDate.UTC;
  (globalThis as Record<string, unknown>).Date = FixedDate;

  try {
    return fn();
  } finally {
    (globalThis as Record<string, unknown>).Date = realDate;
  }
}

Deno.test("calculateUpdatedStatsは保存済み統計がない日に当日の統計を初期化する", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const currentTabCount = 7;
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");

    // Act
    const result = calculateUpdatedStats(
      currentTabCount,
      undefined,
      undefined,
      undefined,
    );

    // Assert
    assertEquals(result.dailyStats, {
      date: today,
      high: currentTabCount,
      low: currentTabCount,
    });
    assertStrictEquals(result.tabCount, currentTabCount);
    assertStrictEquals(result.lastAvailablePreviousDayCount, undefined);
  });
});

Deno.test("calculateUpdatedStatsは日付が進んだ際に前日のタブ数を繰り越す", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const previousDayStats: DailyStats = {
      date: "2025-10-01",
      high: 12,
      low: 3,
    };
    const currentTabCount = 4;
    const lastStoredTabCount = 9;
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");

    // Act
    const result = calculateUpdatedStats(
      currentTabCount,
      previousDayStats,
      lastStoredTabCount,
      undefined,
    );

    // Assert
    assertEquals(result.dailyStats, {
      date: today,
      high: currentTabCount,
      low: currentTabCount,
    });
    assertStrictEquals(result.tabCount, currentTabCount);
    assertStrictEquals(
      result.lastAvailablePreviousDayCount,
      lastStoredTabCount,
    );
  });
});

Deno.test("calculateUpdatedStatsは同日の高値と安値を更新する", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const existingStats: DailyStats = {
      date: today,
      high: 6,
      low: 2,
    };
    const currentTabCount = 8;

    // Act
    const result = calculateUpdatedStats(
      currentTabCount,
      existingStats,
      6,
      undefined,
    );

    // Assert
    assertEquals(result.dailyStats, {
      date: today,
      high: currentTabCount,
      low: existingStats.low,
    });
    assertStrictEquals(result.tabCount, currentTabCount);
    assertStrictEquals(result.lastAvailablePreviousDayCount, undefined);
  });
});
