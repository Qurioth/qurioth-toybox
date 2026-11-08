import { describe, expect, it } from "vitest";
import {
  correlation,
  groupSimilar,
  isSimilarPair,
  isValidSlug,
  parsePhotoList,
  shotAtFromExif,
  similarityVector,
} from "./photo-list-utils";

const ROOT = "F:\\Pictures";

const list = (...lines: string[]) =>
  ["# title: ネモフィラ", "# date: 2025-04-05", ...lines].join("\n");

describe("parsePhotoList", () => {
  it("タイトルと撮影日を読む", () => {
    const parsed = parsePhotoList(list("2025年\\a.JPG"), ROOT);

    expect(parsed.title).toBe("ネモフィラ");
    expect(parsed.date).toBe("2025-04-05");
    expect(parsed.errors).toEqual([]);
  });

  it("空行と他の # 行を無視し、行番号を保つ", () => {
    const parsed = parsePhotoList(
      list("", "# メモ", "2025年\\a.JPG", "  ", "2025年\\b.jpg"),
      ROOT,
    );

    expect(parsed.entries).toEqual([
      { line: 5, path: "2025年\\a.JPG" },
      { line: 7, path: "2025年\\b.jpg" },
    ]);
  });

  it('前後の空白と、前後を囲む " を取り除く', () => {
    const parsed = parsePhotoList(list('  "2025年\\a.JPG"  '), ROOT);

    expect(parsed.entries).toEqual([{ line: 3, path: "2025年\\a.JPG" }]);
  });

  it("/ 区切りを \\ に揃える", () => {
    const parsed = parsePhotoList(list("2025年/2025-04-05/a.JPG"), ROOT);

    expect(parsed.entries[0].path).toBe("2025年\\2025-04-05\\a.JPG");
  });

  it("PHOTO_SOURCE_ROOT の下の絶対パスを相対パスに直し、直した全文を返す", () => {
    const parsed = parsePhotoList(
      list('"f:\\pictures\\2025年\\a.JPG"', "2025年\\b.JPG"),
      ROOT,
    );

    expect(parsed.entries.map(({ path }) => path)).toEqual([
      "2025年\\a.JPG",
      "2025年\\b.JPG",
    ]);
    expect(parsed.rewrittenText).toBe(list("2025年\\a.JPG", "2025年\\b.JPG"));
  });

  it("絶対パスが無ければ、直した全文は返さない", () => {
    expect(parsePhotoList(list("2025年\\a.JPG"), ROOT).rewrittenText).toBe(
      null,
    );
  });

  it("PHOTO_SOURCE_ROOT の外を指すパスを行番号つきのエラーにする", () => {
    const parsed = parsePhotoList(
      list("D:\\Other\\a.JPG", "..\\Other\\b.JPG", "F:\\PicturesOld\\c.JPG"),
      ROOT,
    );

    expect(parsed.errors).toEqual([
      { line: 3, message: "PHOTO_SOURCE_ROOT の外のファイルです" },
      { line: 4, message: "PHOTO_SOURCE_ROOT の外のファイルです" },
      { line: 5, message: "PHOTO_SOURCE_ROOT の外のファイルです" },
      { line: null, message: "写真が1枚もありません" },
    ]);
  });

  it("JPG と NEF 以外をエラーにする", () => {
    const parsed = parsePhotoList(
      list("a.MOV", "b.NEF", "c.jpeg", "d.png"),
      ROOT,
    );

    expect(parsed.entries.map(({ path }) => path)).toEqual(["b.NEF", "c.jpeg"]);
    expect(parsed.errors.map(({ line }) => line)).toEqual([3, 6]);
  });

  it("タイトル・撮影日が無い、または撮影日が実在しないとエラーにする", () => {
    expect(parsePhotoList("a.JPG", ROOT).errors).toHaveLength(2);
    expect(
      parsePhotoList("# title: t\n# date: 2025-02-30\na.JPG", ROOT).errors,
    ).toEqual([
      {
        line: null,
        message: "撮影日(# date: YYYY-MM-DD)を正しく書いてください",
      },
    ]);
  });

  it("写真が1枚も無いとエラーにする", () => {
    expect(parsePhotoList(list(), ROOT).errors).toEqual([
      { line: null, message: "写真が1枚もありません" },
    ]);
  });
});

