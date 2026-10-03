# Research: シナリオごとの専用ページ

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-03

2026-10-03 の方針転換(シナリオごとの専用ページ + 共通の部品集 + 1本ずつの移行)で、plan に
委ねられた判断を解消する。2026-10-02 版の判断(Markdown を正とした構造化表示)は
[ADR-0015](../../docs/adr/0015-structure-scenario-markdown-for-display.md) と git の履歴に残っている。

---

## R1. 専用ページの形式

**Decision**: シナリオ1本ごとに `src/scenarios/<slug>/` を作り、次の3つを置く。

| ファイル | 役割 |
| -- | -- |
| `index.tsx` | ページの外枠。配色(R5)・レイアウト・そのページだけの演出や動きのある部品を書く |
| `content.mdx` | 本文。地の文は Markdown で書き、必要な場所に部品を置く |
| `npcs.ts` | NPC・神話生物のデータ(R6) |

MDX の取り込みには Next.js 公式の `@next/mdx`(+ `@mdx-js/loader` / `@mdx-js/react` / `@types/mdx`)を
使う。`content.mdx` はページとしてではなく、`index.tsx` から import するモジュールとして扱う。

**Rationale**:

- オーナーの選択(2026-10-03)。地の文は Markdown のまま書けるので、長い本文でも書きやすい。
  部品は JSX で好きな場所に置ける。
- `index.tsx` を分けることで、MDX では書きにくい配色の指定や、そのページ専用のコンポーネント
  (タブ、ハンドアウトなど)を TSX で自由に書ける(FR-015)。
- `@next/mdx` はビルド時にコンパイルするので、実行時のコンパイル(`next-mdx-remote` など)より
  軽い。Next.js 16(Turbopack)にも対応している。remark プラグインは文字列で指定する
  (`remarkPlugins: [["remark-gfm", {}]]`)。

**Alternatives considered**:

| 案 | 却下理由 |
| -- | -- |
| TSX だけでページを書く | オーナーが MDX を選んだ。長い地の文を JSX で書くのは負担が大きい |
| `next-mdx-remote` で実行時にコンパイル | 本文はリポジトリ内にあり、実行時にコンパイルする理由がない。依存も重くなる |
| `src/app/trpg/scenario/<Id>/page.mdx` のように静的ルートで置く | ルートごとに権利表記・タブ名・外枠を書くことになり、FR-011 / FR-012 を1か所で守れない。シナリオの中身が app のルート構造に混ざる |

---

## R2. 専用ページの登録と切り替え

**Decision**: `scenario-list.ts` の `Scenario` 型に `page?: () => Promise<{ default: ComponentType }>` を
足す。専用ページを作ったシナリオには `page: () => import("@/scenarios/<slug>")` を書く。詳細画面
(`[id]/page.tsx`)は、`page` があれば読み込んで描画し、なければ従来の整形表示(`LegacyScenarioBody`)を
出す。権利表記とタブ名は、どちらの場合も `[id]/page.tsx` が付ける。

移行したシナリオは専用ページが本文の正になる(spec Assumptions)。そのため `markdown` は任意項目にし、
移行したら `src/data/scenario/markdown/<slug>.md` を削除して二重管理しない。

2026-10-02 に付けた `structured: true` と構造化表示の切り替えは削除し、全シナリオをいったん従来表示に
戻す。

**Rationale**: 登録を1か所にまとめられ、一覧(タイトル・人数などのメタデータ)と詳細の切り替えが
同じエントリで完結する。動的 import なので、ページを開いたシナリオの本文だけが読み込まれる。

---

## R3. 部品集の置き場所と MDX への渡し方

**Decision**:

- 部品は `src/components/scenario/` に置く。2026-10-02 に `src/app/trpg/scenario/[id]/` に作った部品
  (人物カード、能力値の格子、目次、ED、魔導書、表記の強調)は、ここへ移して作り直す。
- 部品は `src/mdx-components.tsx` で MDX 全体に登録し、`content.mdx` からは import せずに使えるように
  する。同じファイルで、Markdown の要素にも既定の見た目を当てる。
  - `h2` / `h3` / `h4`: id とヘッダー分の `scroll-margin-top` を付ける
  - `strong`: 判定・正気度喪失・出典の強調
  - `p` / `li` / `td`: 呪文・魔導書・正気度回復・判定の難易度の強調
  - `blockquote`: セリフ(1行ずつ区切る)
  - `pre`: 作中テキスト(言語が `mermaid` ならフローチャート、R8)
  - `table`: 横スクロールの枠
  - `img`: 図(R7)
