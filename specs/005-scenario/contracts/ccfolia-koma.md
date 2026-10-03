# Contract: CCFOLIA のコマ

NPC カードの「CCFOLIA コマ出力」でクリップボードに書き込む内容。形式は CCFOLIA 公式ドキュメント
「[Clipboard API (beta)](https://docs.ccfolia.com/developer-api/clipboard-api)」(v1.19.0)の
`CharacterClipboardData` に従う。

```json
{
  "kind": "character",
  "data": {
    "name": "沖嶋 深月",
    "memo": "オキシマ ミツキ\n女性。写真家。…",
    "initiative": 60,
    "status": [
      { "label": "HP", "value": 13, "max": 13 },
      { "label": "MP", "value": 9, "max": 9 },
      { "label": "SAN", "value": 42, "max": 42 }
    ],
    "params": [
      { "label": "STR", "value": "55" },
      { "label": "CON", "value": "75" },
      { "label": "DB", "value": "+0" }
    ],
    "commands": "CC<={SAN} 【正気度ロール】\nCC<={STR} 【STR】\nCC<={CON} 【CON】\nCC<=65 【芸術／製作（写真術）】"
  }
}
```

## 項目の対応(NPC データ → コマ)

使うのは `stats` の 1 つ目(最初の姿)。

| コマ | 元のデータ | 規則 |
| -- | -- | -- |
| `name` | `npc.name` | そのまま |
| `memo` | `npc.kana`、`npc.profile` | 読み仮名(あれば)の行、続けてプロフィール。どちらも無ければ省く |
| `initiative` | 能力値の `DEX` | 整数として読めるときだけ。読めなければ省く |
| `status` | 副次ステータスの `耐久力` → HP、`マジック・ポイント` → MP、`正気度` → SAN | 整数として読めるものだけ。`value` と `max` は同じ値 |
| `params` | 能力値すべて + 副次ステータスのうち `ダメージ・ボーナス` → DB、`ビルド`、`移動率` | 値は文字列のまま |
| `commands` | SAN、能力値、技能 | 1 行 1 コマンド。SAN があれば `CC<={SAN} 【正気度ロール】`、能力値は整数として読めるものだけ `CC<={STR} 【STR】`、技能は `CC<=<値> 【<名前>】`(技能の並び順のまま) |
| `iconUrl` | — | 含めない(外部の画像を設定できないため。spec FR-028) |

持っていない項目は、空の配列・空文字で出さず、キーごと省く(FR-028)。他の項目(位置・大きさ・
色など)は CCFOLIA の既定値に任せる。

## 操作と表示(FR-030)

- ボタンの文言は「CCFOLIA コマ出力」。
- 成功したら「コピーしました。」、失敗したら
  「コピーできませんでした」を、ボタンの近くに数秒表示する(`aria-live="polite"`)。
