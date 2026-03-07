'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Checkbox,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Input,
    OptionModel,
    Select,
    Textarea,
    VaultSelector,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TruncateCell,
} from '@/components/atoms';
import { Play } from 'lucide-react';
import { HeaderInput } from '@/components/atoms/header-input';
import { IHeaderValues, PreviewApiItem, TBulkConfigForm } from '@/models';
import {
    Control,
    FieldErrors,
    UseFormRegister,
    UseFormWatch,
    UseFormTrigger,
    UseFormSetValue,
    useFieldArray,
    useWatch,
} from 'react-hook-form';
import {
    cn,
    validateHttpMethod,
    hasPathParam,
    validateApiUrl,
    validateApiDescription,
    validateHeaderName,
    validateVaultKey,
    validateHeaderIdentifier,
    validateSpaces,
    validateUrl,
} from '@/lib/utils';
import { HttpMethodBadge } from '@/components/molecules';
import InputParametersPreview from './input-parameters-preview';
import { HeaderType } from '@/hooks/use-api-configuration';
import { ISwaggerAuthorizationType, ISwaggerParameter } from '@/hooks/use-swagger-parser';
import { AuthenticationGrantType, AuthorizationType } from '@/enums';
import TestApiModal from '../test-api-modal/test-api-modal';
import { API_AUTHENTICATION_GRANT_TYPES } from '@/constants';

export type ApiPreviewForm = {
    apiUrl: string;
    apiMethod: string;
    description: string;
    apiHeaders: ISwaggerParameter[];
    payloads: ISwaggerParameter[]; // Input Parameters
    promotedVariables: IHeaderValues[]; // Response fields to promote as variables
    authorization: ISwaggerAuthorizationType;
};

type ApiPreviewItemProps = {
    index: number;
    selected: boolean;
    disabled?: boolean;
    apiItem: PreviewApiItem;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    errors: FieldErrors<TBulkConfigForm>;
    control: Control<TBulkConfigForm, unknown>;
    baseUrl: string;
    register: UseFormRegister<TBulkConfigForm>;
    watch: UseFormWatch<TBulkConfigForm>;
    trigger: UseFormTrigger<TBulkConfigForm>;
    setValue: UseFormSetValue<TBulkConfigForm>;
    onSelectChange?: (checked: boolean) => void;
    onTestApi?: (values: ApiPreviewForm) => void;
    onChange?: (values: ApiPreviewForm) => void;
    onTestedChange?: (apiName: string, tested: boolean) => void;
    refetch: () => void;
};

