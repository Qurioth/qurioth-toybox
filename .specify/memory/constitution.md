<!--
Sync Impact Report
- Version change: (unversioned) → 1.0.0
- Modified principles:
  - "6. テスト・CIは無理に完備を目指さない" → "6. テストは目的に見合う分だけ書く"
    (「現状CIはRenovateのみ」という現状スナップショットの記述を削除し、CLAUDE.md/ADRへの
    参照に置き換えた。実装が進むたびに本文を書き換える必要が生じ陳腐化していたため。
    原則の実質的な意図(個人開発のスコープに見合わない重厚化を避ける)は維持)
- Added sections: Governance内にセマンティックバージョニングのポリシー(MAJOR/MINOR/PATCH)
  を明文化
- Removed sections: なし
- Templates requiring updates: なし(.specify/templates/* は公式spec-kitのテンプレートを
  使用しており、本ファイルとは独立)
- Follow-up TODOs:
  - テスティングトロフィー戦略(ADR-0008)を独立した原則として明文化するかはユーザー判断待ち。
    今回は既存原則6の記述修正に留め、新設はしていない。
-->

# qurioth-toybox 開発原則 (Constitution)

このドキュメントは `qurioth-toybox` における Spec-Driven Development の判断基準となる原則を
定義する。`/speckit-specify` `/speckit-plan` `/speckit-tasks` の各フェーズ、および実装レビューは
この原則に照らして行う。

## プロジェクトの性質

- 一人のオーナーが自分のペースで育てる個人開発の「おもちゃ箱」サイト。TRPG(テーブルトークRPG)の
  セッション準備・記録ツールと、写真等の個人コンテンツ置き場を兼ねる。
- 利用者はほぼ自分自身、または同じTRPGコミュニティの知人。エンタープライズ的な堅牢性より、
  すぐ動く・楽しく作れることを優先してよい。

## Core Principles

### 1. 過剰実装をしない(YAGNI)

依頼された機能に対して必要十分な実装を行うこと。将来の拡張を見越した抽象化・設定項目・
汎用化は、明確に要求されない限り追加してはならない(MUST NOT)。個人開発の速度を落とす
複雑さは負債になる。

### 2. 既存の慣習に合わせる

新規ページは `src/app/<domain>/page.tsx` の Next.js App Router 規約に従わなければならない
(MUST)。`trpg/page.tsx` の `toolCards` / `libraryCards` のようなカード一覧から辿れるように
すること(SHOULD)。コンポーネントは `src/components/` 配下に用途別(`forms/`、`recharts/` 等)
またはトップレベルに配置する。UI文言は日本語を基本とする。詳細は
[CLAUDE.md](../../CLAUDE.md) を参照。

### 3. 仕様は「なぜ」を残す

`spec.md` には要件と背景(なぜ必要か)を記述しなければならず(MUST)、実装方法(どう作るか)
は `plan.md` に分離しなければならない(MUST)。実装の途中で仕様と食い違いが生じたときは、
コードではなく仕様を先に見直さなければならない(MUST)。

### 4. 大きな判断はADRに記録する

依存ライブラリの入れ替え、データ構造の破壊的変更、認証や外部サービス連携の追加など、
後戻りにコストがかかる判断をしたときは、`docs/adr/` にADRを追加しなければならない(MUST)。

### 5. 小さな変更にはSDDフローを課さない

typo修正、依存パッケージ更新、スタイル微調整などは、Spec-Driven Developmentのフローを
経由せず直接実装してよい(MAY)。SDDは「ある程度まとまった機能追加・変更」にのみ適用する
(SHOULD)。

### 6. テストは目的に見合う分だけ書く

テストを書くことは推奨するが(SHOULD)、個人開発のスコープに見合わない重厚なテスト基盤を
目的化してはならない(MUST NOT)。具体的なテスト戦略・技術選定は `docs/adr/` に記録し
(例: テスト戦略とVitest採用についてはADR-0008)、現時点のCI・テストの整備状況は
[CLAUDE.md](../../CLAUDE.md) を参照する。本原則の本文には現在の整備状況のスナップショットを
書かない(実装が進むたびに陳腐化するため)。

## Governance

このConstitutionは本プロジェクトのオーナー(開発者本人)がいつでも改訂できる(MAY)。
改訂する際は本ファイルを直接更新し、冒頭にSync Impact Reportを HTML コメントとして
記録しなければならない(MUST)。大きな方針転換であれば `docs/adr/` にもADRとして理由を
残すべきである(SHOULD)。

バージョンは以下のセマンティックバージョニングに従う。

- **MAJOR**: 既存原則の後方互換性のない削除・再定義
- **MINOR**: 新しい原則・セクションの追加
- **PATCH**: 文言修正・明確化など非意味的な変更

**Version**: 1.0.0 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-07-31
