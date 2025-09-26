import { assertEquals } from "assert/mod.ts";
import { formatDate, isValidTabCount, calculatePercentage } from "./utils.ts";

Deno.test("formatDate should format date correctly", () => {
  const date = new Date("2024-01-01");
  assertEquals(formatDate(date), "2024-01-01");
});

Deno.test("isValidTabCount should validate tab count", () => {
  assertEquals(isValidTabCount(5), true);
  assertEquals(isValidTabCount(0), true);
  assertEquals(isValidTabCount(-1), false);
  assertEquals(isValidTabCount(3.14), false);
});

Deno.test("calculatePercentage should calculate correctly", () => {
  assertEquals(calculatePercentage(50, 100), 50);
  assertEquals(calculatePercentage(1, 3), 33);
  assertEquals(calculatePercentage(10, 0), 0);
});