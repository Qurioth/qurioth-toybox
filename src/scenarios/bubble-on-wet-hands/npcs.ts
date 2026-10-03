import type { ScenarioNpc } from "@/types/scenario-npc";

/** 濡れた手の泡沫 の NPC・神話生物。NPC カードと CCFOLIA のコマはこのデータから作る */
export const npcs = {
  mitsuki: {
    name: "沖嶋 深月",
    kana: "オキシマ ミツキ",
    portrait: {
      src: "/images/bubble-on-wet-hands/mitsuki.webp",
      face: { x: 51, y: 19, width: 49 },
    },
    skills: [
      {
        name: "運転（自動車）",
        value: 50,
      },
      {
        name: "芸術／製作（写真術）",
        value: 65,
      },
      {
        name: "サバイバル（海）",
        value: 40,
      },
      {
        name: "信用",
        value: 15,
      },
      {
        name: "水泳",
        value: 60,
      },
      {
        name: "説得",
        value: 35,
      },
      {
        name: "操縦（船舶）",
        value: 52,
      },
      {
        name: "図書館",
        value: 50,
      },
      {
        name: "ナビゲート",
        value: 30,
      },
      {
        name: "母国語（日本語）",
        value: 65,
      },
      {
        name: "歴史",
        value: 15,
      },
      {
        name: "ダイビング",
        value: 60,
      },
    ],
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "55",
          },
          {
            label: "CON",
            value: "75",
          },
          {
            label: "POW",
            value: "45",
          },
          {
            label: "DEX",
            value: "60",
          },
          {
            label: "APP",
            value: "60",
          },
          {
            label: "SIZ",
            value: "60",
          },
          {
            label: "INT",
            value: "85",
          },
          {
            label: "EDU",
            value: "53",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "13",
          },
          {
            label: "マジック・ポイント",
            value: "9",
          },
          {
            label: "正気度",
            value: "42",
          },
          {
            label: "幸運",
            value: "35",
          },
          {
            label: "ダメージ・ボーナス",
            value: "+0",
          },
          {
            label: "ビルド",
            value: "0",
          },
          {
            label: "移動率",
            value: "8",
          },
        ],
      },
    ],
  },
  kokichi: {
    name: "渡舟 好吉",
    kana: "ワタシブネ コウキチ",
    portrait: {
      src: "/images/bubble-on-wet-hands/kokichi.webp",
      face: { x: 44, y: 19, width: 49 },
    },
    skills: [
      {
        name: "言いくるめ",
        value: 45,
      },
      {
        name: "オカルト",
        value: 75,
      },
      {
        name: "隠密",
        value: 40,
      },
      {
        name: "回避",
        value: 50,
      },
      {
        name: "聞き耳",
        value: 50,
      },
      {
        name: "クトゥルフ神話",
        value: 36,
      },
      {
        name: "芸術／製作（演劇）",
        value: 15,
      },
      {
        name: "信用",
        value: 38,
      },
      {
        name: "心理学",
        value: 60,
      },
      {
        name: "人類学",
        value: 26,
      },
      {
        name: "説得",
        value: 60,
      },
      {
        name: "ほかの言語（英語）",
        value: 61,
      },
      {
        name: "目星",
        value: 45,
      },
    ],
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "30",
          },
          {
            label: "CON",
            value: "65",
          },
          {
            label: "POW",
            value: "70",
          },
          {
            label: "DEX",
            value: "70",
          },
          {
            label: "APP",
            value: "25",
          },
          {
            label: "SIZ",
            value: "55",
          },
          {
            label: "INT",
            value: "45",
          },
          {
            label: "EDU",
            value: "99",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "12",
          },
          {
            label: "マジック・ポイント",
            value: "14",
          },
          {
            label: "正気度",
            value: "0",
          },
          {
            label: "幸運",
            value: "0",
          },
          {
            label: "ダメージ・ボーナス",
            value: "+0",
          },
          {
            label: "ビルド",
            value: "0",
          },
          {
            label: "移動率",
            value: "6",
          },
        ],
      },
    ],
  },
} satisfies Record<string, ScenarioNpc>;
