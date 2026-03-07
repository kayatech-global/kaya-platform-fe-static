import React, { FormEvent } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { PackageReleaseType, OverallUsageType, UnitPrefix, UnitType, UsageUnitType } from '@/enums';
import { OverallUsage } from '@/models';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OptionModel } from '@/components';
import { getArticle } from '@/utils/string-helpers';
import { Parser } from 'node-sql-parser';
import { VALID_HTTP_METHODS } from '@/constants';

const parser = new Parser();

/**
 * A drop-in replacement for `clsx` that merges tailwind class names first.
 * This is useful when you want to conditionally apply a tailwind class, but
 * also use a utility class from a third-party library.
 *
 * @example
 * import { cn } from "@/lib/utils"
 *
 * function MyButton({ className }: {
 *   className?: ClassName
 * }) {
 *   return <button className={cn("bg-blue-500 hover:bg-blue-700", className)}>
 *     Click me
 *   </button>
 * }
 *
 * @param inputs - The class names to merge
 * @returns The merged class name string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Returns a cryptographically secure random number in [0, 1).
 * Use instead of Math.random() when the value affects security-sensitive behavior.
 * Throws if crypto.getRandomValues is unavailable (avoids insecure Math.random() fallback).
 */
export function getSecureRandom(): number {
    const array = new Uint32Array(1);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
    }
    throw new Error('getSecureRandom: crypto.getRandomValues is not available');
}

/** Returns the submit button label for create/edit forms (Saving | Update | Create). */
export function getSubmitButtonLabel(isSaving: boolean, isEdit: boolean): string {
    if (isSaving) return 'Saving';
    if (isEdit) return 'Update';
    return 'Create';
}

/**
 * Renders a React icon element with specified size and additional properties.
 *
 * @param {React.ReactNode} icon - The React icon element to be rendered.
 * @param {number} size - The size to be applied to the icon.
 * @returns {React.ReactElement | null} The cloned React element with the specified properties, or null if no icon is provided.
 */
export const renderIcon = (icon: React.ReactNode, size: number, classNames?: string, stroke?: number) => {
    if (!icon) return null;
    return React.cloneElement(icon as React.ReactElement, {
        size: size,
        className: cn('shrink-1', classNames),
        strokeWidth: stroke ?? 2,
    });
};

export const goFullScreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
};

export const getFirstTwoInitials = (username: string): string => {
    const cleanName = username.split('@')[0].replaceAll(/[^a-zA-Z0-9]/g, '');
    return cleanName.substring(0, 2).toUpperCase();
};

/**
 * Converts a number into a human-readable string with appropriate unit scaling.
 * Handles unit conversions for storage sizes (e.g., bytes, kilobytes) and scales numbers for more compact representation.
 *
 * @param {number} num - The number to be converted.
 * @param {UnitType} inputType - The unit input Type for the number (e.g., BYTE, KILOBYTE, MEGABYTE, etc.).
 * @param {UnitType} outputType - The unit output Type for the number (e.g., BYTE, KILOBYTE, MEGABYTE, etc.).
 * @param {UsageUnitType} usageUnitType - Specifies the context of usage (e.g., DATA).
 * @param {string} [prefix='K'] - A string to represent the unit suffix, default is 'K'.
 * @returns {UnitPrefix} The formatted number as a type with the appropriate unit prefix.
 */
export const formatToShortenedUnit = (
    num: number,
    inputType: UnitType,
    outputType: UnitType,
    usageUnitType: UsageUnitType,
    prefix?: UnitPrefix
): string => {
    const _prefix = prefix ?? UnitPrefix.K;

    const unitMap: { [key in UnitType]: number } = {
        [UnitType.BYTE]: 1,
        [UnitType.KILOBYTE]: 1e3,
        [UnitType.MEGABYTE]: 1e6,
        [UnitType.GIGABYTE]: 1e9,
        [UnitType.TERABYTE]: 1e12,
        [UnitType.DEFAULT]: 1,
    };

    if (!unitMap[inputType] && usageUnitType === UsageUnitType.SIZE) {
        return '0';
    }

    if (_prefix === UnitPrefix.COUNT) {
        const inputUnit = unitMap[inputType];
        if (!inputUnit) return '0';

        const outputUnit = unitMap[outputType] || 1;
        return ((num * inputUnit) / outputUnit).toString();
    }

    if (usageUnitType === UsageUnitType.SIZE) {
        const inputUnit = unitMap[inputType];
        if (!inputUnit) return '0';

        const outputUnit = unitMap[outputType] || 1;
        const convertedValue = (num * inputUnit) / outputUnit;

        const trimTrailingZeros = (s: string) => {
            if (!s.includes('.')) return s;
            let i = s.length - 1;
            while (i >= 0 && s[i] === '0') i--;
            if (s[i] === '.') i--;
            return s.slice(0, i + 1);
        };
        return trimTrailingZeros(convertedValue.toFixed(2)).concat(
            (() => {
                if (_prefix === UnitPrefix.DEFAULT) return '';
                if (_prefix === UnitPrefix.OUTPUT) return outputType.toString();
                return _prefix.toString() ?? outputType.toString();
            })()
        );
    }

    if (_prefix === UnitPrefix.DEFAULT) {
        return num.toString();
    }

    return (num / 1000).toFixed(2).replace(/\.00$/, '') + _prefix;
};

/**
 * Rounds a number to a specified number of decimal places and removes trailing zeroes if applicable.
 *
 * @param num - The number to round.
 * @param fixValue - The number of decimal places to round to (default is 2).
 * @returns A string representation of the number rounded to the specified decimal places, with trailing zeros removed.
 * @example
 * roundedDecimalPlaces(3.14159) // Returns "3.14"
 * roundedDecimalPlaces(5) // Returns "5"
 * roundedDecimalPlaces(3.00) // Returns "3"
 * roundedDecimalPlaces(10.123456, 4) // Returns "10.1235"
 */
export const roundedDecimalPlaces = (num: number, fixValue = 2) => {
    return num.toFixed(fixValue).replace(/\.00$/, '');
};

/**
 * Converts a month name to its three-letter abbreviation.
 *
 * @param month - The name of the month to convert
 * @returns The three-letter abbreviation of the month name
 * @example
 * convertToShortMonth("January") // Returns "Jan"
 * convertToShortMonth("FEBRUARY") // Returns "Feb"
 * convertToShortMonth("march") // Returns "mar"
 */
export const convertToShortMonth = (month: string): string => month.slice(0, 3);

/**
 * Converts a month number to its full month name.
 *
 * @param month - The numeric representation of the month (1 for January, 2 for February, etc.)
 * @returns The full name of the month corresponding to the given number
 * @example
 * convertToFullMonth(1) // Returns "January"
 * convertToFullMonth(3) // Returns "March"
 * convertToFullMonth(12) // Returns "December"
 */
export const convertToFullMonth = (month: number): string => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('en-US', { month: 'long' });
};

/**
 * Groups an array of `OverallUsage` objects by their month and year.
 *
 * @param data - An array of `OverallUsage` objects, each containing month and year properties.
 * @returns A record object where the keys are in the format "month-year", and the values are arrays of `OverallUsage` objects that fall under that specific month and year.
 * @example
 * groupByMonthAndYear([
 *   { month: 1, year: 2025, value: 100 },
 *   { month: 1, year: 2025, value: 200 },
 *   { month: 2, year: 2025, value: 150 }
 * ])
 * // Returns:
 * // {
 * //   "1-2025": [
 * //     { month: 1, year: 2025, value: 100 },
 * //     { month: 1, year: 2025, value: 200 }
 * //   ],
 * //   "2-2025": [
 * //     { month: 2, year: 2025, value: 150 }
 * //   ]
 * // }
 */
