"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ListTree, X } from "lucide-react";
import { useEffect, useState } from "react";

const TOC_LABEL = "目次";

type TocItem = {
  id: string;
  label: string;
  children: TocItem[];
};

const toId = (text: string, used: Set<string>) => {
  const base = text.trim().replace(/\s+/g, "-") || "section";
  let id = base;
  for (let count = 2; used.has(id); count += 1) id = `${base}-${count}`;
  used.add(id);
  return id;
};

/**
 * 本文([data-scenario-body])の h2 と data-toc 付きの見出しを集めて目次にする。
 * data-toc 見出しは直前の h2 の下に入れ子にする(contracts/detail-view.md 3 章)。
 * id の無い見出しや重複した id には、ここで一意の id を付ける
 */
const collectTocItems = (): TocItem[] => {
  const body = document.querySelector("[data-scenario-body]");
  if (!body) return [];

  const used = new Set<string>();
  const items: TocItem[] = [];
  for (const heading of body.querySelectorAll<HTMLElement>("h2, [data-toc]")) {
    const label = heading.dataset.tocLabel ?? heading.textContent?.trim() ?? "";
    if (!heading.id || used.has(heading.id)) {
      heading.id = toId(label, used);
    } else {
      used.add(heading.id);
    }
    const item = { id: heading.id, label, children: [] };
    const parent = items.at(-1);
    if (heading.tagName === "H2" || !parent) items.push(item);
    else parent.children.push(item);
  }
  return items;
};

const TocList = ({
  items,
  onSelect,
}: {
  items: TocItem[];
  onSelect?: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) => (
  <ul className="flex flex-col gap-1 text-sm">
    {items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={onSelect && ((event) => onSelect(event, item.id))}
          className="block rounded px-2 py-1 font-bold text-zinc-800 hover:bg-zinc-200 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {item.label}
        </a>
        {item.children.length > 0 && (
          <ul className="ml-3 flex flex-col border-l border-zinc-300 pl-2 dark:border-slate-700">
            {item.children.map((child) => (
              <li key={child.id}>
                <a
                  href={`#${child.id}`}
                  onClick={onSelect && ((event) => onSelect(event, child.id))}
                  className="block rounded px-2 py-0.5 text-zinc-600 hover:bg-zinc-200 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {child.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
);

/**
 * 構造化表示の目次。lg 以上は本文の横に常に表示し、
 * lg 未満は右下のボタンから開くパネルにする(contracts/detail-view.md 3 章)
 */
const ScenarioToc = () => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(collectTocItems());
  }, []);

  const [pendingId, setPendingId] = useState<string>();

  // パネルを閉じてから移動しないと、スクロールのロック解除で位置が戻ってしまう
  useEffect(() => {
    if (open || !pendingId) return;
    document.getElementById(pendingId)?.scrollIntoView?.();
    window.history.pushState(null, "", `#${pendingId}`);
    setPendingId(undefined);
  }, [open, pendingId]);

  const selectInPanel = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    setPendingId(id);
    setOpen(false);
  };

  return (
    <>
      <nav
        aria-label={TOC_LABEL}
        className="not-prose sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
      >
        <p className="mb-2 px-2 text-xs font-bold text-zinc-500 dark:text-slate-400">
          {TOC_LABEL}
        </p>
        <TocList items={items} />
      </nav>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="not-prose fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/95 px-4 py-2 text-sm font-bold text-zinc-800 shadow-md backdrop-blur dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100 lg:hidden"
      >
        <ListTree className="size-4" aria-hidden="true" />
        {TOC_LABEL}
      </button>

      <Dialog open={open} onClose={setOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-xs overflow-y-auto bg-zinc-100 p-4 shadow-xl dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <DialogTitle className="font-bold text-zinc-900 dark:text-white">
              {TOC_LABEL}
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
          <nav aria-label={TOC_LABEL}>
            <TocList items={items} onSelect={selectInPanel} />
          </nav>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ScenarioToc;