export function ApiPreviewItem({
    selected,
    disabled,
    secrets,
    loadingSecrets,
    index,
    errors,
    control,
    baseUrl,
    register,
    watch,
    trigger,
    setValue,
    onSelectChange,
    onTestedChange,
    refetch,
}: Readonly<ApiPreviewItemProps>) {
    const [isValid, setValid] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [open, setOpen] = useState(false);

    const bulkAuthType = watch(`previewApis.${index}.authorization.${index}.authType`) as AuthorizationType | undefined;

    // Watch values for validation
    const url = watch(`previewApis.${index}.apiUrl`);
    const authType = watch(`previewApis.${index}.authorization.0.authType`);
    const bodyParamsRaw = watch(`previewApis.${index}.bodyParams`);

    // Watch for field changes and trigger validation immediately when accordion is open
    const watchedApiUrl = watch(`previewApis.${index}.apiUrl`);

    const watchedRow = useWatch({
        control,
        name: `previewApis.${index}`,
    });

    const gridCol = useMemo(() => {
        return bulkAuthType === AuthorizationType.BearerToken
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-1';
    }, [bulkAuthType]);

    const bodyParams = useMemo(() => bodyParamsRaw || [], [bodyParamsRaw]);

    const isValidOption = useMemo(() => {
        const validAuthTypes = [
            AuthorizationType.NoAuthorization,
            AuthorizationType.BasicAuth,
            AuthorizationType.BearerToken,
            AuthorizationType.APIKey,
            AuthorizationType.SSO,
            AuthorizationType.SSO,
            AuthorizationType.OAUTH2,
        ];

        if (hasPathParam(url)) {
            return false;
        }
        if (!validAuthTypes.includes(authType)) {
            return false;
        }

        const hasNestedParam = bodyParams.some(
            (param: { name?: string }) => typeof param?.name === 'string' && /[.\[]/.test(param.name)
        );

        if (hasNestedParam) return false;

        const isTypeArray = bodyParams.some((param: { dataType: string }) => param.dataType === 'array');

        if (isTypeArray) {
            return false;
        }

        return true;
    }, [url, authType, bodyParams]);

    // Get disabled reason for tooltip
    const getDisabledReason = useMemo(() => {
        if (isValidOption) return null;

        const validAuthTypes = [
            AuthorizationType.NoAuthorization,
            AuthorizationType.BasicAuth,
            AuthorizationType.BearerToken,
            AuthorizationType.APIKey,
            AuthorizationType.SSO,
            AuthorizationType.OAUTH2,
        ];

        // Check in priority order
        if (hasPathParam(url)) {
            return 'Path parameters not supported';
        }

        if (!validAuthTypes.includes(authType)) {
            return 'Authentication type not supported';
        }

        const hasNestedParam = bodyParams.some(
            (param: { name?: string }) => typeof param?.name === 'string' && /[.\[]/.test(param.name)
        );
        if (hasNestedParam) {
            return 'Complex data types not supported';
        }

        return null;
    }, [isValidOption, url, authType, bodyParams]);

    // Sync apiPath when apiUrl changes
    useEffect(() => {
        if (watchedApiUrl && baseUrl) {
            try {
                // Extract path from full URL by removing baseUrl
                let path = watchedApiUrl;

                // If the URL starts with baseUrl, extract the path
                if (path.startsWith(baseUrl)) {
                    path = path.substring(baseUrl.length);
                } else {
                    // Try to extract path from full URL (handle https://domain.com/path)
                    const urlObj = new URL(path);
                    path = urlObj.pathname + urlObj.search;
                }

                // Update apiPath field
                setValue(`previewApis.${index}.apiPath`, path);
            } catch (error) {
                // If URL parsing fails, just use the URL as-is
                console.error('Error parsing API URL:', error);
            }
        }
    }, [watchedApiUrl, baseUrl, setValue, index]);

    useEffect(() => {
        (async () => {
            if (watchedRow?.selected) {
                const validate = await trigger(`previewApis.${index}`, { shouldFocus: false });
                setValid(validate);
            } else {
                setValid(true);
            }
        })();
    }, [watchedRow, index, trigger]);

    useEffect(() => {
        if (!isValidOption && selected) {
            onSelectChange?.(false);
        }
    }, [isValidOption, selected, onSelectChange]);

    const {
        fields: apiHeaders,
        append: appendApiHeader,
        remove: removeApiHeader,
    } = useFieldArray({
        control,
        name: `previewApis.${index}.apiHeaders`, // path to this API’s headers
    });

    const {
        fields: responseField,
        append: appendResponseField,
        remove: removeResponseField,
    } = useFieldArray({
        control,
        name: `previewApis.${index}.promotedVariables`, // path to this API’s promotedVariables
    });

    const handleTest = () => {
        // Open modal; actual execution will be from modal's Execute button
        setShowTestModal(true);
    };

    const customNameValidator = (value: string, headerIndex?: number) => {
        const result = validateHeaderIdentifier(value, 'name');

        if (result === true) {
            const duplicate = watchedRow?.apiHeaders?.some((header, key) => {
                return key !== headerIndex && header.name.trim() === value.trim();
            });

            return duplicate ? 'Name must be unique' : true;
        }

        return result;
    };

    return (
        <Collapsible
            open={open}
            onOpenChange={next => {
                if (isValidOption) {
                    setOpen(next);
                }
            }}
            className={cn(
                'rounded-lg border p-3 sm:p-4 transition-colors',
                (() => {
                    if (!isValid) return 'border-red-500';
                    if (selected) return 'border-primary';
                    return 'border-gray-200 dark:border-gray-700';
                })(),
                !isValidOption && 'opacity-60 cursor-not-allowed'
            )}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild disabled={!isValidOption}>
                            <div
                                className={cn(
                                    'grid grid-cols-[1fr_auto] items-start gap-3 select-none group w-full',
                                    isValidOption ? 'cursor-pointer' : 'cursor-not-allowed'
                                )}
                            >
                                <div className="grid grid-cols-[auto_1fr] items-start gap-3">
                                    <Checkbox
                                        checked={watch(`previewApis.${index}.selected`)}
                                        onCheckedChange={val =>
                                            setValue(`previewApis.${index}.selected`, !!val, { shouldValidate: true })
                                        }
                                        disabled={disabled || !isValidOption}
                                        className="mt-3.5"
                                        aria-label={`Select ${name}`}
                                    />
                                    <div className="grid grid-flow-col auto-cols-max items-center gap-2 min-w-0 mt-0 pt-0">
                                        <HttpMethodBadge
                                            method={watch(`previewApis.${index}.apiMethod`)}
                                            className="whitespace-nowrap flex-shrink-0"
                                        />
                                        <div className="grid gap-1 min-w-0">
                                            <TruncateCell
                                                className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-100 truncate"
                                                value={watch(`previewApis.${index}.apiName`)}
                                                length={25}
                                            />
                                            <TruncateCell
                                                className="text-[13px] text-gray-400 dark:text-gray-500 break-all leading-snug"
                                                value={watch(`previewApis.${index}.apiPath`)}
                                                length={40}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-flow-col auto-cols-max items-center gap-2">
                                    <Button
                                        size="sm"
                                        disabled={!isValidOption}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleTest();
                                        }}
                                    >
                                        <Play className="h-4 w-4 mr-0" />
                                        Test API
                                    </Button>
                                    <Button
                                        size="icon"
                                        disabled={!isValidOption}
                                        variant="ghost"
                                        aria-label="Toggle details"
                                        className="border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-transform group-data-[state=open]:rotate-90"
                                    >
                                        <i className="ri-arrow-right-s-line text-lg" />
                                    </Button>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                    </TooltipTrigger>
                    {!isValidOption && getDisabledReason && (
                        <TooltipContent side="top" className="bg-red-600 text-white border-red-700">
                            <p className="text-sm">{getDisabledReason}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            <CollapsibleContent
                {...(selected
                    ? {
                          forceMount: true,
                          className: 'mt-4 data-[state=closed]:hidden',
                      }
                    : {
                          className: 'mt-4',
                      })}
            >
                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            {...register(`previewApis.${index}.apiUrl`, {
                                validate: value =>
                                    isValidOption && watchedRow?.selected ? validateApiUrl(value) : undefined,
                            })}
                            placeholder="/pet"
                            label="API URL"
                            value={watch(`previewApis.${index}.apiUrl`)}
                            isDestructive={!!errors?.previewApis?.[index]?.apiUrl?.message}
                            supportiveText={errors?.previewApis?.[index]?.apiUrl?.message as string}
                        />
                        <Select
                            {...register(`previewApis.${index}.apiMethod`, {
                                validate: v =>
                                    isValidOption && watchedRow?.selected
                                        ? validateHttpMethod(v, 'API Method')
                                        : undefined,
                            })}
                            label="API Method"
                            placeholder="Select method"
                            options={[
                                { value: 'GET', name: 'GET' },
                                { value: 'POST', name: 'POST' },
                                { value: 'PUT', name: 'PUT' },
                                { value: 'PATCH', name: 'PATCH' },
                                { value: 'DELETE', name: 'DELETE' },
                            ]}
                            currentValue={watch(`previewApis.${index}.apiMethod`)}
                            isDestructive={!!errors?.previewApis?.[index]?.apiMethod?.message}
                            supportiveText={errors?.previewApis?.[index]?.apiMethod?.message as string}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">Headers</p>
                        <div className="mt-2">
                            <HeaderInput
                                label={undefined}
                                register={register}
                                fields={apiHeaders}
                                namePrefix={`previewApis.${index}.apiHeaders`}
                                append={() => appendApiHeader({ name: '', dataType: '', value: '' })}
                                remove={removeApiHeader}
                                type={HeaderType.ApiHeader}
                                isRequired={isValidOption && watchedRow?.selected}
                                control={control}
                                hasType={false}
                                errors={errors}
                                list={watch(`previewApis.${index}.apiHeaders`) || []}
                                isIncludeSecrets={true}
                                loadingSecrets={loadingSecrets}
                                secrets={secrets}
                                watch={watch}
                                customNameValidator={customNameValidator}
                                onSecretRefetch={() => refetch()}
                            />
                        </div>
                    </div>
                    <div>
                        <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                            Authentication
                        </span>
                        <div className={`grid gap-4 mt-2 ${gridCol}`}>
                            <Select
                                {...register(`previewApis.${index}.authorization.0.authType`, {
                                    required: {
                                        value: isValidOption && watchedRow?.selected,
                                        message: 'Please select authentication',
                                    },
                                })}
                                placeholder="Select authentication"
                                options={[
                                    { value: AuthorizationType.NoAuthorization, name: 'No Authentication' },
                                    { value: AuthorizationType.BasicAuth, name: 'Basic Auth' },
                                    { value: AuthorizationType.BearerToken, name: 'Bearer Token' },
                                    { value: AuthorizationType.APIKey, name: 'API Key' },
                                    { value: AuthorizationType.SSO, name: 'Single Sign-On' },
                                    { value: AuthorizationType.OAUTH2, name: 'OAuth' },
                                ]}
                                value={
                                    [
                                        AuthorizationType.NoAuthorization,
                                        AuthorizationType.BasicAuth,
                                        AuthorizationType.BearerToken,
                                        AuthorizationType.APIKey,
                                        AuthorizationType.SSO,
                                        AuthorizationType.OAUTH2,
                                    ].includes(watch(`previewApis.${index}.authorization.0.authType`))
                                        ? watch(`previewApis.${index}.authorization.0.authType`)
                                        : AuthorizationType.NoAuthorization
                                }
                                isDestructive={!!errors?.previewApis?.[index]?.authorization?.[0]?.authType?.message}
                                supportiveText={
                                    errors?.previewApis?.[index]?.authorization?.[0]?.authType?.message as string
                                }
                            />
                            {(watch(`previewApis.${index}.authorization.0.authType`) === AuthorizationType.BasicAuth ||
                                watch(`previewApis.${index}.authorization.0.authType`) ===
                                    AuthorizationType.APIKey) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {watch(`previewApis.${index}.authorization.0.authType`) ===
                                        AuthorizationType.BasicAuth && (
                                        <>
                                            <Input
                                                {...register(`previewApis.${index}.authorization.0.meta.username`, {
                                                    required: {
                                                        value: isValidOption && watchedRow?.selected,
                                                        message: 'Please enter username',
                                                    },
                                                })}
                                                placeholder="Enter your username"
                                                autoComplete="off"
                                                isDestructive={
                                                    !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.username
                                                        ?.message
                                                }
                                                supportiveText={
                                                    errors?.previewApis?.[index]?.authorization?.[0]?.meta?.username
                                                        ?.message as string
                                                }
                                                value={watch(`previewApis.${index}.authorization.0.meta.username`)}
                                            />
                                            <VaultSelector
                                                {...register(`previewApis.${index}.authorization.0.meta.password`, {
                                                    required: {
                                                        value: isValidOption && watchedRow?.selected,
                                                        message: 'Please select vault key',
                                                    },
                                                    validate: value =>
                                                        isValidOption && watchedRow?.selected
                                                            ? validateVaultKey(value, 'Password')
                                                            : undefined,
                                                })}
                                                placeholder={
                                                    secrets.length > 0 ? 'Select vault key' : 'No vault key found'
                                                }
                                                disabled={secrets.length === 0}
                                                options={secrets}
                                                value={watch(`previewApis.${index}.authorization.0.meta.password`)}
                                                isDestructive={
                                                    !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.password
                                                        ?.message
                                                }
                                                supportiveText={
                                                    errors?.previewApis?.[index]?.authorization?.[0]?.meta?.password
                                                        ?.message as string
                                                }
                                                loadingSecrets={loadingSecrets}
                                                onRefetch={() => refetch()}
                                            />
                                        </>
                                    )}
                                    {watch(`previewApis.${index}.authorization.0.authType`) ===
                                        AuthorizationType.APIKey && (
                                        <>
                                            <Input
                                                {...register(`previewApis.${index}.authorization.0.meta.headerName`, {
                                                    required: {
                                                        value: isValidOption && watchedRow?.selected,
                                                        message: 'Please enter header name',
                                                    },
                                                    validate: value =>
                                                        isValidOption && watchedRow?.selected
                                                            ? validateHeaderName(value)
                                                            : undefined,
                                                })}
                                                placeholder="Enter your header name"
                                                autoComplete="off"
                                                isDestructive={
                                                    !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.headerName
                                                        ?.message
                                                }
                                                supportiveText={
                                                    errors?.previewApis?.[index]?.authorization?.[0]?.meta?.headerName
                                                        ?.message as string
                                                }
                                                value={watch(`previewApis.${index}.authorization.0.meta.headerName`)}
                                            />
                                            <VaultSelector
                                                {...register(`previewApis.${index}.authorization.0.meta.headerValue`, {
                                                    required: {
                                                        value: isValidOption && watchedRow?.selected,
                                                        message: 'Please select vault key',
                                                    },
                                                    validate: value =>
                                                        isValidOption && watchedRow?.selected
                                                            ? validateVaultKey(value, 'Header value')
                                                            : undefined,
                                                })}
                                                placeholder={
                                                    secrets.length > 0 ? 'Select vault key' : 'No vault key found'
                                                }
                                                disabled={secrets.length === 0}
                                                options={secrets}
                                                value={watch(`previewApis.${index}.authorization.0.meta.headerValue`)}
                                                isDestructive={
                                                    !!errors?.previewApis?.[index]?.authorization?.[0]?.meta
                                                        ?.headerValue?.message
                                                }
                                                supportiveText={
                                                    errors?.previewApis?.[index]?.authorization?.[0]?.meta?.headerValue
                                                        ?.message as string
                                                }
                                                loadingSecrets={loadingSecrets}
                                                onRefetch={() => refetch()}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                            {watch(`previewApis.${index}.authorization.0.authType`) ===
                                AuthorizationType.BearerToken && (
                                <VaultSelector
                                    {...register(`previewApis.${index}.authorization.0.meta.token`, {
                                        required: {
                                            value: isValidOption && watchedRow?.selected,
                                            message: 'Please select vault key',
                                        },
                                        validate: value =>
                                            isValidOption && watchedRow?.selected
                                                ? validateVaultKey(value, 'Token')
                                                : undefined,
                                    })}
                                    placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                    disabled={secrets.length === 0}
                                    options={secrets}
                                    value={watch(`previewApis.${index}.authorization.0.meta.token`)}
                                    isDestructive={
                                        !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.token?.message
                                    }
                                    supportiveText={
                                        errors?.previewApis?.[index]?.authorization?.[0]?.meta?.token?.message as string
                                    }
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            )}
                            {watch(`previewApis.${index}.authorization.0.authType`) === AuthorizationType.OAUTH2 && (
                                <div className="col-span-1 sm:col-span-1">
                                    <div className="flex items-start gap-x-4">
                                        <Select
                                            {...register(`previewApis.${index}.authorization.0.meta.grantType`, {
                                                required: { value: true, message: 'Please select grant type' },
                                            })}
                                            placeholder="Select your Grant Type"
                                            options={API_AUTHENTICATION_GRANT_TYPES}
                                            value={
                                                watch(`previewApis.${index}.authorization.0.meta.grantType`) ||
                                                AuthenticationGrantType.Empty
                                            }
                                            currentValue={
                                                watch(`previewApis.${index}.authorization.0.meta.grantType`) ||
                                                AuthenticationGrantType.Empty
                                            }
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.grantType
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.grantType
                                                    ?.message as string
                                            }
                                        />
                                        <Input
                                            {...register(`previewApis.${index}.authorization.0.meta.headerPrefix`, {
                                                validate: value =>
                                                    value ? validateSpaces(value, 'Header Prefix') : true,
                                            })}
                                            placeholder="Header Prefix (e.g., Bearer)"
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.headerPrefix
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.headerPrefix
                                                    ?.message as string
                                            }
                                        />
                                    </div>
                                    <div className="flex items-start gap-x-4 mt-4">
                                        <Input
                                            {...register(`previewApis.${index}.authorization.0.meta.clientId`, {
                                                required: {
                                                    value: true,
                                                    message: 'Please enter client ID',
                                                },
                                                validate: value => validateSpaces(value, 'client id'),
                                            })}
                                            placeholder="Client ID"
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.clientId
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.clientId
                                                    ?.message as string
                                            }
                                        />
                                        <VaultSelector
                                            {...register(`previewApis.${index}.authorization.0.meta.clientSecret`, {
                                                required: { value: true, message: 'Please select vault key' },
                                            })}
                                            placeholder={
                                                secrets.length > 0
                                                    ? 'Select client secret (vault)'
                                                    : 'No vault key found'
                                            }
                                            options={secrets}
                                            currentValue={
                                                watch(`previewApis.${index}.authorization.0.meta.clientSecret`) || ''
                                            }
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.clientSecret
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.clientSecret
                                                    ?.message as string
                                            }
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                        />
                                    </div>
                                    <div className="flex items-start gap-x-4 mt-4">
                                        <Input
                                            {...register(`previewApis.${index}.authorization.0.meta.audience`, {
                                                validate: value => (value ? validateSpaces(value, 'audience') : true),
                                            })}
                                            placeholder="Audience"
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.audience
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.audience
                                                    ?.message as string
                                            }
                                        />
                                        <Input
                                            {...register(`previewApis.${index}.authorization.0.meta.scope`, {
                                                validate: value => (value ? validateSpaces(value, 'scope') : true),
                                            })}
                                            placeholder="Scope (space-separated)"
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.scope?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.scope
                                                    ?.message as string
                                            }
                                        />
                                    </div>
                                    <div className="flex items-start gap-x-4 mt-4">
                                        <Input
                                            {...register(`previewApis.${index}.authorization.0.meta.tokenUrl`, {
                                                required: {
                                                    value: true,
                                                    message: 'Please enter token URL',
                                                },
                                                validate: value => validateUrl(value, 'Token URL'),
                                            })}
                                            placeholder="Token URL"
                                            isDestructive={
                                                !!errors?.previewApis?.[index]?.authorization?.[0]?.meta?.tokenUrl
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.previewApis?.[index]?.authorization?.[0]?.meta?.tokenUrl
                                                    ?.message as string
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <Textarea
                            {...register(`previewApis.${index}.description`, {
                                validate: value =>
                                    isValidOption && watchedRow?.selected ? validateApiDescription(value) : undefined,
                            })}
                            label="Description"
                            placeholder="Add a new pet to the store"
                            value={watch(`previewApis.${index}.description`)}
                            isDestructive={!!errors?.previewApis?.[index]?.description?.message}
                            supportiveText={errors?.previewApis?.[index]?.description?.message as string}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            Response fields to promote as variables
                        </p>
                        <div className="mt-2">
                            <HeaderInput
                                label={undefined}
                                register={register}
                                fields={responseField}
                                namePrefix={`previewApis.${index}.promotedVariables`}
                                append={() => appendResponseField({ name: '', dataType: '', value: '' })}
                                remove={index => removeResponseField(index)}
                                control={control}
                                type={HeaderType.PromotedVariables}
                                isRequired={isValidOption && watchedRow?.selected}
                                hasType
                                isResponseField
                                errors={errors}
                                valuePlaceholder="Description"
                                list={watch(`previewApis.${index}.promotedVariables`) || []}
                            />
                        </div>
                    </div>
                    <InputParametersPreview
                        register={register}
                        watch={watch}
                        errors={errors}
                        trigger={trigger}
                        control={control}
                        index={index}
                        isValidOption={isValidOption}
                        selected={watchedRow.selected}
                        payloads={
                            ['GET', 'DELETE'].includes(watch(`previewApis.${index}.apiMethod`))
                                ? watch(`previewApis.${index}.queryParams`)
                                : watch(`previewApis.${index}.bodyParams`)
                        }
                        shouldTriggerValidation={open}
                        title={
                            ['POST', 'PUT', 'PATCH'].includes(
                                (watch(`previewApis.${index}.apiMethod`) || '').toUpperCase()
                            )
                                ? 'Request Payload Parameters'
                                : 'Query Parameters'
                        }
                    />
                </div>
            </CollapsibleContent>
            <TestApiModal
                open={showTestModal}
                onOpenChange={setShowTestModal}
                onTestSuccess={() => {
                    const apiName = watch(`previewApis.${index}.apiName`);
                    onTestedChange?.(apiName, true);
                }}
                apiConfig={{
                    name: watch(`previewApis.${index}.apiName`),
                    url: watch(`previewApis.${index}.apiUrl`),
                    method: watch(`previewApis.${index}.apiMethod`),
                    pathParams: watch(`previewApis.${index}.pathParams`),
                    queryParams: ['GET', 'DELETE'].includes(watch(`previewApis.${index}.apiMethod`))
                        ? watch(`previewApis.${index}.queryParams`)
                        : [],
                    bodyParams: ['PUT', 'POST', 'PATCH'].includes(watch(`previewApis.${index}.apiMethod`))
                        ? watch(`previewApis.${index}.bodyParams`)
                        : [],
                    headers: watch(`previewApis.${index}.apiHeaders`),
                    auth: watch(`previewApis.${index}.authorization.${0}`),
                }}
                loadingSecrets={loadingSecrets}
                secrets={secrets}
                onVaultRefetch={refetch}
            />
        </Collapsible>
    );
}

export default ApiPreviewItem;