export const groupByMonthAndYear = (data: OverallUsage[]) => {
    return data.reduce(
        (result, item) => {
            const key = `${item.month}-${item.year}`;
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        },
        {} as Record<string, OverallUsage[]>
    );
};

/**
 * Converts a string into snake_case format by replacing non-alphanumeric characters with underscores
 * and converting all letters to lowercase.
 *
 * @param {string} str - The input string to be converted into snake_case.
 * @returns {string} The string converted to snake_case format.
 */
export const convertToSnakeCase = (str: string) => {
    if (str) {
        return str
            .split(/[^a-zA-Z0-9]/)
            .map(word => word.toLowerCase())
            .join('_');
    }
    return str;
};

export const getWorkspacePath = (url: string, workspaceId?: string) => {
    return url.replace('[wid]', workspaceId ?? '[wid]');
};

/**
 * Generates the nearest top value for a given number based on the specified usage type.
 * The function rounds the input number according to specific rules defined for each usage type
 * (STORAGE, CREDITS, TOKENS) and ensures the result is not below a minimum value.
 *
 * @param {number} num - The number to be rounded to the nearest top value.
 * @param {OverallUsageType} type - The usage type (STORAGE, CREDITS, TOKENS) determining the rounding behavior.
 * @returns {number} The rounded number, adjusted to ensure it meets the minimum value for the specified usage type.
 */
export const generateNearestChartTopValue = (num: number, type: OverallUsageType): number | undefined => {
    const minimumValuesMap: Record<OverallUsageType, number> = {
        [OverallUsageType.STORAGE]: 1,
        [OverallUsageType.CREDITS]: 3,
        [OverallUsageType.TOKENS]: 30,
    };

    const minimumValue = minimumValuesMap[type] ?? 30;
    const value = Number.parseFloat(roundedDecimalPlaces(num));

    if (value === 0) {
        return minimumValue * 4;
    } else if (num <= minimumValue) {
        return Number.isInteger(num) ? Math.ceil(num) * 4 : num * 4;
    }

    return undefined;
};

/**
 * Converts a number to a shortened format with a "K" suffix for thousands.
 * The function divides the input number by 1000, rounds it to two decimal places,
 * and appends a "K" suffix. If the decimal part is ".00", it is removed to provide
 * a cleaner, more readable output.
 *
 * @param {number} num - The number to be formatted.
 * @returns {string} A string representing the number in a shortened format with a "K" suffix.
 */
export const formatNumberToK = (num: number) => {
    return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K';
};

/**
 * Converts a number into a shortened format by dividing it by 1000,
 * rounding to two decimal places, and removing the decimal part if it’s ".00".
 * This function is meant to be used when the "K" suffix is added separately elsewhere.
 *
 * @param {number} num - The number to be formatted.
 * @returns {string} The formatted number in a shortened format, such as "1.23" or "5".
 */
export const divideByThousand = (num: number) => {
    const value = (num / 1000).toFixed(2).replace(/\.00$/, '');
    return Number.parseFloat(value) ?? 0;
};

/**
 * Generates a random hex color code between two specified colors by
 * interpolating their RGB components. The function returns a hex color
 * code that is a blend of the two colors in the form of a string
 * (e.g., "#1e428a" or "#6194fa").
 *
 * @returns {string} The random hex color code between the specified colors.
 */
export const generateRandomHexColor = () => {
    const color1 = { r: 97, g: 148, b: 250 };
    const color2 = { r: 30, g: 66, b: 138 };

    const r = Math.floor(getSecureRandom() * (color1.r - color2.r + 1)) + color2.r;
    const g = Math.floor(getSecureRandom() * (color1.g - color2.g + 1)) + color2.g;
    const b = Math.floor(getSecureRandom() * (color1.b - color2.b + 1)) + color2.b;
    const hex = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;

    return hex;
};

/**
 * Generates a random hex color code that adapts to the current theme (dark or light)
 * and avoids previously used colors. The function generates random RGB values within a range
 * that ensures the color is either darker (for light theme) or lighter (for dark theme).
 * It checks that the generated color is not a grayscale color and ensures that it is not
 * in the list of recently used colors.
 *
 * @param {boolean} isDarkTheme - Flag indicating whether the current theme is dark (true) or light (false).
 * @param {Array<string>} recentColors - An array of previously used hex color codes that should be avoided.
 * @returns {string} The random hex color code in the format of "#RRGGBB", ensuring it is theme-appropriate and unique.
 */
export const generateRandomThemeBasedHexColor = (isDarkTheme = false, recentColors: string[] = []) => {
    const mainColors = [
        { name: 'Red', hex: '#FF0000' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Green', hex: '#008000' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Teal', hex: '#008080' },
        { name: 'Brown', hex: '#A52A2A' },
        { name: 'Cyan', hex: '#00FFFF' },
        { name: 'Magenta', hex: '#FF00FF' },
        { name: 'Indigo', hex: '#4B0082' },
        { name: 'Lime', hex: '#00FF00' },
        { name: 'Violet', hex: '#EE82EE' },
        { name: 'Turquoise', hex: '#40E0D0' },
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Peach', hex: '#FFDAB9' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adjustColorForDarkTheme = (colorHex: any) => {
        if (isDarkTheme) {
            const color = Number.parseInt(colorHex.slice(1), 16);
            let r = (color >> 16) & 0xff;
            let g = (color >> 8) & 0xff;
            let b = color & 0xff;

            r = Math.max(0, r - 60);
            g = Math.max(0, g - 60);
            b = Math.max(0, b - 60);

            return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
        }
        return colorHex;
    };

    let hexColor;

    do {
        const randomColor = mainColors[Math.floor(getSecureRandom() * mainColors.length)];

        hexColor = adjustColorForDarkTheme(randomColor.hex);
    } while (recentColors.includes(hexColor));

    return hexColor;
};

/**
 * Checks if a given value is null, undefined, or empty. For string values,
 * it returns true if the string is empty or contains only whitespace. For number
 * values, it returns true if the value is NaN. The function handles `null` and
 * `undefined` explicitly and works for both numbers and strings.
 *
 * @param {number | string | null | undefined} value The value to check.
 * @returns {boolean} True if the value is null, undefined, an empty string, or NaN.
 */
export const isNullOrEmpty = (value: number | string | null | undefined): boolean => {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'number') {
        return Number.isNaN(value);
    }

    if (typeof value === 'string') {
        return value.trim().length === 0;
    }

    return false;
};

/**
 * Removes the 's' from a time string and converts the remaining value
 * into a floating-point number. This function is useful for processing
 * time durations provided as strings (e.g., "55.62951157200382s").
 *
 * @param {string} timeString The string representing time with 's' at the end (e.g., "55.62951157200382s").
 * @returns {number} The time as a floating-point number, or NaN if the input is invalid.
 */
export const parseTimeInSeconds = (timeString: string) => {
    if (typeof timeString === 'string' && timeString.endsWith('s')) {
        const numericValue = Number.parseFloat(timeString.replace('s', ''));
        return Number.isNaN(numericValue) ? Number.NaN : numericValue;
    }
    return Number.NaN;
};

/**
 * Returns a hyphen ('-') if the provided value is null, undefined, or an empty string.
 * Otherwise, it returns the original value.
 * This function is useful when you need to handle empty or missing values
 * and represent them as a hyphen instead of an empty string or null.
 *
 * @param {number | string | null | undefined} value The value to check and possibly replace with '-'.
 * @returns {string | number} The original value if not null, undefined, or empty, or a hyphen ('-') if the value is invalid.
 */
export const handleNoValue = (value: number | string | null | undefined, prefix = '-'): string | number => {
    if (isNullOrEmpty(value)) {
        return '-';
    }

    return value ?? prefix;
};

