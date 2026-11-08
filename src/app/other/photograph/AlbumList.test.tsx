import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Album } from "@/data/photograph/album-types";
import { photoUrl } from "@/utils/photograph-utils";
import AlbumList from "./AlbumList";

const albums: Record<string, Album> = {
  "2025-03-ume": {
    title: "梅",
    date: "2025-03-01",
    photos: [{ key: "aaaaaaaaaaaaaaaa", width: 1280, height: 853 }],
  },
  "2026-01-fukuoka": {
    title: "福岡",
    date: "2026-01-15",
    photos: [
      { key: "bbbbbbbbbbbbbbbb", width: 1280, height: 1920 },
      { key: "cccccccccccccccc", width: 1280, height: 853 },
    ],
  },
};

describe("AlbumList", () => {
  it("アルバムごとに、アルバムの画面へのリンクを出す", () => {
    render(<AlbumList albums={albums} />);

    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([
      "/other/photograph/2026-01-fukuoka",
      "/other/photograph/2025-03-ume",
    ]);
  });

  it("カードにタイトル・撮影日・枚数を出す", () => {
    render(<AlbumList albums={albums} />);

    const card = screen.getAllByRole("link")[0];
    expect(within(card).getByText("福岡")).toBeInTheDocument();
    expect(within(card).getByText("2026-01-15")).toBeInTheDocument();
    expect(within(card).getByText("2枚")).toBeInTheDocument();
  });

  it("撮影日の新しい順に並ぶ", () => {
    render(<AlbumList albums={albums} />);

    expect(
      screen
        .getAllByRole("link")
        .map((link) => within(link).getByRole("heading").textContent),
    ).toEqual(["福岡", "梅"]);
  });

  it("表紙は先頭の写真の 640px 版で、大きさを持つ", () => {
    render(<AlbumList albums={albums} />);

    const cover = within(screen.getAllByRole("link")[0]).getByRole("img");
    expect(cover).toHaveAttribute("src", photoUrl("bbbbbbbbbbbbbbbb", 640));
    expect(cover).toHaveAttribute("width", "1280");
    expect(cover).toHaveAttribute("height", "1920");
    expect(cover).toHaveAttribute("loading", "lazy");
  });

  it("アルバムが無いときはその旨を出す", () => {
    render(<AlbumList albums={{}} />);

    expect(screen.getByText("まだアルバムがありません")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
