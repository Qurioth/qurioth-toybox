"use client";

import Header from "@/components/Header";

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Header />
        <div className="w-full">
          <div className="grid grid-cols-1 justify-items-center">
            {children}
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
