import { useCallback, useState } from 'react';
import { CompletionContext, Completion, completionStatus } from '@codemirror/autocomplete';
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

export type VariableType = 'string' | 'boolean' | 'int' | 'float' | 'date' | 'list' | 'dict';

export type ToolType = 'API' | 'Variable' | 'Function' | 'Status';

export type Variable = {
    name: string;
    parent: string | undefined;
    type: VariableType | string;
    description: string;
    defaultValue: string;
    tools?: {
        name: string;
        type: ToolType;
    };
};

export type VariablePayload = {
    name: string;
    type: VariableType | string;
    description: string;
    default_value: string;
};

export type Tool = {
    name: string;
    displayName: string;
    type: ToolType;
    description?: string;
    variables: Variable[];
};

export type Category = {
    name: string;
    tools: Tool[];
};

export type ConsoleMessageType = 'error' | 'warning' | 'info';

export type ConsoleMessage = {
    type: ConsoleMessageType;
    message: string;
    timestamp: number;
    line?: number;
};

export type CompletionItem = {
    label: string;
    type: 'tool' | 'variable' | 'keyword';
    detail?: string;
};

export type CompletionCategory = {
    label: string;
    type: 'category';
    items?: CompletionItem[];
};

export const useConditionCompletion = (categories: Category[], removePrefix: boolean = false) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    // purpose :  function to flatten all tools across categories
    const getAllTools = useCallback(() => {
        return categories.flatMap(category => category.tools);
    }, [categories]);

    // purpose : flattens all variables across all tools with their parent tool names
    const getAllVariables = useCallback(() => {
        return categories.flatMap(category =>
            category.tools.flatMap(tool =>
                tool.variables.map(variable => ({
                    ...variable,
                    toolName: tool.name,
                }))
            )
        );
    }, [categories]);

    // purpose : gets variables for a specific tool by name
    const getToolVariables = useCallback(
        (toolName: string) => {
            const tool = getAllTools().find(t => t.name === toolName);
            return tool?.variables ?? [];
        },
        [getAllTools]
    );

    // purpose : create completion handler that provides different suggestion types
    const handleCompletion = useCallback(
        (context: CompletionContext) => {
            const before = context.matchBefore(/[@\w.]+/);
            if (!before) return null;

            const text = before.text;

            // purpose : handle @ prefixed completion flow
            if (text.startsWith('@')) {
                if (!selectedCategory || selectedCategory == null) {
                    return {
                        from: before.from + 1,
                        options: categories.map(cat => ({
                            label: cat.name,
                            type: 'category',
                            boost: 99,
                            detail:
                                cat?.tools?.length > 0
                                    ? `Show ${cat.name.toLowerCase()}`
                                    : `- No ${cat.name.toLowerCase()} available`,
                            apply: () => {
                                if (cat?.tools?.length > 0) {
                                    setSelectedCategory(cat.name);
                                }
                                return false;
                            },
                        })),
                    };
                }

                const category = categories.find(cat => cat.name === selectedCategory);
                if (!category) return null;

                if (!selectedTool) {
                    return {
                        from: before.from + 1,
                        options: category.tools.map(tool => ({
                            label: tool.displayName,
                            type: 'tool',
                            detail: tool.description,
                            apply: () => {
                                setSelectedTool(tool.name);
                                return false;
                            },
                        })),
                    };
                }

                const toolVars = getToolVariables(selectedTool);

                // purpose : return autocomplete suggestions configuration
                return {
                    from: before.from + 1,
                    options: toolVars.map(v => ({
                        label: v.name,
                        type: 'variable',
                        detail: v.description,
                        apply: (view: EditorView, completion: Completion, from: number, to: number) => {
                            const insertText =
                                removePrefix && selectedTool === 'variable' ? v.name : `${selectedTool}.${v.name}`;
                            view.dispatch({
                                changes: {
                                    from: before.from,
                                    to,
                                    insert: insertText,
                                },
                            });
                            setSelectedCategory(null);
                            setSelectedTool(null);
                            return true;
                        },
                    })),
                };
            }

            // purpose: check if the text contains a dot notation pattern (e.g., "ToolName.")
            // Use string ops instead of regex to avoid ReDoS from backtracking
            const dotIndex = text.lastIndexOf('.');
            if (dotIndex !== -1 && dotIndex > 0) {
                const toolName = text.slice(0, dotIndex);
                if (toolName && !/\W/.test(toolName)) {
                    const toolVars = getToolVariables(toolName);

                    return {
                        from: before.from + dotIndex + 1,
                        options: toolVars.map(v => ({
                            label: v.name,
                            type: 'variable',
                            detail: v.description,
                        })),
                    };
                }
            }

            const allTools = getAllTools();
            const allVariables = getAllVariables();

            // purpose : general completions (tools, variables, keywords , etc)
            const completions: CompletionItem[] = [
                ...allTools.map(tool => ({
                    label: tool.name,
                    type: 'tool' as const,
                    detail: tool.description,
                })),
                ...allVariables.map(variable => ({
                    label:
                        removePrefix && variable.toolName === 'variable'
                            ? variable.name
                            : `${variable.toolName}.${variable.name}`,
                    type: 'variable' as const,
                    detail: variable.description,
                })),
                { label: 'AND', type: 'keyword' as const },
                { label: 'OR', type: 'keyword' as const },
                { label: 'true', type: 'keyword' as const },
                { label: 'false', type: 'keyword' as const },
                { label: 'null', type: 'keyword' as const },
                { label: 'True', type: 'keyword' as const },
                { label: 'False', type: 'keyword' as const },
                { label: 'None', type: 'keyword' as const },
            ];

            return {
                from: before.from,
                options: completions,
            };
        },
        [categories, selectedCategory, selectedTool, getToolVariables, getAllTools, getAllVariables, removePrefix]
    );

    // purpose: detect when the CodeMirror autocomplete tooltip closes to reset related UI state or perform side effects
    const tooltipCloseDetector = (onClose: () => void) => {
        return ViewPlugin.fromClass(
            class {
                private wasOpen = false;

                update(update: ViewUpdate) {
                    const status = completionStatus(update.state);
                    const isOpen = status === 'active';

                    if (this.wasOpen && !isOpen) {
                        onClose();
                    }

                    this.wasOpen = isOpen;
                }
            }
        );
    };

    return {
        handleCompletion,
        tooltipCloseDetector,
        selectedCategory,
        selectedTool,
        setSelectedCategory,
        setSelectedTool,
    };
};
