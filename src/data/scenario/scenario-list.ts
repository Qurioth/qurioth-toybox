import agnusDeiQuiTollisPeccataMundi from "@/data/scenario/agnus-dei-qui-tollis-peccata-mundi";
import bubbleOnWetHands from "@/data/scenario/bubble-on-wet-hands";
import dasDornroschenDesWahnsinnigenKonigs from "@/data/scenario/das-dornröschen-des-wahnsinnigen-königs";
import theSoundOfSteppingOnFog from "@/data/scenario/the-sound-of-stepping-on-fog";
import silentJourney from "@/data/scenario/silent-journey";

const list: {
  [key: string]: { title: string; overview: string; markdown: string };
} = {
  AgnusDeiQuiTollisPeccataMundi: {
    title: "Agnus Dei, qui tollis peccata mundi",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 5 時間程度だろう。  
　舞台は現代の日本。探索者たちが教会へ訪れたときから事件は展開する。  
　なお、あらかじめ探索者同士は知り合いだったほうが、ゲームはスムーズに展開する。`,
    markdown: agnusDeiQuiTollisPeccataMundi,
  },
  BubbleOnWetHands: {
    title: "濡れた手の泡沫",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 5 ～ 6 時間程度だろう。  
　舞台は現代の日本。探索者たちは共通の知人である**沖嶋 深月**の依頼で一人の男性を捜し、海沿いの町へ赴くこととなる。`,
    markdown: bubbleOnWetHands,
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
  DasDornroschenDesWahnsinnigenKonigs: {
    title: "狂気の王の眠り姫",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 3 時間程度だろう。  
　舞台は現代の日本。亡くなった芸術家の屋敷で事件は展開する。`,
    markdown: dasDornroschenDesWahnsinnigenKonigs,
  },
  TheSoundOfSteppingOnFog: {
    title: "霧を踏む音",
    overview: `
　このシナリオは"新クトゥルフ神話TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 4 ～ 5 時間程度だろう。  
　舞台は現代の日本。山間の片田舎で事件は展開する。  
　シナリオの設定上、少なくとも一人の探索者の知人に**笹本 霧江**という大学生がいることとなる。  
　なお、あらかじめ探索者同士は知り合いだったほうが、ゲームはスムーズに展開する。`,
    markdown: theSoundOfSteppingOnFog,
  },
  SilentJourney: {
    title: "Silent Journey",
    overview: `
　このシナリオは"新クトゥルフ神話 TRPG ルールブック"に対応したシナリオで、探索者 3 ～ 5 人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに 3 ～ 4 時間程度だろう。  
　舞台は現代の日本。探索者たちが駅で一人の男性とぶつかるところから事件は展開する。`,
    markdown: silentJourney,
  },
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
