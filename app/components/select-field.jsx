
import { cn } from "../utils/tw-merge"

export default function SelectField({ onChangeHandler = shellFunc, field = "", label = "", value = "", multiple = false, options = [], placeholder = "", disabled = false }) {

    function onSelectChangeHanlder(e) {
        multiple ? null :
            onChangeHandler(field, e.target.value)
    }

    function optionToggle(e) {
        const currentOptionValue = e.target.value
        if (multiple) {
            const prevValue = Array.isArray(value) ? value : []

            const uniqueOptions = new Set([...prevValue])

            const isAlready = uniqueOptions.has(currentOptionValue)

            if (isAlready) {
                uniqueOptions.delete(currentOptionValue)
            } else {
                uniqueOptions.add(currentOptionValue)
            }
            onChangeHandler(field, [...uniqueOptions])
        }
    }


    return (<select multiple={multiple ? true : false}
        onChange={onSelectChangeHanlder}
        value={value} disabled={disabled}
        id={field}
        className="px-2 mt-1 py-1 border border-gray-300 rounded-sm">
        <option value="">{placeholder?.trim() ? placeholder : "Select " + label}</option>
        {options?.map((opt, idx) => {
            return <option
                className={cn(value.includes(opt) && "bg-yellow-400")}
                onClick={optionToggle} key={idx} value={opt}> {opt}</option>
        })}
    </select>)
}

function shellFunc() {}