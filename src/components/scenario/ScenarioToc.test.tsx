import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ScenarioToc from "./ScenarioToc";

const renderWithBody = () =>
  render(
    <div>
      <div data-scenario-body>
        <h2 id="GM-向け情報">GM 向け情報</h2>
        <h2 id="主な-NPC">主な NPC</h2>
        <h3 id="沖嶋-深月" data-toc>
          沖嶋 深月
        </h3>
        <h3>ただの見出し</h3>
        <h2>机</h2>
        <h2>机</h2>
      </div>
      <ScenarioToc />
    </div>,
  );

describe("ScenarioToc", () => {
  it("h2 と data-toc 付きの見出しを集め、data-toc 見出しを直前の h2 の下に入れ子にする", async () => {
    renderWithBody();
    const nav = screen.getByRole("navigation", { name: "目次" });

    expect(
      await within(nav).findByRole("link", { name: "GM 向け情報" }),
    ).toHaveAttribute("href", "#GM-向け情報");
    const npc = within(nav).getByRole("link", { name: "沖嶋 深月" });
    expect(npc).toHaveAttribute("href", "#沖嶋-深月");
    expect(npc.closest("ul")?.closest("li")).toHaveTextContent("主な NPC");
    expect(
      within(nav).queryByRole("link", { name: "ただの見出し" }),
    ).not.toBeInTheDocument();
  });

  it("id の無い見出しや重複には一意の id を付ける", async () => {
    renderWithBody();
    const nav = screen.getByRole("navigation", { name: "目次" });
    const desks = await within(nav).findAllByRole("link", { name: "机" });

    expect(desks.map((link) => link.getAttribute("href"))).toEqual([
      "#机",
      "#机-2",
    ]);
  });

  it("ボタンでパネルを開き、項目を選ぶと閉じる", async () => {
    const user = userEvent.setup();
    renderWithBody();
    const button = screen.getByRole("button", { name: "目次" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    const dialog = await screen.findByRole("dialog");
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(within(dialog).getByRole("link", { name: "沖嶋 深月" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
