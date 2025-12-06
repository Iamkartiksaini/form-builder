import { ChangeEvent, MouseEvent } from "react";
import { cn } from "../utils/tw-merge"

interface SelectFieldProps {
    onChangeHandler: (field: string, value: any) => void;
    field: string;
    label: string;
    value?: string | string[];
    multiple?: boolean;
    options?: string[];
    placeholder?: string;
    disabled?: boolean;
    className?: string; // Added className support
}

export default function SelectField({
    onChangeHandler = shellFunc,
    field = "",
    label = "",
    value = "",
    multiple = false,
    options = [],
    placeholder = "",
    disabled = false,
    className = ""
}: SelectFieldProps) {

    function onSelectChangeHanlder(e: ChangeEvent<HTMLSelectElement>) {
        multiple ? null :
            onChangeHandler(field, e.target.value)
    }

    function optionToggle(e: MouseEvent<HTMLOptionElement>) {
        // e.preventDefault(); // Prevents default scrolling or other behaviors if needed
        const currentOptionValue = (e.target as HTMLOptionElement).value;

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
        className={cn("px-2 mt-1 py-1 border border-gray-300 rounded-sm w-full", className)}>
        {/* merged className with default, added w-full */}
        <option value="">{placeholder?.trim() ? placeholder : "Select " + label}</option>
        {options?.map((opt, idx) => {
            return <option
                className={cn(Array.isArray(value) && value.includes(opt) && "bg-yellow-100 font-medium")}
                onClick={optionToggle} key={idx} value={opt}> {opt}</option>
        })}
    </select>)
}

function shellFunc() { }