export const hexToRgba = (hex: string, opacity = 0.6) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map(x => x + x)
            .join('');
    }

    const bigint = Number.parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Validates whether a given string is a properly formatted URL.
 * This function checks for common URL format issues such as missing protocol, invalid domain patterns,
 * or unwanted leading/trailing spaces. It is useful for form validation or data input checks
 * where a valid URL is required.
 *
 * @param {string | undefined} value The URL string to validate.
 * @param {string} field The name of the field being validated (used in error messages).
 * @returns {true | string} Returns `true` if the URL is valid. Otherwise, returns an error message
 * indicating the specific validation issue.
 */
export const validateUrl = (value: string | undefined, field: string) => {
    if (value) {
        if (value.startsWith(' ')) {
            return `No leading spaces in ${field}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${field}`;
        }
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
            return `Invalid URL format in ${field}`;
        }
    }
    return true;
};

export const validatePhone = (value: string | undefined, field: string) => {
    if (value) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value)) {
            return `Invalid ${field} format (e.g. +1234567890)`;
        }
    }
    return true;
};

/**
 * Validates whether a given string contains unwanted leading or trailing spaces.
 * This function is useful for form validation or input sanitization, ensuring that
 * user-provided values do not start or end with whitespace, which can cause subtle bugs
 * or formatting issues.
 *
 * @param {string | undefined} value The input string to validate.
 * @param {string} field The name of the field being validated (used in error messages).
 * @returns {true | string} Returns `true` if the input has no leading or trailing spaces.
 * Otherwise, returns an error message indicating the specific validation issue.
 */
export const validateSpaces = (value: string | undefined, field: string) => {
    if (value) {
        if (value.startsWith(' ')) {
            return `No leading spaces in ${field}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${field}`;
        }
    }
    return true;
};

/**
 * Normalizes a given string into a safe and standardized function name format.
 *
 * This is useful for generating valid identifiers from user input, such as
 * converting labels or names into code-safe function names. It removes all
 * non-alphanumeric characters (except underscores), converts the string to
 * lowercase, replaces consecutive underscores with a single one, and trims
 * leading/trailing underscores.
 *
 * @param {string | undefined} input - The input string to convert.
 * @returns {string | undefined} - A sanitized function name string or `undefined` if input was `undefined`.
 */
export const toFunctionName = (input: string | undefined) => {
    if (input) {
        return input
            .replaceAll(/\W/g, '_')
            .toLowerCase()
            .replaceAll(/_+/g, '_')
            .replaceAll(/(?:^_|_$)/g, '');
    }
    return input;
};

/**
 * Resolves a query trigger condition, defaulting to `true` if the input is `undefined`.
 *
 * This is useful when `undefined` should be interpreted as an affirmative (truthy) value.
 *
 * @param {boolean | undefined} triggerQuery - The input condition to evaluate.
 * @returns {boolean} - Returns `true` if the input is `undefined`, otherwise returns the input value.
 */
export const resolveTriggerQuery = (triggerQuery: boolean | undefined): boolean => {
    return triggerQuery ?? true;
};

/**
 * Converts a file size in bytes to a human-readable string format.
 *
 * This utility is useful for displaying file sizes in a more understandable format
 * such as B (bytes), KB (kilobytes), or MB (megabytes), based on the value of the input.
 *
 * - If the file size is less than 1024 bytes, it returns the size in bytes (e.g., "512 B").
 * - If the file size is between 1 KB and 1 MB, it returns the size in kilobytes with one decimal point (e.g., "1.5 KB").
 * - If the file size is 1 MB or more, it returns the size in megabytes with one decimal point (e.g., "2.3 MB").
 *
 * @param {number} bytes - The file size in bytes.
 * @returns {string} A human-readable string representing the file size.
 */
export const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Converts a date string into a formatted date-time string ("YYYY-MM-DD HH:mm").
 *
 * This utility is useful for standardizing date-time representations,
 * especially when displaying timestamps in user interfaces or reports.
 *
 * - Accepts a date string that can be parsed by the JavaScript `Date` constructor.
 * - Uses the Moment.js library to format the date into "YYYY-MM-DD HH:mm" format.
 * - If the input date is falsy (e.g., `null`, `undefined`, or an empty string), the original value is returned.
 *
 * Example output for input "2025-06-13T14:25:00Z": "2025-06-13 14:25"
 *
 * @param {string} date - The input date string to be formatted.
 * @returns {string} A formatted date-time string or the original input if invalid.
 */
export const convert_YYYY_MM_DD_HH_MM = (date: string) => {
    if (date) {
        return moment(new Date(date)).format('YYYY-MM-DD HH:mm');
    }
    return date;
};

export const convertStringListToDropdown = (list: string[]): OptionModel[] => {
    return (
        list?.map(item => ({
            name: item,
            value: item,
        })) ?? []
    );
};

/**
 * Normalizes an accept value (string or string[]) into a lowercase token array.
 * Example inputs: '.json,.yaml', ['application/json', '.yml']
 */
export const normalizeAccept = (accept?: string | string[]): string[] => {
    if (!accept) return [];
    return (Array.isArray(accept) ? accept : accept.split(',')).map(t => t.trim().toLowerCase()).filter(Boolean);
};

/**
 * Returns true if a File matches any of the provided accept tokens.
 * Supports extension tokens (e.g., '.json') and MIME fragments (e.g., 'application/json', 'text/yaml').
 */
export const isFileAccepted = (file: File, acceptTokens: string[]): boolean => {
    if (!acceptTokens?.length) return true;
    const name = (file?.name ?? '').toLowerCase();
    const type = (file?.type ?? '').toLowerCase();
    const ext = name.includes('.') ? `.${name.split('.').pop()}` : '';
    return acceptTokens.some(token => {
        if (!token) return false;
        if (token.startsWith('.')) return token === ext;
        return type.includes(token);
    });
};

/**
 * Partitions files into accepted and rejected arrays based on accept tokens.
 */
export const partitionFilesByAccept = (
    files: File[],
    accept?: string | string[]
): { accepted: File[]; rejected: File[] } => {
    const tokens = normalizeAccept(accept);
    const accepted: File[] = [];
    const rejected: File[] = [];
    files.forEach(f => (isFileAccepted(f, tokens) ? accepted.push(f) : rejected.push(f)));
    return { accepted, rejected };
};

/**
 * Retrieves the key from a string enum corresponding to the given value.
 *
 * @param {string} value - The value to search for within the enum.
 * @param {{ [key: string]: string }} enumObj - The enum object to search.
 * @returns {string | undefined} The matching enum key as a string, or undefined if no match is found.
 */
export const getEnumKeyByValue = (value: string, enumObj: { [key: string]: string }): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Object.entries(enumObj).find(([_, val]) => val === value)?.[0];
};

/**
 * Retrieves the value from a string enum corresponding to the given key.
 *
 * @param {string} key - The key to look up in the enum.
 * @param {{ [key: string]: string }} enumObj - The enum object to search.
 * @returns {string | undefined} The corresponding enum value, or undefined if the key does not exist.
 */
export const getEnumValueByKey = (key: string, enumObj: { [key: string]: string }): string | undefined => {
    return enumObj[key];
};

/**
 * Returns the key of an enum object that corresponds to the given value.
 *
 * @template T - The type of the enum object, which must have string or number values.
 * @param enumObj - The enum object to search.
 * @param value - The value to find the corresponding key for.
 * @returns The key of the enum object whose value matches the provided value, or `undefined` if not found.
 */
export function getEnumKeyByValueV2<T extends Record<string, string | number>>(
    enumObj: T,
    value: string | number
): keyof T | undefined {
    return (Object.keys(enumObj) as Array<keyof T>).find(key => enumObj[key] === value);
}

