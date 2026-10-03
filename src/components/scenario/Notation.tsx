import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  classifyStrong,
  splitDifficulty,
  splitNotation,
} from "@/utils/scenario-structure-utils";
import { MarkdownImage } from "./Figure";
import Flowchart from "./Flowchart";

/** 子要素に含まれる文字列をつなげる(改行は `<br>` から) */
export const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return `${node}`;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return node.type === "br" ? "\n" : textOf(node.props.children);
  }
  return "";
};

const NOTATION_STYLES = {
  check:
    "whitespace-nowrap rounded border border-sky-500/70 bg-sky-50 px-1 font-bold text-sky-900 dark:border-sky-400/60 dark:bg-sky-950/60 dark:text-sky-100",
  "sanity-loss":
    "whitespace-nowrap rounded border-2 border-rose-500/70 bg-rose-50 px-1 font-bold text-rose-900 dark:border-rose-400/70 dark:bg-rose-950/60 dark:text-rose-100",
  "sanity-recovery":
    "whitespace-nowrap rounded border border-dashed border-emerald-500/80 bg-emerald-50 px-1 font-bold text-emerald-900 dark:border-emerald-400/70 dark:bg-emerald-950/60 dark:text-emerald-100",
  spell: "font-bold italic text-violet-700 dark:text-violet-300",
  tome: "font-bold text-amber-800 underline decoration-dotted underline-offset-4 dark:text-amber-300",
} as const;

/** 太字。判定・正気度喪失・出典を規約の書式から見分けて強調する */
export const NotationStrong = ({ children }: { children?: ReactNode }) => {
  const [only] = Children.toArray(children);
  if (Children.count(children) === 1 && isValidElement(only)) {
    if ((only as ReactElement).type === "em") {
      return (
        <strong
          data-notation="source"
          className="text-xs font-normal text-zinc-500 dark:text-slate-400"
        >
          {children}
        </strong>
      );
    }
  }

  const notation = classifyStrong(textOf(children));
  if (notation.kind === "check") {
    return (
      <strong data-notation="check" className={NOTATION_STYLES.check}>
        {children}
      </strong>
    );
  }
  if (notation.kind === "sanity-loss") {
    return (
      <strong
        data-notation="sanity-loss"
        className={NOTATION_STYLES["sanity-loss"]}
      >
        {notation.failure !== undefined ? (
          <>
            正気度喪失：
            <span data-sanity="success" title="成功時">
              {notation.success}
            </span>
            {" ／ "}
            <span
              data-sanity="failure"
              title="失敗時"
              className="underline decoration-2 underline-offset-2"
            >
              {notation.failure}
            </span>
          </>
        ) : (
          children
        )}
      </strong>
    );
  }
  return <strong>{children}</strong>;
};

const isCheckElement = (child: ReactNode) =>
  isValidElement<{ children?: ReactNode }>(child) &&
  child.type === NotationStrong &&
  classifyStrong(textOf(child.props.children)).kind === "check";

/** 子要素の文字列から、呪文・物品・正気度回復・判定の難易度を見分けて包む */
export const decorate = (children: ReactNode): ReactNode[] => {
  const result: ReactNode[] = [];
  let afterCheck = false;

  Children.toArray(children).forEach((child, index) => {
    if (typeof child !== "string") {
      result.push(child);
      afterCheck = isCheckElement(child);
      return;
    }

    let text = child;
    const difficulty = afterCheck ? splitDifficulty(text) : undefined;
    if (difficulty) {
      // 判定と難易度(`〈STR〉 のハード`)を 1 つの強調にまとめる
      const check = result.pop() as ReactElement<{ children?: ReactNode }>;
      result.push(
        <strong
          key={check.key}
          data-notation="check"
          className={NOTATION_STYLES.check}
        >
          {check.props.children}
          <span data-notation="difficulty">{difficulty.difficulty}</span>
        </strong>,
      );
      text = difficulty.rest;
    }
    splitNotation(text).forEach((segment, segmentIndex) => {
      result.push(
        segment.kind === "text" ? (
          segment.text
        ) : (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived from static text
            key={`${index}-${segmentIndex}`}
            data-notation={segment.kind}
            className={NOTATION_STYLES[segment.kind]}
          >
            {segment.text}
          </span>
        ),
      );
    });
    afterCheck = false;
  });
  return result;
};

/** 画像だけの段落か(図は p の中に置けないため、段落にせず並べる) */
const isImageOnly = (children: ReactNode) => {
  const items = Children.toArray(children).filter(
    (child) => !(typeof child === "string" && child.trim() === ""),
  );
  return (
    items.length > 0 &&
    items.every(
      (child) => isValidElement(child) && child.type === MarkdownImage,
    )
  );
};

export const NotationParagraph = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"p">) =>
  isImageOnly(children) ? (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
      {children}
    </div>
  ) : (
    <p {...props}>{decorate(children)}</p>
  );

export const NotationListItem = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"li">) => <li {...props}>{decorate(children)}</li>;

export const NotationCell = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"td">) => <td {...props}>{decorate(children)}</td>;

/** `<br>` で区切られた行を 1 行ずつのまとまりにする */
const splitLines = (children: ReactNode[]) => {
  const lines: ReactNode[][] = [[]];
  for (const child of children) {
    if (isValidElement(child) && (child as ReactElement).type === "br") {
      lines.push([]);
    } else if (typeof child === "string" && child.trim() === "") {
      // 改行だけの文字列は区切りに含める
    } else {
      lines[lines.length - 1].push(child);
    }
  }
  return lines.filter((line) => line.length > 0);
};

/** 引用。NPC のセリフとして 1 行ずつ区切る */
export const Dialogue = ({ children }: { children?: ReactNode }) => (
  <blockquote className="not-italic [&_p]:before:content-none [&_p]:after:content-none">
    {Children.toArray(children).map((child, index) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === NotationParagraph ? (
        <p
          // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static
          key={index}
          data-notation="dialogue"
          className="flex flex-col gap-1"
        >
          {splitLines(decorate(child.props.children)).map((line, lineIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines are derived from static text
            <span key={lineIndex}>{line}</span>
          ))}
        </p>
      ) : (
        child
      ),
    )}
  </blockquote>
);

/**
 * コードブロック。言語が mermaid ならフローチャート、それ以外は作中テキスト
 * (日記・手紙・掲示・詠唱文)として枠付きで改行を保つ
 */
export const DocumentText = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) => {
  const [code] = Children.toArray(children);
  if (
    isValidElement<{ className?: string; children?: ReactNode }>(code) &&
    code.props.className?.includes("language-mermaid")
  ) {
    return <Flowchart chart={textOf(code.props.children)} />;
  }
  return <DocumentPre {...props}>{children}</DocumentPre>;
};

const DocumentPre = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) => (
  <pre
    {...props}
    data-notation="document"
    className="not-prose my-4 whitespace-pre-wrap break-words rounded-md border border-dashed border-stone-400 bg-stone-50 p-4 font-serif text-[0.95rem] leading-7 text-stone-800 dark:border-stone-500 dark:bg-stone-900/50 dark:text-stone-100"
  >
    {children}
  </pre>
);
