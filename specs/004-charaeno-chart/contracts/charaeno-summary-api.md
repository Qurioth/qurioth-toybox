# Contract: Charaeno サマリーAPI(外部依存)

**Feature**: [../spec.md](../spec.md) / **Data model**: [../data-model.md](../data-model.md)

この画面が依存する外部インターフェース。当サイトは提供側ではなく**利用側**なので、ここに書くのは
「この形で返ってくることを期待する」という取り決めであり、こちらから強制できるものではない。
取得元が仕様変更した場合、まず spec の Assumptions を見直す。

---

## 1. 入力(利用者が貼るシートURL)

```text
https://charaeno.com/{edition}/{id}
```

| 部分 | 値 |
|---|---|
| `{edition}` | `6th` または `7th` のみ。他の値は受け付けない |
| `{id}` | 英数字と ``.!#$%&'*+/=?^_`{|}~-`` からなる1文字以上の文字列 |

- 全体長は 200 文字まで(現行の入力欄の制限を維持)。
- 一致しないものは取得を行わず、入力欄の下に「URLの形式が不正です。」を出す。

**例**

| 入力 | 結果 |
|---|---|
| `https://charaeno.com/7th/abc123` | 受理(7版) |
| `https://charaeno.com/6th/abc123` | 受理(6版) |
| `https://charaeno.com/8th/abc123` | 拒否(対応外の版) |
| `http://charaeno.com/6th/abc123` | 拒否(スキームが違う) |
| `https://charaeno.com/6th/` | 拒否(IDが空) |
| `https://example.com/6th/abc123` | 拒否(ホストが違う) |

## 2. 取得先

```text
GET https://charaeno.com/api/v1/{edition}/{id}/summary
```

`{edition}` と `{id}` は入力URLから取り出したものをそのまま使う。7版のURLから6版の取得先を
組み立てること(およびその逆)があってはならない(FR-013)。

- 認証なし。リクエストヘッダは既定のまま。
- 成功時は `200` で JSON を返す。

## 3. レスポンス(期待する形)

版ごとに形が異なる。型定義は
[Charaeno7th.ts](../../../src/types/Charaeno7th.ts) /
[Charaeno6th.ts](../../../src/types/Charaeno6th.ts) が正。

この画面が**実際に読むフィールド**だけを以下に挙げる。ここに無いフィールドは、返ってきても
使わない。

### 7版

```jsonc
{
  "name": "間 紅葉 (ハザマ クレハ)",
  "characteristics": { "str": 40, "con": 50, "pow": 50, "dex": 50,
                       "app": 85, "siz": 70, "int": 75, "edu": 75 },
  "attribute": { "hp": 12, "mp": 10, "luck": 50, "san": { "value": 52 } },
  "skills": [ { "name": "医学", "value": 85, "edited": true } ],
  "backstory": [ { "name": "...", "entries": [ { "text": "..." } ] } ],
  "note": "...",
  "portraitURL": "https://..."   // 任意
}
```

### 6版

```jsonc
{
  "name": "間 紅葉 (ハザマ クレハ)",
  "characteristics": { "str": 8, "con": 10, "pow": 10, "dex": 10,
                       "app": 17, "siz": 14, "int": 15, "edu": 15 },
  "attribute": { "hp": 12, "mp": 10, "db": "+0", "san": { "value": 52 } },
  "skills": [ { "name": "医学", "value": 85, "edited": true } ],
  "mentalDisorder": "",
  "mythosTomes": "...",
  "artifactsAndSpells": "...",
  "note": "...",
  "portraitURL": "https://..."   // 任意
}
```

**注意**

- 6版の実データには `attribute.luck` / `attribute.idea` / `attribute.know` が入っていることが
  あるが、この画面では読まない(FR-014)。型定義にも足さない。
- `attribute.db`(ダメージ・ボーナス)は「+0」「+1D4」のような文字列で、数値ではない。6版では
  表面の4枠目に出すため必須として扱う。7版にも同じフィールドがあるが、7版のカードには
  出さないので必須にしない。
- 6版の `characteristics` はロール値(概ね 3〜18、EDU は最大 21)。7版のパーセンタイルとは
  尺度が違う。混同するとチャートが壊れる。
- 6版に `backstory` は無く、7版に `mentalDisorder` / `mythosTomes` / `artifactsAndSpells` は
  無い。片方の版の必須項目をもう片方に要求してはならない(FR-018)。

## 4. 失敗時の扱い

| 状況 | 画面の応答 |
|---|---|
| URLが1節の形に一致しない(対応外の版、ホスト違いなど) | 「URLの形式が不正です。」を出し、**取得は行わない** |
| 通信そのものが失敗した / `2xx` 以外が返った | 「キャラクターシートを取得できませんでした。URLを確認して、時間をおいて試してください。」 |
| `200` だが JSON が版の期待する形を満たさない | 「取得したキャラクターシートの形式が想定と異なります。」 |

- いずれの場合も直前に表示していたカードを消す(FR-007)。
- 文言は現行のまま変更しない。版によって文言を変えることもしない。
- 1つ目は通常、入力欄の検証(同じ規則を使う)で送信前に止まる。送信処理側にも同じ確認が
  あるのは、版を確定させないと取得先を組み立てられないため。どちらの経路でも同じ文言を出す。
