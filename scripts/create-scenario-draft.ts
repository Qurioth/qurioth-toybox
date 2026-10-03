/**
 * 既存のシナリオ本文から、専用ページの下書き(src/scenarios/<slug>/)を書き出す。
 *
 *   pnpm scenario:draft <シナリオID>
 *
 * 変換は src/utils/scenario-draft-utils.ts が行う。このスクリプトはファイルの読み書きと、
 * scenario-list.ts に足す行の表示だけを行う(specs/005-scenario/research.md R10)。
 * Node.js 24 の型の除去でそのまま実行するため、相対 import は `.ts` 付きで書く。
 */

import fs from "node:fs";
import path from "node:path";
import { createScenarioDraft } from "../src/utils/scenario-draft-utils.ts";

const root = process.cwd();
const listPath = path.join(root, "src", "data", "scenario", "scenario-list.ts");
const markdownDir = path.join(root, "src", "data", "scenario", "markdown");

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const id = process.argv[2];
if (!id)
  fail("シナリオ ID を指定してください。例: pnpm scenario:draft Parasite");

// scenario-list.ts は Node から直接 import できない(fs やエイリアスを使う)ため、文字列から引く
const list = fs.readFileSync(listPath, "utf8");
const start = list.search(new RegExp(`^ {2}${id}: \\{$`, "m"));
if (start === -1)
  fail(`シナリオ ID「${id}」は scenario-list.ts に登録されていません。`);
const end = list.indexOf("\n  },", start);
const entry = list.slice(start, end);

if (/^\s*page:/m.test(entry)) {
  fail(`「${id}」は専用ページへ移行済みです(page があります)。`);
}
const title = entry.match(/^\s*title: "(.+)",$/m)?.[1];
const fileName = entry.match(/readScenarioMarkdown\(\s*"([^"]+)"/)?.[1];
if (!title || !fileName) {
  fail(`「${id}」の title または本文ファイル名を読み取れませんでした。`);
}

const slug = path.basename(fileName as string, ".md");
const outDir = path.join(root, "src", "scenarios", slug);
const outputs = {
  "index.tsx": "indexTsx",
  "content.mdx": "contentMdx",
  "npcs.ts": "npcsTs",
} as const;

const existing = Object.keys(outputs).filter((name) =>
  fs.existsSync(path.join(outDir, name)),
);
if (existing.length > 0) {
  fail(
    `src/scenarios/${slug}/ に既にファイルがあります(${existing.join(", ")})。上書きしないため中止しました。`,
  );
}

const markdown = fs.readFileSync(
  path.join(markdownDir, fileName as string),
  "utf8",
);
const draft = createScenarioDraft({ id, title: title as string, markdown });

fs.mkdirSync(outDir, { recursive: true });
for (const [name, key] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(outDir, name), draft[key]);
}

console.log(`src/scenarios/${slug}/ に下書きを作りました。

次の手順で登録してください(src/data/scenario/scenario-list.ts の ${id}):
  足す行: page: () => import("@/scenarios/${slug}"),
  消す行: markdown: readScenarioMarkdown("${fileName}"),

登録したら src/data/scenario/markdown/${fileName} を削除し(専用ページが本文の正になります)、
pnpm format で整形してから pnpm dev で表示を確かめてください。`);
