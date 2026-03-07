'use client';

import React from 'react';
import { useLearning } from '@/hooks/use-learning';
import { LearningTableContainer } from './learning-table-container';
import { IOption } from '@/models';

export const LearningContainer = () => {
    const {
        learningWorkflows,
        loadingLearnings,
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
        initialWorkflowId,
        initialAgentId,
    } = useLearning();

    const feedbackAvailableWorkflows: IOption[] = learningWorkflows.map(value => ({
        label: value.workflow_name,
        value: value.workflow_id,
        disabled: false,
    }));

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div className="dashboard-left-section flex flex-col w-full">
                    <LearningTableContainer
                        learningWorkflows={learningWorkflows}
                        workflowOptions={feedbackAvailableWorkflows}
                        loadingLearnings={loadingLearnings}
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
                        initialWorkflowId={initialWorkflowId}
                        initialAgentId={initialAgentId}
                    />
                </div>
            </div>
        </div>
    );
};
