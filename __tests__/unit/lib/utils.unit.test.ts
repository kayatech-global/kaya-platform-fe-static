import {
    areObjectsEqual,
    base64ToFile,
    convert_MMM_DD_YYYY,
    convert_YYYY_MM_DD_HH_MM,
    convertStringListToDropdown,
    convertToFullMonth,
    convertToSnakeCase,
    divideByThousand,
    fileToBase64,
    formatExecutionTimestamp,
    formatFileSize,
    formatIntellisenseTokens,
    formatNumberToK,
    formatToShortenedUnit,
    generateNearestChartTopValue,
    getEnumKeyByValue,
    getEnumKeyByValueV2,
    getEnumValueByKey,
    getNextVersionNumber,
    groupByMonthAndYear,
    handleNoValue,
    hasPathParam,
    isFileAccepted,
    isNullOrEmpty,
    normalizeAccept,
    parseTimeInSeconds,
    partitionFilesByAccept,
    roundedDecimalPlaces,
    toFunctionName,
    toQueryParams,
    validateApiDescription,
    validateApiUrl,
    validateHeaderField,
    validateHeaderName,
    validateHostPort,
    validateHttpMethod,
    validateIdentifier,
    validateJsonStructure,
    validateParameterDescription,
    validateParameterName,
    validateParameterValue,
    validateRequired,
    validateReleaseVersion,
    validateSpaces,
    validateSql,
    validateUrl,
    validateUrlWithPort,
    validateVaultKey,
} from '@/lib/utils';
import { OverallUsageType, PackageReleaseType, UnitPrefix, UnitType, UsageUnitType } from '@/enums';
import moment from 'moment';
import { VALID_HTTP_METHODS } from '@/constants';

describe('formatToShortenedUnit', () => {
    it('should convert bytes to kilobytes correctly', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.BYTE,
            UnitType.KILOBYTE,
            UsageUnitType.SIZE,
            UnitPrefix.OUTPUT
        );
        expect(result).toBe('1.5KB');
    });

    it('should handle default prefix case correctly', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.NONE
        );
        expect(result).toBe('1.5');
    });

    it('should handle conversion with a custom prefix', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.OUTPUT
        );
        expect(result).toBe('1.5MB');
    });

    it('should correctly handle COUNT prefix case', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.COUNT
        );
        expect(result).toBe('1.5');
    });

    it('should handle the case where _prefix is UnitPrefix.DEFAULT', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.DEFAULT
        );
        expect(result).toBe('1.5');
    });

    it('should return the original number when no prefix and size conversion is not needed', () => {
        const result = formatToShortenedUnit(1500, UnitType.BYTE, UnitType.BYTE, UsageUnitType.SIZE, UnitPrefix.NONE);
        expect(result).toBe('1500');
    });

    it('should convert terabytes to gigabytes correctly', () => {
        const result = formatToShortenedUnit(
            1500,
            UnitType.TERABYTE,
            UnitType.GIGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.NONE
        );
        expect(result).toBe('1500000');
    });

    it('should return correct string for zero input', () => {
        const result = formatToShortenedUnit(
            0,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.NONE
        );
        expect(result).toBe('0');
    });

    it('should handle edge case with default prefix set', () => {
        const result = formatToShortenedUnit(1500, UnitType.KILOBYTE, UnitType.MEGABYTE, UsageUnitType.SIZE, undefined);
        expect(result).toBe('1.5K');
    });

    it('should round to two decimal places for floating point values', () => {
        const result = formatToShortenedUnit(
            2500,
            UnitType.KILOBYTE,
            UnitType.MEGABYTE,
            UsageUnitType.SIZE,
            UnitPrefix.NONE
        );
        expect(result).toBe('2.5');
    });
});

describe('roundedDecimalPlaces', () => {
    it('should round a number to 2 decimal places by default', () => {
        const result = roundedDecimalPlaces(123.456);
        expect(result).toBe('123.46');
    });

    it('should round to the specified number of decimal places', () => {
        const result = roundedDecimalPlaces(123.4567, 3);
        expect(result).toBe('123.457');
    });

    it('should remove ".00" for whole numbers', () => {
        const result = roundedDecimalPlaces(123.0);
        expect(result).toBe('123');
    });

    it('should handle integers correctly', () => {
        const result = roundedDecimalPlaces(123);
        expect(result).toBe('123');
    });

    it('should round negative numbers to 2 decimal places by default', () => {
        const result = roundedDecimalPlaces(-123.456);
        expect(result).toBe('-123.46');
    });

    it('should handle zero correctly', () => {
        const result = roundedDecimalPlaces(0);
        expect(result).toBe('0');
    });

    it('should round numbers that have more than the specified decimal places', () => {
        const result = roundedDecimalPlaces(123.456789, 4);
        expect(result).toBe('123.4568');
    });

    it('should return an empty string for 0 when fixValue is 0', () => {
        const result = roundedDecimalPlaces(0, 0);
        expect(result).toBe('0');
    });
});

