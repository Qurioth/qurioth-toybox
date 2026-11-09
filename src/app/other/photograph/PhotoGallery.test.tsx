import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Photo } from "@/data/photograph/album-types";
import {
  justifyRows,
  photoSrcSet,
  photoUrl,
  rowTargetHeight,
} from "@/utils/photograph-utils";
import PhotoGallery from "./PhotoGallery";

const WIDTH = 945;
const GAP = 16;

const photo = (index: number, portrait = false): Photo => ({
  key: index.toString(16).padStart(16, "0"),
  width: 1280,
  height: portrait ? 1920 : 853,
});

/** 3枚に1枚を縦長にした写真 */
const photos = (count: number) =>
  Array.from({ length: count }, (_, index) => photo(index, index % 3 === 0));

/** jsdom は大きさを計算しないため、写真を並べる領域の幅を与える */
const mockWidth = (width: number) =>
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width);

const rowSources = () =>
  screen.getAllByTestId("photo-row").map((row) =>
    within(row)
      .queryAllByRole("img")
      .map((img) => img.getAttribute("src")),
  );

const expectedSources = (items: Photo[]) =>
  justifyRows(items, WIDTH, rowTargetHeight(WIDTH), GAP).map((row) =>
    row.photos.map(({ key }) => photoUrl(key, 640)),
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PhotoGallery の並び", () => {
  it("サーバーでの描画では写真を並べず、場所だけ確保する", () => {
    const html = renderToString(<PhotoGallery photos={photos(5)} title="t" />);

    expect(html).toContain("gallery-pending");
    expect(html).not.toContain("<img");
  });

  it("表示幅が分からないうちは写真を並べない", () => {
    mockWidth(0);
    render(<PhotoGallery photos={photos(5)} title="t" />);

    expect(screen.getByTestId("gallery-pending")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("各行の写真は、行の高さを揃える組み方の結果のとおり", () => {
    mockWidth(WIDTH);
    const items = photos(12);
    render(<PhotoGallery photos={items} title="t" />);

    expect(rowSources()).toEqual(expectedSources(items));
  });

  it("写真は行の高さと縦横比から決まる大きさで並ぶ", () => {
    mockWidth(WIDTH);
    const items = photos(12);
    render(<PhotoGallery photos={items} title="t" />);

    const [firstRow] = justifyRows(items, WIDTH, rowTargetHeight(WIDTH), GAP);
    const frame = screen.getByRole("img", { name: "t 1枚目" }).parentElement;
    // jsdom はスタイルの数値を丸めるため、近さで比べる
    expect(Number.parseFloat(frame?.style.height ?? "")).toBeCloseTo(
      firstRow.height,
      2,
    );
    expect(Number.parseFloat(frame?.style.width ?? "")).toBeCloseTo(
      (1280 / 1920) * firstRow.height,
      2,
    );
  });

  it("画像は実際の大きさ・srcset・遅延読み込みを持つ", () => {
    mockWidth(WIDTH);
    const item = photo(1, true);
    render(<PhotoGallery photos={[item]} title="福岡" />);

    const img = screen.getByRole("img", { name: "福岡 1枚目" });
    expect(img).toHaveAttribute("width", "1280");
    expect(img).toHaveAttribute("height", "1920");
    expect(img).toHaveAttribute("srcset", photoSrcSet(item));
    expect(img).toHaveAttribute("sizes");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("読み込みに失敗した枠だけにその旨を出し、他の写真は残す", () => {
    mockWidth(WIDTH);
    render(<PhotoGallery photos={photos(3)} title="t" />);

    fireEvent.error(screen.getByRole("img", { name: "t 1枚目" }));

    expect(
      screen.getByText("画像の読み込みに失敗しました"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("読み込みが終わるまでプレースホルダを出す", () => {
    mockWidth(WIDTH);
    render(<PhotoGallery photos={[photo(1, true)]} title="t" />);

    expect(screen.getByTestId("photo-placeholder")).toBeInTheDocument();

    fireEvent.load(screen.getByRole("img"));

    expect(screen.queryByTestId("photo-placeholder")).not.toBeInTheDocument();
  });
});

describe("PhotoGallery の続きの読み込み", () => {
  let intersect: () => void;
  const OriginalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    mockWidth(WIDTH);
    globalThis.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = () =>
          callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = OriginalIntersectionObserver;
  });

  it("最初は20枚で、目印が画面に入るたびに20枚ずつ増え、最後に目印が消える", () => {
    render(<PhotoGallery photos={photos(45)} title="t" />);
    expect(screen.getAllByRole("img")).toHaveLength(20);

    act(() => intersect());
    expect(screen.getAllByRole("img")).toHaveLength(40);

    act(() => intersect());
    expect(screen.getAllByRole("img")).toHaveLength(45);
    expect(screen.queryByTestId("load-more")).not.toBeInTheDocument();
  });

  it("増える前の最後の行より前の行は変わらない", () => {
    const items = photos(45);
    render(<PhotoGallery photos={items} title="t" />);
    const before = rowSources();

    act(() => intersect());

    expect(before).toEqual(expectedSources(items.slice(0, 20)));
    expect(rowSources().slice(0, before.length - 1)).toEqual(
      before.slice(0, -1),
    );
  });

  it("20枚以下のアルバムは、最初からすべて出て目印が無い", () => {
    render(<PhotoGallery photos={photos(15)} title="t" />);

    expect(screen.getAllByRole("img")).toHaveLength(15);
    expect(screen.queryByTestId("load-more")).not.toBeInTheDocument();
  });
});
