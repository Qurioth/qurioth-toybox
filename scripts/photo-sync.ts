/**
 * 写真のリストを読み、圧縮して R2 に上げ、アルバムデータを生成する(ADR-0017)。
 *
 *   pnpm photo:sync <slug> [--dry-run] [--prune]
 *   pnpm photo:sync --all [--dry-run] [--prune]
 *
 * リストは src/data/photograph/albums/<slug>.txt(git 管理外)。書式と振る舞いは
 * specs/009-photograph/contracts/photo-sync-cli.md を参照。リストの読み方と似た写真の見分け方は
 * src/utils/photo-list-utils.ts が行い、このスクリプトはファイル・sharp・R2 とのやり取りを受け持つ。
 * Node.js 24 の型の除去でそのまま実行するため、相対 import は `.ts` 付きで書く。
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import sharp from "sharp";
import { PHOTO_WIDTHS } from "../src/constants/photograph.ts";
import type { Album, Photo } from "../src/data/photograph/album-types.ts";
import {
  groupSimilar,
  isValidSlug,
  type PhotoListError,
  parsePhotoList,
  type SimilarityInput,
  shotAtFromExif,
  similarityVector,
} from "../src/utils/photo-list-utils.ts";

const WEBP_QUALITY = 80;

const root = process.cwd();
const albumsDir = path.join(root, "src", "data", "photograph", "albums");

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

// ---- 引数と環境変数 ----

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prune = args.includes("--prune");
const all = args.includes("--all");
const slugArg = args.find((arg) => !arg.startsWith("--"));

if (!all && !slugArg) {
  fail(
    "アルバム名か --all を指定してください。例: pnpm photo:sync 2025-04-nemophila --dry-run",
  );
}

const env = (name: string): string =>
  process.env[name] || fail(`.env.local に ${name} を書いてください`);

const sourceRoot = env("PHOTO_SOURCE_ROOT");
const r2 = dryRun
  ? null
  : {
      accountId: env("R2_ACCOUNT_ID"),
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      bucket: env("R2_BUCKET"),
    };

const slugs = all
  ? fs
      .readdirSync(albumsDir)
      .filter((name) => name.endsWith(".txt"))
      .map((name) => path.basename(name, ".txt"))
      .sort()
  : [slugArg as string];

if (slugs.length === 0) {
  fail("src/data/photograph/albums/ にリスト(.txt)がありません");
}

// ---- 読んで確かめる ----

type Source = {
  line: number;
  file: string;
  key: string;
};

type Plan = {
  slug: string;
  title: string;
  date: string;
  sources: Source[];
  existing: Album | null;
  rewrittenText: string | null;
};

const sha256Key = (buffer: Buffer) =>
  createHash("sha256").update(buffer).digest("hex").slice(0, 16);

const similarity = async (buffer: Buffer) => {
  const pixels = await sharp(buffer)
    .rotate()
    .resize(8, 8, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();
  return similarityVector(pixels);
};

/** NEF は同じフォルダの同じ名前の JPG に読み替える。見つからなければ null */
const resolveJpeg = (file: string): string | null => {
  if (!/\.nef$/i.test(file)) return file;
  const base = file.slice(0, -path.extname(file).length);
  return (
    [".JPG", ".jpg", ".jpeg", ".JPEG"]
      .map((extension) => base + extension)
      .find((candidate) => fs.existsSync(candidate)) ?? null
  );
};

const readAlbum = (slug: string): Album | null => {
  const jsonPath = path.join(albumsDir, `${slug}.json`);
  return fs.existsSync(jsonPath)
    ? (JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Album)
    : null;
};

