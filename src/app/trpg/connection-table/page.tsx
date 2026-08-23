"use client";

import Template from "@/components/Template";
import {
  CONNECTION_LIST,
  STRENGTH_LIST,
  TOWN_ID,
  getColumnTotal,
  getConnection,
  getRowTotal,
} from "@/utils/connection-table-utils";
import { Plus } from "lucide-react";
import ConnectionCell from "./ConnectionCell";
import ParticipantRowHeader from "./ParticipantRowHeader";
import { useConnectionTable } from "./useConnectionTable";

const CONNECTION_DATALIST_ID = "connection-content-options";
const STRENGTH_DATALIST_ID = "connection-strength-options";

export default function ConnectionTablePage() {
  const {
    participants,
    connections,
    updateParticipantName,
    addParticipant,
    removeParticipant,
    updateConnection,
  } = useConnectionTable();

  return (
    <Template>
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-[#020617] sm:p-6">
          <datalist id={CONNECTION_DATALIST_ID}>
            {CONNECTION_LIST.map((connectionName) => (
              <option key={connectionName} value={connectionName} />
            ))}
          </datalist>
          <datalist id={STRENGTH_DATALIST_ID}>
            {STRENGTH_LIST.map((strength) => (
              <option key={strength} value={strength} />
            ))}
          </datalist>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
                つながり
              </h2>
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
                        <span className="block h-10 rounded-md bg-white/60 px-3 py-2 dark:bg-[#1E3A8A]/70">
                          {participant.id === TOWN_ID ? "町" : participant.name}
                        </span>
                      </th>
                    ))}
                    <th className="w-24 border-b border-r border-orange-200 bg-orange-100 p-2 text-center font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                      ふしぎ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((fromParticipant) => (
                    <tr key={fromParticipant.id}>
                      <ParticipantRowHeader
                        participant={fromParticipant}
                        onChangeName={(name) =>
                          updateParticipantName(fromParticipant.id, name)
                        }
                        onRemove={() => removeParticipant(fromParticipant.id)}
                      />
                      {participants.map((toParticipant) =>
                        fromParticipant.id === toParticipant.id ? (
                          <td
                            key={toParticipant.id}
                            className="h-40 border-b border-r border-orange-200 bg-orange-50 dark:bg-[#020617]"
                            aria-label="同じ対象"
                          />
                        ) : (
                          <ConnectionCell
                            key={toParticipant.id}
                            from={fromParticipant}
                            to={toParticipant}
                            connection={getConnection(
                              connections,
                              fromParticipant.id,
                              toParticipant.id,
                            )}
                            connectionDatalistId={CONNECTION_DATALIST_ID}
                            strengthDatalistId={STRENGTH_DATALIST_ID}
                            onChange={(patch) =>
                              updateConnection(
                                fromParticipant.id,
                                toParticipant.id,
                                patch,
                              )
                            }
                          />
                        ),
                      )}
                      <td className="h-40 border-b border-r border-orange-200 bg-orange-100 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                        {getRowTotal(
                          participants,
                          connections,
                          fromParticipant.id,
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th className="sticky left-0 z-10 border-b border-r border-orange-200 bg-orange-100 p-1.5 text-center font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50">
                      想い
                    </th>
                    {participants.map((participant) => (
                      <td
                        key={participant.id}
                        className="h-16 border-b border-r border-orange-200 bg-orange-100 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50"
                      >
                        {getColumnTotal(
                          participants,
                          connections,
                          participant.id,
                        )}
                      </td>
                    ))}
                    <td className="h-16 border-b border-r border-orange-200 bg-orange-100 p-2 text-center align-middle text-2xl font-extrabold text-orange-950 dark:bg-[#1E293B] dark:text-slate-50"></td>
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
