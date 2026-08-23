"use client";

import CharacterCard from "@/components/CharacterCard";
import PillLink from "@/components/PillLink";
import SubmitButton from "@/components/forms/SubmitButton";
import Template from "@/components/Template";
import {
  CHARACTER_SHEET_FETCH_FAILED,
  CHARACTER_SHEET_UNEXPECTED_FORMAT,
  CHARACTER_SHEET_URL_INVALID,
} from "@/constants/message";
import type { CharacterCardData } from "@/types/CharacterCard";

import { type SubmitHandler, useForm } from "react-hook-form";
import {
  toCardDataFrom6th,
  toCardDataFrom7th,
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
import { useState } from "react";

type Inputs = {
  url: string;
};

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
  const {
    register,
    handleSubmit,
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

  return (
    <Template>
      <div className="w-full">
        <div className="grid grid-cols-1 justify-items-center">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full mb-6">
            <div className="flex flex-row gap-3 justify-center">
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
              <div className="mb-5">
                <SubmitButton className="w-full sm:w-auto">Submit</SubmitButton>
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
