import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Scenario, ScenarioInfo } from "@/data/scenario/scenario-list";
import ScenarioDetailBody from "./ScenarioDetailBody";

const FakePage = ({ scenario }: { scenario: ScenarioInfo }) => (
  <h2>{scenario.title}の専用ページ</h2>
);

const base: Scenario = {
  title: "サンプル",
  titleKana: "さんぷる",
  system: "クトゥルフ神話TRPG 7版",
  players: { min: 3, max: 4 },
  playTimeHours: { min: 5, max: 5 },
  summary: "あらすじ。",
};

const renderBody = async (scenario?: Scenario) =>
  render(await ScenarioDetailBody({ scenario }));

describe("ScenarioDetailBody", () => {
  it("専用ページを持つシナリオでは専用ページに登録情報を渡して描画する", async () => {
    await renderBody({
      ...base,
      page: async () => ({ default: FakePage }),
    });

    expect(
      screen.getByRole("heading", { name: "サンプルの専用ページ" }),
    ).toBeInTheDocument();
  });

  it("クトゥルフ神話TRPG のシナリオには権利表記を付ける", async () => {
    const { container } = await renderBody({
      ...base,
      page: async () => ({ default: FakePage }),
    });

    expect(container).toHaveTextContent("Chaosium");
  });

  it("他システムのシナリオには権利表記を付けない", async () => {
    const { container } = await renderBody({
      ...base,
      system: "駆け出しアイドルRPG ビギニングアイドル",
      markdown: "# アイドル\n",
    });

    expect(container).not.toHaveTextContent("Chaosium");
  });

  it("本文だけのシナリオは従来の整形表示にする", async () => {
    await renderBody({ ...base, markdown: "# 従来の本文\n\n## 章\n" });

    expect(
      screen.getByRole("heading", { level: 1, name: "従来の本文" }),
    ).toBeInTheDocument();
  });

  it("シナリオが見つからなくても壊れない", async () => {
    const { container } = await renderBody(undefined);

    expect(container).not.toHaveTextContent("Chaosium");
  });
});
