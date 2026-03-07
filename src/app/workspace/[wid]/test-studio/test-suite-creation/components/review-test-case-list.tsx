import React from 'react';
import { List, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { cn } from '@/lib/utils';
import { ITestDataSet, TestCaseMethod } from '../../data-generation';
import { TruncateCell } from '@/components';

const TEST_CASE_PREFIX: Record<string, string> = {
    [TestCaseMethod.Auto]: 'G',
    [TestCaseMethod.Upload]: 'U',
    [TestCaseMethod.Manual]: 'M',
};

function getTestCasePrefix(method?: string): string {
    return TEST_CASE_PREFIX[method ?? TestCaseMethod.Manual] ?? 'M';
}

function getEmptyFieldsLabel(
    item: ITestDataSet,
    agentOutputFields?: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>,
    agentIds?: string[],
    idx?: number
): React.ReactNode {
    const emptyFields = [
        !item.input?.message?.trim() && 'Input',
        !item.expectedBehaviour?.trim() && 'Ground Truth',
        !item.expectedOutput?.trim() && 'Expected Output',
    ].filter(Boolean);

    if (agentOutputFields && agentIds && idx !== undefined) {
        agentIds.forEach(agentId => {
            // Only validate if this agent has configuration data
            const agentDataArray = agentOutputFields[agentId];
            if (agentDataArray && agentDataArray.length > 0) {
                const agentData = agentDataArray[idx];
                if (!agentData?.expectedOutput?.trim()) emptyFields.push('Agent Output');
                if (!agentData?.expectedBehaviour?.trim()) emptyFields.push('Agent GT');
            }
        });
    }

    if (emptyFields.length === 0) {
        return (
            <span className="text-[10px] font-medium text-green-600 flex items-center gap-1">
                <i className="ri-checkbox-circle-fill" /> All fields filled
            </span>
        );
    }
    return (
        <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
            <i className="ri-error-warning-fill" />
            {emptyFields.length} missing field{emptyFields.length > 1 ? 's' : ''}
        </span>
    );
}

interface TestCaseRowProps {
    readonly item: ITestDataSet;
    readonly idx: number;
    readonly prefix: string;
    readonly isSelected: boolean;
    readonly agentOutputFields?: Readonly<Record<string, { expectedOutput: string; expectedBehaviour: string }[]>>;
    readonly agentIds?: string[];
    readonly onSelect: () => void;
}

function TestCaseRow({ item, idx, prefix, isSelected, agentOutputFields, agentIds, onSelect }: TestCaseRowProps) {
    return (
        <div className="relative group/item">
            <button
                onClick={onSelect}
                className={cn(
                    'group flex flex-col items-start gap-3 py-2 rounded-sm border text-left transition-all duration-200 w-full relative overflow-hidden',
                    isSelected
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                )}
            >
                {isSelected && (
                    <div className="absolute right-0 top-0 bottom-0 w-3 h-full bg-blue-500 flex items-center justify-center">
                        <i className="ri-arrow-right-s-fill text-white" />
                    </div>
                )}
                <div className="flex items-center gap-3 w-full pl-2">
                    <span
                        className={cn(
                            'flex h-fit w-fit shrink-0 items-center justify-center rounded-sm text-xs font-medium transition-colors px-1',
                            isSelected
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:border-indigo-300 group-hover:text-indigo-600'
                        )}
                    >
                        #{prefix}
                        {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        {item.name ? (
                            <h4
                                className={cn(
                                    'font-medium truncate text-sm',
                                    isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                                )}
                            >
                                <TruncateCell value={item.name} length={30} />
                            </h4>
                        ) : (
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Untitled
                            </span>
                        )}
                    </div>
                </div>
                <div
                    className={cn(
                        'pl-9 text-sm w-full',
                        isSelected ? 'text-indigo-900/80 dark:text-indigo-300/80' : 'text-gray-600 dark:text-gray-400'
                    )}
                >
                    <div className="pl-3">{getEmptyFieldsLabel(item, agentOutputFields, agentIds, idx)}</div>
                </div>
            </button>
        </div>
    );
}

type ReviewTestCaseListProps = {
    items: ITestDataSet[];
    selectedTestCaseIndex: number;
    setSelectedTestCaseIndex: (index: number) => void;
    isLoadingFile: boolean;
    fileError: string | null;
    testCaseMethod?: string;
    agentOutputFields?: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>;
    agentIds?: string[];
};

export const ReviewTestCaseList = ({
    items,
    selectedTestCaseIndex,
    setSelectedTestCaseIndex,
    isLoadingFile,
    fileError,
    testCaseMethod,
    agentOutputFields,
    agentIds,
}: ReviewTestCaseListProps) => {
    const prefix = getTestCasePrefix(testCaseMethod);

    const renderScrollContent = () => {
        if (isLoadingFile) {
            return (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2" />
                    Parsing file...
                </div>
            );
        }
        if (fileError) {
            return (
                <div className="p-4 m-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded border border-red-100 dark:border-red-800 flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {fileError}
                </div>
            );
        }
        if (items.length === 0) {
            return <div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">No test cases found</div>;
        }
        return (
            <div className="p-3 gap-2 flex flex-col">
                {items.map((item, idx) => (
                    <TestCaseRow
                        key={item.id ?? item.displayId ?? item.name ?? `item-${idx}`}
                        item={item}
                        idx={idx}
                        prefix={prefix}
                        isSelected={selectedTestCaseIndex === idx}
                        agentOutputFields={agentOutputFields}
                        agentIds={agentIds}
                        onSelect={() => setSelectedTestCaseIndex(idx)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="w-[20%] min-w-[300px] border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Test Cases ({items.length})
                </h3>
            </div>
            <ScrollArea className="flex-1">{renderScrollContent()}</ScrollArea>
        </div>
    );
};
