'use client';

import type React from 'react';
import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/atoms';

interface QueryEditorProps {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    error?: string;
    initialValue?: string;
    onValidQuery?: (query: ParsedQuery) => void;
    placeholder?: string;
    required?: boolean;
}

interface ParsedQuery {
    conditions: Condition[];
    logic: string[];
    isValid: boolean;
}

interface Condition {
    field: string;
    operator: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    type: 'string' | 'number' | 'boolean' | 'array';
}

interface QueryEditorRef {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
    getParsedQuery: () => ParsedQuery | null;
    setValue: (value: string) => void;
    formatQuery: () => void;
    isValid: () => boolean;
    insertCondition: (condition: string) => void;
}

function getQueryEditorTextareaClassName(disabled: boolean, error: string | null | undefined): string {
    if (disabled) return 'cursor-not-allowed opacity-60';
    if (error) return 'border-red-300';
    return '';
}

function splitByAndOr(text: string): string[] {
    const parts: string[] = [];
    const lower = text.toLowerCase();
    let start = 0;
    while (start < text.length) {
        const andIdx = lower.indexOf(' and ', start);
        const orIdx = lower.indexOf(' or ', start);
        let nextIdx = -1;
        let op = '';
        if (andIdx >= 0 && (orIdx < 0 || andIdx <= orIdx)) {
            nextIdx = andIdx;
            op = 'AND';
        } else if (orIdx >= 0) {
            nextIdx = orIdx;
            op = 'OR';
        }
        if (nextIdx < 0) {
            parts.push(text.slice(start).trim());
            break;
        }
        parts.push(text.slice(start, nextIdx).trim(), op);
        start = nextIdx + (op === 'AND' ? 5 : 4);
    }
    return parts;
}

