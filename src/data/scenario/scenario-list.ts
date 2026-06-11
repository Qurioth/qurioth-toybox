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

type Scenario = {
  title: string;
  titleKana: string;
  system: string;
  players: {
    min: number;
    max: number;
  };
  playTimeHours: {
    min: number;
    max: number;
  };
  summary: string;
  markdown: string;
};

const list: {
  [key: string]: Scenario;
} = {
  //   ThePrisonerInTheGlassCageDreamsInTheSeaOfStars: {
  //     title: "硝子檻の虜囚は星海にて夢を見る",
  //     markdown: readScenarioMarkdown(
  //       "the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars.md",
  //     ),
  //   },
  BubbleOnWetHands: {
    system: "クトゥルフ神話TRPG 7版",
    title: "濡れた手の泡沫",
    titleKana: "ぬれたてのほうまつ",
    players: {
      min: 3,
      max: 5,
    },
    playTimeHours: {
      min: 5,
      max: 6,
    },
    summary:
      "現代日本。探索者たちは知人の沖嶋 深月の依頼で一人の男性を捜し、海沿いの町へ赴く。",
    markdown: readScenarioMarkdown("bubble-on-wet-hands.md"),
  },
  SilentJourney: {
    system: "クトゥルフ神話TRPG 7版",
    title: "Silent Journey",
    titleKana: "さいれんとじゃーにー",
    players: {
      min: 3,
      max: 4,
    },
    playTimeHours: {
      min: 3,
      max: 4,
    },
    summary:
      "駅がある時代、世界であれば、いつ、どこでも。探索者たちは駅で一人の男性とぶつかる。",
    markdown: readScenarioMarkdown("silent-journey.md"),
  },
  AgnusDeiQuiTollisPeccataMundi: {
    system: "クトゥルフ神話TRPG 7版",
    title: "Agnus Dei, qui tollis peccata mundi",
    titleKana: "あにゅすでいくいとりすぺっかーたむんでぃ",
    players: {
      min: 3,
      max: 5,
    },
    playTimeHours: {
      min: 6,
      max: 6,
    },
    summary: "現代日本。とある教会と併設する孤児院で事件は展開する。",
    markdown: readScenarioMarkdown("agnus-dei-qui-tollis-peccata-mundi.md"),
  },
  DasDornroschenDesWahnsinnigenKonigs: {
    system: "クトゥルフ神話TRPG 7版",
    title: "狂気の王の眠り姫",
    titleKana: "きょうきのおうのねむりひめ",
    players: {
      min: 3,
      max: 4,
    },
    playTimeHours: {
      min: 4,
      max: 4,
    },
    summary: "現代日本。亡くなった芸術家の屋敷を訪れることになる。",
    markdown: readScenarioMarkdown(
      "das-dornröschen-des-wahnsinnigen-königs.md",
    ),
  },
  TheSoundOfSteppingOnFog: {
    system: "クトゥルフ神話TRPG 7版",
    title: "霧を踏む音",
    titleKana: "きりをふむおと",
    players: {
      min: 3,
      max: 5,
    },
    playTimeHours: {
      min: 5,
      max: 5,
    },
    summary:
      "現代日本。探索者たちは知人の笹本 霧江の依頼で山間の片田舎を訪れることになる。",
    markdown: readScenarioMarkdown("the-sound-of-stepping-on-fog.md"),
  },
  // PalateOfTheCrawling: {
  //   title: "蠢く口蓋",
  //   markdown: preparation,
  // },
  // ShadowFeather: {
  //   title: "影の羽",
  //   markdown: preparation,
  // },
  // LieDownOnBambooLeaves: {
  //   title: "竹の葉に寝転ぶ",
  //   markdown: preparation,
  // },
  // Nocturne: {
  //   title: "夜想曲",
  //   markdown: preparation,
  // },
  // Parasite: {
  //   title: "パラサイト",
  //   markdown: preparation,
  // },
  // TheSmileOfTheBangsLessGoddess: {
  //   title: "前髪なき女神の微笑み",
  //   markdown: preparation,
  // },
};

export default list;