describe('convertToFullMonth', () => {
    it('should return "January" for month 1', () => {
        const result = convertToFullMonth(1);
        expect(result).toBe('January');
    });

    it('should return "February" for month 2', () => {
        const result = convertToFullMonth(2);
        expect(result).toBe('February');
    });

    it('should return "March" for month 3', () => {
        const result = convertToFullMonth(3);
        expect(result).toBe('March');
    });

    it('should return "April" for month 4', () => {
        const result = convertToFullMonth(4);
        expect(result).toBe('April');
    });

    it('should return "May" for month 5', () => {
        const result = convertToFullMonth(5);
        expect(result).toBe('May');
    });

    it('should return "June" for month 6', () => {
        const result = convertToFullMonth(6);
        expect(result).toBe('June');
    });

    it('should return "July" for month 7', () => {
        const result = convertToFullMonth(7);
        expect(result).toBe('July');
    });

    it('should return "August" for month 8', () => {
        const result = convertToFullMonth(8);
        expect(result).toBe('August');
    });

    it('should return "September" for month 9', () => {
        const result = convertToFullMonth(9);
        expect(result).toBe('September');
    });

    it('should return "October" for month 10', () => {
        const result = convertToFullMonth(10);
        expect(result).toBe('October');
    });

    it('should return "November" for month 11', () => {
        const result = convertToFullMonth(11);
        expect(result).toBe('November');
    });

    it('should return "December" for month 12', () => {
        const result = convertToFullMonth(12);
        expect(result).toBe('December');
    });

    it('should return "January" for month 1 even if called in the middle of the year', () => {
        // Test case to verify consistency when called on any date, e.g., in the middle of the year
        const result = convertToFullMonth(1);
        expect(result).toBe('January');
    });
});

describe('groupByMonthAndYear', () => {
    it('should group data by month and year correctly', () => {
        const data = [
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 1,
                year: 2023,
                usage: 100,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 2,
                year: 2023,
                usage: 200,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 1,
                year: 2023,
                usage: 150,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 3,
                year: 2023,
                usage: 250,
            },
        ];

        const result = groupByMonthAndYear(data);

        expect(result).toEqual({
            '1-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 1,
                    year: 2023,
                    usage: 100,
                },
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 1,
                    year: 2023,
                    usage: 150,
                },
            ],
            '2-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 2,
                    year: 2023,
                    usage: 200,
                },
            ],
            '3-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 3,
                    year: 2023,
                    usage: 250,
                },
            ],
        });
    });

    it('should return an empty object for empty input', () => {
        const result = groupByMonthAndYear([]);
        expect(result).toEqual({});
    });

    it('should handle a single entry correctly', () => {
        const data = [
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 5,
                year: 2023,
                usage: 500,
            },
        ];
        const result = groupByMonthAndYear(data);
        expect(result).toEqual({
            '5-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 5,
                    year: 2023,
                    usage: 500,
                },
            ],
        });
    });

    it('should group multiple entries with the same month and year correctly', () => {
        const data = [
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 6,
                year: 2023,
                usage: 100,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 6,
                year: 2023,
                usage: 200,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 6,
                year: 2023,
                usage: 300,
            },
        ];

        const result = groupByMonthAndYear(data);

        expect(result).toEqual({
            '6-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 6,
                    year: 2023,
                    usage: 100,
                },
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 6,
                    year: 2023,
                    usage: 200,
                },
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 6,
                    year: 2023,
                    usage: 300,
                },
            ],
        });
    });

    it('should group different months and years correctly', () => {
        const data = [
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 1,
                year: 2023,
                usage: 100,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 2,
                year: 2024,
                usage: 200,
            },
        ];

        const result = groupByMonthAndYear(data);

        expect(result).toEqual({
            '1-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 1,
                    year: 2023,
                    usage: 100,
                },
            ],
            '2-2024': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 2,
                    year: 2024,
                    usage: 200,
                },
            ],
        });
    });

    it('should correctly handle duplicate months in the same year', () => {
        const data = [
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 12,
                year: 2023,
                usage: 300,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 12,
                year: 2023,
                usage: 400,
            },
            {
                type: OverallUsageType.CREDITS,
                unit: UnitType.DEFAULT,
                unitType: UsageUnitType.COUNT,
                month: 12,
                year: 2023,
                usage: 500,
            },
        ];

        const result = groupByMonthAndYear(data);

        expect(result).toEqual({
            '12-2023': [
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 12,
                    year: 2023,
                    usage: 300,
                },
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 12,
                    year: 2023,
                    usage: 400,
                },
                {
                    type: OverallUsageType.CREDITS,
                    unit: UnitType.DEFAULT,
                    unitType: UsageUnitType.COUNT,
                    month: 12,
                    year: 2023,
                    usage: 500,
                },
            ],
        });
    });
});

describe('convertToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
        const result = convertToSnakeCase('camelCaseExample');
        expect(result).toBe('camelcaseexample');
    });

    it('should convert a string with spaces to snake_case', () => {
        const result = convertToSnakeCase('This is a test string');
        expect(result).toBe('this_is_a_test_string');
    });

    it('should convert a string with hyphens to snake_case', () => {
        const result = convertToSnakeCase('hyphen-example-string');
        expect(result).toBe('hyphen_example_string');
    });

    it('should handle multiple types of delimiters (spaces, hyphens, etc.)', () => {
        const result = convertToSnakeCase('This is-a test-string with spaces and-hyphens');
        expect(result).toBe('this_is_a_test_string_with_spaces_and_hyphens');
    });

    it('should handle an empty string', () => {
        const result = convertToSnakeCase('');
        expect(result).toBe('');
    });

    it('should handle numbers correctly', () => {
        const result = convertToSnakeCase('Test 1234 string');
        expect(result).toBe('test_1234_string');
    });

    it('should ignore non-alphanumeric characters', () => {
        const result = convertToSnakeCase('!@#$%^&*() special#characters$');
        expect(result).toBe('___________special_characters_');
    });

    it('should handle a single word input', () => {
        const result = convertToSnakeCase('singleword');
        expect(result).toBe('singleword');
    });

    it('should return the same result for already snake_case strings', () => {
        const result = convertToSnakeCase('already_snake_case');
        expect(result).toBe('already_snake_case');
    });
});

