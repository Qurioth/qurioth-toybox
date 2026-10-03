import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CopyKomaButton from "./CopyKomaButton";

const npc = { name: "沖嶋 深月", profile: "写真家。" };

const mockClipboard = (writeText: (text: string) => Promise<void>) => {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: spy },
    configurable: true,
  });
  return spy;
};

describe("CopyKomaButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("コマの JSON をクリップボードに書き込み、成功を知らせる", async () => {
    const user = userEvent.setup();
    render(<CopyKomaButton npc={npc} />);
    const writeText = mockClipboard(async () => {});

    await user.click(screen.getByRole("button", { name: "CCFOLIA コマ出力" }));

    expect(JSON.parse(writeText.mock.calls[0][0])).toEqual({
      kind: "character",
      data: { name: "沖嶋 深月", memo: "写真家。" },
    });
    expect(await screen.findByText("コピーしました。")).toBeInTheDocument();
  });

  it("書き込めなかったときは失敗を知らせる", async () => {
    const user = userEvent.setup();
    render(<CopyKomaButton npc={npc} />);
    mockClipboard(async () => {
      throw new Error("denied");
    });

    await user.click(screen.getByRole("button", { name: "CCFOLIA コマ出力" }));

    expect(
      await screen.findByText("コピーできませんでした"),
    ).toBeInTheDocument();
  });
});
