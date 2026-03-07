import { useState } from 'react';
import { useQuery } from 'react-query';
import { $fetch } from '@/utils';
import { Workflow } from '@/models';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';


export interface IWorkflow {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export const useTestStudioWorkflow = () => {
    const [workflows, setWorkflows] = useState<IWorkflow[]>([]);


    const params = useParams();
    const {token} = useAuth()

    const retrieveAllWorkflowsForWorkspace = async (workspaceId: number | string) => {
        const response = await $fetch<Workflow[]>(`/workspaces/${workspaceId}/workflows`, {
            method: 'GET',
            headers: {
                'x-workspace-id': workspaceId.toString(),
            },
        });

        return response.data;
    };


    const mapWorkflowData= (data: Workflow[]) => {
        if(data && data.length > 0) {
            const workflows: IWorkflow[] = data
                .filter(wf => wf?.id !== undefined)
                .map(wf => ({
                    id: wf.id!,
                    name: wf.name,
                    description: wf.description,
                    createdAt: '',
                    updatedAt: '',
                }));

            if(workflows.length > 0) {
                setWorkflows(workflows);
            }
        }
    }
    const { isFetching, isLoading } = useQuery(
        'workflows',
        () => retrieveAllWorkflowsForWorkspace(params.wid as string),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                mapWorkflowData(data);
            },
        }
    );
    // @Purpose: Fetch workflows list from mock data
    // useEffect(() => {
    //     const fetchWorkflows = () => {
    //         try {
    //             setIsLoading(true);
    //             // Load workflows immediately from mock data
    //             setWorkflows(workflowsList);
    //             setIsLoading(false);
    //         } catch (err) {
    //             setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
    //             setIsLoading(false);
    //         }
    //     };
    //
    //     fetchWorkflows();
    // }, []);

    // @Purpose: Search workflows by name or description
    const searchWorkflows = (query: string): IWorkflow[] => {
        if (!query) return workflows;
        const lowerQuery = query.toLowerCase();
        return workflows.filter(
            workflow =>
                workflow.name.toLowerCase().includes(lowerQuery) ||
                workflow.description.toLowerCase().includes(lowerQuery)
        );
    };

    return {
        workflows,
        isFetching,
        isLoading,
        searchWorkflows,
    };
};
