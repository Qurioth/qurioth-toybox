import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it('toc="left" と aside で、目次・本文・右の列の 3 列にする', () => {
    render(
      <ScenarioPage
        scenario={scenario}
        toc="left"
        aside={{ label: "進行の流れ", content: <p>図</p> }}
      >
        <h2>導入</h2>
      </ScenarioPage>,
    );
    const nav = screen.getByRole("navigation", { name: "目次" });
    const column = screen.getByRole("region", { name: "進行の流れ" });

    expect(column).toHaveTextContent("図");
    expect(column.closest("aside")).toHaveClass(
      "hidden",
      "xl:block",
      "xl:col-start-3",
    );
    expect(nav.closest("aside")).toHaveClass("lg:col-start-1");
  });

  it("狭い画面では右の列を右下のボタンから開くパネルにする", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioPage
        scenario={scenario}
        toc="left"
        theme={{ border: "#123456" }}
        aside={{ label: "進行の流れ", content: <p>図</p> }}
      >
        <h2>導入</h2>
      </ScenarioPage>,
    );
    const button = screen.getByRole("button", { name: "進行の流れ" });

    expect(button).toHaveClass("xl:hidden", "bottom-16", "lg:bottom-4");
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    const panel = screen.getByRole("dialog", { name: "進行の流れ" });

    expect(within(panel).getByText("図")).toBeInTheDocument();
    expect(panel.style.getPropertyValue("--scenario-border")).toBe("#123456");

    await user.click(within(panel).getByRole("button", { name: "閉じる" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
