const HorizontailCheckBox = (props: {
  label: string;
  checkItemList: string[];
  defaultCheckItemList: string[];
  onChangeCheckBox: (value: string, checked: boolean) => void;
}) => {
  const { label, checkItemList, defaultCheckItemList, onChangeCheckBox } =
    props;

  return (
    <div className="w-full">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
        {label}
      </h3>
      <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        {checkItemList.map((checkItem, index) => {
          return (
            <li
              key={`check-item-${index}`}
              className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600"
            >
              <div className="flex items-center ps-3">
                <input
                  id={checkItem}
                  type="checkbox"
                  value={checkItem}
                  defaultChecked={
                    defaultCheckItemList.find((item) => item === checkItem)
                      ? true
                      : false
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  onChange={(event) => {
                    const value = event.target.value;
                    const checked = event.target.checked;
                    onChangeCheckBox(value, checked);
                  }}
                />
                <label
                  htmlFor={checkItem}
                  className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {checkItem}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HorizontailCheckBox;