/**
 * Ensures a required field has value and meets an optional minimum length.
 * Returns true when valid or a user-friendly error string.
 */
export const validateRequired = (value: string | undefined, field: string, minLength = 1) => {
    const v = (value ?? '').trim();
    if (v.length === 0) return `Please enter ${field}`;
    if (minLength > 1 && v.length < minLength) return `${field} must be at least ${minLength} characters`;
    return true;
};

/**
 * Validates HTTP method selection against allowed methods.
 * Returns true when valid or a user-friendly error string.
 */
export const validateHttpMethod = (value: string | undefined, field = 'API Method') => {
    const v = (value ?? '').toUpperCase().trim();
    if (!v) return `Please select ${field}`;
    if (!VALID_HTTP_METHODS.includes(v as (typeof VALID_HTTP_METHODS)[number])) return `Invalid ${field}`;
    return true;
};

/**
 * Sanitizes the input value of a text field to only allow digits and a single leading minus sign.
 *
 * This function is intended to be used as an input event handler. It modifies the value of the input field
 * by removing all non-digit and non-minus characters, and ensures that a minus sign (if present)
 * only appears at the beginning of the value.
 *
 * @param {FormEvent<HTMLInputElement>} e - The input event triggered by the user.
 */
export const sanitizeNumericInput = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value;
    val = val.replaceAll(/[^\d-]/g, '').replaceAll(/(?!^)-/g, '');

    e.currentTarget.value = val;
};

/**
 * Compares two objects deeply to check if they are equal.
 *
 * This function uses Lodash's _.isEqual to determine whether
 * the two provided values are deeply equivalent.
 *
 * @param {any} obj1 - The first object to compare.
 * @param {any} obj2 - The second object to compare.
 * @returns {boolean} True if objects are equal, false otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const areObjectsEqual = (obj1: any, obj2: any): boolean => {
    return _.isEqual(obj1, obj2);
};

/**
 * Calculate the next version number based on release type.
 *
 * @param version - Current version as number (e.g., 1, 1.2, 1.2.3)
 * @param releaseType - Type of release: MAJOR, MINOR, PATCH
 * @returns number - New version as number
 */
export const getNextVersionNumber = (version: string | undefined, releaseType: PackageReleaseType): string => {
    if (!version) {
        switch (releaseType) {
            case PackageReleaseType.Major:
                return '1.0.0';
            case PackageReleaseType.Minor:
                return '0.1.0';
            case PackageReleaseType.Patch:
                return '0.0.1';
            default:
                return '1.0.0';
        }
    }

    const parts = version.toString().split('.').map(Number);

    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;

    switch (releaseType) {
        case PackageReleaseType.Major:
            return `${major + 1}.0.0`;
        case PackageReleaseType.Minor:
            return `${major}.${minor + 1}.0`;
        case PackageReleaseType.Patch:
            return `${major}.${minor}.${patch + 1}`;
        default:
            return version;
    }
};

/**
 * Converts a date string into a formatted date-time string ("MMM DD, YYYY").
 *
 * This utility is useful for standardizing date-time representations,
 * especially when displaying timestamps in user interfaces or reports.
 *
 * - Accepts a date string that can be parsed by the JavaScript `Date` constructor.
 * - Uses the Moment.js library to format the date into "MMM DD, YYYY" format.
 * - If the input date is falsy (e.g., `null`, `undefined`, or an empty string), the original value is returned.
 *
 * Example output for input "2025-06-13T14:25:00Z": "Jul 25, 2025"
 *
 * @param {string} date - The input date string to be formatted.
 * @returns {string} A formatted date-time string or the original input if invalid.
 */
export const convert_MMM_DD_YYYY = (date: string) => {
    if (date) {
        return moment(new Date(date)).format('MMM DD, YYYY');
    }
    return date;
};

/**
 * Formats a valid ISO 8601 date string into a human-readable timestamp.
 *
 * This utility is useful for displaying execution times in user interfaces or logs,
 * ensuring consistency and readability in date-time formats.
 *
 * - Validates the input using Moment.js strict ISO 8601 parsing.
 * - Returns a formatted string like: "Executed on April 22 2025 at 08:30:22".
 * - Optionally prepends a label (e.g., "Executed on", "Started at").
 *
 * Example:
 * formatExecutionTimestamp("2025-04-22T08:30:22Z", "Executed on")
 * → "Executed on April 22 2025 at 08:30:22"
 *
 * @param {string} date - The ISO 8601 date string to format.
 * @param {string} [label] - Optional label to prepend to the formatted date.
 * @returns {string | undefined} A formatted string if the date is valid, otherwise `undefined`.
 */
export const formatExecutionTimestamp = (date: string, label?: string) => {
    if (date && moment(date, moment.ISO_8601, true).isValid()) {
        const _date = moment.utc(date).local();
        return `${label ?? ''} ${_date.format('MMMM D YYYY')} at ${_date.format('HH:mm:ss')}`.trim();
    }
    return undefined;
};

/**
 * Converts an IDataLineageFilter object into a URL query string.
 *
 * Only defined and non-empty values are included in the result.
 *
 * @param {IDataLineageFilter} filter - The filter object to convert.
 * @returns {string} A properly encoded query string (e.g., "workflowName=ETL&startDate=2025-08-10")
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toQueryParams = (filter: object | undefined): string | undefined => {
    if (!filter) return undefined;
    const params = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
        if (value && value !== '') {
            params.append(key, value);
        }
    });

    if (params.size > 0) return params.toString();
    return undefined;
};

/**
 * Validates whether a given string is a properly structured JSON object.
 *
 * This utility is useful for parsing and validating user-defined templates or
 * dynamic content structures that include JSON-like objects, optionally containing
 * placeholders like `{{Variable:...}}` or `{{Metadata:...}}`.
 *
 * - Replaces known placeholders with safe strings to allow JSON parsing.
 * - Ensures the string is a valid JSON object (not an array or null).
 * - Enforces that all object keys are enclosed in double quotes.
 * - Requires the object to have at least one property.
 *
 * Returns `true` if the structure is valid, otherwise returns a descriptive error message.
 *
 * Example:
 * validateJsonStructure('{name: "{{Variable:userName}}", age: 25}')
 * → "All property keys must be enclosed in double quotes"
 *
 * validateJsonStructure('{"name": "{{Variable:userName}}", "age": 25}')
 * → true
 *
 * @param {string} value - The string representing a JSON-like object to validate.
 * @returns {true | string} Returns `true` if valid, or an error message if invalid.
 */
