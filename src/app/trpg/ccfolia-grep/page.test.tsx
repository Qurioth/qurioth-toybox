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
    await waitFor(() => expect(select).toHaveTextContent("キャラクター太郎"));

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

  it("ファイル未選択のままSubmitすると、空の見出し付き結果が表示される(既存の挙動)", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    // dicelog.current・selectName.currentが初期値(空)のままgrepDicelogが実行され、
    // "**" + "**" = "****" という見出しと空のコードブロックが表示される
    expect(await screen.findByText("****")).toBeInTheDocument();
  });

  it("成功度のチェックを外すと、対応する行が結果から除外される", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File([sampleLogHtml], "log.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("CCFOLIA LOG FILE"), file);
    const select = await screen.findByRole("combobox");
    await waitFor(() => expect(select).toHaveTextContent("キャラクター太郎"));
    await user.selectOptions(select, "キャラクター太郎");

    // デフォルトでチェック済みの「成功」を外す
    await user.click(screen.getByRole("checkbox", { name: "成功" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // 「成功」を外したので、太郎の行(成功)が結果から除外される
    await waitFor(() =>
      expect(screen.getByText("**キャラクター太郎**")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText("[メイン] キャラクター太郎 1d100<=50 → 23 成功"),
    ).not.toBeInTheDocument();
  });
});
