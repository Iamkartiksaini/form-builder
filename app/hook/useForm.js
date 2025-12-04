"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { validationFunctions } from "../utils/validations";

// Init value
const INIT_VALUES = {
  //   fullName: "Kartik Saini",
  //   email: "myemail@email.com",
  //   phone: "323232",
  //   dateOfBirth: null,
  //   role: "NGO",
  //   barCouncilId: "",
  //   organizationName: "",
  //   yearsOfExperience: null,
  //   city: "",
  //   preferredContact: "",
  //   availabilityDate: null,
  //   areasOfInterest: ["Legal Aid", "Women Rights"],
  //   acceptTerms: false,
  //   subscribeNewsletter: false,
};

export default function useForm({ defaultValues = INIT_VALUES, schema = [] }) {
  const [errors, setErrors] = useState({});
  const errorKeys = Object.keys(errors);
  // storing form fields validations
  const [validations, setValidations] = useState({});

  // This for validation errors
  const skipValidationsKeys = useRef(new Set([]));

  const [state, setState] = useState({
    currentState: { ...defaultValues },
    defaultValues,
  });

  useEffect(() => {
    const isSchemaArray = Array.isArray(schema);
    if (isSchemaArray && schema.length > 0) {
      let validationsOfForm = {};
      let defaultVal = {};

      // looping through fields for generating validations
      schema.forEach((fieldSchema) => {
        let key = fieldSchema?.field;
        const label = fieldSchema?.label || fieldSchema?.key;

        let field_validations = {};

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
  }, []);

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
  function unregister(keyName) {
    const updateSkipFields = new Set([...skipValidationsKeys.current]);
    updateSkipFields.delete(keyName);
    skipValidationsKeys.current = updateSkipFields;
  }

  // For making validations active of field
  function register(keyName) {
    const updateSkipFields = new Set([...skipValidationsKeys.current]);
    updateSkipFields.add(keyName);
    skipValidationsKeys.current = updateSkipFields;
  }

  // Field value update function
  const fieldUpdateHandler = useCallback((field, value) => {
    return setState((prev) => ({
      ...prev,
      currentState: { ...prev.currentState, [field]: value },
    }));
  }, []);

  function onSubmit() {
    validator();
    if (errorKeys.length > 0) {
      return;
    }
    const formState = state.currentState;

    const payload = {};
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
  }

  function validator() {
    const formState = state.currentState;
    let getErrors = {};
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
        let fieldError = new Map();
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
  };
}

function defaultValueInit(type) {
  let result = null;
  switch (type) {
    case "text": {
      result = "";
      break;
    }

    case "number": {
      result = null;
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