export const validateJsonStructure = (value: string, allowArray?: boolean) => {
    // 1. Clean placeholders
    // Handle quoted placeholders first to avoid double-quoting them (e.g., "{{Variable:x}}" -> "__placeholder__")
    let cleaned = value.replaceAll(
        /"\{\{(?:Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):[^{}]+\}\}"/g,
        '"__placeholder__"'
    );
    // Handle remaining unquoted placeholders (e.g., {{Variable:x}} -> "__placeholder__")
    cleaned = cleaned.replaceAll(
        /\{\{(?:Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):[^{}]+\}\}/g,
        '"__placeholder__"'
    );
    // Handle quoted unwrapped placeholders (e.g., "Variable:x" -> "__placeholder__")
    cleaned = cleaned.replaceAll(
        /"(?:Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):[\w-]+"/g,
        '"__placeholder__"'
    );
    // Handle unquoted unwrapped placeholders (e.g., "var_value": Variable:x)
    cleaned = cleaned.replaceAll(
        /(?<!")\b(?:Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):[\w-]+(?!")/g,
        '"__placeholder__"'
    );

    try {
        // 2. Check for unquoted keys (using existing regex logic)
        const unquotedKeyPattern = /([{,]\s*)(\w+)(\s*):/g;
        if ([...cleaned.matchAll(unquotedKeyPattern)].length > 0) {
            return 'All property keys must be enclosed in double quotes';
        }

        const parsed = JSON.parse(cleaned);

        // 4. Validate structure (Object or Array)
        if (allowArray && Array.isArray(parsed)) {
            if (parsed.length === 0) return 'Array must contain at least one object';
            const allObjectsValid = parsed.every(
                item =>
                    typeof item === 'object' && item !== null && !Array.isArray(item) && Object.keys(item).length > 0
            );
            if (!allObjectsValid) return 'Each array item must be a non-empty object';
            return true;
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return allowArray ? 'Structure should be an object or array' : 'Structure should be an object';
        }

        if (Object.keys(parsed).length === 0) {
            return 'Object must have at least one property';
        }

        return true;
    } catch {
        return 'Please enter a valid JSON object';
    }
};

/**
 * Validates a string representing a host and port in the format `host:port`.
 *
 * Supports:
 * - Domain names (e.g., `example.com`)
 * - Localhost (`localhost`)
 * - IPv4 addresses (e.g., `192.168.0.1`)
 *
 * Port must be a number between 1 and 65535. Format must not include protocols (e.g., `http://`).
 *
 * Example:
 * validateHostPort('localhost:3000')
 * → true
 *
 * validateHostPort('192.168.1.1:70000')
 * → "Port must be between 1 and 65535"
 *
 * validateHostPort('http://localhost:3000')
 * → "Invalid host and port format."
 *
 * @param {string} value - The input string in `host:port` format.
 * @returns {true | string} Returns `true` if valid, otherwise returns an error message.
 */
export const validateHostPort = (value: string | undefined) => {
    if (!value) return 'Please enter a Host with Port Number';

    const match = /^((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost|(\d{1,3}\.){3}\d{1,3}):(\d{1,5})$/.exec(value);
    if (!match) {
        return 'Invalid host and port format';
    }

    const port = Number.parseInt(match[5], 10);
    if (port < 1 || port > 65535) {
        return 'Port must be between 1 and 65535';
    }

    return true;
};

/**
 * Validates whether a given string is a properly formatted URL.
 * Accepts localhost, domains, and IP addresses, with optional ports (1–65535).
 *
 * @param {string | undefined} value The URL string to validate.
 * @param {string} field The name of the field being validated (used in error messages).
 * @returns {true | string} Returns `true` if the URL is valid. Otherwise, returns an error message.
 */
const validateHostname = (url: URL): boolean => {
    return (
        url.hostname === 'localhost' ||
        /^[a-zA-Z0-9.-]+$/.test(url.hostname) ||
        /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)
    );
};

const validatePort = (url: URL): string | undefined => {
    if (url.port) {
        const portNum = Number(url.port);
        if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
            return 'Port must be between 1 and 65535';
        }
    }
    return undefined;
};

const validatePath = (url: URL, field: string): string | undefined => {
    if (url.pathname && url.pathname !== '' && url.pathname !== '/') {
        return `URL in ${field} should not have a path`;
    }
    return undefined;
};

export const validateUrlWithPort = (value: string | undefined, field: string) => {
    if (!value) return `Please enter ${getArticle(field.toLowerCase())} ${field}`;

    if (value.startsWith(' ')) return `No leading spaces in ${field}`;
    if (value.endsWith(' ')) return `No trailing spaces in ${field}`;
    if (!value.startsWith('http://') && !value.startsWith('https://')) return `Invalid URL format in ${field}`;

    try {
        const url = new URL(value);

        if (!validateHostname(url)) return `Invalid hostname in ${field}`;

        const portError = validatePort(url);
        if (portError) return portError;

        const pathError = validatePath(url, field);
        if (pathError) return pathError;

        const lastChar = value.at(-1);
        if (lastChar === '/') return `URL in ${field} should not end with a slash`;

        return true;
    } catch {
        return `Invalid URL in ${field}`;
    }
};

/**
 * Checks if a URL contains path parameters in the form of `{param}`.
 *
 * Path parameters are often used in OpenAPI-style routes (e.g., "/users/{userId}").
 *
 * @param {string | undefined} url - The URL string to check.
 * @returns {boolean} True if the URL contains path parameters, false otherwise.
 */
export const hasPathParam = (url: string | undefined): boolean => {
    if (!url) return false;
    const open = url.indexOf('{');
    if (open === -1) return false;
    const close = url.indexOf('}', open);
    return close !== -1 && close > open + 1;
};

/**
 * Bulk Import API URL Validation
 * Validates API endpoint URL for bulk import functionality
 */
export const validateApiUrl = (value: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return 'Endpoint URL is required.';

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    // Must be a valid absolute URL
    if (!v.startsWith('http://') && !v.startsWith('https://')) {
        return 'Endpoint must be a full URL.';
    }

    // Only validate for obvious issues
    if (v.includes(' ')) {
        return 'Endpoint URL cannot contain spaces';
    }

    // Check for obviously invalid patterns
    if (v.includes('..') || (v.includes('//') && !v.startsWith('http'))) {
        return 'Invalid URL pattern';
    }

    // Validate URL format
    try {
        new URL(v);
    } catch {
        return 'Please enter a valid URL format';
    }

    return true;
};

/**
 * Bulk Import Header Name/Value Validation
 * Validates header names and values for bulk import
 * If headerName parameter is provided (for value validation), it makes the value required when name exists
 */
/**
 * Helper: Validates a header value when a header name is provided.
 */
const validateHeaderValueLogic = (value: string, headerName: string | undefined): true | string => {
    // If headerName has a value, the corresponding value field becomes mandatory
    if (headerName?.trim() && !value) {
        return 'Value is required when Header Name is provided.';
    }
    return true;
};

/**
 * Helper: Validates a basic field for requirements and length.
 */
const validateBasicFieldLogic = (
    value: string,
    fieldName: string,
    isRequired: boolean,
    isValueField: boolean,
    headerName: string | undefined
): true | string => {
    // If required, check for empty value
    if (isRequired && !value) {
        return `${fieldName} is required.`;
    }

    // If not required and empty, skip other validations
    // specific logic for value field: if it is a value field, no header name is present, and value is empty -> valid
    if (!isRequired && !value && !isValueField) return true;
    if (isValueField && !headerName?.trim() && !value) return true;

    // Character length validation (2-255)
    if (value.length < 1) {
        return `${fieldName} must be at least 2 characters long.`;
    }
    if (value.length > 255) {
        return `${fieldName} must be no more than 255 characters long.`;
    }

    return true;
};

/**
 * Bulk Import Header Name/Value Validation
 * Validates header names and values for bulk import
 * If headerName parameter is provided (for value validation), it makes the value required when name exists
 */
export const validateHeaderField = (
    value: string | undefined,
    fieldName: string,
    isRequiredOrHeaderName: boolean | string = false
) => {
    const v = (value ?? '').trim();

    // If third parameter is a string, it's the headerName (for value field validation)
    const isValueField = typeof isRequiredOrHeaderName === 'string';
    const headerName = isValueField ? isRequiredOrHeaderName : undefined;
    const isRequired = isValueField ? false : isRequiredOrHeaderName;

    // Special handling for value field: if headerName has value, value is mandatory
    if (isValueField) {
        const valueValidation = validateHeaderValueLogic(v, headerName);
        if (valueValidation !== true) return valueValidation;
    }

    // Basic validation (required check, length check)
    const basicValidation = validateBasicFieldLogic(v, fieldName, isRequired, isValueField, headerName);
    if (basicValidation !== true) return basicValidation;

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    return true;
};

/**
 * Bulk Import Description Validation
 * Validates description field for bulk import
 */
