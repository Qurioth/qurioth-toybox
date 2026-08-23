"use client";

import type { Investigator } from "@/types/Charaeno7th";
import humanIcon from "@/image/human-icon.png";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

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

  const renderRadarChart = () => (
    <div className="flex flex-row w-full h-72 justify-center content-center">
      <CharacteristicsRadarChart
        name={data.name}
        dataKey={"characteristics"}
        data={characteristics}
      />
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

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: a real <button> breaks the animate-rotate-y 3D flip rendering in Chromium */}
      <div
        role="button"
        tabIndex={0}
        className={`hidden md:block shadow-md bg-slate-50 dark:bg-slate-800 rounded border-2 border-purple-50 max-w-[858px] h-[452px] ${
          classChanging && "animate-rotate-y"
        }`}
        onClick={flipCard}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            flipCard();
          }
        }}
      >
        {!classChanging && (
          <div className="animate-fade grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="justify-center content-center">
              {renderName()}
              <div
                className="h-96 m-2"
                style={{ display: reverse ? "none" : "block" }}
              >
                {renderRadarChart()}
                {renderAttributeCards()}
              </div>

              <div
                className="block h-96 m-2 p-2"
                style={{ display: reverse ? "block" : "none" }}
              >
                <div className="scrollbar-thin h-full overflow-y-auto">
                  {renderSkillTable()}
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-1 content-center h-[448px]"
              style={{ display: reverse ? "none" : "block" }}
            >
              <div className="h-[440px]">{renderPortrait("h-[440px]")}</div>
            </div>

            <div
              className="grid grid-cols-1"
              style={{ display: reverse ? "block" : "none" }}
            >
              <div className="scrollbar-thin h-[434px] overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-800 m-2">
                {renderBackstoriesAndNotes()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <section className="shadow-md bg-slate-50 dark:bg-slate-800 rounded border-2 border-purple-50">
          {renderName()}
          <div className="px-2 pb-4">
            <div className="min-h-[320px] flex items-end justify-center">
              {renderPortrait("h-[320px]")}
            </div>
            {renderRadarChart()}
            {renderAttributeCards()}
          </div>
          <div className="px-2 pb-4 space-y-4">
            {renderSkillTable()}
            <div className="overflow-x-hidden">
              {renderBackstoriesAndNotes()}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CharacterCard;
