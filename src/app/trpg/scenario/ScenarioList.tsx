"use client";

import {
  type ScenarioListItem,
  filterScenarios,
  getSystems,
  toNumberOrUndefined,
} from "@/utils/scenario-filter";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import NumberFilterInput from "./NumberFilterInput";
import ScenarioCard from "./ScenarioCard";

const getSelectClassName = (value: string) =>
  [
    "min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800",
    value === ""
      ? "text-zinc-400 dark:text-slate-400"
      : "text-zinc-900 dark:text-zinc-100",
  ].join(" ");

export default function ScenarioList({
  scenarios,
}: {
  scenarios: ScenarioListItem[];
}) {
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [playerCount, setPlayerCount] = useState("");
  const [playTimeHours, setPlayTimeHours] = useState("");

  const systems = useMemo(() => getSystems(scenarios), [scenarios]);
  const filteredScenarios = useMemo(
    () =>
      filterScenarios(scenarios, {
        titleQuery,
        system: selectedSystem,
        playerCount: toNumberOrUndefined(playerCount),
        playTimeHours: toNumberOrUndefined(playTimeHours),
      }),
    [scenarios, titleQuery, selectedSystem, playerCount, playTimeHours],
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
              <NumberFilterInput
                label="人数"
                unit="人"
                paddingRightClassName="pr-10"
                value={playerCount}
                onChange={setPlayerCount}
              />
            </div>

            <div>
              <NumberFilterInput
                label="時間"
                unit="時間"
                paddingRightClassName="pr-14"
                value={playTimeHours}
                onChange={setPlayTimeHours}
              />
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
