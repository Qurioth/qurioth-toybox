"use client";

import Template from "@/components/Template";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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

const STRENGTH_LIST = [1, 2, 3, 4, 5];
const TOWN_ID = "town";

type Participant = {
  id: string;
  name: string;
};

type Connection = {
  content: string;
  strength: number | "";
};

const TOWN_CONNECTION: Connection = {
  content: "受容",
  strength: "",
};

type ConnectionMap = Record<string, Connection>;

const initialParticipants: Participant[] = [
  { id: TOWN_ID, name: "町" },
  { id: "person-1", name: "" },
  { id: "person-2", name: "" },
  { id: "person-3", name: "" },
  { id: "person-4", name: "" },
  { id: "person-5", name: "" },
];

const connectionKey = (fromId: string, toId: string) => `${fromId}:${toId}`;

const createDefaultConnection = (
  strength: Connection["strength"] = "",
): Connection => ({
  content: "",
  strength,
});

const isTownConnection = (fromId: string, toId: string) =>
  fromId === TOWN_ID && toId !== TOWN_ID;

const toTotalStrength = (strength: Connection["strength"]) => {
  return strength === "" ? 0 : strength;
};

const createInitialConnections = (participants: Participant[]) => {
  return participants.reduce<ConnectionMap>((connections, from) => {
    participants.forEach((to) => {
      if (from.id === to.id) {
        return;
      }

      connections[connectionKey(from.id, to.id)] = createDefaultConnection();
    });

    return connections;
  }, {});
};

