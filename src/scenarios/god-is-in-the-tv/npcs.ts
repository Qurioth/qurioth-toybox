import type { ScenarioNpc } from "@/types/scenario-npc";

/** God is in the TV の NPC・神話生物。NPC カードと CCFOLIA のコマはこのデータから作る */
export const npcs = {
  asuna: {
    name: "喜瀬 明日菜",
    kana: "キセ アスナ",
    portrait: {
      src: "/images/god-is-in-the-tv/asuna.webp",
      face: { x: 49, y: 14, width: 55 },
    },
    skills: [
      { name: "クトゥルフ神話", value: 25 },
      { name: "説得", value: 60 },
      { name: "言いくるめ", value: 65 },
      { name: "心理学", value: 45 },
      { name: "母国語（日本語）", value: 80 },
      { name: "目星", value: 40 },
    ],
    spells: [
      {
        name: "精神的従属(特化型)",
        details: [
          { label: "必要時間", value: "1ラウンド" },
          { label: "コスト", value: "3マジック・ポイントと1D3正気度ポイント" },
          {
            label: "効果",
            value:
              "明日菜がキーザとの交信を通じて教わった特化型の《精神的従属》。対象がキーザの欠片(水晶)を身につけている場合にしか効果を発揮しない。それ以外(対抗POWロールによる成否、示唆の内容による制限、持続時間など)は通常の《精神的従属》に準ずる。",
          },
        ],
      },
      { name: "キーザの招来／退散", source: "基本ルールブック" },
      { name: "夢を送る", source: "グランド・グリモア" },
    ],
    spellNote: "GM が選ぶその他の呪文。",
    stats: [
      {
        abilities: [
          { label: "STR", value: "45" },
          { label: "CON", value: "55" },
          { label: "POW", value: "80" },
          { label: "DEX", value: "55" },
          { label: "APP", value: "70" },
          { label: "SIZ", value: "50" },
          { label: "INT", value: "75" },
          { label: "EDU", value: "70" },
        ],
        derived: [
          { label: "耐久力", value: "11" },
          { label: "マジック・ポイント", value: "16" },
          { label: "正気度", value: "0" },
          { label: "幸運", value: "40" },
          { label: "ダメージ・ボーナス", value: "+0" },
          { label: "ビルド", value: "0" },
          { label: "移動率", value: "8" },
        ],
      },
    ],
  },
  yosuke: {
    name: "未崎 羊介",
    kana: "スエザキ ヨウスケ",
    portrait: {
      src: "/images/god-is-in-the-tv/yosuke.webp",
      face: { x: 46, y: 14, width: 55 },
    },
    stats: [
      {
        abilities: [
          { label: "STR", value: "50" },
          { label: "CON", value: "60" },
          { label: "POW", value: "45" },
          { label: "DEX", value: "55" },
          { label: "APP", value: "55" },
          { label: "SIZ", value: "60" },
          { label: "INT", value: "65" },
          { label: "EDU", value: "65" },
        ],
        derived: [
          { label: "耐久力", value: "12" },
          { label: "マジック・ポイント", value: "9" },
          { label: "正気度", value: "22" },
          { label: "幸運", value: "50" },
          { label: "ダメージ・ボーナス", value: "+0" },
          { label: "ビルド", value: "0" },
          { label: "移動率", value: "8" },
        ],
      },
    ],
  },
  kazuto: {
    name: "長橋 和人",
    kana: "ナガハシ カズト",
    portrait: {
      src: "/images/god-is-in-the-tv/kazuto.webp",
      face: { x: 45, y: 9, width: 48 },
    },
  },
  crystalMan: {
    name: "男 (水晶に蝕まれた者)",
    portrait: {
      src: "/images/god-is-in-the-tv/crystal-man.webp",
      face: { x: 50, y: 13, width: 55 },
    },
    skills: [
      { name: "近接戦闘（結晶化した腕）", value: 45, note: "ダメージ 1D6" },
      { name: "回避", value: 22 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "55" },
          { label: "CON", value: "70" },
          { label: "POW", value: "40" },
          { label: "DEX", value: "45" },
          { label: "SIZ", value: "65" },
        ],
        derived: [
          { label: "耐久力", value: "13" },
          { label: "ダメージ・ボーナス", value: "0" },
          { label: "ビルド", value: "0" },
          { label: "移動", value: "7" },
          { label: "装甲", value: "3(結晶化した右腕のみ)" },
        ],
      },
    ],
  },
  crystalRegular: {
    name: "結晶と化した常連客",
    portrait: {
      src: "/images/god-is-in-the-tv/crystal-regular.webp",
      face: { x: 50, y: 14, width: 55 },
    },
    skills: [
      {
        name: "近接戦闘（結晶化した腕）",
        value: 60,
        note: "ダメージ 1D6+1D6",
      },
      { name: "回避", value: 20 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "100" },
          { label: "CON", value: "80" },
          { label: "POW", value: "30" },
          { label: "DEX", value: "40" },
          { label: "SIZ", value: "60" },
        ],
        derived: [
          { label: "耐久力", value: "14" },
          { label: "マジック・ポイント", value: "6" },
          { label: "ダメージ・ボーナス", value: "+1D6" },
          { label: "ビルド", value: "1" },
          { label: "移動", value: "6" },
          { label: "装甲", value: "8" },
        ],
      },
    ],
  },
  crystalYosuke: {
    name: "未崎 羊介 (結晶と化した姿)",
    kana: "スエザキ ヨウスケ",
    portrait: {
      src: "/images/god-is-in-the-tv/crystal-yosuke.webp",
      face: { x: 42, y: 14, width: 55 },
    },
    skills: [
      {
        name: "近接戦闘（結晶化した腕）",
        value: 60,
        note: "ダメージ 1D6+1D6",
      },
      { name: "回避", value: 20 },
    ],
    stats: [
      {
        abilities: [
          { label: "STR", value: "100" },
          { label: "CON", value: "80" },
          { label: "POW", value: "50" },
          { label: "DEX", value: "40" },
          { label: "SIZ", value: "70" },
        ],
        derived: [
          { label: "耐久力", value: "15" },
          { label: "ダメージ・ボーナス", value: "+1D6" },
          { label: "ビルド", value: "2" },
          { label: "移動", value: "8" },
          { label: "装甲", value: "8" },
        ],
      },
    ],
  },
  qythaz: {
    name: "キーザ",
    kana: "Q'yth-az",
    stats: [
      {
        abilities: [
          { label: "STR", value: "1,000" },
          { label: "CON", value: "475" },
          { label: "POW", value: "125" },
          { label: "DEX", value: "30" },
          { label: "SIZ", value: "575" },
        ],
        derived: [
          { label: "耐久力", value: "105" },
          { label: "マジック・ポイント", value: "25" },
          { label: "ダメージ・ボーナス", value: "+19D6" },
          { label: "ビルド", value: "10" },
          { label: "移動", value: "0（自力での移動はできない）" },
          { label: "装甲", value: "15" },
        ],
      },
    ],
    skills: [
      {
        name: "近接戦闘（触手）",
        value: 80,
        note: "（40／16） ダメージ 9D6+接触（下記参照）",
      },
      {
        name: "押しつぶし〈mnvr〉",
        value: 80,
        note: "（40／16） ダメージ 19D6+接触（下記参照）",
      },
    ],
    spells: [
      { name: "人間をおびき寄せる", source: "マレウス・モンストロルム Vol.2" },
      { name: "犠牲者を魅了する", source: "マレウス・モンストロルム Vol.2" },
      { name: "精神的従属", source: "マレウス・モンストロルム Vol.2" },
      { name: "夢を送る", source: "マレウス・モンストロルム Vol.2" },
    ],
    spellNote: "GM が選ぶその他の呪文。",
  },
} satisfies Record<string, ScenarioNpc>;
