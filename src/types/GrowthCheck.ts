import type { DiceLog } from "@/types/DiceLog";

/** クトゥルフ神話TRPG(7版)の判定行(CC コマンド)を content から読み取ったもの */
export type ParsedCheckRoll = {
  /** CC 直後の数。正=ボーナス・ダイス、負=ペナルティ・ダイス、未指定=0 */
  diceModifier: number;
  /** 技能名。前後の空白だけ除き、【】や後置の注記はそのまま(正規化しない) */
  skill: string;
  /** 判定結果が成功側(成功/レギュラー成功/ハード成功/イクストリーム成功/クリティカル)か */
  succeeded: boolean;
};

/** 成長チェック一覧の1件。技能名ごとに1つ */
export type GrowthCheck = {
  skill: string;
  /** チェック対象と判断した根拠の判定行(同じ技能が複数あれば初出) */
  evidence: DiceLog;
};
