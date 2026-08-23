"use client";

import CharacterCard from "@/components/CharacterCard";
import Template from "@/components/Template";
import {
  CHARACTER_SHEET_FETCH_FAILED,
  CHARACTER_SHEET_UNEXPECTED_FORMAT,
} from "@/constants/message";
import type { Investigator } from "@/types/Charaeno7th";

import { type SubmitHandler, useForm } from "react-hook-form";
import {
  isInvestigator,
  toDisplayName,
  toSummaryApiUrl,
} from "@/utils/charaeno-utils";
import { getFetch } from "@/utils/fetch-utils";
import { useState } from "react";

type Inputs = {
  url: string;
};

export default function CharaenoChartPage() {
  const [characterData, setCharacterData] = useState<Investigator>();
  const [loadError, setLoadError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoadError("");

    let summary: unknown;

    try {
      summary = await getFetch(toSummaryApiUrl(data.url));
    } catch (error) {
      console.error(error);
      setCharacterData(undefined);
      setLoadError(CHARACTER_SHEET_FETCH_FAILED);
      return;
    }

    if (!isInvestigator(summary)) {
      setCharacterData(undefined);
      setLoadError(CHARACTER_SHEET_UNEXPECTED_FORMAT);
      return;
    }

    setCharacterData({ ...summary, name: toDisplayName(summary.name) });
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
                      value:
                        /^https:\/\/charaeno.com\/7th\/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/,
                      message: "URLの形式が不正です。",
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
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Submit
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
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300"
            href="/trpg/charaeno-chart/sample-character"
          >
            Sample Characters
          </a>
        </div>
      </div>
    </Template>
  );
}
