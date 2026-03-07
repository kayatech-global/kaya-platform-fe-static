/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Control, useFieldArray } from 'react-hook-form';
import { Button } from '@/components';
import { Plus } from 'lucide-react';
import VariableConfigModal from '@/app/workspace/[wid]/workflows/workflow-authoring/components/variable-config-modal';
import { useVariable } from '@/hooks/use-variable';
import { ITestDataSet, ITestSuite, IVariableOption } from '@/models';

type ReviewTestCaseVariablesProps = {
    variables: ITestDataSet['input']['variables'];
    control?: Control<ITestSuite>;
    namePrefix?: string; // e.g. inputs.0
    isUpload?: boolean;
};

export const ReviewTestCaseVariables = ({ variables, control, namePrefix }: ReviewTestCaseVariablesProps) => {
    const [showAllVariables, setShowAllVariables] = useState(false);
    const [variableModalOpen, setVariableModalOpen] = useState(false);
    const VISIBLE_COUNT = 8;
    const { variableTableData, isFetching } = useVariable();

    // We need setValue to update the whole array easily, but useFieldArray gives fields.
    // We can use replace from useFieldArray.
    const { fields, replace } = useFieldArray({
        control,
        name: namePrefix ? `${namePrefix}.variables` : 'variables',
        keyName: 'key',
    });

    // In upload mode the form's testDataSets aren't pre-populated from Excel, so fields starts
    // empty. Show the prop-supplied Excel-computed values until the user explicitly edits
    // via the modal, at which point fields will be non-empty and takes over.
    const displayList = useMemo(
        () => (control && namePrefix ? (fields.length > 0 ? fields : variables ?? []) : variables ?? []),
        [control, namePrefix, fields, variables]
    );
    const hasVariables = displayList && displayList.length > 0;

    const modalVariables = useMemo(() => {
        return variableTableData.map(v => ({
            id: v.id,
            name: v.name,
            description: v.description,
            type: v.dataType,
        }));
    }, [variableTableData]);

    const handleApplyVariables = (newVariables: IVariableOption[] | undefined) => {
        if (newVariables && control && namePrefix) {
            replace(newVariables);
        }
    };

    if (!hasVariables) {
        return (
            <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    Configured Variables
                </span>
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-sm bg-gray-50/50 text-xs text-gray-500 italic gap-2">
                    <span>No variables configured for this test case.</span>
                    {control && namePrefix && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => setVariableModalOpen(true)}
                        >
                            <Plus className="h-3 w-3" /> Add Variable
                        </Button>
                    )}
                </div>
                {variableModalOpen && (
                    <VariableConfigModal
                        isOpen={variableModalOpen}
                        isLoading={isFetching}
                        setOpen={setVariableModalOpen}
                        variables={modalVariables}
                        currentVariable={(displayList as IVariableOption[]).map(v => {
                            const label = v.label ?? '';
                            const def = modalVariables.find(m => m.name === label);
                            const typeFallback = def ? def.type : 'string';
                            return {
                                ...v,
                                label,
                                type: v.type ?? typeFallback,
                            };
                        })}
                        onApplyVariables={handleApplyVariables}
                    />
                )}
            </div>
        );
    }

    // Slice for visibility if needed, though for editing we might want to see all or handle pagination differently.
    // For now, keeping read-only view logic for existing items if they are consistent with previous design,
    // BUT user said "This is should captured using react-hook-form", implying editable?
    // The request specifically asked for "empty placeholder button to add variables".
    // I will implement drawing the list from 'fields' so that newly added ones appear.

    const displayedVariables = !showAllVariables ? displayList.slice(0, VISIBLE_COUNT) : displayList;
    const remainingCount = (displayList.length ?? 0) - VISIBLE_COUNT;

    return (
        <div>
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                Configured Variables{' '}
                <Badge
                    variant="secondary"
                    className="bg-white border border-blue-100 text-blue-600 shadow-sm gap-2 hover:bg-blue-50/50"
                >
                    {displayList.length}
                </Badge>
            </label>
            <div className="dark:bg-gray-500 p-2 rounded-md border border-blue-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-3">
                    {displayedVariables.map((v: any, i) => (
                        <Badge
                            key={v.key || i} // Use key from useFieldArray
                            variant="secondary"
                            className="px-2.5 py-1 bg-white border border-indigo-100 text-gray-600 shadow-sm gap-2 hover:bg-indigo-50/50"
                        >
                            {/* For now keeping them as display badges, but referencing field data */}
                            {/* If we want full editability here, we'd replace spans with inputs.
                                 But request focused on "add" button.
                                 I'll enable simple edit of the added ones if I use Inputs, but previous UI was Badges.
                                 Let's stick to Badges but render values from 'v'.
                             */}
                            <span className="font-bold text-sm tracking-wider text-indigo-400">
                                {v.label}
                            </span>
                            <div className="h-3 w-[1px] bg-blue-100" />
                            <span className="font-mono font-medium text-indigo-900">{String(v.value)}</span>
                        </Badge>
                    ))}
                    {control && namePrefix && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200"
                            onClick={() => setVariableModalOpen(true)}
                            title="Add/Edit variables"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}

                    {!showAllVariables && remainingCount > 0 && (
                        <button
                            onClick={() => setShowAllVariables(true)}
                            className="px-2.5 py-1 bg-indigo-50 text-blue-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                        >
                            + See {remainingCount} More
                        </button>
                    )}
                    {showAllVariables && displayList.length > VISIBLE_COUNT && (
                        <button
                            onClick={() => setShowAllVariables(false)}
                            className="px-2.5 py-1 bg-gray-50 text-blue-600 text-xs font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Show Less
                        </button>
                    )}
                </div>
            </div>
            {variableModalOpen && (
                <VariableConfigModal
                    isOpen={variableModalOpen}
                    isLoading={isFetching}
                    setOpen={setVariableModalOpen}
                    variables={modalVariables}
                    currentVariable={(displayList as IVariableOption[]).map(v => {
                        const label = v.label ?? '';
                        const def = modalVariables.find(m => m.name === label);
                        const typeFallback = def ? def.type : 'string';
                        return {
                            ...v,
                            label,
                            type: v.type ?? typeFallback,
                        };
                    })}
                    onApplyVariables={handleApplyVariables}
                />
            )}
        </div>
    );
};
