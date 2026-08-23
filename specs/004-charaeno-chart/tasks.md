---

description: "6版のキャラクターシート対応の作業一覧"
---

# Tasks: 6版のキャラクターシート対応

**Input**: Design documents from `/specs/004-charaeno-chart/`

**Prerequisites**: [plan.md](./plan.md) / [spec.md](./spec.md) / [research.md](./research.md) /
[data-model.md](./data-model.md) / [contracts/](./contracts)

**Tests**: 含める。このリポジトリはテスティングトロフィー(ADR-0008)を採っており、テストは
完了条件の一部。どのファイルに何を書くかは [research.md](./research.md) R9 の表に対応する。

**Organization**: spec.md のユーザーストーリーは**画面全体の現行仕様**を表すため、4つのうち
今回新しく作るのは **User Story 2(6版の探索者も同じ入り口で扱う)だけ**。残る US1 / US3 / US4 は
既に動いている機能で、今回の作業では「壊さないこと」が目標になる。そのため US1 / US3 / US4 の
実装フェーズは設けず、Phase 4 の退行確認で担保する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる(別ファイル・依存なし)
- **[Story]**: 対応するユーザーストーリー(US2)
- ファイルパスは説明中に明記する

## Path Conventions

単一の Next.js アプリ。ソースは `src/` 配下、テストは対象と同じディレクトリにコロケーション
(`*.test.ts(x)`)。詳細は [plan.md](./plan.md) の Project Structure。

---

## Phase 1: Setup

**Purpose**: 作業の土台と、退行を判定するための基準を作る

- [X] T001 作業ブランチを master から切る(例: `git switch -c 004-charaeno-chart-6th`)。このリポジトリの変更は PR 経由のため、master 上で直接作業しない
- [X] T002 `pnpm install` の後 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、変更前の状態が全て通ることを確認する。以降の退行判定はこの結果を基準にする

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: カードを版に依存しない形へ作り替える。**このフェーズでは利用者から見える振る舞いを
一切変えない**(受け付けるURLも表示内容も7版のまま)。6版対応はこの土台の上に乗る。

**⚠️ CRITICAL**: Phase 3 はこのフェーズの完了なしに開始できない

