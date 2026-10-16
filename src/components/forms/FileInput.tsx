import { cn } from "@/utils/class-utils";

const FileInput = (props: {
  label: string;
  readFile: (file?: File) => Promise<void>;
  /** 見出しを画面には出さず、支援技術向けにだけ残す(隣の入力欄と高さを揃えたいとき) */
  hideLabel?: boolean;
}) => {
  const { label, readFile, hideLabel = false } = props;

  return (
    <div className="w-full">
      <label
        className={cn(
          "block mb-2 text-sm font-medium text-gray-900 dark:text-white",
          hideLabel && "sr-only",
        )}
        htmlFor="file_input"
      >
        {label}
      </label>
      <input
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        id="file_input"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          readFile(file);
        }}
      />
    </div>
  );
};

export default FileInput;
