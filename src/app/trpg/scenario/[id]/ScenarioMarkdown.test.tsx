import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScenarioMarkdown from "./ScenarioMarkdown";

const notations = (container: HTMLElement, kind: string) =>
  [...container.querySelectorAll(`[data-notation="${kind}"]`)].map(
    (element) => element.textContent,
  );

describe("ScenarioMarkdown", () => {
  it("判定・難易度・正気度喪失・正気度回復・呪文・物品・出典を見分ける", () => {
    const { container } = render(
      <ScenarioMarkdown
        markdown={[
          "**〈目星〉** に成功する。**〈STR〉** のハード に成功すると扉が開く。",
          "",
          "死体を見た。**正気度喪失：0 ／ 1D6**",
          "",
          "儀式を見届ける。**正気度喪失：1D10**",
          "",
          "『食屍鬼写本』には《カーの分配》が載っている。正気度回復: 1D6",
          "",
          "**_基本ルールブック P319 黄色の印_** 参照。**重要** な点。",
        ].join("\n")}
      />,
    );

    expect(notations(container, "check")).toEqual(["〈目星〉", "〈STR〉"]);
    expect(notations(container, "difficulty")).toEqual([" のハード"]);
    expect(notations(container, "sanity-loss")).toEqual([
      "正気度喪失：0 ／ 1D6",
      "正気度喪失：1D10",
    ]);
    expect(
      container.querySelector('[data-sanity="success"]'),
    ).toHaveTextContent("0");
    expect(
      container.querySelector('[data-sanity="failure"]'),
    ).toHaveTextContent("1D6");
    expect(notations(container, "sanity-recovery")).toEqual([
      "正気度回復: 1D6",
    ]);
    expect(notations(container, "spell")).toEqual(["《カーの分配》"]);
    expect(notations(container, "tome")).toEqual(["『食屍鬼写本』"]);
    expect(notations(container, "source")).toEqual([
      "基本ルールブック P319 黄色の印",
    ]);

    const plain = screen.getByText("重要");
    expect(plain.tagName).toBe("STRONG");
    expect(plain).not.toHaveAttribute("data-notation");
  });

  it("作中テキストを枠付きで改行を保って表示する", () => {
    const { container } = render(
      <ScenarioMarkdown markdown={"```\n一日目\n二日目\n```\n"} />,
    );
    const document = container.querySelector('[data-notation="document"]');

    expect(document?.tagName).toBe("PRE");
    expect(document?.textContent).toBe("一日目\n二日目\n");
  });

  it("引用はセリフとして 1 行ずつ区切る", () => {
    const { container } = render(
      <ScenarioMarkdown
        markdown={"> 「こんにちは」  \n> 「また来たの？」\n"}
      />,
    );
    const dialogue = container.querySelector('[data-notation="dialogue"]');

    expect(
      [...(dialogue?.children ?? [])].map((line) => line.textContent),
    ).toEqual(["「こんにちは」", "「また来たの？」"]);
    expect(
      container.querySelector('[data-notation="read-aloud"]'),
    ).not.toBeInTheDocument();
  });

  it("[!読み上げ] で始まる引用を読み上げ文の枠で表示し、目印は出さない", () => {
    const { container } = render(
      <ScenarioMarkdown
        markdown={[
          "> [!読み上げ]",
          "> 扉を開けると、湿った土の匂いが鼻をつく。  ",
          "> 部屋の奥で、何かが **〈聞き耳〉** に引っかかる音を立てた。",
        ].join("\n")}
      />,
    );
    const readAloud = container.querySelector('[data-notation="read-aloud"]');

    expect(readAloud).toBeInTheDocument();
    expect(readAloud).not.toHaveTextContent("[!読み上げ]");
    expect(readAloud).toHaveTextContent(
      "扉を開けると、湿った土の匂いが鼻をつく。",
    );
    expect(readAloud?.querySelector("br")).toBeInTheDocument();
    expect(notations(container, "check")).toEqual(["〈聞き耳〉"]);
    expect(
      container.querySelector('[data-notation="dialogue"]'),
    ).not.toBeInTheDocument();
  });

  it("能力値で始まる段落を見出しのレベルによらず能力値の格子にする", () => {
    const { container } = render(
      <ScenarioMarkdown
        markdown={"##### ステータス\n\nSTR: 60 DEX: 70  \n耐久力: 13\n"}
      />,
    );

    expect(
      container.querySelector('[data-notation="stats"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("DEX").nextElementSibling).toHaveTextContent("70");
  });

  it("能力値の段落の中の正気度喪失も強調する", () => {
    const { container } = render(
      <ScenarioMarkdown
        markdown={[
          "STR: 260 CON: 250  ",
          "耐久力: 55  ",
          "**正気度喪失：1 ／ 1D10**  ",
          "MOV: 10",
        ].join("\n")}
      />,
    );

    expect(notations(container, "sanity-loss")).toEqual([
      "正気度喪失：1 ／ 1D10",
    ]);
    expect(container).not.toHaveTextContent("**");
  });
});
