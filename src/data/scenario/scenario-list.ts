import fs from "node:fs";
import path from "node:path";
import { escapeMarkdownText } from "@/utils/markdown-utils";

const readScenarioMarkdown = (fileName: string) => {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "src", "data", "scenario", "markdown", fileName),
    "utf8",
  );

  return escapeMarkdownText(markdown);
};

const list: {
  [key: string]: { title: string; overview: string; markdown: string };
} = {
  ThePrisonerInTheGlassCageDreamsInTheSeaOfStars: {
    title: "硝子檻の虜囚は星海にて夢を見る",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 i ～ j 人向けにデザインされている。
　プレイ時間は探索者の作成時間を含まずに n 時間程度だろう。
　舞台は現代。探索者たちはバーチャルYouTuber **天戌 ノア** の配信を見ているところから開始する。`,
    markdown: readScenarioMarkdown(
      "the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars.md",
    ),
  },
  BubbleOnWetHands: {
    title: "濡れた手の泡沫",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 6 時間程度だろう。  
　舞台は現代の日本。探索者たちは共通の知人である **沖嶋 深月** の依頼で一人の男性を捜し、海沿いの町へ赴くこととなる。`,
    markdown: readScenarioMarkdown("bubble-on-wet-hands.md"),
  },
  SilentJourney: {
    title: "Silent Journey",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 4 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 3 時間程度だろう。  
　舞台は現代の日本。探索者たちが駅で一人の男性とぶつかるところから事件は展開する。`,
    markdown: readScenarioMarkdown("silent-journey.md"),
  },
  AgnusDeiQuiTollisPeccataMundi: {
    title: "Agnus Dei, qui tollis peccata mundi",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 6 時間程度だろう。  
　舞台は現代の日本。探索者たちが教会へ訪れたときから事件は展開する。  
　なお、あらかじめ探索者同士は知り合いだったほうが、ゲームはスムーズに展開する。`,
    markdown: readScenarioMarkdown("agnus-dei-qui-tollis-peccata-mundi.md"),
  },
  DasDornroschenDesWahnsinnigenKonigs: {
    title: "狂気の王の眠り姫",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 4 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 4 時間程度だろう。  
　舞台は現代の日本。亡くなった芸術家の屋敷で事件は展開する。`,
    markdown: readScenarioMarkdown(
      "das-dornröschen-des-wahnsinnigen-königs.md",
    ),
  },
  TheSoundOfSteppingOnFog: {
    title: "霧を踏む音",
    overview: `
　このシナリオは"新クトゥルフ神話TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 5 時間程度だろう。  
　舞台は現代の日本。山間の片田舎で事件は展開する。  
　シナリオの設定上、少なくとも一人の探索者の知人に **笹本 霧江** という大学生がいることとなる。  
　なお、あらかじめ探索者同士は知り合いだったほうが、ゲームはスムーズに展開する。`,
    markdown: readScenarioMarkdown("the-sound-of-stepping-on-fog.md"),
  },
  // PalateOfTheCrawling: {
  //   title: "蠢く口蓋",
  //   overview: ``,
  //   markdown: preparation,
  // },
  // ShadowFeather: {
  //   title: "影の羽",
  //   overview: "",
  //   markdown: preparation,
  // },
  // LieDownOnBambooLeaves: {
  //   title: "竹の葉に寝転ぶ",
  //   overview: "",
  //   markdown: preparation,
  // },
  // Nocturne: {
  //   title: "夜想曲",
  //   overview: "",
  //   markdown: preparation,
  // },
  // Parasite: {
  //   title: "パラサイト",
  //   overview: "",
  //   markdown: preparation,
  // },
  // TheSmileOfTheBangsLessGoddess: {
  //   title: "前髪なき女神の微笑み",
  //   overview: "",
  //   markdown: preparation,
  // },
};

export default list;