- [X] T003 `src/types/CharacterCard.ts` を新規作成し、`CharacterCardData` / `CharacteristicPoint` / `AttributeTile` / `SkillRow` / `CardSection` を定義する([data-model.md](./data-model.md) 4節の型定義に従う)
- [X] T004 `src/utils/character-card-utils.ts` を新規作成し、7版の `Investigator` → `CharacterCardData` の変換を実装する。現在 `src/components/CharacterCard.tsx` が内部で行っている導出(能力値の順序固定と正規化、HP/MP/SAN/幸運のタイル、`edited` な技能の絞り込み、backstory を `kind: "list"` のセクション・note を `kind: "text"` のセクションへ、空項目の除外)をここへ移す。純粋関数として書き、取得や DOM に触れない(T003 に依存)
- [X] T005 `src/utils/character-card-utils.test.ts` を新規作成し、7版変換のユニットテストを書く。正規化後も値が変わらないこと(上限100・整数)、タイルが HP/MP/SAN/幸運 の4つであること、セクションの見出しと順序、`entries` が空白のみの項目がセクションごと落ちること、`edited` でない技能が含まれないこと(T004 に依存)
- [X] T006 `src/components/CharacterCard.tsx` を `{ data: CharacterCardData }` を受け取る形へ変更する。内部の導出処理を削除し、`data.attributes` の要素数に応じて `grid-cols-3` / `grid-cols-4` を**完全なクラス名で**出し分け、`data.sections` を `kind` で描き分け、チャートには `data.characteristics` を `dataKey="value"` でそのまま渡す。表裏の切り替え・md での出し分け・チャートを表示中だけマウントする制御には手を入れない([contracts/character-card-props.md](./contracts/character-card-props.md) 4節)
- [X] T007 `src/components/CharacterCard.test.tsx` をビューモデルを受け取る形へ追従させ、タイルが3つのケースでも崩れず描けることを追加する。既存の表裏・レスポンシブ・チャートのマウントに関するテストは意図を変えずに残す(T006 に依存)
- [X] T008 `src/app/trpg/charaeno-chart/page.tsx` を、取得成功後に7版変換を通してから `CharacterCard` へ渡す形へ変更する。この時点では7版のみ。URL の検証規則・エラー文言・直前のカードを消す挙動は変更しない(T004・T006 に依存)
- [X] T009 [P] `src/app/trpg/charaeno-chart/sample-character/page.tsx` を、リポジトリ内の7版 JSON を7版変換に通してから `CharacterCard` へ渡す形へ変更する。並ぶサンプルも表示内容も変えない(T004・T006 に依存、T008 とは別ファイルなので並行可)
- [X] T010 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` を実行し、T002 と同じく全て通ることを確認する。ここで落ちるテストがあれば、それは振る舞いを変えてしまった印

**Checkpoint**: カードが版を知らない形になった。利用者から見た画面は変更前と同一

---

## Phase 3: User Story 2 - 6版の探索者も同じ入り口で扱う (Priority: P1) 🎯 MVP

**Goal**: 7版と同じ入力欄に6版のシートURLを貼るだけで、版を選ぶ操作なしにカードが表示される。
チャートは6版の尺度で描かれ、表面は HP/MP/SAN の3つ、裏面は6版の4項目になる。

**Independent Test**: 6版のシートURLを入力して実行し、(1) 取得先が `/api/v1/6th/{id}/summary`
であること、(2) カードが表示されること、(3) 幸運のタイルが無いこと、(4) 裏面が
精神的な障害→魔導書→アーティファクト／呪文→メモ の順であること、を確認する。7版のURLでは
変更前と同じカードが出る。

### Implementation for User Story 2

- [X] T011 [US2] `src/utils/charaeno-utils.ts` に、シートURLの正規表現を1本置き、そこから版(`6th` / `7th`)とIDを取り出す解析関数を実装する。`SHEET_URL_PREFIX` の `7th` 直書きを置き換える。ID に使える文字は現行の実装を踏襲し、`6th` / `7th` 以外の版は一致させない([contracts/charaeno-summary-api.md](./contracts/charaeno-summary-api.md) 1節)
- [X] T012 [US2] `src/utils/charaeno-utils.ts` の `toSummaryApiUrl` を、解析結果(版+ID)から `https://charaeno.com/api/v1/{edition}/{id}/summary` を組み立てる形へ変更する。版は取り出したものをそのまま埋め、既定値で補わない(T011 に依存・同一ファイル)
- [X] T013 [US2] `src/utils/charaeno-utils.ts` の `isInvestigator` を版ごとの型ガード2つへ分ける。両版で共通して必要な項目は共有ヘルパにまとめ、7版のみ `backstory` と `attribute.luck` を、6版のみ `mentalDisorder` / `mythosTomes` / `artifactsAndSpells` を必須にする([data-model.md](./data-model.md) 3節の表が正)(T011 に依存・同一ファイル)
- [X] T014 [US2] `src/utils/charaeno-utils.test.ts` を更新する。版とIDの取り出し(6th / 7th / `8th` などの対応外 / IDが空 / ホスト違い)、両版の取得先の組み立て、版ごとの型ガードが他方の版の必須項目を要求しないこと(6版のオブジェクトが7版ガードで false、7版のオブジェクトが6版ガードで false)を確認する(T011〜T013 に依存)
- [X] T015 [P] [US2] `src/utils/character-card-utils.ts` に6版の `Investigator` → `CharacterCardData` の変換を追加する。能力値は EDU のみ 21・それ以外は 18 を上限として `Math.min(100, Math.round(raw / cap * 100))` で正規化、タイルは HP/MP/SAN の3つ(幸運は組み立てない)、セクションは 精神的な障害 → 読んだクトゥルフ神話の魔導書 → アーティファクト／学んだ呪文 → メモ の4つを全て `kind: "text"` で、空になる項目は落とす([data-model.md](./data-model.md) 4.2〜4.5)(T004 に依存。`charaeno-utils.ts` とは別ファイルなので T011〜T014 と並行可)
- [X] T016 [US2] `src/utils/character-card-utils.test.ts` に6版変換のテストを追加する。同じ生値でも EDU と INT で正規化結果が異なること、上限を超える値が 100 で止まること、タイルが3つで幸運を含まないこと、セクションの見出しと順序、空文字の項目がセクションごと落ちること、FR-016 で除外する項目(住所・遭遇した超自然の存在・所持品など)がどのセクションにも現れないことを確認する(T015 に依存)
- [X] T017 [US2] `src/app/trpg/charaeno-chart/page.tsx` の入力欄の `pattern` を `charaeno-utils` に置いた正規表現へ差し替え、ページ側の `7th` 直書きを無くす。検証エラーの文言「URLの形式が不正です。」は変更しない(T011 に依存)
- [X] T018 [US2] `src/app/trpg/charaeno-chart/page.tsx` の送信処理を、URL解析 → 版に応じた取得先へ取得 → 版に応じた型ガード → 版に応じた変換 → `CharacterCard` へ渡す、の流れへ変更する。取得失敗と形式不一致で文言を出し分けること、いずれの失敗でも直前のカードを消すことは現行のまま維持する(T012・T013・T015・T017 に依存)
- [X] T019 [US2] `src/app/trpg/charaeno-chart/page.test.tsx` に6版のケースを追加する。6版URLの送信で `fetch` が `/api/v1/6th/{id}/summary` を受け取ること、6版のレスポンスでカードが表示されること、幸運のタイルが出ないこと、対応外の版のURLでは `fetch` が呼ばれず形式エラーが出ることを確認する。既存の7版のケースは意図を変えずに残す(T018 に依存)

