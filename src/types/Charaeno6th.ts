export interface Investigator {
  name: string; // 名前
  occupation: string; // 職業
  birthplace: string; // 出身
  degree: string; // 学校・学位
  mentalDisorder: string; // 精神的な障害
  age: string; // 年齢
  sex: string; // 性別

  // 各能力値の現在値
  characteristics: {
    str: number;
    con: number;
    pow: number;
    dex: number;
    app: number;
    siz: number;
    int: number;
    edu: number;
  };

  // 耐久力等の現在値および最大正気度
  attribute: {
    hp: number; // 耐久力
    mp: number; // マジック・ポイント
    db: string; // ダメージ・ボーナス。0の場合には "+0" となる
    san: {
      value: number; // 正気度
      max: number; // 最大正気度
    };
  };

  skills: Array<Skill>;
  weapons: Array<Weapon>;
  possessions: Array<Possession>; // 装備と所持品

  personalData: {
    address: string; // 住所
    description: string; // 描写
    family: string; // 家族＆友人
    insanity: string; // 狂気の症状
    injuries: string; // 負傷
    scar: string; // 傷跡など
  };

  credit: {
    income: string; // 収入
    cash: string; // 手持ち現金
    deposit: string; // 預金
    personalProperty: string; // 個人資産
    realEstate: string; // 不動産
  };

  mythosTomes: string; // 読んだクトゥルフ神話の魔導書
  artifactsAndSpells: string; // アーティファクト／学んだ呪文
  encounters: string; // 遭遇した超自然の存在
  note: string;
  chatpalette: string; // チャットパレットに用いるための改行区切りのコマンド一覧
  portraitURL?: string; // 探索者プロフィール画像のURL
}

interface Skill {
  name: string;
  value: number; // 技能の合計値
  edited: boolean; // 技能値が編集されているかどうか。技能の合計値が初期値と異なる場合 true となる
}

interface Weapon {
  name: string; // 名前
  value: string; // 技能値。数値とは限らないことに注意
  damage: string; // ダメージ
  range: string; // 射程
  attacks: string; // 攻撃回数
  ammo: string; // 装弾数
  malfunction: string; // 故障ナンバー
  hp: string; // 耐久力
}

interface Possession {
  name: string; // 名前
  count: string; // 所持数。数値とは限らないことに注意
  detail: string; // 物品の詳細説明
}
