"use client";

import { FORM_PROVIDER, useFormContext } from "./store/form-context";
import { BaseField, form_schema, FieldType, inputFieldTypes } from "./utils/api";
import { cn } from "./utils/tw-merge";
// import useForm from "./hook/useForm";
// import { useEffect, useState } from "react";
import MainContainer from "./components/card";
import SelectField from "./components/select-field";
import Result from "./components/json-result";

export default function Home() {
  const fields = form_schema
  return (
    <MainContainer>
      <div className="">
        <p className="text-3xl font-bold text-center">Dynamic Form Validator</p>
        <FORM_PROVIDER schema={fields}>
          <FormComponent fields={fields} />
          <Result />
        </FORM_PROVIDER>
      </div>
    </MainContainer>

  );
}

function FormComponent({ fields }) {

  const { errors, formState, fieldUpdateHandler, onSubmit, validations, skipValidationsKeys, validator } = useFormContext();
  const errorKeys = Object.keys(errors);
  const submitDisabled = errorKeys.length > 0
  // const fields = form_schema.slice(0, 6)
  // const { errors, formState, fieldUpdateHandler, onSubmit, validations } = useForm({ schema: fields })


  function submitHandler() {
    if (submitDisabled) {
      return
    }
    onSubmit()
    const isResultEle = document.getElementById("result")
    if (isResultEle) {
      window.scrollTo({
        top: isResultEle.offsetTop
      })
    }
  }

  return <div >
    {fields.map((field, idx) => {
      return <RenderFields formState={formState}
        errors={errors} key={idx} onChangeHandler={fieldUpdateHandler} fieldSchema={field}></RenderFields>
    })}
    <div className="mt-4 flex gap-3 items-center">
      <button className="bg-yellow-400 px-3 py-1 rounded-sm" onClick={validator}>check validation</button>
      <button disabled={submitDisabled} className={cn("bg-blue-400 px-3 py-1 rounded-sm", submitDisabled && "bg-slate-300 text-slate-50")} onClick={submitHandler}>submit</button>
    </div>
  </div>
}


function RenderFields({ fieldSchema, formState, errors, onChangeHandler }) {
  const { field, label, type, required, validation, visibleWhen, multiple, placeholder } = fieldSchema;
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

  return (
    <div className={" mt-4"}>
      <div className={cn("flex flex-col", type == "checkbox" && "flex flex-row-reverse gap-2 items-center justify-end")}>
        <label className={cn("text-sm w-fit", isFieldDisabled && "text-gray-500 bg-yellow-200")} htmlFor={field}>{label}  {required && <span
          title="This field is required"
          className="text-red-500">*</span>}</label>
        {isInputField && <input
          onChange={(e) => {
            const currentValue = e.target.value
            if (type == "boolean" || type == "checkbox") {
              const isCheck = e.target?.checked
              onChangeHandler(field, isCheck)
            } else {
                if (type == "number" && typeof currentValue == "string") {
                     onChangeHandler(field, Number(currentValue));
                  }
               else {
                 onChangeHandler(field, currentValue);
              }
            }
          }} disabled={isFieldDisabled}
          value={value}
          id={field}
          className={cn("px-2 mt-1 py-1 border border-gray-300 rounded-sm", type == "checkbox" && "h-4 w-4")}
          type={type} placeholder={placeholder}
        />}

        {isSelect && <SelectField  {...fieldSchema} field={field} onChangeHandler={onChangeHandler} value={value} disabled={isFieldDisabled} />}
      </div>

      {isFieldHaveError && <span className="text-sm mt-0.5 text-red-500">{isFieldHaveError || "field value is invaild"}</span>}
    </div>
  )
}

// Checking is Dependent Field is Matching condition or not
function dependentConditionChecker(fieldRules = {},) {

  let operation = null;
  let condition = null;

  Object.keys(fieldRules).forEach((k) => {
    if (rulesConditions[k]) {
      operation = rulesConditions[k]
      condition = fieldRules[k] ?? null
    }

  })

  if (operation) {
    return operation(fieldRules?.dependentFieldValue, condition)
  }

  return false
}

// Depend Field Value Operations 
const rulesConditions = {
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
function isValidValue({ field, type, value, validation }) {
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
      return (typeof value === "number" && !isNaN(value)) ? value : NaN;
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
