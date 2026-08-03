import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import Home from "./page";

const sampleLogHtml = `
  <p style="margin: 0px;"><span> [メイン]</span><span>キャラクター太郎</span> :<span>1d100&lt;=50 → 23 成功</span></p>
  <p style="margin: 0px;"><span> [メイン]</span><span>キャラクター花子</span> :<span>1d100&lt;=50 → 88 失敗</span></p>
`;

const renderPage = () =>
  render(
    <DarkModeProvider>
      <Home />
    </DarkModeProvider>,
  );

describe("ccfolia-grep page", () => {
  it("ログファイルをアップロード→選択→実行で、フィルタされた結果が表示される", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File([sampleLogHtml], "log.txt", { type: "text/plain" });
    const fileInput = screen.getByLabelText("CCFOLIA LOG FILE");
    await user.upload(fileInput, file);

    const select = await screen.findByRole("combobox");
    await waitFor(() =>
      expect(select).toHaveTextContent("キャラクター太郎"),
    );

    await user.selectOptions(select, "キャラクター太郎");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("[メイン] キャラクター太郎 1d100<=50 → 23 成功"),
    ).toBeInTheDocument();
    // 花子は選択肢としては残るが、結果テキストには含まれない(太郎でフィルタしたため)
    expect(
      screen.queryByText("[メイン] キャラクター花子 1d100<=50 → 88 失敗"),
    ).not.toBeInTheDocument();
  });
});
