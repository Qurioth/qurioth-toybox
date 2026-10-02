import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { TocItem } from "@/utils/scenario-structure-utils";
import ScenarioToc from "./ScenarioToc";

const items: TocItem[] = [
  { id: "GM-向け情報", label: "GM 向け情報", children: [] },
  {
    id: "主な-NPC",
    label: "主な NPC",
    children: [{ id: "沖嶋-深月", label: "沖嶋 深月", children: [] }],
  },
];

describe("ScenarioToc", () => {
  it("目次の各項目が見出しへのページ内リンクになる", () => {
    render(<ScenarioToc items={items} />);
    const nav = screen.getByRole("navigation", { name: "目次" });

    expect(
      within(nav).getByRole("link", { name: "GM 向け情報" }),
    ).toHaveAttribute("href", "#GM-向け情報");
    expect(
      within(nav).getByRole("link", { name: "沖嶋 深月" }),
    ).toHaveAttribute("href", "#沖嶋-深月");
  });

  it("ボタンでパネルを開き、項目を選ぶと閉じる", async () => {
    const user = userEvent.setup();
    render(<ScenarioToc items={items} />);
    const button = screen.getByRole("button", { name: "目次" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    const dialog = await screen.findByRole("dialog");
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(within(dialog).getByRole("link", { name: "沖嶋 深月" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
