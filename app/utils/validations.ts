// Validations Functions for checking field value

interface ValidationArgs {
  condition?: any;
  value: any;
  message?: string;
  customRegex?: RegExp;
}

export function isValidDate(value: any): boolean {
  if (value === null || value === undefined) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

export function minLength({ condition, value, message }: ValidationArgs): string | null {
  if (value?.length >= condition) return null;

  return message || `Minimum length ${condition} required`;
}

export function maxLength({ condition, value, message }: ValidationArgs): string | null {
  if (value?.length <= condition) return null;

  return message || `Maximum length is ${condition}`;
}

export function minNumber({ condition, value, message }: ValidationArgs): string | null {
  if (value >= condition) return null;

  return message || `Minimum ${condition} required`;
}

export function maxNumber({ condition, value, message }: ValidationArgs): string | null {
  if (value <= condition) return null;

  return message || `Maximum is ${condition}`;
}

export function minDate({ condition, value, message }: ValidationArgs): string | null {
  let dateCondition: Date;
  if (condition === "today") {
    const now = new Date();
    dateCondition = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    dateCondition = new Date(condition);
  }

  const dateValue = new Date(value);

  // Check if dates are valid before comparing
  if (isNaN(dateCondition.getTime()) || isNaN(dateValue.getTime())) {
      return message || "Invalid date comparison";
  }


  return dateValue >= dateCondition
    ? null
    : message || `${value} is less than ${dateCondition.toISOString()}`;
}

export function maxDate({ condition, value, message }: ValidationArgs): string | null {
  return new Date(value) <= new Date(condition)
    ? null
    : message || `${value}is greater than ${condition}`;
}

export function type({ condition, value, message }: ValidationArgs): string | null {
  if (condition == "date") {
    return isValidDate(value) ? null : message || "Invaild value";
  }
  if (condition == "multi_select") {
    return Array.isArray(value) ? null : message || "Invaild value";
  }

  if (typeof value === condition) return null;

  return message || `Required ${condition} type value `;
}

export function isRequired({ value, message }: ValidationArgs): string | null {
  const isBoolean = typeof value === "boolean";
  if (isBoolean && value == false) {
    return null; // False is considered a value (e.g. unchecked checkbox) - wait, this logic seems specific to the app's requirement. Keeping as is.
  }
  const isString = typeof value === "string";
  const isArray = Array.isArray(value);

  if (isString) {
    if (value?.trim().length === 0) {
      return message || "field is required";
    }
    return null;
  }
  if (isArray) {
    if (value?.length === 0) {
      return message || "field is required";
    }
    return null;
  } else if (value == null || value == undefined || (typeof value === 'number' && isNaN(value))) {
    return message || `Field is required`; // Fixed undefined "condition" variable in original code
  }
  return null;
}

export function pattern({ condition, value, message, customRegex }: ValidationArgs): string | null {
  if (customRegex) {
    return customRegex.test(value) ? null : "Invaild Format";
  }
  const isPatternPreDefined = patternsModel[condition as keyof typeof patternsModel];
  if (!isPatternPreDefined) {
    return "Invaild Format";
  }
  return isPatternPreDefined(value) || null;
}

const patternsModel = {
  email: (value: string): string | null => {
    // Simple email pattern check
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }
    return null;
  },
  phone: (value: string): string | null => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid 10-digit phone number.";
    }
    return null;
  },
};

export const validationFunctions: Record<string, Function> = {
  minLength,
  maxLength,
  minNumber,
  maxNumber,
  isRequired,
  type,
  pattern,
  minDate,
  maxDate,
};
