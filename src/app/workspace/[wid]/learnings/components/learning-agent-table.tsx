/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';
import { Row, ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/molecules/table/data-table';
import { Button } from '@/components';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { IFeedbackLearningMetadata, ILearningAgent, ILearningWorkflow } from '@/models';
import { LearningFeedbackTable } from './learning-feedback-table';

interface LearningAgentTableProps {
    row: Row<ILearningWorkflow>;
    approveAsync: (params: {
        feedbackId: string;
        workflowVariables?: Record<string, any>;
        comment?: string;
    }) => Promise<any>;
    approvingFeedback: boolean;
    rejectAsync: (params: { feedbackId: string; comment?: string }) => Promise<any>;
    rejectingFeedback: boolean;
    deleteAsync: (feedbackId: string) => Promise<any>;
    deletingFeedback: boolean;
    updateAsync: (params: {
        feedbackId: string;
        data: { feedback: string; rationale?: string; metadata: IFeedbackLearningMetadata; mustLearn: boolean, comment:string, approvalStatus:string };
    }) => Promise<any>;
    updatingFeedback: boolean;
    unlinkAsync: (feedbackId: string) => Promise<any>;
    unlinkingFeedback: boolean;
    initialAgentId?: string;
}

const generateAgentColumns = (): ColumnDef<ILearningAgent>[] => {
    const columns: ColumnDef<ILearningAgent>[] = [
        {
            id: 'expand',
            size: 100,
            meta: {
                width: 100,
            },
            header: () => null,
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'agent_name',
            enableSorting: false,
            meta: {
                align: 'text-left',
            },
            header() {
                return <div className="text-left">Agent Name</div>;
            },
            cell({ row }) {
                return <div>{row.getValue('agent_name') || '-'}</div>;
            },
        },
    ];

    return columns;
};

export const LearningAgentTable = ({
    row,
    approveAsync,
    approvingFeedback,
    rejectAsync,
    rejectingFeedback,
    deleteAsync,
    deletingFeedback,
    updateAsync,
    updatingFeedback,
    unlinkAsync,
    unlinkingFeedback,
    initialAgentId,
}: LearningAgentTableProps) => {
    const workflow = row.original;
    // Filter agents based on initialAgentId if provided
    const filteredAgents = useMemo(() => {
        const agents = workflow.agents ?? [];
        if (initialAgentId) {
            return agents.filter(agent => agent.agent_id === initialAgentId);
        }
        return agents;
    }, [workflow.agents, initialAgentId]);

    // Calculate initial expanded state for agents
    const initialExpandedState = useMemo(() => {
        if (!initialAgentId) {
            return {};
        }

        const expandedState: Record<string, boolean> = {};
        const agentIndex = filteredAgents.findIndex(agent => agent.agent_id === initialAgentId);

        if (agentIndex !== -1) {
            expandedState[agentIndex.toString()] = true;
        }

        return expandedState;
    }, [filteredAgents, initialAgentId]);

    const agentColumns = generateAgentColumns();

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-800 p-4">
            <DataTable
                tableClassNames="table-fixed"
                columns={agentColumns}
                data={filteredAgents}
                searchColumnName="agent_name"
                showFooter={false}
                showTableSearch={false}
                defaultPageSize={filteredAgents.length}
                manualSpan={true}
                hideExpandedColumn={true}
                showHeader={false}
                initialExpandedState={initialExpandedState}
                renderExpandedRow={agentRow => {
                    return (
                        <LearningFeedbackTable
                            agentRow={agentRow}
                            approveAsync={approveAsync}
                            approvingFeedback={approvingFeedback}
                            rejectAsync={rejectAsync}
                            rejectingFeedback={rejectingFeedback}
                            deleteAsync={deleteAsync}
                            deletingFeedback={deletingFeedback}
                            updateAsync={updateAsync}
                            updatingFeedback={updatingFeedback}
                            unlinkAsync={unlinkAsync}
                            unlinkingFeedback={unlinkingFeedback}
                        />
                    );
                }}
            />
        </div>
    );
};
