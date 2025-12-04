

export const form_schema = [
    {
        "field": "fullName",
        "label": "Full Name",
        "type": "text",
        "required": true,
        "minLength": 3,
        "maxLength": 60,
        "placeholder": "Enter your full name"
    },
    {
        "field": "email",
        "label": "Email Address",
        "type": "text",
        "required": true,
        "placeholder": "name@example.com",
        "validation": {
            "pattern": "email"
        }
    },
    {
        "field": "phone",
        "label": "Phone Number",
        "type": "text",
        "required": false,
        "placeholder": "Optional",
        "validation": {
            "pattern": "phone"
        }
    },
    {
        "field": "dateOfBirth",
        "label": "Date of Birth",
        "type": "date",
        "required": true,
        "minDate": "2023-01-01",
        "maxDate": "2024-12-31"
    },
    {
        "field": "role",
        "label": "Role",
        "type": "select",
        "required": true,
        "placeholder": "Select your role",
        "options": [
            "Lawyer",
            "NGO",
            "Citizen",
            "Student"
        ]
    },
    {
        "field": "barCouncilId",
        "label": "Bar Council ID",
        "type": "text",
        "required": true,
        "minLength": 5,
        "maxLength": 30,
        "placeholder": "Enter Bar Council ID",
        "visibleWhen": {
            "field": "role",
            "equals": "Lawyer"
        }
    },
    {
        "field": "organizationName",
        "label": "Organization Name",
        "type": "text",
        "required": false,
        "minLength": 3,
        "maxLength": 80,
        "placeholder": "If applicable",
        "visibleWhen": {
            "field": "role",
            "in": [
                "NGO",
                "Lawyer"
            ]
        }
    },
    {
        "field": "yearsOfExperience",
        "label": "Years of Experience",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 40,
        "visibleWhen": {
            "field": "role",
            "notEquals": "Citizen"
        }
    },
    {
        "field": "city",
        "label": "City",
        "type": "select",
        "required": true,
        "options": [
            "Delhi",
            "Mumbai",
            "Bengaluru",
            "Kolkata",
            "Chennai",
            "Other"
        ]
    },
    {
        "field": "preferredContact",
        "label": "Preferred Contact Method",
        "type": "select",
        "required": true,
        "display": "radio",
        "options": [
            "Email",
            "Phone",
            "WhatsApp"
        ]
    },
    {
        "field": "availabilityDate",
        "label": "Available From",
        "type": "date",
        "required": false,
        "minDate": "today"
    },
    {
        "field": "areasOfInterest",
        "label": "Areas of Interest",
        "type": "select",
        "required": false,
        "multiple": true,
        "options": [
            "Legal Aid",
            "Women Rights",
            "Child Rights",
            "Education",
            "Documentation",
            "Other"
        ]
    },
    {
        "field": "acceptTerms",
        "label": "I accept the Terms & Conditions",
        "type": "checkbox",
        "required": true
    },
    {
        "field": "subscribeNewsletter",
        "label": "Subscribe to newsletter",
        "type": "checkbox",
        "required": false,
        "default": false
    }
]


export type FieldType = "text" | "date" | "select" | "checkbox";

export const inputFieldTypes = ["text", "date", "checkbox", "number"];


export type DependentField = {
    field: string,
    equals?: string,
    in?: string[]
}

export interface BaseField {
    field: string;
    label: string;
    type: FieldType;
    required: boolean;
    validation?: TextValidation;
    visibleWhen?: DependentField
}

export interface TextValidation {
    pattern?: string;
}

export interface TextField extends BaseField {
    type: "text";
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    validation?: TextValidation;
}

export interface DateField extends BaseField {
    type: "date";
    minDate?: string;
    maxDate?: string;
}

export interface SelectField extends BaseField {
    type: "select";
    placeholder?: string;
    options: string[];
}

export type FormField = TextField | DateField | SelectField;
