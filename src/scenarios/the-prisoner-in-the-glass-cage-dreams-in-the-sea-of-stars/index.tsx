import Flowchart from "@/components/scenario/Flowchart";
import ScenarioPage from "@/components/scenario/ScenarioPage";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import Content from "./content.mdx";

/** 進行の流れ。本文の章立てから起こしたもの */
const PROGRESS_CHART = `flowchart TD
  intro["シナリオの導入<br/>ノアの配信中に名前を呼ばれる"] --> escape["ノアからの逃走<br/>玄関から現れたノアに捕まる"]
  escape --> pod["医療ポッド室<br/>ミ＝ゴの宇宙船で目覚める"]
  pod --> corridor["廊下<br/>円環状の廊下と四つの部屋"]
  corridor --> brain["脳缶保管室<br/>縁理の脳缶・接続ポッド"]
  brain --> sparring["スパーリングプログラム<br/>ノアとの戦闘・技能強化"]
  sparring --> city["精神世界の探索<br/>電波塔／展望台／電気街"]
  city --> radio["ラジオ局・電話交換局<br/>ミ＝ゴの言語を解読"]
  city --> station["檻ヶ谷駅<br/>保護プログラムとの遭遇<br/>下の階層の座標"]
  radio --> fake["宇宙船の探索<br/>偽装通信でミ＝ゴを引き離す"]
  station --> fake
  fake --> mind["精神世界班<br/>ノヴァ・アークタワー<br/>ロビー → 地下1階 → 地下3階"]
  fake --> real["現実世界班<br/>脳缶を制御室へ・制御防壁を削る<br/>観察室からの支援"]
  mind --> core["サーバーコアの破壊"]
  core --> seize["制御奪取"]
  real --> seize
  seize --> climax["クライマックス<br/>追ってくるミ＝ゴを振り切る"]
  climax -- 脳缶を接続して奪取 --> ending["エンディング"]
  climax -. 探索者が奪取 .-> body["縁理の身体<br/>保管された身体へ移す"]
  body -.-> ending
  ending --> ed1["ED1 解き放たれた犬は陽だまりへ還る"]
  ending --> ed2["ED2 虚実の間にて"]
  ending --> ed3["ED3 天狼、0と1の野を駆ける"]`;

/**
 * 「硝子檻の虜囚は星海にて夢を見る」の専用ページ。
 * 配色は ScenarioPage の theme(例: { accent: "#0e7490", dark: { accent: "#67e8f9" } })で、
 * レイアウトや演出はこのファイルと content.mdx で自由に決める(src/scenarios/README.md)
 */
export default function ThePrisonerInTheGlassCageDreamsInTheSeaOfStarsScenario({
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
        accent: "#2c4a8a",
        surface: "#f1f4fb",
        border: "#c9d3ea",
        dark: { accent: "#9db8f2", surface: "#161d30", border: "#34416a" },
      }}
    >
      <Content />
    </ScenarioPage>
  );
}
