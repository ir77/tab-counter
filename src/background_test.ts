import { assertEquals } from "assert/mod.ts";

// 簡単なテスト（既存）
Deno.test("simple test", () => {
  assertEquals(1 + 1, 2);
});

// background.tsから関数を export してテストするための準備
// 実際のテストは後で追加予定（Chrome API のモック化が必要）
