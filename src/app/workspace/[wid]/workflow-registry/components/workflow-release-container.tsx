'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { WorkflowReleaseTable } from './workflow-release-table';
import { cn } from '@/lib/utils';
import { useWorkflowRelease } from '@/hooks/use-workflow-release';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const WorkflowReleaseContainer = () => {
    const { isLg } = useBreakpoint();
    const {
        workflowArtifactTableData,
        isFetching,
        onWorkflowArtifactFilter,
        onDeploy,
        getWorkflowArtifactVersion,
        loadingArtifactVersion,
        loadingRow,
        workflowVersions,
        refetch,
    } = useWorkflowRelease();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': isLg,
                    })}
                >
                    <WorkflowReleaseTable
                        workflowArtifactData={workflowArtifactTableData}
                        onWorkflowArtifactFilter={onWorkflowArtifactFilter}
                        onDeploy={onDeploy}
                        getWorkflowArtifactVersion={getWorkflowArtifactVersion}
                        loadingArtifactVersion={loadingArtifactVersion}
                        loadingRow={loadingRow}
                        workflowVersions={workflowVersions}
                        refetch={refetch}
                    />
                </div>
            </div>
        </div>
    );
};
