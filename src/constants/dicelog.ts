/** CCFOLIA のダイスログに現れる成功度の表記 */
export const DICELOG_RESULT = {
  CRITICAL: "クリティカル",
  SUCCESS: "成功",
  FAILED: "失敗",
  FUMBLE: "ファンブル",
};

/**
 * 成長チェックの根拠になる判定結果(判定行の末尾セグメントと完全一致で比べる)。
 * 難易度を指定した判定は "成功" とだけ出る。
 */
export const GROWTH_CHECK_SUCCESS_RESULTS = [
  "クリティカル",
  "イクストリーム成功",
  "ハード成功",
  "レギュラー成功",
  "成功",
];

/** 特性値・アイデア・知識・幸運・正気度は技能ではないので成長チェックの対象外 */
export const GROWTH_CHECK_ALWAYS_EXCLUDED = [
  "STR",
  "CON",
  "DEX",
  "APP",
  "POW",
  "SIZ",
  "INT",
  "EDU",
  "アイデア",
  "知識",
  "幸運",
  "正気度ロール",
];

/** 7版ルール上チェックできないが、利用者の選択で除外を外せる技能 */
export const GROWTH_CHECK_OPTIONAL_EXCLUDED = ["クトゥルフ神話", "信用"];
