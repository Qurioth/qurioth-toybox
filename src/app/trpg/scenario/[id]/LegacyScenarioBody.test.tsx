import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LegacyScenarioBody from "./LegacyScenarioBody";

describe("LegacyScenarioBody", () => {
  it("見出しや表を整形して表示する", () => {
    render(
      <LegacyScenarioBody
        markdown={
          "# タイトル\n\n## 章\n\n| 項目 | 値 |\n| -- | -- |\n| STR | 55 |\n"
        }
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "タイトル" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "章" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "STR" })).toBeInTheDocument();
  });

  it("本文がなくても壊れない", () => {
    const { container } = render(<LegacyScenarioBody />);
    expect(container).toBeEmptyDOMElement();
  });
});
