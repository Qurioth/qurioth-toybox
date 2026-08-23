import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import { replayVideos } from "@/data/youtube/trpg/youtube-id";
import ReplayPage from "./page";

const renderPage = () =>
  render(
    <DarkModeProvider>
      <ReplayPage />
    </DarkModeProvider>,
  );

const searchBox = () => screen.getByPlaceholderText(/シナリオタイトル/);

/** 「N件 / M件」の N を読む */
const matchedCount = () => {
  const text = screen.getByText(/\d+件 \/ \d+件/).textContent ?? "";
  return Number(text.match(/^(\d+)件/)?.[1]);
};

describe("ReplayPage の検索", () => {
  it("初期表示は全件が対象", () => {
    renderPage();

    expect(matchedCount()).toBe(replayVideos.length);
  });

  it("フリーワードで絞り込める", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "リアン");

    const count = matchedCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(replayVideos.length);
  });

  it("フィールド指定(gm:)で絞り込める", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "gm:リアン");

    expect(matchedCount()).toBeGreaterThan(0);
    expect(matchedCount()).toBeLessThan(replayVideos.length);
  });

  it("一致するものがなければメッセージを出す", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "存在しないはずのキーワードxyzzy");

    expect(matchedCount()).toBe(0);
    expect(
      screen.getByText("条件に一致するリプレイはありません。"),
    ).toBeInTheDocument();
  });

  it("サジェストを選ぶとチップになり、絞り込みが効く", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "リアン");

    // サジェストからGM名のものを選ぶ
    const suggestion = await screen.findByRole("button", {
      name: /GM名\s*リアン/,
    });
    await user.click(suggestion);

    // 入力欄は空になり、チップが残る
    expect(searchBox()).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "GM名 リアンを削除" }),
    ).toBeInTheDocument();
    expect(matchedCount()).toBeGreaterThan(0);
    expect(matchedCount()).toBeLessThan(replayVideos.length);
  });

  it("チップを削除すると絞り込みが解除される", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "リアン");
    await user.click(
      await screen.findByRole("button", { name: /GM名\s*リアン/ }),
    );
    expect(matchedCount()).toBeLessThan(replayVideos.length);

    await user.click(screen.getByRole("button", { name: "GM名 リアンを削除" }));

    expect(matchedCount()).toBe(replayVideos.length);
  });

  it("クリアボタンで入力とチップの両方が消える", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(searchBox(), "リアン");
    await user.click(
      await screen.findByRole("button", { name: /GM名\s*リアン/ }),
    );
    await user.type(searchBox(), "クトゥルフ");

    await user.click(
      screen.getByRole("button", { name: "検索キーワードをクリア" }),
    );

    expect(searchBox()).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: "GM名 リアンを削除" }),
    ).not.toBeInTheDocument();
    expect(matchedCount()).toBe(replayVideos.length);
  });
});
