/**
 * CharacterCard が描くために必要な情報だけを持つ、版に依存しない形。
 *
 * クトゥルフ神話TRPGの6版と7版ではキャラクターシートの形が違う(能力値の尺度、
 * カードに載せられる項目)。その違いは `character-card-utils` でこの形へ合流させ、
 * カード側は版を知らないままにする。
 */
export interface CharacterCardData {
  name: string; // 括弧書き(ふりがな等)を落とした表示名
  portraitURL?: string; // 無ければカード側が既定の人物アイコンを出す
  characteristics: Array<CharacteristicPoint>; // 常に8点、順序固定
  attributes: Array<AttributeTile>; // 版によらず4つ(4枠目が幸運かDBかで違う)
  skills: Array<SkillRow>; // 既定値から変更された技能のみ
  sections: Array<CardSection>; // 裏面の設定欄。空の項目は含まない
}

export interface CharacteristicPoint {
  subject: string; // "STR" など大文字の能力値名
  value: number; // その版・その能力値の上限に対する割合(0〜100)
}

export interface AttributeTile {
  label: string; // "HP" / "MP" / "SAN" / "幸運" / "DB"
  /** ダメージ・ボーナスは "+0" や "+1D4" のような文字列になるため数値に限らない */
  value: number | string;
}

export interface SkillRow {
  name: string;
  value: number; // 技能の合計値(生の値)
}

export interface CardSection {
  heading: string;
  /** list: 記入欄が並ぶ項目を箇条書きに / text: 自由記述を段落に */
  kind: "list" | "text";
  /** list なら1要素が1項目、text なら1要素が1段落 */
  blocks: Array<string>;
}
