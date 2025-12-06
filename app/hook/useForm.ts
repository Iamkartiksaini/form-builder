"use client";
import { useCallback, useEffect, useRef, useState, MutableRefObject } from "react";
import { validationFunctions } from "../utils/validations";

// Schema Field Type Definition
export interface SchemaField {
    field: string;
    label?: string;
    key?: string;
    type: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    minDate?: string;
    maxDate?: string;
    multiple?: boolean;
    validation?: {
        pattern?: string;
    };
    [key: string]: any; // For other potential properties
}

const INIT_VALUES: Record<string, any> = {};

interface UseFormProps {
    defaultValues?: Record<string, any>;
    schema?: SchemaField[];
}

interface ValidationRule {
    value: any;
    message: string;
}

interface FieldValidations {
    [key: string]: ValidationRule;
}

interface FormValidations {
    [key: string]: FieldValidations;
}

interface FormState {
    currentState: Record<string, any>;
    defaultValues: Record<string, any>;
}

export interface UseFormReturn {
    formState: FormState;
    errors: Record<string, string>;
    fieldUpdateHandler: (field: string, value: any) => void;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    validations: FormValidations;
    onSubmit: () => void;
    register: (keyName: string) => void;
    unregister: (keyName: string) => void;
    validator: () => void;
    skipValidationsKeys: MutableRefObject<Set<string>>;
    setFormData: (data: Record<string, any>) => void;
}

