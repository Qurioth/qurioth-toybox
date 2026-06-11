"use client";

import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

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

const formatRange = (min: number, max: number) =>
  min === max ? `${min}` : `${min}～${max}`;

const normalizeSearchText = (value: string) =>
  value.normalize("NFKC").trim().toLocaleLowerCase();

const getSelectClassName = (value: string) =>
  [
    "min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800",
    value === ""
      ? "text-zinc-400 dark:text-slate-400"
      : "text-zinc-900 dark:text-zinc-100",
  ].join(" ");

const inputClassName =
  "min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-slate-400";

const toNumberOrUndefined = (value: string) =>
  value === "" ? undefined : Number(value);

const normalizeNumberInput = (value: string) => {
  const normalizedValue = value.replace(/\D/g, "").slice(0, 2);

  if (normalizedValue === "" || normalizedValue === "0") {
    return "";
  }

  return normalizedValue;
};

const rangeIncludes = (scenarioRange: Range, value?: number) => {
  if (value === undefined) {
    return true;
  }

  return scenarioRange.min <= value && value <= scenarioRange.max;
};

const scenarioMatchesTitle = (scenario: ScenarioListItem, query: string) => {
  const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return true;
  }

  const targetText = normalizeSearchText(
    [scenario.title, scenario.titleKana].join(" "),
  );

  return words.every((word) => targetText.includes(word));
};

const ScenarioCard = ({ scenario }: { scenario: ScenarioListItem }) => (
  <a
    href={`/trpg/scenario/${scenario.id}`}
    className="group flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm transition hover:border-blue-400/80 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-slate-700/80 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-800/60"
  >
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 inline-flex items-center gap-1.5 rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 dark:border-slate-600/80 dark:text-slate-300">
          <BookOpenText className="size-3.5" aria-hidden="true" />
          {scenario.system}
        </p>
        <h2 className="text-2xl font-bold leading-tight text-zinc-950 dark:text-white">
          {scenario.title}
        </h2>
      </div>
      <ArrowRight
        className="mt-1 size-5 shrink-0 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-300"
        aria-hidden="true"
      />
    </div>
    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-slate-300">
      <span className="inline-flex items-center gap-1.5">
        <UsersRound className="size-4" aria-hidden="true" />
        {scenario.players.min}～{scenario.players.max}人
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="size-4" aria-hidden="true" />
        {formatRange(scenario.playTimeHours.min, scenario.playTimeHours.max)}
        時間程度
      </span>
    </div>
    <p className="mt-auto text-sm leading-7 text-zinc-700 dark:text-slate-200">
      {scenario.summary}
    </p>
  </a>
);

export default function ScenarioList({
  scenarios,
}: {
  scenarios: ScenarioListItem[];
}) {
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [playerCount, setPlayerCount] = useState("");
  const [playTimeHours, setPlayTimeHours] = useState("");

  const systems = useMemo(
    () => Array.from(new Set(scenarios.map((scenario) => scenario.system))),
    [scenarios],
  );
  const selectedPlayerCount = toNumberOrUndefined(playerCount);
  const selectedPlayTimeHours = toNumberOrUndefined(playTimeHours);
  const filteredScenarios = useMemo(
    () =>
      scenarios.filter(
        (scenario) =>
          scenarioMatchesTitle(scenario, titleQuery) &&
          (selectedSystem === "" || scenario.system === selectedSystem) &&
          rangeIncludes(scenario.players, selectedPlayerCount) &&
          rangeIncludes(scenario.playTimeHours, selectedPlayTimeHours),
      ),
    [
      scenarios,
      selectedPlayerCount,
      selectedPlayTimeHours,
      selectedSystem,
      titleQuery,
    ],
  );
  const hasActiveFilters =
    titleQuery !== "" ||
    selectedSystem !== "" ||
    playerCount !== "" ||
    playTimeHours !== "";

  const onClearSearch = () => {
    setTitleQuery("");
    setSelectedSystem("");
    setPlayerCount("");
    setPlayTimeHours("");
  };

  return (
    <>
      <div className="mb-8">
        <div className="mb-5">
          <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">
            Scenario
          </h1>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/40">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="flex flex-col md:col-span-6">
              <span className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="タイトル"
                  value={titleQuery}
                  onChange={(event) => setTitleQuery(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-slate-400"
                  placeholder="タイトル・ふりがなで検索"
                  autoComplete="off"
                />
              </span>
            </div>

            <div className="flex flex-col md:col-span-4">
              <select
                aria-label="システム"
                value={selectedSystem}
                onChange={(event) => setSelectedSystem(event.target.value)}
                className={getSelectClassName(selectedSystem)}
              >
                <option value="" disabled hidden>
                  システム
                </option>
                {systems.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  aria-label="人数"
                  value={playerCount}
                  onChange={(event) =>
                    setPlayerCount(normalizeNumberInput(event.target.value))
                  }
                  className={`${inputClassName} w-full pr-10`}
                  placeholder="人数"
                />
                {playerCount !== "" && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-slate-400">
                    人
                  </span>
                )}
              </span>
            </div>

            <div>
              <span className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  aria-label="時間"
                  value={playTimeHours}
                  onChange={(event) =>
                    setPlayTimeHours(normalizeNumberInput(event.target.value))
                  }
                  className={`${inputClassName} w-full pr-14`}
                  placeholder="時間"
                />
                {playTimeHours !== "" && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-slate-400">
                    時間
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-slate-300">
            {filteredScenarios.length}件 / {scenarios.length}件
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={onClearSearch}
            >
              <X className="size-4" aria-hidden="true" />
              クリア
            </button>
          )}
        </div>
      </div>

      {filteredScenarios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-slate-300">
          条件に一致するシナリオはありません。
        </p>
      )}
    </>
  );
}
