import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind のクラス名を結合する。競合するユーティリティは後勝ちで解決される。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
