# 0007. Biomeの`recommended`プリセットを有効化する

## ステータス

Accepted

## 日付

2026-07-31

## コンテキスト

[ADR-0006](0006-migrate-eslint-to-biome.md)でBiomeへ移行した際、既存コードに対して
`recommended`プリセットを試すと32件のエラー・20件の警告が新規発生したため、移行時のスコープを
超えるとして見送り、旧ESLint設定相当の個別ルール(`preset: "none"`)にとどめていた。

今回、それらのエラー・警告を個別に精査し、実際に修正する作業を別ブランチで行った。

## 決定

- `biome.json`の`linter.rules.preset`を`"none"`から`"recommended"`に変更する。
- 検出された問題は内容に応じて次のように対応した。
  - **実装の修正**: `.map()`の戻り値を使わない箇所を`.forEach()`に変更、`if`分岐の抜け漏れで
    `undefined`を返していた箇所を`editedSkills`(事前フィルタ済み配列)の再利用に変更、
    未使用importの削除、`useEffect`の不要な依存の削除、`useExhaustiveDependencies`の指摘に
    従った依存配列の整理。
  - **a11y修正**: カードクリックによるフリップ操作を`<div role="button">`ではなく実際の
    `<button>`要素に変更(キーボード操作が標準で効くようになり、`onKeyDown`の自前実装が不要に
    なった)。装飾目的のSVGアイコンに`aria-hidden`を付与。`<button>`に`type="button"`を明示。
  - **Reactのkeyをindexから自然なキーへ変更**: `skill.name`、`backstory.name`、
    フォーム部品の選択肢の値そのもの(`checkItem`、`selectItem`)、キャラクター名など、一意性が
    見込めるフィールドに差し替えた。
  - **`biome-ignore`で明示的に許容**: バックストーリーのエントリ・改行分割した行・メモの段落など、
    自然なIDを持たず並び順も変化しない静的コンテンツのkeyはindexのまま残し、理由をコメントで
    明記した。写真ページの列(`colIdx`)も同様(固定列数のレイアウト用途のため)。検索条件変更時に
    `visibleCount`をリセットする`useEffect`(`replay/page.tsx`)は、依存配列の値が本文で参照
    されていなくても意図的な再実行トリガーのため、自動修正提案は採用せずコメントで残した。
  - **CSSの誤検知除外**: `globals.css`の`@tailwind`ディレクティブをBiomeのCSSリンタが未知の
    at-ruleとして検出するため、`files.includes`で`*.css`をBiomeのlint対象から除外した
    (ESLintも元々CSSはlintしていなかったため、実質的な後退はない)。

## 影響・トレードオフ

- 良い点: a11y・React best practiceを含むBiomeの標準的なルールセットが有効になり、今後の
  実装ミスをCIで検知できる範囲が広がった。カードのキーボード操作対応など、実際のUX改善も
  含まれる。
- コスト: `biome-ignore`コメントが要所に増え、`preset: "none"`だった頃より設定・コード双方の
  見通しがやや複雑になった。個別のignore理由を読む必要がある。
