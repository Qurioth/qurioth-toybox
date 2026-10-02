# Quickstart: シナリオごとの専用ページを確かめる

実装後、および各シナリオの移行後に行う確認手順。期待する振る舞いは
[contracts/detail-view.md](contracts/detail-view.md)、ページの書き方と部品は
[contracts/mdx-page.md](contracts/mdx-page.md)、コマの形式は
[contracts/ccfolia-koma.md](contracts/ccfolia-koma.md) を参照。

## 前提

- `mise` で Node.js 24、Corepack で pnpm が使えること(CLAUDE.md の開発コマンド参照)
- `pnpm install` 済み

## 1. 自動テスト

```bash
pnpm test
```

期待する結果:

- 部品の結合テストが通る(NpcCard・StatGrid・目次・表記の強調・ReadAloud・Ending・Figure・
  Flowchart・CCFOLIA にコピー)。
- `toCcfoliaKoma` のユニットテストが通る(契約どおりの JSON になる)。
- 下書き生成のテストが通る。全 12 本で下書きが MDX としてコンパイルでき、元の本文の行が欠落しない。
- `scenario-list.test.ts` が通る。各シナリオは `markdown` と `page` のちょうど一方を持ち、専用ページの
  `npcs.ts` の能力値は規約の順になっている。

CI と同じ一連の検査:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
```

## 2. 画面での確認

```bash
pnpm dev
```

| # | 開く URL | 確認すること |
| -- | -- | -- |
| 1 | `/trpg/scenario` | 一覧が従来どおり(カード・絞り込み・件数) |
| 2 | 未移行のシナリオ | 従来の整形表示。権利表記・タブ名あり |
| 3 | `/trpg/scenario/does-not-exist` | 画面が壊れず、本文が空。タブ名はサイトの既定 |
| 4 | 専用ページのあるシナリオ | 専用ページの配色・レイアウト。権利表記・タブ名あり |
| 5 | 同上 | 目次から章・NPC・ED へ移動でき、見出しがヘッダーに隠れない |
| 6 | 同上 | NPC カードの立ち絵が切り抜かれていない(縦長・横長とも) |
| 7 | 同上 | 判定・正気度喪失・正気度回復・呪文・物品・作中テキスト・セリフ・読み上げ文が見分けられる |
| 8 | 同上(図・フローチャートがあれば) | 図を選ぶと原寸で開き、閉じられる。フローチャートが表示される |
| 9 | 同上を幅 375px で | ページ全体に横スクロールが出ない。目次はボタンから開ける。図を拡大して最小の文字まで読める |
| 10 | 同上をダークモードで | すべての部品とフローチャートが読める |
| 11 | 他のシナリオ | #4 のページを作る前と表示が変わっていない(SC-005) |

## 3. CCFOLIA への貼り付け(SC-007)

CCFOLIA の Clipboard API は beta のため、実際の部屋で確かめる。

1. 専用ページの、能力値と技能を持つ NPC のカードで「CCFOLIA にコピー」を押す。
   「コピーしました」と表示されること。
2. CCFOLIA の自分の部屋を開き、盤面で貼り付ける(Ctrl+V / ⌘V)。
3. コマが 1 つでき、次が入っていることを確かめる。
   - 名前
   - ステータス(HP / MP / SAN)
   - パラメータ(STR〜EDU と DB など)
   - チャットパレット(`CC<={STR} 【STR】` や技能の判定)
   - メモ(読み仮名とプロフィール)
4. チャットパレットから判定を 1 つ振り、能力値の参照(`{STR}`)が値に置き換わることを確かめる。
5. 能力値のない NPC(プロフィールだけの人物)でも貼り付けられ、空の項目が出ないことを確かめる。

## 4. シナリオを 1 本移行する手順

1. 下書きを作る。

   ```bash
   pnpm scenario:draft <シナリオID>
   ```

   `src/scenarios/<slug>/` に `index.tsx` / `content.mdx` / `npcs.ts` ができる。既にあれば上書き
   しない。
2. 表示された行を `src/data/scenario/scenario-list.ts` の該当エントリに足す(`page: () => import(…)`)。
   同時に `markdown: readScenarioMarkdown(…)` の行を消す。
3. `pnpm dev` で開き、下書きのまま従来の表示と同じ情報が読めることを確かめる。
4. デザインを作り込む。配色は `index.tsx` の `theme`、レイアウトや演出は `index.tsx` と `content.mdx`
   に書く。地図などは `public/images/<slug>/` に置いて `<Figure>` や `![…](… "キャプション")` で
   載せる。
5. 2 章の 4〜11 と 3 章を確かめる。
6. `src/data/scenario/markdown/<slug>.md` を削除する(専用ページが正になる。二重管理しない)。
7. `pnpm test` を通してコミットする。1 本 = 1 コミットを目安にする。
