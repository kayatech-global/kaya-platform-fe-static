'use client';

import { ISharedItem } from '@/models';
import React, { useEffect, useMemo, useState } from 'react';
import { useVariable } from '@/hooks/use-variable';
import { VariableForm } from '@/app/workspace/[wid]/variables/components/variable-form';
import { IntellisenseTools } from './../../../../workspace/[wid]/prompt-templates/components/monaco-editor';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Unplug } from 'lucide-react';
import { Button, Label } from '@/components';
import { cn } from '@/lib/utils';

// 1. Define a mapping from IntellisenseTools to CSS class names
const getButtonClassForType = (type: string | undefined) => {
    switch (type) {
        case IntellisenseTools.Agent:
            return 'text-[#0066cc] font-bold';
        case IntellisenseTools.API:
        case IntellisenseTools.MCP:
            return 'text-[#22863a] font-bold';
        case IntellisenseTools.VectorRAG:
            return 'text-[#3abff8] font-bold';
        case IntellisenseTools.GraphRAG:
            return 'text-[#0da2e7] font-bold';
        case IntellisenseTools.Variable:
            return 'text-[#f59f0a] font-bold';
        default:
            return 'text-gray-700 dark:text-gray-300';
    }
};

const ITEMS_KEY_MAP: Record<string, string> = {
    [IntellisenseTools.API]: 'api',
    [IntellisenseTools.Agent]: 'agents',
    [IntellisenseTools.GraphRAG]: 'graphRag',
    [IntellisenseTools.VectorRAG]: 'rag',
    [IntellisenseTools.MCP]: 'mcp',
};

export enum PlaceholderStatus {
    RESOLVED = 'RESOLVED',
    BROKEN = 'BROKEN',
}

const PLACEHOLDER_TYPE_KEY_MAP: Record<string, string> = {
    variable: 'variables',
    vectorrag: 'rag',
    graphing: 'graphRag',
    api: 'api',
    mcp: 'mcp',
    agent: 'agents',
};

type IntellisenseData = {
    api: ISharedItem[];
    mcp: ISharedItem[];
    rag: ISharedItem[];
    graphRag: ISharedItem[];
    variables: ISharedItem[];
    agents: ISharedItem[];
};

function resolvePlaceholderStatus(
    type: string,
    name: string,
    allIntellisenseTest: IntellisenseData | undefined
): PlaceholderStatus {
    if (!allIntellisenseTest) return PlaceholderStatus.BROKEN;
    try {
        const typeKey = PLACEHOLDER_TYPE_KEY_MAP[type.toLowerCase()] || type.toLowerCase();
        const collection =
            typeKey in allIntellisenseTest
                ? (allIntellisenseTest[typeKey as keyof IntellisenseData] as ISharedItem[] | undefined)
                : undefined;
        if (!collection || !Array.isArray(collection)) return PlaceholderStatus.BROKEN;
        const foundItem = collection.find(item => item.name?.toLowerCase() === name.toLowerCase());
        return foundItem ? PlaceholderStatus.RESOLVED : PlaceholderStatus.BROKEN;
    } catch {
        return PlaceholderStatus.BROKEN;
    }
}

function parseContentWithValidation(
    text: string,
    allIntellisenseTest: IntellisenseData | undefined
): { raw: string; type: IntellisenseTools; name: string; start: number; end: number; status: PlaceholderStatus }[] {
    const regex = /\{\{(\w+):([^{}]*)\}\}/g;
    const matches: {
        raw: string;
        type: IntellisenseTools;
        name: string;
        start: number;
        end: number;
        status: PlaceholderStatus;
    }[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        const [raw, type, name] = match;
        const status = resolvePlaceholderStatus(type, name, allIntellisenseTest);
        matches.push({
            raw,
            type: type as IntellisenseTools,
            name,
            start: match.index,
            end: match.index + raw.length,
            status,
        });
    }

    return matches;
}

interface PromptIntellisensePickerProps {
    prompt: string;
    allIntellisenseTest:
        | {
              api: ISharedItem[];
              mcp: ISharedItem[];
              rag: ISharedItem[];
              graphRag: ISharedItem[];
              variables: ISharedItem[];
              agents: ISharedItem[];
          }
        | undefined;
    onSetPrompt: (value: string) => void;
}

