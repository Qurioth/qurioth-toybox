import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  classifyStrong,
  isReadAloud,
  parseStatLines,
  READ_ALOUD_MARKER,
  splitDifficulty,
  splitNotation,
} from "@/utils/scenario-structure-utils";
import StatGrid from "./StatGrid";

/** mdast / hast のうち、ここで触る部分だけの型 */
type TreeNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: TreeNode[];
  data?: { hProperties?: Record<string, unknown> };
  properties?: Record<string, unknown>;
  position?: { start: { offset?: number }; end: { offset?: number } };
};

/** 段落の元の Markdown。能力値の段落で、形に合わない行(太字の正気度喪失など)の書式を保つ */
const sourceOf = (markdown: string, node?: TreeNode) => {
  const start = node?.position?.start.offset;
  const end = node?.position?.end.offset;
  return start === undefined || end === undefined
    ? textOf(node)
    : markdown.slice(start, end);
};

const textOf = (node?: TreeNode): string => {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (node.tagName === "br") return "\n";
  return (node.children ?? []).map(textOf).join("");
};

const setProperty = (node: TreeNode, name: string) => {
  node.data = {
    ...node.data,
    hProperties: { ...node.data?.hProperties, [name]: "true" },
  };
};

/**
 * 引用に印を付ける。1 段落目が `[!読み上げ]` で始まる引用は読み上げ文として目印を取り除き、
 * それ以外の引用の段落はセリフとして扱う(research.md R10)
 */
const remarkScenarioQuotes = () => (tree: TreeNode) => {
  const visit = (node: TreeNode) => {
    if (node.type === "blockquote") {
      const first = node.children?.[0];
      const text =
        first?.type === "paragraph" ? first.children?.[0] : undefined;
      if (text?.type === "text" && isReadAloud(text.value ?? "")) {
        text.value = (text.value ?? "")
          .trimStart()
          .slice(READ_ALOUD_MARKER.length)
          .replace(/^[ \t]*\r?\n/, "");
        setProperty(node, "dataReadAloud");
      } else {
        for (const child of node.children ?? []) {
          if (child.type === "paragraph") setProperty(child, "dataDialogue");
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
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

const isCheckElement = (child: ReactNode) =>
  isValidElement<{ node?: TreeNode }>(child) &&
  child.props.node?.tagName === "strong" &&
  classifyStrong(textOf(child.props.node)).kind === "check";

/** 段落などの子要素の文字列から、呪文・物品・正気度回復・判定の難易度を見分けて包む */
const decorate = (children: ReactNode): ReactNode[] => {
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
      result.push(
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived from static text
          key={`${index}-difficulty`}
          data-notation="difficulty"
          className={NOTATION_STYLES.check}
        >
          {difficulty.difficulty}
        </span>,
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

/** `<br>` で区切られた行を 1 行ずつのまとまりにする(セリフ) */
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

/** 構造化表示の区画1つ分の本文を描画する */
const ScenarioMarkdown = ({ markdown }: { markdown: string }) => {
  if (markdown.trim() === "") return null;

  return (
    <div className="prose dark:prose-dark max-w-none prose-blockquote:font-normal prose-blockquote:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkScenarioQuotes]}
        components={{
          p: ({ node, children }) => {
            const treeNode = node as TreeNode | undefined;
            const stats = parseStatLines(sourceOf(markdown, treeNode));
            if (stats) {
              return (
                <StatGrid
                  stats={stats}
                  renderLine={(line) => <ScenarioMarkdown markdown={line} />}
                />
              );
            }

            const decorated = decorate(children);
            if (treeNode?.properties?.dataDialogue) {
              return (
                <p data-notation="dialogue" className="flex flex-col gap-1">
                  {splitLines(decorated).map((line, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: lines are derived from static text
                    <span key={index}>{line}</span>
                  ))}
                </p>
              );
            }
            return <p>{decorated}</p>;
          },
          li: ({ node, children, ...props }) => (
            <li {...props}>{decorate(children)}</li>
          ),
          td: ({ node, children, ...props }) => (
            <td {...props}>{decorate(children)}</td>
          ),
          strong: ({ node, children }) => {
            const treeNode = node as TreeNode | undefined;
            if (treeNode?.children?.[0]?.tagName === "em") {
              return (
                <strong
                  data-notation="source"
                  className="text-xs font-normal text-zinc-500 dark:text-slate-400"
                >
                  {children}
                </strong>
              );
            }
            const notation = classifyStrong(textOf(treeNode));
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
          },
          pre: ({ node, children, ...props }) => (
            <pre
              {...props}
              data-notation="document"
              className="not-prose my-4 whitespace-pre-wrap break-words rounded-md border border-dashed border-stone-400 bg-stone-50 p-4 font-serif text-[0.95rem] leading-7 text-stone-800 dark:border-stone-500 dark:bg-stone-900/50 dark:text-stone-100"
            >
              {children}
            </pre>
          ),
          blockquote: ({ node, children }) =>
            (node as TreeNode | undefined)?.properties?.dataReadAloud ? (
              <aside
                data-notation="read-aloud"
                className="not-prose my-4 rounded-lg border-2 border-amber-500/70 bg-amber-50 p-4 leading-8 text-zinc-900 shadow-sm dark:border-amber-400/60 dark:bg-amber-950/40 dark:text-slate-100 [&_p+p]:mt-3"
              >
                <p className="mb-2 text-xs font-bold tracking-wide text-amber-700 dark:text-amber-300">
                  読み上げ
                </p>
                {children}
              </aside>
            ) : (
              <blockquote>{children}</blockquote>
            ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
          img: ({ node, alt, ...props }) => (
            // biome-ignore lint/performance/noImgElement: markdown-provided image, size unknown at build time
            <img {...props} alt={alt ?? ""} className="max-w-full" />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default ScenarioMarkdown;
