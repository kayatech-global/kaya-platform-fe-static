import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import EditorButton from '@/components/atoms/editor-button';
import { CommitWorkflowModalContainer } from '@/components/organisms/commit-workflow-modal-container/commit-workflow-container';
import { PublishWorkflowModalContainer } from '@/components/organisms/publish-workflow-modal-container/publish-workflow-container';
import { AgentCorePublishModal } from '@/components/organisms/agentcore-publish-modal';
import { cn } from '@/lib/utils';
import { IWorkflowTypes } from '@/models';
import { useTheme } from '@/theme';
import { CircleFadingArrowUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Node as FlowNode, Edge } from '@xyflow/react';
import { CustomNodeTypes } from '@/enums';
import { toast } from 'sonner';

interface IReleaseManagementContainerProps {
    version?: string;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    isLoading: boolean;
    hasChanges: boolean;
    isButtonBreakpointReach: boolean;
    nodes?: FlowNode[];
    edges?: Edge[];
    GuardrailsButtonWrapper: React.ReactNode;
}

export const ReleaseManagementContainer = ({
    version,
    refetchGraph,
    isDraft,
    availableVersions,
    isLoading,
    hasChanges,
    isButtonBreakpointReach,
    nodes,
    edges,
    GuardrailsButtonWrapper,
}: IReleaseManagementContainerProps) => {
    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [openCommitModal, setOpenCommitModal] = useState(false);
    const [openSaveConfirmationModal, setOpenSaveConfirmationModal] = useState(false);
    const [openAgentCoreModal, setOpenAgentCoreModal] = useState(false);

    const [isPublishDisabled, setIsPublishDisabled] = useState(false);
    const [isCommitDisable, setIsCommitDisable] = useState(false);

    const { theme } = useTheme();

    /**
     * Validates if all agent nodes are connected on both sides in the workflow
     * Returns true only if ALL agent nodes have both incoming AND outgoing connections
     * Also returns true if workflow has only start and end nodes (no agent nodes)
     */
    const validateAgentConnections = (): boolean => {
        if (!nodes || nodes.length === 0) {
            return false;
        }

        // Define agent node types
        const agentNodeTypes = new Set<CustomNodeTypes>([
            CustomNodeTypes.agentNode,
            CustomNodeTypes.decisionNode,
            CustomNodeTypes.plannerNode,
            CustomNodeTypes.rePlannerNode,
            CustomNodeTypes.voiceNode,
            CustomNodeTypes.loaderNode,
            CustomNodeTypes.cleanerNode,
            CustomNodeTypes.wranglerNode,
            CustomNodeTypes.reportNode,
        ]);

        // Get all agent nodes
        const agentNodes = nodes.filter(
            node => node?.extent !== 'parent' && agentNodeTypes.has(node.type as CustomNodeTypes)
        );

        // If no agent nodes exist (only start/end nodes), allow publishing
        if (agentNodes.length === 0) {
            return true;
        }

        // If no edges exist but agent nodes exist, validation fails
        if (!edges || edges.length === 0) {
            return false;
        }

        // Check if ALL agent nodes are connected on BOTH sides (incoming and outgoing)
        const allAgentsConnected = agentNodes.every(agentNode => {
            // Check for incoming connection (agent is a target)
            const hasIncoming = edges.some(edge => edge.target === agentNode.id);
            // Check for outgoing connection (agent is a source)
            const hasOutgoing = edges.some(edge => edge.source === agentNode.id);

            const isFullyConnected = hasIncoming && hasOutgoing;

            return isFullyConnected;
        });
        return allAgentsConnected;
    };

    const handleOnPublish = () => {
        // Validate agent connections
        if (!validateAgentConnections()) {
            toast.error('Unable to save. Please resolve validation errors before saving');
            return;
        }
        if (hasChanges) {
            setOpenSaveConfirmationModal(true);
        } else {
            setOpenPublishModal(true);
        }
    };

    useEffect(() => {
        if (Array.isArray(availableVersions)) {
            const hasDraftVersion = availableVersions.some(v => v.name === 'draft');

            const shouldDisable = !hasDraftVersion;
            setIsPublishDisabled(shouldDisable);
        } else {
            setIsPublishDisabled(false); // also disable if undefined or not an array
        }
    }, [availableVersions]);

    useEffect(() => {
        if (Array.isArray(availableVersions)) {
            const shouldDisable = availableVersions.length === 0 || !availableVersions.some(v => v.name === 'publish');
            setIsCommitDisable(shouldDisable);
        } else {
            setIsCommitDisable(true); // also disable if undefined or not an array
        }
    }, [availableVersions]);

    return (
        <>
            {!isButtonBreakpointReach && (
                <div className="flex items-center gap-x-2">
                    <TooltipProvider>
                        <Tooltip open={availableVersions?.some(v => v.name === 'draft') ? false : undefined}>
                            <TooltipTrigger asChild>
                                <div>
                                    <EditorButton
                                        variant="secondary"
                                        icon={<CircleFadingArrowUp color={theme === 'light' ? '#384151' : '#d1d5db'} />}
                                        onClick={handleOnPublish}
                                        disabled={isPublishDisabled || isLoading}
                                    >
                                        Publish
                                    </EditorButton>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                                <div className="flex flex-col gap-y-1 w-[270px]">
                                    <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                        No Draft Version Available
                                    </p>
                                    <p className="text-gray-700 text-xs dark:text-gray-200">
                                        You can’t publish without a draft version. Save your changes first, and a draft
                                        version will be created automatically.
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip open={availableVersions?.some(v => v.name === 'publish') ? false : undefined}>
                            <TooltipTrigger asChild>
                                <div>
                                    <EditorButton
                                        variant="secondary"
                                        icon="ri-git-repository-commits-line stroke-1 text-gray-700 dark:text-gray-300 "
                                        onClick={() => setOpenCommitModal(true)}
                                        disabled={isCommitDisable}
                                    >
                                        Push Workflow
                                    </EditorButton>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                                <div className="flex flex-col gap-y-1 w-[270px]">
                                    <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                        No Published Version Available
                                    </p>
                                    <p className="text-gray-700 text-xs dark:text-gray-200">
                                        Pushing to the registry requires a published version. Please publish your draft
                                        first, then try again
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip open={availableVersions?.some(v => v.name === 'publish') ? false : undefined}>
                            <TooltipTrigger asChild>
                                <div>
                                    <EditorButton
                                        variant="secondary"
                                        icon="ri-cpu-line stroke-1 text-gray-700 dark:text-gray-300"
                                        onClick={() => setOpenAgentCoreModal(true)}
                                        disabled={isCommitDisable}
                                    >
                                        Deploy to AgentCore
                                    </EditorButton>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                                <div className="flex flex-col gap-y-1 w-[270px]">
                                    <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                        Deploy to AgentCore Runtime
                                    </p>
                                    <p className="text-gray-700 text-xs dark:text-gray-200">
                                        Deploy your workflow to an AgentCore runtime for production execution
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
            {/* Responsive layout */}
            {isButtonBreakpointReach && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-[28px] w-[28px] flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <i className="ri-more-fill" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem id="publish">
                            <TooltipProvider>
                                <Tooltip open={availableVersions?.some(v => v.name === 'draft') ? false : undefined}>
                                    <TooltipTrigger
                                        disabled={isPublishDisabled || isLoading}
                                        onClick={isPublishDisabled || isLoading ? undefined : handleOnPublish}
                                        asChild
                                    >
                                        <div
                                            className={cn('flex items-center gap-x-2', {
                                                'cursor-not-allowed opacity-50': isPublishDisabled || isLoading,
                                            })}
                                        >
                                            <CircleFadingArrowUp
                                                size={18}
                                                color={theme === 'light' ? '#384151' : '#d1d5db'}
                                            />
                                            <div>Publish</div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start">
                                        <div className="flex flex-col gap-y-1 w-[270px]">
                                            <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                                No Draft Version Available
                                            </p>
                                            <p className="text-gray-700 text-xs dark:text-gray-200">
                                                You can’t publish without a draft version. Save your changes first, and
                                                a draft version will be created automatically.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </DropdownMenuItem>
                        <DropdownMenuItem id="push">
                            <TooltipProvider>
                                <Tooltip open={availableVersions?.some(v => v.name === 'publish') ? false : undefined}>
                                    <TooltipTrigger
                                        disabled={isCommitDisable}
                                        onClick={isCommitDisable ? undefined : () => setOpenCommitModal(true)}
                                        asChild
                                    >
                                        <div
                                            className={cn('flex items-center gap-x-2', {
                                                'cursor-not-allowed opacity-50': isCommitDisable || isLoading,
                                            })}
                                        >
                                            <i className="ri-git-repository-commits-line text-lg stroke-1 text-gray-700 dark:text-gray-300" />
                                            <div>Push Workflow</div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start">
                                        <div className="flex flex-col gap-y-1 w-[270px]">
                                            <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                                No Published Version Available
                                            </p>
                                            <p className="text-gray-700 text-xs dark:text-gray-200">
                                                Pushing to the registry requires a published version. Please publish
                                                your draft first, then try again
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </DropdownMenuItem>
                        <DropdownMenuItem id="agentcore">
                            <TooltipProvider>
                                <Tooltip open={availableVersions?.some(v => v.name === 'publish') ? false : undefined}>
                                    <TooltipTrigger
                                        disabled={isCommitDisable}
                                        onClick={isCommitDisable ? undefined : () => setOpenAgentCoreModal(true)}
                                        asChild
                                    >
                                        <div
                                            className={cn('flex items-center gap-x-2', {
                                                'cursor-not-allowed opacity-50': isCommitDisable || isLoading,
                                            })}
                                        >
                                            <i className="ri-cpu-line text-lg stroke-1 text-gray-700 dark:text-gray-300" />
                                            <div>Deploy to AgentCore</div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start">
                                        <div className="flex flex-col gap-y-1 w-[270px]">
                                            <p className="text-gray-700 text-xs font-semibold dark:text-gray-200">
                                                Deploy to AgentCore Runtime
                                            </p>
                                            <p className="text-gray-700 text-xs dark:text-gray-200">
                                                Deploy your workflow to an AgentCore runtime for production execution
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </DropdownMenuItem>
                        <DropdownMenuItem>{GuardrailsButtonWrapper}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {/* Modals */}
            <PublishWorkflowModalContainer
                refetchGraph={refetchGraph}
                open={openPublishModal}
                setOpen={setOpenPublishModal}
                version={version}
                isDraft={isDraft}
                availableVersions={availableVersions}
                openSaveConfirmationModal={openSaveConfirmationModal}
                setOpenSaveConfirmationModal={setOpenSaveConfirmationModal}
            />
            <CommitWorkflowModalContainer open={openCommitModal} setOpen={setOpenCommitModal} />
            <AgentCorePublishModal 
                open={openAgentCoreModal} 
                onOpenChange={setOpenAgentCoreModal}
                workflowName="Current Workflow"
                workflowVersion="1.0.0"
            />
        </>
    );
};
