import {
    CustomNodeTypes,
    ExecutionStatusType,
    LineageEventType,
    LineageStepExplanationType,
    LineageSubStepExplanationType,
    SessionViewType,
} from '@/enums';
import { IWorkflowVariable } from './workflow.model';
import { Edge, Node } from '@xyflow/react';
import { IOption } from './common.model';

export interface IDataLineage {
    id: string;
    name: string;
}

export interface IDataLineageSession {
    sessionId: string;
    actor: string;
    startedAt: string;
    endedAt: string;
    status: string;
    executions: IDataLineageSessionExecution[];
}

export interface IDataLineageSessionExecution {
    id: string;
    startedAt: string;
    endedAt: string;
    status: ExecutionStatusType;

    sessionId?: string;
    workflowId?: string;
    workflowName?: string;
}

export interface IDataLineageFilter {
    id?: string;
    startDate?: string;
    endDate?: string;
    textSearch?: string;
    startTime?: string;
    endTime?: string;
    workflowOption?: IOption;
}

export interface IDataLineageSessionFilter {
    startDate?: string;
    endDate?: string;
    textSearch?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
}

export interface IDataLineageGraph {
    visualGraph: IDataLineageVisualGraph;
    steps: IDataLineageViewStep[];
}

export interface IDataLineageVisualGraph {
    nodes: Node[];
    edges: Edge[];
    variables: IWorkflowVariable | undefined;
}

export interface IDataLineageViewStep {
    payload: {
        workflowId: string;
        sessionId: string;
        timestamp: string;
        job: string;
        actor: string;
        // remove this key after when agentName retrieving for agentName <needed for JSON export file name>
        agentName?: string;
        inputs: {
            userMessage: string;
            prompt: string;
        };
        tool?: string;
        outputs: {
            outputMessage: string;
        };
        metrics: {
            promptTokens: number;
            responseTokens: number;
            latency: string;
        };
    };
    stepIndex: number;
    agentId: string;
}

export interface IDataLineageStepExplanation {
    content?: string;
    payload: unknown;
    type?: LineageStepExplanationType;
}

export interface IDataLineageEvent {
    sessionId: string;
    workflowId: string;
    executionId: string;
    workspaceId: string;
    eventType: LineageEventType;
    workflowName: string;
    stepNumber: number;
    substepNumber?: number;
}

export interface IDataLineageLinear {
    stepIndex: number;
    name: string;
    type: CustomNodeTypes;
    payload: unknown;
}

export interface IDataLineageSubStep {
    substepIndex: number;
    substepName: string;
    substepType: LineageSubStepExplanationType;
    payload: unknown;
}

// Interface for a step
export interface IDataLineageStep {
    stepIndex: number;
    stepName: string;
    viewType: SessionViewType;
    substeps: IDataLineageSubStep[];
}

export interface IDataLineageWorkflowFilter {
    id?: string;
    startedAt?: string;
    endedAt?: string;
    timezone?: string;
}
