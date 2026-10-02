import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Scenario } from "@/data/scenario/scenario-list";
import StructuredScenario from "./StructuredScenario";

const markdown = `_The Sample_

# サンプル

舞台は現代の日本。探索者たちは知人の依頼で海沿いの町へ赴く。

## GM 向け情報

真相。

## 主な NPC

### 沖嶋 深月 (オキシマ ミツキ)

女性。

## 潮上町 (シオガミチョウ)

町の描写。

## 潮上灯台跡

灯台の描写。

## クライマックス

対決。

## シナリオ終了

### ED1 【帰還】

正気度回復: 1D10
`;

const scenario: Scenario = {
  system: "クトゥルフ神話TRPG 7版",
  title: "サンプル",
  titleKana: "さんぷる",
  players: { min: 3, max: 3 },
  playTimeHours: { min: 5, max: 6 },
  summary: "海沿いの町へ赴く。",
  markdown,
  structured: true,
};

const renderScenario = (overrides: Partial<Scenario> = {}) =>
  render(<StructuredScenario scenario={{ ...scenario, ...overrides }} />);

describe("StructuredScenario", () => {
  it("冒頭に概要をまとめて表示する", () => {
    renderScenario();
    const overview = screen.getByRole("banner");

    expect(
      within(overview).getByRole("heading", { level: 1, name: "サンプル" }),
    ).toBeInTheDocument();
    expect(within(overview).getByText("The Sample")).toBeInTheDocument();
    expect(
      within(overview).getByText("クトゥルフ神話TRPG 7版"),
    ).toBeInTheDocument();
    expect(within(overview).getByText("3人")).toBeInTheDocument();
    expect(within(overview).getByText(/5～6\s*時間程度/)).toBeInTheDocument();
    expect(
      within(overview).getByText(/舞台は現代の日本。/),
    ).toBeInTheDocument();
  });

  it("章を本文の順に並べる", () => {
    renderScenario();

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "GM 向け情報",
      "主な NPC",
      "潮上町(シオガミチョウ)",
      "潮上灯台跡",
      "クライマックス",
      "シナリオ終了",
    ]);
  });

  it("見出しに目次から移動するための id を付ける", () => {
    renderScenario();

    expect(
      screen.getByRole("heading", { name: /^GM 向け情報/ }),
    ).toHaveAttribute("id", "GM-向け情報");
    expect(screen.getByRole("heading", { name: /^潮上町/ })).toHaveAttribute(
      "id",
      "潮上町-(シオガミチョウ)",
    );
  });

  it("エンディング・その他報酬・魔導書をそれぞれの見た目で表示する", () => {
    renderScenario({
      markdown: `# サンプル

## 廃墟

### 『フサン謎の七書』

- 著者：不明

## シナリオ終了

### ED1 【腐海より戻りし者】

正気度回復: 1D10

### その他報酬 (任意)

#### 全員生還

正気度回復: 1D4
`,
    });

    const ending = screen.getByRole("heading", { name: /^ED1/ });
    expect(ending).toHaveAttribute("id", "ED1-【腐海より戻りし者】");
    expect(within(ending).getByText("ED1")).toBeInTheDocument();
    expect(within(ending).getByText("腐海より戻りし者")).toBeInTheDocument();

    const reward = screen.getByRole("heading", { name: /^その他報酬/ });
    expect(reward.closest("section")).toHaveClass("border-dashed");

    const tome = screen.getByRole("article", { name: "フサン謎の七書" });
    expect(within(tome).getByText("著者：不明")).toBeInTheDocument();
  });

  it("目次を表示する", () => {
    renderScenario();
    const nav = screen.getByRole("navigation", { name: "目次" });

    expect(
      within(nav).getByRole("link", { name: "沖嶋 深月" }),
    ).toHaveAttribute("href", "#沖嶋-深月-(オキシマ-ミツキ)");
    expect(
      within(nav).getByRole("link", { name: "ED1 【帰還】" }),
    ).toBeInTheDocument();
  });
});
