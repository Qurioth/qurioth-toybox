import type { ReplayVideo } from "@/data/youtube/trpg/youtube-id";
import { matchesAllWords, normalizeSearchText } from "@/utils/text-utils";

/**
 * リプレイ一覧の検索ロジック。
 *
 * 検索欄には次の2種類を混ぜて書ける。
 * - フリーワード: 全項目を対象に、空白区切りのAND検索
 * - フィールド指定: `gm:リアン` のように「項目名:値」で完全一致に絞り込む
 */

export type SearchField = "scenario" | "system" | "gm" | "player" | "character";

export type SearchTarget = {
  field: SearchField;
  label: string;
  value: string;
};

export type ParsedSearchQuery = {
  targets: SearchTarget[];
  freeQuery: string;
};

export const SUGGESTION_LIMIT = 8;

const searchFieldLabels: Record<SearchField, string> = {
  scenario: "シナリオタイトル",
  system: "システム名",
  gm: "GM名",
  player: "プレイヤー名",
  character: "キャラクター名",
};

// getSearchField が normalizeSearchText を通してから引くため、キーは小文字で書くこと。
// 大文字を含むキーは永久に一致しない。
const searchFieldAliases: Record<string, SearchField> = {
  scenario: "scenario",
  sc: "scenario",
  title: "scenario",
  シナリオ: "scenario",
  シナリオタイトル: "scenario",
  system: "system",
  sys: "system",
  システム: "system",
  システム名: "system",
  gm: "gm",
  gm名: "gm",
  player: "player",
  pl: "player",
  pcplayer: "player",
  プレイヤー: "player",
  プレイヤー名: "player",
  character: "character",
  chara: "character",
  pc: "character",
  キャラクター: "character",
  キャラクター名: "character",
};

const hasText = (value?: string): value is string =>
  Boolean(value && value.trim().length > 0);

export const getSearchField = (value: string): SearchField | undefined =>
  searchFieldAliases[normalizeSearchText(value)];

export const createSearchTarget = (
  field: SearchField,
  value: string,
): SearchTarget => ({
  field,
  label: searchFieldLabels[field],
  value,
});

export const getSearchTargetKey = ({ field, value }: SearchTarget) =>
  `${field}:${normalizeSearchText(value)}`;

/** 1件のリプレイが持つ検索対象を、項目ごとに列挙する */
export const getReplaySearchTargets = (replay: ReplayVideo): SearchTarget[] => {
  const targets: SearchTarget[] = [];

  const push = (field: SearchField, value?: string) => {
    if (hasText(value)) {
      targets.push(createSearchTarget(field, value));
    }
  };

  push("scenario", replay.scenarioName);
  push("system", replay.trpgSystemName);
  push("gm", replay.gmName);

  replay.characters?.forEach(({ characterName, playerName }) => {
    push("character", characterName);
    push("player", playerName);
  });

  return targets;
};

/** 検索文字列を「フィールド指定」と「フリーワード」に切り分ける */
export const parseSearchQuery = (query: string): ParsedSearchQuery => {
  const targets: SearchTarget[] = [];
  const freeWords: string[] = [];

  query
    .split(/[\s,、]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .forEach((word) => {
      const match = word.match(/^([^:：]+)[:：](.+)$/);

      if (!match) {
        freeWords.push(word);
        return;
      }

      const field = getSearchField(match[1]);

      // 項目名として解釈できない場合はフリーワードとして扱う
      if (!field) {
        freeWords.push(word);
        return;
      }

      targets.push(createSearchTarget(field, match[2].trim()));
    });

  return {
    targets,
    freeQuery: freeWords.join(" "),
  };
};

/** フリーワードのAND検索。空なら全件通す */
export const replayMatchesSearch = (replay: ReplayVideo, query: string) => {
  // 値ごとに正規化してから連結する。生のまま連結すると、値の前後の空白が残って
  // 語の境界がずれることがある
  const targetText = getReplaySearchTargets(replay)
    .map(({ value }) => normalizeSearchText(value))
    .join(" ");

  return matchesAllWords(targetText, query);
};

/** フィールド指定の絞り込み。値は正規化した上での完全一致 */
export const replayMatchesSearchTarget = (
  replay: ReplayVideo,
  selectedTarget: SearchTarget,
) =>
  getReplaySearchTargets(replay).some(
    (target) =>
      target.field === selectedTarget.field &&
      normalizeSearchText(target.value) ===
        normalizeSearchText(selectedTarget.value),
  );

/** 選択済みのチップと、入力中のフィールド指定をキー重複なしでまとめる */
export const mergeSearchTargets = (
  selectedTargets: SearchTarget[],
  parsedTargets: SearchTarget[],
) => {
  const targets = [...selectedTargets];
  const targetKeys = new Set(targets.map(getSearchTargetKey));

  for (const target of parsedTargets) {
    const key = getSearchTargetKey(target);

    if (!targetKeys.has(key)) {
      targets.push(target);
      targetKeys.add(key);
    }
  }

  return targets;
};

export const filterReplays = (
  replays: ReplayVideo[],
  activeTargets: SearchTarget[],
  freeQuery: string,
) =>
  replays.filter(
    (replay) =>
      activeTargets.every((target) =>
        replayMatchesSearchTarget(replay, target),
      ) && replayMatchesSearch(replay, freeQuery),
  );

/** 入力中の末尾の語だけをサジェストの手がかりにする */
const getSearchSuggestionQuery = (query: string) => {
  const words = query.split(/[\s,、]+/);
  const currentWord = words[words.length - 1] ?? "";
  const match = currentWord.match(/^([^:：]+)[:：](.*)$/);

  if (!match) {
    return { field: undefined, query: currentWord };
  }

  return { field: getSearchField(match[1]), query: match[2] };
};

export const getSearchSuggestions = (
  replays: ReplayVideo[],
  query: string,
  selectedTargets: SearchTarget[],
  limit: number = SUGGESTION_LIMIT,
) => {
  const suggestionQuery = getSearchSuggestionQuery(query);
  const normalizedQuery = normalizeSearchText(suggestionQuery.query);

  if (!normalizedQuery) {
    return [];
  }

  const selectedKeys = new Set(selectedTargets.map(getSearchTargetKey));
  const suggestions = new Map<string, SearchTarget>();

  for (const replay of replays) {
    for (const target of getReplaySearchTargets(replay)) {
      if (suggestionQuery.field && target.field !== suggestionQuery.field) {
        continue;
      }

      const key = getSearchTargetKey(target);

      if (selectedKeys.has(key)) {
        continue;
      }

      if (!normalizeSearchText(target.value).includes(normalizedQuery)) {
        continue;
      }

      if (!suggestions.has(key)) {
        suggestions.set(key, target);
      }

      if (suggestions.size >= limit) {
        return Array.from(suggestions.values());
      }
    }
  }

  return Array.from(suggestions.values());
};
