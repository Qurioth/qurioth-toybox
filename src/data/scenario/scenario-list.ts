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
  ThePrisonerInTheGlassCageDreamsInTheSeaOfStars: {
    system: "クトゥルフ神話TRPG 7版",
    title: "硝子檻の虜囚は星海にて夢を見る",
    titleKana: "がらすかんのりょしゅうはせいかいにてゆめをみる",
    players: {
      min: 3,
      max: 4,
    },
    playTimeHours: {
      min: 4,
      max: 5,
    },
    summary: "現代日本。バーチャルYouTuber天戌 ノアの配信を見ている。",
    markdown: readScenarioMarkdown(
      "the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars.md",
    ),
  },
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
      "現代日本。知人の沖嶋 深月の依頼で一人の男性を捜し、海沿いの町へ赴く。",
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
      "駅がある時代、世界であれば、いつ、どこでも。駅で一人の男性とぶつかることから始まる。",
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
      "現代日本。知人の笹本 霧江の依頼で山間の片田舎を訪れることになる。",
    markdown: readScenarioMarkdown("the-sound-of-stepping-on-fog.md"),
  },
  PalateOfTheCrawling: {
    system: "クトゥルフ神話TRPG 7版",
    title: "蠢く口蓋",
    titleKana: "うごめくこうがい",
    players: {
      min: 3,
      max: 4,
    },
    playTimeHours: {
      min: 3,
      max: 3,
    },
    summary: "現代日本。知人の家を訪れることから始まる。",
    markdown: readScenarioMarkdown("palate-of-the-crawling.md"),
  },
  TheSmileOfTheBangsLessGoddess: {
    system: "クトゥルフ神話TRPG 7版",
    title: "前髪なき女神の微笑み",
    titleKana: "まえがみなきめがみのほほえみ",
    players: {
      min: 2,
      max: 4,
    },
    playTimeHours: {
      min: 3,
      max: 3,
    },
    summary:
      "現代日本。探索者たちは全員知り合いだ。みんなで遠出した後、帰りの高速道路で渋滞に巻き込まれる。",
    markdown: readScenarioMarkdown("the-smile-of-the-bangs-less-goddess.md"),
  },
  Parasite: {
    system: "クトゥルフ神話TRPG 7版",
    title: "パラサイト",
    titleKana: "ぱらさいと",
    players: {
      min: 2,
      max: 4,
    },
    playTimeHours: {
      min: 2,
      max: 3,
    },
    summary: "現代日本。体調不良の知人から連絡があり、尋ねる。",
    markdown: readScenarioMarkdown("parasite.md"),
  },
  ShadowFeather: {
    system: "クトゥルフ神話TRPG 7版",
    title: "影の羽",
    titleKana: "かげのはね",
    players: {
      min: 2,
      max: 3,
    },
    playTimeHours: {
      min: 3,
      max: 3,
    },
    summary: "現代日本。探索者たちはここ数日、悪夢を見続けていた。",
    markdown: readScenarioMarkdown("shadow-feather.md"),
  },
  Nocturne: {
    system: "クトゥルフ神話TRPG 7版",
    title: "夜想曲",
    titleKana: "やそうきょく",
    players: {
      min: 3,
      max: 5,
    },
    playTimeHours: {
      min: 5,
      max: 5,
    },
    summary: "現代日本。知人の誘いに乗ってライブに行くことになる。",
    markdown: readScenarioMarkdown("nocturne.md"),
  },
};

export default list;
