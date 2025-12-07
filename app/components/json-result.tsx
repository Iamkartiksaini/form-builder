"use client";

import { Eye, } from "lucide-react";
import { Fragment, useState } from "react";
import { useFormContext } from "../store/form-context";

export default function Result() {
    const { formState } = useFormContext()
    const currentState = formState?.currentState
    const formData = Object.keys(currentState)
    const [isExpend, setIsExpand] = useState(false);

    return (<Fragment>
        {formData.length > 0 && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-blue-900 flex items-center gap-2 text-lg">
                            <Eye size={20} /> Submit Form Preview
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsExpand(!isExpend)}
                            className="text-sm flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors bg-white/50 border border-blue-100"
                        >
                            <Eye size={15} /> {isExpend ? "Hide" : "Expand"}
                        </button>
                    </div>
                </div>

                {isExpend && (
                    <div className="mt-2 bg-white p-4 rounded-lg border border-blue-100 shadow-inner max-h-60 overflow-auto">
                        <pre className="text-xs text-gray-600 font-mono">
                            {JSON.stringify(currentState, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        )}
    </Fragment>
    )
}