"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Workflow, X } from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import { cn } from "@/utils/class-utils";

/**
 * 右の列の内容(フローチャートなど)を、xl 未満で右下のボタンから開くパネル
 * (contracts/detail-view.md 3 章)。目次のボタンがある幅(lg 未満)では、その上に並べる
 */
const ScenarioAsidePanel = ({
  label,
  withToc,
  themeStyle,
  children,
}: {
  /** ボタンとパネルの見出し */
  label: string;
  /** 目次のボタンもあるページか */
  withToc: boolean;
  /** パネルはページの外に出るので、配色の CSS 変数を改めて渡す */
  themeStyle: CSSProperties;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "not-prose fixed right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/95 px-4 py-2 text-sm font-bold text-zinc-800 shadow-md backdrop-blur dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100 xl:hidden",
          withToc ? "bottom-16 lg:bottom-4" : "bottom-4",
        )}
      >
        <Workflow className="size-4" aria-hidden="true" />
        {label}
      </button>

      <Dialog
        open={open}
        onClose={setOpen}
        style={themeStyle}
        className="xl:hidden"
      >
        <div className="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
        <DialogPanel className="scrollbar-subtle fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-zinc-100 p-4 shadow-xl dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <DialogTitle className="font-bold text-zinc-900 dark:text-white">
              {label}
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
          {children}
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ScenarioAsidePanel;
