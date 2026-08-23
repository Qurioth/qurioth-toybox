/**
 * 「ふしぎもののけRPG ゆうやけこやけ」のコネクション表のドメインロジック。
 * 表は「あなた(行)」から「あいて(列)」への一方向のつながりを持つ。
 */

export const TOWN_ID = "town";

/** つながりの内容の候補(datalist に出す) */
export const CONNECTION_LIST = [
  "好意",
  "愛情",
  "保護",
  "信頼",
  "家族",
  "憧れ",
  "対抗",
  "尊敬",
  "恋",
  "受容",
];

export const STRENGTH_LIST = [1, 2, 3, 4, 5];

export type Participant = {
  id: string;
  name: string;
};

export type Connection = {
  content: string;
  strength: number | "";
};

export type ConnectionMap = Record<string, Connection>;

export type StoredConnectionTable = {
  participants: Participant[];
  connections: ConnectionMap;
};

/** 町から人へのつながりは内容が「受容」で固定される */
export const TOWN_CONNECTION: Connection = {
  content: "受容",
  strength: "",
};

export const initialParticipants: Participant[] = [
  { id: TOWN_ID, name: "町" },
  { id: "person-1", name: "" },
  { id: "person-2", name: "" },
  { id: "person-3", name: "" },
  { id: "person-4", name: "" },
  { id: "person-5", name: "" },
];

export const connectionKey = (fromId: string, toId: string) =>
  `${fromId}:${toId}`;

export const createDefaultConnection = (
  strength: Connection["strength"] = "",
): Connection => ({
  content: "",
  strength,
});

export const isTownConnection = (fromId: string, toId: string) =>
  fromId === TOWN_ID && toId !== TOWN_ID;

export const toTotalStrength = (strength: Connection["strength"]) =>
  strength === "" ? 0 : strength;

/** 入力値を強さとして解釈する。空欄は許容し、1〜5以外は null(=入力を無視) */
export const parseStrengthInput = (
  value: string,
): Connection["strength"] | null => {
  if (value === "") {
    return "";
  }

  if (/^[1-5]$/.test(value)) {
    return Number(value);
  }

  return null;
};

export const createInitialConnections = (participants: Participant[]) =>
  participants.reduce<ConnectionMap>((connections, from) => {
    participants.forEach((to) => {
      if (from.id === to.id) {
        return;
      }

      connections[connectionKey(from.id, to.id)] = createDefaultConnection();
    });

    return connections;
  }, {});

const isConnection = (value: unknown): value is Connection => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const connection = value as Connection;
  return (
    typeof connection.content === "string" &&
    (connection.strength === "" ||
      (typeof connection.strength === "number" &&
        STRENGTH_LIST.includes(connection.strength)))
  );
};

/** localStorage の文字列を復元する。壊れていれば null を返して初期状態に倒す */
export const restoreConnectionTable = (
  value: string,
): StoredConnectionTable | null => {
  try {
    const parsedValue = JSON.parse(value) as Partial<StoredConnectionTable>;

    if (!Array.isArray(parsedValue.participants)) {
      return null;
    }

    const restoredParticipants = parsedValue.participants.filter(
      (participant): participant is Participant =>
        typeof participant?.id === "string" &&
        typeof participant.name === "string",
    );

    if (
      restoredParticipants.length === 0 ||
      restoredParticipants[0].id !== TOWN_ID
    ) {
      return null;
    }

    const restoredConnections = Object.fromEntries(
      Object.entries(parsedValue.connections ?? {}).filter(([, connection]) =>
        isConnection(connection),
      ),
    );

    return {
      participants: [
        { id: TOWN_ID, name: "町" },
        ...restoredParticipants.filter(
          (participant) => participant.id !== TOWN_ID,
        ),
      ],
      connections: restoredConnections,
    };
  } catch {
    return null;
  }
};

/** 保存されていない組み合わせは既定値を返す。町からのつながりは内容を固定する */
export const getConnection = (
  connections: ConnectionMap,
  fromId: string,
  toId: string,
): Connection => {
  if (isTownConnection(fromId, toId)) {
    return {
      ...TOWN_CONNECTION,
      strength:
        connections[connectionKey(fromId, toId)]?.strength ??
        TOWN_CONNECTION.strength,
    };
  }

  return connections[connectionKey(fromId, toId)] ?? createDefaultConnection();
};

/** その人が他の全員に向けているつながりの強さの合計(ふしぎ) */
export const getRowTotal = (
  participants: Participant[],
  connections: ConnectionMap,
  fromId: string,
) =>
  participants.reduce((total, to) => {
    if (fromId === to.id) {
      return total;
    }

    return (
      total +
      toTotalStrength(getConnection(connections, fromId, to.id).strength)
    );
  }, 0);

/** その人が他の全員から向けられているつながりの強さの合計(想い) */
export const getColumnTotal = (
  participants: Participant[],
  connections: ConnectionMap,
  toId: string,
) =>
  participants.reduce((total, from) => {
    if (from.id === toId) {
      return total;
    }

    return (
      total +
      toTotalStrength(getConnection(connections, from.id, toId).strength)
    );
  }, 0);
