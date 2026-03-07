'use client';

import React, { SetStateAction, useState } from 'react';
import { VersionComparison } from '@/components/molecules/workflow-pull/version-comparison';
import { WorkflowComparison } from '@/components/molecules/workflow-pull/ai-diff-note';
import { IPullTypeIdentifierResponse, IWorkflowComparisonResponse } from '@/models/workflow-pull.model';
import { useApp } from '@/context/app-context';
import { IntelligenceSourceEmptyState } from './intelligence-source-empty-state';
import { cn } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { FetchError } from '@/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components';
import { IntelligenceSourceConfiguredState } from './intelligence-source-configured-state';
import { registryService } from '@/services';
import { QueryKeyType } from '@/enums';

const sanitizeMarkdownString = (input: string): string => {
    if (!input) return '';
    let cleaned = input.trim();
    // 1. Remove accidental wrapping quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    // 2. Replace escaped newlines \\n → real newline
    cleaned = cleaned.replace(/\\n/g, '\n');
    // 3. Replace escaped quotes \" → "
    cleaned = cleaned.replace(/\\"/g, '"');
    // 4. Convert double backslashes \\ → \
    cleaned = cleaned.replace(/\\\\/g, '\\');
    // 5. Trim again for safety
    return cleaned.trim();
};

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
    artifactPath,
    artifactVersion,
    pullType,
}: IDifferencesStepProps) => {
    const { intelligentSource } = useApp();
    const params = useParams();
    const [isSourceUnavailable, setIsSourceUnavailable] = useState<boolean | undefined>(
        !intelligentSource || intelligentSource?.isDeleted
    );

    const { refetch: refetchWorkflowComparisonType, isFetching: workflowComparisonLoading } = useQuery(
        QueryKeyType.WORKFLOW_COMPARISON,
        () =>
            registryService.diff(
                params.wid as string,
                artifactPath as string,
                artifactVersion as string,
                pullType?.sessionId as string
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setWorkflowComparisonData({
                    comparisonOutput: sanitizeMarkdownString(data.comparisonOutput),
                    currentPublishGraph: JSON.stringify(data.currentPublishGraph, null, 2),
                    incomingPublishGraph: JSON.stringify(data.incomingPublishGraph, null, 2),
                });
                setWorkflowComparisonReceivedSuccessfully(true);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                console.error('Failed to fetch comparison data', error?.message);
            },
        }
    );

    const onConfigured = () => {
        setIsSourceUnavailable(false);
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
                            isSourceUnavailable || workflowComparisonLoading || workflowComparisonData === undefined,
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
