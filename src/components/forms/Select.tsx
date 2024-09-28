const Select = (props: {
  selectList: string[];
  placeholder?: string;
  onChangeSelectBox: (selectItem: string) => void;
}) => {
  const { selectList, placeholder, onChangeSelectBox } = props;

  return (
    <div className="w-full">
      <select
        id="select"
        defaultValue="default"
        onChange={(event) => {
          onChangeSelectBox(event.target.value);
        }}
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      >
        <option value="default" hidden>
          {placeholder}
        </option>
        {selectList.map((selectItem, index) => {
          return (
            <option key={`select-item-${index}`} value={selectItem}>
              {selectItem}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
