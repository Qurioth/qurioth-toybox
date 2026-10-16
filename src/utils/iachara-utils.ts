/**
 * いあきゃら(https://iachara.com)の「テキスト出力」で書き出した7版のキャラクターシートを、
 * カードの描画に必要な分だけ取り出す。
 *
 * テキストは人が読むための整形済みの出力で、機械向けの形式ではない。そのため
 * 「【見出し】で区切られたセクション」「列を空白で揃えた表」という見た目の規則に頼って読む。
 */

/** 先頭行。版はここで判定し、7版以外は受け付けない */
const HEADER_PATTERN = /^いあきゃらテキスト\s*7版/;

/**
 * セクションの見出し。メモ欄の本文にも「【スペック】」のような行が現れうるため、
 * いあきゃらが出力する見出しだけを区切りとして扱う。
 */
const SECTION_NAMES = [
  "基本情報",
  "アイコン",
  "能力値",
  "技能値",
  "武器",
  "装備と所持品",
  "収入と財産",
  "バックストーリー",
  "通過したシナリオ名",
  "メモ",
] as const;

type SectionName = (typeof SECTION_NAMES)[number];

const CHARACTERISTICS_ROWS = {
  STR: "str",
  CON: "con",
  POW: "pow",
  DEX: "dex",
  APP: "app",
  SIZ: "siz",
  INT: "int",
  EDU: "edu",
} as const;

type CharacteristicsKey =
  (typeof CHARACTERISTICS_ROWS)[keyof typeof CHARACTERISTICS_ROWS];

/** いあきゃらテキストから読み取った、カードの描画に必要な情報 */
export interface IacharaInvestigator {
  name: string; // シートに書かれたままの名前(括弧書きを含む)
  portraitURL?: string;
  characteristics: Record<CharacteristicsKey, number>; // 各能力値の現在値
  attribute: {
    hp: number;
    mp: number;
    san: number; // 現在の正気度
    luck: number;
  };
  skills: Array<{ name: string; value: number; edited: boolean }>;
  backstory: Array<{ heading: string; text: string }>;
  note: string;
}

/** 見出しごとに本文の行を束ねる。最初の見出しより前の行(先頭行)は捨てる */
const splitSections = (lines: ReadonlyArray<string>) => {
  const sections = new Map<SectionName, Array<string>>();
  let current: Array<string> | undefined;

  for (const line of lines) {
    const heading = /^【(.+)】\s*$/.exec(line)?.[1];

    // メモは最後のセクションで、本文に【】の行を含みうる。以降はすべてメモの本文とする
    if (
      !sections.has("メモ") &&
      SECTION_NAMES.includes(heading as SectionName)
    ) {
      current = [];
      sections.set(heading as SectionName, current);
      continue;
    }

    current?.push(line);
  }

  return sections;
};

/** 能力値の表。「STR  65  65  0  0」のように、名前の後に現在値・能力値・増加分・一時的が並ぶ */
const toCharacteristicsTable = (lines: ReadonlyArray<string>) => {
  const table = new Map<string, number>();

  for (const line of lines) {
    const matched = /^(\S+)\s+(-?\d+)(?:\s+-?\d+){3}\s*$/.exec(line.trim());

    if (matched) {
      table.set(matched[1], Number(matched[2]));
    }
  }

  return table;
};

/**
 * 技能の表。「回避  75  20  45  0  10  0」のように、名前の後に合計・初期値・職業P・興味P・
 * 成長分・その他の6列が並ぶ。技能名には空白や数字が入りうるので、末尾の6列から読む。
 */
const toSkills = (lines: ReadonlyArray<string>) =>
  lines.flatMap((line) => {
    const matched = /^(.+?)\s+(-?\d+)\s+(-?\d+)(?:\s+-?\d+){4}\s*$/.exec(
      line.trim(),
    );

    if (!matched) {
      return [];
    }

    const value = Number(matched[2]);

    // Charaeno と同じく、合計が初期値と異なる技能を「編集された」ものとする
    return [{ name: matched[1], value, edited: value !== Number(matched[3]) }];
  });

/** バックストーリーは「[容姿の描写]」のような小見出しの後に自由記述が続く */
const toBackstory = (lines: ReadonlyArray<string>) => {
  const backstory: Array<{ heading: string; lines: Array<string> }> = [];

  for (const line of lines) {
    const heading = /^\[(.+)\]\s*$/.exec(line)?.[1];

    if (heading) {
      backstory.push({ heading, lines: [] });
      continue;
    }

    backstory.at(-1)?.lines.push(line);
  }

  return backstory.map((entry) => ({
    heading: entry.heading,
    text: entry.lines.join("\n").trim(),
  }));
};

/**
 * いあきゃらの7版のテキストを読む。7版のテキストでない場合や、カードの描画に必要な
 * 項目(名前・8つの能力値・HP・MP・幸運)が読み取れない場合は undefined。
 */
export const parseIacharaText = (
  text: string,
): IacharaInvestigator | undefined => {
  const lines = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");

  if (!HEADER_PATTERN.test(lines[0] ?? "")) {
    return undefined;
  }

  const sections = splitSections(lines);
  const basics = sections.get("基本情報") ?? [];
  const name = basics
    .map((line) => /^名前:\s*(.*)$/.exec(line)?.[1])
    .find((value) => value !== undefined)
    ?.trim();

  const parameterLines = sections.get("能力値") ?? [];
  const table = toCharacteristicsTable(parameterLines);
  const characteristics = Object.fromEntries(
    Object.entries(CHARACTERISTICS_ROWS).map(([row, key]) => [
      key,
      table.get(row),
    ]),
  ) as Record<CharacteristicsKey, number | undefined>;
  const hp = table.get("HP");
  const mp = table.get("MP");
  const luck = table.get("幸運");

  // 表の「正気度」は能力値としての値(初期値)。成長や減少を反映した現在値は、表の下の
  // 「正気度 64 / 88」(現在値 / 最大値)の行にあるため、そちらを優先する
  const currentSan = parameterLines
    .map((line) => /^正気度\s+(-?\d+)\s*\/\s*-?\d+\s*$/.exec(line.trim())?.[1])
    .find((value) => value !== undefined);
  const san =
    currentSan !== undefined ? Number(currentSan) : table.get("正気度");

  if (
    !name ||
    Object.values(characteristics).some((value) => value === undefined) ||
    hp === undefined ||
    mp === undefined ||
    san === undefined ||
    luck === undefined
  ) {
    return undefined;
  }

  // 「:https://...」のように前に注記が付くことがあるため、URLの部分だけを取る
  const portraitURL = (sections.get("アイコン") ?? [])
    .map((line) => /https?:\/\/\S+/.exec(line)?.[0])
    .find((url) => url !== undefined);

  return {
    name,
    portraitURL,
    characteristics: characteristics as Record<CharacteristicsKey, number>,
    attribute: { hp, mp, san, luck },
    skills: toSkills(sections.get("技能値") ?? []),
    backstory: toBackstory(sections.get("バックストーリー") ?? []),
    note: (sections.get("メモ") ?? []).join("\n").trim(),
  };
};
