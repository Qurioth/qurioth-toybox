# Contract: CharacterCard と変換ユーティリティ(画面内部)

**Feature**: [../spec.md](../spec.md) / **Data model**: [../data-model.md](../data-model.md)

この画面の内部で、モジュール間が守る取り決め。外部に公開するものではないが、版の知識が
どこまで届いてよいかの線引きなので契約として残す。

---

## 1. 版の知識が届く範囲

```text
page.tsx ─────────────▶ charaeno-utils ─────────────▶ character-card-utils ──▶ CharacterCard
(版を意識するのは        (URL→版・ID、版ごとの検証)     (版ごとの Investigator      (版を知らない)
 取得先の切り替えまで)                                   → CharacterCardData)
```

- **`CharacterCard` は版を知らない。** props に `edition` を渡さない。版で分岐する記述を
  カードの中に置かない。
- 版に依存する判断(能力値の上限、タイルの構成、裏面の見出しと順序)はすべて
  `character-card-utils` で解決してからカードへ渡す。

## 2. `charaeno-utils` の境界

| 関数 | 入力 | 出力 | 取り決め |
|---|---|---|---|
| シートURLの解析 | シートURL文字列 | `SheetReference`(版とID) または「不正」 | 入力欄の検証と同じ規則を使う。規則の定義はこのモジュールに1つだけ置き、`page.tsx` はそれを参照する |
| サマリーURLの組み立て | `SheetReference` | 取得先URL文字列 | 版はそのまま埋める。既定値で補わない |
| 7版の型ガード | `unknown` | 7版の `Investigator` か | 6版固有の項目を要求しない |
| 6版の型ガード | `unknown` | 6版の `Investigator` か | 7版固有の項目(`backstory` / `attribute.luck`)を要求しない。表面に出す `attribute.db` は要求する |
| 表示名の整形 | 名前文字列 | 括弧書きを除いた名前 | 版によらず同じ。現行のまま |

- 型ガードは「カードを描くのに必要な項目が揃っているか」だけを見る。全フィールドの妥当性検証は
  行わない(FR-018)。
- 版の判定はURLの解析でのみ行う。レスポンスの中身から版を推測しない。

## 3. `character-card-utils` の境界

| 関数 | 入力 | 出力 |
|---|---|---|
| 7版 → カード用データ | 7版の `Investigator` | `CharacterCardData` |
| 6版 → カード用データ | 6版の `Investigator` | `CharacterCardData` |

**両方が満たすべき後条件**

- `characteristics` は必ず8要素、順序は `STR, CON, POW, DEX, APP, SIZ, INT, EDU`。
  各 `value` は 0〜100 に収まる([data-model.md](../data-model.md) 4.2 の式)。
- `attributes` はどちらの版も4要素。4枠目だけが違い、7版は幸運、6版はDB(ダメージ・ボーナス)。
  DBの値は文字列のまま渡す。
- `skills` は `edited` が `true` のものだけ。
- `sections` に空の項目を含めない。`blocks` が空の配列になるセクションを返さない。
- `name` は括弧書きを落とした表示名。
- 純粋関数として書く。取得・状態・DOMに触れない。

## 4. `CharacterCard` の props

```ts
{ data: CharacterCardData }
```

**カードが守ること**

- `data.attributes` を渡された順に並べる。値が数値でなくてもそのまま出す(DBは文字列)。
- `data.sections` を渡された順に描く。`kind` が `"list"` なら箇条書き、`"text"` なら段落。
- `data.portraitURL` が空・未設定なら既定の人物アイコンを出す。
- 表裏の切り替え、md 未満/以上の出し分け、チャートを表示中だけマウントする既存の制御は
  変更しない。
- チャートには `data.characteristics` をそのまま渡す。カードの中で能力値を再計算しない。

**カードがしないこと**

- 版による分岐。`edition` を受け取らない。
- 空項目の除外、技能の絞り込み、見出しの決定。これらは渡される前に済んでいる。

## 5. 呼び出し側(`page.tsx` / サンプル一覧)

- `page.tsx`: 入力URLを解析 → 版に応じた取得先へ取得 → 版に応じた型ガード → 版に応じた変換 →
  `CharacterCard` に渡す。エラー時の文言と、直前のカードを消す挙動は現行のまま。
- サンプル一覧: リポジトリ内の7版JSONを7版の変換に通して `CharacterCard` に渡す。表示内容は
  変えない。6版のサンプルは置かない。
