import "./ButtonSelect.css"

export type ButtonSelectOption = {
  label: string;
  value: string|number;
};

type Props = {
  options: ButtonSelectOption[],
  value: string,
  onChange: any,
  onButtonClick: any,
  buttonText?: string,
  nullVal: ButtonSelectOption
}

export function ButtonSelect(
  { options, value, onChange, onButtonClick, buttonText="Change", nullVal }: Props) {
  let optionsWithNull = [nullVal, ...options];
  console.log("options", options);

  return (
    <div className="button-select">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {optionsWithNull.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button onClick={() => onButtonClick(value)} disabled={value == nullVal.value}>
        {buttonText}
      </button>
    </div>
  );
}
