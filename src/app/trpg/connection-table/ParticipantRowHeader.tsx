"use client";

import { Trash2 } from "lucide-react";
import { type Participant, TOWN_ID } from "@/utils/connection-table-utils";

type Props = {
  participant: Participant;
  /** 名前が未入力のときに行を指し示すための呼び名 */
  label: string;
  onChangeName: (name: string) => void;
  onRemove: () => void;
};

/** 表の左端に固定される「あなた」の行見出し。町の行だけは編集・削除できない */
const ParticipantRowHeader = ({
  participant,
  label,
  onChangeName,
  onRemove,
}: Props) => (
  <th className="sticky left-0 z-10 border-b border-r border-orange-200 bg-orange-400 p-1.5 text-left font-extrabold text-white dark:bg-connection-accent">
    {participant.id === TOWN_ID ? (
      <span className="block h-10 rounded-md bg-white/25 px-2 py-2 text-center dark:bg-slate-800/70">
        町
      </span>
    ) : (
      <div className="flex h-full flex-col justify-center gap-2">
        <input
          size={1}
          type="text"
          value={participant.name}
          aria-label={`${label}の名前`}
          onChange={(event) => onChangeName(event.target.value)}
          className="h-20 w-full min-w-0 rounded-md border border-orange-100 bg-white px-2 text-center font-extrabold text-gray-900 outline-none focus:border-lime-700 focus:ring-2 focus:ring-lime-200 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/5 text-black/70 transition-colors hover:bg-black/10 hover:text-black focus:outline-none focus:ring-4 focus:ring-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white dark:focus:ring-white/20"
          aria-label={`${label}を削除`}
        >
          <Trash2 aria-hidden="true" size={16} />
        </button>
      </div>
    )}
  </th>
);

export default ParticipantRowHeader;
