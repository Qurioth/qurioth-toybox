# シナリオの専用ページ

シナリオ 1 本ごとの詳細ページ(`/trpg/scenario/<シナリオID>`)を、デザインを作り込んで置くディレクトリ。
専用ページがあるシナリオはこちらが本文の正で、ないシナリオは
[src/data/scenario/markdown/](../data/scenario/markdown) の Markdown が従来の表示で出る。
決定の経緯は [ADR-0016](../../docs/adr/0016-scenario-pages-with-mdx.md)、仕様は
[specs/005-scenario](../../specs/005-scenario/spec.md) を参照。

```
src/scenarios/<slug>/
  index.tsx     # 外枠。配色(theme)・レイアウト・そのページだけの演出や部品
  content.mdx   # 本文。地の文は Markdown、部品は JSX
  npcs.ts       # NPC・神話生物のデータ(NPC カードと CCFOLIA のコマに使う)
```

ページ独自の部品(タブ、ハンドアウトなど)が要るときは、同じディレクトリに `*.tsx` を足してよい。

## 1. 移行の手順

1. 下書きを作る。既存のファイルは上書きしない。

   ```bash
   pnpm scenario:draft <シナリオID>
   ```

2. 表示された行に従って `src/data/scenario/scenario-list.ts` の該当エントリを書き換える
   (`page: () => import("@/scenarios/<slug>")` を足し、`markdown: …` を消す)。
3. `src/data/scenario/markdown/<slug>.md` を削除する(二重管理しない)。
4. `pnpm format` で整形し、`pnpm dev` で下書きのまま従来の表示と同じ情報が読めることを確かめる。
   `next.config.mjs` を変えた直後などは、開発サーバーを再起動する。
5. デザインを作り込む(2〜4 章)。
6. [quickstart](../../specs/005-scenario/quickstart.md) の確認項目を通し、`pnpm test` を通して
   コミットする(1 本 = 1 コミットが目安)。

下書きは機械的な変換なので、NPC の並びなどは必要に応じて直す。

- 技能を解析できなかった NPC は、技能を `npcs.ts` に入れていない。
  - カードの子要素に元の小節が残っている。
  - CCFOLIA のチャットパレットに技能を入れたい場合は、`npcs.ts` の `skills` に書き写す。
- `npcs` のキーは立ち絵のファイル名から作る。立ち絵がなければ `npc1`、`npc2` … になるので、
  分かりやすい名前に直してよい。

## 2. 配色とレイアウト(`index.tsx`)

```tsx
<ScenarioPage
  scenario={scenario}
  toc="sidebar"
  theme={{ accent: "#0e7490", surface: "#f0fdfa", dark: { accent: "#67e8f9" } }}
  className="…ページ独自の背景やレイアウト…"
>
  <Content />
</ScenarioPage>
```

- `theme` は部品(見出しの線、カード、ED の番号など)の色を決める。省略した色は既定のまま。
  ライトとダークは別に指定する。
- `toc="sidebar"` で本文の右に、`toc="left"` で本文の左に、広い画面では目次を常に表示する。
  狭い画面ではどちらも右下のボタンから開く。
- `aside={{ label, content }}` に渡した内容(フローチャートなど)は、xl 以上では本文の右の列に
  `label` を見出しにして常に表示する。それより狭い画面では、目次と同じく右下の「`label`」ボタンから
  開くパネルにする(目次のボタンがある幅では、その上に並ぶ)。目次を左・フローチャートを右にする例は
  `src/scenarios/parasite/index.tsx`。狭い列に図を置くときは `<Flowchart fit />` で列の幅に収める。
- 権利表記とタブ名は詳細画面が付けるので、ページには書かない。
- 他のシナリオに影響しないよう、グローバルな CSS は足さない。スタイルはページの要素の中で
  Tailwind のクラスとして書く。

## 3. 本文(`content.mdx`)

地の文は [記述規約](../data/scenario/README.md) の表記(4 章)に従って Markdown で書く。
次のものは、Markdown のまま書けば部品の見た目になる。