**Checkpoint**: 6版・7版のどちらのシートURLでもカードが出る。ここで機能としては完成

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 非自明な判断をコードに残し、退行がないことを実機で確かめる

- [X] T020 `src/utils/character-card-utils.ts` の正規化処理に、なぜ正規化するのか(recharts の RadarChart は半径軸を1本しか持てず、能力値ごとに上限を変えられないため)をコメントで残す。plan.md は改修ごとに上書きされるため、理由はコードに置く([research.md](./research.md) R1)
- [X] T021 `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` を通す(CI と同じ一式)。整形は Biome に任せ、手で直さない
- [X] T022 [P] `pnpm dev` で [quickstart.md](./quickstart.md) のシナリオ1〜4を実行する(6版の取得先、チャートが中心に潰れないこと、タイル3つがモバイル幅・デスクトップ幅の両方で崩れないこと、裏面の項目と順序)
- [X] T023 [P] [quickstart.md](./quickstart.md) のシナリオ5〜8を実行し、既存ストーリーの退行がないことを確認する(シナリオ5=US1・US3 の7版カードが不変、シナリオ6=対応外URL、シナリオ7=失敗時の扱い、シナリオ8=US4 のサンプル一覧が不変)

---

## Phase 5: 追加変更 — 6版の4枠目をダメージ・ボーナスにする

**Purpose**: Phase 3 まで「6版の表面は HP・MP・SAN の3つ」で作ったが、幸運を落とした4枠目に
ダメージ・ボーナスを「DB」として出す方針に変わったため、その差分を入れる。
T004〜T022 の説明文は当時のまま残してある(実際にその通り作ったため)。現行の仕様は
[spec.md](./spec.md) の FR-014 が正。

- [X] T024 `src/types/CharacterCard.ts` の `AttributeTile.value` を `number | string` に広げる。ダメージ・ボーナスは「+0」「+1D4」のような文字列で数値ではないため
- [X] T025 `src/utils/character-card-utils.ts` の6版変換に `{ label: "DB", value: attribute.db }` を4枠目として足し、`src/utils/character-card-utils.test.ts` のタイルのテストを4つに直す
- [X] T026 `src/utils/charaeno-utils.ts` の6版の型ガードに `attribute.db` が文字列であることの確認を足す(表面に出すため必須)。7版側には足さない。`hasNumbers` と対になる `hasStrings` を用意し、`src/utils/charaeno-utils.test.ts` に欠損ケースを追加する
- [X] T027 `src/components/CharacterCard.tsx` の `getAttributeGridClass` を削除して `grid-cols-4` 固定に戻す。両版とも4つになり `grid-cols-3` に到達する経路が無くなったため(原則1)。`CharacterCard.test.tsx` のタイル3つのテストを、数値でない値(DB)を描くテストへ置き換える
- [X] T028 `spec.md`(FR-014・US2の受け入れ・Key Entities)、`data-model.md`(3節の検証表・4.3)、`contracts/` 両ファイル、`quickstart.md` シナリオ3、`research.md` R4・R7、`plan.md` を新しい方針へ更新する

