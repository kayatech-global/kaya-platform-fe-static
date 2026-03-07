/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { IDataLineageVisualGraph, IWorkflowGraphResponse } from '@/models';
import { $fetch } from '@/utils';
import { useQuery } from 'react-query';
import { redirect, useParams } from 'next/navigation';
import { Edge, Node } from '@xyflow/react';
import { useAuth } from '@/context';

export const useTestStudioWorkflowGraph = (workflowId: string | undefined) => {
    const [error, setError] = useState<string | null>(null);

    const [_initialSnapshot, setInitialSnapshot] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
    const [workflowVisual, setWorkflowVisual] = useState<IDataLineageVisualGraph | undefined>();
    const params = useParams();
    const { token } = useAuth();

    useEffect(() => {
        console.log(workflowId);
    }, [workflowId]);
    const getWorkflowById = async (workspaceId: string, workflowId: string | undefined, versionType?: string) => {
        if (workflowId) {
            const url = `/workspaces/${workspaceId}/workflows/${workflowId}/visual-graph${
                versionType ? `?version_type=${versionType}` : ''
            }`;

            const response = await $fetch<IWorkflowGraphResponse>(url, {
                method: 'GET',
                headers: {
                    'x-workspace-id': workspaceId,
                },
            });
            return response.data;
        }
    };

    const { isLoading } = useQuery(['workflow', workflowId], () => getWorkflowById(params.wid as string, workflowId), {
        enabled: !!token && !!workflowId,
        refetchOnWindowFocus: false,
        onSuccess: data => {
            setWorkflowVisual(data?.visualGraphData);
            if (data?.isDeleted) {
                redirect(`/404`);
            }
            // Once workflow data is received, store a deep copy snapshot
            const graph = data?.visualGraphData;

            if (graph) {
                setInitialSnapshot({
                    nodes: structuredClone(graph.nodes ?? []),
                    edges: structuredClone(graph.edges ?? []),
                });
            }
        },
        onError: () => {
            setWorkflowVisual(undefined);
            console.error('Failed to fetch workflow data');
        },
    });

    return {
        workflowVisual,
        isLoading,
        error,
    };
};
