import { matchesAllWords } from "@/utils/text-utils";

export type ScenarioListItem = {
  id: string;
  title: string;
  titleKana: string;
  system: string;
  players: {
    min: number;
    max: number;
  };
  playTimeHours: {
    min: number;
    max: number;
  };
  summary: string;
};

type Range = {
  min: number;
  max: number;
};

export type ScenarioFilterCriteria = {
  /** タイトル・ふりがなへのフリーワード(空白区切りのAND) */
  titleQuery: string;
  /** 空文字はシステム未指定 */
  system: string;
  /** 未入力は絞り込まない */
  playerCount?: number;
  playTimeHours?: number;
};

/** 「3～4」のような範囲表記。上下限が同じなら1つだけ返す */
export const formatRange = (min: number, max: number) =>
  min === max ? `${min}` : `${min}～${max}`;

/** 数値入力欄の値を絞り込み条件に変換する。未入力は「指定なし」 */
export const toNumberOrUndefined = (value: string) =>
  value === "" ? undefined : Number(value);

/** 数値入力欄に入れてよい文字だけを残す。2桁まで、0は未入力扱い */
export const normalizeNumberInput = (value: string) => {
  const normalizedValue = value.replace(/\D/g, "").slice(0, 2);

  if (normalizedValue === "" || normalizedValue === "0") {
    return "";
  }

  return normalizedValue;
};

/** 未指定(undefined)なら常に通す */
const rangeIncludes = (scenarioRange: Range, value?: number) => {
  if (value === undefined) {
    return true;
  }

  return scenarioRange.min <= value && value <= scenarioRange.max;
};

const matchesTitle = (scenario: ScenarioListItem, query: string) =>
  matchesAllWords([scenario.title, scenario.titleKana].join(" "), query);

/** 重複を除いたシステム名の一覧。並び順はデータの登場順 */
export const getSystems = (scenarios: ScenarioListItem[]) =>
  Array.from(new Set(scenarios.map((scenario) => scenario.system)));

export const filterScenarios = (
  scenarios: ScenarioListItem[],
  criteria: ScenarioFilterCriteria,
) =>
  scenarios.filter(
    (scenario) =>
      matchesTitle(scenario, criteria.titleQuery) &&
      (criteria.system === "" || scenario.system === criteria.system) &&
      rangeIncludes(scenario.players, criteria.playerCount) &&
      rangeIncludes(scenario.playTimeHours, criteria.playTimeHours),
  );
