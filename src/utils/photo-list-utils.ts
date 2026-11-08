/**
 * 写真のリスト(src/data/photograph/albums/<slug>.txt)の読み方と、似た写真の見分け方。
 *
 * scripts/photo-sync.ts から Node で直接実行されるため、相対 import は `.ts` 付きで書き、
 * `@/` のエイリアスは使わない。Node の API と sharp は使わない(純粋関数)。
 */

/** リストに書かれた写真1枚 */
export type PhotoListEntry = {
  /** リストの行番号(1始まり) */
  line: number;
  /** PHOTO_SOURCE_ROOT からの相対パス。区切りは `\` */
  path: string;
};

/** リストの書き間違い。line が null のものはリスト全体に対するもの */
export type PhotoListError = {
  line: number | null;
  message: string;
};

export type ParsedPhotoList = {
  title?: string;
  date?: string;
  entries: PhotoListEntry[];
  errors: PhotoListError[];
  /** 絶対パスを相対パスに直したリストの全文。直す行が無ければ null */
  rewrittenText: string | null;
};

const SUPPORTED_EXTENSION = /\.(jpe?g|nef)$/i;
const ABSOLUTE_PATH = /^([a-z]:\\|\\\\)/i;

/** アルバムの URL に使える名前か(英小文字・数字・`-`。先頭と末尾は `-` 以外) */
export const isValidSlug = (slug: string): boolean =>
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug);

/** `YYYY-MM-DD` の形で、実在する日付か */
export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const toBackslash = (path: string) => path.replace(/\//g, "\\");

/**
 * リストの全文を読む。パスの行は前後の空白と `"` を取り除き、区切りを `\` に揃える。
 * `sourceRoot` の下を指す絶対パスは相対パスに直し、その結果を `rewrittenText` で返す
 * (specs/009-photograph/research.md R8)。
 */
export const parsePhotoList = (
  text: string,
  sourceRoot: string,
): ParsedPhotoList => {
  const root = toBackslash(sourceRoot.trim()).replace(/\\+$/, "");
  const rootPrefix = `${root.toLowerCase()}\\`;
  const lines = text.split(/\r?\n/);
  const result: ParsedPhotoList = {
    entries: [],
    errors: [],
    rewrittenText: null,
  };
  let rewritten = false;

  lines.forEach((rawLine, index) => {
    const line = index + 1;
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("#")) {
      const header = trimmed.match(/^#\s*(title|date)\s*:\s*(.*)$/);
      if (header?.[1] === "title") result.title = header[2].trim();
      if (header?.[1] === "date") result.date = header[2].trim();
      return;
    }
    if (trimmed === "") return;

    let path = toBackslash(trimmed.replace(/^"(.*)"$/, "$1").trim());

    if (ABSOLUTE_PATH.test(path)) {
      if (!path.toLowerCase().startsWith(rootPrefix)) {
        result.errors.push({
          line,
          message: "PHOTO_SOURCE_ROOT の外のファイルです",
        });
        return;
      }
      path = path.slice(rootPrefix.length);
      lines[index] = path;
      rewritten = true;
    }

    if (path.split("\\").includes("..")) {
      result.errors.push({
        line,
        message: "PHOTO_SOURCE_ROOT の外のファイルです",
      });
      return;
    }
    if (!SUPPORTED_EXTENSION.test(path)) {
      result.errors.push({ line, message: "JPG だけ対応しています" });
      return;
    }

    result.entries.push({ line, path });
  });

  if (!result.title) {
    result.errors.push({
      line: null,
      message: "タイトル(# title:)を書いてください",
    });
  }
  if (!result.date || !isValidDate(result.date)) {
    result.errors.push({
      line: null,
      message: "撮影日(# date: YYYY-MM-DD)を正しく書いてください",
    });
  }
  if (result.entries.length === 0) {
    result.errors.push({ line: null, message: "写真が1枚もありません" });
  }
  if (rewritten) {
    result.rewrittenText = lines.join("\n");
  }

  return result;
};

/**
 * 似た写真を比べるための値。8×8 の明るさ(行ごとに左から右)から平均を引き、長さ 1 に揃える。
 * 2枚の値の内積が、明るさの並びの相関(-1〜1)になる(research R9)。
 * 一面同じ明るさの画像は、どの画像とも相関 0 になる。
 */
export const similarityVector = (pixels: ArrayLike<number>): number[] => {
  const values = Array.from(pixels);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const centered = values.map((value) => value - mean);
  const length = Math.sqrt(
    centered.reduce((sum, value) => sum + value * value, 0),
  );
  return centered.map((value) => (length === 0 ? 0 : value / length));
};

/** similarityVector どうしの相関。1 に近いほど似ている */
export const correlation = (a: number[], b: number[]): number =>
  a.reduce((sum, value, index) => sum + value * b[index], 0);

/** 連写とみなす撮影時刻の差の上限(秒)。research R9 */
export const SIMILAR_WINDOW_SECONDS = 30;
/** 連写とみなす相関の下限。research R9 */
export const SIMILAR_CORRELATION = 0.6;

/**
 * Exif を含むファイルの先頭部分(latin1 で読んだ文字列)から撮影時刻を取り出し、
 * 比較用のミリ秒(タイムゾーンは考えない)で返す。見つからなければ null。
 * Exif には撮影時刻と更新時刻(現像して書き出した時刻)があり、撮影時刻のほうが早いので、
 * 最も早い日時を撮影時刻とみなす。
 */
export const shotAtFromExif = (header: string): number | null => {
  const times = [
    ...header.matchAll(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/g),
  ]
    .map(([, ...parts]) => {
      const [year, month, day, hour, minute, second] = parts.map(Number);
      return Date.UTC(year, month - 1, day, hour, minute, second);
    })
    .filter((time) => !Number.isNaN(time));
  return times.length > 0 ? Math.min(...times) : null;
};

/** 似た写真を探すための、写真1枚分の値 */
export type SimilarityInput = {
  /** similarityVector の結果 */
  vector: number[];
  /** shotAtFromExif の結果 */
  shotAt: number | null;
};

/**
 * 連写の組か。撮影時刻が SIMILAR_WINDOW_SECONDS 以内で、相関が SIMILAR_CORRELATION 以上のとき。
 * 撮影時刻の分からない写真は比べない(明るさの配置や色が近いだけの別の写真を拾わないため)。
 */
export const isSimilarPair = (a: SimilarityInput, b: SimilarityInput) =>
  a.shotAt !== null &&
  b.shotAt !== null &&
  Math.abs(a.shotAt - b.shotAt) <= SIMILAR_WINDOW_SECONDS * 1000 &&
  correlation(a.vector, b.vector) >= SIMILAR_CORRELATION;

/**
 * 連写の組をつなぎ、つながったものを1グループにまとめる。
 * 2枚以上のグループだけを、先頭の写真の順に返す(中身は添字の昇順)。
 */
export const groupSimilar = (items: SimilarityInput[]): number[][] => {
  const parent = items.map((_, index) => index);
  const find = (index: number): number => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };

  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      if (isSimilarPair(items[a], items[b])) {
        parent[find(b)] = find(a);
      }
    }
  }

  const groups = new Map<number, number[]>();
  items.forEach((_, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) ?? []), index]);
  });

  return [...groups.values()].filter((group) => group.length > 1);
};
