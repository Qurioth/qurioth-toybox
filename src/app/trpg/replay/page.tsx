"use client";

import Template from "@/components/Template";
import YouTubeEmbed from "@/components/YoutubeEmbed";
import {
  ReplayCharacter,
  ReplayVideo,
  replayVideos,
} from "@/data/youtube/trpg/youtube-id";
import { Search, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const loadSize = 10;
const suggestionLimit = 8;
const emptyText = "未設定";

type SearchField = "scenario" | "system" | "gm" | "player" | "character";

type SearchTarget = {
  field: SearchField;
  label: string;
  value: string;
};

type ParsedSearchQuery = {
  targets: SearchTarget[];
  freeQuery: string;
};

const searchFieldLabels: Record<SearchField, string> = {
  scenario: "シナリオタイトル",
  system: "システム名",
  gm: "GM名",
  player: "プレイヤー名",
  character: "キャラクター名",
};

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
  GM: "gm",
  GM名: "gm",
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

const displayText = (value?: string) => {
  return value && value.trim().length > 0 ? value : emptyText;
};

const hasText = (value?: string) => {
  return Boolean(value && value.trim().length > 0);
};

const normalizeSearchText = (value: string) => {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
};

const normalizeSearchField = (value: string) => {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
};

const getSearchField = (value: string) => {
  return searchFieldAliases[normalizeSearchField(value)];
};

const createSearchTarget = (
  field: SearchField,
  value: string,
): SearchTarget => {
  return {
    field,
    label: searchFieldLabels[field],
    value,
  };
};

const getSearchTargetKey = ({ field, value }: SearchTarget) => {
  return `${field}:${normalizeSearchText(value)}`;
};

const getReplaySearchTargets = (replay: ReplayVideo): SearchTarget[] => {
  const targets: SearchTarget[] = [];

  if (hasText(replay.scenarioName)) {
    targets.push(createSearchTarget("scenario", replay.scenarioName as string));
  }

  if (hasText(replay.trpgSystemName)) {
    targets.push(createSearchTarget("system", replay.trpgSystemName as string));
  }

  if (hasText(replay.gmName)) {
    targets.push(createSearchTarget("gm", replay.gmName as string));
  }

  replay.characters?.forEach(({ characterName, playerName }) => {
    if (hasText(characterName)) {
      targets.push(createSearchTarget("character", characterName));
    }

    if (hasText(playerName)) {
      targets.push(createSearchTarget("player", playerName as string));
    }
  });

  return targets;
};

const parseSearchQuery = (query: string): ParsedSearchQuery => {
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

const replayMatchesSearch = (replay: ReplayVideo, query: string) => {
  const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return true;
  }

  const targetText = getReplaySearchTargets(replay)
    .map(({ value }) => normalizeSearchText(value))
    .join(" ");

  return words.every((word) => targetText.includes(word));
};

const replayMatchesSearchTarget = (
  replay: ReplayVideo,
  selectedTarget: SearchTarget,
) => {
  return getReplaySearchTargets(replay).some((target) => {
    return (
      target.field === selectedTarget.field &&
      normalizeSearchText(target.value) ===
        normalizeSearchText(selectedTarget.value)
    );
  });
};

const getSearchSuggestionQuery = (query: string) => {
  const words = query.split(/[\s,、]+/);
  const currentWord = words[words.length - 1] ?? "";
  const match = currentWord.match(/^([^:：]+)[:：](.*)$/);

  if (!match) {
    return {
      field: undefined,
      query: currentWord,
    };
  }

  return {
    field: getSearchField(match[1]),
    query: match[2],
  };
};

const getSearchSuggestions = (
  query: string,
  selectedTargets: SearchTarget[],
) => {
  const suggestionQuery = getSearchSuggestionQuery(query);
  const normalizedQuery = normalizeSearchText(suggestionQuery.query);

  if (!normalizedQuery) {
    return [];
  }

  const selectedKeys = new Set(selectedTargets.map(getSearchTargetKey));
  const suggestions = new Map<string, SearchTarget>();

  for (const replay of replayVideos) {
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

      if (suggestions.size >= suggestionLimit) {
        return Array.from(suggestions.values());
      }
    }
  }

  return Array.from(suggestions.values());
};

