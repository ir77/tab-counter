import { assertStrictEquals } from "assert/mod.ts";
import type { DailyStats } from "./types.ts";
import { determineBadgeColor } from "./badge_color.ts";

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

Deno.test("determineBadgeColorはタブ数が少ない場合に緑を返す", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const tabCount = 4;

    // Act
    const color = determineBadgeColor(tabCount, undefined, undefined);

    // Assert
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColorは前日基準を優先して緑を返す", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const tabCount = 7;
    const previousDayLow = 8;

    // Act
    const color = determineBadgeColor(tabCount, undefined, previousDayLow);

    // Assert
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColorは当日の最小値を閾値として緑を返す", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const stats: DailyStats = { date: today, high: 10, low: 6 };
    const tabCount = 6;

    // Act
    const color = determineBadgeColor(tabCount, stats, undefined);

    // Assert
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColorは閾値を超えると赤を返す", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    // Arrange
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const stats: DailyStats = { date: today, high: 10, low: 6 };
    const tabCount = 9;
    const previousDayLow = 8;

    // Act
    const color = determineBadgeColor(tabCount, stats, previousDayLow);

    // Assert
    assertStrictEquals(color, "red");
  });
});
