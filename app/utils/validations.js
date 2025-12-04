// Validations Functions for checking field value

export function isValidDate(value) {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
}

export function minLength({ condition, value, message }) {
  if (value?.length >= condition) return null;

  return message || `Minimum length ${condition} required`;
}

export function maxLength({ condition, value, message }) {
  if (value?.length <= condition) return null;

  return message || `Maximum length is ${condition}`;
}

export function minNumber({ condition, value, message }) {
  if (value >= condition) return null;

  return message || `Minimum ${condition} required`;
}

export function maxNumber({ condition, value, message }) {
  if (value <= condition) return null;

  return message || `Maximum is ${condition}`;
}

function minDate({ condition, value, message }) {
  if (condition === "today") {
    const now = new Date();
    condition = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    condition = new Date(condition);
  }

  const dateValue = new Date(value);

  return dateValue >= condition
    ? null
    : message || `${value} is less than ${condition.toISOString()}`;
}

function maxDate({ condition, value, message }) {
  return new Date(value) <= new Date(condition)
    ? null
    : message || `${value}is greater than ${condition}`;
}

export function type({ condition, value, message }) {
  if (condition == "date") {
    return isValidDate(value) ? null : message || "Invaild value";
  }
  if (condition == "multi_select") {
    return Array.isArray(value) ? null : message || "Invaild value";
  }

  if (typeof value === condition) return null;

  return message || `Required ${condition} type value `;
}

export function isRequired({ value, message }) {
  const isBoolean = typeof value === "boolean";
  if (isBoolean && value == false) {
    return null;
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
  } else if (value == null || value == undefined || value === NaN) {
    return message || `Required ${condition} type value `;
  }
  return null;
}

export function pattern({ condition, value, message, customRegex = false }) {
  if (customRegex) {
    return customRegex.test(value) ? null : "Invaild Format";
  }
  const isPatternPreDefined = patternsModel[condition];
  if (!isPatternPreDefined) {
    return "Invaild Format";
  }
  return isPatternPreDefined(value) || null;
}

const patternsModel = {
  email: (value) => {
    // Simple email pattern check
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }
    return null;
  },
  phone: (value) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid 10-digit phone number.";
    }
    return null;
  },
};

export const validationFunctions = {
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