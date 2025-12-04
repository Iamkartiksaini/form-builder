"use client";

import React, { createContext, useContext } from "react";
import useForm from "../hook/useForm";

const FORM_CONTEXT = createContext(null)

const INIT_VALUES = {
  fullName: "Kartik",
  email: "2323",
  role: "NGO"
}

// export function FORM_PROVIDER({ schema, children }: { children: React.ReactNode | React.ReactNode[] }) {
//     const [state, setState] = useState({
//         currentState: {},
//         defaultValues: INIT_VALUES
//     });

//     const fieldUpdateHandler = useCallback((field, value) => {
//         return setState(prev => ({ ...prev, currentState: { ...prev.currentState, [field]: value } }))
//     }, [])

//     return <FORM_CONTEXT.Provider value={{ formState: state, errors: null, fieldUpdateHandler }}>{children}</FORM_CONTEXT.Provider>
// }

export function FORM_PROVIDER({ schema, children }) {
  const state = useForm({ schema })

  return <FORM_CONTEXT.Provider value={state}>{children}</FORM_CONTEXT.Provider>
}


export function useFormContext() {
  return useContext(FORM_CONTEXT)
}