export const validateApiDescription = (value: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return 'Description is required.';

    // Character length validation (5-2000)
    if (v.length < 5) {
        return 'Description must be at least 5 characters long.';
    }
    if (v.length > 2000) {
        return 'Description must be no more than 2000 characters long.';
    }

    return true;
};

/**
 * Bulk Import Parameter Name Validation
 * Validates parameter names for input parameters in bulk import
 */
export const validateParameterName = (value: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return 'Parameter name is required.';

    // Character length validation (2-255)
    if (v.length < 2) {
        return 'Parameter name must be at least 2 characters long.';
    }
    if (v.length > 255) {
        return 'Parameter name must be no more than 255 characters long.';
    }

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    return validateIdentifier(v, 'parameter name');
};

/**
 * Bulk Import Parameter Description Validation
 * Validates parameter descriptions for input parameters in bulk import
 */
export const validateParameterDescription = (value: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return 'Parameter description is required.';

    // Character length validation (5-2000 chars) - matching API description requirements
    if (v.length < 5) {
        return 'Parameter description must be at least 5 characters long.';
    }
    if (v.length > 2000) {
        return 'Parameter description cannot exceed 2000 characters.';
    }

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    return true;
};

/**
 * Bulk Import Parameter Value Validation
 * Validates parameter values with type checking for input parameters in bulk import
 * This validation is used for the "Parameter Value" field shown during API testing
 */
const validateInteger = (v: string): string | true => {
    if (!/^-?\d+$/.test(v)) {
        return 'Value must be an integer (e.g., 123, -456).';
    }
    // Check for integer overflow (JavaScript safe integer range)
    const intValue = Number.parseInt(v, 10);
    if (!Number.isSafeInteger(intValue)) {
        return 'Integer value is too large.';
    }
    return true;
};

const scanDigits = (s: string, i: number): number => {
    while (i < s.length && s[i] >= '0' && s[i] <= '9') i++;
    return i;
};

const isValidFloatFormat = (s: string): boolean => {
    if (s.length === 0) return false;
    let i = 0;
    if (s[i] === '-' || s[i] === '+') i++;
    let i2 = scanDigits(s, i);
    let hasDigit = i2 > i;
    i = i2;
    if (s[i] === '.') {
        i2 = scanDigits(s, i + 1);
        hasDigit = hasDigit || i2 > i + 1;
        i = i2;
    }
    if (i < s.length && (s[i] === 'e' || s[i] === 'E')) {
        i++;
        if (s[i] === '-' || s[i] === '+') i++;
        i2 = scanDigits(s, i);
        if (i2 === i) return false;
        i = i2;
    }
    return hasDigit && i === s.length;
};

const validateFloat = (v: string): string | true => {
    if (!isValidFloatFormat(v)) {
        return 'Value must be a valid number (e.g., 123.45, -67.89).';
    }
    const floatValue = Number.parseFloat(v);
    if (!Number.isFinite(floatValue)) {
        return 'Number value is not valid.';
    }
    return true;
};

const validateBoolean = (v: string): string | true => {
    if (!['true', 'false', '0', '1'].includes(v.toLowerCase())) {
        return 'Value must be true, false, 0, or 1 for boolean type.';
    }
    return true;
};

const validateString = (v: string): string | true => {
    // For strings, just check length (reasonable limits for API testing)
    if (v.length > 1000) {
        return 'String value is too long (max 1000 characters).';
    }
    return true;
};

export const validateParameterValue = (value: string | undefined, parameterType: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation when testing APIs
    if (!v) return 'Parameter value is required for testing.';

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    // Type-specific validation based on parameter type
    if (parameterType) {
        switch (parameterType.toLowerCase()) {
            case 'int':
            case 'integer':
                return validateInteger(v);

            case 'float':
            case 'number':
            case 'double':
                return validateFloat(v);

            case 'bool':
            case 'boolean':
                return validateBoolean(v);

            case 'string':
            default:
                return validateString(v);
        }
    }
    return true;
};

/**
 * Bulk Import Header Name Validation
 * Validates header names for API Key authentication in bulk import
 * Used specifically for the "Header Name" field in API Key auth type
 */
export const validateHeaderName = (value: string | undefined) => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return 'Header name is required.';

    // Character length validation (2-255)
    if (v.length < 2) {
        return 'Header name must be at least 2 characters long.';
    }
    if (v.length > 255) {
        return 'Header name must be no more than 255 characters long.';
    }

    // No leading/trailing spaces
    if (value?.startsWith(' ') || value?.endsWith(' ')) {
        return 'Trailing spaces are not allowed.';
    }

    // Valid header name characters (RFC 7230)
    if (!/^[a-zA-Z0-9!#$&'*+.^_|~-]+$/.test(v)) {
        return 'Header name contains invalid characters.';
    }

    return true;
};

/**
 * Bulk Import Vault Key Validation
 * Validates vault key selection for authentication fields requiring secure values
 * Used for password fields, header values, tokens, etc.
 */
export const validateVaultKey = (value: string | undefined, fieldName = 'Vault key') => {
    const v = (value ?? '').trim();

    // Required validation
    if (!v) return `${fieldName} is required.`;

    // Must be a valid vault key identifier (not empty after trim)
    if (v.length === 0) {
        return `Please select a valid ${fieldName.toLowerCase()}.`;
    }

    return true;
};

/**
 * Validates SQL syntax using node-sql-parser.
 * Returns `true` if valid, otherwise `false`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tryParseSqlInDialects = (query: string, dialects: string[]): any => {
    let ast;
    for (const db of dialects) {
        try {
            ast = parser.astify(query, { database: db });
            break;
        } catch {
            // Try next dialect
            continue;
        }
    }
    return ast;
};

export const validateSql = (query?: string, allowedStatements?: string[]): true | string => {
    if (!query || typeof query !== 'string') {
        return 'Query cannot be empty';
    }

    const trimmed = query.trim();
    if (!trimmed) {
        return 'Query cannot be empty';
    }

    try {
        // Clean up {{Variable:...}} etc.
        const cleanedQuery = cleanIntellisenseTokens(trimmed);

        const dialects = ['postgresql', 'mysql', 'sqlite', 'mssql'];

        // Try parsing in multiple dialects
        const ast = tryParseSqlInDialects(cleanedQuery, dialects);

        // If still nothing parsed, it’s invalid
        if (!ast) {
            return 'Please enter a valid SQL query';
        }

        // Optionally, restrict certain statement types:
        if (allowedStatements && allowedStatements?.length > 0) {
            const type = Array.isArray(ast) ? ast[0].type : ast.type;

            if (!allowedStatements.includes(type.toLowerCase())) {
                return `Only ${allowedStatements.join(', ')} ${
                    allowedStatements?.length === 1 ? 'statement' : 'statements are'
                } allowed`;
            }
        }

        return true;
    } catch {
        return 'Please enter a valid SQL query';
    }
};

/**
 * Validates Python code syntax and optionally restricts certain statements.
 *
 * @param code - The Python code to validate
 * @param disallowedStatements - Optional array of statement keywords to disallow (e.g., ['import', 'exec', 'eval'])
 * @returns true if valid, or an error message string if invalid
 *
 * @example
 * validatePython("x = 1 and y == 2")  // true
 * validatePython("import os", ['import'])  // "import statements are not allowed"
 */
const unwrapTemplateBraces = (s: string): string => {
    let result = '';
    let i = 0;
    while (i < s.length) {
        const open = s.indexOf('{{', i);
        if (open === -1) {
            result += s.slice(i);
            break;
        }
        result += s.slice(i, open);
        const close = s.indexOf('}}', open + 2);
        if (close === -1) {
            result += s.slice(open);
            break;
        }
        result += s.slice(open + 2, close).trim();
        i = close + 2;
    }
    return result;
};

