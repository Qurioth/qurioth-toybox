import Flowchart from "@/components/scenario/Flowchart";
import ScenarioPage from "@/components/scenario/ScenarioPage";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import Content from "./content.mdx";

/** 進行の流れ。本文の章立てから起こした下書き */
const PROGRESS_CHART = `flowchart TD
  intro["シナリオの導入<br/>深月から渡舟を捜す依頼"] --> town["潮上町・道の駅<br/>町内マップで行き先を選ぶ"]
  town --> research["町の調査 (順不同)<br/>漁港・防波堤／民宿「浜風荘」<br/>町立資料館／町役場<br/>潮上灯台跡・青凪洞 (昼間)"]
  research --> clue["手がかり<br/>干潮は 22 時頃<br/>灯台跡の崖下に潮噛ノ岩戸"]
  clue --> night["干潮の夜<br/>船で青凪洞の崖下へ"]
  night -. 灯台跡へ寄る .-> lighthouse["潮上灯台跡 (夜間)<br/>渡舟が崖から飛び降りる"]
  lighthouse -.-> cave
  night --> cave["青凪洞 (夜間)<br/>崖下の裂け目から上陸"]
  cave --> iwato["潮噛の岩戸<br/>渡舟が木箱を取り戻す"]
  iwato --> battle["深きものとの戦闘<br/>渡舟は霧で離脱"]
  battle --> escape["船での脱出<br/>エンジンが始動するまで"]
  battle -. 戦闘を続ける .-> horde["10D4 体の深きもの"]
  horde -.-> escape
  escape --> chase["クライマックス<br/>ダゴンとのチェイス"]
  chase --> gate["チェイスの終了<br/>《門の創造》の波へ突っ込む"]
  gate --> ending["シナリオ終了<br/>銭湯の湯船に出る"]`;

/**
 * 「濡れた手の泡沫」の専用ページ。
 * 配色は ScenarioPage の theme(例: { accent: "#0e7490", dark: { accent: "#67e8f9" } })で、
 * レイアウトや演出はこのファイルと content.mdx で自由に決める(src/scenarios/README.md)
 */
export default function BubbleOnWetHandsScenario({
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