const FormBody: React.FC<PromptIntellisensePickerProps> = ({ prompt, allIntellisenseTest, onSetPrompt }) => {
    // Local state for dialog and selection
    const [open, setOpen] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<IntellisenseTools>();
    // removed unused selectedValue
    const [selectedIndex, setSelectedIndex] = useState<number>();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showVariableDrawer, setShowVariableDrawer] = useState(false);

    const {
        isValid,
        isSaving,
        errors,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        control,
        variableTableData,
    } = useVariable();

    useEffect(() => {
        if (!open) {
            setSelectedId(null);
        }
    }, [open]);

    // Helper to extract type and name from placeholder
    const extractTypeAndName = (input: string) => {
        const regex = /^\{\{(\w+):(.+)\}\}$/;
        const match = regex.exec(input);
        if (!match) return null;
        const [, type, name] = match;
        return { type, name };
    };

    // Handler for clicking a placeholder
    const handlePlaceholderClick = (value: string, index: number) => {
        const result = extractTypeAndName(value);
        setSelectedIndex(index);
        setSelectedType(result?.type ? (result?.type as IntellisenseTools) : undefined);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setSelectedIndex(undefined);
        setSelectedType(undefined);
    };

    const items = useMemo(() => {
        if (selectedType === IntellisenseTools.Variable) return variableTableData || [];
        const key = selectedType ? ITEMS_KEY_MAP[selectedType] : undefined;
        return key && allIntellisenseTest ? (allIntellisenseTest[key as keyof typeof allIntellisenseTest] ?? []) : [];
    }, [allIntellisenseTest, selectedType, variableTableData]);

    const onSave = () => {
        if (!selectedId || selectedIndex === null || selectedIndex === undefined || !selectedType) return;
        const result = items?.find(x => x.id === selectedId);
        const newPlaceholder = `{{${selectedType}:${result?.name}}}`;
        const matches = [...prompt.matchAll(/\{\{[^{}]*\}\}/g)];
        if (selectedIndex === undefined || selectedIndex >= matches.length) return;
        const matchToReplace = matches[selectedIndex];
        const start = matchToReplace.index;
        const end = start + matchToReplace[0].length;
        const updatedPrompt = prompt.slice(0, start) + newPlaceholder + prompt.slice(end);
        onSetPrompt(updatedPrompt);
        onClose();
    };

    // Parse prompt and render clickable placeholders
    const parseContent = (text: string) => {
        // Always use the latest variableTableData for variables validation
        const customIntellisenseTest = allIntellisenseTest
            ? { ...allIntellisenseTest, variables: variableTableData }
            : undefined;

        const placeholders = parseContentWithValidation(text, customIntellisenseTest);
        const parts = [];
        let lastIndex = 0;

        placeholders.forEach(ph => {
            if (lastIndex < ph.start) {
                parts.push(<span key={`text-${lastIndex}-${ph.start}`}>{text.slice(lastIndex, ph.start)}</span>);
            }

            const buttonClass = cn(
                'inline-button',
                getButtonClassForType(ph.type),
                ph.status === PlaceholderStatus.BROKEN
                    ? 'underline decoration-wavy decoration-red-500'
                    : 'underline-none'
            );

            parts.push(
                <button
                    key={`placeholder-${ph.start}-${ph.end}`}
                    onClick={() => handlePlaceholderClick(ph.raw, placeholders.indexOf(ph))}
                    className={buttonClass}
                    title={ph.status === PlaceholderStatus.BROKEN ? 'Broken reference - Click to fix' : 'Resolved'}
                >
                    <span className="hidden">{'{{'}</span>
                    {ph.raw.slice(2, -2)} {/* Show just the content inside {{}} */}
                    <span className="hidden">{'}}'}</span>
                </button>
            );

            lastIndex = ph.end;
        });

        if (lastIndex < text.length) {
            parts.push(<span key="final-text">{text.slice(lastIndex)}</span>);
        }

        return parts;
    };

    // Render
    return (
        <>
            <div className="h-[200px]">{parseContent(prompt)}</div>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <Unplug />
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    {selectedType ?? 'Manage Intellisense'}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4">
                            {/* Add New Variable button for Variable type - now above the RadioGroup */}
                            {selectedType === IntellisenseTools.Variable && (
                                <div className="mb-2 flex justify-end">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowVariableDrawer(true)}
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                        <span className="mr-1 text-blue-600">+</span> Add New Variable
                                    </Button>
                                </div>
                            )}
                            <RadioGroup
                                className="flex flex-col space-y-4 pr-4 overflow-y-scroll h-[351px]"
                                value={selectedId ?? ''}
                                onValueChange={value => setSelectedId(value)}
                            >
                                {items.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400 italic">
                                            No options were found.
                                        </p>
                                    </div>
                                ) : (
                                    items.map(item => (
                                        <div key={item.id} className="pr-2">
                                            <div className="flex items-start space-x-2 align-center">
                                                <RadioGroupItem
                                                    value={item.id}
                                                    id={`shared-item-${item.id}`}
                                                    className="mt-1 h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-600 checked:border-blue-600"
                                                />
                                                <Label
                                                    htmlFor={`shared-item-${item.id}`}
                                                    className="cursor-pointer text-gray-800 dark:text-gray-200"
                                                >
                                                    {item.name}
                                                </Label>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </RadioGroup>
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onSave}>Add Intellisense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Variable Drawer for creating new variable */}
            {selectedType === IntellisenseTools.Variable && (
                <VariableForm
                    isOpen={showVariableDrawer}
                    setOpen={setShowVariableDrawer}
                    isEdit={false}
                    isValid={isValid}
                    isSaving={isSaving}
                    errors={errors}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    handleSubmit={handleSubmit}
                    onHandleSubmit={data => {
                        onHandleSubmit(data);
                        setShowVariableDrawer(false);
                    }}
                    control={control}
                />
            )}
        </>
    );
};

export const PromptIntellisensePicker: React.FC<PromptIntellisensePickerProps> = ({
    prompt,
    allIntellisenseTest,
    onSetPrompt,
}) => {
    return <FormBody prompt={prompt} allIntellisenseTest={allIntellisenseTest} onSetPrompt={onSetPrompt} />;
};
