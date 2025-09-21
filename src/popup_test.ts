import { assertEquals, assertNotEquals, assertThrows } from "assert/mod.ts";

// Deno.test に文字列を渡す最もシンプルなテスト
Deno.test("simple test", () => {
  assertEquals(1, 1);
});

// Deno.test にオブジェクトを渡して、テストをより詳細に定義
Deno.test({
  name: "detailed test",
  fn: () => {
    assertNotEquals("world", "hello");
  },
});

// 非同期処理のテスト
Deno.test("async test", async () => {
  const response = await new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("finished");
    }, 10);
  });
  assertEquals(response, "finished");
});

// 同期的な例外がスローされることを確認
Deno.test("throws sync error test", () => {
  assertThrows(
    () => {
      throw new Error("error");
    },
    Error,
    "error",
  );
});

// 非同期的な例外がスローされることを確認
// Deno.test("throws async error test", async () => {
//   await assertRejects(async () => {
//     await Promise.reject(new Error("error"));
//   }, Error, "error");
// });
