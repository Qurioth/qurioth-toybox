import { describe, expect, it } from "vitest";
import {
  isInvestigator,
  toDisplayName,
  toSummaryApiUrl,
} from "./charaeno-utils";

describe("toSummaryApiUrl", () => {
  it("シートURLからサマリーAPIのURLを組み立てる", () => {
    expect(toSummaryApiUrl("https://charaeno.com/7th/abc123")).toBe(
      "https://charaeno.com/api/v1/7th/abc123/summary",
    );
  });
});

describe("toDisplayName", () => {
  it("括弧書きのふりがなを落とす", () => {
    expect(toDisplayName("喪造（モゾウ）")).toBe("喪造");
    expect(toDisplayName("園浦 誠(そのうら まこと)")).toBe("園浦 誠");
  });

  it("前後どちらの空白も落とす", () => {
    // 旧実装は /(^\s+|\s+$)/ をgフラグ無しで使っていたため片側しか落ちなかった
    expect(toDisplayName("　 恩田 恵 　")).toBe("恩田 恵");
  });

  it("括弧が無ければそのまま返す", () => {
    expect(toDisplayName("五十嵐郷")).toBe("五十嵐郷");
  });
});

/** CharacterCard の描画に必要なフィールドを満たす最小のオブジェクト */
const validSummary = () => ({
  name: "テスト太郎",
  note: "",
  skills: [],
  backstory: [],
  characteristics: {
    str: 50,
    con: 50,
    pow: 50,
    dex: 50,
    app: 50,
    siz: 50,
    int: 50,
    edu: 50,
  },
  attribute: { hp: 10, mp: 10, luck: 50, san: { value: 50, max: 99 } },
});

describe("isInvestigator", () => {
  it("必要なフィールドが揃っていれば true", () => {
    expect(isInvestigator(validSummary())).toBe(true);
  });

  it.each([
    ["null", null],
    ["文字列", "not an object"],
    ["配列", []],
    ["空オブジェクト", {}],
    ["APIのエラーJSON", { error: "not found" }],
  ])("%s は false", (_label, value) => {
    expect(isInvestigator(value)).toBe(false);
  });

  it.each([
    "name",
    "note",
    "skills",
    "backstory",
    "characteristics",
    "attribute",
  ])("%s が欠けていれば false", (key) => {
    const summary: Record<string, unknown> = validSummary();
    delete summary[key];

    expect(isInvestigator(summary)).toBe(false);
  });

  it("能力値が1つでも欠けていれば false", () => {
    const summary = validSummary();
    // @ts-expect-error 欠損したレスポンスを再現する
    delete summary.characteristics.edu;

    expect(isInvestigator(summary)).toBe(false);
  });

  it("SANの構造が違えば false", () => {
    const summary = validSummary();
    // @ts-expect-error 型と異なるレスポンスを再現する
    summary.attribute.san = 50;

    expect(isInvestigator(summary)).toBe(false);
  });
});
