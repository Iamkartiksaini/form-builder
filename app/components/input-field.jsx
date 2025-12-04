import { Fragment } from 'react'
import { cn } from "../utils/tw-merge"

export default function InputField({ onChangeHandler = shellFunc, field = "randomField", label = "", required = false, value = "", type = "text", disabled = false, placeholder = "" }) {
    return (
        <Fragment>
            <label className={cn("text-sm w-fit", disabled && "text-gray-500 bg-yellow-200")} htmlFor={field}>{label}  {required && <span className="text-red-500">*</span>}</label>
            <input
                onChange={(e) => {
                    const currentValue = e.target.value
                    onChangeHandler(field, currentValue)
                }}
                disabled={disabled}
                value={value}
                id={field}
                className="px-2 mt-1 py-1 border border-gray-300 rounded-sm" type={type} placeholder={placeholder}
            />
        </Fragment>
    )
}

function shellFunc() { }
