import { IAuthorization, IHeaderValues } from '@/models';
import { AgentType, API } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';

export interface IApiToolConfiguration {
    url: string;
    method: string;
    headers: IHeaderValues[];
    payload: string;
    authorization: IAuthorization;
    promotedVariables: string;
}

export interface IApiTool {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: IApiToolConfiguration;
}

/**
 * Props for the APISelector component, which manages the selection and configuration of APIs
 * for a given agent within the editor workflow.
 */
export interface APISelectorProps {
    agent: AgentType | VoiceAgent | undefined;
    apis: API[] | undefined;
    isReadonly?: boolean;
    apiLoading?: boolean;
    setApis: React.Dispatch<React.SetStateAction<API[] | undefined>>;
    allApiTools: IApiTool[];
    onRefetch: () => void;
    onModalChange?: (open: boolean) => void;
    onApiChange?: (apis: API[] | undefined) => void;
    label?: string;
    labelClassName?: string;
    isMultiple?: boolean;
    description?: string;
    isSelfLearning?: boolean;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    // Added to support React Hook Form usage which passes name, onChange, onBlur, ref via spread
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange?: (event: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onBlur?: (event: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: React.Ref<any>;
}
