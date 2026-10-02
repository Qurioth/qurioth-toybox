import type { CSSProperties, ReactNode } from "react";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import { cn } from "@/utils/class-utils";
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

export type ScenarioPageProps = {
  scenario: ScenarioInfo;
  theme?: ScenarioTheme;
  /** "sidebar" で、広い画面では本文の横に目次を常に表示する */
  toc?: "sidebar";
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
  className,
  children,
}: ScenarioPageProps) => {
  const body = (
    <div
      data-scenario-body
      className="prose dark:prose-dark min-w-0 max-w-none"
    >
      {children}
    </div>
  );

  return (
    <ScenarioInfoProvider value={scenario}>
      <div style={toThemeStyle(theme)} className={cn("w-full", className)}>
        {toc === "sidebar" ? (
          <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
            {body}
            <aside>
              <ScenarioToc />
            </aside>
          </div>
        ) : (
          body
        )}
      </div>
    </ScenarioInfoProvider>
  );
};

export default ScenarioPage;
