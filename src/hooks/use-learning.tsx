/* eslint-disable @typescript-eslint/no-explicit-any */
import {useAuth} from '@/context';
import {IFeedbackLearning, IFeedbackLearningMetadata, ILearningWorkflow} from '@/models';
import {$fetch} from '@/utils';
import {useParams, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {useMutation, useQuery} from 'react-query';
import {toQueryParams} from '@/lib/utils';

// Fetch workflow details including agents
const fetchWorkflowDetails = async (workspaceId: string, workflowId: string) => {
    const response = await $fetch<any>(`/workspaces/${workspaceId}/workflows/${workflowId}`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });
    return response.data;
};

interface ILearningFilter {
    workspace_id?: string;
    workflow_id?: string;
    agent_id?: string;
    query?: string;
    limit?: number;
}

const approveFeedback = async (
    workspaceId: string,
    feedbackId: string,
    workflowVariables?: Record<string, any>,
    comment?: string
) => {
    const response = await $fetch<{ response: string }>(
        `/workspaces/${workspaceId}/learning/feedback/${feedbackId}/authoring`,
        {
            method: 'POST',
            headers: {
                'x-workspace-id': workspaceId,
            },
            body: JSON.stringify({
                feedbackId: feedbackId,
                workflowVariables: workflowVariables || {},
                comment: comment,
            }),
        }
    );

    return response.data;
};

const rejectFeedback = async (workspaceId: string, feedbackId: string, comment?: string) => {
    // Placeholder endpoint for rejection
    const response = await $fetch<{ response: string }>(
        `/workspaces/${workspaceId}/learning/feedback/${feedbackId}/rejection`,
        {
            method: 'POST',
            headers: {
                'x-workspace-id': workspaceId,
            },
            body: JSON.stringify({
                feedbackId: feedbackId,
                comment: comment,
            }),
        }
    );

    return response.data;
};

