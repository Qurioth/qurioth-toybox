import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 構造化表示へ移行していないシナリオの本文。Markdown をそのまま整形して表示する */
const LegacyScenarioBody = ({ markdown }: { markdown?: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      img: ({ node, alt, ...props }) => (
        // biome-ignore lint/performance/noImgElement: markdown-provided image, size unknown at build time
        <img
          {...props}
          alt={alt ?? ""}
          className="size-40 md:size-60 float-right m-2"
        />
      ),
    }}
  >
    {markdown}
  </ReactMarkdown>
);

export default LegacyScenarioBody;
