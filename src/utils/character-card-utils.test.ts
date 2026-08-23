import { describe, expect, it } from "vitest";
import type { Investigator as Investigator6th } from "@/types/Charaeno6th";
import type { Investigator as Investigator7th } from "@/types/Charaeno7th";
import { toCardDataFrom6th, toCardDataFrom7th } from "./character-card-utils";

const investigator7th = (
  override: Partial<Investigator7th> = {},
): Investigator7th => ({
  name: "テスト太郎",
  occupation: "探偵",
  age: "30",
  sex: "男性",
  residence: "東京",
  birthplace: "東京",
  characteristics: {
    str: 40,
    con: 50,
    pow: 60,
    dex: 55,
    app: 85,
    siz: 70,
    int: 75,
    edu: 75,
  },
  attribute: {
    hp: 12,
    mp: 10,
    mov: 8,
    build: 0,
    db: "+0",
    san: { value: 52, max: 76 },
    luck: 50,
  },
  skills: [],
  weapons: [],
  possessions: [],
  credit: { spendingLevel: "", cash: "", assetsDetails: "" },
  backstory: [],
  fellows: [],
  note: "",
  chatpalette: "",
  ...override,
});

describe("toCardDataFrom7th", () => {
  describe("能力値", () => {
    it("上限が100なので、正規化しても値は変わらない", () => {
      const cardData = toCardDataFrom7th(investigator7th());

      expect(cardData.characteristics).toEqual([
        { subject: "STR", value: 40 },
        { subject: "CON", value: 50 },
        { subject: "POW", value: 60 },
        { subject: "DEX", value: 55 },
        { subject: "APP", value: 85 },
        { subject: "SIZ", value: 70 },
        { subject: "INT", value: 75 },
        { subject: "EDU", value: 75 },
      ]);
    });

    it("レスポンスのキー順に関わらず並び順は固定", () => {
      const shuffled = investigator7th({
        // APIのJSONのキー順が変わっても表示順は変わらないこと
        characteristics: {
          edu: 75,
          int: 75,
          siz: 70,
          app: 85,
          dex: 55,
          pow: 60,
          con: 50,
          str: 40,
        },
      });

      expect(
        toCardDataFrom7th(shuffled).characteristics.map((c) => c.subject),
      ).toEqual(["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"]);
    });
  });

  describe("表面のタイル", () => {
    it("HP・MP・SAN・幸運の4つを並べる", () => {
      const cardData = toCardDataFrom7th(investigator7th());

      expect(cardData.attributes).toEqual([
        { label: "HP", value: 12 },
        { label: "MP", value: 10 },
        { label: "SAN", value: 52 },
        { label: "幸運", value: 50 },
      ]);
    });
  });

  describe("技能", () => {
    it("既定値から変更された技能だけを残す", () => {
      const cardData = toCardDataFrom7th(
        investigator7th({
          skills: [
            { name: "目星", value: 70, edited: true },
            { name: "回避", value: 25, edited: false },
            { name: "図書館", value: 60, edited: true },
          ],
        }),
      );

      expect(cardData.skills).toEqual([
        { name: "目星", value: 70 },
        { name: "図書館", value: 60 },
      ]);
    });
  });

  describe("裏面のセクション", () => {
    it("バックストーリーの見出しを並び順に対応するラベルへ差し替える", () => {
      const cardData = toCardDataFrom7th(
        investigator7th({
          backstory: [
            { name: "description", entries: [{ text: "黒髪" }] },
            { name: "ideology", entries: [{ text: "無神論者" }] },
          ],
        }),
      );

      expect(cardData.sections).toEqual([
        { heading: "容姿の描写", kind: "list", blocks: ["黒髪"] },
        { heading: "イデオロギー／信念", kind: "list", blocks: ["無神論者"] },
      ]);
    });

    it("ラベルを超える数の項目はレスポンス側の名前を使う", () => {
      const backstory = Array.from({ length: 11 }, (_, index) => ({
        name: `項目${index}`,
        entries: [{ text: "記入あり" }],
      }));

      const cardData = toCardDataFrom7th(investigator7th({ backstory }));

      expect(cardData.sections[10].heading).toBe("項目10");
    });

    it("記入の無い項目は見出しごと落とす", () => {
      const cardData = toCardDataFrom7th(
        investigator7th({
          backstory: [
            { name: "description", entries: [{ text: "" }, { text: "  " }] },
            { name: "ideology", entries: [{ text: "無神論者" }] },
          ],
        }),
      );

      expect(cardData.sections.map((section) => section.heading)).toEqual([
        "イデオロギー／信念",
      ]);
    });

    it("メモを空行で段落に割り、最後のセクションとして足す", () => {
      const cardData = toCardDataFrom7th(
        investigator7th({
          backstory: [{ name: "description", entries: [{ text: "黒髪" }] }],
          note: "【設定】\n泣き虫\n\n【特徴】\n強固な意志",
        }),
      );

      expect(cardData.sections.at(-1)).toEqual({
        heading: "メモ",
        kind: "text",
        blocks: ["【設定】\n泣き虫", "【特徴】\n強固な意志"],
      });
    });

    it("メモが空ならメモのセクションを作らない", () => {
      const cardData = toCardDataFrom7th(investigator7th({ note: "  \n\n  " }));

      expect(cardData.sections).toEqual([]);
    });
  });

  it("名前と立ち絵はそのまま渡す", () => {
    const cardData = toCardDataFrom7th(
      investigator7th({
        name: "間 紅葉",
        portraitURL: "https://example.com/a.png",
      }),
    );

    expect(cardData.name).toBe("間 紅葉");
    expect(cardData.portraitURL).toBe("https://example.com/a.png");
  });
});

