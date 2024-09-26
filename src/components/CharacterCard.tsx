/* eslint-disable @next/next/no-img-element */
import ReaderChart from "@/components/recharts/ReaderChart";
import { Investigator } from "@/types/Charaeno7th";
import { useState } from "react";

const ChartCard = (props: { data: Investigator; portraitSize: number }) => {
  const data = props.data;
  const characteristics: {
    subject: string;
    characteristics: number;
    fullMark: number;
  }[] = [];
  const [reverse, setReverse] = useState(false);
  const [classChanging, setClassChanging] = useState(false);

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
      className={`shadow-md bg-slate-50 dark:bg-slate-800 rounded border-2 border-purple-50 h-[452px] ${
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
        <div className="animate-fade grid grid-cols-2 gap-2">
          <div className="justify-center content-center">
            <div className="h-12 font-serif text-4xl font-semibold italic mt-2 ml-2">
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
                <img
                  className="object-contain h-[440px] animate-in fade-in duration-1000"
                  src={data.portraitURL || ""}
                  alt="ortrait"
                />
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1"
            style={{ display: reverse ? "block" : "none" }}
          >
            <div className="scrollbar-thin h-[434px] overflow-y-auto bg-slate-50 dark:bg-slate-800 border-2 m-2">
              <div className="m-2">
                {data.note.split("\n").map((note, index) => {
                  return <div key={`${data.name}-note-${index}`}>{note}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
