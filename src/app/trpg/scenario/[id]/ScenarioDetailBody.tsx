import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Scenario, ScenarioInfo } from "@/data/scenario/scenario-list";
import LegacyScenarioBody from "./LegacyScenarioBody";

const copyright = `
本作は、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。

Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc. ;all rights reserved. Arranged by Arclight Inc.
Call of Cthulhu is a registered trademark of Chaosium Inc.
PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」
`;

const isCthulhuScenario = (system?: string) =>
  system?.includes("クトゥルフ神話TRPG") ?? false;

const toScenarioInfo = ({
  title,
  system,
  players,
  playTimeHours,
}: Scenario): ScenarioInfo => ({ title, system, players, playTimeHours });

/**
 * 詳細画面の本文。専用ページがあればそれを、なければ従来の整形表示を出し、
 * どちらにも権利表記を付ける(specs/005-scenario/contracts/detail-view.md 1 章)
 */
const ScenarioDetailBody = async ({ scenario }: { scenario?: Scenario }) => {
  const copyrightNotice = isCthulhuScenario(scenario?.system) && (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{copyright}</ReactMarkdown>
  );

  if (scenario?.page) {
    const { default: Page } = await scenario.page();
    return (
      <div className="flex w-full flex-col gap-10">
        <Page scenario={toScenarioInfo(scenario)} />
        <div className="prose dark:prose-dark max-w-none">
          {copyrightNotice}
        </div>
      </div>
    );
  }

  return (
    <div className="prose dark:prose-dark w-full flex flex-col justify-center">
      <LegacyScenarioBody markdown={scenario?.markdown} />
      {copyrightNotice}
    </div>
  );
};

export default ScenarioDetailBody;
