import { cn } from "../utils/tw-merge"

export default function Checkbox({ onChangeHandler = shellFunc, field = "randomField", label = "", required = false, value = false, disabled = false }) {

    function changeFieldValue(e) {
        const isCheck = e.target?.checked;
        onChangeHandler(field, isCheck)
    }

    return (
        <div className='flex gap-3 items-center'>
            <input
                onChange={changeFieldValue}
                disabled={disabled}
                value={value}
                id={field}
                className="px-2 mt-1 py-2 h-4 w-4 border border-gray-300 rounded-sm" type={"checkbox"}
            />
            <label className={cn("text-base mt-1 w-fit ", disabled && "text-gray-500 bg-yellow-200")} htmlFor={field}>
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
        </div>
    )
}


function shellFunc() { }