import type { CSSProperties, ReactNode } from "react";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import { cn } from "@/utils/class-utils";
import ScenarioAsidePanel from "./ScenarioAsidePanel";
import { ScenarioInfoProvider } from "./ScenarioInfoContext";
import ScenarioToc from "./ScenarioToc";

type ThemeColors = {
  /** 見出しの線、目次、ED の番号など */
  accent?: string;
  /** カードの背景 */
  surface?: string;
  /** カードの枠 */
  border?: string;
};

export type ScenarioTheme = ThemeColors & { dark?: ThemeColors };

export type ScenarioAside = {
  /** 右の列の見出しと、狭い画面で開くボタンの名前 */
  label: string;
  content: ReactNode;
};

export type ScenarioPageProps = {
  scenario: ScenarioInfo;
  theme?: ScenarioTheme;
  /**
   * 広い画面で本文の横に目次を常に表示する。"sidebar" は本文の右、"left" は本文の左。
   * 狭い画面ではどちらも右下のボタンから開く
   */
  toc?: "sidebar" | "left";
  /**
   * 本文の右の列に置く内容(フローチャートなど)。xl 以上では右の列に常に表示し、
   * それより狭い画面では右下の「label」ボタンから開くパネルにする
   */
  aside?: ScenarioAside;
  /** 外枠に付けるクラス。ページ独自の背景やレイアウトに使う */
  className?: string;
  children: ReactNode;
};

const DEFAULT_THEME: Required<ThemeColors> & { dark: Required<ThemeColors> } = {
  accent: "#2563eb",
  surface: "#ffffff",
  border: "#d4d4d8",
  dark: {
    accent: "#60a5fa",
    surface: "rgb(15 23 42 / 0.5)",
    border: "#334155",
  },
};

/** 部品が参照する配色の CSS 変数。ダーク用は `-dark` 付きの変数で渡す */
const toThemeStyle = (theme: ScenarioTheme = {}) => {
  const light = { ...DEFAULT_THEME, ...theme };
  const dark = { ...DEFAULT_THEME.dark, ...theme.dark };
  return {
    "--scenario-accent": light.accent,
    "--scenario-surface": light.surface,
    "--scenario-border": light.border,
    "--scenario-accent-dark": dark.accent,
    "--scenario-surface-dark": dark.surface,
    "--scenario-border-dark": dark.border,
  } as CSSProperties;
};

/**
 * シナリオの専用ページの外枠(specs/005-scenario/contracts/mdx-page.md 1 章)。
 * 配色の CSS 変数と登録情報を部品へ届け、本文の要素に data-scenario-body を付ける
 */
const ScenarioPage = ({
  scenario,
  theme,
  toc,
  aside,
  className,
  children,
}: ScenarioPageProps) => {
  const themeStyle = toThemeStyle(theme);
  return (
    <ScenarioInfoProvider value={scenario}>
      <div style={themeStyle} className={cn("w-full", className)}>
        <ScenarioLayout toc={toc} aside={aside}>
          <div
            data-scenario-body
            className="prose dark:prose-dark min-w-0 max-w-none"
          >
            {children}
          </div>
        </ScenarioLayout>
        {aside && (
          <ScenarioAsidePanel
            label={aside.label}
            withToc={toc !== undefined}
            themeStyle={themeStyle}
          >
            {aside.content}
          </ScenarioAsidePanel>
        )}
      </div>
    </ScenarioInfoProvider>
  );
};

/** xl 以上の右の列。スクロールしても見えるようにする。それより狭い画面では出さない */
const AsideColumn = ({
  aside,
  className,
}: {
  aside: ScenarioAside;
  className?: string;
}) => (
  <section
    aria-label={aside.label}
    className={cn(
      "scrollbar-subtle sticky top-24 hidden max-h-[calc(100vh-7rem)] min-w-0 overflow-y-auto xl:block",
      className,
    )}
  >
    <p className="mb-2 px-2 text-xs font-bold text-zinc-500 dark:text-slate-400">
      {aside.label}
    </p>
    {aside.content}
  </section>
);

/**
 * 目次と右の列の配置。狭い画面では本文だけの 1 列にし、目次と右の列は右下のボタンから開く
 */
const ScenarioLayout = ({
  toc,
  aside,
  children: body,
}: Pick<ScenarioPageProps, "toc" | "aside"> & { children: ReactNode }) => {
  if (toc === "left") {
    return (
      <div
        className={cn(
          "grid w-full gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]",
          aside && "xl:grid-cols-[13rem_minmax(0,1fr)_20rem]",
        )}
      >
        <aside className="lg:col-start-1 lg:row-start-1">
          <ScenarioToc />
        </aside>
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">{body}</div>
        {aside && (
          <aside className="hidden xl:col-start-3 xl:row-start-1 xl:block">
            <AsideColumn aside={aside} />
          </aside>
        )}
      </div>
    );
  }

  if (toc === "sidebar" || aside) {
    return (
      <div
        className={cn(
          "grid w-full gap-8",
          toc === "sidebar" && "lg:grid-cols-[minmax(0,1fr)_15rem]",
          aside && "xl:grid-cols-[minmax(0,1fr)_20rem]",
        )}
      >
        <div className="min-w-0">{body}</div>
        <aside className={cn("min-w-0", !toc && "hidden xl:block")}>
          {/* 目次も同じ列で追従するので、こちらは追従させない */}
          {aside && (
            <AsideColumn
              aside={aside}
              className={cn(toc === "sidebar" && "static mb-6 max-h-none")}
            />
          )}
          {toc === "sidebar" && <ScenarioToc />}
        </aside>
      </div>
    );
  }

  return body;
};

export default ScenarioPage;
