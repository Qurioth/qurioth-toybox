import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ScenarioInfo } from "@/data/scenario/scenario-list";
import ScenarioPage from "./ScenarioPage";
import { useScenarioInfo } from "./ScenarioInfoContext";

const scenario: ScenarioInfo = {
  title: "サンプル",
  system: "クトゥルフ神話TRPG 7版",
  players: { min: 3, max: 4 },
  playTimeHours: { min: 5, max: 5 },
};

const ShowTitle = () => <p>{useScenarioInfo()?.title}</p>;

describe("ScenarioPage", () => {
  it("配色を CSS 変数として外枠に設定し、指定しない色は既定にする", () => {
    const { container } = render(
      <ScenarioPage
        scenario={scenario}
        theme={{ accent: "#0e7490", dark: { accent: "#67e8f9" } }}
        className="bg-sky-50"
      >
        本文
      </ScenarioPage>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue("--scenario-accent")).toBe("#0e7490");
    expect(root.style.getPropertyValue("--scenario-accent-dark")).toBe(
      "#67e8f9",
    );
    expect(root.style.getPropertyValue("--scenario-border")).not.toBe("");
    expect(root).toHaveClass("bg-sky-50");
  });

  it("本文の要素に data-scenario-body を付ける", () => {
    render(<ScenarioPage scenario={scenario}>本文</ScenarioPage>);

    expect(screen.getByText("本文")).toHaveAttribute("data-scenario-body");
  });

  it("子の部品から登録情報を読める", () => {
    render(
      <ScenarioPage scenario={scenario}>
        <ShowTitle />
      </ScenarioPage>,
    );

    expect(screen.getByText("サンプル")).toBeInTheDocument();
  });
});
