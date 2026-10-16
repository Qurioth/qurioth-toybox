import { describe, expect, it } from "vitest";
import { parseIacharaText } from "./iachara-utils";

/** いあきゃらの7版のテキスト出力を、項目を減らして再現したもの */
const sampleIacharaText = `いあきゃらテキスト 7版 v2.0.1
【基本情報】
名前: 試験　太郎 (しけん　たろう)
タグ:
職業: 探偵
年齢: 30歳 / 性別: 男 / 身長: 170cm

【アイコン】
:https://image.example.com/portrait

【能力値】
        現在値  能力値  増加分  一時的
STR         65      65       0       0
CON         50      50       0       0
POW         60      60       0       0
DEX         40      40       0       0
APP         55      55       0       0
SIZ         70      70       0       0
INT         80      80       0       0
EDU         80      80       0       0
HP          12      12       0       0
MP          12      12       0       0
正気度      60      60       0       0
IDE         80      80       0       0
幸運        85      85       0       0
知識        80      80       0       0

正気度 64 / 88
DB +1D4

【技能値】

職業ポイント:      320 /   320
興味ポイント:      160 /   160

『戦闘技能』
技能名                  合計  初期値   職業P   興味P  成長分  その他
回避                      75      20      45       0      10       0
近接戦闘                  25      25       0       0       0       0
射撃(FPS(ｹﾞｰﾑ))       79      20       0      50       9       0

『行動技能』
技能名                  合計  初期値   職業P   興味P  成長分  その他
芸術/製作(2ちゃんねる)      70       5       0      65       0       0

【武器】
名前                        成功率      ダメージ

【バックストーリー】
[容姿の描写]
小柄

[イデオロギー/信念]
一行目
二行目

[重要な人々]


【通過したシナリオ名】


【メモ】
【見出しのような本文】から始まるメモ
【スペック】

二段落目
`;

describe("parseIacharaText", () => {
  it("名前・立ち絵・能力値・HP・MP・幸運を読み取る", () => {
    const investigator = parseIacharaText(sampleIacharaText);

    expect(investigator?.name).toBe("試験　太郎 (しけん　たろう)");
    expect(investigator?.portraitURL).toBe(
      "https://image.example.com/portrait",
    );
    expect(investigator?.characteristics).toEqual({
      str: 65,
      con: 50,
      pow: 60,
      dex: 40,
      app: 55,
      siz: 70,
      int: 80,
      edu: 80,
    });
    expect(investigator?.attribute).toMatchObject({ hp: 12, mp: 12, luck: 85 });
  });

  it("正気度は表の値ではなく、現在値 / 最大値の行の現在値を使う", () => {
    expect(parseIacharaText(sampleIacharaText)?.attribute.san).toBe(64);
  });

  it("現在値 / 最大値の行が無ければ、表の正気度を使う", () => {
    const text = sampleIacharaText.replace("正気度 64 / 88\n", "");

    expect(parseIacharaText(text)?.attribute.san).toBe(60);
  });

  it("技能名に空白や数字・括弧を含んでも合計を読み、初期値と違えば編集済みとする", () => {
    expect(parseIacharaText(sampleIacharaText)?.skills).toEqual([
      { name: "回避", value: 75, edited: true },
      { name: "近接戦闘", value: 25, edited: false },
      { name: "射撃(FPS(ｹﾞｰﾑ))", value: 79, edited: true },
      { name: "芸術/製作(2ちゃんねる)", value: 70, edited: true },
    ]);
  });

  it("バックストーリーを小見出しごとに読み、空の項目は空文字にする", () => {
    expect(parseIacharaText(sampleIacharaText)?.backstory).toEqual([
      { heading: "容姿の描写", text: "小柄" },
      { heading: "イデオロギー/信念", text: "一行目\n二行目" },
      { heading: "重要な人々", text: "" },
    ]);
  });

  it("メモ以降は【】の行も含めてすべてメモの本文とする", () => {
    expect(parseIacharaText(sampleIacharaText)?.note).toBe(
      "【見出しのような本文】から始まるメモ\n【スペック】\n\n二段落目",
    );
  });

  it("改行がCRLFでも読める", () => {
    const text = sampleIacharaText.replace(/\n/g, "\r\n");

    expect(parseIacharaText(text)?.attribute.san).toBe(64);
  });

  it("7版のテキストでなければ undefined", () => {
    expect(
      parseIacharaText(
        sampleIacharaText.replace(
          "いあきゃらテキスト 7版",
          "いあきゃらテキスト 6版",
        ),
      ),
    ).toBeUndefined();
    expect(parseIacharaText("ただのテキスト")).toBeUndefined();
  });

  it("能力値が欠けていれば undefined", () => {
    const text = sampleIacharaText.replace(/^EDU.*\n/m, "");

    expect(parseIacharaText(text)).toBeUndefined();
  });
});
