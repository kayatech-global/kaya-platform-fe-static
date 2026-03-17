'use client';

import React, { SetStateAction } from 'react';
import { VersionComparison } from '@/components/molecules/workflow-pull/version-comparison';
import { WorkflowComparison } from '@/components/molecules/workflow-pull/ai-diff-note';
import { IPullTypeIdentifierResponse, IWorkflowComparisonResponse } from '@/models/workflow-pull.model';

import { IntelligenceSourceEmptyState } from './intelligence-source-empty-state';
import { IntelligenceSourceConfiguredState } from './intelligence-source-configured-state';
import { cn } from '@/lib/utils';
import { useQuery } from 'react-query';

import { FetchError } from '@/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components';

import { validate_mock_data } from '../mock_data';
import { QueryKeyType } from '@/enums';

interface IDifferencesStepProps {
    workflowComparisonData: IWorkflowComparisonResponse | undefined;
    setWorkflowComparisonData: (value: SetStateAction<IWorkflowComparisonResponse | undefined>) => void;
    setWorkflowComparisonReceivedSuccessfully: (value: SetStateAction<boolean>) => void;
    artifactPath: string | null;
    artifactVersion: string | null;
    pullType: IPullTypeIdentifierResponse | undefined;
}

export const DifferencesStep = ({
    workflowComparisonData,
    setWorkflowComparisonData,
    setWorkflowComparisonReceivedSuccessfully,
}: IDifferencesStepProps) => {
    const isSourceUnavailable = false; // Always show comparison for static mock

    const { refetch: refetchWorkflowComparisonType, isFetching: workflowComparisonLoading } = useQuery(
        QueryKeyType.WORKFLOW_COMPARISON,
        async () => {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 800));
            // Return first item from validate_mock_data as mock diff
            return validate_mock_data[0];
        },
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                if (data.comparison) {
                    setWorkflowComparisonData({
                        comparisonOutput: data.comparison.comparisonOutput,
                        currentPublishGraph: JSON.stringify(data.comparison.currentPublishGraph, null, 2),
                        incomingPublishGraph: JSON.stringify(data.comparison.incomingPublishGraph, null, 2),
                    });
                }
                setWorkflowComparisonReceivedSuccessfully(true);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                console.error('Failed to fetch comparison data', error?.message);
            },
        }
    );

    const onConfigured = () => {
        refetchWorkflowComparisonType();
    };

    return (
        <div className="flex flex-col gap-y-4 h-full">
            <div className="">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Review What Has Changed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Compare the current workflow with the incoming version side by side
                </p>
            </div>

            {/* Version Comparison Header */}
            <VersionComparison currentVersion={'Current Version'} incomingVersion={'Incoming Version'} />
            <div className="relative">
                {isSourceUnavailable && <IntelligenceSourceEmptyState onChange={onConfigured} />}
                {!isSourceUnavailable && workflowComparisonData === undefined && !workflowComparisonLoading && (
                    <IntelligenceSourceConfiguredState refetchWorkflowComparisonType={refetchWorkflowComparisonType} />
                )}
                {workflowComparisonLoading && (
                    <div className="z-10 absolute border w-full h-full rounded-sm overflow-clip flex items-center justify-center flex-col gap-y-2">
                        <Spinner />
                        <p className="text-sm">Please wait while we fetch what has change...</p>
                    </div>
                )}
                <div
                    className={cn({
                        'blur-sm pointer-events-none':
                            workflowComparisonLoading || workflowComparisonData === undefined,
                    })}
                >
                    {/* Release Note Tabs */}
                    <WorkflowComparison
                        aiNote={workflowComparisonData?.comparisonOutput as string}
                        currentChanges={workflowComparisonData?.currentPublishGraph as string}
                        incomingChanges={workflowComparisonData?.incomingPublishGraph as string}
                    />
                </div>
            </div>
        </div>
    );
};
