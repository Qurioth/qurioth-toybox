import { describe, expect, it } from "vitest";
import type { MovieVideo } from "@/data/youtube/movie/movie-videos";
import { sortMoviesByShotAt } from "./movie-utils";

const movie = (videoId: string, shotAt?: string): MovieVideo => ({
  videoId,
  title: videoId,
  shotAt,
});

const ids = (movies: MovieVideo[]) => movies.map(({ videoId }) => videoId);

describe("sortMoviesByShotAt", () => {
  it("撮影日の新しい順に並ぶ", () => {
    const movies = [
      movie("a", "2025-03-01"),
      movie("b", "2026-01-15"),
      movie("c", "2025-12-31"),
    ];

    expect(ids(sortMoviesByShotAt(movies))).toEqual(["b", "c", "a"]);
  });

  it("撮影日が同じものは登録順を保つ", () => {
    const movies = [
      movie("a", "2026-01-15"),
      movie("b", "2026-02-01"),
      movie("c", "2026-01-15"),
    ];

    expect(ids(sortMoviesByShotAt(movies))).toEqual(["b", "a", "c"]);
  });

  it("撮影日の無いものは末尾に登録順で並ぶ", () => {
    const movies = [
      movie("a"),
      movie("b", "2025-03-01"),
      movie("c"),
      movie("d", "2026-01-15"),
    ];

    expect(ids(sortMoviesByShotAt(movies))).toEqual(["d", "b", "a", "c"]);
  });

  it("入力の配列を変更しない", () => {
    const movies = [movie("a", "2025-03-01"), movie("b", "2026-01-15")];

    sortMoviesByShotAt(movies);

    expect(ids(movies)).toEqual(["a", "b"]);
  });
});
