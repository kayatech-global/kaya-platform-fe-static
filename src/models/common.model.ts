/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiToolResponseType } from '@/app/workspace/[wid]/agents/components/agent-form';
import { OptionModel } from '@/components/atoms/select';
import { API, ExecutableFunction } from '@/components/organisms';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { UseFormSetValue } from 'react-hook-form';
import { IVectorRag } from './vector-rag.model';
import { IGraphRag } from './graph-rag.model';
import { IConnectorForm } from './configuration.model';

export interface IOption {
    // name?: string;
    label: string;
    value: string;
    disabled?: boolean;
}

export interface IGroupOption {
    label: string;
    options: IOption[];
}

export interface FormRule {
    required:
        | {
              value: boolean;
              message: string;
          }
        | undefined;
}

export interface IAllModel {
    id: string;
    name: string;
    modelName: string;
    provider: string;
    configurations: {
        providerConfig: {
            id: string;
            logo: {
                '16': string;
                '32': string;
                '48': string;
            };
            value: string;
            description: string;
        };
        temperature: number;
        apiAuthorization: string;
        customerHeaders: [];
        baseUrl: string;
        customRuntime?: boolean;
        description: string;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        tokenLimit: number | null;
    };
    isReadOnly?: boolean;
}

export interface IHookForm {
    formName: string;
    setValue: UseFormSetValue<any>;
}

export interface IHookProps {
    triggerQuery?: boolean;
    hookForm?: IHookForm;
    data?: any;
    onRefetch?: (data?: unknown) => void;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    onRefetchVariables?: () => Promise<void>;
    onManage?: () => void;
}

export interface IFile {
    name: string;
    size: number;
    file: File;
    base64Url?: string;
}

export interface IResultWrapper<T> {
    isValid: boolean;
    data: T;
}

export interface IBasicIntelligentSource {
    id: string;
    isSlm: boolean;
}

export interface IAuthenticationMeta {
    username?: string;
    password?: string;
    token?: string;
    headerName?: string;
}

export interface IOptionGroup<T> {
    type: T;
    options: OptionModel[];
}

export interface IBaseEntity {
    id?: string;
    search?: string;
    isReadOnly?: boolean;
}

export interface ISearch {
    search?: string;
}

export interface IPaginationParam {
    page: number;
    take: number;
    searchTerm?: string;
}

export interface IConnectorTool {
    id: string;
    toolId: string;
    name: string;
    description: string;
}

export interface ICoord {
    top: number;
    left: number;
    height: number;
}

export interface ISyncPrompt {
    prompt: string | undefined;
    allApiTools: ApiToolResponseType[] | undefined;
    allMcpTools: IMCPBody[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    allGraphRag: IGraphRag[] | undefined;
    allConnectors: IConnectorForm[] | undefined;
    allExecutableFunctions?: ExecutableFunction[];
    apis: API[] | undefined;
    mcpServers: IMCPBody[];
    vectorRags: IVectorRag[];
    graphRags: IGraphRag[];
    connectors: IConnectorForm[] | undefined;
    executableFunctions?: ExecutableFunction[];
}

export interface IPromptToolResponse {
    apis: ApiToolResponseType[] | undefined;
    mcps: IMCPBody[];
    vectorRags: IVectorRag[];
    graphRags: IGraphRag[];
    connectors: IConnectorForm[] | undefined;
    executableFunctions?: ExecutableFunction[];
}
