import {
  GROWTH_CHECK_ALWAYS_EXCLUDED,
  GROWTH_CHECK_OPTIONAL_EXCLUDED,
  GROWTH_CHECK_SUCCESS_RESULTS,
} from "@/constants/dicelog";
import { GROWTH_SKILL_LIST } from "@/constants/message";
import type { DiceLog } from "@/types/DiceLog";
import type { GrowthCheck, ParsedCheckRoll } from "@/types/GrowthCheck";

// 判定行の形: "CC<=65 【目星】 (1D100<=65) ボーナス・ペナルティダイス[0] ＞ 13 ＞ 13 ＞ イクストリーム成功"
//   CC(-?\d+)?  … CC 直後の数がボーナス(正)/ペナルティ(負)ダイスの数
//   <=\d+       … 技能値
//   \s*h?\s*    … 難易度指定 "h" は "CC<=80h 【知識】" と "CC<=75 h【知識】" の両方の位置で現れる
//   (.*?)       … 技能名。閉じ括弧が欠けていても、後置の注記があってもそのまま取る
//   \s*\(1D100  … ここから先は結果部分。\s は全角スペース(U+3000)にもマッチする
const checkRollReg = /^CC(-?\d+)?<=\d+\s*h?\s*(.*?)\s*\(1D100<=\d+\)/i;

/** 末尾の "＞" より後ろが判定結果。"… ＞ 13 ＞ 13 ＞ イクストリーム成功" → "イクストリーム成功" */
const lastSegment = (content: string) => {
  const segments = content.split("＞");
  return segments[segments.length - 1].trim();
};

/**
 * content が CC コマンドの判定行であれば解析結果を、そうでなければ null を返す。
 * HTML/JSON の区別はしない(どちらも同じ形の content に変換済み)。
 */
const parseCheckRoll = (content: string): ParsedCheckRoll | null => {
  const matched = content.match(checkRollReg);
  if (!matched) {
    return null;
  }

  return {
    diceModifier: matched[1] === undefined ? 0 : Number(matched[1]),
    skill: matched[2].trim(),
    succeeded: GROWTH_CHECK_SUCCESS_RESULTS.includes(lastSegment(content)),
  };
};

/**
 * 除外判定に使う技能名のコア。【目星】と 目星 の両方を同じ技能として扱うために
 * 外側の墨付き括弧だけ外す。一覧に載せる技能名そのものは正規化しない(FR-029)。
 */
const skillCore = (skill: string) => skill.replace(/^【|】$/g, "");

/**
 * 指定キャラクターが成長チェックを付けられる技能を、ルール順に絞り込んで集める。
 * 同じ技能は初出の行を根拠として1件にまとめる。
 */
const collectGrowthChecks = (
  dicelog: DiceLog[],
  selectName: string,
  selectTab: string,
  options: { excludeMythosAndCredit: boolean },
): GrowthCheck[] => {
  const checks = new Map<string, GrowthCheck>();

  for (const log of dicelog) {
    if (!log.name.includes(selectName)) continue;
    if (selectTab !== "" && log.tab !== selectTab) continue;

    const roll = parseCheckRoll(log.content);
    if (!roll) continue;
    if (!roll.succeeded) continue;
    // ボーナス・ダイスを使った判定はチェックできない。ペナルティ(負)は可
    if (roll.diceModifier > 0) continue;
    if (roll.skill === "") continue;

    const core = skillCore(roll.skill);
    if (GROWTH_CHECK_ALWAYS_EXCLUDED.includes(core)) continue;
    if (
      options.excludeMythosAndCredit &&
      GROWTH_CHECK_OPTIONAL_EXCLUDED.includes(core)
    ) {
      continue;
    }

    if (!checks.has(roll.skill)) {
      checks.set(roll.skill, { skill: roll.skill, evidence: log });
    }
  }

  return Array.from(checks.values());
};

/**
 * Discord に貼る形。名前の見出しの下に、技能名をインラインコードの入れ子リストで並べる。
 * 根拠行は含めない。
 *
 *   **名前**
 *   - 成長技能一覧
 *     - `目星`
 */
const formatGrowthChecks = (selectName: string, checks: GrowthCheck[]) => [
  `**${selectName}**`,
  `- ${GROWTH_SKILL_LIST}`,
  ...checks.map((check) => `  - \`${check.skill}\``),
];

export { parseCheckRoll, collectGrowthChecks, formatGrowthChecks };
