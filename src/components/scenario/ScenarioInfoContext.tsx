"use client";

import { createContext, useContext } from "react";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";

const ScenarioInfoContext = createContext<ScenarioInfo | undefined>(undefined);

/** 専用ページの部品へ登録情報(タイトル・システム・人数・時間)を届ける */
export const ScenarioInfoProvider = ({
  value,
  children,
}: {
  value: ScenarioInfo;
  children: React.ReactNode;
}) => (
  <ScenarioInfoContext.Provider value={value}>
    {children}
  </ScenarioInfoContext.Provider>
);

export const useScenarioInfo = () => useContext(ScenarioInfoContext);
