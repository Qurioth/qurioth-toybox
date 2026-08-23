"use client";

import {
  type Connection,
  type Participant,
  isTownConnection,
  parseStrengthInput,
} from "@/utils/connection-table-utils";

type Props = {
  from: Participant;
  to: Participant;
  /** 名前が未入力のときに行・列を指し示すための呼び名 */
  fromLabel: string;
  toLabel: string;
  connection: Connection;
  connectionDatalistId: string;
  strengthDatalistId: string;
  onChange: (patch: Partial<Connection>) => void;
};

/** 「あなた(from)」から「あいて(to)」へのつながりを編集するセル */
const ConnectionCell = ({
  from,
  to,
  fromLabel,
  toLabel,
  connection,
  connectionDatalistId,
  strengthDatalistId,
  onChange,
}: Props) => {
  const isTown = isTownConnection(from.id, to.id);

  return (
    <td className="h-40 border-b border-r border-orange-100 bg-orange-50 p-2 align-top dark:bg-slate-950">
      <div className="flex h-full flex-col gap-2">
        {isTown ? (
          <div className="flex h-9 w-full shrink-0 items-center justify-center rounded-md bg-orange-500 px-2 text-sm font-extrabold text-white dark:bg-connection-accent">
            {connection.content}
          </div>
        ) : (
          <input
            type="text"
            list={connectionDatalistId}
            value={connection.content}
            aria-label={`${fromLabel}から${toLabel}へのつながり内容`}
            onChange={(event) => onChange({ content: event.target.value })}
            className="h-9 w-full shrink-0 rounded-md border border-gray-300 bg-white pl-6 pr-2 text-center text-sm font-bold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:bg-slate-800 dark:text-slate-50"
          />
        )}
        <input
          type="text"
          inputMode="numeric"
          list={strengthDatalistId}
          value={connection.strength}
          aria-label={`${fromLabel}から${toLabel}へのつながりの強さ`}
          onChange={(event) => {
            const strength = parseStrengthInput(event.target.value);

            if (strength === null) {
              return;
            }

            onChange({ strength });
          }}
          className="min-h-0 flex-1 w-full rounded-md border border-gray-300 bg-white pl-10 pr-2 text-center text-2xl font-extrabold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:bg-slate-800 dark:text-slate-50"
        />
      </div>
    </td>
  );
};

export default ConnectionCell;