const normalizePassword = (value: string) => {
  return value.trim().toLocaleLowerCase();
};

const hasPasswords = (passwords?: string[]) => {
  return Boolean(passwords && passwords.length > 0);
};

const getReplayMediaId = (replay: ReplayVideo) => {
  return replay.videoId ?? replay.playlistId;
};

const displayCharacters = (characters?: ReplayCharacter[]) => {
  if (!characters || characters.length === 0) {
    return emptyText;
  }

  return characters
    .map(({ characterName, playerName }) => {
      if (!playerName) {
        return characterName;
      }

      return `${characterName}（${playerName}）`;
    })
    .join(" / ");
};

const ReplayCard = ({ replay }: { replay: ReplayVideo }) => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!hasPasswords(replay.passwords));
  const [errorMessage, setErrorMessage] = useState("");
  const shouldShowProtectedContent =
    !hasPasswords(replay.passwords) || isUnlocked;

  const onSubmitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPassword = normalizePassword(password);
    const canUnlock = replay.passwords?.some((validPassword) => {
      return normalizePassword(validPassword) === normalizedPassword;
    });

    if (canUnlock) {
      setIsUnlocked(true);
      setErrorMessage("");
      return;
    }

    setErrorMessage("キーワードが一致しません。");
  };

  return (
    <article className="w-full max-w-lg overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {shouldShowProtectedContent ? (
        <YouTubeEmbed videoId={replay.videoId} playlistId={replay.playlistId} />
      ) : (
        <div className="flex aspect-video w-full flex-col justify-center gap-4 bg-zinc-100 p-6 text-zinc-800 dark:bg-slate-900 dark:text-zinc-100">
          <div>
            <p className="text-base font-bold">限定公開リプレイ</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              この動画を表示するには、シナリオ内に出現した神話生物の名前を入力してください。
            </p>
          </div>
          <form className="flex flex-col gap-3" onSubmit={onSubmitPassword}>
            <label
              className="text-sm font-semibold"
              htmlFor={getReplayMediaId(replay)}
            >
              キーワード
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={getReplayMediaId(replay)}
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                表示
              </button>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-300">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 text-sm text-zinc-800 dark:text-zinc-100">
        <div>
          <h2 className="text-lg font-bold">
            {displayText(replay.scenarioName)}
          </h2>
        </div>

        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2">
          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            TRPGシステム
          </dt>
          <dd>{displayText(replay.trpgSystemName)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            キャラクター
          </dt>
          <dd>{displayCharacters(replay.characters)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">GM</dt>
          <dd>{displayText(replay.gmName)}</dd>

          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
            実施日
          </dt>
          <dd>{displayText(replay.playedAt)}</dd>

          {hasText(replay.note) && (
            <>
              <dt className="font-semibold text-zinc-500 dark:text-zinc-400">
                備考
              </dt>
              <dd>{replay.note}</dd>
            </>
          )}
        </dl>
      </div>
    </article>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchTargets, setSelectedSearchTargets] = useState<
    SearchTarget[]
  >([]);
  const [visibleCount, setVisibleCount] = useState(loadSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const parsedSearchQuery = useMemo(() => {
    return parseSearchQuery(searchQuery);
  }, [searchQuery]);
  const activeSearchTargets = useMemo(() => {
    const targets = [...selectedSearchTargets];
    const targetKeys = new Set(targets.map(getSearchTargetKey));

    for (const target of parsedSearchQuery.targets) {
      const key = getSearchTargetKey(target);

      if (!targetKeys.has(key)) {
        targets.push(target);
        targetKeys.add(key);
      }
    }

    return targets;
  }, [parsedSearchQuery.targets, selectedSearchTargets]);
  const filteredReplayVideos = useMemo(() => {
    return replayVideos.filter(
      (replay) =>
        activeSearchTargets.every((target) =>
          replayMatchesSearchTarget(replay, target),
        ) && replayMatchesSearch(replay, parsedSearchQuery.freeQuery),
    );
  }, [activeSearchTargets, parsedSearchQuery.freeQuery]);
  const searchSuggestions = useMemo(() => {
    return getSearchSuggestions(searchQuery, activeSearchTargets);
  }, [activeSearchTargets, searchQuery]);
  const hasMore = visibleCount < filteredReplayVideos.length;
  const visibleReplayVideos = useMemo(() => {
    return filteredReplayVideos.slice(0, visibleCount);
  }, [filteredReplayVideos, visibleCount]);

  useEffect(() => {
    setVisibleCount(loadSize);
  }, [activeSearchTargets, searchQuery]);

  const onChangeSearchQuery = (value: string) => {
    setSearchQuery(value);
  };

  const onSelectSuggestion = (suggestion: SearchTarget) => {
    setSelectedSearchTargets((currentTargets) => {
      const suggestionKey = getSearchTargetKey(suggestion);
      const alreadySelected = currentTargets.some((target) => {
        return getSearchTargetKey(target) === suggestionKey;
      });

      if (alreadySelected) {
        return currentTargets;
      }

      return [...currentTargets, suggestion];
    });
    setSearchQuery("");
  };

  const onRemoveSearchTarget = (targetKey: string) => {
    setSelectedSearchTargets((currentTargets) =>
      currentTargets.filter((target) => {
        return getSearchTargetKey(target) !== targetKey;
      }),
    );
  };

  const onClearSearch = () => {
    setSearchQuery("");
    setSelectedSearchTargets([]);
  };

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) => {
            return Math.min(
              currentCount + loadSize,
              filteredReplayVideos.length,
            );
          });
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [filteredReplayVideos.length, hasMore]);

  return (
    <Template>
      <div className="w-full min-h-[calc(100vh-16rem)]">
        <div className="mx-auto mb-8 w-full max-w-[66rem]">
          <div className="mb-5">
            <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">
              Replay
            </h1>
          </div>

          <div className="relative">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                id="replay-search"
                type="search"
                value={searchQuery}
                onChange={(event) => onChangeSearchQuery(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white py-3 pl-10 pr-11 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100"
                placeholder="シナリオタイトル、システム名、GM名、プレイヤー名、キャラクター名"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-zinc-300 dark:hover:bg-slate-700 dark:hover:text-zinc-100"
                  onClick={onClearSearch}
                  aria-label="検索キーワードをクリア"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {searchSuggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <ul className="max-h-72 overflow-y-auto py-1">
                  {searchSuggestions.map((suggestion) => (
                    <li key={getSearchTargetKey(suggestion)}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                        onClick={() => onSelectSuggestion(suggestion)}
                      >
                        <span className="shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600 dark:bg-slate-700 dark:text-zinc-200">
                          {suggestion.label}
                        </span>
                        <span className="min-w-0 truncate text-zinc-900 dark:text-zinc-100">
                          {suggestion.value}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedSearchTargets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSearchTargets.map((target) => {
                  const targetKey = getSearchTargetKey(target);

                  return (
                    <span
                      key={targetKey}
                      className="inline-flex max-w-full items-center gap-2 rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-700 dark:bg-slate-700 dark:text-zinc-100"
                    >
                      <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-300">
                        {target.label}
                      </span>
                      <span className="min-w-0 truncate">{target.value}</span>
                      <button
                        type="button"
                        className="flex size-5 shrink-0 items-center justify-center rounded text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-zinc-300 dark:hover:bg-slate-600 dark:hover:text-zinc-100"
                        onClick={() => onRemoveSearchTarget(targetKey)}
                        aria-label={`${target.label} ${target.value}を削除`}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {filteredReplayVideos.length}件 / {replayVideos.length}件
            </p>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[66rem] grid-cols-1 justify-items-center gap-8 lg:grid-cols-2">
          {visibleReplayVideos.map((replay) => {
            return (
              <ReplayCard key={getReplayMediaId(replay)} replay={replay} />
            );
          })}
        </div>

        {filteredReplayVideos.length === 0 ? (
          <p className="mx-auto mt-8 w-full max-w-[66rem] text-sm text-zinc-500 dark:text-zinc-400">
            条件に一致するリプレイはありません。
          </p>
        ) : (
          <div
            ref={loadMoreRef}
            className="mt-8 h-8 text-sm text-zinc-500 dark:text-zinc-400"
            aria-live="polite"
          >
            {hasMore ? "読み込み中..." : "すべて表示しました"}
          </div>
        )}
      </div>
    </Template>
  );
}
