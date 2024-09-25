export interface Investigator {
  name: string; // 名前
  occupation: string; // 職業
  age: string; // 年齢
  sex: string; // 性別
  residence: string; // 住所
  birthplace: string; // 出身

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
    mov: number; // 移動率
    build: number; // ビルド
    db: string; // ダメージ・ボーナス。0の場合には "+0" となる
    san: {
      value: number;
      max: number;
    };
    luck: number;
  };

  skills: Array<Skill>;
  weapons: Array<Weapon>;
  possessions: Array<Possession>; // 装備と所持品

  // 収入と財産
  credit: {
    spendingLevel: string;
    cash: string;
    assetsDetails: string;
  };
  backstory: Array<Backstory>;
  fellows: Array<Fellow>; // 仲間の探索者
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
}

interface Possession {
  name: string; // 名前
  count: string; // 所持数。数値とは限らないことに注意
  detail: string; // 物品の詳細説明
}

interface Backstory {
  name: string;
  entries: Array<BackstoryEntry>;
}

interface BackstoryEntry {
  text: string;
  keyConnection?: boolean; // エントリがキーコネクションに指定されていると true となる
}

interface Fellow {
  name: string;
  url: string; // 妥当なURLとは限らないことに注意
}