const inspect = async (slug: string): Promise<Plan | null> => {
  const errors: PhotoListError[] = [];
  const notices: string[] = [];

  if (!isValidSlug(slug)) {
    console.error(
      `アルバム: ${slug}\n  エラー: アルバム名は英小文字・数字・- だけにしてください`,
    );
    return null;
  }

  const listPath = path.join(albumsDir, `${slug}.txt`);
  if (!fs.existsSync(listPath)) {
    console.error(`アルバム: ${slug}\n  エラー: ${slug}.txt が見つかりません`);
    return null;
  }

  const parsed = parsePhotoList(fs.readFileSync(listPath, "utf8"), sourceRoot);
  errors.push(...parsed.errors);

  const sources: Source[] = [];
  const similarities: SimilarityInput[] = [];
  const keyLines = new Map<string, number>();

  for (const entry of parsed.entries) {
    const original = path.join(sourceRoot, entry.path);
    const file = resolveJpeg(original);

    if (file === null) {
      errors.push({
        line: entry.line,
        message: `NX Studio で JPG に書き出してください(${entry.path})`,
      });
      continue;
    }
    if (!fs.existsSync(file)) {
      errors.push({
        line: entry.line,
        message: `ファイルが見つかりません(${entry.path})`,
      });
      continue;
    }
    if (file !== original) {
      notices.push(
        `${entry.line}行目: NEF の代わりに ${path.basename(file)} を使います`,
      );
    }

    const buffer = fs.readFileSync(file);
    const key = sha256Key(buffer);
    const firstLine = keyLines.get(key);
    if (firstLine !== undefined) {
      notices.push(
        `${entry.line}行目: ${firstLine}行目と同じ写真のため無視します`,
      );
      continue;
    }
    keyLines.set(key, entry.line);

    sources.push({ line: entry.line, file, key });
    similarities.push({
      vector: await similarity(buffer),
      // 撮影時刻は Exif(ファイルの先頭にある)から読む
      shotAt: shotAtFromExif(buffer.subarray(0, 131072).toString("latin1")),
    });
  }

  const existing = readAlbum(slug);
  const existingKeys = new Set(existing?.photos.map(({ key }) => key));
  const keys = new Set(sources.map(({ key }) => key));
  const added = sources.filter(({ key }) => !existingKeys.has(key)).length;
  const removed = [...existingKeys].filter((key) => !keys.has(key)).length;

  console.log(
    `アルバム: ${slug}(${parsed.title ?? "タイトルなし"} / ${parsed.date ?? "撮影日なし"})`,
  );
  console.log(
    `  写真: ${sources.length}枚(新規 ${added}枚・既存 ${sources.length - added}枚)`,
  );
  if (removed > 0) {
    console.log(
      `  外した写真: ${removed}枚(R2 に残っています。消すには --prune)`,
    );
  }

  const groups = groupSimilar(similarities);
  if (groups.length > 0) {
    console.log("\n似ている写真:");
    groups.forEach((group, index) => {
      const names = group.map((i) => path.basename(sources[i].file));
      console.log(`  [${index + 1}] ${names.join(", ")}`);
    });
  }
  if (notices.length > 0) {
    console.log(`\n注意:\n${notices.map((n) => `  ${n}`).join("\n")}`);
  }
  if (errors.length > 0) {
    // 行ごとのエラーを行番号の順に並べ、リスト全体に対するものは最後に出す
    const lines = errors
      .sort((a, b) => (a.line ?? Infinity) - (b.line ?? Infinity))
      .map(({ line, message }) =>
        line === null ? `  ${message}` : `  ${line}行目: ${message}`,
      );
    console.error(`\nエラー:\n${lines.join("\n")}`);
    return null;
  }

  return {
    slug,
    title: parsed.title as string,
    date: parsed.date as string,
    sources,
    existing,
    rewrittenText: parsed.rewrittenText,
  };
};

// ---- 圧縮 ----

/** 幅ごとの WebP を作る。撮影情報は書き出さない(keepMetadata を呼ばない。research R4) */
const compress = async (file: string) =>
  Promise.all(
    PHOTO_WIDTHS.map(async (width) => {
      const { data, info } = await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true });
      return { width, data, info };
    }),
  );

const formatSize = (bytes: number) =>
  `約 ${(bytes / 1024 / 1024).toFixed(1)}MB`;

// ---- R2 ----

const client = r2
  ? new AwsClient({
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
      service: "s3",
      region: "auto",
    })
  : null;

const objectUrl = (objectKey = "") =>
  `https://${r2?.accountId}.r2.cloudflarestorage.com/${r2?.bucket}/${objectKey}`;

const request = async (url: string, init: RequestInit) => {
  const response = await (client as AwsClient).fetch(url, init);
  if (!response.ok) {
    throw new Error(
      `R2 への ${init.method} が失敗しました(${response.status}): ${await response.text()}`,
    );
  }
  return response;
};

const listObjectKeys = async (): Promise<string[]> => {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const query = new URLSearchParams({ "list-type": "2" });
    if (token) query.set("continuation-token", token);
    const xml = await (
      await request(`${objectUrl()}?${query}`, { method: "GET" })
    ).text();

    keys.push(
      ...[...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((match) => match[1]),
    );
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? xml.match(
          /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/,
        )?.[1]
      : undefined;
  } while (token);

  return keys;
};