const cleanPythonCode = (code: string): string => {
    return unwrapTemplateBraces(code).replaceAll(
        /\b(Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):([\w-]+)\b/g,
        '$2'
    );
};

const checkDisallowedPythonStatements = (cleanedCode: string, disallowedStatements: string[]): string | undefined => {
    if (disallowedStatements.length > 0) {
        const lowerCode = cleanedCode.toLowerCase();
        for (const stmt of disallowedStatements) {
            const pattern = new RegExp(String.raw`\b${stmt}\b`, 'i');
            if (pattern.test(lowerCode)) {
                return `${stmt} statements are not allowed`;
            }
        }
    }
    return undefined;
};

const checkPythonBrackets = (cleanedCode: string): string | undefined => {
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];

    for (const char of cleanedCode) {
        if (char in brackets) {
            stack.push(char);
        } else if (Object.values(brackets).includes(char)) {
            const last = stack.pop();
            if (!last || brackets[last as keyof typeof brackets] !== char) {
                return 'Unmatched brackets or parentheses';
            }
        }
    }

    if (stack.length > 0) {
        return 'Unmatched brackets or parentheses';
    }
    return undefined;
};

const checkPythonQuotes = (cleanedCode: string): string | undefined => {
    let singleQuoteCount = 0;
    let doubleQuoteCount = 0;
    let inEscape = false;

    for (const char of cleanedCode) {
        if (inEscape) {
            inEscape = false;
            continue;
        }
        if (char === '\\') {
            inEscape = true;
            continue;
        }
        if (char === "'") singleQuoteCount++;
        if (char === '"') doubleQuoteCount++;
    }

    if (singleQuoteCount % 2 !== 0 || doubleQuoteCount % 2 !== 0) {
        return 'Unmatched quotes';
    }
    return undefined;
};

export const validatePython = (code?: string, disallowedStatements?: string[]): true | string => {
    if (!code) return 'Code cannot be empty';

    const trimmed = code.trim();
    if (!trimmed) return 'Code cannot be empty';

    try {
        // Clean up {{Variable:...}} etc. for validation
        const cleanedCode = cleanPythonCode(trimmed);

        // Check for disallowed statements
        if (disallowedStatements) {
            const error = checkDisallowedPythonStatements(cleanedCode, disallowedStatements);
            if (error) return error;
        }

        // Basic Python syntax validation
        const bracketError = checkPythonBrackets(cleanedCode);
        if (bracketError) return bracketError;

        const quoteError = checkPythonQuotes(cleanedCode);
        if (quoteError) return quoteError;

        return true;
    } catch {
        return 'Please enter valid Python code';
    }
};

/**
 * Cleans custom Intellisense tokens wrapped in {{ }} before SQL validation.
 * Example:
 *   "SELECT * FROM users WHERE id = {{Variable:hotel}}"
 * → "SELECT * FROM users WHERE id = hotel"
 */
const cleanIntellisenseTokens = (query: string): string => {
    // Remove the double curly braces {{...}}
    // Remove Intellisense prefixes like Variable:, Agent:, etc.
    return unwrapTemplateBraces(query).replaceAll(
        /\b(Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata):([\w-]+)\b/g,
        '$2'
    );
};

/**
 * Formats Intellisense tokens by wrapping or unwrapping them.
 *
 * @param text - The input string to transform
 * @param mode - Either 'wrap' (adds {{ }}) or 'unwrap' (removes {{ }})
 * @returns The transformed string
 *
 * @example
 * formatIntellisenseTokens("Variable:path_name", "wrap")
 * // => "{{Variable:path_name}}"
 *
 * formatIntellisenseTokens("{{Variable:path_name}}", "unwrap")
 * // => "Variable:path_name"
 */
export function formatIntellisenseTokens(text: string, mode: 'wrap' | 'unwrap'): string {
    const INTELLISENSE_PATTERN = /\b(Agent|API|Variable|MCP|VectorRAG|GraphRAG|Metadata|Attribute):([\w-]+)\b/g;

    if (!text) return '';

    if (mode === 'wrap') {
        return text.replaceAll(INTELLISENSE_PATTERN, '{{$1:$2}}');
    }

    if (mode === 'unwrap') {
        return text.replaceAll(/\{\{[^{}]*\}\}/g, m => m.slice(2, -2));
    }

    return text;
}

/**
 * Validates whether a given string follows the semantic version format (e.g., "1.0.0").
 *
 * The expected format is:
 *   major.minor.patch
 * where each part is a non-negative integer without leading zeros
 * (except the standalone value "0"), e.g., "1.2.3" or "0.1.0".
 *
 * @param {string} value - The release version input to validate.
 * @returns {true | string} - Returns `true` if the version is valid, otherwise returns
 *   a user-friendly error message like "Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)".
 *
 * @example
 * validateReleaseVersion("1.0.0"); // true
 * validateReleaseVersion("v1.0");  // "Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)"
 */
export function validateReleaseVersion(value: string): true | string {
    const versionRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

    if (versionRegex.test(value.trim())) {
        return true;
    }

    return 'Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)';
}

/**
 * Converts a draft version (e.g., 1.1) into a published version (e.g., 2.0).
 * Rule:
 * - Draft versions always end with .1
 * - Published versions always end with .0
 * - Integer part increases by 1
 */
export const getPublishedVersion = (draftVersion: number): number => {
    const major = Math.floor(draftVersion);
    const minor = Number((draftVersion % 1).toFixed(1)) * 10; // Extract decimal part (e.g., 1.1 → 1)

    if (minor !== 1) {
        throw new Error('Invalid draft version format. Draft versions must end with ".1"');
    }

    return Number(`${major + 1}.0`);
};

/**
 * Convert a File object to a Base64 data URL
 * @param file - File to convert
 * @returns Promise<string> - Base64 data URL (includes MIME type)
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as string); // full data URL, e.g. "data:image/png;base64,...."
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Convert a Base64 data URL to a File object
 * @param base64DataUrl - Base64 data URL (e.g. "data:image/png;base64,...")
 * @param fileName - Optional file name; extension will be inferred if missing
 * @returns File
 */
export const base64ToFile = (base64DataUrl: string, fileName = 'file'): Promise<File> => {
    return new Promise((resolve, reject) => {
        try {
            const arr = base64DataUrl.split(',');
            const header = arr[0];
            const colonIdx = header.indexOf(':');
            const semiIdx = header.indexOf(';', colonIdx + 1);
            const mimeType =
                colonIdx !== -1 && semiIdx !== -1 ? header.slice(colonIdx + 1, semiIdx) : 'application/octet-stream';

            const bstr = atob(arr[1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.codePointAt(i) || 0;
            }

            const ext = mimeType.split('/')[1];
            const safeFileName = fileName.includes('.') ? fileName : `${fileName}.${ext}`;

            const file = new File([u8arr], safeFileName, { type: mimeType });
            resolve(file);
        } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
        }
    });
};

/**
 * Converts a UTC date string into a formatted local date string.
 *
 * This function checks if the provided date string is a valid ISO 8601 date.
 * If valid, it converts the UTC date to the user's local timezone
 * and formats it as `YYYY-MM-DD`.
 * If the input is invalid or undefined, it returns `undefined`.
 *
 * @param {string} date - The UTC date string to convert.
 * @returns {string | undefined} The formatted local date string, or `undefined` if invalid.
 */
export const formatUtcToLocalDate = (date: string) => {
    if (date && moment(date, moment.ISO_8601, true).isValid()) {
        return moment.utc(date).local().format('YYYY-MM-DD');
    }
    return undefined;
};

