"use client";

import Template from "@/components/Template";

export default function Home() {
  return (
    <Template>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-extrabold dark:text-white">
            Photograph
          </h2>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300"
              href="/other/photograph"
            >
              Photograph
            </a>
          </div>
        </div>

        {/* 
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-extrabold dark:text-white">Movie</h2>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 animate-in zoom-in duration-300"
              href="/other/movie"
            >
              Movie
            </a>
          </div>
        </div>
        */}
      </div>
    </Template>
  );
}