describe('generateNearestChartTopValue', () => {
    it('should return 4 times minimum value when input is 0', () => {
        expect(generateNearestChartTopValue(0, OverallUsageType.STORAGE)).toBe(4);
        expect(generateNearestChartTopValue(0, OverallUsageType.CREDITS)).toBe(12);
        expect(generateNearestChartTopValue(0, OverallUsageType.TOKENS)).toBe(120);
    });

    it('should handle values less than or equal to minimum value', () => {
        expect(generateNearestChartTopValue(0.5, OverallUsageType.STORAGE)).toBe(2);
        expect(generateNearestChartTopValue(1, OverallUsageType.STORAGE)).toBe(4);

        expect(generateNearestChartTopValue(2, OverallUsageType.CREDITS)).toBe(8);
        expect(generateNearestChartTopValue(2.5, OverallUsageType.CREDITS)).toBe(10);

        expect(generateNearestChartTopValue(25, OverallUsageType.TOKENS)).toBe(100);
        expect(generateNearestChartTopValue(29.5, OverallUsageType.TOKENS)).toBe(118);
    });

    it('should return undefined for values greater than minimum value', () => {
        expect(generateNearestChartTopValue(5, OverallUsageType.STORAGE)).toBeUndefined();
        expect(generateNearestChartTopValue(10, OverallUsageType.CREDITS)).toBeUndefined();
        expect(generateNearestChartTopValue(50, OverallUsageType.TOKENS)).toBeUndefined();
    });
});

describe('formatNumberToK', () => {
    it('should correctly format numbers greater than 1000 with 2 decimal places', () => {
        expect(formatNumberToK(1000)).toBe('1K');
        expect(formatNumberToK(1500)).toBe('1.50K');
        expect(formatNumberToK(2300)).toBe('2.30K');
        expect(formatNumberToK(9999)).toBe('10K');
    });

    it('should correctly remove decimals if the number is a multiple of 1000', () => {
        expect(formatNumberToK(2000)).toBe('2K');
        expect(formatNumberToK(5000)).toBe('5K');
        expect(formatNumberToK(10000)).toBe('10K');
    });

    it('should handle values less than 1000', () => {
        expect(formatNumberToK(999)).toBe('1K');
        expect(formatNumberToK(999.99)).toBe('1K');
    });

    it('should return a string with "K" appended even for values less than 1000', () => {
        expect(formatNumberToK(500)).toBe('0.50K');
    });

    it('should handle 0 as input correctly', () => {
        expect(formatNumberToK(0)).toBe('0K');
    });
});

describe('divideByThousand', () => {
    it('should divide numbers by 1000 and return a float with 2 decimal places', () => {
        expect(divideByThousand(1000)).toBe(1);
        expect(divideByThousand(1500)).toBe(1.5);
        expect(divideByThousand(2300)).toBe(2.3);
        expect(divideByThousand(9999)).toBe(10);
    });

    it('should remove decimals if the number is a multiple of 1000', () => {
        expect(divideByThousand(2000)).toBe(2);
        expect(divideByThousand(5000)).toBe(5);
        expect(divideByThousand(10000)).toBe(10);
    });

    it('should handle values less than 1000 correctly', () => {
        expect(divideByThousand(999)).toBe(1);
        expect(divideByThousand(999.99)).toBe(1);
    });

    it('should handle 0 as input correctly', () => {
        expect(divideByThousand(0)).toBe(0);
    });

    it('should return 0 if the result is NaN (e.g., non-numeric input)', () => {
        expect(divideByThousand(NaN)).toBe(NaN);
        expect(divideByThousand(undefined as never)).toBe(NaN);
    });
});

describe('isNullOrEmpty', () => {
    it('should return true for null values', () => {
        expect(isNullOrEmpty(null)).toBe(true);
    });

    it('should return true for undefined values', () => {
        expect(isNullOrEmpty(undefined)).toBe(true);
    });

    it('should return true for NaN values', () => {
        expect(isNullOrEmpty(NaN)).toBe(true);
    });

    it('should return true for empty string', () => {
        expect(isNullOrEmpty('')).toBe(true);
    });

    it('should return true for string with only spaces', () => {
        expect(isNullOrEmpty('   ')).toBe(true);
    });

    it('should return false for non-empty string', () => {
        expect(isNullOrEmpty('hello')).toBe(false);
    });

    it('should return false for non-NaN number', () => {
        expect(isNullOrEmpty(123)).toBe(false);
    });

    it('should return true for NaN number', () => {
        expect(isNullOrEmpty(NaN)).toBe(true);
    });
});

describe('parseTimeInSeconds', () => {
    it('should correctly parse time with "s" at the end', () => {
        expect(parseTimeInSeconds('55.62951157200382s')).toBe(55.62951157200382);
    });

    it('should return NaN for time string without "s" at the end', () => {
        expect(parseTimeInSeconds('55.62951157200382')).toBeNaN();
    });

    it('should return NaN for invalid time string', () => {
        expect(parseTimeInSeconds('invalid')).toBeNaN();
    });

    it('should return NaN for empty string', () => {
        expect(parseTimeInSeconds('')).toBeNaN();
    });

    it('should return NaN for string with only "s" and no number', () => {
        expect(parseTimeInSeconds('s')).toBeNaN();
    });
});

