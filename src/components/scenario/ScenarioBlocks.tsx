import { BookMarked } from "lucide-react";
import type { ReactNode } from "react";

const toId = (text: string) => text.trim().replace(/\s+/g, "-");

/** 読み上げ文。GM がそのまま読み上げる描写を枠で囲む(FR-022) */
export const ReadAloud = ({ children }: { children?: ReactNode }) => (
  <aside
    data-notation="read-aloud"
    className="not-prose my-4 rounded-lg border-2 border-amber-500/70 bg-amber-50 p-4 leading-8 text-zinc-900 shadow-sm dark:border-amber-400/60 dark:bg-amber-950/40 dark:text-slate-100 [&_p+p]:mt-3"
  >
    <p className="mb-2 text-xs font-bold tracking-wide text-amber-700 dark:text-amber-300">
      読み上げ
    </p>
    {children}
  </aside>
);

/** エンディング。番号と名称を分けた見出しにする(FR-024) */
export const Ending = ({
  number,
  name,
  children,
}: {
  number: string | number;
  name: string;
  children?: ReactNode;
}) => (
  <section className="not-prose my-4 flex flex-col gap-3 rounded-lg border border-[--scenario-border] bg-[--scenario-surface] p-4 shadow-sm dark:border-[--scenario-border-dark] dark:bg-[--scenario-surface-dark]">
    <h3
      id={toId(`ED${number} ${name}`)}
      data-toc
      data-toc-label={`ED${number} ${name}`}
      className="flex scroll-mt-24 flex-wrap items-baseline gap-2"
    >
      <span className="rounded bg-[--scenario-accent] px-2 py-0.5 text-sm font-bold text-white dark:bg-[--scenario-accent-dark] dark:text-slate-900">
        ED{number}
      </span>
      <span className="text-xl font-bold text-zinc-950 dark:text-white">
        {name}
      </span>
    </h3>
    <div className="prose dark:prose-dark max-w-none">{children}</div>
  </section>
);

/** その他報酬。エンディングと区別した見た目にする(FR-024) */
export const Reward = ({
  title = "その他報酬",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) => (
  <section className="not-prose my-4 flex flex-col gap-3 rounded-lg border border-dashed border-zinc-400 p-4 dark:border-slate-500">
    <h3
      id={toId(title)}
      data-toc
      className="scroll-mt-24 text-xl font-bold text-zinc-950 dark:text-white"
    >
      {title}
    </h3>
    <div className="prose dark:prose-dark max-w-none">{children}</div>
  </section>
);

/** 魔導書・アーティファクトのカード(FR-023) */
export const Tome = ({
  name,
  kana,
  children,
}: {
  name: string;
  /** 読み仮名など見出しの補足 */
  kana?: string;
  children?: ReactNode;
}) => (
  <article
    aria-label={name}
    className="not-prose my-4 flex flex-col gap-3 rounded-lg border-2 border-amber-700/40 bg-amber-50/60 p-4 dark:border-amber-400/40 dark:bg-amber-950/20"
  >
    <h3
      id={toId(`『${name}』`)}
      className="flex scroll-mt-24 items-center gap-2 text-xl font-bold text-zinc-950 dark:text-white"
    >
      <BookMarked
        className="size-5 shrink-0 text-amber-800 dark:text-amber-300"
        aria-hidden="true"
      />
      『{name}』
      {kana && (
        <span className="text-sm font-normal text-zinc-500 dark:text-slate-400">
          ({kana})
        </span>
      )}
    </h3>
    <div className="prose dark:prose-dark max-w-none">{children}</div>
  </article>
);
