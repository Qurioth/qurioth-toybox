"use client";

import CharacterCard from "@/components/CharacterCard";
import PillLink from "@/components/PillLink";
import FileInput from "@/components/forms/FileInput";
import SubmitButton from "@/components/forms/SubmitButton";
import Template from "@/components/Template";
import {
  CHARACTER_SHEET_FETCH_FAILED,
  CHARACTER_SHEET_UNEXPECTED_FORMAT,
  CHARACTER_SHEET_URL_INVALID,
  IACHARA_FILE_NOT_SELECTED,
  IACHARA_TEXT_UNEXPECTED_FORMAT,
} from "@/constants/message";
import type { CharacterCardData } from "@/types/CharacterCard";

import { type SubmitHandler, useForm } from "react-hook-form";
import {
  toCardDataFrom6th,
  toCardDataFrom7th,
  toCardDataFromIachara7th,
} from "@/utils/character-card-utils";
import {
  type Edition,
  is6thInvestigator,
  is7thInvestigator,
  SHEET_URL_PATTERN,
  toDisplayName,
  toSheetReference,
  toSummaryApiUrl,
} from "@/utils/charaeno-utils";
import { getFetch } from "@/utils/fetch-utils";
import { parseIacharaText } from "@/utils/iachara-utils";
import { ArrowLeftRight } from "lucide-react";
import { type FormEvent, useState } from "react";

type Inputs = {
  url: string;
};

/** 読み込み元。Charaeno のURLか、いあきゃらでテキスト出力したファイルか */
type InputMode = "url" | "file";

/**
 * 版に応じた検証と変換を通す。どちらの版の形も満たさなければ undefined。
 *
 * 版はURLから決まっているので、レスポンスの中身から版を推測することはしない。
 * 7版のURLに6版の形のJSONが返ってきた場合は、形式が想定と異なるものとして扱う。
 */
const toCardData = (
  edition: Edition,
  summary: unknown,
): CharacterCardData | undefined => {
  if (edition === "7th") {
    return is7thInvestigator(summary)
      ? toCardDataFrom7th({ ...summary, name: toDisplayName(summary.name) })
      : undefined;
  }

  return is6thInvestigator(summary)
    ? toCardDataFrom6th({ ...summary, name: toDisplayName(summary.name) })
    : undefined;
};

export default function CharaenoChartPage() {
  const [characterData, setCharacterData] = useState<CharacterCardData>();
  const [loadError, setLoadError] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [selectedFile, setSelectedFile] = useState<File>();
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoadError("");

    // 入力欄の検証を通っていれば必ず取れるが、版を確定させるために改めて解析する
    const sheetReference = toSheetReference(data.url);

    if (!sheetReference) {
      setCharacterData(undefined);
      setLoadError(CHARACTER_SHEET_URL_INVALID);
      return;
    }

    let summary: unknown;

    try {
      summary = await getFetch(toSummaryApiUrl(sheetReference));
    } catch (error) {
      console.error(error);
      setCharacterData(undefined);
      setLoadError(CHARACTER_SHEET_FETCH_FAILED);
      return;
    }

    const cardData = toCardData(sheetReference.edition, summary);

    if (!cardData) {
      setCharacterData(undefined);
      setLoadError(CHARACTER_SHEET_UNEXPECTED_FORMAT);
      return;
    }

    setCharacterData(cardData);
  };

  /** いあきゃらでテキスト出力したファイルから読み込む */
  const readIacharaFile = async (file?: File) => {
    setLoadError("");

    if (!file) {
      setLoadError(IACHARA_FILE_NOT_SELECTED);
      return;
    }

    let investigator: ReturnType<typeof parseIacharaText>;

    try {
      investigator = parseIacharaText(await file.text());
    } catch (error) {
      console.error(error);
      investigator = undefined;
    }

    if (!investigator) {
      setCharacterData(undefined);
      setLoadError(IACHARA_TEXT_UNEXPECTED_FORMAT);
      return;
    }

    setCharacterData(
      toCardDataFromIachara7th({
        ...investigator,
        name: toDisplayName(investigator.name),
      }),
    );
  };

  /** ファイルは選んだ時点で読み込む。Submit は選び直さずに読み込み直すときに使う */
  const selectIacharaFile = async (file?: File) => {
    setSelectedFile(file);

    if (file) {
      await readIacharaFile(file);
    }
  };

  // URLの入力欄は react-hook-form の検証を通し、ファイルは独自に読む。
  // ファイルのときに handleSubmit を通さないのは、隠れているURL欄の検証で止まらないようにするため
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (inputMode === "url") {
      return handleSubmit(onSubmit)(event);
    }

    event.preventDefault();
    return readIacharaFile(selectedFile);
  };

  /** 表示中のカードは残し、もう一方の入力欄のエラーだけを消す */
  const toggleInputMode = () => {
    clearErrors("url");
    setLoadError("");
    setInputMode((mode) => (mode === "url" ? "file" : "url"));
  };

  return (
    <Template>
      <div className="w-full">
        <div className="grid grid-cols-1 justify-items-center">
          <form onSubmit={submit} className="w-full mb-6">
            <div className="flex flex-row gap-3 justify-center">
              {inputMode === "url" ? (
                <div className="relative z-0 basis-1/2 mb-5 group">
                  <input
                    type="url"
                    id="character_sheet_url"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                    {...register("url", {
                      maxLength: 200,
                      pattern: {
                        // 取得先の組み立てと同じ規則。版を二箇所に書かない
                        value: SHEET_URL_PATTERN,
                        message: CHARACTER_SHEET_URL_INVALID,
                      },
                    })}
                  />
                  <label
                    htmlFor="character_sheet_url"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Character Sheet URL
                  </label>
                </div>
              ) : (
                <div className="basis-1/2 mb-5">
                  <FileInput
                    label="Iachara Text File (7th)"
                    readFile={selectIacharaFile}
                    // 見出しを出すと切り替えのたびに行の高さが変わるため、URL欄と同じ高さに揃える
                    hideLabel
                  />
                </div>
              )}
              <div className="mb-5">
                <SubmitButton className="w-full sm:w-auto">Submit</SubmitButton>
              </div>
              <div className="mb-5">
                <button
                  type="button"
                  onClick={toggleInputMode}
                  title={
                    inputMode === "url"
                      ? "いあきゃらのテキストファイルから読み込む"
                      : "CharaenoのURLから読み込む"
                  }
                  className="inline-flex items-center gap-1.5 text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-[9px] dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                >
                  <ArrowLeftRight aria-hidden="true" className="size-4" />
                  {inputMode === "url" ? "File" : "URL"}
                </button>
              </div>
            </div>
            {errors.url && (
              <div className="flex justify-center">
                <p className="text-red-500 text-sm mt-1">
                  {errors.url.message}
                </p>
              </div>
            )}
            {loadError && (
              <div className="flex justify-center">
                <p role="alert" className="text-red-500 text-sm mt-1">
                  {loadError}
                </p>
              </div>
            )}
          </form>

          <div className="xl:w-1/2 w-full">
            {characterData && <CharacterCard data={characterData} />}
          </div>
        </div>

        <div className="flex justify-center m-6">
          <PillLink href="/trpg/charaeno-chart/sample-character">
            Sample Characters
          </PillLink>
        </div>
      </div>
    </Template>
  );
}
