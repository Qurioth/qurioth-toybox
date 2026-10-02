import { evaluate } from "@mdx-js/mdx";
import { render } from "@testing-library/react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { useMDXComponents } from "@/mdx-components";

/**
 * テスト用。専用ページと同じ設定(remark-gfm と mdx-components.tsx)で MDX を描画する。
 * 本番の @next/mdx の代わりに @mdx-js/mdx でその場でコンパイルする
 */
export const renderMdx = async (source: string) => {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    useMDXComponents,
  });
  return render(<Content />);
};

/** `data-notation` が kind の要素の文字列を並べる */
export const notations = (container: HTMLElement, kind: string) =>
  [...container.querySelectorAll(`[data-notation="${kind}"]`)].map(
    (element) => element.textContent,
  );