| 書き方 | 見た目 |
| -- | -- |
| `## 見出し` | 目次に載る見出し |
| `**〈目星〉**` / `**〈STR〉** のハード` | 判定の強調(難易度を含む) |
| `**正気度喪失：0 ／ 1D6**` / `正気度回復: 1D6` | 正気度喪失・回復の強調 |
| `《呪文名》` / `『物品名』` / `**_出典_**` | それぞれの強調 |
| `> 「セリフ」` | セリフ(1 行ずつ区切る) |
| コードブロック(言語なし) | 作中テキスト |
| ` ```mermaid ` のコードブロック | フローチャート |
| `![説明](/images/<slug>/map.png "キャプション")` | キャプション付きの図。選ぶと原寸で開く |

MDX で気を付けること:

- 地の文の `{` `}` `<` は JSX として扱われるので、`\{` `\}` `\<` とエスケープする。
- コメントは `{/* … */}`。HTML コメント `<!-- -->` は使えない。
- 部品の中に Markdown を書くときは、部品のタグの前後に空行を入れる。

## 4. 部品

`content.mdx` では import せずに使える(`src/mdx-components.tsx` で登録している)。`index.tsx` などで
使うときは `@/components/scenario/…` から import する。

| 部品 | 使い方 |
| -- | -- |
| `<ScenarioOverview subtitle="…">リード</ScenarioOverview>` | 冒頭の概要。タイトル・システム・人数・時間は登録情報から出る |
| `<ScenarioToc />` | 目次を本文の中に置く(`toc="sidebar"` を使わない場合) |
| `<NpcCard npc={npcs.key}>プロフィール・セリフ例など</NpcCard>` | NPC カード。立ち絵は名前の横に顔の丸いアイコンで出す(選ぶと全体を開く)。「CCFOLIA コマ出力」でコマを持ち出せる |
| `<StatGrid stats={{ abilities: […], derived: […] }}>補足</StatGrid>` | 能力値の格子(場面の中の敵など) |
| `<ReadAloud>描写</ReadAloud>` | 読み上げ文の枠 |
| `<Ending number="1" name="名称">…</Ending>` | エンディング(目次に載る) |
| `<Reward title="その他報酬 (任意)">…</Reward>` | その他報酬(目次に載る) |
| `<Tome name="名前" kana="読み">…</Tome>` | 魔導書・アーティファクトのカード |
| `<Figure src="…" alt="…" caption="…" />` | キャプション付きの図 |
| `<Flowchart chart={"flowchart TD\n  A --> B"} />` | フローチャート(コードブロックで書くほうが楽) |

画像は `public/images/<slug>/` に置く。

## 5. NPC のデータ(`npcs.ts`)

型は [src/types/scenario-npc.ts](../types/scenario-npc.ts) の `ScenarioNpc`。

- 名前・読み仮名・立ち絵・ステータス(複数の姿は `stats` に並べる)・技能を持つ。
- プロフィールはデータに入れず、`<NpcCard>` の子要素に Markdown で書く(能力値・技能の下に出る)。
- 能力値は規約の順(STR CON POW DEX APP SIZ INT EDU)に並べる。
- 呪文は `spells`、アーティファクトは `artifacts` に書く。カードの技能の下に欄ができる。
  - 名前は《》『』を付けずに書く(カードが付ける)。
  - 既刊に準拠するものは `source` に書名を書く(例: `source: "基本ルールブック"`)。書かないものは
    「本シナリオ独自」と表示する。
  - 本シナリオ独自のものは `details` に必要時間・コスト・効果などを `{ label, value }` で並べる。
    カードでは名前の行を開くと出る。値の中の《》『』なども強調される。
  - 「キーパーが選ぶその他の呪文。」のような一文は `spellNote` に書く。
- CCFOLIA のコマは、名前・メモ(読み仮名)・HP/MP/SAN・能力値・DB など・
  チャットパレットで作る。形式は
  [contracts/ccfolia-koma.md](../../specs/005-scenario/contracts/ccfolia-koma.md) を参照。
- 立ち絵は `portrait: { src: "/images/<slug>/<name>.webp" }` で書く。カードのアイコンには画像の幅
  いっぱいを映し、上から少し下(全身の立ち絵なら頭から胸元)を見せる。合わないときだけ
  `face: { x, y, width }` を足して映す範囲を変える(x・y が顔の中心、width がアイコンに収める幅。
  どれも画像に対する %)。
- コマに立ち絵は入らない(CCFOLIA の制約)。画像は CCFOLIA 上で設定する。
