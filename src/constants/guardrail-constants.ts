import { OptionModel } from '@/components/atoms/select';
import {
    GuardrailActionType,
    GuardrailApiConfigurationType,
    GuardrailMaskingRuleType,
    GuardrailModelNameType,
    GuardrailModelProviderType,
    GuardrailSensitiveDataManagementModeType,
    SensitiveDataType,
} from '@/enums';
import { IOptionGroup } from '@/models';

export const GUARDRAIL_MODEL_TYPE_OPTIONS: OptionModel[] = [
    { name: 'Sensitive Data Detection', value: GuardrailApiConfigurationType.SENSITIVE_DATA_DETECTION },
    { name: 'Content Moderation', value: GuardrailApiConfigurationType.CONTENT_MODERATION },
    { name: 'Prompt Injection Detection', value: GuardrailApiConfigurationType.PROMPT_INJECTION_DETECTION },
    { name: 'Hallucination Protection', value: GuardrailApiConfigurationType.HALLUCINATION_PROTECTION },
];

export const GUARDRAIL_MODEL_PROVIDER_OPTIONS: IOptionGroup<GuardrailApiConfigurationType>[] = [
    {
        type: GuardrailApiConfigurationType.SENSITIVE_DATA_DETECTION,
        options: [{ name: 'Microsoft Presidio', value: GuardrailModelProviderType.MICROSOFT_PRESIDIO }],
    },
    {
        type: GuardrailApiConfigurationType.CONTENT_MODERATION,
        options: [
            {
                name: 'Vertex AI Content Moderation',
                value: GuardrailModelProviderType.VERTEX_AI_CONTENT_MODERATION,
                disabled: true,
            },
        ],
    },
    {
        type: GuardrailApiConfigurationType.PROMPT_INJECTION_DETECTION,
        options: [
            { name: 'Anthropic-Claude 3', value: GuardrailModelProviderType.ANTHROPIC_CLAUDE_3, disabled: true },
            {
                name: 'Google Deepmind / Gemini',
                value: GuardrailModelProviderType.GOOGLE_DEEPMIND_GEMINI,
                disabled: true,
            },
        ],
    },
    {
        type: GuardrailApiConfigurationType.HALLUCINATION_PROTECTION,
        options: [
            { name: 'Anthropic-Claude 3', value: GuardrailModelProviderType.ANTHROPIC_CLAUDE_3, disabled: true },
            {
                name: 'Google Deepmind / Gemini',
                value: GuardrailModelProviderType.GOOGLE_DEEPMIND_GEMINI,
                disabled: true,
            },
        ],
    },
];

export const GUARDRAIL_MODEL_NAME_OPTIONS: OptionModel[] = [
    { name: 'Content Moderation', value: GuardrailModelNameType.CONTENT_MODERATION },
    { name: 'Text Moderation', value: GuardrailModelNameType.TEXT_MODERATION },
];

export const GUARDRAIL_ANTHROPIC_MODEL_NAME_OPTIONS: OptionModel[] = [
    { name: 'Claude 3 Opus', value: GuardrailModelNameType.CLAUDE_3_OPUS },
    { name: 'Claude 3 Sonnet', value: GuardrailModelNameType.CLAUDE_3_SONNET },
    { name: 'Claude 3 Haiku', value: GuardrailModelNameType.CLAUDE_3_HAIKU },
];

export const GUARDRAIL_GOOGLE_MODEL_NAME_OPTIONS: OptionModel[] = [
    { name: 'Gemini Pro', value: GuardrailModelNameType.GEMINI_PRO },
    { name: 'Gemini Ultra', value: GuardrailModelNameType.GEMINI_ULTRA },
];

export const GUARDRAIL_MASKING_OPTION: OptionModel[] = [
    { name: 'No Masking', value: GuardrailMaskingRuleType.NO_MASKING },
    { name: 'Mask Fully', value: GuardrailMaskingRuleType.MASK_FULLY },
    // { name: 'Mask Partially', value: GuardrailMaskingRuleType.MASK_PARTIALLY },
    { name: 'Redact', value: GuardrailMaskingRuleType.REDACT },
    // { name: 'De-Identification', value: GuardrailMaskingRuleType.DE_IDENTIFICATION },
    { name: 'Replace with Entity Type', value: GuardrailMaskingRuleType.REPLACE_WITH_ENTITY_TYPE },
];

export const GUARDRAIL_SENSITIVE_DATA_OPTION: OptionModel[] = [
    { name: 'Name', value: SensitiveDataType.NAME, meta: 'General' },
    { name: 'Phone Number', value: SensitiveDataType.PHONE_NUMBER, meta: 'General' },
    { name: 'Email', value: SensitiveDataType.EMAIL, meta: 'General' },
    { name: 'Address', value: SensitiveDataType.ADDRESS, meta: 'General' },
    { name: 'Driver ID', value: SensitiveDataType.DRIVER_ID, meta: 'General' },
    { name: 'Passport Number', value: SensitiveDataType.PASSPORT_NUMBER, meta: 'General' },
    { name: 'SSN', value: SensitiveDataType.SSN, meta: 'General' },
    { name: 'TIN', value: SensitiveDataType.TIN, meta: 'General' },
    { name: 'Credit/Debit Card Number', value: SensitiveDataType.CREDIT_CARD, meta: 'Financial' },
    { name: 'Bank Account Number', value: SensitiveDataType.BANK_ACCOUNT_NUMBER, meta: 'Financial' },
    { name: 'IBAN_CODE', value: SensitiveDataType.IBAN_CODE, meta: 'Financial' },
    { name: 'IPV4 Address', value: SensitiveDataType.IPV4_ADDRESS, meta: 'IT' },
    { name: 'URLs', value: SensitiveDataType.URLS, meta: 'IT' },
];

export const GUARDRAIL_CATEGORY_OPTION: OptionModel[] = [
    { name: 'One', value: 'one' },
    { name: 'Two', value: 'two' },
];

export const GUARDRAIL_ACTION_OPTION: OptionModel[] = [
    { name: 'Block', value: GuardrailActionType.BLOCK },
    { name: 'Detect', value: GuardrailActionType.DETECT },
];

export const GUARDRAIL_DETECTION_MODE_OPTION: OptionModel[] = [
    { name: 'Use a Model', value: GuardrailSensitiveDataManagementModeType.USE_A_MODEL },
    { name: 'Use an API', value: GuardrailSensitiveDataManagementModeType.USE_AN_API, disabled: true },
    { name: 'Use a LLM', value: GuardrailSensitiveDataManagementModeType.USE_A_LLM, disabled: true },
];

export const GUARDRAIL_MODERATION_MODE_OPTION: OptionModel[] = [
    { name: 'Use a Model', value: GuardrailSensitiveDataManagementModeType.USE_A_MODEL },
    { name: 'Use an API', value: GuardrailSensitiveDataManagementModeType.USE_AN_API },
];
