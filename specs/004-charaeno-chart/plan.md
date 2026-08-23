# Implementation Plan: 6版のキャラクターシート対応

**Feature**: `004-charaeno-chart` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-charaeno-chart/spec.md`

**対象画面**: `/trpg/charaeno-chart`(および `/trpg/charaeno-chart/sample-character`)

## Summary

`/trpg/charaeno-chart` が7版のキャラクターシートしか受け付けない状態を解消し、同じ入力欄で
6版のシートも扱えるようにする。版は入力URLのパス(`6th` / `7th`)だけから判定し、判定した版の
取得先からサマリーを取り、版ごとに異なる形のデータをカードに描く。

技術的な要は3つ。

1. **URLの規則を1箇所に寄せる**。現在は入力欄の検証と取得先の組み立てに `7th` が二重に
   直書きされている。正規表現1本から版とIDを取り出し、検証と組み立てで共有することで、
   「検証は通るのに取得先が7版のまま」という壊れ方を構造的に防ぐ。
2. **能力値を上限比に正規化してからチャートへ渡す**。recharts の RadarChart は半径軸を1本しか
   持てず、能力値ごとに上限を変えられない。値を「自分の上限に対する割合(0〜100)」へ直せば、
   チャート側を変えずに FR-017(6版は EDU が 21、それ以外が 18)を満たせる。7版は上限が
   100 なので値が変わらず、見た目も変わらない。詳細は [research.md](./research.md) R1。
3. **カードを版に依存しない形にする**。版ごとのレスポンスを、カードが描くために必要な情報だけを
   持つビューモデルへ変換してから `CharacterCard` に渡す。カードは版を知らない。

## Technical Context

**Language/Version**: TypeScript 5(strict) / Node.js 24([mise.toml](../../mise.toml))

**Primary Dependencies**: Next.js 16(App Router) / React 19 / recharts 3(レーダーチャート) /
react-hook-form 7(URL入力の検証) / Tailwind CSS 3 + clsx + tailwind-merge

**Storage**: N/A。当サイトはキャラクターシートを保存も編集もしない。データは毎回 Charaeno から
取得する。

**Testing**: Vitest 4(`environment: "jsdom"`) + React Testing Library。テスティングトロフィー
(ADR-0008)に従い、結合テストを主軸に、変換・検証などの純粋関数にユニットテストを添える。

**Target Platform**: モダンブラウザ。レイアウトは Tailwind の `md`(768px)を境に
モバイル用/デスクトップ用を出し分ける。

**Project Type**: 単一の Next.js アプリ(フロントエンドのみ、バックエンドは持たない)。

**Performance Goals**: 新たな目標なし。取得は1回のGETで、追加のリクエストは発生しない。

**Constraints**:

- 外部APIのレスポンスの形は制御できない。境界で型ガードを通してから使う。
- recharts の RadarChart は半径軸を1本しか持てない(R1)。
- 表面のタイルは両版とも4つ。6版の4枠目はダメージ・ボーナスで、「+1D4」のような文字列に
  なるため、タイルの値は数値に限らない(R7)。
- 7版の表示は変えない(SC-006)。

**Scale/Scope**: 画面2つ(入力画面・サンプル一覧)。変更対象はソース6ファイル前後とそのテスト。

## Constitution Check

*GATE: Phase 0 の前に判定し、Phase 1 の設計後に再判定する。*

| 原則 | 判定(Phase 0前) | 判定(Phase 1後) | 根拠 |
|---|---|---|---|
| 1. 過剰実装をしない(YAGNI) | Pass | Pass | 版の登録機構・プラグイン・設定項目は作らない。今実在する2つの版を1つの表示形に合流させるだけ。将来の版のための拡張点は用意しない |
| 2. 既存の慣習に合わせる | Pass | Pass | 型は `src/types/`、純粋関数は `src/utils/<用途>-utils.ts`、テストはコロケーション、UI文言は日本語。いずれも既存の並びに従う |
| 3. 仕様は「なぜ」を残す | Pass | Pass | spec を先に更新済み(FR-012〜FR-018)。本ファイルには実装方針のみを書く |
| 4. 大きな判断はADRに記録する | Pass | Pass | 依存の追加・入れ替えなし、外部との契約の破壊的変更なし。ADRは不要と判断(下記) |
| 5. 小さな変更にSDDを課さない | Pass | Pass | 本件はSDDの対象(画面の受け入れ範囲が変わるまとまった変更) |
| 6. テストは目的に見合う分だけ | Pass | Pass | 既存3ファイルの延長＋純粋関数のテスト1ファイル。新しいテスト基盤・別ツリーは作らない |

**原則4についての判断**: カード用ビューモデルの導入は画面内部の設計変更で、依存ライブラリ・
データの保存形式・外部サービスとの契約のいずれも変えない。後戻りのコストも1画面に閉じるため、
ADRは書かない。ただし「recharts では能力値ごとに上限を変えられないので正規化で解く」という
判断は後から見て非自明なので、[research.md](./research.md) R1 に理由を残し、実装側にもコメントを
置く。

**原則1についての判断**(ビューモデルは過剰か): 分岐をカードの中に置く案と比べても総量は減る。
`CharacterCard` は既にレスポンス型から表示物を導く処理(見出しの差し替え、技能の絞り込み、
タイルの組み立て、チャート用データの整形)を抱えており、そこへ版の分岐を3箇所足すより、
導出を外へ出すほうが読む量が少ない。抽象化のための抽象化ではないため Pass とする(R5)。

## Project Structure

### Documentation (this feature)

```text
specs/004-charaeno-chart/
├── spec.md                          # 画面の現行仕様(6版対応を反映済み)
├── plan.md                          # 本ファイル
├── research.md                      # Phase 0: 技術的な不明点の解消
├── data-model.md                    # Phase 1: 版ごとの形とビューモデル
├── quickstart.md                    # Phase 1: 動かして確かめる手順
├── contracts/                       # Phase 1: インターフェースの取り決め
│   ├── charaeno-summary-api.md      #   外部依存(Charaeno サマリーAPI)
│   └── character-card-props.md      #   画面内部(カードと変換ユーティリティ)
├── checklists/
│   └── requirements.md              # spec の品質チェックリスト
└── tasks.md                         # Phase 2 (/speckit-tasks の出力。本コマンドでは作らない)
```

### Source Code (repository root)

```text
src/
├── app/trpg/
│   ├── page.tsx                     # 変更: 対応システムの表記から「7版」を落とす(*)
│   └── charaeno-chart/
│       ├── page.tsx                 # 変更: URLの検証規則を共有、版に応じた取得と変換
│       ├── page.test.tsx            # 変更: 6版の取得先・6版のカード表示・7版の退行
│       └── sample-character/
│           └── page.tsx             # 変更: 7版JSONを変換に通してから渡す(表示は不変)
├── constants/
│   └── message.ts                   # 変更: 「URLの形式が不正です。」を定数へ切り出す
├── components/
│   ├── CharacterCard.tsx            # 変更: ビューモデルを受ける。版を知らない
│   ├── CharacterCard.test.tsx       # 変更: ビューモデルへ追従、DB(文字列)のタイルを追加
│   └── recharts/
│       └── CharacteristicsRadarChart.tsx  # 変更なし
├── types/
│   ├── Charaeno6th.ts               # 変更なし(既存・これまで未使用)
│   ├── Charaeno7th.ts               # 変更なし
│   └── CharacterCard.ts             # 新規: CharacterCardData とその構成要素
└── utils/
    ├── charaeno-utils.ts            # 変更: URL解析(版+ID)、取得先の組み立て、版ごとの型ガード
    ├── charaeno-utils.test.ts       # 変更: 上記に追従
    ├── character-card-utils.ts      # 新規: 版ごとの Investigator → CharacterCardData
    └── character-card-utils.test.ts # 新規
