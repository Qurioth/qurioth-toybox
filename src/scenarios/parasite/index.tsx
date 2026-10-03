import Flowchart from "@/components/scenario/Flowchart";
import ScenarioPage from "@/components/scenario/ScenarioPage";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import Content from "./content.mdx";

/** 進行の流れ。本文の章立てから起こしたもの */
const PROGRESS_CHART = `flowchart TD
  intro["シナリオの導入<br/>盛華から連絡がある"] --> house["盛華の家<br/>枯死したものに感染"]
  house --> pharmacy["漢方薬局 倪爺留堂<br/>秘蔵の品を対価に紹介を受ける"]
  pharmacy --> restaurant["中華料理店 九頭竜軒<br/>美月から仕事の依頼"]
  restaurant --> ruin["廃墟<br/>日誌と『フサン謎の七書』"]
  ruin --> climax["クライマックス<br/>枯死したもの・ティンダロスの交雑種"]
  climax --> after["仕事終了後<br/>治療と秘蔵の品の返還"]
  after --> ed1["ED1 腐海より戻りし者"]
  climax -. 2 体を倒した .-> ed2["ED2 異形の犬を捕らえて"]
  after -. 膨らんだ女と戦う .-> ed3["ED3 膨らんだ女を退ける"]`;

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
    <ScenarioPage
      scenario={scenario}
      toc="left"
      aside={{
        label: "進行の流れ",
        content: <Flowchart chart={PROGRESS_CHART} fit />,
      }}
    >
      <Content />
    </ScenarioPage>
  );
}
