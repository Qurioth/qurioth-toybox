import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DarkModeProvider } from "@/contexts/dark-mode-context";
import OtherPage from "./page";

const renderPage = () =>
  render(
    <DarkModeProvider>
      <OtherPage />
    </DarkModeProvider>,
  );

describe("OtherPage の区分", () => {
  it("写真・動画の順に区分の見出しが並ぶ", () => {
    renderPage();

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(["Photograph", "Movie"]);
  });

  it("各区分の入口がそれぞれの一覧画面を指す", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "Photograph" })).toHaveAttribute(
      "href",
      "/other/photograph",
    );
    expect(screen.getByRole("link", { name: "Movie" })).toHaveAttribute(
      "href",
      "/other/movie",
    );
  });
});
