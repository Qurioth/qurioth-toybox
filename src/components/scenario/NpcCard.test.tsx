import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ScenarioNpc } from "@/types/scenario-npc";
import NpcCard from "./NpcCard";
import StatGrid from "./StatGrid";

const mitsuki: ScenarioNpc = {
  name: "沖嶋 深月",
  kana: "オキシマ ミツキ",
  portrait: { src: "/images/sample/mitsuki.png" },
  profile: "女性。写真家。\n探索者たちの共通の知人。",
  stats: [
    {
      abilities: [
        { label: "STR", value: "55" },
        { label: "CON", value: "75" },
      ],
      derived: [
        { label: "耐久力", value: "13" },
        { label: "マジック・ポイント", value: "9" },
      ],
    },
  ],
  skills: [
    { name: "芸術／製作（写真術）", value: 65 },
    { name: "近接戦闘（格闘）", value: 25, note: "ダメージ 1D3+DB" },
  ],
};

describe("NpcCard", () => {
  it("立ち絵・見出し・プロフィール・能力値・技能・子要素を 1 枚のカードにまとめる", () => {
    render(
      <NpcCard npc={mitsuki}>
        <p>「こんにちは」</p>
      </NpcCard>,
    );
    const card = screen.getByRole("article", { name: "沖嶋 深月" });

    expect(
      within(card).getByRole("img", { name: "沖嶋 深月" }),
    ).toHaveAttribute("src", "/images/sample/mitsuki.png");
    const heading = within(card).getByRole("heading", {
      name: "沖嶋 深月(オキシマ ミツキ)",
    });
    expect(heading).toHaveAttribute("data-toc");
    expect(heading).toHaveAttribute("data-toc-label", "沖嶋 深月");
    expect(within(card).getByText(/探索者たちの共通の知人。/)).toBeVisible();
    expect(within(card).getByText("STR").nextElementSibling).toHaveTextContent(
      "55",
    );
    expect(within(card).getByText("マジック・ポイント")).toBeInTheDocument();
    expect(
      within(card).getByText("芸術／製作（写真術）: 65%"),
    ).toBeInTheDocument();
    expect(within(card).getByText("ダメージ 1D3+DB")).toBeInTheDocument();
    expect(within(card).getByText("「こんにちは」")).toBeInTheDocument();
  });

  it("能力値も立ち絵も技能もない人物では、その欄を出さない", () => {
    render(<NpcCard npc={{ name: "案内人", profile: "プロフィールだけ。" }} />);
    const card = screen.getByRole("article", { name: "案内人" });

    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
    expect(within(card).queryByText("STR")).not.toBeInTheDocument();
    expect(within(card).queryByText("技能")).not.toBeInTheDocument();
  });
});

describe("StatGrid", () => {
  it("副次ステータスだけの存在は能力値の格子を出さない", () => {
    const { container } = render(
      <StatGrid
        stats={{
          label: "サーバーコア",
          abilities: [],
          derived: [{ label: "耐久力", value: "60" }],
        }}
      >
        <p>防壁を持つ。</p>
      </StatGrid>,
    );

    expect(container.querySelector(".grid")).not.toBeInTheDocument();
    expect(screen.getByText("サーバーコア")).toBeInTheDocument();
    expect(screen.getByText("耐久力").nextElementSibling).toHaveTextContent(
      "60",
    );
    expect(screen.getByText("防壁を持つ。")).toBeInTheDocument();
  });
});
