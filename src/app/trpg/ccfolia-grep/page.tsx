"use client";

import FileInput from "@/components/forms/FileInput";
// import { DICELOG_RESULT } from "@/assets/Const";
import Template from "@/components/Template";
// import { DiceLog } from "@/types/DiceLog";
// import { convertDicelog } from "@/utils/convert-utils";
// import { grepCharactername, grepDicelog } from "@/utils/grep-utils";
// import { useState, useRef } from "react";

// const LEVEL_LIST = [
//   DICELOG_RESULT.CRITICAL,
//   DICELOG_RESULT.SUCCESS,
//   DICELOG_RESULT.FAILED,
//   DICELOG_RESULT.FUMBLE,
// ];

export default function Home() {
  // const [nameList, setNameList] = useState<string[]>([]);
  // const [resultText, setResultText] = useState<string[]>([]);
  // const dicelog = useRef<DiceLog[]>([]);
  // const selectFilePath = useRef<string>("");
  // const selectName = useRef<string>("");
  // const checkLevelList = useRef<string[]>([
  //   DICELOG_RESULT.CRITICAL,
  //   DICELOG_RESULT.SUCCESS,
  // ]);

  // const readFile = async (filePath: string) => {
  //   selectFilePath.current = filePath;
  //   try {
  //     const dicelogString = await readTextFile(selectFilePath.current);
  //     dicelog.current = convertDicelog(dicelogString);
  //     setNameList(grepCharactername(dicelog.current));
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const onChangeSelectBox = (selectItem: string) => {
  //   selectName.current = selectItem;
  // };

  // const onChangeCheckBox = (value: string, checked: boolean) => {
  //   if (checked) {
  //     checkLevelList.current.push(value);
  //   } else {
  //     checkLevelList.current = checkLevelList.current.filter((item) => {
  //       return item !== value;
  //     });
  //   }
  // };

  // const onClickExecute = async () => {
  //   setResultText(
  //     grepDicelog(dicelog.current, selectName.current, checkLevelList.current)
  //   );
  // };

  // const onClickCopyToClipboard = () => {
  //   navigator.clipboard.writeText(resultText.join("\n"));
  // };

  return (
    <Template>
      <FileInput />
      <textarea
        id="message"
        rows={4}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Write your thoughts here..."
      ></textarea>
    </Template>
  );
}
