const Select = (props: {
  selectList: string[];
  placeholder?: string;
  onChangeSelectBox: (selectItem: string) => void;
  /** 1画面に複数置くときに指定する。省略時は従来の "select" */
  id?: string;
  ariaLabel?: string;
  /**
   * 指定すると placeholder の hidden option を出さず、この値を初期選択にする。
   * 「すべて」のように選択肢の1つを最初から選んでおきたいときに使う。
   */
  defaultValue?: string;
}) => {
  const {
    selectList,
    placeholder,
    onChangeSelectBox,
    id = "select",
    ariaLabel,
    defaultValue,
  } = props;

  return (
    <div className="w-full">
      <select
        id={id}
        aria-label={ariaLabel}
        defaultValue={defaultValue ?? "default"}
        onChange={(event) => {
          onChangeSelectBox(event.target.value);
        }}
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      >
        {defaultValue === undefined && (
          <option value="default" hidden>
            {placeholder}
          </option>
        )}
        {selectList.map((selectItem) => {
          return (
            <option key={selectItem} value={selectItem}>
              {selectItem}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