```

**Structure Decision**: 既存の Next.js App Router の構成をそのまま使う。新しいディレクトリ階層は
作らない。版に依存する知識は `src/utils/` の2ファイル(URL・検証を扱う `charaeno-utils`、表示形への
変換を扱う `character-card-utils`)に閉じ込め、`src/components/CharacterCard.tsx` から版の分岐を
無くす。境界の詳細は [contracts/character-card-props.md](./contracts/character-card-props.md)。

(*) `src/app/trpg/page.tsx` は `/trpg` 画面([002-trpg](../002-trpg/spec.md))に属する。この画面の
ツール一覧カードが「クトゥルフ神話TRPG 7版」と対応システムを掲げており、6版に対応した時点で
事実と食い違うため、本改修の一部として表記を直した。

## 実装の順序(方針)

`/speckit-tasks` で作業単位に分解する前提として、依存の向きだけ示す。

1. **型とユーティリティ(下から)**: `CharacterCardData` の型 → URL解析・取得先の組み立て・版ごとの
   型ガード → 版ごとの変換。ここまでは純粋関数なのでユニットテストで確定できる。
2. **カード**: `CharacterCard` をビューモデルを受ける形に変える。タイル数の出し分けと
   セクションの2種類の描き分けを入れる。既存の表裏・レスポンシブ・チャートのマウント制御には
   触らない。
3. **呼び出し側**: `page.tsx` を版に応じた流れへ、サンプル一覧を変換経由へ。
4. **確認**: [quickstart.md](./quickstart.md) のシナリオ1〜8。

7版の退行を防ぐため、2 と 3 の各段階で既存のテストを通したまま進める。

## リスクと備え

| リスク | 備え |
|---|---|
| 7版の見た目が意図せず変わる | 正規化は7版で恒等(上限100・整数値)。既存の `CharacterCard.test.tsx` / `page.test.tsx` を落とさずに通す。quickstart シナリオ5で目視 |
| 6版のレスポンスが手元の3件と違う形で返る | 型ガードで弾いて「形式が想定と異なります」に倒す。必要な項目は [data-model.md](./data-model.md) 3節に列挙済み |
| 能力値が上限を超える探索者(成長したEDUなど) | 正規化時に 100 で頭打ちにする([data-model.md](./data-model.md) 4.2) |
| 6版のDBが数値でないため表示が壊れる | タイルの値を `number \| string` にし、変換せずそのまま出す。タイルは両版とも4つなので `grid-cols-4` 固定のまま([research.md](./research.md) R7) |

## Complexity Tracking

Constitution Check に違反なし。正当化が必要な逸脱は無いため、表は設けない。判断が分かれうる
2点(ビューモデルの導入、ADRを書かないこと)は Constitution Check の本文に理由を記した。
