import type { ComponentPropsWithoutRef } from "react";
import { textOf } from "./Notation";

/** 見出しの文字列から、目次・ページ内リンク用の id を作る */
const toId = (props: ComponentPropsWithoutRef<"h2">) =>
  props.id ?? (textOf(props.children).trim().replace(/\s+/g, "-") || undefined);

/** 本文の見出し。固定ヘッダーに隠れないよう scroll-margin を付ける。h2 は目次に載る */
export const ScenarioH2 = (props: ComponentPropsWithoutRef<"h2">) => (
  <h2
    {...props}
    id={toId(props)}
    className="scroll-mt-24 border-b-2 border-[--scenario-accent] pb-2 dark:border-[--scenario-accent-dark]"
  />
);

export const ScenarioH3 = (props: ComponentPropsWithoutRef<"h3">) => (
  <h3 {...props} id={toId(props)} className="scroll-mt-24" />
);

export const ScenarioH4 = (props: ComponentPropsWithoutRef<"h4">) => (
  <h4 {...props} id={toId(props)} className="scroll-mt-24" />
);
