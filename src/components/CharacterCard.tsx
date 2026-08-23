"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { Investigator } from "@/types/Charaeno7th";
import humanIcon from "@/image/human-icon.png";
import { cn } from "@/utils/class-utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { type KeyboardEvent, useState } from "react";

const CharacteristicsRadarChart = dynamic(
  () => import("@/components/recharts/CharacteristicsRadarChart"),
  {
    ssr: false,
  },
);

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

const backstoryLabels = [
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

const fullWidthNameCharacterPattern =
  /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff01-\uff60\uffe0-\uffe6]/;

const getNameTextSizeClass = (name: string) => {
  const fullWidthLength = Array.from(name).filter((character) =>
    fullWidthNameCharacterPattern.test(character),
  ).length;

  if (fullWidthLength >= 16) {
    return "text-2xl";
  }

  if (fullWidthLength >= 12) {
    return "text-3xl";
  }

  return "text-4xl";
};

const getNoteParagraphs = (note: string) =>
  note
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");

const CharacterCard = (props: { data: Investigator }) => {
  const data = props.data;
  // Tailwind の md ブレークポイントと揃える。カード自体はCSSで出し分けている
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [reverse, setReverse] = useState(false);
  const [classChanging, setClassChanging] = useState(false);
  const nameTextSizeClass = getNameTextSizeClass(data.name);
  const noteParagraphs = getNoteParagraphs(data.note);
  const backstories = data.backstory
    .map((backstory, index) => ({
      ...backstory,
      name: backstoryLabels[index] || backstory.name,
      entries: backstory.entries.filter(
        (entry) => entry.text.trim() !== "" && entry.text.length > 0,
      ),
    }))
    .filter((backstory) => backstory.entries.length > 0);
  const editedSkills = data.skills.filter((skill) => skill.edited);
  const attributes = [
    { label: "HP", value: data.attribute.hp },
    { label: "MP", value: data.attribute.mp },
    { label: "SAN", value: data.attribute.san.value },
    { label: "幸運", value: data.attribute.luck },
  ];

  // レーダーチャートの軸。Object.keys ではAPIのJSONのキー順に依存してしまうため、
  // 表示順をここで固定する。
  const characteristics = CHARACTERISTICS_KEYS.map((key) => ({
    subject: key.toUpperCase(),
    characteristics: data.characteristics[key],
    fullMark: 100,
  }));

  const renderName = () => (
    <div
      className={`h-12 overflow-hidden text-ellipsis whitespace-nowrap font-serif ${nameTextSizeClass} font-semibold italic leading-tight mt-2 ml-2`}
    >
      {data.name}
    </div>
  );

  const renderPortrait = (heightClass: string) => (
    <div className="w-auto grid grid-cols-1 justify-items-center content-center">
      {data.portraitURL ? (
        // biome-ignore lint/performance/noImgElement: external portrait URL, domain unknown at build time
        <img
          className={`object-contain ${heightClass} max-w-full animate-in fade-in duration-1000`}
          src={data.portraitURL || "/image/human_icon.png"}
          alt="portrait"
        />
      ) : (
        <Image
          className={`object-contain ${heightClass} max-w-full animate-in fade-in duration-1000`}
          src={humanIcon}
          alt="portrait"
          width={500}
          height={500}
        />
      )}
    </div>
  );

  // チャートは実際に画面に出ているものだけマウントする。隠れた状態でマウントすると
  // recharts が 0x0 のコンテナを測って警告を出し、描画されない ResponsiveContainer と
  // ResizeObserver だけが残る。カードが隠れる条件は次の2つで、両方を見る必要がある。
  //   1. md 未満/以上でのデスクトップ用・モバイル用カードの出し分け
  //   2. デスクトップ用カードの表裏(裏面では表面が display:none になる)
  const isDesktopChartVisible = isDesktop && !reverse;
  const isMobileChartVisible = !isDesktop;

  /**
   * 枠は常に描画し、チャート本体は表示中のときだけマウントする。
   * 枠を残すのは、マウントの有無で高さが変わらないようにするため。
   */
  const renderRadarChart = (isVisible: boolean) => (
    <div className="flex flex-row w-full h-72 justify-center content-center">
      {isVisible && (
        <CharacteristicsRadarChart
          name={data.name}
          dataKey={"characteristics"}
          data={characteristics}
        />
      )}
    </div>
  );

  const renderAttributeCards = () => (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {attributes.map((attribute) => (
        <div
          key={`${data.name}-${attribute.label}`}
          className="shadow-md divide-y divide-slate-700 p-2 dark:bg-slate-200 rounded border-2 border-purple-50 dark:text-slate-900"
        >
          <div className="flex justify-center font-semibold pb-2">
            {attribute.label}
          </div>
          <div className="flex justify-center font-semibold pt-2">
            {attribute.value}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillTable = () => (
    <table className="w-full border-separate border border-slate-500">
      <tbody>
        {editedSkills.map((skill) => (
          <tr key={`${data.name}-skill-${skill.name}`}>
            <td className="w-5/6 border border-slate-600 font-serif font-semibold">
              {skill.name}
            </td>
            <td className="w-1/6 border border-slate-600 font-mono font-semibold text-center">
              {skill.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderBackstoriesAndNotes = () => (
    <div className="m-2">
      {backstories.length > 0 &&
        backstories.map((backstory, backstoryIndex) => (
          <section
            key={`${data.name}-backstory-${backstory.name}`}
            className="mb-3"
          >
            <h3 className="font-serif font-semibold">{backstory.name}</h3>
            <div className="pl-5">
              <ul className="list-disc pl-5">
                {backstory.entries.map((entry, entryIndex) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: entries have no natural id, list order is static
                    key={`${data.name}-backstory-${backstoryIndex}-${entryIndex}`}
                  >
                    {entry.text.split("\n").map((line, lineIndex) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: text lines have no natural id, list order is static
                        key={`${data.name}-backstory-${backstoryIndex}-${entryIndex}-${lineIndex}`}
                      >
                        {line}
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      {noteParagraphs.length > 0 && (
        <div className="mt-4">
          <h3 className="font-serif font-semibold">メモ</h3>
          <div className="pl-5">
            {noteParagraphs.map((paragraph, index) => (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs have no natural id, list order is static
                key={`${data.name}-note-${index}`}
                className="mb-3 whitespace-pre-line last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const flipCard = async () => {
    setClassChanging(true);
    await new Promise((resolve) => setTimeout(resolve, 880));
    setReverse(!reverse);
    setClassChanging(false);
  };

  // md未満では表裏の区別がなく、6要素すべてを縦に並べる。
  // md以上でだけ、表(レーダー・能力値・立ち絵)と裏(技能表・バックストーリー)を切り替える。
  const hiddenOnBack = reverse ? "md:hidden" : undefined;
  const hiddenOnFront = reverse ? undefined : "md:hidden";

  // 反転はデスクトップだけの操作。モバイルでは押しても意味がないので、
  // ボタンとしてのロールもキーボード操作も付けない。
  const flipProps = isDesktop
    ? {
        role: "button",
        tabIndex: 0,
        onClick: flipCard,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            flipCard();
          }
        },
      }
    : {};

  return (
    // 反転する要素を実際の <button> にすると animate-rotate-y の3D描画が
    // Chromium で壊れるため、role で代用している(キーボード操作は flipProps で補う)
    <section
      {...flipProps}
      className={cn(
        "shadow-md bg-slate-50 dark:bg-slate-800 rounded border-2 border-purple-50",
        "md:max-w-[858px] md:h-[452px]",
        classChanging && "animate-rotate-y",
      )}
    >
      {!classChanging && (
        // md以上では2カラム。左に名前と表裏の主内容、右に立ち絵かバックストーリーを置く。
        // 配置を md:col-start / md:row-start で明示しているのは、DOM順をモバイルの
        // 表示順(名前→立ち絵→レーダー→能力値→技能表→背景)に合わせているため。
        <div className="animate-fade grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div className="md:col-start-1 md:row-start-1">{renderName()}</div>

          <div
            className={cn(
              "flex min-h-[320px] items-end justify-center px-2",
              "md:col-start-2 md:row-start-1 md:row-span-2 md:min-h-0 md:items-center md:px-0",
              hiddenOnBack,
            )}
          >
            {renderPortrait("h-[320px] md:h-[440px]")}
          </div>

          <div
            className={cn(
              "m-2 md:col-start-1 md:row-start-2 md:h-96",
              hiddenOnBack,
            )}
          >
            {renderRadarChart(isDesktopChartVisible || isMobileChartVisible)}
            {renderAttributeCards()}
          </div>

          <div
            className={cn(
              "m-2 md:col-start-1 md:row-start-2 md:h-96 md:p-2",
              hiddenOnFront,
            )}
          >
            <div className="md:scrollbar-thin md:h-full md:overflow-y-auto">
              {renderSkillTable()}
            </div>
          </div>

          <div
            className={cn(
              "m-2 overflow-x-hidden",
              "md:col-start-2 md:row-start-1 md:row-span-2 md:scrollbar-thin md:h-[434px] md:overflow-y-auto",
              hiddenOnFront,
            )}
          >
            {renderBackstoriesAndNotes()}
          </div>
        </div>
      )}
    </section>
  );
};

export default CharacterCard;
