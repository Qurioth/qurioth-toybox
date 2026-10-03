import { evaluate } from "@mdx-js/mdx";
import { render, screen, within } from "@testing-library/react";
import * as runtime from "react/jsx-runtime";
import { describe, expect, it } from "vitest";
import ScenarioPage from "@/components/scenario/ScenarioPage";
import { notations, renderMdx } from "@/components/scenario/render-mdx";
import { useMDXComponents } from "@/mdx-components";

describe("mdx-components(専用ページの要素と部品)", () => {
  it("## を id 付きの見出しにする", async () => {
    await renderMdx("## 潮上町 (シオガミチョウ)\n");

    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "潮上町-(シオガミチョウ)",
    );
  });

  it("引用をセリフとして 1 行ずつ区切る", async () => {
    const { container } = await renderMdx(
      "> 「こんにちは」  \n> 「また来たの？」\n",
    );
    const dialogue = container.querySelector('[data-notation="dialogue"]');

    expect(
      [...(dialogue?.children ?? [])].map((line) => line.textContent),
    ).toEqual(["「こんにちは」", "「また来たの？」"]);
  });

  it("言語なしのコードブロックを作中テキストにする", async () => {
    const { container } = await renderMdx("```\n一日目\n二日目\n```\n");
    const document = container.querySelector('[data-notation="document"]');

    expect(document?.tagName).toBe("PRE");
    expect(document?.textContent).toBe("一日目\n二日目\n");
  });

  it("表を横スクロールの枠に入れる", async () => {
    await renderMdx("| 項目 | 値 |\n| -- | -- |\n| STR | 55 |\n");

    expect(screen.getByRole("table").parentElement).toHaveClass(
      "overflow-x-auto",
    );
  });

  it("部品を import せずに使える", async () => {
    const { container } = await renderMdx(
      [
        "<ReadAloud>",
        "",
        "扉を開けると、**〈聞き耳〉** に引っかかる音がした。",
        "",
        "</ReadAloud>",
        "",
        '<Ending number="1" name="帰還">',
        "",
        "正気度回復: 1D10",
        "",
        "</Ending>",
        "",
        "<Reward>全員生還</Reward>",
        "",
        '<Tome name="フサン謎の七書">',
        "",
        "- 著者：不明",
        "",
        "</Tome>",
        "",
        'export const npc = { name: "案内人" };',
        "",
        "<NpcCard npc={npc}>セリフ</NpcCard>",
      ].join("\n"),
    );

    const readAloud = container.querySelector('[data-notation="read-aloud"]');
    expect(readAloud).toHaveTextContent("扉を開けると");
    expect(notations(container, "check")).toEqual(["〈聞き耳〉"]);

    const ending = screen.getByRole("heading", { name: /^ED1/ });
    expect(within(ending).getByText("帰還")).toBeInTheDocument();
    expect(ending).toHaveAttribute("data-toc");
    expect(screen.getByRole("heading", { name: "その他報酬" })).toHaveAttribute(
      "data-toc",
    );
    expect(
      within(screen.getByRole("article", { name: "フサン謎の七書" })).getByText(
        "著者：不明",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "案内人" })).toHaveTextContent(
      "セリフ",
    );
  });

  it("概要は詳細画面から受け取った登録情報を出す", async () => {
    const { default: Content } = await evaluate(
      "<ScenarioOverview>舞台は現代の日本。</ScenarioOverview>",
      { ...runtime, useMDXComponents },
    );
    render(
      <ScenarioPage
        scenario={{
          title: "サンプル",
          system: "クトゥルフ神話TRPG 7版",
          players: { min: 3, max: 3 },
          playTimeHours: { min: 5, max: 6 },
        }}
      >
        <Content />
      </ScenarioPage>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "サンプル" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3人")).toBeInTheDocument();
    expect(screen.getByText(/5～6\s*時間程度/)).toBeInTheDocument();
    expect(screen.getByText("舞台は現代の日本。")).toBeInTheDocument();
  });
});