describe('handleNoValue', () => {
    it('should return "-" for null', () => {
        expect(handleNoValue(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
        expect(handleNoValue(undefined)).toBe('-');
    });

    it('should return "-" for empty string', () => {
        expect(handleNoValue('')).toBe('-');
    });

    it('should return "-" for string with only spaces', () => {
        expect(handleNoValue('   ')).toBe('-');
    });

    it('should return the original value for non-empty string', () => {
        expect(handleNoValue('hello')).toBe('hello');
    });

    it('should return the original value for number', () => {
        expect(handleNoValue(123)).toBe(123);
    });

    it('should return "-" for NaN', () => {
        expect(handleNoValue(NaN)).toBe('-');
    });

    it('should return "-" for null or undefined, but not for 0 or NaN', () => {
        expect(handleNoValue(0)).toBe(0);
        expect(handleNoValue(NaN)).toBe('-');
    });
});

describe('validateUrl', () => {
    it('should return true for undefined', () => {
        expect(validateUrl(undefined, 'URL')).toBe(true);
    });

    it('should return error for leading space', () => {
        expect(validateUrl(' https://example.com', 'URL')).toBe('No leading spaces in URL');
    });

    it('should return error for trailing space', () => {
        expect(validateUrl('https://example.com ', 'URL')).toBe('No trailing spaces in URL');
    });

    it('should return error for missing http/https', () => {
        expect(validateUrl('ftp://example.com', 'URL')).toBe('Invalid URL format in URL');
    });

    it('should return true for valid https URL', () => {
        expect(validateUrl('https://example.com', 'URL')).toBe(true);
    });

    it('should return true for valid http URL', () => {
        expect(validateUrl('http://example.com', 'URL')).toBe(true);
    });
});

describe('validateSpaces', () => {
    it('should return true for undefined', () => {
        expect(validateSpaces(undefined, 'Name')).toBe(true);
    });

    it('should return error for leading space', () => {
        expect(validateSpaces(' test', 'Name')).toBe('No leading spaces in Name');
    });

    it('should return error for trailing space', () => {
        expect(validateSpaces('test ', 'Name')).toBe('No trailing spaces in Name');
    });

    it('should return true for normal string', () => {
        expect(validateSpaces('test', 'Name')).toBe(true);
    });
});

describe('validateReleaseVersion', () => {
    it('should return true for valid semantic versions', () => {
        expect(validateReleaseVersion('1.2.3')).toBe(true);
        expect(validateReleaseVersion('0.0.0')).toBe(true);
        expect(validateReleaseVersion('10.20.30')).toBe(true);
    });

    it('should reject semantic versions with leading zeros', () => {
        expect(validateReleaseVersion('01.2.3')).toBe('Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)');
        expect(validateReleaseVersion('1.02.3')).toBe('Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)');
        expect(validateReleaseVersion('1.2.003')).toBe('Please follow the version format: x.y.z (e.g., 1.0.0, 2.3.5)');
    });
});

describe('toFunctionName', () => {
    it('should replace invalid characters and lowercase the result', () => {
        expect(toFunctionName('Test Function!')).toBe('test_function');
    });

    it('should collapse multiple underscores', () => {
        expect(toFunctionName('Test---Function')).toBe('test_function');
    });

    it('should trim leading and trailing underscores', () => {
        expect(toFunctionName('_Test_')).toBe('test');
    });

    it('should return undefined when input is undefined', () => {
        expect(toFunctionName(undefined)).toBeUndefined();
    });

    it('should keep alphanumeric and underscores intact', () => {
        expect(toFunctionName('Test_123')).toBe('test_123');
    });
});

describe('formatFileSize', () => {
    it('should format bytes less than 1 KB as B', () => {
        expect(formatFileSize(512)).toBe('512 B');
    });

    it('should format bytes less than 1 MB as KB', () => {
        expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format bytes more than 1 MB as MB', () => {
        expect(formatFileSize(2 * 1048576)).toBe('2.0 MB');
    });
});

describe('convert_YYYY_MM_DD_HH_MM', () => {
    it('should format valid date string to "YYYY-MM-DD HH:mm"', () => {
        const date = '2025-10-27T15:30:00Z';
        const expected = moment(new Date(date)).format('YYYY-MM-DD HH:mm');
        expect(convert_YYYY_MM_DD_HH_MM(date)).toBe(expected);
    });

    it('should return input if date is falsy', () => {
        expect(convert_YYYY_MM_DD_HH_MM('')).toBe('');
    });
});

describe('convertStringListToDropdown', () => {
    it('should convert list of strings to dropdown options', () => {
        const list = ['A', 'B', 'C'];
        expect(convertStringListToDropdown(list)).toEqual([
            { name: 'A', value: 'A' },
            { name: 'B', value: 'B' },
            { name: 'C', value: 'C' },
        ]);
    });

    it('should return empty array for empty list', () => {
        expect(convertStringListToDropdown([])).toEqual([]);
    });

    it('should handle null or undefined list gracefully', () => {
        // @ts-expect-error testing undefined input
        expect(convertStringListToDropdown(undefined)).toEqual([]);
    });
});

describe('normalizeAccept', () => {
    it('should return empty array if accept is undefined', () => {
        expect(normalizeAccept(undefined)).toEqual([]);
    });

    it('should split comma-separated string and trim/normalize', () => {
        expect(normalizeAccept('image/png, image/jpeg , .pdf')).toEqual(['image/png', 'image/jpeg', '.pdf']);
    });

    it('should handle array input correctly', () => {
        expect(normalizeAccept(['image/png', '  text/html  '])).toEqual(['image/png', 'text/html']);
    });

    it('should filter out empty tokens', () => {
        expect(normalizeAccept('image/png, , ,')).toEqual(['image/png']);
    });
});

describe('isFileAccepted', () => {
    const makeFile = (name: string, type: string): File => ({ name, type }) as unknown as File;

    it('should return true if acceptTokens is empty', () => {
        expect(isFileAccepted(makeFile('file.txt', 'text/plain'), [])).toBe(true);
    });

    it('should accept file by extension', () => {
        const file = makeFile('photo.png', 'image/png');
        expect(isFileAccepted(file, ['.png'])).toBe(true);
    });

    it('should reject file by extension mismatch', () => {
        const file = makeFile('photo.jpg', 'image/jpeg');
        expect(isFileAccepted(file, ['.png'])).toBe(false);
    });

    it('should accept file by MIME type', () => {
        const file = makeFile('data.json', 'application/json');
        expect(isFileAccepted(file, ['application/json'])).toBe(true);
    });

    it('should match partial type token', () => {
        const file = makeFile('data.json', 'application/json');
        expect(isFileAccepted(file, ['json'])).toBe(true);
    });

    it('should reject file if neither type nor extension match', () => {
        const file = makeFile('report.pdf', 'application/pdf');
        expect(isFileAccepted(file, ['image/png', '.jpg'])).toBe(false);
    });
});

describe('partitionFilesByAccept', () => {
    const makeFile = (name: string, type: string): File => ({ name, type }) as unknown as File;

    const files = [
        makeFile('image.png', 'image/png'),
        makeFile('document.pdf', 'application/pdf'),
        makeFile('photo.jpg', 'image/jpeg'),
    ];

    it('should accept all files when accept is undefined', () => {
        const { accepted, rejected } = partitionFilesByAccept(files);
        expect(accepted).toHaveLength(3);
        expect(rejected).toHaveLength(0);
    });

    it('should correctly partition accepted and rejected files', () => {
        const { accepted, rejected } = partitionFilesByAccept(files, '.png, .jpg');
        expect(accepted.map(f => f.name)).toEqual(['image.png', 'photo.jpg']);
        expect(rejected.map(f => f.name)).toEqual(['document.pdf']);
    });

    it('should handle empty file list', () => {
        const { accepted, rejected } = partitionFilesByAccept([], '.png');
        expect(accepted).toEqual([]);
        expect(rejected).toEqual([]);
    });
});

describe('getEnumKeyByValue', () => {
    const Colors = { RED: 'r', BLUE: 'b', GREEN: 'g' };

    it('should return key for matching value', () => {
        expect(getEnumKeyByValue('r', Colors)).toBe('RED');
    });

    it('should return undefined for non-existing value', () => {
        expect(getEnumKeyByValue('x', Colors)).toBeUndefined();
    });
});

describe('getEnumValueByKey', () => {
    const Colors = { RED: 'r', BLUE: 'b', GREEN: 'g' };

    it('should return value for existing key', () => {
        expect(getEnumValueByKey('BLUE', Colors)).toBe('b');
    });

    it('should return undefined for invalid key', () => {
        expect(getEnumValueByKey('PURPLE', Colors)).toBeUndefined();
    });
});

describe('getEnumKeyByValueV2', () => {
    const obj = { ONE: '1', TWO: '2' };

    it('should return key by string value', () => {
        expect(getEnumKeyByValueV2(obj, '1')).toBe('ONE');
    });

    it('should return key by numeric value', () => {
        const enumNum = { A: 1, B: 2 };
        expect(getEnumKeyByValueV2(enumNum, 2)).toBe('B');
    });

    it('should return undefined for non-existing value', () => {
        expect(getEnumKeyByValueV2(obj, '3')).toBeUndefined();
    });
});

describe('validateRequired', () => {
    it('should return error for empty string', () => {
        expect(validateRequired('', 'Name')).toBe('Please enter Name');
    });

    it('should return error for undefined value', () => {
        expect(validateRequired(undefined, 'Email')).toBe('Please enter Email');
    });

    it('should validate minimum length', () => {
        expect(validateRequired('ab', 'Username', 5)).toBe('Username must be at least 5 characters');
    });

    it('should return true for valid string', () => {
        expect(validateRequired('Hello', 'Field')).toBe(true);
    });

    it('should trim spaces before validating', () => {
        expect(validateRequired('   ', 'Field')).toBe('Please enter Field');
    });
});

describe('validateHttpMethod', () => {
    it('should return error for undefined', () => {
        expect(validateHttpMethod(undefined)).toBe('Please select API Method');
    });

    it('should return true for valid methods', () => {
        for (const method of VALID_HTTP_METHODS) {
            expect(validateHttpMethod(method)).toBe(true);
        }
    });

    it('should be case-insensitive', () => {
        expect(validateHttpMethod('get')).toBe(true);
        expect(validateHttpMethod('pOsT')).toBe(true);
    });

    it('should return error for invalid method', () => {
        expect(validateHttpMethod('CONNECT')).toBe('Invalid API Method');
    });

    it('should allow custom field name in message', () => {
        expect(validateHttpMethod(undefined, 'Method Type')).toBe('Please select Method Type');
    });
});

describe('areObjectsEqual', () => {
    it('should return true for equal objects', () => {
        expect(areObjectsEqual({ a: 1 }, { a: 1 })).toBe(true);
    });

    it('should return false for different objects', () => {
        expect(areObjectsEqual({ a: 1 }, { a: 2 })).toBe(false);
    });
});

describe('getNextVersionNumber', () => {
    it('should handle undefined version correctly for MAJOR', () => {
        expect(getNextVersionNumber(undefined, PackageReleaseType.Major)).toBe('1.0.0');
    });

    it('should handle undefined version correctly for MINOR', () => {
        expect(getNextVersionNumber(undefined, PackageReleaseType.Minor)).toBe('0.1.0');
    });

    it('should handle undefined version correctly for PATCH', () => {
        expect(getNextVersionNumber(undefined, PackageReleaseType.Patch)).toBe('0.0.1');
    });

    it('should increment major version correctly', () => {
        expect(getNextVersionNumber('1.2.3', PackageReleaseType.Major)).toBe('2.0.0');
    });

    it('should increment minor version correctly', () => {
        expect(getNextVersionNumber('1.2.3', PackageReleaseType.Minor)).toBe('1.3.0');
    });

    it('should increment patch version correctly', () => {
        expect(getNextVersionNumber('1.2.3', PackageReleaseType.Patch)).toBe('1.2.4');
    });

    it('should handle incomplete version strings', () => {
        expect(getNextVersionNumber('1', PackageReleaseType.Minor)).toBe('1.1.0');
    });

    it('should return original version for unknown release type', () => {
        expect(getNextVersionNumber('1.0.0', 'OTHER' as never)).toBe('1.0.0');
    });
});

describe('convert_MMM_DD_YYYY', () => {
    it('should return formatted date', () => {
        const date = '2025-06-13T00:00:00Z';
        const expected = moment(new Date(date)).format('MMM DD, YYYY');
        expect(convert_MMM_DD_YYYY(date)).toBe(expected);
    });

    it('should return input when date is falsy', () => {
        expect(convert_MMM_DD_YYYY('')).toBe('');
    });
});

describe('formatExecutionTimestamp', () => {
    it('should format with custom label', () => {
        const date = '2025-04-22T08:30:22Z';
        const result = formatExecutionTimestamp(date, 'Executed on');
        expect(result).toMatch(/^Executed on/);
    });

    it('should return undefined for invalid date', () => {
        expect(formatExecutionTimestamp('not-a-date')).toBeUndefined();
    });

    it('should return undefined for empty date', () => {
        expect(formatExecutionTimestamp('')).toBeUndefined();
    });
});

describe('toQueryParams', () => {
    it('should return undefined for undefined filter', () => {
        expect(toQueryParams(undefined)).toBeUndefined();
    });

    it('should return undefined if all values empty', () => {
        const filter = { a: '', b: '' };
        expect(toQueryParams(filter)).toBeUndefined();
    });
});

describe('validateJsonStructure', () => {
    it('should return true for valid JSON', () => {
        expect(validateJsonStructure('{"name": "John", "age": 30}')).toBe(true);
    });

    it('should return error for invalid JSON', () => {
        expect(validateJsonStructure('{name: John}')).toBe('All property keys must be enclosed in double quotes');
    });

    it('should return error for empty object', () => {
        expect(validateJsonStructure('{}')).toBe('Object must have at least one property');
    });

    it('should return error for malformed JSON', () => {
        expect(validateJsonStructure('{"a": 1,')).toBe('Please enter a valid JSON object');
    });

    it('should reject array structure when not allowed', () => {
        expect(validateJsonStructure('["a", "b"]')).toBe('Structure should be an object');
    });

    it('should allow array structure when allowArray is true', () => {
        expect(validateJsonStructure('[{"name": "test"}]', true)).toBe(true);
    });

    it('should reject empty array when allowArray is true', () => {
        expect(validateJsonStructure('[]', true)).toBe('Array must contain at least one object');
    });

    it('should reject array with non-object items', () => {
        expect(validateJsonStructure('["string"]', true)).toBe('Each array item must be a non-empty object');
        expect(validateJsonStructure('[123]', true)).toBe('Each array item must be a non-empty object');
        expect(validateJsonStructure('[null]', true)).toBe('Each array item must be a non-empty object');
    });

    it('should reject array with empty objects', () => {
        expect(validateJsonStructure('[{}]', true)).toBe('Each array item must be a non-empty object');
    });

    it('should return specific error message for invalid type when allowArray is true but input is not object/array', () => {
        expect(validateJsonStructure('123', true)).toBe('Structure should be an object or array');
        expect(validateJsonStructure('"string"', true)).toBe('Structure should be an object or array');
    });

    it('should handle placeholders gracefully', () => {
        // Quoted placeholder (Standard JSON)
        expect(validateJsonStructure('{"name": "{{Variable:name}}"}')).toBe(true);
        expect(validateJsonStructure('{"meta": "{{Metadata:info}}"}')).toBe(true);

        // Unquoted placeholder (JSON-like)
        expect(validateJsonStructure('{"name": {{Variable:name}}}')).toBe(true);
    });
});

describe('validateHostPort', () => {
    it('should return error when value is undefined', () => {
        expect(validateHostPort(undefined)).toBe('Please enter a Host with Port Number');
    });

    it('should return true for valid domain:port', () => {
        expect(validateHostPort('example.com:8080')).toBe(true);
    });

    it('should return true for localhost', () => {
        expect(validateHostPort('localhost:3000')).toBe(true);
    });

    it('should return true for valid IPv4 address', () => {
        expect(validateHostPort('192.168.1.1:8080')).toBe(true);
    });

    it('should reject invalid format (with protocol)', () => {
        expect(validateHostPort('http://localhost:3000')).toBe('Invalid host and port format');
    });

    it('should reject invalid domain without port', () => {
        expect(validateHostPort('localhost')).toBe('Invalid host and port format');
    });

    it('should reject invalid port number', () => {
        expect(validateHostPort('127.0.0.1:70000')).toBe('Port must be between 1 and 65535');
    });
});

describe('validateUrlWithPort', () => {
    it('should require a value', () => {
        expect(validateUrlWithPort(undefined, 'Endpoint')).toBe('Please enter an Endpoint');
    });

    it('should reject leading/trailing spaces', () => {
        expect(validateUrlWithPort(' http://localhost:3000', 'Endpoint')).toBe('No leading spaces in Endpoint');
        expect(validateUrlWithPort('http://localhost:3000 ', 'Endpoint')).toBe('No trailing spaces in Endpoint');
    });

    it('should reject missing http/https', () => {
        expect(validateUrlWithPort('ftp://localhost:3000', 'Endpoint')).toBe('Invalid URL format in Endpoint');
    });

    it('should reject invalid hostname', () => {
        expect(validateUrlWithPort('http://@@@:3000', 'Endpoint')).toBe('Invalid URL in Endpoint');
    });

    it('should reject path in URL', () => {
        expect(validateUrlWithPort('http://localhost:3000/api', 'Endpoint')).toBe(
            'URL in Endpoint should not have a path'
        );
    });

    it('should reject trailing slash', () => {
        expect(validateUrlWithPort('http://localhost:3000/', 'Endpoint')).toBe(
            'URL in Endpoint should not end with a slash'
        );
    });

    it('should accept valid URL', () => {
        expect(validateUrlWithPort('http://localhost:3000', 'Endpoint')).toBe(true);
    });
});

describe('hasPathParam', () => {
    it('should detect path parameters', () => {
        expect(hasPathParam('/users/{id}')).toBe(true);
    });

    it('should return false for normal paths', () => {
        expect(hasPathParam('/users/123')).toBe(false);
    });
});

describe('validateApiUrl', () => {
    it('should require endpoint', () => {
        expect(validateApiUrl(undefined)).toBe('Endpoint URL is required.');
    });

    it('should reject invalid format', () => {
        expect(validateApiUrl('www.example.com')).toBe('Endpoint must be a full URL.');
    });

    it('should reject URLs with spaces', () => {
        expect(validateApiUrl('https://example .com')).toBe('Endpoint URL cannot contain spaces');
    });

    it('should reject invalid URL pattern', () => {
        expect(validateApiUrl('https://example..com')).toBe('Invalid URL pattern');
    });

    it('should accept valid URL', () => {
        expect(validateApiUrl('https://example.com')).toBe(true);
    });
});

describe('validateHeaderField', () => {
    it('should require value when header name provided', () => {
        expect(validateHeaderField('', 'Header Value', 'X-Test')).toBe(
            'Value is required when Header Name is provided.'
        );
    });

    it('should require field when marked required', () => {
        expect(validateHeaderField('', 'Header Name', true)).toBe('Header Name is required.');
    });

    it('should accept valid field', () => {
        expect(validateHeaderField('Auth', 'Header Name')).toBe(true);
    });
});

describe('validateApiDescription', () => {
    it('should require description', () => {
        expect(validateApiDescription('')).toBe('Description is required.');
    });
    it('should reject too short/long', () => {
        expect(validateApiDescription('abc')).toBe('Description must be at least 5 characters long.');
        expect(validateApiDescription('a'.repeat(2001))).toBe('Description must be no more than 2000 characters long.');
    });
    it('should accept valid description', () => {
        expect(validateApiDescription('A detailed description.')).toBe(true);
    });
});

describe('validateParameterName', () => {
    it('should reject short/long names', () => {
        expect(validateParameterName('A')).toBe('Parameter name must be at least 2 characters long.');
        expect(validateParameterName('A'.repeat(256))).toBe('Parameter name must be no more than 255 characters long.');
    });
    it('should accept valid name', () => {
        expect(validateParameterName('userId')).toBe(true);
    });
});

describe('validateParameterDescription', () => {
    it('should reject short/long descriptions', () => {
        expect(validateParameterDescription('abc')).toBe('Parameter description must be at least 5 characters long.');
        expect(validateParameterDescription('a'.repeat(2001))).toBe(
            'Parameter description cannot exceed 2000 characters.'
        );
    });
    it('should accept valid description', () => {
        expect(validateParameterDescription('A valid parameter description')).toBe(true);
    });
});

describe('validateParameterValue', () => {
    it('should require value', () => {
        expect(validateParameterValue('', 'int')).toBe('Parameter value is required for testing.');
    });

    it('should validate integers', () => {
        expect(validateParameterValue('123', 'int')).toBe(true);
        expect(validateParameterValue('12.3', 'int')).toBe('Value must be an integer (e.g., 123, -456).');
    });

    it('should validate floats', () => {
        expect(validateParameterValue('123.45', 'float')).toBe(true);
        expect(validateParameterValue('abc', 'float')).toBe('Value must be a valid number (e.g., 123.45, -67.89).');
    });

    it('should validate booleans', () => {
        expect(validateParameterValue('yes', 'bool')).toBe('Value must be true, false, 0, or 1 for boolean type.');
        expect(validateParameterValue('true', 'bool')).toBe(true);
    });
});

describe('validateHeaderName', () => {
    it('should reject invalid/short/long names', () => {
        expect(validateHeaderName('')).toBe('Header name is required.');
        expect(validateHeaderName('A')).toBe('Header name must be at least 2 characters long.');
        expect(validateHeaderName('A'.repeat(256))).toBe('Header name must be no more than 255 characters long.');
        expect(validateHeaderName('Invalid Name')).toBe('Header name contains invalid characters.');
    });

    it('should accept valid header name', () => {
        expect(validateHeaderName('X-Token')).toBe(true);
    });
});

describe('validateVaultKey', () => {
    it('should require vault key', () => {
        expect(validateVaultKey(undefined)).toBe('Vault key is required.');
    });
    it('should accept valid key', () => {
        expect(validateVaultKey('secure-key')).toBe(true);
    });
});

describe('validateSql', () => {
    it('should reject empty query', () => {
        expect(validateSql('')).toBe('Query cannot be empty');
    });

    it('should return valid for SELECT', () => {
        expect(validateSql('SELECT * FROM users')).toBe(true);
    });

    it('should reject if not allowed statement', () => {
        expect(validateSql('DELETE FROM users', ['select'])).toBe('Only select statement allowed');
    });
});

describe('formatIntellisenseTokens', () => {
    it('should wrap correctly', () => {
        expect(formatIntellisenseTokens('Variable:path_name', 'wrap')).toBe('{{Variable:path_name}}');
    });
    it('should unwrap correctly', () => {
        expect(formatIntellisenseTokens('{{Variable:path_name}}', 'unwrap')).toBe('Variable:path_name');
    });
});

describe('fileConvert', () => {
    const textContent = 'Hello, world!';
    const mimeType = 'text/plain';
    const fileName = 'test.txt';
    const base64String = btoa(textContent);
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    describe('fileToBase64', () => {
        it('should convert a File to a Base64 data URL', async () => {
            const file = new File([textContent], fileName, { type: mimeType });

            const result = await fileToBase64(file);

            expect(result.startsWith(`data:${mimeType};base64,`)).toBe(true);
            expect(result.includes(base64String)).toBe(true);
        });
    });

    describe('base64ToFile', () => {
        it('should convert a Base64 data URL back to a File with correct metadata', async () => {
            const file = await base64ToFile(dataUrl, fileName);

            expect(file).toBeInstanceOf(File);
            expect(file.name).toBe(fileName);
            expect(file.type).toBe(mimeType);

            const resultDataUrl = await fileToBase64(file);
            expect(resultDataUrl).toBe(dataUrl);
        });
    });

    describe('round-trip conversion', () => {
        it('should preserve Base64 data through fileToBase64 → base64ToFile cycle', async () => {
            const originalFile = new File([textContent], fileName, { type: mimeType });

            const encoded = await fileToBase64(originalFile);
            const decodedFile = await base64ToFile(encoded, fileName);

            const reEncoded = await fileToBase64(decodedFile);

            expect(reEncoded).toBe(encoded);
        });
    });

    describe('error handling', () => {
        it('should reject if base64DataUrl is invalid', async () => {
            await expect(base64ToFile('invalid-base64')).rejects.toThrow();
        });
    });
});

describe('validateIdentifier', () => {
    it('should return true for a valid identifier', () => {
        expect(validateIdentifier('validName')).toBe(true);
        expect(validateIdentifier('valid_name')).toBe(true);
        expect(validateIdentifier('Valid_Name_123')).toBe(true);
        expect(validateIdentifier('_underscoreStart')).toBe(true);
    });

    it('should reject identifiers with leading spaces', () => {
        expect(validateIdentifier(' name')).toBe('No leading spaces in variable name');
    });

    it('should reject identifiers with trailing spaces', () => {
        expect(validateIdentifier('name ')).toBe('No trailing spaces in variable name');
    });

    it('should reject identifiers containing invalid characters', () => {
        expect(validateIdentifier('name-test')).toBe('Letters, digits and _ only allowed');
        expect(validateIdentifier('name.test')).toBe('Letters, digits and _ only allowed');
        expect(validateIdentifier('name@123')).toBe('Letters, digits and _ only allowed');
    });

    it('should reject identifiers that do not start with a letter or underscore', () => {
        expect(validateIdentifier('1name')).toBe('Variable name must be a valid key');
        expect(validateIdentifier('9_var')).toBe('Variable name must be a valid key');
    });

    it('should use the provided field name in error messages', () => {
        expect(validateIdentifier(' name', 'custom field')).toBe('No leading spaces in custom field');

        expect(validateIdentifier('1abc', 'custom field')).toBe('Custom field must be a valid key');
    });

    it('should return true when value is empty or undefined', () => {
        expect(validateIdentifier('', 'variable name')).toBe(true);
        expect(validateIdentifier(undefined as unknown as string)).toBe(true);
    });
});
