import type { Investigator } from "@/types/Charaeno7th";

const SHEET_URL_PREFIX = "https://charaeno.com/7th/";

/** キャラクターシートのURLから、サマリーAPIのURLを組み立てる */
export const toSummaryApiUrl = (sheetUrl: string) => {
  const characterId = sheetUrl.replace(SHEET_URL_PREFIX, "");
  return `https://charaeno.com/api/v1/7th/${characterId}/summary`;
};

/** 表示用の名前。括弧書き(ふりがな等)を落として前後の空白を除く */
export const toDisplayName = (name: string) =>
  name.replace(/[({[<（【][^)}\]>）】]*[)}\]>）】]/g, "").trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasNumbers = (value: unknown, keys: readonly string[]) =>
  isRecord(value) && keys.every((key) => typeof value[key] === "number");

const CHARACTERISTICS_KEYS = [
  "str",
  "con",
  "pow",
  "dex",
  "app",
  "siz",
  "int",
  "edu",
] as const;

const ATTRIBUTE_KEYS = ["hp", "mp", "luck"] as const;

/**
 * CharacterCard の描画に必要なフィールドが揃っているかを確認する。
 *
 * Investigator の全フィールドを検証するわけではない。APIがエラーJSONを返したり
 * 仕様が変わったりしたときに、画面が壊れる代わりにエラー表示へ倒すための最低限の確認。
 */
export const isInvestigator = (value: unknown): value is Investigator => {
  if (!isRecord(value)) {
    return false;
  }

  const { attribute } = value;

  if (!isRecord(attribute)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.note === "string" &&
    Array.isArray(value.skills) &&
    Array.isArray(value.backstory) &&
    hasNumbers(value.characteristics, CHARACTERISTICS_KEYS) &&
    hasNumbers(attribute, ATTRIBUTE_KEYS) &&
    hasNumbers(attribute.san, ["value"])
  );
};
