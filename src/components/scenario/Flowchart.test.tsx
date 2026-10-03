import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Flowchart from "./Flowchart";
import { renderMdx } from "./render-mdx";

const mermaid = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(async () => ({ svg: '<svg data-testid="chart"></svg>' })),
}));

vi.mock("./load-mermaid", () => ({ loadMermaid: async () => mermaid }));

describe("Flowchart", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    vi.clearAllMocks();
  });

  it("図を横スクロールできる枠の中に描画する", async () => {
    render(<Flowchart chart={"flowchart TD\n  導入 --> 廃墟"} />);

    expect(await screen.findByTestId("chart")).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "フローチャート" })).toHaveClass(
      "overflow-x-auto",
    );
    expect(mermaid.render).toHaveBeenCalledWith(
      expect.any(String),
      "flowchart TD\n  導入 --> 廃墟",
    );
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ securityLevel: "strict", theme: "default" }),
    );
  });

  it("ダークモードでは暗い背景用の配色で描画する", async () => {
    document.documentElement.classList.add("dark");
    render(<Flowchart chart="flowchart TD" />);

    await waitFor(() =>
      expect(mermaid.initialize).toHaveBeenLastCalledWith(
        expect.objectContaining({ theme: "dark" }),
      ),
    );
  });

  it("描画に失敗したら元の記法をそのまま表示する", async () => {
    mermaid.render.mockRejectedValueOnce(new Error("parse error"));
    render(<Flowchart chart="これは図ではない" />);

    expect(await screen.findByText("これは図ではない")).toBeInTheDocument();
  });

  it("MDX の mermaid コードブロックをフローチャートにする", async () => {
    await renderMdx("```mermaid\nflowchart TD\n  A --> B\n```\n");

    expect(await screen.findByTestId("chart")).toBeInTheDocument();
    expect(mermaid.render).toHaveBeenCalledWith(
      expect.any(String),
      "flowchart TD\n  A --> B\n",
    );
  });
});
