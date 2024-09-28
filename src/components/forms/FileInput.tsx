const FileInput = (props: {
  label: string;
  readFile: (file?: File) => Promise<void>;
}) => {
  const { label, readFile } = props;

  return (
    <div className="w-full">
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
