"use client";

import { FORM_PROVIDER, useFormContext } from "./store/form-context";
import { form_schema, inputFieldTypes } from "./utils/api";
import { cn } from "./utils/tw-merge";
import MainContainer from "./components/card";
import SelectField from "./components/select-field";
import Result from "./components/json-result";
import Draft from "./components/draft";

// Define Validation Function Type
type ValidationRuleOperator = (fieldValue: any, condition: any) => boolean;

export default function Home() {
    const fields = form_schema;

    return (
        <MainContainer className="mt-10 mb-20 bg-gray-50/50">
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <p className="text-4xl font-extrabold text-center text-gray-900 tracking-tight">
                        Dynamic Form Builder
                    </p>
                    <p className="text-center text-gray-500 mt-2 text-lg">
                        Build, validate, and manage your forms with ease.
                    </p>
                </div>

                <FORM_PROVIDER schema={fields}>
                    <FormComponent
                        fields={fields}
                    />
                    <Result />
                </FORM_PROVIDER>
            </div>
        </MainContainer>
    );
}

function FormComponent({ fields }: { fields: any[], }) {
    const { errors, formState, fieldUpdateHandler, onSubmit, validator, setFormData } = useFormContext();
    const errorKeys = Object.keys(errors);
    const submitDisabled = errorKeys.length > 0;


    function submitHandler() {
        if (submitDisabled) {
            return;
        }
        onSubmit();
        const isResultEle = document.getElementById("result");
        if (isResultEle) {
            window.scrollTo({
                top: isResultEle.offsetTop,
                behavior: 'smooth'
            });
        }
    }

    return (
        <div className="space-y-8">
            {/* Actions Bar */}
            <Draft />

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                {fields.map((field, idx) => {
                    // Span full width for certain fields if needed, or keep 2 cols
                    const isFullWidth = field.type === 'textarea' || field.type === 'checkbox' || field.field === 'acceptTerms' || field.field === 'subscribeNewsletter';
                    return (
                        <div key={idx} className={cn(isFullWidth ? "col-span-1 md:col-span-2" : "col-span-1")}>
                            <RenderFields
                                formState={formState}
                                errors={errors}
                                onChangeHandler={fieldUpdateHandler}
                                fieldSchema={field}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Submit Section */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
                    onClick={validator}
                >
                    Validate All Fields
                </button>
                <button
                    disabled={submitDisabled}
                    className={cn(
                        "px-8 py-3 font-bold rounded-lg transition-all shadow-lg hover:shadow-xl focus:ring-2 focus:ring-offset-2",
                        submitDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white focus:ring-green-500"
                    )}
                    onClick={submitHandler}
                >
                    Submit Application
                </button>
            </div>
        </div>
    );
}


// Interfaces for RenderFields props
interface RenderFieldsProps {
    fieldSchema: any; // FormField;
    formState: any; // FormState;
    errors: Record<string, string>;
    onChangeHandler: (field: string, value: any) => void;
}

function RenderFields({ fieldSchema, formState, errors, onChangeHandler }: RenderFieldsProps) {
    const { field, label, type, required, visibleWhen, placeholder } = fieldSchema; // validation, multiple removed from destructuring to avoid unused warning if not used
    const { register, unregister } = useFormContext()

    let defaultValue = formState?.defaultValues[field] ?? null
    let value = formState?.currentState[field] ?? null

    defaultValue = isValidValue({ field, type, value: defaultValue })
    value = isValidValue({ field, type, value: value ?? defaultValue })

    const isFieldHaveError = errors[field]

    const isInputField = inputFieldTypes.includes(type)

    const isSelect = type == "select";

    let isFieldDisabled = false
    const isVisiblityDependent = visibleWhen?.field ?? false

    // IF FIELD VISIBLITY DEPENDS ON OTHER FIELD 
    if (isVisiblityDependent) {

        const dependOn = visibleWhen?.field;
        const dependOnFieldValue = formState?.currentState[dependOn];

        const isFieldVisible = dependentConditionChecker({
            ...visibleWhen,
            dependentFieldValue: dependOnFieldValue,
        })

        isFieldDisabled = isFieldVisible ? false : true

        // Adding and Removing field state- its helps while submitting form
        isFieldDisabled ? register(field) : unregister(field)

    }

    // Remove field if its is'nt visible
    if (isFieldDisabled) {
        return null
    }

    // if (field == "yearsOfExperience") {
    //     console.log("yearsOfExperience", fieldSchema)
    // }

    return (
        <div className="w-full group">
            <div className={cn("flex flex-col gap-2", type == "checkbox" && "flex-row-reverse justify-end items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100")}>
                <label
                    className={cn("text-sm font-semibold text-gray-700 transition-colors group-hover:text-gray-900", isFieldDisabled && "text-gray-400")}
                    htmlFor={field}
                >
                    {label}
                    {required && <span title="This field is required" className="text-red-500 ml-1 select-none">*</span>}
                </label>

                {isInputField && (
                    <input
                        onChange={(e) => {
                            const currentValue = e.target.value;
                            if (type === "boolean" || type === "checkbox") {
                                const isCheck = e.target?.checked;
                                onChangeHandler(field, isCheck);
                            } else {
                                if (type == "number" && typeof currentValue == "string") {
                                    onChangeHandler(field, Number(currentValue));
                                }
                                else {
                                    onChangeHandler(field, currentValue);
                                }
                            }
                        }}
                        disabled={isFieldDisabled}
                        value={value}
                        id={field}
                        className={cn(
                            "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm transition-all duration-200",
                            "placeholder:text-gray-400",
                            "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
                            "hover:border-gray-400",
                            "disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200",
                            isFieldHaveError && "border-red-300 focus:border-red-500 focus:ring-red-100",
                            type === "checkbox" && "h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        )}
                        type={type}
                        placeholder={placeholder}
                    />
                )}

                {isSelect && (
                    <div className="relative">
                        <SelectField
                            {...fieldSchema}
                            field={field}
                            onChangeHandler={onChangeHandler}
                            value={value}
                            disabled={isFieldDisabled}
                        />
                    </div>
                )}
            </div>

            {isFieldHaveError && (
                <p className="text-xs font-medium text-red-600 mt-1.5 animate-in slide-in-from-top-1 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600 inline-block" /> {isFieldHaveError}
                </p>
            )}
        </div>
    )
}

// Checking is Dependent Field is Matching condition or not
function dependentConditionChecker(fieldRules: any = {},) {

    let operation: ValidationRuleOperator | null = null;
    let condition = null;

    Object.keys(fieldRules).forEach((k) => {
        if (rulesConditions[k as keyof typeof rulesConditions]) {
            operation = rulesConditions[k as keyof typeof rulesConditions]
            condition = fieldRules[k] ?? null
        }

    })

    if (operation && operation !== null) {
        // @ts-ignore
        return operation(fieldRules?.dependentFieldValue, condition)
    }

    return false
}

// Depend Field Value Operations 
const rulesConditions: Record<string, ValidationRuleOperator> = {
    "in": (fieldValue, condition) => {
        return condition.includes(fieldValue)
    },
    "notEquals": (fieldValue, condition) => {
        return condition !== fieldValue
    },
    "equals": (fieldValue, condition) => {
        return condition === fieldValue
    },
}

// Check and Set vaild value for form
function isValidValue({ field, type, value, validation }: { field: string, type: string, value: any, validation?: any }) {
    switch (type) {
        case "text": {
            if (typeof value === "string" && value.trim().length > 0) {
                return value;
            }
            return "";
        }
        case "phone": {
            if (typeof value === "string" && value.trim().length > 0) {
                return value;
            }
            return "";
        }

        case "number": {
            return (typeof value === "number" && !isNaN(value)) ? value : 0;
        }

        case "checkbox": {
            return typeof value === "boolean" ? value : false;
        }

        case "date": {
            if (value == null) return "";
            const date = new Date(value);
            return isNaN(date.getTime())
                ? ""
                : date.toISOString().split("T")[0];
        }

        case "select": {
            if (typeof value === "string") {
                return value || "";
            }
            if (Array.isArray(value)) {
                return value.length ? value : [];
            }
            return "";
        }

        default:
            return null;
    }
}
