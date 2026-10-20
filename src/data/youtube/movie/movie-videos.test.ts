import { describe, expect, it } from "vitest";
import { movieVideos } from "./movie-videos";

/** `YYYY-MM-DD` の形で、実在する日付か */
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

describe("movieVideos の登録データ", () => {
  it("videoId が重複しない", () => {
    const videoIds = movieVideos.map(({ videoId }) => videoId);

    expect(new Set(videoIds).size).toBe(videoIds.length);
  });

  it("title が空白だけでない", () => {
    for (const { videoId, title } of movieVideos) {
      expect(title.trim(), videoId).not.toBe("");
    }
  });

  it("shotAt は YYYY-MM-DD の形で実在する日付", () => {
    for (const { videoId, shotAt } of movieVideos) {
      if (shotAt !== undefined) {
        expect(isValidDate(shotAt), `${videoId}: ${shotAt}`).toBe(true);
      }
    }
  });

  it("日付の判定は存在しない日付を弾く", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2026-2-3")).toBe(false);
  });
});
