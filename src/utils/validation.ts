import { getArticle } from './string-helpers';

type ValidationRules = {
    required?: { value: boolean };
    minLength?: { value: number };
    maxLength?: { value: number };
};

export const validateField = (fieldName: string, rules: ValidationRules) => {
    return {
        required: rules.required
            ? {
                  value: rules.required.value,
                  message: `Please enter ${getArticle(fieldName.toLowerCase())} ${fieldName.toLowerCase()}`,
              }
            : undefined,

        minLength: rules.minLength
            ? {
                  value: rules.minLength.value,
                  message: `${fieldName} must be at least ${rules.minLength.value} characters long`,
              }
            : undefined,

        maxLength: rules.maxLength
            ? {
                  value: rules.maxLength.value,
                  message: `${fieldName} must be no more than ${rules.maxLength.value} characters long`,
              }
            : undefined,
    };
};

export const nameValidate = validateField('Name', {
    required: { value: true },
    minLength: { value: 2 },
    maxLength: { value: 250 },
});

export const descriptionValidate = validateField('Description', {
    required: { value: true },
    minLength: { value: 5 },
    maxLength: { value: 2000 },
});

/**
 * Validates a name according to naming conventions.
 * @param value - The name to validate
 * @param field - Optional field type for error messages (e.g., 'function', 'variable'). Defaults to empty string.
 * @returns true if valid, or an error message string if invalid
 */
export const validateName = (value: string, field: string = ''): boolean | string => {
    if (value) {
        const validHeaderRegex = /^\w+$/;
        const fieldName = field ? `${field} name` : 'name';
        if (value.startsWith(' ')) {
            return `No leading spaces in ${fieldName}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${fieldName}`;
        }
        if (!validHeaderRegex.test(value)) {
            return 'Letters, digits and _ only allowed';
        }
    }
    return true;
};

export const validatePositiveNumber = (value: number | undefined): boolean | string => {
    if (value) {
        if (Number.isNaN(value) || value <= 0) {
            return 'Please enter a valid positive number';
        }
    }
    return true;
};
