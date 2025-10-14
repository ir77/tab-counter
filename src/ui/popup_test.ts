import { assertStrictEquals } from "assert/mod.ts";
import { chromeStub, documentStub } from "../stubs/stubs.ts";

const globalRecord = globalThis as Record<string, unknown>;
globalRecord.document = documentStub as unknown as Document;
globalRecord.chrome = chromeStub as unknown;

const { updateTabCountDisplay } = await import("./popup.ts");

Deno.test("updateTabCountDisplayはタブ数を文字列として表示する", () => {
  // Arrange
  const mockElement = { textContent: "" } as HTMLElement;
  const tabCount = 12;

  // Act
  updateTabCountDisplay(mockElement, tabCount);

  // Assert
  assertStrictEquals(mockElement.textContent, "12");
});

Deno.test("updateTabCountDisplayはcountが未定義の場合にプレースホルダーを表示する", () => {
  // Arrange
  const mockElement = { textContent: "" } as HTMLElement;

  // Act
  updateTabCountDisplay(mockElement, undefined);

  // Assert
  assertStrictEquals(mockElement.textContent, "...");
});

Deno.test("updateTabCountDisplayは要素がnullの場合に処理を行わない", () => {
  // Arrange
  const mockElement = { textContent: "10" } as HTMLElement;

  // Act
  const result = updateTabCountDisplay(null, 99);

  // Assert
  assertStrictEquals(result, undefined);
  assertStrictEquals(mockElement.textContent, "10");
});
