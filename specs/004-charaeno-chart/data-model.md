# Phase 1 Data Model: 6版のキャラクターシート対応

**Feature**: [spec.md](./spec.md) / **Plan**: [plan.md](./plan.md) / **Research**: [research.md](./research.md)

**Date**: 2026-08-23

この画面が扱うデータは3層になる。外側から順に「シートURL」「版ごとのサマリー(外部APIの形)」
「カード用ビューモデル(この画面の形)」。カードは一番内側だけを知る。

```text
入力URL ──▶ SheetReference ──▶ 版ごとの Investigator ──▶ CharacterCardData ──▶ CharacterCard
          (版 + ID を取り出す)   (外部APIの形をそのまま)     (カードが描く形)
```

---

## 1. Edition(版)

```ts
type Edition = "6th" | "7th";
```

- 値は2つのみ。これ以外の版は URL の検証段階で弾かれる(FR-002)。
- 探索者ごとに1つに定まり、入力されたURLからのみ決まる(FR-012)。利用者の選択・保存された
  設定・レスポンスの中身からは決めない。

## 2. SheetReference(シートの参照)

```ts
type SheetReference = {
  edition: Edition;
  id: string;
};
```

| フィールド | 由来 | 規則 |
|---|---|---|
| `edition` | シートURLのパス | `6th` か `7th` のいずれか |
| `id` | シートURLのパス | Charaeno のシートID。空文字は不可 |

**検証規則**

- シートURL全体が `^https://charaeno\.com/(6th\|7th)/<id>$` に一致すること。
- `<id>` に使える文字は現行の実装を踏襲する(英数字と `.!#$%&'*+/=?^_\`{|}~-`)。
- 一致しない場合は `SheetReference` を作らず、入力欄の検証エラー「URLの形式が不正です。」を出す。
  取得は行わない(FR-002)。

**派生**: サマリーの取得先は `https://charaeno.com/api/v1/{edition}/{id}/summary`。
`edition` はURLから取り出したものをそのまま使う(FR-013)。

## 3. Investigator(版ごとのサマリー)

外部APIのレスポンスの形。**この画面では定義を変えない**(R2)。

- 7版: [src/types/Charaeno7th.ts](../../src/types/Charaeno7th.ts)
- 6版: [src/types/Charaeno6th.ts](../../src/types/Charaeno6th.ts)(既存・これまで未使用)

### 版による違い(カードに関係する範囲)

| 項目 | 7版 | 6版 |
|---|---|---|
| `characteristics` の8能力値 | あり(0〜100のパーセンタイル) | あり(ロール値) |
| `attribute.hp` / `mp` / `san.value` | あり | あり |
| `attribute.db`(ダメージ・ボーナス) | あり(カードには出さない) | あり(カードの4枠目に出す) |
| `attribute.luck` | あり | 型定義には無い(実データには入ることがある。使わない) |
| `skills[]`(`name` / `value` / `edited`) | あり | あり(同じ形) |
| `backstory[]` | あり(10項目) | 無い |
| `mentalDisorder` / `mythosTomes` / `artifactsAndSpells` | 無い | あり(いずれも文字列) |
| `note` | あり | あり |
| `portraitURL` | 任意 | 任意 |

### 検証規則(FR-018)

判定済みの版に対応するガードだけを通す。他方の版の必須項目は要求しない。

| 対象 | 7版 | 6版 |
|---|---|---|
| `name` が文字列 | 必須 | 必須 |
| `note` が文字列 | 必須 | 必須 |
| `skills` が配列 | 必須 | 必須 |
| `characteristics` の str/con/pow/dex/app/siz/int/edu がすべて数値 | 必須 | 必須 |
| `attribute.hp` / `attribute.mp` が数値 | 必須 | 必須 |
| `attribute.san.value` が数値 | 必須 | 必須 |
| `attribute.db` が文字列 | **不要** | 必須 |
| `attribute.luck` が数値 | 必須 | **不要** |
| `backstory` が配列 | 必須 | **不要** |
| `mentalDisorder` / `mythosTomes` / `artifactsAndSpells` が文字列 | **不要** | 必須 |

満たさない場合はカードを描かず「取得したキャラクターシートの形式が想定と異なります。」を出し、
直前のカードは消す(FR-006 / FR-007)。

## 4. CharacterCardData(カード用ビューモデル)

カードが描くために必要な情報だけを持つ。版に依存する知識はここへ入る前にすべて解決済み。

```ts
type CharacterCardData = {
  name: string;                              // 括弧書きを落とした表示名
  portraitURL?: string;                      // 無ければカード側が既定アイコンを出す
  characteristics: CharacteristicPoint[];    // 常に8点、順序固定
  attributes: AttributeTile[];               // 版によらず4つ
  skills: SkillRow[];                        // 既定値から変更された技能のみ
  sections: CardSection[];                   // 裏面の設定欄。空の項目は含まない
};

type CharacteristicPoint = {
  subject: string;  // "STR" など大文字の能力値名
  value: number;    // 0〜100 に正規化済み
};

type AttributeTile = {
  label: string;           // "HP" / "MP" / "SAN" / "幸運" / "DB"
  value: number | string;  // ダメージ・ボーナスは "+0" のような文字列
};

type SkillRow = {
  name: string;
  value: number;    // 技能の合計値(生の値)
};

type CardSection = {
  heading: string;
  kind: "list" | "text";
  blocks: string[];  // list: 1要素=1項目 / text: 1要素=1段落
};
```

