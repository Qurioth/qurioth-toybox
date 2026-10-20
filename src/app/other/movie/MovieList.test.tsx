import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MovieVideo } from "@/data/youtube/movie/movie-videos";
import MovieList from "./MovieList";

const movies: MovieVideo[] = [
  { videoId: "old", title: "古い動画", shotAt: "2025-03-01" },
  { videoId: "undated", title: "撮影日なし" },
  { videoId: "new", title: "新しい動画", shotAt: "2026-01-15" },
];

const articleTitles = () =>
  screen
    .getAllByRole("article")
    .map(
      (article) =>
        within(article).getByRole("heading", { level: 2 }).textContent,
    );

describe("MovieList の一覧", () => {
  it("動画ごとにタイトルと遅延読み込みのプレーヤーを表示する", () => {
    render(<MovieList movies={[movies[0]]} />);

    const article = screen.getByRole("article");
    expect(
      within(article).getByRole("heading", { level: 2, name: "古い動画" }),
    ).toBeInTheDocument();

    const iframe = article.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/old");
    expect(iframe).toHaveAttribute("loading", "lazy");
  });

  it("撮影日の新しい順に並び、撮影日の無いものは末尾に来る", () => {
    render(<MovieList movies={movies} />);

    expect(articleTitles()).toEqual(["新しい動画", "古い動画", "撮影日なし"]);
  });

  it("動画が無いときはその旨を表示する", () => {
    render(<MovieList movies={[]} />);

    expect(
      screen.getByText("公開している動画はまだありません。"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});

describe("MovieList の撮影情報", () => {
  it("登録された撮影場所・撮影日・メモを項目名とともに表示する", () => {
    render(
      <MovieList
        movies={[
          {
            videoId: "full",
            title: "嵐山の竹林",
            location: "京都",
            shotAt: "2026-04-05",
            note: "朝7時ごろ。",
          },
        ]}
      />,
    );

    const article = within(screen.getByRole("article"));
    expect(article.getByText("撮影場所")).toBeInTheDocument();
    expect(article.getByText("京都")).toBeInTheDocument();
    expect(article.getByText("撮影日")).toBeInTheDocument();
    expect(article.getByText("2026-04-05")).toBeInTheDocument();
    expect(article.getByText("メモ")).toBeInTheDocument();
    expect(article.getByText("朝7時ごろ。")).toBeInTheDocument();
  });

  it("未登録や空白だけの項目は欄ごと表示しない", () => {
    render(
      <MovieList
        movies={[
          {
            videoId: "partial",
            title: "撮影場所だけ",
            location: "台湾",
            note: " ",
          },
        ]}
      />,
    );

    const article = within(screen.getByRole("article"));
    expect(article.getByText("撮影場所")).toBeInTheDocument();
    expect(article.queryByText("撮影日")).not.toBeInTheDocument();
    expect(article.queryByText("メモ")).not.toBeInTheDocument();
    expect(article.queryByText(/未設定/)).not.toBeInTheDocument();
  });

  it("改行を含むメモを全文表示する", () => {
    render(
      <MovieList
        movies={[
          {
            videoId: "multiline",
            title: "夜市",
            note: "1行目のメモ\n2行目のメモ",
          },
        ]}
      />,
    );

    const article = screen.getByRole("article");
    expect(article).toHaveTextContent("1行目のメモ");
    expect(article).toHaveTextContent("2行目のメモ");
  });
});
