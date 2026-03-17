/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDataLineage, IDataLineageSession, IDataLineageLinear, IDataLineageGraph, PaginationResponse } from '@/models';
import { CustomNodeTypes, ExecutionStatusType } from '@/enums';

export const mock_lineage_workflows: IDataLineage[] = [
    {
        id: 'wf-1',
        name: 'Customer Support Bot',
    },
    {
        id: 'wf-4',
        name: 'Email Summarizer',
    },
];

export const mock_lineage_sessions: Record<string, PaginationResponse<IDataLineageSession[]>> = {
    'wf-1': {
        items: [
            {
                sessionId: 'sess-101',
                actor: 'User A',
                startedAt: '2024-03-10T10:00:00Z',
                endedAt: '2024-03-10T10:01:00Z',
                status: 'Completed',
                executions: [
                    {
                        id: 'exec-1',
                        sessionId: 'sess-101',
                        workflowId: 'wf-1',
                        workflowName: 'Customer Support Bot',
                        startedAt: '2024-03-10T10:00:00Z',
                        endedAt: '2024-03-10T10:01:00Z',
                        status: ExecutionStatusType.SUCCESS as any,
                    },
                ],
            },
        ],
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    },
};

export const mock_lineage_linear: Record<string, IDataLineageLinear[]> = {
    'exec-1': [
        {
            stepIndex: 0,
            name: 'start',
            type: CustomNodeTypes.startNode,
            payload: { input: 'Hello' },
        },
        {
            stepIndex: 1,
            name: 'supervisor_agent',
            type: CustomNodeTypes.supervisorAgentTemplate,
            payload: { thought: 'I should help the user', response: 'Hi there!' },
        },
        {
            stepIndex: 2,
            name: 'end',
            type: CustomNodeTypes.endNode,
            payload: { output: 'Hi there!' },
        },
    ],
};

export const mock_lineage_modular: Record<string, IDataLineageGraph> = {
    'exec-1': {
        visualGraph: {
            nodes: [
                {
                    id: 'node-start',
                    type: CustomNodeTypes.startNode,
                    data: { name: 'Start', type: CustomNodeTypes.startNode },
                    position: { x: 0, y: 0 },
                } as any,
                {
                    id: 'agent-1',
                    type: CustomNodeTypes.supervisorAgentTemplate,
                    data: { name: 'Supervisor Agent', type: CustomNodeTypes.supervisorAgentTemplate },
                    position: { x: 200, y: 0 },
                } as any,
                {
                    id: 'node-end',
                    type: CustomNodeTypes.endNode,
                    data: { name: 'End', type: CustomNodeTypes.endNode },
                    position: { x: 400, y: 0 },
                } as any,
            ],
            edges: [
                { id: 'e1', source: 'node-start', target: 'agent-1', animated: true } as any,
                { id: 'e2', source: 'agent-1', target: 'node-end', animated: true } as any,
            ],
            variables: undefined,
        },
        steps: [
            {
                agentId: 'agent-1',
                payload: {
                    workflowId: 'wf-1',
                    sessionId: 'sess-101',
                    timestamp: '2024-03-10T10:00:30Z',
                    job: 'Processing',
                    actor: 'Supervisor Agent',
                    inputs: {
                        userMessage: 'Hello',
                        prompt: 'Process the message',
                    },
                    outputs: {
                        outputMessage: 'Hi there!',
                    },
                    metrics: {
                        promptTokens: 10,
                        responseTokens: 5,
                        latency: '0.5s',
                    },
                },
                stepIndex: 1,
            },
        ],
    },
};
