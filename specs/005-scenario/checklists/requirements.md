# Specification Quality Checklist: シナリオ一覧・詳細

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-23
**Updated**: 2026-10-03
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- 一覧部分(User Story 1、FR-001〜FR-009)は既存実装の現行仕様を書き起こしたもの。
- 2026-10-03 に詳細画面の方針を改めた。2026-10-02 に作った「全シナリオ共通の構造化表示」
  (旧 FR-015「シナリオごとに見た目を変えてはならない」を含む)を撤回し、シナリオごとの専用
  ページ + 共通の部品集 + 1本ずつの移行、という形にした(User Story 2〜8、FR-010〜FR-033、
  SC-005〜SC-010)。旧 spec の目次・NPCカード・表記の強調・読み上げ文などの要件は、部品の要件
  (FR-016〜FR-024)として引き継いだ。
- 旧 spec で「他システムのシナリオは移行対象外」としていた点は、専用ページならシステムを問わず
  作れるため撤回した(FR-031)。
- [NEEDS CLARIFICATION] は置いていない。ユーザーのプロンプトで方針(専用ページ、部品集、
  CCFOLIA コマ出力、画像、フローチャート、下書き作成、1本ずつの移行)が確定していたため。
  コマに入れる項目もプロンプトに従った。
- 専用ページの形式(MDX の方針)、部品集の作り方、NPCデータの持ち方、下書きの作り方は意図的に
  spec に書いていない。plan.md で決め、ADR-0015 の見直しを含めて ADR に記録する(constitution
  原則4)。
- CCFOLIA の貼り付け形式は公式ドキュメント「Clipboard API (beta)」に従う。beta のため、
  SC-007 は実際の CCFOLIA の部屋で確かめる
  (手順は quickstart で扱う)。
- サイト共通のヘッダー・フッター・配色切替は [001-home](../../001-home/spec.md) が唯一の
  記述箇所のため、本specでは扱わない。
- シナリオ詳細は独立したルート(`/trpg/scenario/<シナリオID>`)だが、一覧と1組の画面群として
  本specに含めている([ADR-0013](../../../docs/adr/0013-spec-per-screen.md))。
- 2026-10-03 の plan 作成時に、同 API ではコマの画像を設定できないことが分かった。オーナーと
  確認し、コマに立ち絵を含めない形に FR-028・US4 を改めた(画像の保存ボタンも付けない)。
- 存在しないIDを開いたときの挙動は「壊れずに空で表示」であり、意図的な404表示ではない。
  改善する場合は本specを先に更新する。