describe("isValidSlug", () => {
  it("英小文字・数字・- だけを受け付ける", () => {
    expect(isValidSlug("2025-04-nemophila")).toBe(true);
    expect(isValidSlug("Nemophila")).toBe(false);
    expect(isValidSlug("ネモフィラ")).toBe(false);
    expect(isValidSlug("-nemophila")).toBe(false);
    expect(isValidSlug("nemophila-")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});
describe("似た写真の見分け方", () => {
  /** 8×8 の明るさを、行ごとの値から作る(全行同じ) */
  const pixels = (row: number[]) => Array.from({ length: 8 }, () => row).flat();
  const brightening = pixels([0, 1, 2, 3, 4, 5, 6, 7]);
  const darkening = pixels([7, 6, 5, 4, 3, 2, 1, 0]);

  it("同じ並びの画像は、明るさの全体がずれていても相関 1", () => {
    const brighter = brightening.map((value) => value * 2 + 50);

    expect(
      correlation(similarityVector(brightening), similarityVector(brighter)),
    ).toBeCloseTo(1);
  });

  it("明暗が逆の画像は相関 -1", () => {
    expect(
      correlation(similarityVector(brightening), similarityVector(darkening)),
    ).toBeCloseTo(-1);
  });

  it("一面同じ明るさの画像は、どの画像とも相関 0", () => {
    const flat = similarityVector(pixels([5, 5, 5, 5, 5, 5, 5, 5]));

    expect(flat.every((value) => value === 0)).toBe(true);
    expect(correlation(flat, similarityVector(brightening))).toBe(0);
  });

  it("Exif の日時のうち最も早いものを撮影時刻とする", () => {
    const header =
      "....2025:07:08 20:33:36....2025:07:05 15:28:58....2025:07:05 15:28:58";

    expect(shotAtFromExif(header)).toBe(Date.UTC(2025, 6, 5, 15, 28, 58));
    expect(shotAtFromExif("no exif")).toBe(null);
  });

  const at = (seconds: number) => Date.UTC(2025, 6, 5, 15, 0, seconds);
  const same = similarityVector(brightening);
  const other = similarityVector(darkening);

  it("撮影時刻が30秒以内で相関が高い組を、連写とみなす", () => {
    expect(
      isSimilarPair(
        { vector: same, shotAt: at(0) },
        { vector: same, shotAt: at(30) },
      ),
    ).toBe(true);
  });

  it("相関が高くても、撮影時刻が30秒より離れていれば連写とみなさない", () => {
    expect(
      isSimilarPair(
        { vector: same, shotAt: at(0) },
        { vector: same, shotAt: at(31) },
      ),
    ).toBe(false);
  });

  it("撮影時刻が近くても、相関が低ければ連写とみなさない", () => {
    expect(
      isSimilarPair(
        { vector: same, shotAt: at(0) },
        { vector: other, shotAt: at(1) },
      ),
    ).toBe(false);
  });

  it("撮影時刻の分からない写真は比べない", () => {
    expect(
      isSimilarPair(
        { vector: same, shotAt: null },
        { vector: same, shotAt: at(0) },
      ),
    ).toBe(false);
  });

  it("連写の組をつなぎ、つながった写真は1グループにし、1枚だけのグループは返さない", () => {
    // A〜B と B〜C は30秒以内、A〜C は40秒離れている。D は時刻が離れている
    const items = [
      { vector: same, shotAt: at(0) },
      { vector: same, shotAt: at(20) },
      { vector: same, shotAt: at(40) },
      { vector: same, shotAt: at(59) + 60_000 },
    ];

    expect(groupSimilar(items)).toEqual([[0, 1, 2]]);
  });
});
