# Specification Quality Checklist: キャラクターシートのチャート表示

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-23
**Updated**: 2026-08-23（クトゥルフ神話TRPG 6版対応の追加にあわせて再検証）
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

- 本specは画面の現行仕様を表す。今回の更新で6版のキャラクターシート対応(User Story 2、
  FR-012〜FR-018、SC-005/SC-006)を追加した。`plan.md` / `tasks.md` はこの改修に対する
  作業ドキュメントとして別途作成する([ADR-0013](../../../docs/adr/0013-spec-per-screen.md))。
- FR-017(レーダーチャートの目盛り)だけは、能力値ごとに上限を変えられない場合の代替を
  spec 側に残している。要件としては「各能力値がその上限に対する割合として読めること」が本体で、
  どちらの描き方を採るかは `plan.md` の判断に委ねる。
- サイト共通のヘッダー・フッター・配色切替は [001-home](../../001-home/spec.md) が唯一の
  記述箇所のため、本specでは扱わない。
- 外部サービス(Charaeno)への依存が本画面の前提。6版・7版で取得先が分かれるため、サービス側の
  仕様変更はどちらか一方だけに影響することもある。表示できなくなった場合はまず本specの
  Assumptions を見直す。
- サンプルキャラクター一覧は独立した画面だが、本specに含めている
  ([ADR-0013](../../../docs/adr/0013-spec-per-screen.md))。今回の6版対応ではサンプルの
  追加を行わないため、User Story 4 の内容は変更していない。
