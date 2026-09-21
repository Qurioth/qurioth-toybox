"use client";

import { DICELOG_RESULT } from "@/constants/dicelog";
import {
  ALL_TABS,
  CHARACTER_NAME,
  EXCLUDE_MYTHOS_AND_CREDIT,
  GREP_RESULT_HEADING,
  GROWTH_CHECK,
  GROWTH_CHECK_EVIDENCE,
  GROWTH_CHECK_RESULT_HEADING,
  SUCCESS_LEVEL,
  TAB_NAME,
} from "@/constants/message";
import CopyTextBox from "@/components/CopyTextBox";
import FileInput from "@/components/forms/FileInput";
import HorizontalCheckBox from "@/components/forms/HorizontalCheckBox";
import Select from "@/components/forms/Select";
import SubmitButton from "@/components/forms/SubmitButton";
import Template from "@/components/Template";
import type { DiceLog } from "@/types/DiceLog";
import type { GrowthCheck } from "@/types/GrowthCheck";
import { parseDicelog } from "@/utils/convert-utils";
import {
  grepCharactername,
  grepDicelog,
  grepTabnames,
} from "@/utils/grep-utils";
import {
  collectGrowthChecks,
  formatGrowthChecks,
} from "@/utils/growth-check-utils";
import { useState, useRef } from "react";

const LEVEL_LIST = [
  DICELOG_RESULT.CRITICAL,
  DICELOG_RESULT.SUCCESS,
  DICELOG_RESULT.FAILED,
  DICELOG_RESULT.FUMBLE,
];

export default function CcfoliaGrepPage() {
  const [nameList, setNameList] = useState<string[]>([]);
  const [tabList, setTabList] = useState<string[]>([]);
  // ファイルを読み込み直したらタブの選択を「すべて」に戻すため、Select を key で再マウントする
  const [fileVersion, setFileVersion] = useState(0);
  const [resultText, setResultText] = useState<string[]>([]);
  const [growthChecks, setGrowthChecks] = useState<GrowthCheck[]>([]);
  // 成長チェック一覧の見出しは実行時の名前で固定する(実行後に選択を変えても一覧は変わらない)
  const [growthCheckText, setGrowthCheckText] = useState<string[]>([]);
  const dicelog = useRef<DiceLog[]>([]);
  const selectName = useRef<string>("");
  // 空文字が「すべて」(タブで絞り込まない)
  const selectTab = useRef<string>("");
  const checkLevelList = useRef<string[]>([
    DICELOG_RESULT.CRITICAL,
    DICELOG_RESULT.SUCCESS,
  ]);
  const excludeMythosAndCredit = useRef<boolean>(true);

  const readFile = async (file?: File) => {
    if (file) {
      try {
        const reader = new FileReader();

        // ファイルの読み込みが完了した時の処理
        reader.onload = () => {
          const dicelogString = reader.result as string;
          dicelog.current = parseDicelog(dicelogString);
          setNameList(grepCharactername(dicelog.current));
          setTabList(grepTabnames(dicelog.current));
          selectTab.current = "";
          setFileVersion((version) => version + 1);
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

  const onChangeTabSelectBox = (selectItem: string) => {
    selectTab.current = selectItem === ALL_TABS ? "" : selectItem;
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

  const onChangeExcludeCheckBox = (_value: string, checked: boolean) => {
    excludeMythosAndCredit.current = checked;
  };

  const onClickExecute = async () => {
    setResultText(
      grepDicelog(
        dicelog.current,
        selectName.current,
        checkLevelList.current,
        selectTab.current,
      ),
    );

    const checks = collectGrowthChecks(
      dicelog.current,
      selectName.current,
      selectTab.current,
      {
        excludeMythosAndCredit: excludeMythosAndCredit.current,
      },
    );
    setGrowthChecks(checks);
    setGrowthCheckText(formatGrowthChecks(selectName.current, checks));
  };

  return (
    <Template>
      <div className="w-full lg:w-3/5">
        <div className="flex gap-6 items-center flex-col ">
          <FileInput label={"CCFOLIA LOG FILE"} readFile={readFile} />
          <Select
            selectList={nameList}
            placeholder={CHARACTER_NAME}
            ariaLabel={CHARACTER_NAME}
            onChangeSelectBox={onChangeSelectBox}
          />
          <Select
            key={fileVersion}
            id="select-tab"
            ariaLabel={TAB_NAME}
            selectList={[ALL_TABS, ...tabList]}
            defaultValue={ALL_TABS}
            onChangeSelectBox={onChangeTabSelectBox}
          />
          <HorizontalCheckBox
            label={SUCCESS_LEVEL}
            checkItemList={LEVEL_LIST}
            defaultCheckItemList={checkLevelList.current}
            onChangeCheckBox={onChangeCheckBox}
          />
          <HorizontalCheckBox
            label={GROWTH_CHECK}
            checkItemList={[EXCLUDE_MYTHOS_AND_CREDIT]}
            defaultCheckItemList={[EXCLUDE_MYTHOS_AND_CREDIT]}
            onChangeCheckBox={onChangeExcludeCheckBox}
          />
          <SubmitButton
            className="w-full"
            onClick={() => {
              onClickExecute();
            }}
          >
            Submit
          </SubmitButton>
          <section className="w-full">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {GREP_RESULT_HEADING}
            </h3>
            <CopyTextBox textList={resultText} />
          </section>
          <section className="w-full">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {GROWTH_CHECK_RESULT_HEADING}
            </h3>
            {/* 成長チェックは技能名だけなので短い。固定高にせず内容に合わせ、長いときだけスクロール */}
            <CopyTextBox
              textList={growthCheckText}
              className="h-auto min-h-24 max-h-60"
            />
            {growthChecks.length > 0 && (
              <details className="w-full mt-2">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
                  {GROWTH_CHECK_EVIDENCE}
                </summary>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1 break-all">
                  {growthChecks.map(({ skill, evidence }) => (
                    <li key={skill}>
                      <span className="font-medium">{skill}</span>
                      {" — "}
                      {evidence.tab === "" ? "" : `[${evidence.tab}] `}
                      {evidence.name} {evidence.content}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        </div>
      </div>
    </Template>
  );
}
