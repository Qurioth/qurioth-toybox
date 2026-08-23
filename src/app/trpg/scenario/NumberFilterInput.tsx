"use client";

import { normalizeNumberInput } from "@/utils/scenario-filter";

type Props = {
  label: string;
  /** 入力欄の右端に出す単位。値が入っているときだけ表示する */
  unit: string;
  /** 単位の文字数ぶん、入力の右側を空ける */
  paddingRightClassName: string;
  value: string;
  onChange: (value: string) => void;
};

const inputClassName =
  "min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-slate-400";

/** 人数・時間の絞り込み欄。2桁までの数字だけを受け付ける */
const NumberFilterInput = ({
  label,
  unit,
  paddingRightClassName,
  value,
  onChange,
}: Props) => (
  <span className="relative">
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(normalizeNumberInput(event.target.value))}
      className={`${inputClassName} w-full ${paddingRightClassName}`}
      placeholder={label}
    />
    {value !== "" && (
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-slate-400">
        {unit}
      </span>
    )}
  </span>
);

export default NumberFilterInput;
