/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from '@/context';
import {
    IDataLineage,
    IDataLineageFilter,
    IDataLineageLinear,
    IDataLineageSessionFilter,
    IDataLineageVisualGraph,
    IDataLineageWorkflowFilter,
    IOption,
} from '@/models';
import { logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useBreakpoint } from './use-breakpoints';
import { toast } from 'sonner';
import { isNullOrEmpty } from '@/lib/utils';
import { Edge, Node } from '@xyflow/react';
import { CustomNodeTypes, QueryKeyType } from '@/enums';
import {
    mock_lineage_linear,
    mock_lineage_modular,
    mock_lineage_workflows,
} from '@/app/workspace/[wid]/data-lineage/mock_lineage_data';

// For now instead of using the name from the backend, we are transforming the nodename to be more human-readable
// After fixing the backend, we can remove this function
// INPUT: "supervisor_agent"
// OUTPUT: "Supervisor Agent"
const transformAgentName = (name: string): string => {
    if (!name) return name;

    // Replace underscores and hyphens with spaces
    let transformed = name.replace(/[_-]/g, ' ');

    // Capitalize first letter of each word
    transformed = transformed.replace(/\b\w/g, char => char.toUpperCase());

    // Handle special cases for common agent types
    const specialCases: Record<string, string> = {
        'supervisor agent': 'Supervisor Agent',
        'workout agent': 'Workout Agent',
        'nutrition agent': 'Nutrition Agent',
        'fitness agent': 'Fitness Agent',
        'health agent': 'Health Agent',
        'ai agent': 'AI Agent',
        'chat agent': 'Chat Agent',
        'assistant agent': 'Assistant Agent',
        'expert agent': 'Expert Agent',
        'specialist agent': 'Specialist Agent',
    };

    const lowerCase = transformed.toLowerCase();
    if (specialCases[lowerCase]) {
        return specialCases[lowerCase];
    }

    return transformed;
};

export const useDataLineage = () => {
    const params = useParams();
    const { token } = useAuth();
    const { isLg } = useBreakpoint();
    const [dataLineages, setDataLineages] = useState<IDataLineage[]>([]);
    const [queryParams, setQueryParams] = useState<IDataLineageFilter | undefined>(undefined);
    const [workflowParams, setWorkflowParams] = useState<IDataLineageWorkflowFilter | undefined>(undefined);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const sessionQueryParams = useMemo(() => {
        if (queryParams) {
            return {
                startDate: queryParams?.startDate,
                endDate: queryParams?.endDate,
                startTime: queryParams?.startTime,
                endTime: queryParams?.endTime,
                textSearch: queryParams?.textSearch,
            } as IDataLineageSessionFilter;
        }
        return undefined;
    }, [queryParams]);

    const { isFetching: loadingWorkflow, data: workflowOptions } = useQuery(
        [QueryKeyType.WORKFLOW_OPTIONS, params.wid],
        () => Promise.resolve(mock_lineage_workflows),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            select: data => data.map(x => ({ label: x.name, value: x.id }) as IOption),
        }
    );

    const { isFetching: loadingData } = useQuery(
        [QueryKeyType.WORKFLOWS, params.wid, workflowParams],
        () => Promise.resolve(mock_lineage_workflows),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setDataLineages(data);
                if (!hasLoadedOnce) setHasLoadedOnce(true);
            },
            onError: () => {
                setDataLineages([]);
                if (!hasLoadedOnce) setHasLoadedOnce(true);
            },
        }
    );

    const {
        mutateAsync: mutateModular,
        isLoading: loadingModular,
        data: modular,
    } = useMutation(
        async ({ executionId }: { sessionId: string; executionId: string; workflowId: string }) =>
            Promise.resolve(mock_lineage_modular[executionId]),
        {
            onError: (error: any) => {
                toast.error(error?.message);
                logger.error('Error fetching modular:', error?.message);
            },
        }
    );

    const {
        mutateAsync: mutateLinear,
        isLoading: loadingLinear,
        data: linearData,
    } = useMutation(
        async ({ executionId }: { sessionId: string; executionId: string; workflowId: string }) =>
            Promise.resolve(mock_lineage_linear[executionId]),
        {
            onError: (error: any) => {
                toast.error(error?.message);
                logger.error('Error fetching linear:', error?.message);
            },
        }
    );

    const mapLinearData = (linearData: IDataLineageLinear[] | undefined) => {
        if (linearData && linearData.length > 0) {
            const sortedData = linearData.toSorted((a, b) => a.stepIndex - b.stepIndex);
            const { nodes, edges } = sortedData.reduce(
                (acc, graph, index) => {
                    // Transform the agent name to be more human-readable
                    const transformedGraph = {
                        ...graph,
                        name: transformAgentName(graph.name),
                    };

                    const node: Node = {
                        id: `node_${index}`,
                        type: graph.type,
                        dragging: false,
                        data: {
                            overrideType:
                                graph.type === CustomNodeTypes.decisionNode
                                    ? CustomNodeTypes.supervisorAgentTemplate
                                    : undefined,
                            ...transformedGraph,
                        },
                        measured: {
                            width: 88,
                            height: 114,
                        },
                        position: {
                            x: 475 + index * 150,
                            y: 280,
                        },
                        selected: graph.type === CustomNodeTypes.startNode || graph.type === CustomNodeTypes.endNode,
                    };

                    if (index > 0) {
                        const edge: Edge = {
                            id: `edge_${index}`,
                            type: 'smoothstep',
                            source: `node_${index - 1}`,
                            target: `node_${index}`,
                            animated: true,
                        };
                        acc.edges.push(edge);
                    }

                    acc.nodes.push(node);
                    return acc;
                },
                { nodes: [] as Node[], edges: [] as Edge[] }
            );

            return { nodes, edges, variables: undefined } as IDataLineageVisualGraph;
        }
        return undefined;
    };

    const linear = mapLinearData(linearData);

    const onDataLineageFilter = (data: IDataLineageFilter | undefined, isWorkflow?: boolean) => {
        setQueryParams(data);
        if (data && isWorkflow) {
            let timezone = undefined;
            if (!isNullOrEmpty(data?.startDate) || !isNullOrEmpty(data?.endDate)) {
                timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
            setWorkflowParams({
                id: data?.id,
                startedAt: data?.startDate,
                endedAt: data?.endDate,
                timezone,
            });
        } else if (isWorkflow) {
            setWorkflowParams(undefined);
        }
    };

    const onViewDataLineage = async (sessionId: string, executionId: string, workflowId: string) => {
        if (sessionId && executionId && workflowId) {
            setLoading(true);

            try {
                await mutateLinear({ sessionId, executionId, workflowId });
            } catch (error) {
                console.error('mutateLinear failed', error);
            }

            try {
                await mutateModular({ sessionId, executionId, workflowId });
            } catch (error) {
                console.error('mutateModular failed', error);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            setLoading(false);
        }
    };

    return {
        isLg,
        isLoading: !hasLoadedOnce,
        loadingData: loadingData || loadingWorkflow,
        dataLineages,
        workflowOptions: workflowOptions ?? [],
        sessionQueryParams,
        loadingView: loadingModular || loadingLinear || loading,
        modular,
        linear,
        onDataLineageFilter,
        onViewDataLineage,
    };
};