const QueryEditor = forwardRef<QueryEditorRef, QueryEditorProps>(
    (
        {
            name,
            value: controlledValue,
            defaultValue = '',
            onChange,
            onBlur,
            disabled = false,
            error: externalError,
            initialValue = '',
            onValidQuery,
            placeholder = 'Enter valid JSON or query like: { "age" >= 10 AND "category" == ["section"] }',
            required = false,
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState(controlledValue || defaultValue || initialValue);
        const [internalError, setInternalError] = useState<string | null>(null);
        const [isValid, setIsValid] = useState(false);
        const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // Use controlled value if provided, otherwise use internal state
        const value = controlledValue ?? internalValue;

        // Combine external and internal errors
        const error = externalError || internalError;

        useImperativeHandle(ref, () => ({
            focus: () => textareaRef.current?.focus(),
            blur: () => textareaRef.current?.blur(),
            getValue: () => value,
            getParsedQuery: () => parsedQuery,
            setValue: (newValue: string) => {
                if (controlledValue === undefined) {
                    setInternalValue(newValue);
                } else {
                    onChange?.(newValue);
                }
                validateQuery(newValue);
            },
            formatQuery: () => formatQuery(),
            isValid: () => isValid,
            insertCondition: (condition: string) => insertCondition(condition),
        }));

        const parseQuerySyntax = (cleaned: string): ParsedQuery => {
            const parts = splitByAndOr(cleaned);
            const conditions: Condition[] = [];
            const logic: string[] = [];
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                    const condition = parseCondition(parts[i].trim());
                    if (condition) conditions.push(condition);
                } else {
                    logic.push(parts[i].toUpperCase());
                }
            }
            return {
                conditions,
                logic,
                isValid:
                    conditions.length > 0 &&
                    conditions.every(c => c.field && c.operator && c.value !== undefined),
            };
        };

        const parseQuery = (queryString: string): ParsedQuery => {
            const trimmed = queryString.trim();
            if (trimmed.length === 0) return { conditions: [], logic: [], isValid: false };

            try {
                JSON.parse(trimmed);
                return { conditions: [], logic: [], isValid: true };
            } catch {
                try {
                    const cleaned = trimmed.replaceAll(/(?:^\{|}$)/g, '').trim();
                    if (cleaned.length === 0) return { conditions: [], logic: [], isValid: false };
                    return parseQuerySyntax(cleaned);
                } catch {
                    return { conditions: [], logic: [], isValid: false };
                }
            }
        };

        const parseCondition = (conditionStr: string): Condition | null => {
            const ops = ['>=', '<=', '==', '!=', '>', '<'];
            let bestOp: string | null = null;
            let bestIdx = -1;
            for (const op of ops) {
                const idx = conditionStr.indexOf(op);
                if (idx >= 0 && (bestIdx < 0 || idx < bestIdx)) {
                    if (isOutsideQuotes(conditionStr, idx)) {
                        bestOp = op;
                        bestIdx = idx;
                    }
                }
            }
            if (bestOp == null || bestIdx < 0) return null;
            const fieldPart = conditionStr.slice(0, bestIdx).trim();
            const valueStr = conditionStr.slice(bestIdx + bestOp.length).trim();
            const field = parseField(fieldPart);
            if (field != null && valueStr.length > 0) {
                const { value, type } = parseValue(valueStr);
                return { field, operator: bestOp, value, type };
            }
            return null;
        };

        const isOutsideQuotes = (s: string, pos: number): boolean => {
            let inDouble = false;
            let inSingle = false;
            for (let i = 0; i < pos; i++) {
                const c = s[i];
                if (c === '"' && (i === 0 || s[i - 1] !== '\\')) inDouble = !inDouble;
                else if (c === "'" && (i === 0 || s[i - 1] !== '\\')) inSingle = !inSingle;
            }
            return !inDouble && !inSingle;
        };

        const parseField = (fieldPart: string): string | null => {
            const t = fieldPart.trim();
            if (t.length === 0) return null;
            if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                return t.slice(1, -1).trim();
            }
            if (/^[a-zA-Z_]\w*$/.test(t)) return t;
            return null;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parseValue = (valueStr: string): { value: any; type: 'string' | 'number' | 'boolean' | 'array' } => {
            // Try to parse as JSON first (for arrays, objects, etc.)
            try {
                const parsed = JSON.parse(valueStr);
                if (Array.isArray(parsed)) {
                    return { value: parsed, type: 'array' };
                }
                if (typeof parsed === 'boolean') {
                    return { value: parsed, type: 'boolean' };
                }
                if (typeof parsed === 'number') {
                    return { value: parsed, type: 'number' };
                }
                return { value: parsed, type: 'string' };
            } catch {
                // If not valid JSON, treat as string or number
                if (!Number.isNaN(Number(valueStr))) {
                    return { value: Number(valueStr), type: 'number' };
                }
                if (valueStr.toLowerCase() === 'true' || valueStr.toLowerCase() === 'false') {
                    return { value: valueStr.toLowerCase() === 'true', type: 'boolean' };
                }
                return { value: valueStr, type: 'string' };
            }
        };

        const setValidationError = useCallback((message: string | null, valid: boolean) => {
            setInternalError(message);
            setIsValid(valid);
            if (!valid) setParsedQuery(null);
        }, []);

        const getConditionValidationError = (parsed: ParsedQuery): string | null => {
            if (parsed.isValid) return null;
            return 'Invalid JSON or query syntax. Use valid JSON or format: { "field" operator value AND/OR "field2" operator value2 }';
        };

        const validateConditions = (parsed: ParsedQuery): string | null => {
            const validOps = new Set(['>=', '<=', '>', '<', '==', '!=']);
            for (const condition of parsed.conditions) {
                if (condition.field == null || condition.field === '') return 'Field name is required';
                if (!validOps.has(condition.operator)) {
                    return `Invalid operator: ${condition.operator}. Use: >=, <=, >, <, ==, !=`;
                }
            }
            return null;
        };

        const validateQuery = useCallback(
            (queryString: string) => {
                if (queryString.trim().length === 0) {
                    setValidationError(required ? 'Query is required' : null, false);
                    return;
                }

                try {
                    JSON.parse(queryString);
                    setValidationError(null, true);
                    const parsed = { conditions: [], logic: [], isValid: true };
                    setParsedQuery(parsed);
                    onValidQuery?.(parsed);
                    return;
                } catch {
                    try {
                        const parsed = parseQuery(queryString);
                        const invalidMsg = getConditionValidationError(parsed);
                        if (invalidMsg) {
                            setValidationError(invalidMsg, false);
                            return;
                        }
                        const condError = validateConditions(parsed);
                        if (condError) {
                            setValidationError(condError, false);
                            return;
                        }
                        setValidationError(null, true);
                        setParsedQuery(parsed);
                        onValidQuery?.(parsed);
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : 'Invalid JSON or query syntax';
                        setValidationError(msg, false);
                    }
                }
            },
            [onValidQuery, required, setValidationError]
        );

        const formatQuery = useCallback(() => {
            if (!value.trim()) return;

            try {
                // Try to parse and format as JSON first
                const parsed = JSON.parse(value);
                const formatted = JSON.stringify(parsed, null, 2);

                if (controlledValue === undefined) {
                    setInternalValue(formatted);
                } else {
                    onChange?.(formatted);
                }
                validateQuery(formatted);
                return;
            } catch {
                // If not valid JSON, try the old query syntax formatting
                try {
                    const parsed = parseQuery(value);
                    if (parsed.isValid && parsed.conditions.length > 0) {
                        let formatted = '{\n';

                        parsed.conditions.forEach((condition, index) => {
                            const valueStr =
                                condition.type === 'array' || condition.type === 'string'
                                    ? JSON.stringify(condition.value)
                                    : String(condition.value);

                            formatted += `  "${condition.field}" ${condition.operator} ${valueStr}`;

                            if (index < parsed.logic.length) {
                                formatted += ` ${parsed.logic[index]}\n`;
                            }
                        });

                        formatted += '\n}';

                        if (controlledValue === undefined) {
                            setInternalValue(formatted);
                        } else {
                            onChange?.(formatted);
                        }
                        validateQuery(formatted);
                    } else {
                        validateQuery(value);
                    }
                } catch {
                    validateQuery(value);
                }
            }
        }, [value, controlledValue, onChange, validateQuery]);

        const insertCondition = (conditionTemplate: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.slice(0, start) + conditionTemplate + value.slice(end);

            if (controlledValue === undefined) {
                setInternalValue(newValue);
            } else {
                onChange?.(newValue);
            }

            // Set cursor position after the inserted text
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + conditionTemplate.length;
            }, 0);
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;

            if (controlledValue === undefined) {
                setInternalValue(newValue);
            } else {
                onChange?.(newValue);
            }
            validateQuery(newValue);
        };

        const handleBlur = () => {
            onBlur?.();
        };

        const handleEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const val = textarea.value;
            const lineStart = val.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = val.indexOf('\n', start);
            const currentLine = val.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const indent = /^\s*/.exec(currentLine)?.[0] ?? '';

            e.preventDefault();
            const newValue = val.slice(0, start) + '\n' + indent + val.slice(start);
            if (controlledValue === undefined) {
                setInternalValue(newValue);
            } else {
                onChange?.(newValue);
            }
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
            }, 0);
        };

        const handleEqualsKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const beforeCursor = value.slice(0, start);

            if (beforeCursor.endsWith('=')) {
                e.preventDefault();
                return;
            }
            if (/"\w+"\s*$/.exec(beforeCursor)) {
                e.preventDefault();
                const newValue = value.slice(0, start) + ' == ' + value.slice(start);
                if (controlledValue === undefined) {
                    setInternalValue(newValue);
                } else {
                    onChange?.(newValue);
                }
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 4;
                }, 0);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') handleEnterKey(e);
            else if (e.key === '=' && !e.shiftKey) handleEqualsKey(e);
        };

        useEffect(() => {
            validateQuery(value);
        }, [value, validateQuery]);

        return (
            <div className="w-full max-w-4xl mx-auto space-y-0">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        name={name}
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        className={`w-full min-h-[200px] bg-white dark:bg-gray-700 p-4 pr-16 font-mono text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent ${getQueryEditorTextareaClassName(disabled, error)}`}
                        spellCheck={false}
                        style={{}}
                    />

                    {/* Floating Format Button */}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={formatQuery}
                        disabled={!value.trim() || disabled}
                        className="absolute top-2 right-2 h-8 px-3 backdrop-blur-sm border shadow-sm hover:bg-white/95 transition-all duration-200 disabled:opacity-50"
                        title="Format Query"
                    >
                        <Wand2 className="h-3 w-3" />
                    </Button>

                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                        Lines: {value.split('\n').length} | Chars: {value.length}
                    </div>
                </div>

                {error && <p className="text-xs font-normal text-red-500 dark:text-red-500">{error}</p>}
            </div>
        );
    }
);

QueryEditor.displayName = 'QueryEditor';

export default QueryEditor;
