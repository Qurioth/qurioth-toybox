/** 能力値・副次ステータスの 1 項目。値は文字列のまま持つ(`105 - 10` なども可) */
export type StatEntry = { label: string; value: string };

/** ステータス 1 組。複数の姿を持つ存在は姿ごとに分ける */
export type NpcStatBlock = {
  /** 姿の名前など。例: "怪物の姿" */
  label?: string;
  /** STR・CON・POW・DEX・APP・SIZ・INT・EDU のうち持つもの。規約の順 */
  abilities: StatEntry[];
  /** 耐久力・マジック・ポイント・正気度・ダメージ・ボーナス など */
  derived: StatEntry[];
};

export type NpcSkill = {
  /** 例: "目星"、"運転（自動車）" */
  name: string;
  value: number;
  /** 値の後ろの補足。例: "ダメージ 1D3+DB" */
  note?: string;
};

/** 立ち絵。カードには顔の辺りを丸く切り抜いたアイコンを出し、選ぶと全体を開く */
export type NpcPortrait = {
  src: string;
  alt?: string;
  /**
   * アイコンに映す範囲を変えたいときに書く。x・y は顔の中心の位置、width はアイコンに収める幅で、
   * どれも画像に対する %(省略した項目は x: 50, y: 20, width: 100)。
   * face 自体を省略すると、画像の幅いっぱいを映して上から少し下を見せる(全身の立ち絵なら頭から胸元)
   */
  face?: { x?: number; y?: number; width?: number };
};

/**
 * 専用ページの NPC・神話生物 1 体分のデータ。NPC カードの表示と CCFOLIA のコマは
 * このデータから作る(specs/005-scenario/data-model.md)
 */
export type ScenarioNpc = {
  name: string;
  /** 見出しの補足(読み仮名など)。コマのメモにも使う */
  kana?: string;
  portrait?: NpcPortrait;
  stats?: NpcStatBlock[];
  skills?: NpcSkill[];
};
