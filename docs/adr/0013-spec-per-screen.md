# 0013. specの単位を「機能ごと」から「画面ごと」に変更する

## ステータス

Accepted

## 日付

2026-08-23

## コンテキスト

[ADR-0002](0002-adopt-spec-driven-development.md) / [ADR-0009](0009-adopt-official-spec-kit-cli.md)
で導入したSDDでは、spec-kitの既定に従って spec を「機能(feature)ごと」に
`specs/<番号>-<slug>/` として作ってきた。しばらく運用した結果、次の問題が見えてきた。

- 最初に作った `specs/001-vitest-testing-trophy/`(テスト基盤の導入)はリポジトリ横断の
  変更で、特定の画面に紐づかない。実装が完了した時点で tasks.md は全て消化済みになり、
  以後参照されない「終わったドキュメント」になった。技術判断は
  [ADR-0008](0008-adopt-testing-trophy-and-vitest.md) に記録済みで、spec 側にしか無い情報も
  ほとんど残っていなかった。
- このリポジトリは `trpg/ccfolia-grep`、`trpg/connection-table` のようにツールごとに独立した
  画面が並ぶ構成で、機能追加も実際には「どの画面に何を足すか」という形を取ることが多い。
- 機能単位で作り続けると、同じ画面に対する仕様が複数の spec ディレクトリに分散し、
  「この画面は今どういう仕様なのか」を1箇所で読めなくなる。

## 決定

- spec は **画面(ルート)ごと** に作る。`specs/<番号>-<画面slug>/` を画面と1対1で対応させる。
- その画面を改修するときは、新しいディレクトリを作り足さず、対応する既存ディレクトリの
  `spec.md` を更新する。`spec.md` はその画面の**現行仕様**を表すものとして維持する
  (完了しても削除しない)。
- `plan.md` / `tasks.md` はその時の改修に対する作業ドキュメントとして扱う。過去の内容と
  食い違ったときは `spec.md` を正とする。
- 画面に紐づかない横断的な判断(テスト戦略、ツールチェイン、CI構成など)は spec ではなく
  **ADRに記録する**。spec を作らない。
- 上記に伴い、役割を終えた `specs/001-vitest-testing-trophy/` は削除する。残す価値のある
  技術判断(jsdom採用理由、`vitest.setup.ts` で補うブラウザAPI、最初のテスト対象など)は
  ADR-0008 の本文に取り込んだ。
- 採番は spec-kit CLI(`create-new-feature.sh`)の自動採番に従う。上記の削除により採番は
  001 に戻るため、以後は画面ごとに 001 から振り直される。
- 本ADRを機に、既存の9画面(トップ、`trpg`、`trpg/ccfolia-grep`、`trpg/charaeno-chart`、
  `trpg/scenario`、`trpg/replay`、`trpg/connection-table`、`other`、`other/photograph`)は
  一度 spec を書き起こす。画面と spec の対応が虫食いだと「この画面の仕様はどこか」を
  探す手間が残り、方針変更の効果が出ないため。UI実験用の `blurry-blob-demo` は対象外とする。
- 詳細ページやサンプルページ(`trpg/scenario/[id]`、`trpg/charaeno-chart/sample-character`)は
  独立したディレクトリを作らず、親にあたる画面の spec に含める。
- 以後に追加する画面は、その画面を作るときに spec を作る(先回りして枠だけ作らない)。
- 小さな変更にSDDフローを課さない方針([constitution.md](../../.specify/memory/constitution.md)
  原則5)は変更しない。既存画面のtypo修正やスタイル微調整で `spec.md` の更新を強制するもの
  ではない。

## 影響・トレードオフ

- 良い点: 画面と spec が1対1になるため、「この画面の仕様」を1ファイルで読める。ディレクトリが
  改修のたびに増え続けることもなくなる。横断的な判断はADRという既存の置き場に寄るので、
  spec とADRの役割分担がはっきりする。
- コスト: spec-kit のテンプレートは「これから作る機能」を前提とした構成(User Storyの
  P1/P2/P3、`tasks.md`)なので、現行仕様書として維持するには読み替えが必要になる。
  `/speckit-specify` は新規ディレクトリを作ろうとするため、既存画面の改修では出力先を
  既存ディレクトリに向ける操作が要る。
- 仕様の変遷は `spec.md` を上書きしていく形になるため、「いつ・なぜ変わったか」は
  git の履歴に頼ることになる。大きな方針転換はこれまで通りADRに残すことで補う。
