import { useFormContext } from "../store/form-context";

export default function Result() {
    const { formState } = useFormContext()
    const currentState = formState?.currentState
    const formData = Object.keys(currentState)

    return <div id="result" className="mt-8">
        <h3 className="text-center font-semibold text-2xl">
            Result Preview
        </h3>
        <code style={{ wordWrap: "break-word", lineHeight: "1.7" }} className="mt-8 max-w-2xl h-auto overflow-auto">
            {formData.map((key, index) => <div className="flex gap-2" key={index}>
                <span>{key}:</span>
                <span>{JSON.stringify(currentState[key]) || null}</span>
            </div>)}
        </code>
    </div>
}
