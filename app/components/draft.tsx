"use client";

import { Eye, FileDown, RefreshCw, Save, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useFormContext } from "../store/form-context";

export default function Draft() {
    const [draftData, setDraftData] = useState<Record<string, any> | null>(null);
    const { formState, setFormData } = useFormContext();
    const [showDraftPreview, setShowDraftPreview] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("formDraft");
        if (saved) {
            try {
                setDraftData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    const clearDraft = () => {
        localStorage.removeItem("formDraft");
        setDraftData(null);
    };

    const handleSaveDraft = () => {
        const current = formState.currentState;
        localStorage.setItem("formDraft", JSON.stringify(current));
        setDraftData(current);
        alert("Draft saved successfully!");
    };

    const handleLoadDraft = () => {
        if (draftData) {
            setFormData(draftData);
            // alert("Draft loaded!");
        }
    };


    return (<Fragment>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-700">Form Actions</h3>
            </div>
            <div id="save_draft" className="flex items-center gap-3">
                <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
                >
                    <Save size={16} /> Save Draft
                </button>
            </div>
        </div>

        {draftData && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-blue-900 flex items-center gap-2 text-lg">
                            <FileDown size={20} /> Draft Available
                        </h4>
                        <p className="text-sm text-blue-700 mt-1 max-w-md">
                            You have an unsaved draft from a previous session. Would you like to restore it?
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowDraftPreview(!showDraftPreview)}
                            className="text-sm flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors bg-white/50 border border-blue-100"
                        >
                            <Eye size={15} /> {showDraftPreview ? "Hide Preview" : "Preview Draft"}
                        </button>
                        <button
                            onClick={clearDraft}
                            className="text-sm flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={15} /> Discard
                        </button>
                    </div>
                </div>

                {showDraftPreview && (
                    <div className="mt-4 bg-white p-4 rounded-lg border border-blue-100 shadow-inner max-h-60 overflow-auto">
                        <pre className="text-xs text-gray-600 font-mono">
                            {JSON.stringify(draftData, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-5">
                    <button
                        onClick={handleLoadDraft}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-bold"
                    >
                        <RefreshCw size={18} /> Load Draft into Form
                    </button>
                </div>
            </div>
        )}
    </Fragment>
    )
}