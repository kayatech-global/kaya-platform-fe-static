'use client';

import { useRef, useState, useEffect } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor, IDisposable } from 'monaco-editor';
import IntellisenseWidget, { IntellisenseWidgetHandle } from './intellisense-widget';
import { useTheme } from '@/theme';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Unplug, WandSparkles } from 'lucide-react';
import { cn, isNullOrEmpty } from '@/lib/utils';
import { useVariable } from '@/hooks/use-variable';
import { FormBody as VariableFormBody } from '@/app/workspace/[wid]/variables/components/variable-form';
import { ICoord } from '@/models';

// Define the structure for intellisense options
export interface IntellisenseOption {
    label: string;
    value: string;
    children?: IntellisenseOption[];
}

export interface IntellisenseCategory {
    name: string;
    options: IntellisenseOption[];
}

export enum IntellisenseTools {
    Agent = 'Agent',
    API = 'API',
    ExecutableFunction = 'ExecutableFunction',
    Variable = 'Variable',
    MCP = 'MCP',
    VectorRAG = 'VectorRAG',
    GraphRAG = 'GraphRAG',
    Metadata = 'Metadata',
    DatabaseConnector = 'DatabaseConnector',
}

interface MonacoEditorProps {
    value: string;
    hasEnhance?: boolean;
    readOnly?: boolean;
    height?: string;
    isEnhance?: boolean;
    disableEnhance?: boolean;
    isDestructive?: boolean;
    placeholder?: string;
    helperInfo?: string;
    disabled?: boolean;
    enableCategoryIcon?: boolean;
    autoWidgetHeight?: boolean;
    onChange: (value: string) => void;
    intellisenseData: IntellisenseCategory[];
    onEnhanceClick?: () => void;
    onRefetchVariables: () => Promise<void>;
    onBlur?: () => void;
    disableIntelligencePopover?: boolean;
}

// Utility to escape all regex-special characters
const escapeRegex = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

// Extract pipe-joined escaped values for a category
const getCategoryPatterns = (
    intellisenseData: IntellisenseCategory[],
    categoryName: string,
    filter?: (opt: IntellisenseOption) => boolean
): string => {
    const cat = intellisenseData.find(c => c.name === categoryName);
    const opts = filter ? cat?.options?.filter(filter) : cat?.options;
    return opts?.map(opt => escapeRegex(opt.value)).join('|') ?? '';
};

// Apply intellisense edit
const applyIntellisenseEdit = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
    position: { lineNumber: number; column: number },
    model: editor.ITextModel,
    option: IntellisenseOption,
    isAtTrigger: boolean
) => {
    if (isAtTrigger) {
        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex === -1) return;
        const range = new monaco.Range(
            position.lineNumber,
            atIndex + 1,
            position.lineNumber,
            position.column
        );
        editor.executeEdits('intellisense', [{ range, text: option.value, forceMoveMarkers: true }]);
    } else {
        const wordInfo = model.getWordUntilPosition(position);
        const range = new monaco.Range(
            position.lineNumber,
            wordInfo.startColumn,
            position.lineNumber,
            position.column
        );
        editor.executeEdits('intellisense', [{ range, text: option.value, forceMoveMarkers: true }]);
    }
    editor.focus();
};

// Build tokenizer root rules from pattern entries
const buildTokenRootValue = (
    entries: Array<{ patterns: string | undefined; token: string }>
): [RegExp, string][] => {
    const rootValue: [RegExp, string][] = [];
    for (const { patterns, token } of entries) {
        if (patterns) rootValue.push([new RegExp(String.raw`\b(${patterns})\b`), token]);
    }
    return rootValue;
};

