import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { notations, renderMdx } from "./render-mdx";

describe("表記の強調(MDX)", () => {
  it("判定・難易度・正気度喪失・正気度回復・呪文・物品・出典を見分ける", async () => {
    const { container } = await renderMdx(
      [
        "**〈目星〉** に成功する。**〈STR〉** のハード に成功すると扉が開く。",
        "",
        "死体を見た。**正気度喪失：0 ／ 1D6**",
        "",
        "儀式を見届ける。**正気度喪失：1D10**",
        "",
        "『食屍鬼写本』には《カーの分配》が載っている。正気度回復: 1D6、正気度回復:1D4",
        "",
        "**_基本ルールブック P319 黄色の印_** 参照。**重要** な点。",
      ].join("\n"),
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
      "正気度回復:1D4",
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

  it("箇条書きと表のセルの中でも強調する", async () => {
    const { container } = await renderMdx(
      [
        "- 呪文：《ティンダロスの猟犬の召喚／従属》",
        "",
        "| 場所 | 判定 |",
        "| -- | -- |",
        "| 書斎 | **〈図書館〉** |",
      ].join("\n"),
    );

    expect(notations(container, "spell")).toEqual([
      "《ティンダロスの猟犬の召喚／従属》",
    ]);
    expect(notations(container, "check")).toEqual(["〈図書館〉"]);
  });
});
