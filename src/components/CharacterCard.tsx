"use client";

/* eslint-disable @next/next/no-img-element */
import { Investigator } from "@/types/Charaeno7th";
import humanIcon from "@/image/human-icon.png";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const ReaderChart = dynamic(() => import("@/components/recharts/ReaderChart"), {
  ssr: false,
});

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
  const characteristics: {
    subject: string;
    characteristics: number;
    fullMark: number;
  }[] = [];
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

  Object.keys(data.characteristics).map((key: string) => {
    let characteristicsData = 0;
    switch (key) {
      case "str":
        characteristicsData = data.characteristics.str;
        break;
      case "con":
        characteristicsData = data.characteristics.con;
        break;
      case "pow":
        characteristicsData = data.characteristics.pow;
        break;
      case "dex":
        characteristicsData = data.characteristics.dex;
        break;
      case "app":
        characteristicsData = data.characteristics.app;
        break;
      case "siz":
        characteristicsData = data.characteristics.siz;
        break;
      case "int":
        characteristicsData = data.characteristics.int;
        break;
      case "edu":
        characteristicsData = data.characteristics.edu;
        break;
      default:
    }

    characteristics.push({
      subject: key.toUpperCase(),
      characteristics: characteristicsData,
      fullMark: 100,
    });
  });

  return (
    <div
      className={`shadow-md bg-slate-50 dark:bg-slate-800 rounded border-2 border-purple-50 max-w-[858px] h-[920px] md:h-[452px] ${
        classChanging && "animate-rotate-y"
      }`}
      onClick={async () => {
        setClassChanging(true);
        await new Promise((resolve) => setTimeout(resolve, 880));
        setReverse(!reverse);
        setClassChanging(false);
      }}
    >
      {!classChanging && (
        <div className="animate-fade grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="justify-center content-center">
            <div
              className={`h-12 overflow-hidden text-ellipsis whitespace-nowrap font-serif ${nameTextSizeClass} font-semibold italic leading-tight mt-2 ml-2`}
            >
              {data.name}
            </div>
            <div
              className="h-96 m-2"
              style={{ display: reverse ? "none" : "block" }}
            >
              <div className="flex flex-row w-full h-72 justify-center content-center">
                <ReaderChart
                  name={data.name}
                  dataKey={"characteristics"}
                  data={characteristics}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="shadow-md divide-y divide-slate-700 p-2 dark:bg-slate-200 rounded border-2 border-purple-50 dark:text-slate-900">
                  <div className="flex justify-center font-semibold pb-2">
                    HP
                  </div>
                  <div className="flex justify-center font-semibold pt-2">
                    {data.attribute.hp}
                  </div>
                </div>
                <div className="shadow-md divide-y divide-slate-700 p-2 dark:bg-slate-200 rounded border-2 border-purple-50 dark:text-slate-900">
                  <div className="flex justify-center font-semibold pb-2">
                    MP
                  </div>
                  <div className="flex justify-center font-semibold pt-2">
                    {data.attribute.mp}
                  </div>
                </div>
                <div className="shadow-md divide-y divide-slate-700 p-2 dark:bg-slate-200 rounded border-2 border-purple-50 dark:text-slate-900">
                  <div className="flex justify-center font-semibold pb-2">
                    SAN
                  </div>
                  <div className="flex justify-center font-semibold pt-2">
                    {data.attribute.san.value}
                  </div>
                </div>
                <div className="shadow-md divide-y divide-slate-700 p-2 dark:bg-slate-200 rounded border-2 border-purple-50 dark:text-slate-900">
                  <div className="flex justify-center font-semibold pb-2">
                    幸運
                  </div>
                  <div className="flex justify-center font-semibold pt-2">
                    {data.attribute.luck}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="table-wrp block h-96 m-2 p-2"
              style={{ display: reverse ? "block" : "none" }}
            >
              <div className="scrollbar-thin h-full overflow-y-auto">
                <table className="w-full border-separate border border-slate-500">
                  <tbody>
                    {data.skills.map((skill, index) => {
                      if (skill.edited) {
                        return (
                          <tr key={`${data.name}-skill-${index}`}>
                            <td className="w-5/6 border border-slate-600 font-serif font-semibold">
                              {skill.name}
                            </td>
                            <td className="w-1/6 border border-slate-600 font-mono font-semibold text-center">
                              {skill.value}
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 content-center h-[448px]"
            style={{ display: reverse ? "none" : "block" }}
          >
            <div className="h-[440px]">
              <div className="w-auto grid grid-cols-1 justify-items-center content-center">
                {data.portraitURL ? (
                  <img
                    className="object-contain h-[440px] animate-in fade-in duration-1000"
                    src={data.portraitURL || "/image/human_icon.png"}
                    alt="ortrait"
                  />
                ) : (
                  <Image
                    className="animate-in fade-in duration-1000"
                    src={humanIcon}
                    alt="ortrait"
                    width={500}
                    height={500}
                    objectFit="contain"
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1"
            style={{ display: reverse ? "block" : "none" }}
          >
            <div className="scrollbar-thin h-[434px] overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-800 m-2">
              <div className="m-2">
                {backstories.length > 0 &&
                  backstories.map((backstory, backstoryIndex) => (
                    <section
                      key={`${data.name}-backstory-${backstoryIndex}`}
                      className="mb-3"
                    >
                      <h3 className="font-serif font-semibold">
                        {backstory.name}
                      </h3>
                      <div className="pl-5">
                        <ul className="list-disc pl-5">
                          {backstory.entries.map((entry, entryIndex) => (
                            <li
                              key={`${data.name}-backstory-${backstoryIndex}-${entryIndex}`}
                            >
                              {entry.text.split("\n").map((line, lineIndex) => (
                                <div
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
