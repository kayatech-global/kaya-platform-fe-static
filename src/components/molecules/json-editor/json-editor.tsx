/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';
import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    hideFormatter?: boolean;
    error?: string;
    initialValue?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValidJson?: (json: any) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    maxHeight?: number;
    isAutoHeight?: boolean;
}

interface JsonEditorRef {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
    formatJson: () => void;
    isValid: () => boolean;
}

function getTextareaClassName(disabled: boolean, error: string | null | undefined): string {
    if (disabled) return 'bg-gray-100 cursor-not-allowed opacity-60';
    if (error) return 'border-red-300';
    return '';
}

const JsonEditor = forwardRef<JsonEditorRef, JsonEditorProps>(
    (
        {
            name,
            value: controlledValue,
            defaultValue = '',
            onChange,
            onBlur,
            disabled = false,
            readOnly = false,
            hideFormatter = false,
            error: externalError,
            initialValue = '',
            onValidJson,
            placeholder = 'Enter JSON here...',
            required = false,
            className,
            maxHeight,
            isAutoHeight,
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState(controlledValue || defaultValue || initialValue);
        const [internalError, setInternalError] = useState<string | null>(null);
        const [isValid, setIsValid] = useState(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [_parsedJson, setParsedJson] = useState<unknown>(null);
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // Use controlled value if provided, otherwise use internal state
        const value = controlledValue !== undefined ? controlledValue : internalValue;

        // Combine external and internal errors
        const error = externalError || internalError;

        useEffect(() => {
            if (maxHeight && maxHeight > 0 && isAutoHeight && textareaRef?.current) {
                const scrollHeight = textareaRef.current.scrollHeight;
                const clampedHeight = Math.max(200, Math.min(scrollHeight, maxHeight));

                textareaRef.current.style.height = `${clampedHeight}px`;
            }
        }, [maxHeight, isAutoHeight, textareaRef]);

        useImperativeHandle(ref, () => ({
            focus: () => textareaRef.current?.focus(),
            blur: () => textareaRef.current?.blur(),
            getValue: () => value,
            setValue: (newValue: string) => {
                if (controlledValue !== undefined) {
                    onChange?.(newValue);
                } else {
                    setInternalValue(newValue);
                }
                validateJson(newValue);
            },
            formatJson: () => formatJson(),
            isValid: () => isValid,
        }));

        const validateJson = useCallback(
            (jsonString: string) => {
                if (!jsonString.trim()) {
                    if (required) {
                        setInternalError('JSON is required');
                        setIsValid(false);
                    } else {
                        setInternalError(null);
                        setIsValid(false);
                    }
                    setParsedJson(null);
                    return;
                }

                try {
                    const parsed = JSON.parse(jsonString);
                    setInternalError(null);
                    setIsValid(true);
                    setParsedJson(parsed);
                    onValidJson?.(parsed);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
                    setInternalError(errorMessage);
                    setIsValid(false);
                    setParsedJson(null);
                }
            },
            [onValidJson, required]
        );

        const formatJson = useCallback(() => {
            if (!value.trim()) return;

            try {
                const parsed = JSON.parse(value);
                const formatted = JSON.stringify(parsed, null, 2);

                if (controlledValue !== undefined) {
                    onChange?.(formatted);
                } else {
                    setInternalValue(formatted);
                }
                validateJson(formatted);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                validateJson(value);
            }
        }, [value, controlledValue, onChange, validateJson]);

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;

            if (controlledValue !== undefined) {
                onChange?.(newValue);
            } else {
                setInternalValue(newValue);
            }
            validateJson(newValue);
        };

        const handleBlur = () => {
            onBlur?.();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Auto-indent on Enter
            if (e.key === 'Enter') {
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const value = textarea.value;
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineEnd = value.indexOf('\n', start);
                const currentLine = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
                const indent = currentLine.match(/^\s*/)?.[0] || '';

                // Add extra indent if line ends with { or [
                const extraIndent = /[{[]$/.test(currentLine.trim()) ? '  ' : '';

                e.preventDefault();
                const newValue = value.slice(0, start) + '\n' + indent + extraIndent + value.slice(start);
                if (controlledValue !== undefined) {
                    onChange?.(newValue);
                } else {
                    setInternalValue(newValue);
                }

                // Set cursor position after the indent
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extraIndent.length;
                }, 0);
            }

            // Auto-close brackets
            if (e.key === '{') {
                e.preventDefault();
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.slice(0, start) + '{}' + value.slice(end);
                if (controlledValue !== undefined) {
                    onChange?.(newValue);
                } else {
                    setInternalValue(newValue);
                }
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                }, 0);
            }

            if (e.key === '[') {
                e.preventDefault();
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.slice(0, start) + '[]' + value.slice(end);
                if (controlledValue !== undefined) {
                    onChange?.(newValue);
                } else {
                    setInternalValue(newValue);
                }
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                }, 0);
            }
        };

        useEffect(() => {
            validateJson(value);
        }, [value, validateJson]);

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
                        readOnly={readOnly}
                        required={required}
                        className={cn(
                            `w-full min-h-[100px] p-4 pr-16 font-mono text-sm border rounded-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-300 ${getTextareaClassName(disabled, error)}`,
                            className
                        )}
                        spellCheck={false}
                    />

                    {/* Floating Format Button */}
                    {!hideFormatter && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={formatJson}
                            disabled={!value.trim() || disabled}
                            className="absolute top-2 right-2 h-8 px-3 bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-white/95 transition-all duration-200 disabled:opacity-50"
                            title="Format JSON (Ctrl+Shift+F)"
                        >
                            <Wand2 className="h-3 w-3" />
                        </Button>
                    )}

                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                        Lines: {value.split('\n').length} | Chars: {value.length}
                    </div>
                </div>
                {error && <p className="text-xs font-normal text-red-500 dark:text-red-500">JSON Error: {error}</p>}
            </div>
        );
    }
);

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
