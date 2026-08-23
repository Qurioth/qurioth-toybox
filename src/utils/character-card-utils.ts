import type { Investigator as Investigator6th } from "@/types/Charaeno6th";
import type { Investigator as Investigator7th } from "@/types/Charaeno7th";
import type {
  CardSection,
  CharacterCardData,
  CharacteristicPoint,
  SkillRow,
} from "@/types/CharacterCard";

const CHARACTERISTICS_KEYS = [
  "str",
  "con",
  "pow",
  "dex",
  "app",
  "siz",
  "int",
  "edu",
] as const;

type CharacteristicsKey = (typeof CHARACTERISTICS_KEYS)[number];

type Characteristics = Record<CharacteristicsKey, number>;

/** 7版の能力値はパーセンタイルなので、8つとも上限は100。 */
const CAPS_7TH: Characteristics = {
  str: 100,
  con: 100,
  pow: 100,
  dex: 100,
  app: 100,
  siz: 100,
  int: 100,
  edu: 100,
};

/**
 * 6版の能力値はロール値(3D6 や 2D6+6)なので上限は18。EDUだけは 3D6+3 で
 * 決まるため21まで伸びる。
 */
const CAPS_6TH: Characteristics = {
  str: 18,
  con: 18,
  pow: 18,
  dex: 18,
  app: 18,
  siz: 18,
  int: 18,
  edu: 21,
};

/** 7版のバックストーリーの見出し。APIは並び順で返すため、順序に対して当てる。 */
const BACKSTORY_LABELS = [
  "容姿の描写",
  "イデオロギー／信念",
  "重要な人々",
  "意味のある場所",
  "秘蔵の品",
  "特徴",
  "負傷、傷跡",
  "恐怖症、マニア",
  "魔道書、呪文、アーティファクト",
  "遭遇した超自然の存在",
];

/**
 * 能力値を「その版・その能力値の上限に対する割合(0〜100)」へ直す。
 *
 * recharts の RadarChart は半径軸(PolarRadiusAxis)を1本しか持てず、能力値ごとに上限を
 * 変えられない。7版はパーセンタイル(上限100)、6版はロール値(EDUのみ21、他は18)と尺度が
 * 違うので、軸の目盛りを 0〜100 に固定したまま値の側を割合へ直して違いを吸収する。
 * チャートには Tooltip も Legend も出さず、半径の目盛りも消しているため、正規化した値が
 * 利用者に数値として見えることはない。
 *
 * 上限を超える値(6版で成長したEDUなど)は100で止める。枠外へはみ出すと、他の能力値との
 * 高低の比較が読めなくなるため。
 */
const toCharacteristicPoints = (
  characteristics: Characteristics,
  caps: Characteristics,
): Array<CharacteristicPoint> =>
  // 並び順はここで固定する。Object.keys ではAPIのJSONのキー順に依存してしまう。
  CHARACTERISTICS_KEYS.map((key) => ({
    subject: key.toUpperCase(),
    value: Math.min(100, Math.round((characteristics[key] / caps[key]) * 100)),
  }));

/** 既定値から変更された技能だけを、レスポンスの順序のまま残す */
const toSkillRows = (
  skills: Array<{ name: string; value: number; edited: boolean }>,
): Array<SkillRow> =>
  skills
    .filter((skill) => skill.edited)
    .map((skill) => ({ name: skill.name, value: skill.value }));

/** 自由記述を空行で段落に割る。空の段落は落とす */
const toParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");

/** 自由記述の項目をセクションにする。中身が空になった項目は見出しごと落とす */
const toTextSections = (
  entries: ReadonlyArray<{ heading: string; text: string }>,
): Array<CardSection> =>
  entries
    .map((entry) => ({
      heading: entry.heading,
      kind: "text" as const,
      blocks: toParagraphs(entry.text),
    }))
    .filter((section) => section.blocks.length > 0);

/** 7版のバックストーリーをセクションにする。記入の無い項目は見出しごと落とす */
const toBackstorySections = (
  backstory: Investigator7th["backstory"],
): Array<CardSection> =>
  backstory
    .map((entry, index) => ({
      heading: BACKSTORY_LABELS[index] || entry.name,
      kind: "list" as const,
      blocks: entry.entries
        .map((backstoryEntry) => backstoryEntry.text)
        .filter((text) => text.trim() !== ""),
    }))
    .filter((section) => section.blocks.length > 0);

/** 7版のキャラクターシートをカードの描画用データへ変換する */
export const toCardDataFrom7th = (
  investigator: Investigator7th,
): CharacterCardData => ({
  name: investigator.name,
  portraitURL: investigator.portraitURL,
  characteristics: toCharacteristicPoints(
    investigator.characteristics,
    CAPS_7TH,
  ),
  attributes: [
    { label: "HP", value: investigator.attribute.hp },
    { label: "MP", value: investigator.attribute.mp },
    { label: "SAN", value: investigator.attribute.san.value },
    { label: "幸運", value: investigator.attribute.luck },
  ],
  skills: toSkillRows(investigator.skills),
  sections: [
    ...toBackstorySections(investigator.backstory),
    ...toTextSections([{ heading: "メモ", text: investigator.note }]),
  ],
});

/** 6版のキャラクターシートをカードの描画用データへ変換する */
export const toCardDataFrom6th = (
  investigator: Investigator6th,
): CharacterCardData => ({
  name: investigator.name,
  portraitURL: investigator.portraitURL,
  characteristics: toCharacteristicPoints(
    investigator.characteristics,
    CAPS_6TH,
  ),
  // 6版では幸運の代わりにダメージ・ボーナスを出す。レスポンスに幸運が入っていることが
  // あるが、カードには載せない
  attributes: [
    { label: "HP", value: investigator.attribute.hp },
    { label: "MP", value: investigator.attribute.mp },
    { label: "SAN", value: investigator.attribute.san.value },
    { label: "DB", value: investigator.attribute.db },
  ],
  skills: toSkillRows(investigator.skills),
  // 6版にバックストーリーは無い。裏面に出すのはこの4項目だけで、住所・描写・家族＆友人・
  // 狂気の症状・負傷・傷跡・遭遇した超自然の存在・所持品・財産などは載せない
  sections: toTextSections([
    { heading: "精神的な障害", text: investigator.mentalDisorder },
    { heading: "読んだクトゥルフ神話の魔導書", text: investigator.mythosTomes },
    {
      heading: "アーティファクト／学んだ呪文",
      text: investigator.artifactsAndSpells,
    },
    { heading: "メモ", text: investigator.note },
  ]),
});