---

## Phase 6: 追随 — 入口の表記と文書のずれを直す

**Purpose**: 6版対応の結果、画面の別の場所や設計文書に事実と食い違う記述が残ったので直す。

- [X] T029 `src/app/trpg/page.tsx` の Charaeno Chart Card の対応システム表記を「クトゥルフ神話TRPG 7版」→「クトゥルフ神話TRPG」に変える。この画面の仕様は [002-trpg](../002-trpg/spec.md) 側にあるため、そちらの受け入れシナリオの例示も合わせる
- [X] T030 実装と設計文書のずれを洗い出して直す。`spec.md` の FR-017 から不要になった逃げ道を外す、`plan.md` の Source Code に `constants/message.ts` と `app/trpg/page.tsx` を足す、`data-model.md` のタイル数の注記、`contracts/charaeno-summary-api.md` の失敗時の表にURL不一致の行を足す、`quickstart.md` にシナリオ9を足す、`research.md` R9 のテスト範囲を実際に書いた内容へ合わせる

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし
- **Phase 2 (Foundational)**: Phase 1 の完了に依存。**Phase 3 を全面的にブロックする**
- **Phase 3 (US2)**: Phase 2 の完了に依存
- **Phase 4 (Polish)**: Phase 3 の完了に依存

### User Story Dependencies

- **User Story 2 (P1)**: 今回唯一の実装対象。Phase 2 の完了後に着手できる
- **User Story 1 / 3 / 4**: 既存機能。新規の実装タスクは無く、T010(自動テスト)と T023(実機確認)で
  維持を担保する

### Within Phase 3

- `charaeno-utils.ts` を触る T011 → T012 → T013 は**同一ファイルのため直列**
- T014 は T011〜T013 の後
- T015 → T016 は別ファイル(`character-card-utils.ts`)で完結し、上の直列と**並行可**
- T017・T018 は上の両方が揃ってから(`page.tsx` が両モジュールを使うため)
- T019 は T018 の後

### Parallel Opportunities

このリポジトリは一人開発なので、並行できる箇所は多くない。実際に効くのは次の3つだけ。

- **T009**: `sample-character/page.tsx` は T008 の `page.tsx` と別ファイルで、依存も同じ。同時に進められる
- **T015 / T016**: `character-card-utils.ts` の6版変換は、`charaeno-utils.ts` を触る T011〜T014 と独立している
- **T022 / T023**: 実機確認は互いに独立(ただし T021 の後)

同一ファイルを触るタスク(T011〜T013、T017〜T018)は並行させない。競合して手戻りになる。

---

## Implementation Strategy

### 安全な進め方(推奨)

1. **Phase 1** で「今どこまで通っているか」を記録する
2. **Phase 2** で作りを変えるが、振る舞いは変えない。T010 で既存テストが全て通ることを確認する。
   ここが今回いちばん退行を出しやすい区間なので、通らないまま先へ進まない
3. **Phase 3** で6版を足す。T014・T016・T019 のテストが機能の完成判定になる
4. **Phase 4** で実機確認まで済ませる

### MVP

Phase 1 → Phase 2 → Phase 3 まで。この時点で6版のシートが扱え、7版も従来どおり動く。
Phase 4 は品質確認で、機能としては Phase 3 の Checkpoint が完成点。

### 分割してコミットする場合

Phase 2 の完了時点(T010)は「振る舞いを変えない作り替え」で閉じているため、レビューしやすい
区切りになる。PR を分けるならここで一度切る。

---

## Notes

- `[P]` は別ファイルで依存が無いことを示す
- `src/types/Charaeno6th.ts` / `Charaeno7th.ts` / `src/components/recharts/CharacteristicsRadarChart.tsx`
  は**変更しない**。触る必要が出たら設計の前提が崩れているので、[research.md](./research.md) R1・R2 を
  読み直す
- 6版のサンプル JSON を `src/data/sample-character/` に置かない。サンプル一覧画面に現れてしまう
  (spec の Assumptions)。テスト用のデータはテストファイル内に最小限を作る
- 各タスクまたは区切りのよい単位でコミットする
