"use client";

import Template from "@/components/Template";

export default function Home() {
  return (
    <Template>
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-extrabold dark:text-white">Tools</h2>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300"
            href="/trpg/ccfolia-grep"
          >
            CCFOLIA log grep
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 animate-in fade-in spin-in duration-500"
            href="/trpg/charaeno-chart"
          >
            Charaeno Chart Card
          </a>
        </div>
      </div>

      <br />
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-extrabold dark:text-white">Scenario</h2>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="w-96 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300"
            href="/trpg/scenario"
          >
            SCENARIO
          </a>
        </div>
      </div>
    </Template>
  );
}
