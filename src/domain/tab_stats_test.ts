import { assertEquals, assertStrictEquals } from "assert/mod.ts";
import type { DailyStats } from "./types.ts";
import { calculateUpdatedStats, determineBadgeColor } from "./tab_stats.ts";

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

Deno.test("calculateUpdatedStats initializes stats for new day when none stored", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const result = calculateUpdatedStats(7, undefined, undefined, undefined);

    assertEquals(result.dailyStats, {
      date: new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE"),
      high: 7,
      low: 7,
    });
    assertStrictEquals(result.tabCount, 7);
    assertStrictEquals(result.lastAvailablePreviousDayCount, undefined);
  });
});

Deno.test("calculateUpdatedStats carries over previous day count when date advances", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const previousDayStats: DailyStats = {
      date: "2025-10-01",
      high: 12,
      low: 3,
    };

    const result = calculateUpdatedStats(4, previousDayStats, 9, undefined);

    assertEquals(result.dailyStats, {
      date: new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE"),
      high: 4,
      low: 4,
    });
    assertStrictEquals(result.tabCount, 4);
    assertStrictEquals(result.lastAvailablePreviousDayCount, 9);
  });
});

Deno.test("calculateUpdatedStats updates high and low within same day", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const existingStats: DailyStats = {
      date: today,
      high: 6,
      low: 2,
    };

    const result = calculateUpdatedStats(8, existingStats, 6, undefined);

    assertEquals(result.dailyStats, {
      date: today,
      high: 8,
      low: 2,
    });
    assertStrictEquals(result.tabCount, 8);
    assertStrictEquals(result.lastAvailablePreviousDayCount, undefined);
  });
});

Deno.test("determineBadgeColor returns green for low tab count", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const color = determineBadgeColor(4, undefined, undefined);
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColor prefers previous day baseline", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const color = determineBadgeColor(7, undefined, 8);
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColor uses daily low threshold", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const stats: DailyStats = { date: today, high: 10, low: 6 };
    const color = determineBadgeColor(6, stats, undefined);
    assertStrictEquals(color, "green");
  });
});

Deno.test("determineBadgeColor falls back to red when thresholds exceeded", () => {
  withFixedDate("2025-10-02T09:00:00Z", () => {
    const today = new Date("2025-10-02T09:00:00Z").toLocaleDateString("sv-SE");
    const stats: DailyStats = { date: today, high: 10, low: 6 };
    const color = determineBadgeColor(9, stats, 8);
    assertStrictEquals(color, "red");
  });
});