- 読み上げ文は `<ReadAloud>` 部品で書く。2026-10-02 版の `> [!読み上げ]` の目印は、Markdown だけで
  書くための工夫だったので廃止する(使っている本文はない)。

**Rationale**: constitution 原則2(コンポーネントは `src/components/` に用途別に置く)。部品は複数の
シナリオのページから使われるので、画面のディレクトリに置く理由がなくなった。`mdx-components.tsx` は
`@next/mdx` の規約で、App Router では必須。

**表記の強調の判定**: MDX の部品には react-markdown の `node` が渡らない。そのため、判定は子要素の
文字列から行う。分類の関数(`classifyStrong` / `splitNotation` / `splitDifficulty`)は、
`src/utils/scenario-structure-utils.ts` のものをそのまま使う。

---

## R4. 目次

**Decision**: `<ScenarioToc />` はクライアント部品とし、表示後にページ本文(`data-scenario-body` を
付けた要素)の中から `h2` と、`data-toc` を付けた見出し(NPC カード・ED・その他報酬)を集めて目次を作る。
広い画面での常時表示、狭い画面でのパネル、閉じてから移動する動き(固定ヘッダー対策)は 2026-10-02 版の
実装を引き継ぐ。

**Rationale**: MDX の見出しをビルド時に集めるには独自の remark プラグインが要る。Turbopack では
プラグインを文字列で渡すので、ローカルの独自プラグインは扱いにくい。DOM から集める方式なら、
TSX で書いたそのページ独自の見出しも目次に載せられる(`data-toc` を付けるだけ)。

**Alternatives considered**: 目次の項目を MDX に手で書く → 見出しと二重管理になる。

---

## R5. ページごとの配色

**Decision**: 部品は CSS カスタムプロパティ(`--scenario-accent` など)で色を受け取り、未指定なら
既定の色を使う。ページは `index.tsx` の外枠(`<ScenarioPage theme={…}>`)で、ライト/ダーク
それぞれの値を指定する。レイアウトや演出は `index.tsx` と `content.mdx` に Tailwind で直接書く。

**Rationale**: CSS 変数は入れ子の部品まで自動で届くので、部品に props を配って回る必要がない
(FR-016 の「ページの配色に合わせて調整できる」)。Tailwind の任意値(`border-[--scenario-accent]`)で
そのまま参照できる。

---

## R6. NPC データ

**Decision**: `src/types/scenario-npc.ts` に `ScenarioNpc` 型を定義し、各シナリオの `npcs.ts` で
`satisfies Record<string, ScenarioNpc>` として書く。MDX では `<NpcCard npc={npcs.mitsuki}>` のように
置き、セリフ例・呪文・装甲などの自由記述は NpcCard の子要素(MDX)として書く。詳細は
[data-model.md](data-model.md)。

**Rationale**: 名前・能力値・技能など、コマの出力に使う項目だけをデータにする(FR-027)。それ以外の
記述まで型に押し込むと、書きにくくなり、書式(太字・改行)も失われる。

---

## R7. 画像

**Decision**:

- NpcCard の立ち絵は、切り抜かずに縦横比を保つ表示(`object-contain`、高さの上限あり)にする。
- `<Figure src alt caption />` 部品を作る。Markdown の画像(`![alt](src "caption")`)も同じ部品で
  描画する。選ぶと `@headlessui/react` の `Dialog` で原寸の画像を開き、枠の中でスクロールして
  細部を読めるようにする(SC-008)。スマホではブラウザのピンチ操作でも拡大できる。
- 画像は従来どおり `public/images/<slug>/` に置く。`next/image` は使わない(大きさが事前に
  分からない画像が多く、既存の書き方とも合わないため)。

---

## R8. フローチャート

