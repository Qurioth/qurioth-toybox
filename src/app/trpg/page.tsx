"use client";

import Template from "@/components/Template";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Clapperboard,
  FileText,
  Search,
  Table2,
} from "lucide-react";

const toolCards = [
  {
    title: "CCFOLIA Log Grep",
    href: "/trpg/ccfolia-grep",
    description:
      "CCFOLIA のダイスログを読み込み、キャラクターごとの成功と失敗を一覧で確認できます。クトゥルフ神話TRPGはクリティカルとファンブルの結果出力も可能です。",
    meta: "すべてのシステム",
    icon: Search,
  },
  {
    title: "Charaeno Chart Card",
    href: "/trpg/charaeno-chart",
    description:
      "Charaeno に保管されたキャラクターのステータスをレーダーチャートで表示します。",
    meta: "クトゥルフ神話TRPG 7版",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Connection Table",
    href: "/trpg/connection-table",
    description: "ふしぎもののけRPG ゆうやけこやけ のつながりを管理します。",
    meta: "ふしぎもののけRPG ゆうやけこやけ",
    icon: Table2,
  },
];

const libraryCards = [
  {
    title: "Scenario",
    href: "/trpg/scenario",
    description: "作成した TRPG シナリオを掲載しています。",
    meta: "シナリオ一覧",
    icon: FileText,
  },
  {
    title: "Replay",
    href: "/trpg/replay",
    description: "Youtube の動画や配信で公開しているリプレイをまとめています。",
    meta: "動画 / 配信",
    icon: Clapperboard,
  },
];

type CardLinkProps = {
  title: string;
  href: string;
  description: string;
  meta: string;
  icon: typeof Search;
};

function CardLink({
  title,
  href,
  description,
  meta,
  icon: Icon,
}: CardLinkProps) {
  return (
    <a
      className="group flex h-full flex-col justify-between rounded-lg border border-black/[.08] bg-white p-5 text-left shadow-sm transition-colors hover:border-sky-500 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:border-white/[.145] dark:bg-[#020617] dark:hover:border-sky-400 dark:hover:bg-[#0f172a] dark:focus:ring-sky-950"
      href={href}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <Icon aria-hidden="true" size={22} />
          </div>
          <ArrowRight
            aria-hidden="true"
            className="mt-1 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-600 dark:text-gray-500 dark:group-hover:text-sky-300"
            size={20}
          />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-gray-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        {meta}
      </p>
    </a>
  );
}

export default function Home() {
  return (
    <Template>
      <div className="flex w-full max-w-5xl flex-col gap-10">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white sm:text-4xl">
              Tools
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              セッション準備やログ確認で使う TRPG 向けツールです。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {toolCards.map((card) => (
              <CardLink key={card.href} {...card} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white sm:text-4xl">
              Library
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              シナリオと、動画や配信で公開しているリプレイです。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {libraryCards.map((card) => (
              <CardLink key={card.href} {...card} />
            ))}
          </div>
        </section>
      </div>
    </Template>
  );
}
