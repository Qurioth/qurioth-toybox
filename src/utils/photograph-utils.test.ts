import { describe, expect, it } from "vitest";
import { PHOTO_BASE_URL } from "@/constants/photograph";
import type { Album, Photo } from "@/data/photograph/album-types";
import {
  justifyRows,
  type PhotoRow,
  photoSrcSet,
  photoUrl,
  rowTargetHeight,
  sortAlbums,
} from "./photograph-utils";

const landscape = (key: string): Photo => ({ key, width: 1280, height: 853 });
const portrait = (key: string): Photo => ({ key, width: 1280, height: 1920 });

const keys = (rows: PhotoRow[]) =>
  rows.map((row) => row.photos.map(({ key }) => key));

/** 行の写真の幅と隙間の合計 */
const rowWidth = (row: PhotoRow, gap: number) =>
  row.photos.reduce(
    (sum, { width, height }) => sum + (width / height) * row.height,
    0,
  ) +
  gap * (row.photos.length - 1);

describe("photoUrl", () => {
  it("Worker の URL に キー-幅.webp を付ける", () => {
    expect(photoUrl("0123456789abcdef", 640)).toBe(
      `${PHOTO_BASE_URL}/0123456789abcdef-640.webp`,
    );
  });
});

describe("photoSrcSet", () => {
  const url = (width: number) => photoUrl("k", width);

  it("幅 1280 の写真では 640w と 1280w を並べる", () => {
    expect(photoSrcSet({ key: "k", width: 1280, height: 853 })).toBe(
      `${url(640)} 640w, ${url(1280)} 1280w`,
    );
  });

  it("元が 1280px より小さい写真では、大きい版に実際の幅を書く", () => {
    expect(photoSrcSet({ key: "k", width: 900, height: 600 })).toBe(
      `${url(640)} 640w, ${url(1280)} 900w`,
    );
  });

  it("元が 640px より小さい写真では、両方に実際の幅を書く", () => {
    expect(photoSrcSet({ key: "k", width: 500, height: 400 })).toBe(
      `${url(640)} 500w, ${url(1280)} 500w`,
    );
  });
});

describe("sortAlbums", () => {
  const album = (date: string): Album => ({
    title: date,
    date,
    photos: [landscape("a")],
  });

  it("撮影日の新しい順に並ぶ", () => {
    const albums = {
      a: album("2025-03-01"),
      b: album("2026-01-15"),
      c: album("2025-12-31"),
    };

    expect(sortAlbums(albums).map(({ slug }) => slug)).toEqual(["b", "c", "a"]);
  });

  it("撮影日が同じものは slug の昇順に並ぶ", () => {
    const albums = {
      "nemophila-b": album("2025-04-05"),
      "nemophila-a": album("2025-04-05"),
    };

    expect(sortAlbums(albums).map(({ slug }) => slug)).toEqual([
      "nemophila-a",
      "nemophila-b",
    ]);
  });

  it("各要素にアルバムの中身と slug が付く", () => {
    const nemophila = album("2025-04-05");

    expect(sortAlbums({ nemophila })).toEqual([
      { ...nemophila, slug: "nemophila" },
    ]);
  });

  it("入力を変更しない", () => {
    const albums = { a: album("2025-03-01"), b: album("2026-01-15") };
    const before = structuredClone(albums);

    sortAlbums(albums);

    expect(albums).toEqual(before);
  });
});

describe("rowTargetHeight", () => {
  it("420px と表示幅の半分の小さいほう", () => {
    expect(rowTargetHeight(945)).toBe(420);
    expect(rowTargetHeight(343)).toBe(171.5);
  });
});

describe("justifyRows", () => {
  const WIDTH = 945;
  const GAP = 16;

  it("目安の高さで並べた幅が表示幅に達したところで行を区切る", () => {
    // 横長1枚は高さ 280px で幅約 420px。2枚では 856px で足りず、3枚目で表示幅を超える
    const photos = ["a", "b", "c", "d"].map(landscape);

    expect(keys(justifyRows(photos, WIDTH, 280, GAP))).toEqual([
      ["a", "b", "c"],
      ["d"],
    ]);
  });

  it("区切った行は、写真の幅と隙間の合計が表示幅にちょうど等しい", () => {
    const photos = [
      portrait("a"),
      portrait("b"),
      landscape("c"),
      landscape("d"),
    ];
    const [row] = justifyRows(photos, WIDTH, 420, GAP);

    expect(keys([row])).toEqual([["a", "b", "c"]]);
    expect(rowWidth(row, GAP)).toBeCloseTo(WIDTH);
    expect(row.height).toBeLessThan(420);
  });

  it("最後の行は目安の高さのまま", () => {
    const rows = justifyRows(
      ["a", "b", "c", "d"].map(landscape),
      WIDTH,
      280,
      GAP,
    );

    expect(rows[rows.length - 1].height).toBe(280);
  });

  it("1枚だけで表示幅を超える写真は、その1枚の行にして表示幅に収める", () => {
    const panorama: Photo = { key: "p", width: 1280, height: 300 };
    const [row] = justifyRows([panorama, landscape("b")], WIDTH, 420, GAP);

    expect(keys([row])).toEqual([["p"]]);
    expect(rowWidth(row, GAP)).toBeCloseTo(WIDTH);
  });

  it("後ろに写真を足しても、それまでの最後の行より前の行は変わらない", () => {
    const photos = [
      portrait("a"),
      landscape("b"),
      landscape("c"),
      portrait("d"),
      landscape("e"),
      landscape("f"),
      landscape("g"),
    ];
    const before = justifyRows(photos.slice(0, 5), WIDTH, 420, GAP);
    const after = justifyRows(photos, WIDTH, 420, GAP);

    expect(after.slice(0, before.length - 1)).toEqual(before.slice(0, -1));
  });

  it("写真が無ければ空の配列", () => {
    expect(justifyRows([], WIDTH, 420, GAP)).toEqual([]);
  });
});
