"use client";

import { DICELOG_RESULT } from "@/assets/Const";
import { INVESTIGATER_NAME, SUCCESS_LEVEL } from "@/assets/Message";
import CopyTextBox from "@/components/CopyTextBox";
import FileInput from "@/components/forms/FileInput";
import HorizontailCheckBox from "@/components/forms/HorizontailCheckBox";
import Select from "@/components/forms/Select";
import Template from "@/components/Template";
import { DiceLog } from "@/types/DiceLog";
import { convertDicelog } from "@/utils/convert-utils";
import { grepCharactername, grepDicelog } from "@/utils/grep-utils";
import { useState, useRef } from "react";

const LEVEL_LIST = [
  DICELOG_RESULT.CRITICAL,
  DICELOG_RESULT.SUCCESS,
  DICELOG_RESULT.FAILED,
  DICELOG_RESULT.FUMBLE,
];

export default function Home() {
  const [nameList, setNameList] = useState<string[]>([]);
  const [resultText, setResultText] = useState<string[]>([]);
  const dicelog = useRef<DiceLog[]>([]);
  const selectName = useRef<string>("");
  const checkLevelList = useRef<string[]>([
    DICELOG_RESULT.CRITICAL,
    DICELOG_RESULT.SUCCESS,
  ]);

  const readFile = async (file?: File) => {
    if (file) {
      try {
        const reader = new FileReader();

        // ファイルの読み込みが完了した時の処理
        reader.onload = () => {
          const dicelogString = reader.result as string;
          dicelog.current = convertDicelog(dicelogString);
          setNameList(grepCharactername(dicelog.current));
        };

        // テキストファイルを読み込む
        reader.readAsText(file);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onChangeSelectBox = (selectItem: string) => {
    selectName.current = selectItem;
  };

  const onChangeCheckBox = (value: string, checked: boolean) => {
    console.log({ value, checked });
    if (checked) {
      checkLevelList.current.push(value);
    } else {
      checkLevelList.current = checkLevelList.current.filter((item) => {
        return item !== value;
      });
    }
  };

  const onClickExecute = async () => {
    setResultText(
      grepDicelog(dicelog.current, selectName.current, checkLevelList.current)
    );
  };

  return (
    <Template>
      <div className="w-full lg:w-3/5">
        <div className="flex gap-6 items-center flex-col ">
          <FileInput label={"CCFOLIA LOG FILE"} readFile={readFile} />
          <Select
            selectList={nameList}
            placeholder={INVESTIGATER_NAME}
            onChangeSelectBox={onChangeSelectBox}
          />
          <HorizontailCheckBox
            label={SUCCESS_LEVEL}
            checkItemList={LEVEL_LIST}
            defaultCheckItemList={checkLevelList.current}
            onChangeCheckBox={onChangeCheckBox}
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              onClickExecute();
            }}
          >
            Submit
          </button>
          <CopyTextBox textList={resultText} />
        </div>
      </div>
    </Template>
  );
}