export default function ConnectionTablePage() {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [connections, setConnections] = useState<ConnectionMap>(() =>
    createInitialConnections(initialParticipants),
  );

  const updateParticipantName = (id: string, name: string) => {
    if (id === TOWN_ID) {
      return;
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === id ? { ...participant, name } : participant,
      ),
    );
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `person-${Date.now()}`,
      name: "",
    };

    setParticipants((currentParticipants) => [
      ...currentParticipants,
      newParticipant,
    ]);
    setConnections((currentConnections) => {
      const nextConnections = { ...currentConnections };

      participants.forEach((participant) => {
        nextConnections[connectionKey(participant.id, newParticipant.id)] =
          createDefaultConnection();
        nextConnections[connectionKey(newParticipant.id, participant.id)] =
          createDefaultConnection();
      });

      return nextConnections;
    });
  };

  const removeParticipant = (id: string) => {
    if (id === TOWN_ID) {
      return;
    }

    setParticipants((currentParticipants) =>
      currentParticipants.filter((participant) => participant.id !== id),
    );
    setConnections((currentConnections) => {
      return Object.fromEntries(
        Object.entries(currentConnections).filter(([key]) => {
          const [fromId, toId] = key.split(":");
          return fromId !== id && toId !== id;
        }),
      );
    });
  };

  const confirmRemoveParticipant = (participant: Participant) => {
    const displayName = participant.name || "この行";

    if (!window.confirm(`${displayName}を削除しますか？`)) {
      return;
    }

    removeParticipant(participant.id);
  };

  const updateConnection = (
    fromId: string,
    toId: string,
    patch: Partial<Connection>,
  ) => {
    if (isTownConnection(fromId, toId)) {
      setConnections((currentConnections) => {
        const key = connectionKey(fromId, toId);
        const currentConnection =
          currentConnections[key] ?? createDefaultConnection();

        return {
          ...currentConnections,
          [key]: {
            ...currentConnection,
            content: TOWN_CONNECTION.content,
            strength: patch.strength ?? currentConnection.strength,
          },
        };
      });
      return;
    }

    setConnections((currentConnections) => {
      const key = connectionKey(fromId, toId);
      const currentConnection =
        currentConnections[key] ?? createDefaultConnection();

      return {
        ...currentConnections,
        [key]: {
          ...currentConnection,
          ...patch,
        },
      };
    });
  };

  const getConnection = (fromId: string, toId: string) => {
    if (isTownConnection(fromId, toId)) {
      return {
        ...TOWN_CONNECTION,
        strength:
          connections[connectionKey(fromId, toId)]?.strength ??
          TOWN_CONNECTION.strength,
      };
    }

    return (
      connections[connectionKey(fromId, toId)] ?? createDefaultConnection()
    );
  };

  const getRowTotal = (fromId: string) => {
    return participants.reduce((total, toParticipant) => {
      if (fromId === toParticipant.id) {
        return total;
      }

      return (
        total +
        toTotalStrength(getConnection(fromId, toParticipant.id).strength)
      );
    }, 0);
  };

  const getColumnTotal = (toId: string) => {
    return participants.reduce((total, fromParticipant) => {
      if (fromParticipant.id === toId) {
        return total;
      }

      return (
        total +
        toTotalStrength(getConnection(fromParticipant.id, toId).strength)
      );
    }, 0);
  };

  return (
    <Template>
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-[#020617] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
                つながり
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                縦軸が「あなた」、横軸が「あいて」です。各マスで内容と強さを管理できます。
              </p>
            </div>
            <button
              type="button"
              onClick={addParticipant}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            >
              <Plus aria-hidden="true" size={18} />
              行追加
            </button>
          </div>

          <div className="scrollbar-none w-full overflow-x-auto">
            <div className="mx-auto w-max overflow-hidden rounded-lg border border-gray-200">
              <table className="table-fixed border-collapse bg-stone-50 text-sm dark:bg-[#020617]">
                <colgroup>
                  <col className="w-40" />
                  {participants.map((participant) => (
                    <col key={participant.id} className="w-40" />
                  ))}
                  <col className="w-24" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 border-b border-r border-orange-200 bg-orange-400 p-1.5 text-left font-bold text-white dark:bg-[#1E3A8A]">
                      <span className="block text-xs text-orange-50 dark:text-slate-100">
                        あなた
                      </span>
                      <span className="block text-right text-xs text-orange-50 dark:text-slate-100">
                        あいて
                      </span>
                    </th>
                    {participants.map((participant) => (
                      <th
                        key={participant.id}
                        className="w-40 border-b border-r border-orange-200 bg-orange-100 p-2 text-center font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50"
                      >
                        {participant.id === TOWN_ID ? (
                          <span className="block h-10 rounded-md bg-white/60 px-3 py-2 dark:bg-[#1E3A8A]/70">
                            町
                          </span>
                        ) : (
                          <span className="block h-10 rounded-md bg-white/60 px-3 py-2 dark:bg-[#1E3A8A]/70">
                            {participant.name}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="w-24 border-b border-r border-orange-200 bg-orange-100 p-2 text-center font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                      合計
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((fromParticipant) => (
                    <tr key={fromParticipant.id}>
                      <th className="sticky left-0 z-10 border-b border-r border-orange-200 bg-orange-400 p-1.5 text-left font-extrabold text-white dark:bg-[#1E3A8A]">
                        {fromParticipant.id === TOWN_ID ? (
                          <span className="block h-10 rounded-md bg-white/25 px-2 py-2 text-center dark:bg-[#1E293B]/70">
                            町
                          </span>
                        ) : (
                          <div className="relative flex h-full items-center">
                            <input
                              size={1}
                              type="text"
                              value={fromParticipant.name}
                              aria-label={`${fromParticipant.name}行の名前`}
                              onChange={(event) =>
                                updateParticipantName(
                                  fromParticipant.id,
                                  event.target.value,
                                )
                              }
                              className="h-20 w-full min-w-0 rounded-md border border-orange-100 bg-white px-2 pb-6 text-center font-extrabold text-gray-900 outline-none focus:border-lime-700 focus:ring-2 focus:ring-lime-200 dark:bg-[#1E293B] dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                confirmRemoveParticipant(fromParticipant)
                              }
                              className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/5 text-black/70 transition-colors hover:bg-black/10 hover:text-black focus:outline-none focus:ring-4 focus:ring-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white dark:focus:ring-white/20"
                              aria-label={`${fromParticipant.name}を削除`}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                            </button>
                          </div>
                        )}
                      </th>
                      {participants.map((toParticipant) => {
                        const connection = getConnection(
                          fromParticipant.id,
                          toParticipant.id,
                        );

                        if (fromParticipant.id === toParticipant.id) {
                          return (
                            <td
                              key={toParticipant.id}
                              className="h-40 border-b border-r border-orange-200 bg-orange-50 dark:bg-[#020617]"
                              aria-label="同じ対象"
                            />
                          );
                        }

                        return (
                          <td
                            key={toParticipant.id}
                            className="h-40 border-b border-r border-orange-100 bg-orange-50 p-2 align-top dark:bg-[#020617]"
                          >
                            <div className="flex h-full flex-col gap-2">
                              {isTownConnection(
                                fromParticipant.id,
                                toParticipant.id,
                              ) ? (
                                <div className="flex h-full flex-col gap-2">
                                  <div className="flex h-9 w-full shrink-0 items-center justify-center rounded-md bg-orange-500 px-2 text-sm font-extrabold text-white dark:bg-[#1E3A8A]">
                                    {connection.content}
                                  </div>
                                  <select
                                    value={connection.strength}
                                    aria-label={`${fromParticipant.name}から${toParticipant.name}へのつながりの強さ`}
                                    onChange={(event) =>
                                      updateConnection(
                                        fromParticipant.id,
                                        toParticipant.id,
                                        {
                                          strength:
                                            event.target.value === ""
                                              ? ""
                                              : Number(event.target.value),
                                        },
                                      )
                                    }
                                    className="min-h-0 flex-1 w-full rounded-md border border-gray-300 bg-white px-2 text-center text-2xl font-extrabold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:bg-[#1E293B] dark:text-slate-50"
                                  >
                                    <option value=""></option>
                                    {STRENGTH_LIST.map((strength) => (
                                      <option key={strength} value={strength}>
                                        {strength}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="flex h-full flex-col gap-2">
                                  <select
                                    value={connection.content}
                                    aria-label={`${fromParticipant.name}から${toParticipant.name}へのつながり内容`}
                                    onChange={(event) =>
                                      updateConnection(
                                        fromParticipant.id,
                                        toParticipant.id,
                                        { content: event.target.value },
                                      )
                                    }
                                    className="h-9 w-full shrink-0 rounded-md border border-gray-300 bg-white px-2 text-center text-sm font-bold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:bg-[#1E293B] dark:text-slate-50"
                                  >
                                    <option value=""></option>
                                    {CONNECTION_LIST.map((connectionName) => (
                                      <option
                                        key={connectionName}
                                        value={connectionName}
                                      >
                                        {connectionName}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={connection.strength}
                                    aria-label={`${fromParticipant.name}から${toParticipant.name}へのつながりの強さ`}
                                    onChange={(event) =>
                                      updateConnection(
                                        fromParticipant.id,
                                        toParticipant.id,
                                        {
                                          strength:
                                            event.target.value === ""
                                              ? ""
                                              : Number(event.target.value),
                                        },
                                      )
                                    }
                                    className="min-h-0 flex-1 w-full rounded-md border border-gray-300 bg-white px-2 text-center text-2xl font-extrabold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:bg-[#1E293B] dark:text-slate-50"
                                  >
                                    <option value=""></option>
                                    {STRENGTH_LIST.map((strength) => (
                                      <option key={strength} value={strength}>
                                        {strength}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="h-40 border-b border-r border-orange-200 bg-orange-100 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                        {getRowTotal(fromParticipant.id)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th className="sticky left-0 z-10 border-b border-r border-orange-200 bg-orange-100 p-1.5 text-center font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                      合計
                    </th>
                    {participants.map((participant) => (
                      <td
                        key={participant.id}
                        className="h-16 border-b border-r border-orange-200 bg-orange-100 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50"
                      >
                        {getColumnTotal(participant.id)}
                      </td>
                    ))}
                    <td className="h-16 border-b border-r border-orange-200 bg-orange-200 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E3A8A] dark:text-slate-50">
                      {participants.reduce(
                        (total, participant) =>
                          total + getRowTotal(participant.id),
                        0,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
