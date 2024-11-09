// import preparation from "@/data/scenario/preparation";
import dasDornroschenDesWahnsinnigenKonigs from "@/data/scenario/das-dornröschen-des-wahnsinnigen-königs";
import theSoundOfSteppingOnFog from "@/data/scenario/the-sound-of-stepping-on-fog";

const list: {
  [key: string]: { title: string; overview: string; markdown: string };
} = {
  // AgnusDeiQuiTollisPeccataMundi: {
  //   title: "Agnus Dei, qui tollis peccata mundi",
  //   overview: ``,
  //   markdown: preparation,
  // },
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
　このシナリオは"新クトゥルフ神話TRPG ルールブック"に対応したシナリオで、探索者3～5人向けにデザインされている。  
　プレイ時間は探索者の作成時間を含まずに4～5時間程度だろう。  
　舞台は現代の日本。山間の片田舎で事件は展開する。  
　シナリオの設定上、少なくとも一人の探索者の知人に「笹本 霧江」という大学生がいることとなる。  
　なお、あらかじめ探索者同士は知り合いだったほうが、ゲームはスムーズに展開する。`,
    markdown: theSoundOfSteppingOnFog,
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