**Decision**: `mermaid`(12.x)を依存に加える。` ```mermaid ` のコードブロック、または
`<Flowchart chart={…} />` で書く。クライアント部品で `mermaid` を動的 import し、図があるページでだけ
読み込む。テーマはサイトのダークモード(`useDarkMode`)に合わせて切り替える。図は横スクロールできる
枠に入れ、ページ全体には横スクロールを出さない(FR-026)。

**Rationale**: 本文の中にテキストで図を書けるので、MDX と相性がよい。GitHub 上でも図として表示される。
`securityLevel: "strict"` で描画するので、本文から任意のスクリプトは実行されない。

**Alternatives considered**: 画像で用意する → 直すたびに作り直しが要る。React Flow などの
ライブラリ → 図をデータで書くことになり、本文の中に書けない。

---

## R9. CCFOLIA のコマ

**Decision**: CCFOLIA 公式ドキュメント「[Clipboard API (beta)](https://docs.ccfolia.com/developer-api/clipboard-api)」
(v1.19.0)の形式に従い、`{ "kind": "character", "data": { … } }` の JSON 文字列をクリップボードに
書き込む。対応は [contracts/ccfolia-koma.md](contracts/ccfolia-koma.md)。

- `iconUrl` は外部の画像を設定できない(同ドキュメント)ため、含めない(2026-10-03 オーナー合意。
  spec FR-028)。
- チャットパレット(`commands`)は、クトゥルフ神話TRPG 7版の判定コマンド
  `CC<={STR} 【STR】`、`CC<=60 【目星】` で作る。能力値はパラメータを `{…}` で参照し、CCFOLIA 上で
  値を変えたときに追従させる。
- コピーは既存の `CopyTextBox` と同じく `navigator.clipboard.writeText` を使う。

---

## R10. 下書きの生成

**Decision**: `pnpm scenario:draft <シナリオID>` で、既存の本文 Markdown から `src/scenarios/<slug>/` の
下書き(`index.tsx` / `content.mdx` / `npcs.ts`)を書き出す。

- 解析には 2026-10-02 に作った `splitScenarioMarkdown` / `parseStatLines` などを使う。
- 変換のロジックは `src/utils/scenario-draft-utils.ts`(純粋関数、ユニットテスト対象)に置く。
  `scripts/create-scenario-draft.ts` は、ファイルの読み書きと登録方法の表示だけを行う。
- Node.js 24(`mise.toml`)は TypeScript の型注釈を外してそのまま実行できる。新しい実行用の依存
  (`tsx` など)は入れない。Node が実行時に解決できるよう、スクリプトから辿る相対 import には
  `.ts` を付ける。そのため tsconfig に `allowImportingTsExtensions` を加える(`noEmit` なので可)。
- 既存のファイルは上書きしない。`scenario-list.ts` への登録は自動では書き換えず、追加する行を表示する
  (オーナーが確かめてから登録する)。
- MDX として壊れる文字(`{` `}` `<`)はエスケープし、HTML コメントは MDX のコメントに直す。

**変換の規則**(詳細は [data-model.md](data-model.md)「下書きへの変換」):

- 人物の `###` → `npcs.ts` のデータと `<NpcCard>`。
- 人物以外の能力値の段落 → `<StatGrid>`。
- ED・その他報酬・魔導書 → それぞれの部品。
- それ以外 → Markdown のまま。
- 解釈できない記述は Markdown として残し、捨てない(FR-033)。

**欠落がないことの確認(SC-009)**: 全 12 本について、テストで次の2つを確かめる。

1. 下書きが MDX としてコンパイルできること(`@mdx-js/mdx` を devDependency に加えて `compile` する)。
2. 元の本文のすべての行(見出し記号と空白を除いた文字列)が、下書きの `content.mdx` か `npcs.ts` の
   どこかに含まれること。

---

## R11. 記録

**Decision**:

- ADR-0016「シナリオごとの専用ページを MDX で作り、共通の部品集で組み立てる」を追加する。
  ADR-0015 は「Superseded by ADR-0016」にする(構造化表示を取りやめたため)。
- `src/scenarios/README.md` を新設し、専用ページの作り方を書く。
  - ファイル構成
  - 部品の一覧と使い方
  - 配色の変え方
  - 下書きの作り方
  - 移行の手順
- `src/data/scenario/README.md` の表記規約(判定の太字など)は、専用ページの地の文にもそのまま適用
  する。7章の「構造化表示」の節は削除する。
- CLAUDE.md の「シナリオデータ」節を、専用ページと下書き生成に合わせて書き換える。
