import { API, AgentType } from '@/components/organisms';
import { IAuthorization, IHeaderValues } from '@/models';

export interface IGuardrailsApiTool {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: {
        url: string;
        method: string;
        guardrailType: string;
        guardrailApiProvider: string;
        headers: IHeaderValues[];
        payload: string;
        authorization: IAuthorization;
        promotedVariables: string;
    };
}

export interface GuardrailsAPISelectorProps {
    agent: AgentType | undefined;
    guardrailsApis: API[] | undefined;
    isReadonly?: boolean;
    apiLoading?: boolean;
    setGuardrailsApis: React.Dispatch<React.SetStateAction<API[] | undefined>>;
    allGuardrailsApiTools: IGuardrailsApiTool[];
    onRefetch: () => void;
    onGuardrailsApiChange?: (guardrailsApis: API[] | undefined) => void;
    label?: string;
    labelClassName?: string;
    isMultiple?: boolean;
    description?: string;
    isSelfLearning?: boolean;
}

export type SelectionMode = 'SELECTING' | 'Creating' | 'Editing';
