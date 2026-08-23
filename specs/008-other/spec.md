# Feature Specification: その他コンテンツ一覧

**Feature Branch**: `008-other`

**対象画面**: `/other` (`src/app/other/page.tsx`)

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "TRPG以外の個人コンテンツの入口となる一覧画面。現在は写真のみを扱う。既存実装の現行仕様を spec として書き起こしたもの。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - TRPG以外のコンテンツへ移動する (Priority: P1)

訪問者として、このサイトにあるTRPG以外のコンテンツを見に行きたい。ヘッダーの OTHER から
来たときに、何が置かれているのかが一目で分かってほしい。

**Why this priority**: この画面の唯一の目的。ここで行き先が示せなければ、OTHER という導線が
空振りになる。

**Independent Test**: `/other` を開き、置かれているコンテンツの区分が見出しとして並び、
選ぶと該当画面へ遷移することで確認できる。

**Acceptance Scenarios**:

1. **Given** `/other` を表示している状態、**When** 画面を見る、**Then** 写真の区分が見出しと
   して表示され、その下に写真一覧への入口がある。
2. **Given** `/other` を表示している状態、**When** 写真一覧への入口を選ぶ、**Then** 写真一覧
   画面へ遷移する。

---

### Edge Cases

- 区分が1つしかない場合でも、見出しと入口という構成は変えない。将来コンテンツが増えたときに
  同じ形式で並べられるようにするため。
- 画面幅が狭い環境では、入口が縦に積まれ、画面幅いっぱいに広がる。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 本画面は、TRPG以外の個人コンテンツを、区分ごとの見出しとその入口という形で
  提示しなければならない。
- **FR-002**: 訪問者は、写真の区分の入口から写真一覧画面へ遷移できなければならない。
- **FR-003**: 新しい区分のコンテンツを追加したときは、本画面から辿れるようにしなければ
  ならない([constitution.md](../../.specify/memory/constitution.md) 原則2)。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ヘッダーの OTHER を選んでから1操作で写真一覧に到達できる。
- **SC-002**: 幅375px の端末で、横スクロールを発生させずに全内容を閲覧できる。

## Assumptions

- サイト共通のヘッダー・フッター・配色切替の仕様は [001-home](../001-home/spec.md) で扱い、
  本specでは繰り返さない([ADR-0013](../../docs/adr/0013-spec-per-screen.md))。
- 現時点で公開している区分は写真のみ。区分を増やす場合は本specを先に更新する(原則3)。
- 本specは既存実装の現行仕様を書き起こしたものであり、新機能の追加を含まない。
