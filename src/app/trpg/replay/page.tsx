"use client";

import Template from "@/components/Template";
import { replayVideos } from "@/data/youtube/trpg/youtube-id";
import {
  type SearchTarget,
  filterReplays,
  getSearchSuggestions,
  getSearchTargetKey,
  mergeSearchTargets,
  parseSearchQuery,
} from "@/utils/replay-search";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReplayCard, { getReplayMediaId } from "./ReplayCard";

const loadSize = 10;

export default function ReplayPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchTargets, setSelectedSearchTargets] = useState<
    SearchTarget[]
  >([]);
  const [visibleCount, setVisibleCount] = useState(loadSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const parsedSearchQuery = useMemo(
    () => parseSearchQuery(searchQuery),
    [searchQuery],
  );
  const activeSearchTargets = useMemo(
    () => mergeSearchTargets(selectedSearchTargets, parsedSearchQuery.targets),
    [parsedSearchQuery.targets, selectedSearchTargets],
  );
  const filteredReplayVideos = useMemo(
    () =>
      filterReplays(
        replayVideos,
        activeSearchTargets,
        parsedSearchQuery.freeQuery,
      ),
    [activeSearchTargets, parsedSearchQuery.freeQuery],
  );
  const searchSuggestions = useMemo(
    () => getSearchSuggestions(replayVideos, searchQuery, activeSearchTargets),
    [activeSearchTargets, searchQuery],
  );
  const hasMore = visibleCount < filteredReplayVideos.length;
  const visibleReplayVideos = useMemo(
    () => filteredReplayVideos.slice(0, visibleCount),
    [filteredReplayVideos, visibleCount],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset visibleCount when search filters change
  useEffect(() => {
    setVisibleCount(loadSize);
  }, [activeSearchTargets, searchQuery]);

  const onSelectSuggestion = (suggestion: SearchTarget) => {
    setSelectedSearchTargets((currentTargets) => {
      const suggestionKey = getSearchTargetKey(suggestion);
      const alreadySelected = currentTargets.some(
        (target) => getSearchTargetKey(target) === suggestionKey,
      );

      if (alreadySelected) {
        return currentTargets;
      }

      return [...currentTargets, suggestion];
    });
    setSearchQuery("");
  };

  const onRemoveSearchTarget = (targetKey: string) => {
    setSelectedSearchTargets((currentTargets) =>
      currentTargets.filter(
        (target) => getSearchTargetKey(target) !== targetKey,
      ),
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
          setVisibleCount((currentCount) =>
            Math.min(currentCount + loadSize, filteredReplayVideos.length),
          );
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
                onChange={(event) => setSearchQuery(event.target.value)}
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
          {visibleReplayVideos.map((replay) => (
            <ReplayCard key={getReplayMediaId(replay)} replay={replay} />
          ))}
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
