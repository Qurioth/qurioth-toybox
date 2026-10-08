import type { ScenarioNpc } from "@/types/scenario-npc";

const IMAGE_DIR =
  "/images/the-prisoner-in-the-glass-cage-dreams-in-the-sea-of-stars";

/** 硝子檻の虜囚は星海にて夢を見る の NPC・神話生物。NPC カードと CCFOLIA のコマはこのデータから作る */
export const npcs = {
  noah: {
    name: "天戌 ノア",
    kana: "テンジュツ ノア",
    portrait: {
      src: `${IMAGE_DIR}/noah.webp`,
      face: { x: 49, y: 17, width: 45 },
    },
    skills: [
      { name: "言いくるめ", value: 50 },
      { name: "回避", value: 292 },
      { name: "科学（天文学）", value: 50 },
      { name: "聞き耳", value: 30 },
      { name: "近接戦闘（格闘）", value: 100 },
      { name: "近接戦闘（刀剣）", value: 80 },
      { name: "クトゥルフ神話", value: 7 },
      { name: "芸術／製作（絵画／イラスト）", value: 75 },
      { name: "コンピューター", value: 155 },
      { name: "信用", value: 21 },
      { name: "人類学", value: 24 },
      { name: "図書館", value: 55 },
      { name: "変装", value: 15 },
      { name: "ほかの言語（英語）", value: 40 },
      { name: "ほかの言語（ドイツ語）", value: 40 },
      { name: "目星", value: 55 },
      { name: "歴史", value: 40 },
      { name: "伝承（UFO）", value: 55 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "25" },
          { label: "CON", value: "55" },
          { label: "POW", value: "85" },
          { label: "DEX", value: "55" },
          { label: "APP", value: "90" },
          { label: "SIZ", value: "45" },
          { label: "INT", value: "85" },
          { label: "EDU", value: "85" },
        ],
        derived: [
          { label: "耐久力", value: "10" },
          { label: "マジック・ポイント", value: "17" },
          { label: "正気度", value: "62" },
          { label: "幸運", value: "30" },
          { label: "ダメージ・ボーナス", value: "-1" },
          { label: "ビルド", value: "-1" },
          { label: "移動率", value: "8" },
        ],
      },
    ],
  },
  enri: {
    name: "犬飼 縁理",
    kana: "イヌカイ エンリ",
    portrait: {
      src: `${IMAGE_DIR}/enri.webp`,
      face: { x: 47, y: 13, width: 42 },
    },
    skills: [
      { name: "言いくるめ", value: 50 },
      { name: "科学（天文学）", value: 50 },
      { name: "聞き耳", value: 30 },
      { name: "クトゥルフ神話", value: 7 },
      { name: "芸術／製作（絵画／イラスト）", value: 75 },
      { name: "コンピューター", value: 55 },
      { name: "信用", value: 21 },
      { name: "人類学", value: 24 },
      { name: "図書館", value: 55 },
      { name: "変装", value: 15 },
      { name: "ほかの言語（英語）", value: 40 },
      { name: "ほかの言語（ドイツ語）", value: 40 },
      { name: "目星", value: 55 },
      { name: "歴史", value: 40 },
      { name: "伝承（UFO）", value: 55 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "25" },
          { label: "CON", value: "55" },
          { label: "POW", value: "85" },
          { label: "DEX", value: "55" },
          { label: "APP", value: "30" },
          { label: "SIZ", value: "85" },
          { label: "INT", value: "85" },
          { label: "EDU", value: "85" },
        ],
        derived: [
          { label: "耐久力", value: "14" },
          { label: "マジック・ポイント", value: "17" },
          { label: "正気度", value: "62" },
          { label: "幸運", value: "30" },
          { label: "ダメージ・ボーナス", value: "+0" },
          { label: "ビルド", value: "0" },
          { label: "移動率", value: "7" },
        ],
      },
    ],
  },
  stationGuard: {
    name: "保護プログラム (檻ヶ谷駅)",
    skills: [
      { name: "警棒", value: 150, note: "ダメージ 1D8+1D6" },
      { name: "回避", value: 100 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "120" },
          { label: "CON", value: "95" },
          { label: "DEX", value: "55" },
          { label: "SIZ", value: "45" },
        ],
        derived: [
          { label: "耐久力", value: "14" },
          { label: "ダメージ・ボーナス", value: "+1D6" },
          { label: "ビルド", value: "2" },
          { label: "装甲", value: "なし" },
          { label: "攻撃回数", value: "1" },
        ],
      },
    ],
  },
  security: {
    name: "セキュリティスタッフ",
    portrait: {
      src: `${IMAGE_DIR}/security.webp`,
      face: { x: 50, y: 13, width: 30 },
    },
    skills: [
      { name: "警棒", value: 90, note: "ダメージ 1D8+1D4" },
      { name: "回避", value: 25 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "70" },
          { label: "CON", value: "50" },
          { label: "DEX", value: "50" },
          { label: "SIZ", value: "70" },
        ],
        derived: [
          { label: "耐久力", value: "12" },
          { label: "ダメージ・ボーナス", value: "+1D4" },
          { label: "ビルド", value: "1" },
          { label: "装甲", value: "なし" },
          { label: "攻撃回数", value: "1" },
        ],
      },
    ],
  },
  employees: {
    name: "社員プログラム群衆",
    portrait: {
      src: `${IMAGE_DIR}/mob.webp`,
      face: { x: 50, y: 20, width: 40 },
    },
    skills: [
      { name: "妨害", value: 60, note: "ダメージ なし" },
      { name: "回避", value: 20 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "40 × 人数" },
          { label: "CON", value: "50" },
          { label: "DEX", value: "40" },
          { label: "SIZ", value: "40 × 人数" },
        ],
        derived: [
          { label: "耐久力", value: "人数" },
          { label: "ダメージ・ボーナス", value: "0" },
          { label: "ビルド", value: "0" },
          { label: "装甲", value: "なし" },
          { label: "攻撃回数", value: "1" },
        ],
      },
    ],
  },
  b1Guard: {
    name: "保護プログラム (地下1階)",
    portrait: {
      src: `${IMAGE_DIR}/black-robed-noah-1.webp`,
      alt: "保護プログラム (黒衣のノア)",
      face: { x: 46, y: 12, width: 36 },
    },
    skills: [
      { name: "警棒", value: 180, note: "ダメージ 1D8+1D6" },
      {
        name: "デザートイーグル",
        value: 100,
        note: "ダメージ 1D10+1D6+3 装弾数 7",
      },
      { name: "回避", value: 120 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "120" },
          { label: "CON", value: "155" },
          { label: "DEX", value: "55" },
          { label: "SIZ", value: "45" },
        ],
        derived: [
          { label: "耐久力", value: "20" },
          { label: "ダメージ・ボーナス", value: "+1D6" },
          { label: "ビルド", value: "2" },
          { label: "装甲", value: "2" },
          { label: "攻撃回数", value: "1" },
        ],
      },
    ],
  },
  b3Guard: {
    name: "保護プログラム (地下3階)",
    portrait: {
      src: `${IMAGE_DIR}/black-robed-noah-2.webp`,
      alt: "保護プログラム (黒衣のノア・地下3階)",
      face: { x: 49, y: 14, width: 36 },
    },
    skills: [
      { name: "警棒", value: 300, note: "ダメージ 1D8+1D6" },
      { name: "デザートイーグル", value: 100, note: "ダメージ 1D10+1D6+3" },
      { name: "回避", value: 200 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "120" },
          { label: "CON", value: "305" },
          { label: "DEX", value: "70" },
          { label: "SIZ", value: "45" },
        ],
        derived: [
          { label: "耐久力", value: "35" },
          { label: "ダメージ・ボーナス", value: "+1D6" },
          { label: "ビルド", value: "2" },
          { label: "装甲", value: "4" },
          { label: "攻撃回数", value: "2" },
        ],
      },
    ],
  },
  serverCore: {
    name: "サーバーコア",
    skills: [{ name: "防壁", value: 150 }],
    stats: [
      {
        abilities: [],
        derived: [
          { label: "耐久力", value: "60" },
          { label: "装甲", value: "4" },
        ],
      },
    ],
  },
  migo: {
    name: "ミ＝ゴ",
    skills: [
      { name: "かぎ爪", value: 30, note: "ダメージ 1D6" },
      { name: "回避", value: 30 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "55" },
          { label: "CON", value: "50" },
          { label: "DEX", value: "55" },
          { label: "SIZ", value: "50" },
        ],
        derived: [
          { label: "耐久力", value: "10" },
          { label: "ダメージ・ボーナス", value: "+0" },
          { label: "ビルド", value: "0" },
          { label: "装甲", value: "なし" },
          { label: "攻撃回数", value: "2" },
        ],
      },
    ],
  },
} satisfies Record<string, ScenarioNpc>;