// Check if @ at cursor should show intellisense; if so, update position state and show widget
const tryShowIntellisenseAtCursor = (
    editor: editor.IStandaloneCodeEditor,
    position: { lineNumber: number; column: number },
    model: editor.ITextModel,
    isInsideSelectedOption: (text: string) => boolean,
    autoWidgetHeight: boolean,
    setters: {
        setCurrentCoords: (c: ICoord | null) => void;
        setEditorCurrentDomNode: (n: HTMLElement | null) => void;
        setIntellisensePosition: (p: { x: number; y: number }) => void;
        setIsAtTrigger: (v: boolean) => void;
        setShowIntellisense: (v: boolean) => void;
    }
) => {
    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);
    const lastChar = textBeforeCursor.charAt(textBeforeCursor.length - 1);
    if (lastChar !== '@') return;

    const textBeforeAt = textBeforeCursor.substring(0, textBeforeCursor.length - 1);
    if (isInsideSelectedOption(textBeforeAt)) return;

    const coords = editor.getScrolledVisiblePosition(position);
    const editorDomNode = editor.getDomNode();
    setters.setCurrentCoords(coords);
    setters.setEditorCurrentDomNode(editorDomNode);

    if (!coords || !editorDomNode) return;

    if (autoWidgetHeight) {
        setters.setIntellisensePosition({ x: coords.left, y: coords.top + 20 });
    } else {
        const widgetWidth = 300;
        const widgetHeight = 200;
        const isTooFarRight = coords.left + widgetWidth >= editorDomNode.clientWidth;
        const isTooFarBottom = coords.top + widgetHeight >= editorDomNode.clientHeight;
        const safeSubtract = (v: number) => Math.max(0, v);
        setters.setIntellisensePosition({
            x: isTooFarRight ? safeSubtract(coords.left - widgetWidth) + 10 : coords.left,
            y: isTooFarBottom ? safeSubtract(coords.top - widgetHeight) + 10 : coords.top + 20,
        });
    }
    setters.setIsAtTrigger(true);
    setters.setShowIntellisense(true);
};

// Recursive function to collect only leaf `.value` entries
const collectLeafValues = (nodes: IntellisenseOption[] = []): string[] => {
    return nodes.flatMap(node => {
        if (!node.children || node.children.length === 0) {
            return [escapeRegex(node.value)];
        }
        return collectLeafValues(node.children);
    });
};

