import { describe, expect, it } from "vitest";
import { matchesAllWords, normalizeSearchText } from "./text-utils";

describe("normalizeSearchText", () => {
  it("全角を半角にし、小文字にし、前後の空白を落とす", () => {
    expect(normalizeSearchText("  ＱＵＲＩＯＴＨ  ")).toBe("qurioth");
  });

  it("二重に適用しても結果が変わらない", () => {
    const once = normalizeSearchText("　Ｔｅｓｔ 太郎 ");
    expect(normalizeSearchText(once)).toBe(once);
  });
});

describe("matchesAllWords", () => {
  it("空のクエリは常に true", () => {
    expect(matchesAllWords("なにか", "")).toBe(true);
    expect(matchesAllWords("なにか", "   ")).toBe(true);
  });

  it("すべての語を含むときだけ true", () => {
    expect(matchesAllWords("黄泉比良坂 よもつひらさか", "よもつ")).toBe(true);
    expect(matchesAllWords("黄泉比良坂 よもつひらさか", "黄泉 ひらさか")).toBe(
      true,
    );
    expect(matchesAllWords("黄泉比良坂 よもつひらさか", "黄泉 まれびと")).toBe(
      false,
    );
  });

  it("大文字小文字と全角半角を区別しない", () => {
    expect(matchesAllWords("Qurioth", "qurioth")).toBe(true);
    expect(matchesAllWords("Qurioth", "ＱＵＲＩＯＴＨ")).toBe(true);
  });
});
