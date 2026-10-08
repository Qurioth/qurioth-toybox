import type { ScenarioNpc } from "@/types/scenario-npc";

/** パラサイト の NPC・神話生物。NPC カードと CCFOLIA のコマはこのデータから作る */
export const npcs = {
  npc1: {
    name: "木古 盛華",
    kana: "キコ セイカ",
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "60",
          },
          {
            label: "CON",
            value: "45",
          },
          {
            label: "POW",
            value: "70",
          },
          {
            label: "DEX",
            value: "40",
          },
          {
            label: "APP",
            value: "70",
          },
          {
            label: "SIZ",
            value: "55",
          },
          {
            label: "INT",
            value: "55",
          },
          {
            label: "EDU",
            value: "75",
          },
        ],
        derived: [],
      },
    ],
  },
  npc2: {
    name: "倪 爺賦",
    kana: "ニイ ユェフ",
    portrait: {
      src: "/images/parasite/yuefu.webp",
      face: { x: 54, y: 10, width: 50 },
    },
    skills: [
      {
        name: "目星",
        value: 0,
      },
      {
        name: "聞き耳",
        value: 99,
      },
      {
        name: "回避",
        value: 25,
      },
      {
        name: "応急手当",
        value: 40,
      },
      {
        name: "信用",
        value: 30,
      },
      {
        name: "言語（日本語）",
        value: 51,
      },
      {
        name: "医学",
        value: 75,
      },
      {
        name: "クトゥルフ神話",
        value: 44,
      },
      {
        name: "科学（薬学）",
        value: 95,
      },
      {
        name: "科学（植物学）",
        value: 65,
      },
      {
        name: "科学（動物学）",
        value: 51,
      },
    ],
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "40",
          },
          {
            label: "CON",
            value: "45",
          },
          {
            label: "POW",
            value: "65",
          },
          {
            label: "DEX",
            value: "50",
          },
          {
            label: "APP",
            value: "45",
          },
          {
            label: "SIZ",
            value: "65",
          },
          {
            label: "INT",
            value: "80",
          },
          {
            label: "EDU",
            value: "93",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "11",
          },
          {
            label: "マジック・ポイント",
            value: "13",
          },
          {
            label: "正気度",
            value: "0",
          },
        ],
      },
    ],
  },
  npc3: {
    name: "叶 美月",
    kana: "イェ メイユェ",
    portrait: {
      src: "/images/parasite/meiyue.webp",
      face: { x: 48, y: 10, width: 52 },
    },
  },
  npc4: {
    name: "枯死したもの",
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "120",
          },
          {
            label: "CON",
            value: "75",
          },
          {
            label: "POW",
            value: "25",
          },
          {
            label: "DEX",
            value: "80",
          },
          {
            label: "SIZ",
            value: "55",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "12",
          },
          {
            label: "マジック・ポイント",
            value: "5",
          },
          {
            label: "ダメージ・ボーナス",
            value: "+1D6",
          },
          {
            label: "攻撃回数",
            value: "1",
          },
        ],
      },
    ],
  },
  npc5: {
    name: "ティンダロスの交雑種",
    skills: [
      {
        name: "近接戦闘",
        value: 50,
        note: "ダメージ: 1D4+DB、さらに青い膿",
      },
      {
        name: "噛みつき",
        value: 50,
        note: "ダメージ: 毎ラウンド 1D4、さらに STR／DEX／CON／APP を 1D10 減少",
      },
      {
        name: "舌",
        value: 60,
        note: "ダメージ: POW 1D10、CON 3D10",
      },
      {
        name: "回避",
        value: 40,
      },
    ],
    stats: [
      {
        abilities: [
          {
            label: "STR",
            value: "105 - 10",
          },
          {
            label: "CON",
            value: "110 - 10",
          },
          {
            label: "POW",
            value: "105",
          },
          {
            label: "DEX",
            value: "90",
          },
          {
            label: "SIZ",
            value: "85",
          },
          {
            label: "INT",
            value: "85",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "19 - 1",
          },
          {
            label: "マジック・ポイント",
            value: "21",
          },
          {
            label: "ダメージ・ボーナス",
            value: "+1D6",
          },
          {
            label: "攻撃回数",
            value: "2",
          },
        ],
      },
    ],
  },
  npc6: {
    name: "膨らんだ女",
    kana: "怪物の姿",
    stats: [
      {
        abilities: [
          {
            label: "POW",
            value: "500",
          },
        ],
        derived: [
          {
            label: "耐久力",
            value: "70",
          },
          {
            label: "マジック・ポイント",
            value: "100",
          },
        ],
      },
    ],
  },
} satisfies Record<string, ScenarioNpc>;
