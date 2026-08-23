import { describe, expect, it } from "vitest";
import {
  is6thInvestigator,
  is7thInvestigator,
  toDisplayName,
  toSheetReference,
  toSummaryApiUrl,
} from "./charaeno-utils";

describe("toSheetReference", () => {
  it.each([
    ["7版", "https://charaeno.com/7th/abc123", "7th", "abc123"],
    ["6版", "https://charaeno.com/6th/abc123", "6th", "abc123"],
  ])("%s のシートURLから版とIDを取り出す", (_label, url, edition, id) => {
    expect(toSheetReference(url)).toEqual({ edition, id });
  });

  it.each([
    ["対応していない版", "https://charaeno.com/8th/abc123"],
    ["版が無い", "https://charaeno.com/abc123"],
    ["IDが空", "https://charaeno.com/6th/"],
    ["ホストが違う", "https://example.com/6th/abc123"],
    ["ホストが部分一致", "https://charaenoXcom/6th/abc123"],
    ["スキームが違う", "http://charaeno.com/6th/abc123"],
    ["前後に余計な文字", "https://charaeno.com/6th/abc123 "],
  ])("%s なら undefined", (_label, url) => {
    expect(toSheetReference(url)).toBeUndefined();
  });
});

describe("toSummaryApiUrl", () => {
  it.each([
    ["7th", "https://charaeno.com/api/v1/7th/abc123/summary"],
    ["6th", "https://charaeno.com/api/v1/6th/abc123/summary"],
  ] as const)("%s の取得先を組み立てる", (edition, expected) => {
    expect(toSummaryApiUrl({ edition, id: "abc123" })).toBe(expected);
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

/** 6版・7版のどちらでも必要な、カードの描画に要るフィールド */
const commonFields = () => ({
  name: "テスト太郎",
  note: "",
  skills: [],
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
  attribute: { hp: 10, mp: 10, san: { value: 50 } },
});

/** 7版のカードの描画に必要なフィールドを満たす最小のオブジェクト */
const valid7thSummary = () => {
  const summary = commonFields();

  return {
    ...summary,
    backstory: [],
    attribute: { ...summary.attribute, luck: 50 },
  };
};

/** 6版のカードの描画に必要なフィールドを満たす最小のオブジェクト */
const valid6thSummary = () => {
  const summary = commonFields();

  return {
    ...summary,
    attribute: { ...summary.attribute, db: "+0" },
    mentalDisorder: "",
    mythosTomes: "",
    artifactsAndSpells: "",
  };
};

describe("is7thInvestigator", () => {
  it("必要なフィールドが揃っていれば true", () => {
    expect(is7thInvestigator(valid7thSummary())).toBe(true);
  });

  it.each([
    ["null", null],
    ["文字列", "not an object"],
    ["空オブジェクト", {}],
    ["APIのエラーJSON", { error: "not found" }],
  ])("%s は false", (_label, value) => {
    expect(is7thInvestigator(value)).toBe(false);
  });

  it.each([
    "name",
    "note",
    "skills",
    "backstory",
    "characteristics",
    "attribute",
  ])("%s が欠けていれば false", (key) => {
    const summary: Record<string, unknown> = valid7thSummary();
    delete summary[key];

    expect(is7thInvestigator(summary)).toBe(false);
  });

  it("能力値が1つでも欠けていれば false", () => {
    const summary = valid7thSummary();
    // @ts-expect-error 欠損したレスポンスを再現する
    delete summary.characteristics.edu;

    expect(is7thInvestigator(summary)).toBe(false);
  });

  it("SANの構造が違えば false", () => {
    const summary = valid7thSummary();
    // @ts-expect-error 型と異なるレスポンスを再現する
    summary.attribute.san = 50;

    expect(is7thInvestigator(summary)).toBe(false);
  });

  it("6版のレスポンス(幸運とバックストーリーが無い)は false", () => {
    expect(is7thInvestigator(valid6thSummary())).toBe(false);
  });
});

describe("is6thInvestigator", () => {
  it("必要なフィールドが揃っていれば true", () => {
    expect(is6thInvestigator(valid6thSummary())).toBe(true);
  });

  it.each([
    ["null", null],
    ["文字列", "not an object"],
    ["空オブジェクト", {}],
    ["APIのエラーJSON", { error: "not found" }],
  ])("%s は false", (_label, value) => {
    expect(is6thInvestigator(value)).toBe(false);
  });

  it.each([
    "name",
    "note",
    "skills",
    "characteristics",
    "attribute",
    "mentalDisorder",
    "mythosTomes",
    "artifactsAndSpells",
  ])("%s が欠けていれば false", (key) => {
    const summary: Record<string, unknown> = valid6thSummary();
    delete summary[key];

    expect(is6thInvestigator(summary)).toBe(false);
  });

  it("ダメージ・ボーナスが欠けていれば false(表面のタイルに出すため)", () => {
    const summary = valid6thSummary();
    // @ts-expect-error 欠損したレスポンスを再現する
    delete summary.attribute.db;

    expect(is6thInvestigator(summary)).toBe(false);
  });

  it("7版にしか無い項目(バックストーリー・幸運)は要求しない", () => {
    const summary: Record<string, unknown> = valid6thSummary();

    expect(summary.backstory).toBeUndefined();
    expect(is6thInvestigator(summary)).toBe(true);
  });

  it("7版のレスポンス(6版固有の3項目が無い)は false", () => {
    expect(is6thInvestigator(valid7thSummary())).toBe(false);
  });
});
