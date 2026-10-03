"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/utils/class-utils";

/**
 * 選ぶと画像をダイアログで開く画像(FR-025 / SC-008)。
 * 既定は原寸で開き、ダイアログの中でスクロールして細部を読める(地図など)。
 * fit を付けると、画面に収まる大きさで開き、ダイアログの幅を画像に揃える(立ち絵など)
 */
const ZoomableImage = ({
  src,
  alt,
  className,
  buttonClassName,
  fit = false,
  children,
}: {
  src: string;
  alt: string;
  /** 画像に付けるクラス */
  className?: string;
  /** 画像を包むボタンに付けるクラス(枠いっぱいに広げるときなど) */
  buttonClassName?: string;
  /** 画像を画面に収まる大きさで開き、ダイアログの幅を画像に揃える(スクロールしない) */
  fit?: boolean;
  /** ボタンに出す中身(切り抜いたアイコンなど)。省略すると画像そのものを出す */
  children?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt || "画像"}を拡大する`}
        className={cn("cursor-zoom-in", buttonClassName)}
      >
        {children ?? (
          // biome-ignore lint/performance/noImgElement: image size is unknown at build time
          <img src={src} alt={alt} className={className} />
        )}
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div
          className={cn(
            "fixed inset-2 sm:inset-8",
            fit && "flex items-center justify-center",
          )}
        >
          <DialogPanel
            className={cn(
              "flex flex-col overflow-hidden rounded-lg bg-zinc-100 dark:bg-slate-900",
              fit ? "max-h-full max-w-full" : "size-full",
            )}
          >
            {/* fit のときは見出しの長さでダイアログが画像より広がらないよう、幅を画像に従わせる */}
            <div
              className={cn(
                "flex h-11 shrink-0 items-center justify-between gap-2 border-b border-zinc-300 px-2 dark:border-slate-700",
                fit && "w-0 min-w-full",
              )}
            >
              <DialogTitle className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                {alt}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded p-1 text-zinc-600 hover:bg-zinc-200 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span className="sr-only">閉じる</span>
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {fit ? (
              // 外枠(画面から上下左右 0.5rem / sm 以上で 2rem)と見出し(2.75rem)を除いた大きさに収める
              // biome-ignore lint/performance/noImgElement: shown fitted to the screen
              <img
                src={src}
                alt={alt}
                className="block h-auto max-h-[calc(100dvh-3.75rem)] w-auto max-w-[calc(100vw-1rem)] sm:max-h-[calc(100dvh-6.75rem)] sm:max-w-[calc(100vw-4rem)]"
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                {/* biome-ignore lint/performance/noImgElement: shown at natural size for zooming */}
                <img src={src} alt={alt} className="max-w-none" />
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default ZoomableImage;
