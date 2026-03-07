'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/molecules';
import { IWorkflowGraphResponse, IWorkflowTypes } from '@/models';
import { WorkflowHeaderLeft } from './workflow-header-left';
import { WorkflowHeaderRight } from './workflow-header-right';

interface EditorHeaderMainProps {
    workflowName: string;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    version?: string;
    refetchWorkflow: (versionType?: string | undefined) => Promise<IWorkflowGraphResponse>;
    isLoading: boolean;
    hasChanges: boolean;
}

export const EditorHeaderMain = ({
    workflowName,
    isDraft,
    availableVersions,
    version,
    refetchWorkflow,
    isLoading,
    hasChanges,
}: EditorHeaderMainProps) => {
    return (
        <div className="w-full px-6 py-1 border-b border-blue-400 dashboard-header-bg-gradient flex items-center justify-between">
            <div className="left-side-main header flex items-start gap-x-3">
                <motion.div className="mt-2" whileTap={{ scale: 0.9 }}>
                    <SidebarTrigger size={32} />
                </motion.div>
                <WorkflowHeaderLeft
                    workflowName={workflowName}
                    isDraft={isDraft}
                    availableVersions={availableVersions}
                    version={version}
                    refetchWorkflow={refetchWorkflow}
                    isLoading={isLoading}
                    hasChanges={hasChanges}
                />
            </div>
            <WorkflowHeaderRight />
        </div>
    );
};