const updateFeedback = async (
    workspaceId: string,
    feedbackId: string,
    data: {
        feedback: string;
        rationale?: string;
        metadata: IFeedbackLearningMetadata;
        mustLearn: boolean,
        approvalStatus: string,
        comment: string
    }
) => {
    const response = await $fetch<IFeedbackLearning>(`/workspaces/${workspaceId}/learning/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
            'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
            id: feedbackId,
            feedback: data.feedback,
            rationale: data.rationale,
            metadata: data.metadata,
            mustLearn: data.mustLearn,
            approvalStatus: data.approvalStatus,
            comment: data.comment,
        }),
    });

    return response.data;
};

const deleteFeedback = async (workspaceId: string, feedbackId: string) => {
    const response = await $fetch<{ message: string }>(`/workspaces/${workspaceId}/learning/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

const unlinkFeedback = async (workspaceId: string, feedbackId: string) => {
    const response = await $fetch<{ message: string }>(
        `/workspaces/${workspaceId}/learning/feedback/group/feedback/${feedbackId}`,
        {
            method: 'DELETE',
            headers: {
                'x-workspace-id': workspaceId,
            },
        }
    );

    return response.data;
};

const fetchLearnings = async (workspaceId: string, params?: ILearningFilter) => {
    const {workspace_id, ...restParams} = params || {};
    const convertToQueryParams = toQueryParams(restParams);
    const queryParams = convertToQueryParams ? `?${convertToQueryParams}` : '';
    const response = await $fetch<IFeedbackLearning[]>(`/workspaces/${workspace_id}/learning/feedback${queryParams}`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });
    return response.data;
};

// Helper function to transform flat learnings into hierarchical structure
const transformLearningsToHierarchy = (
    learnings: IFeedbackLearning[],
    workflowDetails?: Record<string, any>
): ILearningWorkflow[] => {
    const workflowMap = new Map<string, ILearningWorkflow>();

    learnings.forEach(learning => {
        let workflow = workflowMap.get(learning.workflowId);
        if (!workflow) {
            const workflowInfo = workflowDetails?.[learning.workflowId];
            workflow = {
                workflow_id: learning.workflowId,
                workflow_name: workflowInfo?.name || learning.workflowId,
                agents: [],
            };
            workflowMap.set(learning.workflowId, workflow);
        }
        let agent = workflow.agents.find(a => a.agent_id === learning.agentId);
        if (!agent) {
            agent = {
                agent_id: learning.agentId,
                agent_name: learning.agentName,
                feedbacks: [],
            };
            workflow.agents.push(agent);
        }

        agent.feedbacks.push(learning);
    });

    return Array.from(workflowMap.values());
};

export const useLearning = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const {token} = useAuth();
    const [learnings, setLearnings] = useState<IFeedbackLearning[]>([]);
    const [learningWorkflows, setLearningWorkflows] = useState<ILearningWorkflow[]>([]);
    const [learningParams, setLearningParams] = useState<ILearningFilter | undefined>(undefined);

    // Read URL params and update filters whenever they change
    useEffect(() => {
        const workflowId = searchParams.get('workflowId');
        const agentId = searchParams.get('agentId');
        setLearningParams({
            workflow_id: workflowId || undefined,
            agent_id: agentId || undefined,
        });
    }, [searchParams]);

    const {isFetching: loadingLearnings, refetch: refetchLearnings} = useQuery(
        ['learnings', params.wid, learningParams],
        () => fetchLearnings(params.wid as string, {...learningParams, workspace_id: params.wid as string}),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: async data => {
                setLearnings(data);

                // Get unique workflow IDs from learnings
                const uniqueWorkflowIds = [...new Set(data.map(l => l.workflowId))];

                // Fetch workflow details for each unique workflow
                const workflowDetailsMap: Record<string, any> = {};
                await Promise.all(
                    uniqueWorkflowIds.map(async workflowId => {
                        try {
                            const details = await fetchWorkflowDetails(params.wid as string, workflowId);
                            workflowDetailsMap[workflowId] = details;
                        } catch (error) {
                            console.error(`Failed to fetch workflow details for ${workflowId}:`, error);
                        }
                    })
                );

                // Transform flat data into hierarchical structure
                const hierarchical = transformLearningsToHierarchy(data, workflowDetailsMap);
                setLearningWorkflows(hierarchical);
            },
            onError: () => {
                setLearnings([]);
                setLearningWorkflows([]);
            },
        }
    );

    const {mutateAsync: approveAsync, isLoading: approvingFeedback} = useMutation(
        ({
             feedbackId,
             workflowVariables,
             comment,
         }: {
            feedbackId: string;
            workflowVariables?: Record<string, any>;
            comment?: string;
        }) => approveFeedback(params.wid as string, feedbackId, workflowVariables, comment),
        {
            onSuccess: () => {
                // Refetch learnings after successful approval
                refetchLearnings();
            },
        }
    );

    const {mutateAsync: rejectAsync, isLoading: rejectingFeedback} = useMutation(
        ({feedbackId, comment}: { feedbackId: string; comment?: string }) =>
            rejectFeedback(params.wid as string, feedbackId, comment),
        {
            onSuccess: () => {
                refetchLearnings();
            },
        }
    );

    const {mutateAsync: deleteAsync, isLoading: deletingFeedback} = useMutation(
        (feedbackId: string) => deleteFeedback(params.wid as string, feedbackId),
        {
            onSuccess: () => {
                // Refetch learnings after successful deletion
                refetchLearnings();
            },
        }
    );

    const {mutateAsync: updateAsync, isLoading: updatingFeedback} = useMutation(
        ({
             feedbackId,
             data,
         }: {
            feedbackId: string;
            data: {
                feedback: string;
                rationale?: string;
                metadata: IFeedbackLearningMetadata;
                mustLearn: boolean,
                approvalStatus: string,
                comment: string
            };
        }) => updateFeedback(params.wid as string, feedbackId, data),
        {
            onSuccess: () => {
                // Refetch learnings after successful update
                refetchLearnings();
            },
        }
    );

    const {mutateAsync: unlinkAsync, isLoading: unlinkingFeedback} = useMutation(
        (feedbackId: string) => unlinkFeedback(params.wid as string, feedbackId),
        {
            onSuccess: () => {
                // Refetch learnings after successful unlink
                refetchLearnings();
            },
        }
    );

    return {
        learnings,
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
        initialWorkflowId: learningParams?.workflow_id,
        initialAgentId: learningParams?.agent_id,
    };
};
