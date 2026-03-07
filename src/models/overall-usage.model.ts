import { OverallUsageType, UnitType, UsageUnitType } from '@/enums';

export interface IQuota {
    unit: UnitType;
    unitType: UsageUnitType;
    limit: number;
}

export interface IQuotaType {
    storage: IQuota;
    credits: IQuota;
    tokens: IQuota;
}

export interface OverallUsage {
    type: OverallUsageType;
    unit: UnitType;
    unitType: UsageUnitType;
    usage: number;
    month: number;
    year: number;
    model?: string;
}

export interface OverallUsageResponse {
    quota: IQuotaType;
    usage: OverallUsage[];
}

export interface IConsumption {
    storage?: OverallUsage[];
    credits?: OverallUsage[];
    tokens?: OverallUsage[];
}

export interface WorkflowExecutionResponse {
    workflows: IWorkflowExecution[];
}

export interface IWorkflowExecution {
    workflowId: string;
    workflowName: string;
    executionCount: number;
    month: number;
    year: number;
}
