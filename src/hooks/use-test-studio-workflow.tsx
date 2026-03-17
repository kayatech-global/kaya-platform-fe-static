import { useState } from 'react';
import { workflowsList } from '@/app/workspace/[wid]/test-studio/mock/workflows-list';

export interface IWorkflow {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export const useTestStudioWorkflow = () => {
    const [workflows] = useState<IWorkflow[]>(workflowsList);

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
        isFetching: false,
        isLoading: false,
        searchWorkflows,
    };
};
