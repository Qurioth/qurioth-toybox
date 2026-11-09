import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OTHER_COVER_MOVIE } from "@/constants/movie";
import { OTHER_COVER_ALBUM } from "@/constants/photograph";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import { albums } from "@/data/photograph/albums";
import { movieVideos } from "@/data/youtube/movie/movie-videos";
import { albumCover, photoUrl } from "@/utils/photograph-utils";
import OtherPage from "./page";

const renderPage = () =>
  render(
    <DarkModeProvider>
      <OtherPage />
    </DarkModeProvider>,
  );

const card = (name: string) => {
  const heading = screen.getByRole("heading", { level: 2, name });
  const link = heading.closest("a");
  if (!link) throw new Error(`${name} のカードがリンクになっていない`);
  return link;
};

describe("OtherPage の区分", () => {
  it("写真・動画の順に区分のカードが並ぶ", () => {
    renderPage();

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(["Photograph", "Movie"]);
  });

  it("各区分のカードがそれぞれの一覧画面を指す", () => {
    renderPage();

    expect(card("Photograph")).toHaveAttribute("href", "/other/photograph");
    expect(card("Movie")).toHaveAttribute("href", "/other/movie");
  });

  it("カードに件数を出す", () => {
    renderPage();

    expect(
      within(card("Photograph")).getByText(
        `${Object.keys(albums).length}アルバム`,
      ),
    ).toBeInTheDocument();
    expect(
      within(card("Movie")).getByText(`${movieVideos.length}本`),
    ).toBeInTheDocument();
  });

  it("写真のカードの画像は、指定したアルバムの表紙", () => {
    renderPage();

    const image = card("Photograph").querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      photoUrl(albumCover(albums[OTHER_COVER_ALBUM]).key, 1280),
    );
  });

  it("動画のカードの画像は、指定した動画のサムネイル", () => {
    renderPage();

    const image = card("Movie").querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      `https://i.ytimg.com/vi/${OTHER_COVER_MOVIE}/hqdefault.jpg`,
    );
  });
});

describe("OTHER_COVER_MOVIE", () => {
  it("動画一覧にある動画を指している(書き間違えると最新の動画に変わってしまうため)", () => {
    expect(movieVideos.map(({ videoId }) => videoId)).toContain(
      OTHER_COVER_MOVIE,
    );
  });
});

describe("OTHER_COVER_ALBUM", () => {
  it("存在するアルバムを指している(書き間違えると最新のアルバムに変わってしまうため)", () => {
    expect(Object.keys(albums)).toContain(OTHER_COVER_ALBUM);
  });
});
