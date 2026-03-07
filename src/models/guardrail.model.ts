import {
    AuthenticationType,
    GuardrailActionType,
    GuardrailApiConfigurationType,
    GuardrailApiProviderType,
    GuardrailBindingLevelType,
    GuardrailMaskingRuleType,
    GuardrailModelProviderType,
    GuardrailSensitiveDataManagementModeType,
} from '@/enums';
import { IAuthenticationMeta, IBaseEntity, IBasicIntelligentSource } from './common.model';

export interface IGuardrailSetup extends IBaseEntity {
    name: string;
    description: string;
    configurations: IGuardrailSetupConfigurations;
}

export interface IGuardrailApiConfig extends IBaseEntity {
    name: string;
    guardrailType: GuardrailApiConfigurationType;
    description: string;
    provider: GuardrailApiProviderType;
    configurations: IGuardrailApiConfiguration;
}

export interface IGuardrailModelConfig extends IBaseEntity {
    name: string;
    description: string;
    guardrailType: GuardrailApiConfigurationType;
    provider: GuardrailModelProviderType;
    configurations: IGuardrailModelConfiguration;
}

export interface IGuardrailSetupConfigurations {
    enableSensitiveDataManagement: boolean;
    enableContentAndLanguageModeration: boolean;
    enablePromptInjectionDetection: boolean;
    enableHallucinationProtection: boolean;
    sensitiveDataManagement?: IGuardrailSetupDataManagement;
    contentAndLanguageModeration?: IGuardrailSetupContentLanguageModeration;
    promptInjectionDetection?: IGuardrailSetupProtection;
    hallucinationProtection?: IGuardrailSetupProtection;
}

export interface IGuardrailSetupDataManagement extends IGuardrailSetupProtectionResource {
    intelligenceSourceId?: IBasicIntelligentSource;
    prompt?: string;
    sensitiveDataRule: IGuardrailSetupSensitiveDataRule[];
    customSensitiveDataRule: IGuardrailSetupSensitiveDataRule[];

    // These fields are using for validation purpose
    validateSensitiveDataRule?: string;
    validateCustomSensitiveDataRule?: string;
}

export interface IGuardrailSetupContentLanguageModeration extends IGuardrailSetupProtectionResource {
    languageModeration: IGuardrailSetupLanguageModeration[];
}

export interface IGuardrailSetupProtection extends IGuardrailSetupProtectionResource {
    threshold?: number | null;
    action?: GuardrailActionType;
}

export interface IGuardrailSetupSensitiveDataRule {
    fieldName: string;
    classification?: string;
    regex?: string;
    promptMaskingRule: GuardrailMaskingRuleType;
    responseMaskingRule: GuardrailMaskingRuleType;
}

export interface IGuardrailSetupLanguageModeration {
    categoryName: string;
    scoreThreshold: number | null;
    promptAction: GuardrailActionType;
    responseAction: GuardrailActionType;
}

export interface IGuardrailSetupProtectionResource {
    mode?: GuardrailSensitiveDataManagementModeType;
    apiModelId?: string;
    guardrailModelId?: string;
}

export interface IGuardrailApiConfiguration {
    projectId?: string;
    location?: string;
    guardName?: string;
    resourceName?: string;
    organizationName?: string;
    region?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    authenticationType?: AuthenticationType;
    meta?: IAuthenticationMeta;
}

export interface IGuardrailModelConfiguration {
    analyzerServiceHost?: string;
    anonymizerServiceHost?: string;
    apiKey?: string;
    projectId?: string;
    location?: string;
    modelName?: string;
    baseUrl?: string;
    authenticationType?: AuthenticationType;
    meta?: IAuthenticationMeta;
}

export interface IGuardrailGroup {
    id: string;
    name: string;
    description: string;
    level: GuardrailBindingLevelType;
    badge: string;
}
