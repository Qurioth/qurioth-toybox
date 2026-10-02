"use client";

import { useEffect, useId, useState } from "react";
import { loadMermaid } from "./load-mermaid";

/** サイトのダークモード(<html> の dark クラス)を追う */
const useHtmlDarkClass = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

/**
 * Mermaid 記法のフローチャート(FR-026)。mermaid は図のあるページでだけ読み込む。
 * 図が画面より大きいときは枠の中だけでスクロールする
 */
const Flowchart = ({ chart }: { chart: string }) => {
  const id = `flowchart-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const isDark = useHtmlDarkClass();
  const [svg, setSvg] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "default",
        });
        const result = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, isDark]);

  if (failed) {
    return (
      <pre className="not-prose my-4 overflow-x-auto rounded-md border border-zinc-300 p-4 text-sm dark:border-slate-600">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <figure
      data-notation="flowchart"
      aria-label="フローチャート"
      className="not-prose my-6 overflow-x-auto rounded-lg border border-[--scenario-border] p-4 dark:border-[--scenario-border-dark]"
    >
      {svg ? (
        <div
          // mermaid が securityLevel: "strict" で生成した SVG を挿入する
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized by mermaid (securityLevel strict)
          dangerouslySetInnerHTML={{ __html: svg }}
          className="[&_svg]:max-w-none"
        />
      ) : (
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          フローチャートを読み込んでいます…
        </p>
      )}
    </figure>
  );
};

export default Flowchart;