// ---- 生成 ----

const writeIndex = () => {
  const jsonSlugs = fs
    .readdirSync(albumsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.basename(name, ".json"))
    .sort();

  const imports = jsonSlugs.map(
    (slug, index) => `import album${index} from "./${slug}.json";`,
  );
  const entries = jsonSlugs.map((slug, index) => `  "${slug}": album${index},`);

  fs.writeFileSync(
    path.join(albumsDir, "index.ts"),
    [
      "// このファイルは pnpm photo:sync が生成する。手で編集しない。",
      'import type { Album } from "../album-types";',
      ...imports,
      "",
      `export const albums: Record<string, Album> = {${entries.length > 0 ? `\n${entries.join("\n")}\n` : ""}};`,
      "",
    ].join("\n"),
  );
};

/** 生成したファイルを Biome で整形する(CI の format:check を通すため。research R10) */
const formatFiles = (files: string[]) => {
  const biome = path.join(
    root,
    "node_modules",
    "@biomejs",
    "biome",
    "bin",
    "biome",
  );
  execFileSync(process.execPath, [biome, "format", "--write", ...files], {
    stdio: "ignore",
  });
};

// ---- 実行 ----

const plans: Plan[] = [];
let hasError = false;

for (const slug of slugs) {
  const plan = await inspect(slug);
  if (plan) plans.push(plan);
  else hasError = true;
  console.log("");
}

if (hasError) {
  fail("エラーがあるため、何もアップロードしていません。");
}

if (dryRun) {
  for (const plan of plans) {
    const existingKeys = new Set(plan.existing?.photos.map(({ key }) => key));
    let total = 0;
    let added = 0;
    for (const source of plan.sources) {
      const size = (await compress(source.file)).reduce(
        (sum, { data }) => sum + data.length,
        0,
      );
      total += size;
      if (!existingKeys.has(source.key)) added += size;
    }
    console.log(
      `${plan.slug}: 圧縮後の見込み ${formatSize(total)}(新規分 ${formatSize(added)})`,
    );
  }
  console.log("\n--dry-run のため、アップロードと書き込みはしていません。");
  process.exit(0);
}

const written: string[] = [];

for (const plan of plans) {
  if (plan.rewrittenText !== null) {
    fs.writeFileSync(
      path.join(albumsDir, `${plan.slug}.txt`),
      plan.rewrittenText,
    );
    console.log(`${plan.slug}.txt の絶対パスを相対パスに直しました。`);
  }

  const known = new Map(
    plan.existing?.photos.map((photo) => [photo.key, photo]),
  );
  const photos: Photo[] = [];
  let uploaded = 0;

  for (const source of plan.sources) {
    const knownPhoto = known.get(source.key);
    if (knownPhoto) {
      photos.push(knownPhoto);
      continue;
    }

    const outputs = await compress(source.file);
    for (const { width, data } of outputs) {
      await request(objectUrl(`${source.key}-${width}.webp`), {
        method: "PUT",
        body: data,
        headers: { "Content-Type": "image/webp" },
      });
    }
    const largest = outputs[outputs.length - 1].info;
    photos.push({
      key: source.key,
      width: largest.width,
      height: largest.height,
    });
    uploaded++;
  }

  const album: Album = { title: plan.title, date: plan.date, photos };
  const jsonPath = path.join(albumsDir, `${plan.slug}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(album, null, 2)}\n`);
  written.push(jsonPath);
  console.log(
    `${plan.slug}: ${uploaded}枚をアップロードし、${plan.slug}.json を書き出しました。`,
  );
}

writeIndex();
formatFiles([...written, path.join(albumsDir, "index.ts")]);

if (prune) {
  const referenced = new Set(
    fs
      .readdirSync(albumsDir)
      .filter((name) => name.endsWith(".json"))
      .flatMap(
        (name) =>
          (
            JSON.parse(
              fs.readFileSync(path.join(albumsDir, name), "utf8"),
            ) as Album
          ).photos,
      )
      .flatMap(({ key }) =>
        PHOTO_WIDTHS.map((width) => `${key}-${width}.webp`),
      ),
  );
  const orphans = (await listObjectKeys()).filter(
    (key) => !referenced.has(key),
  );

  for (const key of orphans) {
    await request(objectUrl(key), { method: "DELETE" });
  }
  console.log(`--prune: R2 から ${orphans.length}件の画像を消しました。`);
}

console.log("\n生成した json と index.ts をコミットしてください。");
