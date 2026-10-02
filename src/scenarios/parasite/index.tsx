import ScenarioPage from "@/components/scenario/ScenarioPage";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import Content from "./content.mdx";

/**
 * 「パラサイト」の専用ページ。
 * 配色は ScenarioPage の theme(例: { accent: "#0e7490", dark: { accent: "#67e8f9" } })で、
 * レイアウトや演出はこのファイルと content.mdx で自由に決める(src/scenarios/README.md)
 */
export default function ParasiteScenario({
  scenario,
}: {
  scenario: ScenarioInfo;
}) {
  return (
    <ScenarioPage scenario={scenario} toc="sidebar">
      <Content />
    </ScenarioPage>
  );
}
