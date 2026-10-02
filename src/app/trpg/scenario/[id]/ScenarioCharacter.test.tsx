import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { splitScenarioMarkdown } from "@/utils/scenario-structure-utils";
import ScenarioCharacter from "./ScenarioCharacter";

/** 行末の半角スペース 2 つ(改行)を落とさないよう、行の配列から本文を作る */
const sectionsOf = (lines: string[]) =>
  splitScenarioMarkdown(lines.join("\n")).chapters[0].sections;

describe("ScenarioCharacter", () => {
  it("立ち絵・見出し・能力値・技能・セリフ例を 1 枚のカードにまとめる", () => {
    const [section] = sectionsOf([
      "## 主な NPC",
      "",
      "### 沖嶋 深月 (オキシマ ミツキ)",
      "",
      "![沖嶋 深月](/images/sample/mitsuki.png)",
      "女性。写真家。",
      "",
      "#### ステータス",
      "",
      "STR: 55 CON: 75 POW: 45 DEX: 60 APP: 60 SIZ: 60 INT: 85 EDU: 53  ",
      "耐久力: 13 マジック・ポイント: 9",
      "",
      "#### 技能",
      "",
      "写真術: 65%",
      "",
      "#### セリフ例",
      "",
      "> 「こんにちは」  ",
      "> 「また来たの？」",
    ]);
    render(<ScenarioCharacter section={section} />);
    const card = screen.getByRole("article");

    expect(
      within(card).getByRole("img", { name: "沖嶋 深月" }),
    ).toHaveAttribute("src", "/images/sample/mitsuki.png");
    expect(
      within(card).getByRole("heading", { name: "沖嶋 深月(オキシマ ミツキ)" }),
    ).toHaveAttribute("id", "沖嶋-深月-(オキシマ-ミツキ)");
    expect(within(card).getByText("女性。写真家。")).toBeInTheDocument();

    const strTerm = within(card).getByText("STR");
    expect(strTerm.tagName).toBe("DT");
    expect(strTerm.nextElementSibling).toHaveTextContent("55");
    expect(within(card).getByText("マジック・ポイント")).toBeInTheDocument();

    expect(
      within(card).getByRole("heading", { name: "技能" }),
    ).toBeInTheDocument();
    expect(within(card).getByText("「こんにちは」")).toBeInTheDocument();
    expect(within(card).getByText("「また来たの？」")).toBeInTheDocument();
  });

  it("能力値も立ち絵もない人物では、その欄を出さない", () => {
    const [section] = sectionsOf([
      "## 主な NPC",
      "",
      "### 案内人",
      "",
      "プロフィールだけの人物。",
    ]);
    render(<ScenarioCharacter section={section} />);
    const card = screen.getByRole("article");

    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
    expect(within(card).queryByText("STR")).not.toBeInTheDocument();
    expect(
      within(card).getByText("プロフィールだけの人物。"),
    ).toBeInTheDocument();
  });
});
