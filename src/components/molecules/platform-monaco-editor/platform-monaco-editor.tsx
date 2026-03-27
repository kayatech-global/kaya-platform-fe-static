// index.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/atoms/tooltip';
import { Info } from 'lucide-react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor, IDisposable } from 'monaco-editor';
import { useTheme } from '@/theme';
import { cn, isNullOrEmpty } from '@/lib/utils';
import IntellisenseWidget, {
    IntellisenseWidgetHandle,
} from '@/app/workspace/[wid]/prompt-templates/components/intellisense-widget';
import { usePlatformIntellisense } from './use-platform-intellisense';
import { useKeyboardNavigation } from './use-keyboard-navigation';
import { applyMonacoTheme } from './apply-monaco-theme';
import { setupMonarchTokens } from './setup-monarch-tokens';
import { IntellisenseOption } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { PlatformMonacoEditorProps } from './types';
import { registerCustomSQLIntellisense, registerPythonIntellisense } from './apply-platform-intellisense';
import './platform-monaco-editor-styles.css';
import { ICoord } from '@/models';

export default function PlatformMonacoEditor({
    value,
    readOnly,
    height,
    onFocusHeight,
    isDestructive,
    placeholder,
    helperInfo,
    disabled,
    enableCategoryIcon,
    onChange,
    intellisenseData,
    onBlur,
    disableIntelligencePopover = false,
    supportiveText,
    label,
    language,
    onRefetchVariables,
}: Readonly<PlatformMonacoEditorProps>) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [showIntellisense, setShowIntellisense] = useState(disableIntelligencePopover);
    const [intellisensePosition, setIntellisensePosition] = useState({ x: 0, y: 0 });
    const intellisenseRef = useRef<IntellisenseWidgetHandle>(null);
    const [keyboardDisposable, setKeyboardDisposable] = useState<IDisposable | null>(null);
    const [isAtTrigger, setIsAtTrigger] = useState(false);
    const [isFocus, setFocus] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [internalChange, setInternalChange] = useState(false);
    const [currentCoords, setCurrentCoords] = useState<ICoord | null>(null);
    const [editorCurrentDomNode, setEditorCurrentDomNode] = useState<HTMLElement | null>(null);
    const [intellisenseHeight, setIntellisenseHeight] = useState<number | undefined>(undefined);
    const previousValueRef = useRef('');
    const { theme } = useTheme();

    const patterns = usePlatformIntellisense(intellisenseData);
    // Demo stub: no real API calls needed in fe-static
    const [isVariableDialogOpen, setVariableDialogOpen] = useState(false);

    // attach keyboard navigation
    useKeyboardNavigation(
        editorRef,
        showIntellisense,
        intellisenseRef,
        setShowIntellisense,
        keyboardDisposable,
        setKeyboardDisposable
    );

    useEffect(() => {
        if (editorRef.current && !internalChange && value !== previousValueRef.current) {
            editorRef.current.setValue(value);
            previousValueRef.current = value;
        }
        setInternalChange(false);
    }, [value, internalChange]);

    useEffect(() => {
        if (
            !disableIntelligencePopover &&
            showIntellisense &&
            currentCoords &&
            editorCurrentDomNode &&
            intellisenseHeight
        ) {
            const widgetWidth = 300;

            const isTooFarRight = currentCoords.left + widgetWidth >= editorCurrentDomNode.clientWidth;
            const isTooFarBottom = currentCoords.top + intellisenseHeight >= editorCurrentDomNode.clientHeight;

            const safeSubtract = (value: number) => {
                return value < 0 ? 0 : value;
            };

            // Set the position for the intellisense widget, adjusting if it would overflow
            setIntellisensePosition({
                x: isTooFarRight ? safeSubtract(currentCoords.left - widgetWidth) + 10 : currentCoords.left,
                y: isTooFarBottom ? safeSubtract(currentCoords.top - intellisenseHeight) + 10 : currentCoords.top + 20,
            });
        }
    }, [disableIntelligencePopover, showIntellisense, currentCoords, editorCurrentDomNode, intellisenseHeight]);

    // (variable creation effect omitted — demo mode, no real API)

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        applyMonacoTheme(monaco, theme);
        setupMonarchTokens(monaco, patterns);

        // Register custom intellisense
        if (language === 'custom-sql') {
            registerCustomSQLIntellisense(monaco);
        } else if (language === 'custom-python') {
            registerPythonIntellisense(monaco);
        }

        editor.updateOptions({
            lineNumbers: 'off',
            minimap: { enabled: false },
            wordWrap: 'on',
            renderLineHighlight: 'none',
            padding: { top: 16, bottom: 16 },
            contextmenu: false,
            readOnly,
        });

        editor.onDidFocusEditorText(() => {
            onBlur?.();
            setFocus(true);
        });
        editor.onDidBlurEditorText(() => setFocus(false));

        const disposable = editor.onDidChangeModelContent(() => {
            // If this change was caused programmatically, ignore it to avoid feedback loops.
            if (internalChange) {
                // reset the flag and skip emitting to parent
                setInternalChange(false);
                return;
            }

            const newValue = editor.getValue();
            previousValueRef.current = newValue;
            onChange(newValue);

            const position = editor.getPosition();
            const model = editor.getModel();
            if (!position || !model) return;
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column - 1);
            const lastChar = textBeforeCursor.charAt(textBeforeCursor.length - 1);
            if (lastChar === '@') {
                const coords = editor.getScrolledVisiblePosition(position);
                const editorDomNode = editor.getDomNode();
                setCurrentCoords(coords);
                setEditorCurrentDomNode(editorDomNode);
                if (coords && editorDomNode) {
                    setIntellisensePosition({ x: coords.left, y: coords.top + 20 });
                    setIsAtTrigger(true);
                    setShowIntellisense(true);
                }
            }
        });

        return () => disposable.dispose();
    };

    const handleOptionSelect = (option: IntellisenseOption) => {
        if (!editorRef.current || !monacoRef.current) return;
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const position = editor.getPosition();
        const model = editor.getModel();
        if (!position || !model) return;

        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex !== -1) {
            const range = new monaco.Range(position.lineNumber, atIndex + 1, position.lineNumber, position.column);
            editor.executeEdits('intellisense', [{ range, text: option.value, forceMoveMarkers: true }]);
        }
        editor.focus();
        setShowIntellisense(false);
    };

    return (
        <div>
            {label && (
                <div className="flex items-center gap-x-2">
                    <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                        {label}
                        {helperInfo && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex items-center border-0 bg-transparent p-0 cursor-help"
                                        aria-label="More information"
                                    >
                                        <Info size={13} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center" className="max-w-[250px]">
                                    {helperInfo}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </label>
                </div>
            )}
            <div className="mt-[6px] w-full">
                <fieldset
                    aria-label="Code editor container"
                    className={cn(
                        'relative w-full border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden',
                        isHovering && onFocusHeight ? onFocusHeight : (height ?? 'h-[500px]'),
                        { '!border-red-300': isDestructive, '!pointer-events-none': disabled }
                    )}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                <div className="border-0 p-0 m-0 w-full h-full min-w-0" style={{ minWidth: 0 }}>
                {placeholder && !value && !isFocus && (
                    <pre className="absolute top-4 left-4 text-sm text-gray-400 font-mono pointer-events-none whitespace-pre-wrap">
                        {placeholder}
                    </pre>
                )}

                {helperInfo && isNullOrEmpty(value) && isFocus && (
                    <pre className="absolute top-4 left-4 text-sm text-gray-400 font-mono pointer-events-none whitespace-pre-wrap">
                        {helperInfo}
                    </pre>
                )}

                <Editor
                    height="100%"
                    defaultLanguage={language}
                    value={value}
                    onMount={handleEditorDidMount}
                    theme="customTheme"
                    options={{
                        fontSize: 14,
                        fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
                        scrollBeyondLastLine: false,
                        scrollbar: {
                            alwaysConsumeMouseWheel: false,
                        },
                    }}
                />

                {!disableIntelligencePopover && showIntellisense && (
                    <div
                        className="absolute z-[9999]"
                        style={{ left: `${intellisensePosition.x}px`, top: `${intellisensePosition.y}px` }}
                    >
                        <IntellisenseWidget
                            ref={intellisenseRef}
                            readOnly={readOnly}
                            categories={intellisenseData}
                            enableCategoryIcon={enableCategoryIcon}
                            onSelect={handleOptionSelect}
                            onClose={() => setShowIntellisense(false)}
                            onNewVariable={() => setVariableDialogOpen(true)}
                            isAtTrigger={isAtTrigger}
                            onHeightChange={value => setIntellisenseHeight(value)}
                        />
                    </div>
                )}
                </div>
                </fieldset>
            </div>
            {supportiveText && (
                <p
                    className={cn('text-xs font-normal mt-1', {
                        'text-red-500 dark:text-red-500': isDestructive,
                        'text-gray-500 dark:text-gray-300': !isDestructive,
                    })}
                >
                    {supportiveText}
                </p>
            )}

            {/* Variable dialog stub — demo only */}
            {isVariableDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setVariableDialogOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[400px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">New Variable</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                            Variable creation is available in the full platform.
                        </p>
                        <button
                            className="text-xs px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => setVariableDialogOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
