import React, { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

import { cn } from '@/lib/utils';
import { injectLanguageIntellisense } from './injectLanguageIntellisense';
import { applyEditorBehaviors } from './applyEditorBehaviors';
import './monaco-style.css';
import { useCodeFormatter } from './hooks/useCodeFormatter';
import { applyEditorTheme } from './apply-editor-theme';
import { useTheme } from '@/theme';

type EditorInputProps = {
    value?: string;
    defaultValue?: string;
    language: string;
    onChange?: (value: string | undefined) => void;
    height?: string;
    readOnly?: boolean;
    autoFormat?: boolean;
    label?: string;
    supportiveText?: string;
    isDestructive?: boolean;
};

const EditorInput: React.FC<EditorInputProps> = ({
    value,
    defaultValue,
    language,
    onChange,
    height = '240px',
    readOnly = false,
    autoFormat = true,
    label,
    supportiveText,
    isDestructive = false,
}) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

    const { handleFormat } = useCodeFormatter(editorRef, language);
    const { theme } = useTheme();

    const handleEditorMount: OnMount = useCallback(
        (editor, monacoInstance) => {
            editorRef.current = editor;

            applyEditorTheme(monacoInstance, theme);
            // Inject IntelliSense for specific language
            injectLanguageIntellisense(language, monacoInstance);
            // Apply editor behaviors (auto-format on mount)
            applyEditorBehaviors(editor, { autoFormat });
        },
        [language, autoFormat]
    );

    const handleChange = useCallback(
        (newValue?: string) => {
            onChange?.(newValue);
        },
        [onChange]
    );

    return (
        <div className="flex flex-col items-start gap-y-[6px] w-full">
            <div className="flex items-center justify-between w-full">
                {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-100">{label}</label>}
                {/* Format Button - only show if autoFormat is true */}
                {autoFormat && (
                    <button
                        type="button"
                        onClick={handleFormat}
                        className={cn(
                            'px-3 py-1.5 text-sm rounded-md border transition-colors font-medium',
                            'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100',
                            'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
                        )}
                    >
                        Format Code
                    </button>
                )}
            </div>

            <div
                className={cn(
                    'relative w-full rounded-lg border shadow-sm transition-colors',
                    'focus-within:ring-4 focus-within:outline-none',
                    'bg-white dark:bg-gray-700',
                    'border-gray-300 dark:border-gray-600',
                    {
                        '!border-red-300 !focus-within:border-red-300 focus-within:ring-[#FEE4E2]': isDestructive,
                    }
                )}
            >
                <div className="px-[0]">
                    <Editor
                        height={height}
                        language={language}
                        value={value}
                        defaultValue={defaultValue}
                        onChange={handleChange}
                        theme={'customTheme'}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            readOnly,
                            formatOnPaste: true,
                            formatOnType: true,
                            automaticLayout: true,
                            lineNumbers: 'off',
                            roundedSelection: true,
                            padding: { top: 12, bottom: 12 }, // vertical padding only
                            scrollbar: {
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                            },
                        }}
                    />
                </div>
            </div>

            {supportiveText && (
                <p
                    className={cn('text-xs font-normal', {
                        'text-red-500 dark:text-red-500': isDestructive,
                        'text-gray-500 dark:text-gray-300': !isDestructive,
                    })}
                >
                    {supportiveText}
                </p>
            )}
        </div>
    );
};

export default EditorInput;