export default function MonacoEditor({
    value,
    hasEnhance,
    readOnly,
    height,
    isDestructive,
    disableEnhance,
    placeholder,
    helperInfo,
    disabled,
    enableCategoryIcon,
    autoWidgetHeight = false,
    onChange,
    intellisenseData,
    onEnhanceClick,
    onRefetchVariables,
    onBlur,
    disableIntelligencePopover = false,
}: Readonly<MonacoEditorProps>) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [showIntellisense, setShowIntellisense] = useState(disableIntelligencePopover);
    const [intellisensePosition, setIntellisensePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const intellisenseRef = useRef<IntellisenseWidgetHandle>(null);
    const [keyboardDisposable, setKeyboardDisposable] = useState<IDisposable | null>(null);
    const [isAtTrigger, setIsAtTrigger] = useState(false);
    const [isFocus, setFocus] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [internalChange, setInternalChange] = useState(false);
    const [variablePatterns, setVariablePatterns] = useState<string>(
        getCategoryPatterns(intellisenseData, 'Variables')
    );
    const [variableTriggerPattern, setVariableTriggerPattern] = useState<RegExp>(
        new RegExp(`Variable:(?:${variablePatterns})$`)
    );
    const [currentCoords, setCurrentCoords] = useState<ICoord | null>(null);
    const [editorCurrentDomNode, setEditorCurrentDomNode] = useState<HTMLElement | null>(null);
    const [intellisenseHeight, setIntellisenseHeight] = useState<number | undefined>(undefined);
    const previousValueRef = useRef<string>('');
    const { theme } = useTheme();
    const {
        isOpen,
        errors,
        isEdit,
        isValid,
        isSaving,
        newRecord,
        setOpen,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        control,
    } = useVariable({ triggerQuery: false, onRefetchVariables });

    const agentPatterns = getCategoryPatterns(intellisenseData, 'Agents');
    const apiPatterns = getCategoryPatterns(intellisenseData, 'APIs');
    const mcpPatterns = getCategoryPatterns(intellisenseData, 'MCPs');
    const ragPatterns = getCategoryPatterns(intellisenseData, 'Vector RAGs');
    const graphRagPatterns = getCategoryPatterns(intellisenseData, 'Graph RAGs');
    const databaseConnectorPatterns = getCategoryPatterns(intellisenseData, 'Database Connectors');
    const executableFunctionPatterns = getCategoryPatterns(intellisenseData, 'Executable Functions');
    const metaDataPatterns = getCategoryPatterns(intellisenseData, 'Metadata', opt => !opt.children);
    const metaDataCat = intellisenseData.find(c => c.name === 'Metadata');
    const metaDataChildrenPatterns =
        metaDataCat?.options?.filter(x => x.children)?.flatMap(opt => collectLeafValues([opt])).join('|') ?? '';
    const attributeCat = intellisenseData.find(c => c.name === 'Attributes');
    const attributePatterns =
        attributeCat?.options?.filter(x => x.children)?.flatMap(opt => collectLeafValues([opt])).join('|') ?? '';
    const agentTriggerPattern = new RegExp(`Agent:(?:${agentPatterns})$`);
    const apiTriggerPattern = new RegExp(`API:(?:${apiPatterns})$`);
    const mcpTriggerPattern = new RegExp(`MCP:(?:${mcpPatterns})$`);
    const ragTriggerPattern = new RegExp(`VectorRAG:(?:${ragPatterns})$`);
    const graphRagTriggerPattern = new RegExp(`GraphRAG:(?:${graphRagPatterns})$`);
    const databaseConnectorPattern = new RegExp(`DatabaseConnector:(?:${databaseConnectorPatterns})$`);
    const executableFunctionTriggerPattern = new RegExp(`ExecutableFunction:(?:${executableFunctionPatterns})$`);
    const metaDataTriggerPattern = new RegExp(`Metadata:(?:${metaDataPatterns})$`);
    const metaDataChildrenPattern = new RegExp(`Metadata:(?:${metaDataChildrenPatterns})$`);
    const attributeTriggerPattern = new RegExp(`Attribute:(?:${attributePatterns})$`);

    // Handle external value changes (like from the default value input)
    useEffect(() => {
        if (editorRef.current && !internalChange && value !== previousValueRef.current) {
            editorRef.current.setValue(value);
            previousValueRef.current = value;
        }
        setInternalChange(false);
    }, [value, internalChange]);

    useEffect(() => {
        if (
            autoWidgetHeight &&
            !disableIntelligencePopover &&
            showIntellisense &&
            currentCoords &&
            editorCurrentDomNode &&
            intellisenseHeight
        ) {
            const widgetWidth = 300;

            const isTooFarRight = currentCoords.left + widgetWidth >= editorCurrentDomNode.clientWidth;
            const isTooFarBottom = currentCoords.top + intellisenseHeight >= editorCurrentDomNode.clientHeight;

            const safeSubtract = (value: number) => Math.max(0, value);

            // Set the position for the intellisense widget, adjusting if it would overflow
            setIntellisensePosition({
                x: isTooFarRight ? safeSubtract(currentCoords.left - widgetWidth) + 10 : currentCoords.left,
                y: isTooFarBottom ? safeSubtract(currentCoords.top - intellisenseHeight) + 10 : currentCoords.top + 20,
            });
        }
    }, [
        disableIntelligencePopover,
        showIntellisense,
        currentCoords,
        editorCurrentDomNode,
        intellisenseHeight,
        autoWidgetHeight,
    ]);

    // Set up keyboard event listener for intellisense navigation
    useEffect(() => {
        if (!editorRef.current) return;

        if (keyboardDisposable) {
            keyboardDisposable.dispose();
        }

        if (showIntellisense) {
            const disposable = editorRef.current.onKeyDown(e => {
                if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (intellisenseRef.current) {
                        intellisenseRef.current.moveSelectionDown();
                    }
                    return false;
                } else if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (intellisenseRef.current) {
                        intellisenseRef.current.moveSelectionUp();
                    }
                    return false;
                } else if (e.code === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (intellisenseRef.current) {
                        intellisenseRef.current.selectCurrent();
                    }
                    return false;
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowIntellisense(false);
                    return false;
                }
                return true;
            });

            setKeyboardDisposable(disposable);

            return () => {
                disposable.dispose();
            };
        }
    }, [showIntellisense]);

    useEffect(() => {
        const resetPatterns = () => {
            const data =
                intellisenseData
                    .find(cat => cat.name === 'Variables')
                    ?.options.map(opt => opt.value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
                    .join('|') ?? '';
            setVariablePatterns(data);
            const pattern = new RegExp(`Variable:(?:${data})$`);
            setVariableTriggerPattern(pattern);
            const rootValue: [RegExp, string][] = [];
            if (agentPatterns) rootValue?.push([new RegExp(String.raw`\b(${agentPatterns})\b`), 'agents-token']);
            if (apiPatterns) rootValue?.push([new RegExp(String.raw`\b(${apiPatterns})\b`), 'apis-token']);
            if (executableFunctionPatterns) rootValue?.push([new RegExp(String.raw`\b(${executableFunctionPatterns})\b`), 'executable-function-token']);
            if (data) rootValue?.push([new RegExp(String.raw`\b(${data})\b`), 'variable-token']);
            if (metaDataChildrenPatterns)
                rootValue.push([new RegExp(String.raw`\b(${metaDataChildrenPatterns})\b`), 'metadata-token']);
            if (metaDataPatterns) rootValue.push([new RegExp(String.raw`\b(${metaDataPatterns})\b`), 'metadata-token']);
            if (attributePatterns){
                rootValue.push([new RegExp(String.raw`\b(${attributePatterns})\b`), 'attribute-token']);
            }
            if (rootValue?.length && monacoRef?.current) {
                monacoRef.current.languages.setMonarchTokensProvider('plaintext', {
                    tokenizer: {
                        root: rootValue,
                    },
                });
            }
        };
        if (!isSaving && newRecord) {
            (async () => {
                handleOptionSelect({
                    label: newRecord?.name,
                    value: `${IntellisenseTools.Variable}:${newRecord.name}`,
                });
                resetPatterns();
            })();
        }
    }, [isSaving, newRecord, intellisenseData]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        setLoading(false);
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.onDidFocusEditorText(() => {
            onBlur?.();
            setFocus(true);
        });

        editor.onDidBlurEditorText(() => {
            setFocus(false);
        });

        editor.updateOptions({
            lineNumbers: 'off',
            glyphMargin: true,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            wordWrap: 'on',
            renderLineHighlight: 'none',
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
            contextmenu: false,
            padding: { top: 16, bottom: 16 },
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            snippetSuggestions: 'none',
            wordBasedSuggestions: 'off',
            parameterHints: { enabled: false },
            suggest: { showWords: false },
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            theme: 'dark',
        });

        // Add custom theme for highlighting with different colors for different categories
        monaco.editor.defineTheme('customTheme', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'agents-token', foreground: '0066cc', fontStyle: 'bold' },
                { token: 'apis-token', foreground: '22863a', fontStyle: 'bold' },
                { token: 'mcp-token', foreground: '22863a', fontStyle: 'bold' },
                { token: 'vector-rag-token', foreground: '3abff8', fontStyle: 'bold' },
                { token: 'graph-rag-token', foreground: '0da2e7', fontStyle: 'bold' },
                { token: 'database-connector-token', foreground: 'f87272', fontStyle: 'bold' },
                { token: 'executable-function-token', foreground: '9d4edd', fontStyle: 'bold' },
                { token: 'variable-token', foreground: 'f59f0a', fontStyle: 'bold' },
                { token: 'metadata-token', foreground: '3b7af7', fontStyle: 'bold' },
                { token: 'attribute-token', foreground: '3b7af7', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': theme === 'light' ? '#ffffff' : '#384151',
                'editor.foreground': theme === 'light' ? '#111827' : '#dcdcdc',
                'editorCursor.foreground': theme === 'light' ? '#111827' : '#dcdcdc',
                'editor.selectionBackground': theme === 'light' ? '#c9e4ff' : '#203041',
                'editor.inactiveSelectionBackground': theme === 'light' ? '#ffffff' : '#384151',
            },
        });
        monaco.editor.setTheme('customTheme');

        const rootValue = buildTokenRootValue([
            { patterns: agentPatterns, token: 'agents-token' },
            { patterns: apiPatterns, token: 'apis-token' },
            { patterns: mcpPatterns, token: 'mcp-token' },
            { patterns: ragPatterns, token: 'vector-rag-token' },
            { patterns: graphRagPatterns, token: 'graph-rag-token' },
            { patterns: databaseConnectorPatterns, token: 'database-connector-token' },
            { patterns: executableFunctionPatterns, token: 'executable-function-token' },
            { patterns: variablePatterns, token: 'variable-token' },
            { patterns: metaDataChildrenPatterns, token: 'metadata-token' },
            { patterns: metaDataPatterns, token: 'metadata-token' },
            { patterns: attributePatterns, token: 'attribute-token' },
        ]);

        if (rootValue.length) {
            monaco.languages.setMonarchTokensProvider('plaintext', {
                tokenizer: {
                    root: rootValue,
                },
            });
        }

        if (value) {
            editor.setValue(value);
            previousValueRef.current = value;
        }

        /**
         * Registers a listener for changes in the Monaco editor's content.
         *
         * - Retrieves the new editor value and updates the internal state to prevent change loops.
         * - Updates the previous value reference and triggers the `onChange` callback with the new value.
         * - Determines the current cursor position and checks if the last character before the cursor is '@'.
         * - If '@' is detected and not part of an already selected option (based on trigger patterns),
         *   calculates the position for the intellisense widget.
         * - Adjusts the widget's position to ensure it remains within the editor's visible area.
         * - Sets the intellisense position and displays the intellisense widget.
         *
         * @returns A disposable object to remove the content change listener.
         */
        // const disposable = editor.onDidChangeModelContent(() => { ... });
        const isInsideSelectedOption = (text: string) =>
            agentTriggerPattern.test(text) ||
            apiTriggerPattern.test(text) ||
            mcpTriggerPattern.test(text) ||
            ragTriggerPattern.test(text) ||
            graphRagTriggerPattern.test(text) ||
            databaseConnectorPattern.test(text) ||
            executableFunctionTriggerPattern.test(text) ||
            variableTriggerPattern.test(text) ||
            metaDataTriggerPattern.test(text) ||
            metaDataChildrenPattern.test(text) ||
            attributeTriggerPattern.test(text);

        const disposable = editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            setInternalChange(true);
            previousValueRef.current = newValue;
            onChange(newValue);

            const position = editor.getPosition();
            const model = editor.getModel();
            if (position && model) {
                tryShowIntellisenseAtCursor(editor, position, model, isInsideSelectedOption, autoWidgetHeight, {
                    setCurrentCoords,
                    setEditorCurrentDomNode,
                    setIntellisensePosition,
                    setIsAtTrigger,
                    setShowIntellisense,
                });
            }
        });

        return () => {
            disposable.dispose();
            if (keyboardDisposable) {
                keyboardDisposable.dispose();
            }
        };
    };

    // Handle intellisense option selection
    const handleOptionSelect = (option: IntellisenseOption) => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (!editor || !monaco) {
            setShowIntellisense(false);
            return;
        }
        const position = editor.getPosition();
        if (!position) {
            setShowIntellisense(false);
            return;
        }
        const model = editor.getModel();
        if (!model) {
            setShowIntellisense(false);
            return;
        }
        applyIntellisenseEdit(editor, monaco, position, model, option, isAtTrigger);
        setShowIntellisense(false);
    };

    return (
        <>
            <div
                className={cn(
                    'relative w-full border-gray-300 dark:border-gray-600 border-[1px] rounded-md overflow-hidden',
                    `${height ?? 'h-[500px]'}`,
                    {
                        '!border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]': isDestructive,
                        '!outline-none !border-blue-300 ring-[#DCE7FE] !dark:focus:border-blue-900 dark:ring-[#2f436f58]':
                            isFocus && !isDestructive,
                        '!pointer-events-none': disabled,
                    }
                )}
            >
                {placeholder && !value && !isFocus && (
                    <pre
                        className="absolute top-4 left-4 text-sm text-gray-400 font-mono pointer-events-none whitespace-pre-wrap"
                        style={{
                            zIndex: 10,
                            background: 'transparent',
                        }}
                    >
                        {placeholder}
                    </pre>
                )}
                {helperInfo && isNullOrEmpty(value) && isFocus && (
                    <pre
                        className="absolute top-4 left-4 text-sm text-gray-400 font-mono pointer-events-none whitespace-pre-wrap"
                        style={{
                            zIndex: 10,
                            background: 'transparent',
                        }}
                    >
                        {helperInfo}
                    </pre>
                )}
                <Editor
                    height={hasEnhance ? 'calc(100% - 60px)' : '100%'}
                    defaultLanguage="plaintext"
                    value={value}
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize: 14,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        guides: {
                            indentation: false,
                        },
                    }}
                    theme="vs-dark"
                />
                {!disableIntelligencePopover && (
                    <>
                        {showIntellisense && (
                            <div
                                className="absolute z-[9999]"
                                style={{
                                    left: `${intellisensePosition.x}px`,
                                    top: `${intellisensePosition.y}px`,
                                }}
                            >
                                <IntellisenseWidget
                                    ref={intellisenseRef}
                                    readOnly={readOnly}
                                    categories={intellisenseData}
                                    enableCategoryIcon={enableCategoryIcon}
                                    onSelect={handleOptionSelect}
                                    onClose={() => setShowIntellisense(false)}
                                    onNewVariable={() => setOpen(true)}
                                    isAtTrigger={isAtTrigger}
                                    onHeightChange={value => setIntellisenseHeight(value)}
                                />
                            </div>
                        )}
                    </>
                )}

                {hasEnhance && (
                    <div
                        className={cn('h-full', {
                            'dark:bg-gray-700': !loading,
                        })}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className="absolute right-[20px] bottom-[10px] rounded-full p-2 h-auto"
                                        size="sm"
                                        disabled={!value || value?.trim() === '' || readOnly || disableEnhance}
                                        onClick={onEnhanceClick}
                                    >
                                        <WandSparkles size={14} /> Enhance Prompt
                                    </Button>
                                </TooltipTrigger>
                                {disableEnhance && (
                                    <TooltipContent side="left" align="center">
                                        Workspace intelligence source needs to be setup
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={setOpen}>
                    <DialogContent
                        className="max-w-[unset] w-[580px]"
                        onPointerDownOutside={event => {
                            event.preventDefault();
                        }}
                    >
                        <DialogHeader className="px-0">
                            <DialogTitle asChild>
                                <div className="px-4 flex gap-2">
                                    <Unplug />
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                        New Variable
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                                <VariableFormBody
                                    isOpen={isOpen}
                                    errors={errors}
                                    isEdit={isEdit}
                                    isValid={isValid}
                                    isSaving={isSaving}
                                    setOpen={setOpen}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    handleSubmit={handleSubmit}
                                    onHandleSubmit={onHandleSubmit}
                                    control={control}
                                />
                            </div>
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isSaving ? 'Saving' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
