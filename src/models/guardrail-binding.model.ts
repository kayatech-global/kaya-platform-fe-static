import { GuardrailBindingLevelType } from '@/enums';
import { IGuardrailSetup } from './guardrail.model';

export interface IGuardrailBinding {
    id: string;
    guardrailId: string;
    guardrail: IGuardrailSetup;
    level: GuardrailBindingLevelType;
    workspaceId: string;
    workflowId: string;
}

export interface IGuardrailBindingRequest {
    workflowId?: string;
    guardrailIds: string[];
}
