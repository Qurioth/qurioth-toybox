import { useState } from "react";
import { FaCopy } from "react-icons/fa"; // Font Awesomeのコピーアイコン

const CopyTextBox = (props: { textList: string[] }) => {
  const [copied, setCopied] = useState(false);

  // コピーするテキスト
  const { textList } = props;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textList.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後にリセット
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg w-full">
        {/* コピーアイコンボタン */}
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
          title="Copy"
        >
          <FaCopy className="w-6 h-6" />
        </button>

        {/* コピーするテキスト */}
        <div className="p-6 rounded-lg shadow-lg h-96 scrollbar-thin overflow-x-hidden overflow-y-auto">
          {textList.map((text, index) => {
            return (
              <p key={`text-${index}`} className="text-sm">
                {text}
              </p>
            );
          })}
        </div>

        {/* コピー完了メッセージ */}
        {copied && (
          <div
            className="absolute top-2 right-0 left-0 w-fit p-4 mb-4 ml-auto mr-auto text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 animate-in fade-in duration-300"
            role="alert"
          >
            <span className="font-medium">Copied</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTextBox;
