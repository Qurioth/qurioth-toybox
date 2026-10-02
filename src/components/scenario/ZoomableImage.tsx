"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { useState } from "react";

/**
 * 選ぶと原寸の画像をダイアログで開く画像。ダイアログの中ではスクロールして細部を読める
 * (FR-025 / SC-008)
 */
const ZoomableImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt || "画像"}を拡大する`}
        className="cursor-zoom-in"
      >
        {/* biome-ignore lint/performance/noImgElement: image size is unknown at build time */}
        <img src={src} alt={alt} className={className} />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <DialogPanel className="fixed inset-2 flex flex-col overflow-hidden rounded-lg bg-zinc-100 dark:bg-slate-900 sm:inset-8">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-300 p-2 dark:border-slate-700">
            <DialogTitle className="truncate text-sm font-bold text-zinc-900 dark:text-white">
              {alt}
            </DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-zinc-600 hover:bg-zinc-200 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="sr-only">閉じる</span>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {/* biome-ignore lint/performance/noImgElement: shown at natural size for zooming */}
            <img src={src} alt={alt} className="max-w-none" />
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ZoomableImage;
