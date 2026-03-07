import { Input, OptionModel, SecretInput, Select, VaultSelector } from '@/components/atoms';
import {
    FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS,
    FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER,
    FIELD_TYPE_HOST,
    FIELD_TYPE_NUMBER,
    FIELD_TYPE_PORT,
    FIELD_TYPE_REGION,
    FIELD_TYPE_SECRETS,
    FIELD_TYPES_TEXT,
    FIELD_TYPES_URL,
    REGION_LIST,
} from '@/constants';
import { AuthenticationType, WorkflowPullReferenceType } from '@/enums';
import { cn, validateSpaces, validateUrlRegEx } from '@/lib/utils';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import React, { useMemo } from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';

interface IFieldMapper {
    configIndex: number;
    fieldIndex: number;
    value: string;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
    defaultPlaceholder?: string;
    defaultPropertyName?: string;
    restrictVaultKey?: boolean;
}

export const FieldMapper = ({
    value,
    watch,
    register,
    fieldIndex,
    configIndex,
    errors,
    secrets,
    refetchSecrets,
    loadingSecrets,
    defaultPlaceholder,
    defaultPropertyName,
    restrictVaultKey,
}: IFieldMapper) => {
    const fieldName = watch(`configs.${configIndex}.fields.${fieldIndex}.name`);
    const fieldType = watch(`configs.${configIndex}.type`);
    const fieldReference = watch(`configs.${configIndex}.reference`);

    // This is to handle the case when the field is a knowledge graph related
    const paths = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.paths`);
    const isKnowledgeGraph = paths?.some((path: string) => path.includes('knowledgeGraphs'));

    const fieldError = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValue?.message;
    const propertyName = defaultPropertyName ?? 'final value';

    const isValidProperty = useMemo(() => {
        return !(
            (fieldType === 'languageModal' && fieldReference === WorkflowPullReferenceType.SLM) ||
            (fieldType === 'executableFunctions' && fieldName === 'lambdaExecutionRoleArn')
        );
    }, [fieldType, fieldReference, fieldName]);

    return (
        <>
            {FIELD_TYPES_URL.includes(fieldName) && (
                <Input
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: {
                            value: !(
                                fieldType === 'intelligenceSource' ||
                                (fieldType === 'languageModal' && fieldReference === WorkflowPullReferenceType.LLM) ||
                                fieldType === 'reRankingModel' ||
                                fieldType === 'embeddingModel' ||
                                fieldType === 'intelligentSource'
                            ),
                            message: `Please enter ${propertyName}`,
                        },
                        validate: value =>
                            isKnowledgeGraph
                                ? validateSpaces(value, propertyName)
                                : validateUrlRegEx(value, propertyName),
                    })}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    value={value}
                    placeholder={defaultPlaceholder}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                    autoComplete="off"
                    className={cn({ 'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`) })}
                />
            )}
            {FIELD_TYPE_SECRETS.includes(fieldName) && (
                <>
                    {(fieldType === 'database' && fieldName === 'accessKey') ||
                    (fieldType === 'languageModal' && fieldName === 'accessKey') ? (
                        <Input
                            {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                required: {
                                    value: true,
                                    message: `Please enter ${propertyName}`,
                                },
                                validate: value => validateSpaces(value, propertyName),
                            })}
                            disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                            value={value}
                            placeholder={defaultPlaceholder}
                            isDestructive={!!fieldError}
                            supportiveText={fieldError}
                            autoComplete="off"
                            className={cn({
                                'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                            })}
                        />
                    ) : (
                        <>
                            {restrictVaultKey ? (
                                <SecretInput
                                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                        required: {
                                            value: isValidProperty,
                                            message: `Please enter ${propertyName}`,
                                        },
                                    })}
                                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                                    value={value}
                                    placeholder={defaultPlaceholder}
                                    isDestructive={!!fieldError}
                                    supportiveText={fieldError}
                                    autoComplete="new-password"
                                    className={cn({
                                        'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                                    })}
                                />
                            ) : (
                                <VaultSelector
                                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                        required: {
                                            value: isValidProperty,
                                            message: `Please select ${propertyName}`,
                                        },
                                    })}
                                    placeholder={secrets.length > 0 ? 'Select final value' : 'No vault key found'}
                                    disabled={
                                        secrets.length === 0 ||
                                        watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)
                                    }
                                    options={secrets}
                                    currentValue={value}
                                    isDestructive={!!fieldError}
                                    supportiveText={fieldError}
                                    autoComplete="off"
                                    disableCreate={false}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetchSecrets()}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {FIELD_TYPES_TEXT.includes(fieldName) && (
                <>
                    {fieldType === 'database' && fieldName === 'userName' ? (
                        <>
                            {restrictVaultKey ? (
                                <SecretInput
                                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                        required: { value: true, message: `Please enter ${propertyName}` },
                                    })}
                                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                                    value={value}
                                    placeholder={defaultPlaceholder}
                                    isDestructive={!!fieldError}
                                    supportiveText={fieldError}
                                    autoComplete="new-password"
                                    className={cn({
                                        'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                                    })}
                                />
                            ) : (
                                <VaultSelector
                                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                        required: { value: true, message: `Please select ${propertyName}` },
                                    })}
                                    placeholder={secrets.length > 0 ? 'Select final value' : 'No vault key found'}
                                    disabled={
                                        secrets.length === 0 ||
                                        watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)
                                    }
                                    options={secrets}
                                    currentValue={value}
                                    isDestructive={!!fieldError}
                                    supportiveText={fieldError}
                                    autoComplete="off"
                                    disableCreate={false}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetchSecrets()}
                                />
                            )}
                        </>
                    ) : (
                        <Input
                            {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                required: {
                                    value: fieldType !== 'executableFunctions',
                                    message: `Please enter ${propertyName}`,
                                },
                                validate: value => validateSpaces(value, propertyName),
                            })}
                            disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                            value={value}
                            placeholder={defaultPlaceholder}
                            isDestructive={!!fieldError}
                            supportiveText={fieldError}
                            autoComplete="off"
                            className={cn({
                                'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                            })}
                        />
                    )}
                </>
            )}
            {FIELD_TYPE_REGION.includes(fieldName) && (
                <Select
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: {
                            value: true,
                            message: `Please select ${propertyName}`,
                        },
                    })}
                    placeholder="Select Region"
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    options={REGION_LIST?.map(region => ({
                        name: region,
                        value: region,
                    }))}
                    autoComplete="off"
                    currentValue={value}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                />
            )}
            {FIELD_TYPE_HOST.includes(fieldName) && (
                <Input
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: { value: true, message: `Please enter ${propertyName}` },
                        pattern: {
                            value: /^(?:(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(?:\d{1,3}(?:\.\d{1,3}){3})|localhost)$/,
                            message: 'Invalid host or IP address',
                        },
                    })}
                    className="w-full"
                    placeholder="Enter a Host"
                    value={value}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    autoComplete="off"
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                />
            )}
            {FIELD_TYPE_PORT.includes(fieldName) && (
                <Input
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: { value: true, message: `Please enter ${propertyName}` },
                        validate: {
                            isNumber: v => !Number.isNaN(Number(v)) || 'Invalid port number',
                            min: v => Number(v) >= 1 || 'Port must be at least 1',
                            max: v => Number(v) <= 65535 || 'Port cannot exceed 65535',
                        },
                    })}
                    className="w-full"
                    value={value}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    placeholder={defaultPlaceholder}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                    autoComplete="off"
                    type="number"
                />
            )}
            {FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker' && (
                <Select
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: { value: true, message: `Please select ${propertyName}` },
                    })}
                    currentValue={value}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                    autoComplete="off"
                    options={[
                        { name: 'No Authentication', value: AuthenticationType.NoAuthentication, disabled: true },
                        { name: 'Basic Auth', value: AuthenticationType.BasicAuth, disabled: true },
                        { name: 'SASL/SCRAM', value: AuthenticationType.SASLORSCRAM, disabled: true },
                        { name: 'Bearer Token', value: AuthenticationType.BearerToken, disabled: true },
                        { name: 'TLS', value: AuthenticationType.TLS },
                    ]}
                />
            )}
            {FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails' && (
                <Select
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: { value: true, message: `Please select ${propertyName}` },
                    })}
                    options={[{ value: AuthenticationType.BearerToken, name: 'Bearer Token' }]}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    currentValue={value}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                    autoComplete="off"
                />
            )}
            {FIELD_TYPE_NUMBER.includes(fieldName) && (
                <Input
                    {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                        required: { value: true, message: `Please enter ${propertyName}` },
                        minLength: {
                            value: 3,
                            message: `${propertyName?.charAt(0)?.toUpperCase()}${propertyName?.slice(1)} must be at least 3 characters`,
                        },
                    })}
                    className="w-full"
                    value={value}
                    disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                    placeholder={defaultPlaceholder}
                    isDestructive={!!fieldError}
                    supportiveText={fieldError}
                    autoComplete="off"
                    type="number"
                />
            )}
            {fieldName?.startsWith('header--') && (
                <>
                    {restrictVaultKey ? (
                        <SecretInput
                            {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                required: {
                                    value: isValidProperty,
                                    message: `Please enter ${propertyName}`,
                                },
                            })}
                            disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                            value={value}
                            placeholder={defaultPlaceholder}
                            isDestructive={!!fieldError}
                            supportiveText={fieldError}
                            autoComplete="new-password"
                            className={cn({
                                'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                            })}
                        />
                    ) : (
                        <VaultSelector
                            {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                                required: {
                                    value: isValidProperty,
                                    message: `Please select ${propertyName}`,
                                },
                            })}
                            placeholder={secrets.length > 0 ? 'Select final value' : 'No vault key found'}
                            disabled={
                                secrets.length === 0 || watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)
                            }
                            options={secrets}
                            currentValue={value}
                            isDestructive={!!fieldError}
                            supportiveText={fieldError}
                            autoComplete="off"
                            disableCreate={false}
                            loadingSecrets={loadingSecrets}
                            onRefetch={() => refetchSecrets()}
                        />
                    )}
                </>
            )}
        </>
    );
};