/**
 * Validates whether a given string is a properly formatted HTTP or HTTPS URL.
 *
 * @param value - The string value to validate as a URL. If undefined, empty, or not a string, validation passes.
 * @param field - The name of the field being validated, used in error messages.
 * @returns `true` if the value is valid or empty; otherwise, returns a string describing the validation error.
 *
 * @example
 * validateUrlRegEx('https://example.com', 'Website'); // returns true
 * validateUrlRegEx('   https://example.com', 'Website'); // returns "No leading spaces allowed in Website"
 * validateUrlRegEx('example.com', 'Website'); // returns "Invalid URL format in Website. Please use 'http://' or 'https://'."
 */
export const validateUrlRegEx = (value: string | undefined, field: string): true | string => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return true;
    }

    if (value.startsWith(' ')) {
        return `No leading spaces allowed in ${field}`;
    }
    if (value.endsWith(' ')) {
        return `No trailing spaces allowed in ${field}`;
    }

    // Basic RegEx pattern for http(s)://...
    const urlPattern = /^(https?:\/\/(?:[^\s$.?#].[^\s]*))$/i;

    if (!urlPattern.test(value)) {
        return `Invalid URL format in ${field}. Please use 'http://' or 'https://'.`;
    }

    return true;
};

/**
 * Validates an AWS MSK (Managed Streaming for Apache Kafka) cluster ARN or a list of bootstrap server URLs.
 *
 * The function checks for the following:
 * - The input is not empty.
 * - No leading or trailing spaces are present.
 * - If the input starts with "arn:", it must match the AWS MSK ARN format.
 * - Otherwise, the input is treated as a comma-separated list of broker URLs, each of which must match the AWS MSK broker format and have a valid port (1-65535).
 *
 * @param value - The input string representing either an AWS MSK cluster ARN or a comma-separated list of bootstrap server URLs.
 * @returns `true` if the input is valid; otherwise, returns a string describing the validation error.
 */
export const validateAwsMskUrl = (value: string) => {
    const label = 'cluster ARN or bootstrap servers';
    if (!value) return `${label}: Please enter a ${label}`;

    if (value.startsWith(' ')) {
        return `No leading spaces in ${label}`;
    }
    if (value.endsWith(' ')) {
        return `No trailing spaces in ${label}`;
    }

    const arnRegex = /^arn:aws:kafka:[a-z0-9-]+:\d{12}:cluster\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
    const mskBrokerRegex =
        /^b-\d+\.[a-zA-Z0-9-]+\.[a-zA-Z0-9]+\.[a-z0-9-]+\.kafka\.[a-z0-9-]+\.amazonaws\.com:(\d{1,5})$/;

    if (value.trim().startsWith('arn:')) {
        if (!arnRegex.test(value.trim())) {
            return `Invalid AWS MSK ARN format in ${label}`;
        }
        return true;
    }

    const urls = value
        .trim()
        .split(',')
        .map(u => u.trim());

    for (const url of urls) {
        const match = mskBrokerRegex.exec(url);

        if (!match) {
            return `Invalid AWS MSK broker format in ${label}`;
        }

        const port = Number(match[1]);
        if (port < 1 || port > 65535) {
            return `Invalid port in ${label}`;
        }
    }

    return true;
};

/**
 * Validates an identifier-like string such as a variable name or key.
 *
 * This function enforces several rules:
 * - No leading or trailing spaces.
 * - Only letters, digits, and underscores are allowed.
 * - The value must start with a letter or an underscore.
 *
 * If the value violates any rule, a descriptive error message is returned.
 * Otherwise, it returns `true`.
 *
 * @param {string} value - The identifier value to validate.
 * @param {string} [field='variable name field'] - The field name used in error messages.
 * @returns {true | string} `true` if valid, otherwise an error message.
 */
export const validateIdentifier = (value: string, field = 'variable name') => {
    if (value) {
        const validHeaderRegex = /^\w+$/;
        const validateVariable = /^[A-Za-z_]\w*$/;
        const capitalizeFirst = field.charAt(0).toUpperCase() + field.slice(1);

        if (value.startsWith(' ')) {
            return `No leading spaces in ${field}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${field}`;
        }
        if (!validHeaderRegex.test(value)) {
            return `Letters, digits and _ only allowed`;
        }
        if (!validateVariable.test(value)) {
            return `${capitalizeFirst} must be a valid key`;
        }
    }
    return true;
};

/**
 * Converts a property or variable name into a human-readable label.
 *
 * This utility normalizes common naming conventions such as camelCase,
 * PascalCase, snake_case, and kebab-case into space-separated words.
 * It also preserves well-known acronyms (for example: URL, API, ID)
 * in uppercase while capitalizing regular words for display purposes.
 *
 * This is useful for automatically generating UI labels from object
 * property names or configuration keys.
 *
 * @param {string | undefined} input - The property name or identifier to convert.
 * @param {boolean} isLower - If true, non-acronym words are lowercased.
 * @returns {string | undefined} - A formatted, human-readable label or `undefined` if input is `undefined`.
 */
const replaceUnderscoresHyphens = (s: string): string => {
    let result = '';
    let i = 0;
    while (i < s.length) {
        if (s[i] === '_' || s[i] === '-') {
            result += ' ';
            while (i < s.length && (s[i] === '_' || s[i] === '-')) i++;
        } else {
            result += s[i];
            i++;
        }
    }
    return result;
};

const addCamelCaseSpaces = (s: string): string => {
    let result = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        const next = s[i + 1];
        const next2 = s[i + 2];
        const isLowerOrDigit = (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
        const isUpper = c >= 'A' && c <= 'Z';
        if (isLowerOrDigit && next && next >= 'A' && next <= 'Z') {
            result += c + ' ';
        } else if (isUpper && next && next >= 'A' && next <= 'Z' && next2 && next2 >= 'a' && next2 <= 'z') {
            result += c + ' ';
        } else {
            result += c;
        }
    }
    return result;
};

export const propertyToTitle = (input: string, isLower = false) => {
    const ACRONYMS = new Set(['url', 'api', 'id', 'ip']);

    if (!input) return '';

    return addCamelCaseSpaces(replaceUnderscoresHyphens(input))
        .toLowerCase()
        .split(' ')
        .map(word => {
            if (ACRONYMS.has(word)) {
                return word.toUpperCase();
            }

            return isLower ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};

/**
 * Validates a header/identifier-like string.
 *
 * Rules:
 * - No leading or trailing spaces
 * - Only letters, digits, underscores, and hyphens are allowed
 * - Must start with a letter or underscore
 *
 * @param {string} value - The identifier value to validate
 * @param {string} [field='header name'] - The field name used in error messages
 * @returns {true | string} `true` if valid, otherwise an error message
 */
export const validateHeaderIdentifier = (value: string, field = 'header name'): true | string => {
    if (value) {
        const allowedCharsRegex = /^[A-Za-z0-9_-]+$/;
        const validIdentifierRegex = /^[A-Za-z_][A-Za-z0-9_-]*$/;
        const capitalizeFirst = field.charAt(0).toUpperCase() + field.slice(1);

        if (value.startsWith(' ')) {
            return `No leading spaces in ${field}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${field}`;
        }
        if (!allowedCharsRegex.test(value)) {
            return `Letters, digits, _, and - only allowed`;
        }
        if (!validIdentifierRegex.test(value)) {
            return `${capitalizeFirst} must start with a letter or _`;
        }
    }
    return true;
};

/**
 * Checks if a given value is a valid numeric value.
 * - Returns false for null or undefined.
 * - Returns false for empty or whitespace-only strings.
 * - Returns false for NaN.
 * - Returns true for valid numbers or numeric strings.
 *
 * @param {number | string | null | undefined} value The value to check.
 * @returns {boolean} True if the value is numeric.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNumeric = (value: any): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'number') {
        return !Number.isNaN(value);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return false;
        }

        return !Number.isNaN(Number(trimmed));
    }

    return false;
};
