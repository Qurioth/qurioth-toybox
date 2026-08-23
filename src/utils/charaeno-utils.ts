import type { Investigator as Investigator6th } from "@/types/Charaeno6th";
import type { Investigator as Investigator7th } from "@/types/Charaeno7th";

/** 対応するクトゥルフ神話TRPGの版。これ以外はURLの段階で受け付けない */
export type Edition = "6th" | "7th";

export interface SheetReference {
  edition: Edition;
  id: string;
}

/**
 * キャラクターシートのURLの形。ここから版とIDを取り出す。
 *
 * 入力欄の検証(react-hook-form の pattern)とサマリーAPIのURLの組み立てで、この1本を共有する。
 * 版を二箇所に書くと「検証は通るのに取得先が別の版のまま」という壊れ方をするため。
 * `6th` / `7th` 以外の版はここで弾かれ、URLの形式エラーとして扱われる。
 */
export const SHEET_URL_PATTERN =
  /^https:\/\/charaeno\.com\/(6th|7th)\/([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+)$/;

/** シートURLから版とIDを取り出す。形式が違えば undefined */
export const toSheetReference = (
  sheetUrl: string,
): SheetReference | undefined => {
  const matched = SHEET_URL_PATTERN.exec(sheetUrl);

  if (!matched) {
    return undefined;
  }

  return { edition: matched[1] as Edition, id: matched[2] };
};

/** 版に対応するサマリーAPIのURLを組み立てる */
export const toSummaryApiUrl = ({ edition, id }: SheetReference) =>
  `https://charaeno.com/api/v1/${edition}/${id}/summary`;

/** 表示用の名前。括弧書き(ふりがな等)を落として前後の空白を除く */
export const toDisplayName = (name: string) =>
  name.replace(/[({[<（【][^)}\]>）】]*[)}\]>）】]/g, "").trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasNumbers = (value: unknown, keys: readonly string[]) =>
  isRecord(value) && keys.every((key) => typeof value[key] === "number");

const hasStrings = (value: unknown, keys: readonly string[]) =>
  isRecord(value) && keys.every((key) => typeof value[key] === "string");

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

/**
 * 6版・7版のどちらでもカードの描画に必要なフィールド。
 *
 * 幸運は7版にしか無く、6版の型定義には存在しない(実データに入っていても使わない)ため
 * ここには含めない。
 */
const hasCommonFields = (value: Record<string, unknown>) => {
  const attribute = isRecord(value.attribute) ? value.attribute : undefined;

  return (
    typeof value.name === "string" &&
    typeof value.note === "string" &&
    Array.isArray(value.skills) &&
    hasNumbers(value.characteristics, CHARACTERISTICS_KEYS) &&
    hasNumbers(attribute, ["hp", "mp"]) &&
    hasNumbers(attribute?.san, ["value"])
  );
};

/**
 * 7版のカードの描画に必要なフィールドが揃っているかを確認する。
 *
 * Investigator の全フィールドを検証するわけではない。APIがエラーJSONを返したり
 * 仕様が変わったりしたときに、画面が壊れる代わりにエラー表示へ倒すための最低限の確認。
 * 版ごとに分けているのは、6版に無い項目(backstory・幸運)を6版へ要求しないため。
 */
export const is7thInvestigator = (value: unknown): value is Investigator7th =>
  isRecord(value) &&
  hasCommonFields(value) &&
  Array.isArray(value.backstory) &&
  hasNumbers(value.attribute, ["luck"]);

/**
 * 6版のカードの描画に必要なフィールドが揃っているかを確認する。
 *
 * 裏面に出す3項目を必須にしているのは、描画側で空文字かどうかだけを見れば済むようにするため。
 * ダメージ・ボーナスは表面のタイルに出すので、文字列であることを確認する
 * (7版では表面に出さないため、7版側の確認には含めない)。
 */
export const is6thInvestigator = (value: unknown): value is Investigator6th =>
  isRecord(value) &&
  hasCommonFields(value) &&
  hasStrings(value.attribute, ["db"]) &&
  hasStrings(value, ["mentalDisorder", "mythosTomes", "artifactsAndSpells"]);
