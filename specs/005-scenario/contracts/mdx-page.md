# Contract: 専用ページの書き方と部品

`src/scenarios/<slug>/` に置く専用ページが従う約束と、部品集(`src/components/scenario/`)が
提供する部品。部品は `src/mdx-components.tsx` で登録されるので、`content.mdx` では import せずに使える。
`index.tsx` で使う場合は `@/components/scenario` から import する。

## 1. ページの外枠(`index.tsx`)

```tsx
import ScenarioPage, {
  type ScenarioPageProps,
} from "@/components/scenario/ScenarioPage";
import Content from "./content.mdx";

export default function BubbleOnWetHandsScenario({
  scenario,
}: Pick<ScenarioPageProps, "scenario">) {
  return (
    <ScenarioPage
      scenario={scenario}
      theme={{ accent: "#0e7490", dark: { accent: "#67e8f9" } }}
      className="…ページ独自のレイアウト…"
    >
      <Content />
    </ScenarioPage>
  );
}
```

- ページの部品は、詳細画面から `scenario`(登録情報: タイトル・システム・人数・時間)を受け取り、
  そのまま `ScenarioPage` に渡す。`ScenarioPage` はそれを部品(`ScenarioOverview` など)へ届ける。
- `ScenarioPage` は、本文の要素に `data-scenario-body` を付け、配色の CSS 変数を設定する。
  レイアウト・背景・演出はページ側で自由に書いてよい。
- 権利表記とタブ名は詳細画面(`[id]/page.tsx`)が付けるので、ページには書かない。
- 幅 375px でページ全体に横スクロールを出さないこと、ダークモードで読めることは、ページを作る
  オーナーが確かめる(quickstart)。

## 2. 本文(`content.mdx`)

- 地の文の書き方は [シナリオ本文の記述規約](../../../src/data/scenario/README.md) の4章(表記規約)に
  従う。判定 `**〈目星〉**`、正気度喪失 `**正気度喪失：0 ／ 1D6**`、呪文 `《…》`、物品 `『…』`、
  作中テキストのコードブロック、セリフの引用は、Markdown のまま書けば部品の見た目になる。
- `{` `}` `<` は MDX では JSX として扱われるので、地の文ではエスケープする(`\{` `\}` `&lt;`)。
- コメントは `{/* … */}`。HTML コメント `<!-- -->` は使えない。
- 生 HTML は使わない。装飾は部品か Tailwind のクラスを持つ JSX で書く。

## 3. 部品

| 部品 | 主な props | 表示 |
| -- | -- | -- |
| `ScenarioOverview` | `children`(リード) | 登録情報(システム・人数・時間)とリードをまとめた冒頭の概要。シナリオの情報は詳細画面から渡る |
| `ScenarioToc` | — | 本文中の `h2` と `data-toc` 付きの見出しを集めた目次。広い画面は常時表示、狭い画面はパネル |
| `NpcCard` | `npc: ScenarioNpc`, `children` | 立ち絵(切り抜かない)・名前と補足・プロフィール・能力値・技能、子要素(セリフ例など)、「CCFOLIA にコピー」ボタン。見出しは目次に載る |
| `StatGrid` | `stats: NpcStatBlock`, `children` | 能力値の格子と副次ステータス。子要素は格子の下に出す |
| `ReadAloud` | `children` | 読み上げ文の枠 |
| `Ending` | `number`, `name`, `children` | ED<番号> と名称を分けた見出しのカード。目次に載る |
| `Reward` | `title?`, `children` | その他報酬。目次に載る |
| `Tome` | `name`, `children` | 魔導書・アーティファクトのカード |
| `Figure` | `src`, `alt`, `caption?` | キャプション付きの図。選ぶと原寸で開く |
| `Flowchart` | `chart: string` | Mermaid 記法のフローチャート。枠の中でスクロールできる |

Markdown の要素の既定の見た目(`mdx-components.tsx`):

| 要素 | 見た目 |
| -- | -- |
| `## …` / `### …` / `#### …` | id と `scroll-margin-top` 付きの見出し。`##` は目次に載る |
| `**〈…〉**`(+ ` のハード` / ` のイクストリーム`) | 判定の強調 |
| `**正気度喪失：A ／ B**` / `**正気度喪失：A**` | 正気度喪失の強調(成功時・失敗時を分ける) |
| `正気度回復: …` / `《…》` / `『…』` / `**_出典_**` | それぞれの強調 |
| 引用 `>` | セリフ(1行ずつ区切る) |
| コードブロック(言語なし) | 作中テキスト |
| コードブロック(` ```mermaid `) | フローチャート |
| `![alt](src "キャプション")` | 図(`Figure` と同じ) |
| 表 | 横スクロールの枠に入れる |

## 4. 配色

部品は次の CSS 変数を参照する。未設定なら既定の色になる。ページ独自の部品から参照してもよい。

`--scenario-accent` / `--scenario-surface` / `--scenario-border`(ライト・ダークで別の値を
`ScenarioPage` の `theme` で指定する)
