import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Figure from "./Figure";
import { renderMdx } from "./render-mdx";

describe("Figure", () => {
  it("キャプション付きで表示し、選ぶと原寸の画像をダイアログで開いて閉じられる", async () => {
    const user = userEvent.setup();
    render(
      <Figure
        src="/images/sample/map.png"
        alt="潮上町の地図"
        caption="潮上町の全体図"
      />,
    );

    expect(screen.getByText("潮上町の全体図").tagName).toBe("FIGCAPTION");

    await user.click(
      screen.getByRole("button", { name: "潮上町の地図を拡大する" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("img", { name: "潮上町の地図" }),
    ).toHaveAttribute("src", "/images/sample/map.png");

    await user.click(within(dialog).getByRole("button", { name: "閉じる" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Markdown の画像を図にし、タイトルをキャプションにする", async () => {
    const { container } = await renderMdx(
      '![潮上町の地図](/images/sample/map.png "潮上町の全体図")\n',
    );

    expect(container.querySelector("p figure")).not.toBeInTheDocument();
    expect(screen.getByText("潮上町の全体図").tagName).toBe("FIGCAPTION");
    expect(screen.getByRole("img", { name: "潮上町の地図" })).toBeVisible();
  });

  it("画像が並んだ段落は図を並べる", async () => {
    const { container } = await renderMdx(
      "![灯台](/images/sample/a.png) ![洞窟](/images/sample/b.png)\n",
    );

    expect(container.querySelectorAll("figure")).toHaveLength(2);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
