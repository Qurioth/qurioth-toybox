import Flowchart from "@/components/scenario/Flowchart";
import ScenarioPage from "@/components/scenario/ScenarioPage";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import Content from "./content.mdx";

/** 進行の流れ。本文の章立てから起こしたもの */
const PROGRESS_CHART = `flowchart TD
  intro["シナリオの導入<br/>倒れていた明日菜を介抱"] --> dream["その夜の悪夢<br/>テレビにキーザの映像"]
  dream --> shadow["忍び寄る影<br/>画面に結晶が映り込む"]
  shadow --> shop["喜瀬の店<br/>忘れ物を届け、羊介の話を聞く"]
  shop -. 奥の部屋を覗く .-> backroom["奥の部屋<br/>原石・スケジュール表・ノート"]
  backroom -.-> man
  shop --> man["水晶に蝕まれた者<br/>店を出た直後に遭遇"]
  man --> meet["羊介との対面<br/>鼓星テレビの応接室"]
  meet --> research["調査 (1日2箇所まで)<br/>テレビ局／街に広がる異変<br/>日数とともに鉱物化が進行"]
  research --> confront["羊介を問い詰める<br/>結晶化した羊介との戦闘"]
  confront -- ストラップを外す --> saved["羊介が人間の姿に戻る"]
  confront -. 殺害する .-> police["警察に追われる"]
  saved --> revisit["再び喜瀬の店へ<br/>日記・『ロングブリッジの日誌』・付箋 A／B"]
  police --> revisit
  revisit --> climax["クライマックス<br/>鼓星テレビの屋上で招来の儀式<br/>結晶体2体をかわし、5ラウンド以内に止める"]
  climax -- 儀式を完成前に止める --> ed1["ED1 放送事故"]
  climax -- 止められない --> battle["キーザとの戦闘<br/>大音量・退散の呪文"]
  climax -. 付箋 A を唱える .-> battle
  battle -- 撃退する --> ed2["ED2 顕現"]`;

/**
 * 「God is in the TV」の専用ページ。
 * 配色は ScenarioPage の theme(例: { accent: "#0e7490", dark: { accent: "#67e8f9" } })で、
 * レイアウトや演出はこのファイルと content.mdx で自由に決める(src/scenarios/README.md)
 */
export default function GodIsInTheTvScenario({
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
      theme={{
        accent: "#6d3fa8",
        surface: "#f6f2fb",
        border: "#d8cbe9",
        dark: { accent: "#c4a8ef", surface: "#211a2e", border: "#4a3b63" },
      }}
    >
      <Content />
    </ScenarioPage>
  );
}