const investigator6th = (
  override: Partial<Investigator6th> = {},
): Investigator6th => ({
  name: "テスト太郎",
  occupation: "医師",
  birthplace: "広島",
  degree: "大学院",
  mentalDisorder: "",
  age: "27歳",
  sex: "女性",
  characteristics: {
    str: 15,
    con: 10,
    pow: 10,
    dex: 10,
    app: 17,
    siz: 14,
    int: 15,
    edu: 15,
  },
  attribute: {
    hp: 12,
    mp: 10,
    db: "+0",
    san: { value: 52, max: 76 },
  },
  skills: [],
  weapons: [],
  possessions: [],
  personalData: {
    address: "",
    description: "",
    family: "",
    insanity: "",
    injuries: "",
    scar: "",
  },
  credit: {
    income: "",
    cash: "",
    deposit: "",
    personalProperty: "",
    realEstate: "",
  },
  mythosTomes: "",
  artifactsAndSpells: "",
  encounters: "",
  note: "",
  chatpalette: "",
  ...override,
});

describe("toCardDataFrom6th", () => {
  describe("能力値", () => {
    it("能力値ごとの上限に対する割合へ直す(EDUは21、それ以外は18が上限)", () => {
      const cardData = toCardDataFrom6th(investigator6th());
      const pointValueOf = (subject: string) =>
        cardData.characteristics.find((point) => point.subject === subject)
          ?.value;

      // 同じ15でも、上限18のINTは83、上限21のEDUは71になる
      expect(pointValueOf("INT")).toBe(83);
      expect(pointValueOf("EDU")).toBe(71);
      expect(pointValueOf("STR")).toBe(83);
    });

    it("7版と違って中心付近に潰れない", () => {
      const cardData = toCardDataFrom6th(investigator6th());

      // 上限100で描くと STR 15 は 15 にしかならず、8軸すべてが中心に寄る
      for (const point of cardData.characteristics) {
        expect(point.value).toBeGreaterThan(30);
      }
    });

    it("上限を超える能力値は100で止める", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({
          characteristics: {
            str: 25,
            con: 10,
            pow: 10,
            dex: 10,
            app: 17,
            siz: 14,
            int: 15,
            edu: 25,
          },
        }),
      );
      const pointValueOf = (subject: string) =>
        cardData.characteristics.find((point) => point.subject === subject)
          ?.value;

      expect(pointValueOf("STR")).toBe(100);
      expect(pointValueOf("EDU")).toBe(100);
    });

    it("並び順は7版と同じく固定", () => {
      expect(
        toCardDataFrom6th(investigator6th()).characteristics.map(
          (point) => point.subject,
        ),
      ).toEqual(["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"]);
    });
  });

  describe("表面のタイル", () => {
    it("HP・MP・SAN・DBの4つを並べる", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({
          attribute: {
            hp: 14,
            mp: 9,
            db: "+1D4",
            san: { value: 68, max: 90 },
          },
        }),
      );

      expect(cardData.attributes).toEqual([
        { label: "HP", value: 14 },
        { label: "MP", value: 9 },
        { label: "SAN", value: 68 },
        { label: "DB", value: "+1D4" },
      ]);
    });

    it("ダメージ・ボーナスが0でも文字列のまま出す", () => {
      const cardData = toCardDataFrom6th(investigator6th());

      expect(cardData.attributes.at(-1)).toEqual({ label: "DB", value: "+0" });
    });

    it("レスポンスに幸運が入っていても載せない", () => {
      const summary = investigator6th();
      // 実データには attribute.luck / idea / know が入っていることがある
      const withLuck = {
        ...summary,
        attribute: { ...summary.attribute, luck: 50, idea: 75, know: 75 },
      };

      expect(
        toCardDataFrom6th(withLuck).attributes.map(
          (attribute) => attribute.label,
        ),
      ).toEqual(["HP", "MP", "SAN", "DB"]);
    });
  });

  describe("技能", () => {
    it("既定値から変更された技能だけを残す", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({
          skills: [
            { name: "医学", value: 85, edited: true },
            { name: "回避", value: 20, edited: false },
          ],
        }),
      );

      expect(cardData.skills).toEqual([{ name: "医学", value: 85 }]);
    });
  });

  describe("裏面のセクション", () => {
    it("4項目をこの順で並べ、すべて段落として扱う", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({
          mentalDisorder: "不眠症",
          mythosTomes: "『CTHAAT AQUADINGEN』",
          artifactsAndSpells: "封じ込めの玉",
          note: "泣き虫",
        }),
      );

      expect(cardData.sections).toEqual([
        { heading: "精神的な障害", kind: "text", blocks: ["不眠症"] },
        {
          heading: "読んだクトゥルフ神話の魔導書",
          kind: "text",
          blocks: ["『CTHAAT AQUADINGEN』"],
        },
        {
          heading: "アーティファクト／学んだ呪文",
          kind: "text",
          blocks: ["封じ込めの玉"],
        },
        { heading: "メモ", kind: "text", blocks: ["泣き虫"] },
      ]);
    });

    it("記入の無い項目は見出しごと落とす", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({ mythosTomes: "『無名祭祀書』", note: "  \n\n " }),
      );

      expect(cardData.sections.map((section) => section.heading)).toEqual([
        "読んだクトゥルフ神話の魔導書",
      ]);
    });

    it("空行で段落に割る", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({ note: "【設定】\n泣き虫\n\n【特徴】\n強固な意志" }),
      );

      expect(cardData.sections[0].blocks).toEqual([
        "【設定】\n泣き虫",
        "【特徴】\n強固な意志",
      ]);
    });

    it("4項目以外(住所・遭遇した超自然の存在・所持品など)は載せない", () => {
      const cardData = toCardDataFrom6th(
        investigator6th({
          personalData: {
            address: "広島市",
            description: "黒髪",
            family: "母は他界",
            insanity: "対人恐怖",
            injuries: "骨折",
            scar: "左腕に傷",
          },
          encounters: "ショゴス",
          possessions: [{ name: "ガラケー", count: "1", detail: "パカパカ" }],
          credit: {
            income: "500万",
            cash: "10万",
            deposit: "100万",
            personalProperty: "",
            realEstate: "",
          },
          chatpalette: "CCB<=85 医学",
        }),
      );

      const rendered = JSON.stringify(cardData.sections);

      for (const excluded of [
        "広島市",
        "黒髪",
        "母は他界",
        "対人恐怖",
        "骨折",
        "左腕に傷",
        "ショゴス",
        "ガラケー",
        "500万",
        "CCB",
      ]) {
        expect(rendered).not.toContain(excluded);
      }
    });
  });

  it("名前と立ち絵はそのまま渡す", () => {
    const cardData = toCardDataFrom6th(
      investigator6th({
        name: "間 紅葉",
        portraitURL: "https://example.com/a.png",
      }),
    );

    expect(cardData.name).toBe("間 紅葉");
    expect(cardData.portraitURL).toBe("https://example.com/a.png");
  });
});