### 4.1 `name`

`Investigator.name` から括弧書き(ふりがな等)を落とし、前後の空白を除いたもの(FR-005)。
版によらず同じ規則。

### 4.2 `characteristics`(FR-004 / FR-017)

- 順序は常に `STR, CON, POW, DEX, APP, SIZ, INT, EDU`。レスポンスのキー順には依存しない。
- `value` は **その版・その能力値の上限に対する割合(0〜100)**。

| 能力値 | 7版の上限 | 6版の上限 |
|---|---|---|
| STR / CON / POW / DEX / APP / SIZ / INT | 100 | 18 |
| EDU | 100 | 21 |

- 計算: `Math.min(100, Math.round(raw / cap * 100))`
  - 7版は `cap = 100` かつ `raw` が整数なので、正規化しても値は変わらない(SC-006)。
  - 上限を超える値(6版で成長したEDUなど)は 100 に丸める。丸めないとチャートが枠外へはみ出し、
    他の能力値との比較が読めなくなるため。

### 4.3 `attributes`(FR-014)

| 版 | タイルの内容(この順) |
|---|---|
| 7版 | HP、MP、SAN、幸運 |
| 6版 | HP、MP、SAN、DB(ダメージ・ボーナス) |

- 値は `attribute.hp` / `attribute.mp` / `attribute.san.value` と、4枠目が版ごとに
  `attribute.luck`(7版) / `attribute.db`(6版)。
- 6版では幸運を組み立てない。レスポンスに値が入っていても使わない。
- ダメージ・ボーナスは「+0」「+1D4」のような文字列なので、数値へ変換せずそのまま渡す。
- どちらの版も4つになるため、タイルの並びは常に4列でよい。

### 4.4 `skills`(FR-009)

`skills` のうち `edited` が `true` のものだけを、レスポンスの順序のまま並べる。版によらず同じ。

### 4.5 `sections`(FR-015 / FR-016)

見出しと順序は版ごとに決まる。組み立ての時点で**中身が空の項目は含めない**。

**7版**

| 順 | 見出し | 由来 | `kind` |
|---|---|---|---|
| 1〜10 | 容姿の描写 / イデオロギー／信念 / 重要な人々 / 意味のある場所 / 秘蔵の品 / 特徴 / 負傷、傷跡 / 恐怖症、マニア / 魔道書、呪文、アーティファクト / 遭遇した超自然の存在 | `backstory[0..9]` | `list` |
| 11 | メモ | `note` | `text` |

- 見出しは `backstory` の並び順に対して上表を当てる。項目数が10に満たない場合はレスポンス側の
  名前を使う(現行の挙動を維持)。
- `entries` のうち空白のみのものを除き、残りが無ければそのセクションごと落とす。

**6版**

| 順 | 見出し | 由来 | `kind` |
|---|---|---|---|
| 1 | 精神的な障害 | `mentalDisorder` | `text` |
| 2 | 読んだクトゥルフ神話の魔導書 | `mythosTomes` | `text` |
| 3 | アーティファクト／学んだ呪文 | `artifactsAndSpells` | `text` |
| 4 | メモ | `note` | `text` |

- `text` の `blocks` は、元の文字列を空行で区切って段落に分け、前後の空白を落とし、空の段落を
  除いたもの(現行のメモと同じ扱い)。結果が空ならそのセクションを落とす。
- 6版のレスポンスが持つそれ以外の項目(`personalData` の各項目、`encounters`、`possessions`、
  `weapons`、`credit`、`chatpalette`、`occupation`、`degree`、`age`、`sex`、`birthplace`、
  `attribute.db`、`san.max`)は `sections` に入れない(FR-016)。

### 4.6 `portraitURL`

`Investigator.portraitURL` をそのまま渡す。空文字・未設定のときはカード側で既定の人物アイコンを
出す(FR-010)。版によらず同じ。

---

## 状態遷移(画面)

カードの表示状態は次の3つ。版は状態を増やさない。

```text
                 ┌──────────────┐
  初期表示 ─────▶│ カード無し    │◀────┐
                 └──────┬───────┘     │
             実行(取得成功)           │ 実行(取得失敗 / 形式不一致)
                        ▼             │
                 ┌──────────────┐     │
                 │ カード表示中  │─────┘
                 └──────────────┘
```

- 失敗時は必ず「カード無し」へ戻る。直前のカードは残さない(FR-007)。
- 「カード表示中」の内部に表/裏があるが、これはカード内の状態でありデータには影響しない。
- 版の違いは「カード表示中」に描かれる `CharacterCardData` の中身にのみ現れる。
