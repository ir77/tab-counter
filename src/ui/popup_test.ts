import { assertStrictEquals } from "assert/mod.ts";
import { chromeStub, documentStub, FakeElement, toHTMLElement } from "../stubs/stubs.ts";

const globalRecord = globalThis as Record<string, unknown>;
globalRecord.document = documentStub as unknown as Document;
globalRecord.chrome = chromeStub as unknown;

const { updateTabCountDisplay } = await import("./popup.ts");

Deno.test("updateTabCountDisplayはタブ数を文字列として表示する", () => {
  // Arrange
  const element = new FakeElement();
  const tabCount = 12;

  // Act
  updateTabCountDisplay(toHTMLElement(element), tabCount);

  // Assert
  assertStrictEquals(element.textContent, "12");
});

Deno.test("updateTabCountDisplayはcountが未定義の場合にプレースホルダーを表示する", () => {
  // Arrange
  const element = new FakeElement();

  // Act
  updateTabCountDisplay(toHTMLElement(element), undefined);

  // Assert
  assertStrictEquals(element.textContent, "...");
});

Deno.test("updateTabCountDisplayは要素がnullの場合に処理を行わない", () => {
  // Arrange
  const element = new FakeElement();
  element.textContent = "10";

  // Act
  const result = updateTabCountDisplay(null, 99);

  // Assert
  assertStrictEquals(result, undefined);
  assertStrictEquals(element.textContent, "10");
});
