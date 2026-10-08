import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ScenarioNpc } from "@/types/scenario-npc";
import NpcCard from "./NpcCard";
import StatGrid from "./StatGrid";

const mitsuki: ScenarioNpc = {
  name: "沖嶋 深月",
  kana: "オキシマ ミツキ",
  portrait: { src: "/images/sample/mitsuki.png" },
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
  it("立ち絵・見出し・能力値・技能・子要素(プロフィールやセリフ例)を 1 枚のカードにまとめる", () => {
    render(
      <NpcCard npc={mitsuki}>
        <p>女性。写真家。探索者たちの共通の知人。</p>
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

  it("立ち絵は名前の横の丸いアイコンにし、顔の位置をアイコンの中心に合わせる", () => {
    render(
      <NpcCard
        npc={{
          ...mitsuki,
          portrait: {
            src: "/images/sample/mitsuki.png",
            face: { x: 40, y: 6, width: 50 },
          },
        }}
      />,
    );
    const card = screen.getByRole("article", { name: "沖嶋 深月" });
    const icon = within(card).getByRole("button", {
      name: "沖嶋 深月を拡大する",
    });
    const image = within(icon).getByRole("img", { name: "沖嶋 深月" });

    expect(icon.parentElement).toContainElement(
      within(card).getByRole("heading", { name: /沖嶋 深月/ }),
    );
    expect(image.style.width).toBe("200%");
    expect(image.style.transform).toBe("translate(-40%, -6%)");
  });

  it("顔の位置を書かない立ち絵は、画像の幅いっぱいを映して上側を見せる", () => {
    render(<NpcCard npc={mitsuki} />);
    const image = within(
      screen.getByRole("button", { name: "沖嶋 深月を拡大する" }),
    ).getByRole("img");

    expect(image).toHaveClass("object-cover", "object-[50%_4%]");
    expect(image.style.transform).toBe("");
  });

  it("アイコンを選ぶと立ち絵の全体を開く", async () => {
    const user = userEvent.setup();
    render(<NpcCard npc={mitsuki} />);

    await user.click(
      screen.getByRole("button", { name: "沖嶋 深月を拡大する" }),
    );

    const image = within(screen.getByRole("dialog")).getByRole("img", {
      name: "沖嶋 深月",
    });
    expect(image).toHaveAttribute("src", "/images/sample/mitsuki.png");
    // スクロールせず画面に収まる大きさで開く(原寸の max-w-none ではない)
    expect(image).toHaveClass("max-h-[calc(100dvh-3.75rem)]");
    expect(image).not.toHaveClass("max-w-none");
  });

  it("技能の下に呪文とアーティファクトの欄を出し、出典のないものを本シナリオ独自と示す", async () => {
    const user = userEvent.setup();
    render(
      <NpcCard
        npc={{
          name: "占い師",
          spells: [
            {
              name: "精神的従属(特化型)",
              details: [
                { label: "コスト", value: "3マジック・ポイント" },
                { label: "効果", value: "通常の《精神的従属》に準ずる。" },
              ],
            },
            { name: "夢を送る", source: "基本ルールブック" },
          ],
          spellNote: "キーパーが選ぶその他の呪文。",
          artifacts: [{ name: "水晶の数珠" }],
        }}
      />,
    );
    const card = screen.getByRole("article", { name: "占い師" });
    const spells = within(card)
      .getByRole("heading", { name: "呪文" })
      .closest("section") as HTMLElement;
    const [original, rulebook] = within(spells).getAllByRole("listitem");

    expect(
      within(original).getByText("《精神的従属(特化型)》"),
    ).toHaveAttribute("data-notation", "spell");
    expect(within(original).getByText("本シナリオ独自")).toBeInTheDocument();
    expect(within(rulebook).getByText("基本ルールブック")).toBeInTheDocument();
    expect(
      within(rulebook).queryByText("本シナリオ独自"),
    ).not.toBeInTheDocument();
    expect(
      within(spells).getByText("キーパーが選ぶその他の呪文。"),
    ).toBeInTheDocument();

    // 説明は名前の行を開くと読める。説明の中の表記も強調する
    const details = original.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await user.click(within(original).getByText("《精神的従属(特化型)》"));
    expect(details.open).toBe(true);
    expect(within(original).getByText("3マジック・ポイント")).toBeVisible();
    expect(within(original).getByText("《精神的従属》")).toHaveAttribute(
      "data-notation",
      "spell",
    );

    const artifacts = within(card)
      .getByRole("heading", { name: "アーティファクト" })
      .closest("section") as HTMLElement;
    expect(within(artifacts).getByText("『水晶の数珠』")).toHaveAttribute(
      "data-notation",
      "tome",
    );
    expect(within(artifacts).getByText("本シナリオ独自")).toBeInTheDocument();
  });

  it("能力値も立ち絵も技能もない人物では、その欄を出さない", () => {
    render(
      <NpcCard npc={{ name: "案内人" }}>
        <p>プロフィールだけ。</p>
      </NpcCard>,
    );
    const card = screen.getByRole("article", { name: "案内人" });

    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
    expect(within(card).queryByText("STR")).not.toBeInTheDocument();
    expect(within(card).queryByText("技能")).not.toBeInTheDocument();
    expect(within(card).queryByText("呪文")).not.toBeInTheDocument();
    expect(
      within(card).queryByText("アーティファクト"),
    ).not.toBeInTheDocument();
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
