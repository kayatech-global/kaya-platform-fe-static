'use client';

import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { Category, ConsoleMessage, useConditionCompletion } from '@/hooks/use-condition-completion';
import { ConditionValidator } from '@/utils/workflow-editor-validator';
import { ConsoleView } from './console-view';
import { useTheme } from '@/theme';
import { Button } from '@/components/atoms';
import { Code } from 'lucide-react';
import { EditorView, placeholder } from '@codemirror/view';

type WorkflowConditionEditorProps = {
    data: Category[];
    onClose?: () => void;
    onSave?: (condition: string) => void;
    initialValue?: string;
    asInput?: boolean;
    onChange?: (condition: string) => void;
    label?: string;
    showConsole?: boolean;
    showFooterButtons?: boolean;
    disabLeValidation?: boolean;
};

function buildVariableServiceMap(data: Category[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const { tools, name } of data) {
        if (name === 'Variables') {
            for (const tool of tools) {
                for (const variable of tool.variables ?? []) {
                    map[variable.name] = tool.name;
                }
            }
        }
    }
    return map;
}

function transformConditionWithPrefix(
    condition: string,
    variableServiceMap: Record<string, string>,
    removePrefix: boolean
): string {
    const tokens = condition.split(/(AND|OR|==|!=|>=|<=|>|<)/g);
    return tokens
        .map(token => {
            const trimmed = token.trim();
            if (['AND', 'OR', '==', '!=', '>=', '<=', '>', '<'].includes(trimmed)) return trimmed;
            if (variableServiceMap[trimmed] && !trimmed.includes('.')) {
                if (removePrefix && variableServiceMap[trimmed] === 'variable') return trimmed;
                return `${variableServiceMap[trimmed]}.${trimmed}`;
            }
            return trimmed;
        })
        .join(' ');
}

export const WorkflowConditionEditor = ({
    data,
    onClose,
    onSave,
    initialValue,
    asInput,
    onChange,
    label,
    removePrefix = false,
    showConsole = true,
    showFooterButtons = true,
    disabLeValidation = false,
}: WorkflowConditionEditorProps & { removePrefix?: boolean }) => {
    const [condition, setCondition] = useState<string>('');
    const [messages, setMessages] = useState<ConsoleMessage[]>([]);
    const { theme } = useTheme();

    const { handleCompletion, tooltipCloseDetector, setSelectedCategory, setSelectedTool } = useConditionCompletion(
        data,
        removePrefix
    );

    const validator = new ConditionValidator(
        data.flatMap(category =>
            category.tools.flatMap(tool =>
                tool.variables.map(variable => ({
                    ...variable,
                    tools: {
                        name: tool.name,
                        type: tool.type,
                    },
                }))
            )
        )
    );

    const validateCondition = (value: string) => {
        const { errors, warnings } = validator.validateSyntax(value);

        const newMessages: ConsoleMessage[] = [
            ...errors.map(error => ({
                type: 'error' as const,
                message: error,
                timestamp: Date.now(),
                line: Number.parseInt(/Line (\d+)/.exec(error)?.[1] ?? '0', 10),
            })),
            ...warnings.map(warning => ({
                type: 'warning' as const,
                message: warning,
                timestamp: Date.now(),
                line: Number.parseInt(/Line (\d+)/.exec(warning)?.[1] ?? '0', 10),
            })),
        ];

        setMessages(newMessages);
    };

    const handleSave = () => {
        // purpose : convert nested condition to none nested condition and save (eg : SomeService.field → field) - Can be removed if we're saving the complete condition (function.variable) - this is applied only for workflow variables
        const transformedCondition = condition.replaceAll(/\b(variable)\./g, '');
        onSave?.(transformedCondition);
    };

    // purpose : transform the condition by adding service prefixes (eg : variable → function.variable ) - Can be removed if we're saving the complete condition (function.variable) - this is applied only for workflow variables
    useEffect(() => {
        if (!initialValue) return;
        const variableServiceMap = buildVariableServiceMap(data);
        const restoredCondition = transformConditionWithPrefix(initialValue, variableServiceMap, removePrefix);
        setCondition(restoredCondition);
    }, [initialValue, data, removePrefix]);

    return (
        <div className="flex flex-col gap-2 rounded-lg">
            <div className="flex-1">
                {asInput && label && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-[6px]">{label}</p>
                )}
                <div className="border rounded-md edge-editor">
                    {!asInput && (
                        <div className="flex items-center gap-x-1 text-[10px] py-1 px-2 bg-gray-200 dark:bg-gray-700 text-foreground">
                            <Code size={12} /> Source Code
                        </div>
                    )}
                    <CodeMirror
                        value={condition}
                        height={asInput ? '80px' : '200px'}
                        theme={theme === 'light' ? 'light' : 'dark'}
                        extensions={[
                            javascript(),
                            autocompletion({ override: [handleCompletion] }),
                            tooltipCloseDetector(() => {
                                setSelectedCategory(null);
                                setSelectedTool(null);
                            }),
                            EditorView.lineWrapping,
                            placeholder(asInput ? 'Start typing or use @ to insert a variable' : ''),
                        ]}
                        basicSetup={{
                            lineNumbers: !asInput,
                            foldGutter: !asInput,
                        }}
                        onChange={value => {
                            setCondition(value);
                            validateCondition(value);
                            if (disabLeValidation) onChange?.(value);
                            if (asInput && onChange) onChange(value);
                        }}
                    />
                </div>
            </div>
            {!asInput && (
                <>
                    {showConsole && <ConsoleView messages={messages} />}
                    {showFooterButtons && (
                        <div className="flex justify-end mt-1 gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={'secondary'}
                                className="px-4 py-2 text-sm font-medium"
                                onClick={() => onClose?.()}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={'primary'}
                                size="sm"
                                className="px-4 py-2 text-sm font-medium"
                                onClick={handleSave}
                                disabled={messages.some(message => message.type === 'error')}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
