# Specification Quality Checklist: シナリオ一覧・詳細

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-23
**Updated**: 2026-10-02
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
- 2026-10-02 に詳細画面を「全シナリオ共通の構造化された見せ方」へ作り替える改修を追加した
  (User Story 2〜7、FR-010〜FR-028、SC-005〜SC-009)。改修完了までは詳細画面の記述が現行実装と
  一致しない。
- 2026-10-02 の specify 時に次の2点をユーザーに確認して確定した。
  - 移動手段(FR-018): 目次とする。広い画面では常に表示し、狭い画面では開閉できるようにする。
    章は折りたたまない。
  - 他システムのシナリオ(FR-028): 移行対象外とし、従来の整形表示のまま残す。移行は
    クトゥルフ神話TRPG 7版の11本の移行で完了とする。
- 本文の持ち方(データ形式、Markdownを残すか)は意図的に spec に書いていない。plan.md で決め、
  ADR を追加する(constitution 原則4)。シナリオ本文の記述規約(`src/data/scenario/README.md`、
  ADR-0014)の更新も plan 以降で扱う。
- SC-008(欠落0件)は、移行前の本文と移行後の表示を照合して確かめる前提。照合の方法は plan で
  決める。
- サイト共通のヘッダー・フッター・配色切替は [001-home](../../001-home/spec.md) が唯一の
  記述箇所のため、本specでは扱わない。
- シナリオ詳細は独立したルート(`/trpg/scenario/<シナリオID>`)だが、一覧と1組の画面群として
  本specに含めている([ADR-0013](../../../docs/adr/0013-spec-per-screen.md))。
- 存在しないIDを開いたときの挙動は「壊れずに空で表示」であり、意図的な404表示ではない。
  改善する場合は本specを先に更新する。
