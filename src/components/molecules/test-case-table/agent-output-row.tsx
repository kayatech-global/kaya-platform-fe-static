'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TestCaseActionButtons } from './test-case-action-buttons';
import { EditableTableCell } from '@/components/atoms/editable-table-cell';

type AgentOutputRowProps = {
    agentName: string;
    agentOutput: string;
    agentGroundTruth: string;
    agentIdx: number;
    rowIdx: number;
onSave: (agentIdx: number, data: { expectedOutput: string; expectedBehaviour: string }) => void;
};

export const AgentOutputRow = ({
    agentName,
    agentOutput,
    agentGroundTruth,
    agentIdx,
    onSave,
}: AgentOutputRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        expectedOutput: agentOutput,
        expectedBehaviour: agentGroundTruth,
    });
    const [isToolAccordionOpen, setIsToolAccordionOpen] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({
            expectedOutput: agentOutput,
            expectedBehaviour: agentGroundTruth,
        });
    };

    const handleSave = () => {
        onSave(agentIdx, editedData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({
            expectedOutput: agentOutput,
            expectedBehaviour: agentGroundTruth,
        });
    };

    return (
        <>
            <div className="grid grid-cols-12 border-b hover:bg-gray-50">
                {/* Chevron column */}
                <button
                    type="button"
                    className="col-span-1 px-4 py-3 border-r flex items-center cursor-pointer w-full text-left bg-transparent border-0"
                    onClick={() => setIsToolAccordionOpen(prev => !prev)}
                >
                    <ChevronRight
                        size={16}
                        className={`text-gray-600 transition-transform duration-200 ${isToolAccordionOpen ? 'rotate-90' : ''}`}
                    />
                </button>

                <div className="col-span-3 px-4 py-3 border-r">{agentName}</div>

                <div className="col-span-3 px-4 py-3 border-r">
                    <EditableTableCell
                        isEditing={isEditing}
                        value={editedData.expectedOutput}
                        displayValue={agentOutput}
                        onChange={value => setEditedData(prev => ({ ...prev, expectedOutput: value }))}
                    />
                </div>

                <div className="col-span-3 px-4 py-3 border-r">
                    <EditableTableCell
                        isEditing={isEditing}
                        value={editedData.expectedBehaviour}
                        displayValue={agentGroundTruth}
                        onChange={value => setEditedData(prev => ({ ...prev, expectedBehaviour: value }))}
                    />
                </div>

                <div className="col-span-2 px-4 py-3 flex gap-1">
                    <TestCaseActionButtons
                        isEditing={isEditing}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>

            {/* Tool Config Table - placeholder */}
            {isToolAccordionOpen && (
                <div className="bg-gray-50 px-16 py-4 border-b">
                    <div className="bg-white border rounded-md overflow-hidden">
                        <div className="grid grid-cols-2 bg-gray-50 border-b font-medium text-sm">
                            <div className="px-4 py-2 border-r">Tool Config</div>
                            <div className="px-4 py-2">Tool Output</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
