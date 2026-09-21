import { Info } from "lucide-react";

/**
 * 見出しの横に置く「i」アイコン。ホバーまたはフォーカスで説明を吹き出し表示する。
 * 説明はスクリーンリーダー向けに aria-describedby でも結び付ける。
 */
const InfoTooltip = (props: { id: string; text: string }) => {
  const { id, text } = props;

  return (
    <span className="relative inline-flex group">
      <button
        type="button"
        aria-describedby={id}
        aria-label="説明"
        className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-full"
      >
        <Info className="w-4 h-4" aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 w-72 px-3 py-2 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-pre-wrap invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150"
      >
        {text}
      </span>
    </span>
  );
};

export default InfoTooltip;