export default function useForm({ defaultValues = INIT_VALUES, schema = [] }: UseFormProps): UseFormReturn {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const errorKeys = Object.keys(errors);
    // storing form fields validations
    const [validations, setValidations] = useState<FormValidations>({});

    // This for validation errors
    const skipValidationsKeys = useRef<Set<string>>(new Set([]));

    const [state, setState] = useState<FormState>({
        currentState: { ...defaultValues },
        defaultValues,
    });

    useEffect(() => {
        const isSchemaArray = Array.isArray(schema);
        if (isSchemaArray && schema.length > 0) {
            let validationsOfForm: FormValidations = {};
            let defaultVal: Record<string, any> = {};

            // looping through fields for generating validations
            schema.forEach((fieldSchema) => {
                let key = fieldSchema?.field;
                const label = fieldSchema?.label || fieldSchema?.key;

                let field_validations: FieldValidations = {};

                if (fieldSchema?.required) {
                    field_validations.isRequired = {
                        value: fieldSchema?.required || false,
                        message: `field is required`,
                    };
                }

                // Setting Field default value if not provided
                if (state?.defaultValues[key]) {
                    defaultVal[key] = state.defaultValues[key];
                } else {
                    if (fieldSchema?.type == "select" && fieldSchema?.multiple) {
                        defaultVal[key] = null;
                    } else {
                        defaultVal[key] = defaultValueInit(fieldSchema?.type);
                    }
                }

                // Field type based field schema
                switch (fieldSchema.type) {
                    case "text": {
                        field_validations.type = {
                            value: "string",
                            message: "value type must be string",
                        };

                        if (fieldSchema?.minLength) {
                            field_validations.minLength = {
                                value: fieldSchema?.minLength || 0,
                                message: `Minimum ${fieldSchema?.minLength} characters is required`,
                            };
                        }
                        if (fieldSchema?.maxLength) {
                            field_validations.maxLength = {
                                value: fieldSchema?.maxLength || Infinity,
                                message: `${label} length can't excede ${fieldSchema?.maxLength} characters`,
                            };
                        }
                        if (fieldSchema?.validation?.pattern) {
                            field_validations.pattern = {
                                value: fieldSchema?.validation?.pattern,
                                message: "Invaild input. check required format.",
                            };
                        }

                        break;
                    }
                    case "number": {
                        field_validations.type = {
                            value: "number",
                            message: "value type must be number",
                        };
                        if (fieldSchema?.min) {
                            field_validations.min = {
                                value: fieldSchema?.min || Infinity,
                                message: `minimum value is ${fieldSchema?.min}`,
                            };
                        }
                        if (fieldSchema?.max) {
                            field_validations.max = {
                                value: fieldSchema?.max || Infinity,
                                message: `maximum value is ${fieldSchema?.max}`,
                            };
                        }
                        break;
                    }
                    case "date": {
                        field_validations.type = {
                            value: "date",
                            message: "value type must be date",
                        };
                        if (fieldSchema?.minDate) {
                            field_validations.minDate = {
                                value: fieldSchema?.minDate || "",
                                message: `minimum date is ${fieldSchema?.minDate}`,
                            };
                        }
                        if (fieldSchema?.maxDate) {
                            field_validations.maxDate = {
                                value: fieldSchema?.maxDate || "",
                                message: `maximum date is ${fieldSchema?.maxDate}`,
                            };
                        }
                        break;
                    }
                    case "checkbox": {
                        field_validations.type = {
                            value: "boolean",
                            message: "value type must be boolean",
                        };
                        break;
                    }
                    case "select": {
                        if (fieldSchema?.multiple) {
                            field_validations.type = {
                                value: "multi_select",
                                message: "value type must be array",
                            };
                        } else {
                            field_validations.type = {
                                value: "string",
                                message: "value type must be string",
                            };
                        }
                        break;
                    }
                }
                // Adding field validations in FormStateValidations
                validationsOfForm[key] = field_validations;
            });

            // Settings Form feilds Scheams
            setValidations(validationsOfForm);

            // Form Fields default and simple value
            setState((prev) => ({
                ...prev,
                defaultValues: defaultVal,
                currentState: defaultVal,
            }));
        }
    }, [schema]); // Added schema dependency

    useEffect(() => {
        // Focusing when on first field of with error state
        if (errorKeys.length > 0) {
            const firstErrorField = errorKeys[0];
            const ele = document.getElementById(firstErrorField);
            if (ele) {
                ele.focus();
            }
        }
    }, [errorKeys.length]);

    // For Skipping validations error of field
    function unregister(keyName: string) {
        const updateSkipFields = new Set([...skipValidationsKeys.current]);
        updateSkipFields.delete(keyName);
        skipValidationsKeys.current = updateSkipFields;
    }

    // For making validations active of field
    function register(keyName: string) {
        const updateSkipFields = new Set([...skipValidationsKeys.current]);
        updateSkipFields.add(keyName);
        skipValidationsKeys.current = updateSkipFields;
    }

    // Field value update function
    const fieldUpdateHandler = useCallback((field: string, value: any) => {
        return setState((prev) => ({
            ...prev,
            currentState: { ...prev.currentState, [field]: value },
        }));
    }, []);

    // Set complete form data (for loading drafts)
    const setFormData = useCallback((data: Record<string, any>) => {
        setState((prev) => ({
            ...prev,
            currentState: { ...prev.currentState, ...data },
        }));
    }, []);

    function onSubmit() {
        validator();
        if (errorKeys.length > 0) {
            return;
        }
        const formState = state.currentState;

        const payload: Record<string, any> = {};
        const haveKeys = Object.keys(formState);

        if (haveKeys?.length > 0) {
            haveKeys.forEach((key) => {
                if ([...skipValidationsKeys?.current].includes(key)) {
                    return;
                } else {
                    payload[key] = formState[key];
                }
            });
        }
        console.log("Form Submitted:", payload);
    }

    function validator() {
        const formState = state.currentState;
        let getErrors: Record<string, string> = {};
        // currentState = { fullName: XYZ };
        const validationFieldKeys = Object.keys(validations);
        // validationFieldKeys = { fullName: { required: { value, message } } };

        if (validationFieldKeys && validationFieldKeys.length > 0) {
            validationFieldKeys.forEach((key) => {
                const skipFieldArray = [...skipValidationsKeys.current];

                if (skipFieldArray.includes(key)) {
                    return;
                }

                // key = fullName
                let fieldError = new Map<string, string>();
                // fieldSchema =  { required: { value, message }, minLength: 23 }
                const fieldSchema = validations[key];

                const fieldCurrentValue = formState[key]; // Kartik;

                const fieldValidation = Object.keys(fieldSchema); // [required, minLength];

                fieldValidation.forEach((conditionKey) => {
                    const validationValueAndMessage = fieldSchema[conditionKey]; // { value: 30, message: can't excede this length };
                    const validateValueFunction = validationFunctions[conditionKey];

                    // Checking if we have function for validating that type of value and condition
                    if (
                        validationValueAndMessage?.value !== null &&
                        validateValueFunction
                    ) {
                        const result = validateValueFunction({
                            condition: validationValueAndMessage?.value,
                            value: fieldCurrentValue,
                            message: validationValueAndMessage?.message,
                        });
                        if (result !== null) {
                            // adding if error occured
                            fieldError.set(conditionKey, result);
                        } else {
                            // remove if error resolved
                            fieldError.delete(conditionKey);
                        }
                    }
                });

                // Getting only first error of the field
                const firstEntry = fieldError?.entries()?.next()?.value || null;
                if (firstEntry) {
                    getErrors[key] = firstEntry[1];
                }
            });
        }

        // Updating Errors
        setErrors(getErrors);
    }

    return {
        formState: state,
        errors,
        fieldUpdateHandler,
        setErrors,
        validations,
        onSubmit,
        register,
        unregister,
        validator,
        skipValidationsKeys,
        setFormData,
    };
}

function defaultValueInit(type: string): any {
    let result = null;
    switch (type) {
        case "text": {
            result = "";
            break;
        }

        case "number": {
            result = 0;
            break;
        }

        case "checkbox": {
            result = false;
            break;
        }

        case "date": {
            result = null;
            break;
        }

        case "select": {
            result = "";
            break;
        }
        case "multi_select": {
            result = [];
            break;
        }
    }
    return result;
}
