import {useEffect, useState} from 'react';
import {useMutation, useQuery} from 'react-query';
import {useParams, useSearchParams} from 'next/navigation';
import {useAuth} from '@/context';
import {IFeedbackLearning, ILearningWorkflow} from '@/models';

import { mock_learnings, mock_workflow_details } from '@/app/workspace/[wid]/learnings/mock_learning_data';

// Fetch workflow details including agents
const fetchWorkflowDetails = async (workflowId: string) => {
    return mock_workflow_details[workflowId];
};

interface ILearningFilter {
    workspace_id?: string;
    workflow_id?: string;
    agent_id?: string;
    query?: string;
    limit?: number;
}


const fetchLearnings = async () => {
    return mock_learnings;
};

// Helper function to transform flat learnings into hierarchical structure
const transformLearningsToHierarchy = (
    learnings: IFeedbackLearning[],
    workflowDetails?: Record<string, { id: string, name: string }>
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

    const {isFetching: loadingLearnings} = useQuery(
        ['learnings', params.wid, learningParams],
        () => fetchLearnings(),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setLearnings(data);

                // Get unique workflow IDs from learnings
                const uniqueWorkflowIds = [...new Set(data.map(l => l.workflowId))];

                // Fetch workflow details for each unique workflow
                const workflowDetailsMap: Record<string, { id: string, name: string }> = {};
                Promise.all(
                    uniqueWorkflowIds.map(async workflowId => {
                        try {
                            const details = await fetchWorkflowDetails(workflowId);
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
        () => Promise.resolve()
    );

    const {mutateAsync: rejectAsync, isLoading: rejectingFeedback} = useMutation(
        () => Promise.resolve()
    );

    const {mutateAsync: deleteAsync, isLoading: deletingFeedback} = useMutation(
        () => Promise.resolve()
    );

    const {mutateAsync: updateAsync, isLoading: updatingFeedback} = useMutation(
        () => Promise.resolve()
    );

    const {mutateAsync: unlinkAsync, isLoading: unlinkingFeedback} = useMutation(
        () => Promise.resolve()
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
