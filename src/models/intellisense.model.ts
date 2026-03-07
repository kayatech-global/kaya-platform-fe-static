/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataType } from '@/enums';

export interface IIntellisense {
    tools: IIntellisenseTools;
    variables: IAgentVariableIntellisense;
    agents: IAgentVariableIntellisense;
    metadata: IAgentVariableIntellisense;
    connectors: IAgentVariableIntellisense;
}

export interface IIntellisenseTools {
    api: IIntellisenseData;
    mcp: IIntellisenseData;
    rag: IIntellisenseData;
    graphRag: IIntellisenseData;
    executableFunction: IIntellisenseData;
}

export interface IIntellisenseData {
    shared: ISharedItem[];
    workflow: IWorkflowSharedItems;
}

export interface IAgentVariableIntellisense {
    shared: ISharedItem[];
    workflow: IWorkflowAgentVariableMap;
}

export interface IPromotedVariable {
    name: string;
    description: string;
    type: DataType;
}

export interface ISharedItem {
    id: string;
    name: string;
    description: string;
    selected_tools?: string[];
    promotedVariables?: IPromotedVariable[];
    type?: any;
    children?: ISharedItem[];
}

export interface IWorkflowSharedItems {
    [workflowId: string]: ISharedItem[];
}

export interface IWorkflowAgentVariableMap {
    [workflowId: string]: IWorkflowAgentVariableDetails;
}

export interface IWorkflowAgentVariableDetails {
    variables: ISharedItem[];
    agents: ISharedItem[];
    metadata: ISharedItem[];
}

export interface IIntellisenseItem {
    label: string;
    value: string;
    type?: any;
}

export interface IIntellisenseOption {
    name: string;
    options: IIntellisenseItem[];
}
