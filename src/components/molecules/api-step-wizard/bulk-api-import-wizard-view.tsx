'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import FileUploader from '@/components/atoms/file-uploader';
import { Input, Select, VaultSelector, LoadingPlaceholder } from '@/components/atoms';
import { AuthenticationGrantType, AuthorizationType, BulkApiStepType } from '@/enums';
import { cn, validateUrl, validateSpaces } from '@/lib/utils';
import { ImportProgress, StepWizardView } from '@/components/molecules';
import { validateField } from '@/utils/validation';
import type { OptionModel } from '@/components';
import type { BulkApiImportStats, TBulkConfigForm } from '@/models';
import { FileWarning } from 'lucide-react';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { capitalize } from 'lodash';
import { API_AUTHENTICATION_GRANT_TYPES } from '@/constants';

const ApiPreviewStep = dynamic(() => import('./components/api-preview-step'), {
    ssr: false,
    loading: () => <LoadingPlaceholder text="Please wait! loading the preview data for you..." className="h-[52vh]" />,
});

const SUPPORTED_AUTH_TYPES = [
    AuthorizationType.NoAuthorization,
    AuthorizationType.BasicAuth,
    AuthorizationType.BearerToken,
    AuthorizationType.APIKey,
    AuthorizationType.SSO,
    AuthorizationType.OAUTH2,
];

export type BulkApiImportWizardViewProps = {
    activeStep: BulkApiStepType;
    isValidSwagger?: boolean;
    isLoadingPreview?: boolean;
    bulkFiles: File[];
    control: Control<TBulkConfigForm, unknown>;
    errors: FieldErrors<TBulkConfigForm>;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    baseUrl: string;
    foundCount: number;
    selectedCount: number;
    testedCount: number;
    importProgress: number;
    importStats: BulkApiImportStats | null;
    isErrorOnCreate: boolean;
    fields: FieldArrayWithId<TBulkConfigForm, 'previewApis', 'id'>[];
    authFields: FieldArrayWithId<TBulkConfigForm, 'authorization', 'id'>[];
    watchedBaseUrl: string;
    register: UseFormRegister<TBulkConfigForm>;
    watch: UseFormWatch<TBulkConfigForm>;
    setValue: UseFormSetValue<TBulkConfigForm>;
    trigger: UseFormTrigger<TBulkConfigForm>;
    handleSelectAll: () => void;
    handleDeselectAll: () => void;
    handleToggleSelect: (id: string, checked: boolean) => void;
    handleTestedChange: (apiName: string, tested: boolean) => void;
    refetch: () => void;
    onUploadChange: (files: File[]) => void;
    onFileClear?: () => void;
};

export const BulkApiImportWizardView = (props: BulkApiImportWizardViewProps) => {
    const {
        activeStep,
        bulkFiles,
        secrets,
        loadingSecrets,
        importProgress,
        isValidSwagger,
        errors,
        importStats,
        isErrorOnCreate,
        authFields,
        watch,
        register,
        refetch,
        onUploadChange,
        onFileClear,
    } = props;

    return (
        <StepWizardView
            panes={[
                {
                    id: BulkApiStepType.UPLOAD,
                    label: 'Upload',
                    content: (
                        <div className="space-y-3">
                            <FileUploader
                                placeholder="Choose one Swagger/OpenAPI file (JSON or YAML) - selecting a new file will replace the current one"
                                hideInbuiltUploadHandler
                                supportMultiUpload={false}
                                accept={[
                                    'application/json',
                                    'application/yaml',
                                    'application/x-yaml',
                                    'text/yaml',
                                    '.json',
                                    '.yaml',
                                    '.yml',
                                ]}
                                value={bulkFiles}
                                onChange={onUploadChange}
                                onClear={onFileClear}
                                hasError={!isValidSwagger && bulkFiles.length > 0}
                            />
                            {!isValidSwagger && (
                                <div className="flex items-center mt-1">
                                    <FileWarning size={16} className="text-red-600 inline mr-1" />
                                    <p className="text-xs text-red-600">
                                        The file does not contain a valid Swagger/OpenAPI specification.
                                    </p>
                                </div>
                            )}
                        </div>
                    ),
                },
                {
                    id: BulkApiStepType.CONFIGURE,
                    label: 'Configure',
                    content: (
                        <div className="space-y-4">
                            <div>
                                <Input
                                    {...register('baseUrl', {
                                        required: { value: true, message: 'Please enter Base URL' },
                                        validate: value => validateUrl(value, 'Base URL'),
                                    })}
                                    placeholder="https://api.example.com"
                                    label="Base URL"
                                    value={watch('baseUrl')}
                                    isDestructive={!!errors?.baseUrl?.message}
                                    supportiveText={errors?.baseUrl?.message as string}
                                />
                            </div>
                            <div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            Authentication
                                        </p>
                                        {(() => {
                                            const authCount = authFields.filter(
                                                field => field.authType !== AuthorizationType.NoAuthorization
                                            ).length;

                                            return (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                    {authCount === 0
                                                        ? 'None'
                                                        : `${authCount} type${authCount > 1 ? 's' : ''}`}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-4 mt-2">
                                    {authFields.map((field, index) => {
                                        const authType = watch(`authorization.${index}.authType`);
                                        const isSupported = SUPPORTED_AUTH_TYPES.includes(
                                            authType as AuthorizationType
                                        );
                                        const gridColspan =
                                            authType === AuthorizationType.BearerToken
                                                ? 'grid-cols-1 sm:grid-cols-2'
                                                : 'grid-cols-1 sm:grid-cols-1';

                                        return (
                                            <div
                                                key={field.id}
                                                className={cn(
                                                    'border rounded-md px-2 py-2 pb-4 transition',
                                                    isSupported
                                                        ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 opacity-70 cursor-not-allowed pointer-events-none',
                                                    {
                                                        '!hidden':
                                                            watch(`authorization.${index}.authType`) ===
                                                            AuthorizationType.NoAuthorization,
                                                    }
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p
                                                        className={cn('text-sm font-semibold', {
                                                            hidden: authType === AuthorizationType.NoAuthorization,
                                                        })}
                                                    >
                                                        {(() => {
                                                            if (!isSupported) return 'Unsupported Authentication';
                                                            if (authType === AuthorizationType.APIKey) return 'API-key';
                                                            return capitalize(authType);
                                                        })()}
                                                    </p>
                                                    {!isSupported && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                                            ⚠ Unsupported
                                                        </span>
                                                    )}
                                                </div>

                                                {!isSupported ? (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                        We detected{' '}
                                                        <b>
                                                            {authType == AuthorizationType.OAUTH2 ? 'OAuth2' : authType}
                                                        </b>{' '}
                                                        authentication in the specification, but it’s not supported by
                                                        the system yet. Any operations requiring{' '}
                                                        <b>
                                                            {authType == AuthorizationType.OAUTH2 ? 'OAuth2' : authType}
                                                        </b>{' '}
                                                        will be disabled for now.
                                                    </p>
                                                ) : (
                                                    <div className={`grid gap-4 mt-2 ${gridColspan}`}>
                                                        <Select
                                                            {...register(`authorization.${index}.authType`, {
                                                                required: {
                                                                    value: true,
                                                                    message: 'Please select authentication',
                                                                },
                                                            })}
                                                            placeholder="Select authentication"
                                                            options={[
                                                                {
                                                                    value: AuthorizationType.NoAuthorization,
                                                                    name: 'No Authentication',
                                                                },
                                                                {
                                                                    value: AuthorizationType.BasicAuth,
                                                                    name: 'Basic Auth',
                                                                },
                                                                {
                                                                    value: AuthorizationType.BearerToken,
                                                                    name: 'Bearer Token',
                                                                },
                                                                {
                                                                    value: AuthorizationType.APIKey,
                                                                    name: 'API Key',
                                                                },
                                                                {
                                                                    value: AuthorizationType.SSO,
                                                                    name: 'Single Sign-On',
                                                                },
                                                                {
                                                                    value: AuthorizationType.OAUTH2,
                                                                    name: 'OAuth',
                                                                },
                                                            ]}
                                                            value={authType}
                                                            isDestructive={
                                                                !!errors?.authorization?.[index]?.authType?.message
                                                            }
                                                            supportiveText={
                                                                errors?.authorization?.[index]?.authType
                                                                    ?.message as string
                                                            }
                                                            className={cn('pointer-events-none', {
                                                                hidden: authType === AuthorizationType.NoAuthorization,
                                                            })}
                                                        />

                                                        {(authType === AuthorizationType.BasicAuth ||
                                                            authType === AuthorizationType.APIKey) && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {authType === AuthorizationType.BasicAuth && (
                                                                    <>
                                                                        <Input
                                                                            {...register(
                                                                                `authorization.${index}.meta.username`,
                                                                                {
                                                                                    required: validateField(
                                                                                        'Username',
                                                                                        {
                                                                                            required: {
                                                                                                value: true,
                                                                                            },
                                                                                        }
                                                                                    ).required,
                                                                                    validate: value =>
                                                                                        validateSpaces(
                                                                                            value,
                                                                                            'username'
                                                                                        ),
                                                                                }
                                                                            )}
                                                                            placeholder="Enter your username"
                                                                            autoComplete="off"
                                                                            value={watch(
                                                                                `authorization.${index}.meta.username`
                                                                            )}
                                                                            isDestructive={
                                                                                !!errors?.authorization?.[index]?.meta
                                                                                    ?.username?.message
                                                                            }
                                                                            supportiveText={
                                                                                errors?.authorization?.[index]?.meta
                                                                                    ?.username?.message
                                                                            }
                                                                        />
                                                                        <VaultSelector
                                                                            {...register(
                                                                                `authorization.${index}.meta.password`,
                                                                                {
                                                                                    required: {
                                                                                        value: true,
                                                                                        message:
                                                                                            'Please select vault key',
                                                                                    },
                                                                                }
                                                                            )}
                                                                            placeholder={
                                                                                secrets.length > 0
                                                                                    ? 'Select vault key'
                                                                                    : 'No vault key found'
                                                                            }
                                                                            disabled={secrets.length === 0}
                                                                            options={secrets}
                                                                            currentValue={watch(
                                                                                `authorization.${index}.meta.password`
                                                                            )}
                                                                            isDestructive={
                                                                                !!errors?.authorization?.[index]?.meta
                                                                                    ?.password?.message
                                                                            }
                                                                            supportiveText={
                                                                                errors?.authorization?.[index]?.meta
                                                                                    ?.password?.message
                                                                            }
                                                                            disableCreate={false}
                                                                            loadingSecrets={loadingSecrets}
                                                                            onRefetch={() => refetch()}
                                                                        />
                                                                    </>
                                                                )}
                                                                {authType === AuthorizationType.APIKey && (
                                                                    <>
                                                                        <Input
                                                                            {...register(
                                                                                `authorization.${index}.meta.headerName`,
                                                                                {
                                                                                    required: validateField(
                                                                                        'Header Name',
                                                                                        {
                                                                                            required: {
                                                                                                value: true,
                                                                                            },
                                                                                        }
                                                                                    ).required,
                                                                                    validate: value =>
                                                                                        validateSpaces(
                                                                                            value,
                                                                                            'header name'
                                                                                        ),
                                                                                }
                                                                            )}
                                                                            placeholder="Enter your header name"
                                                                            autoComplete="off"
                                                                            value={watch(
                                                                                `authorization.${index}.meta.headerName`
                                                                            )}
                                                                            isDestructive={
                                                                                !!errors?.authorization?.[index]?.meta
                                                                                    ?.headerName?.message
                                                                            }
                                                                            supportiveText={
                                                                                errors?.authorization?.[index]?.meta
                                                                                    ?.headerName?.message
                                                                            }
                                                                        />
                                                                        <VaultSelector
                                                                            {...register(
                                                                                `authorization.${index}.meta.headerValue`,
                                                                                {
                                                                                    required: {
                                                                                        value: true,
                                                                                        message:
                                                                                            'Please select vault key',
                                                                                    },
                                                                                }
                                                                            )}
                                                                            placeholder={
                                                                                secrets.length > 0
                                                                                    ? 'Select vault key'
                                                                                    : 'No vault key found'
                                                                            }
                                                                            disabled={secrets.length === 0}
                                                                            options={secrets}
                                                                            currentValue={watch(
                                                                                `authorization.${index}.meta.headerValue`
                                                                            )}
                                                                            isDestructive={
                                                                                !!errors?.authorization?.[index]?.meta
                                                                                    ?.headerValue?.message
                                                                            }
                                                                            supportiveText={
                                                                                errors?.authorization?.[index]?.meta
                                                                                    ?.headerValue?.message
                                                                            }
                                                                            disableCreate={false}
                                                                            loadingSecrets={loadingSecrets}
                                                                            onRefetch={() => refetch()}
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        {authType === AuthorizationType.BearerToken && (
                                                            <VaultSelector
                                                                {...register(`authorization.${index}.meta.token`, {
                                                                    required: {
                                                                        value: true,
                                                                        message: 'Please select vault key',
                                                                    },
                                                                })}
                                                                placeholder={
                                                                    secrets.length > 0
                                                                        ? 'Select vault key'
                                                                        : 'No vault key found'
                                                                }
                                                                disabled={secrets.length === 0}
                                                                options={secrets}
                                                                currentValue={watch(
                                                                    `authorization.${index}.meta.token`
                                                                )}
                                                                isDestructive={
                                                                    !!errors?.authorization?.[index]?.meta?.token
                                                                        ?.message
                                                                }
                                                                supportiveText={
                                                                    errors?.authorization?.[index]?.meta?.token?.message
                                                                }
                                                                disableCreate={false}
                                                                loadingSecrets={loadingSecrets}
                                                                onRefetch={() => refetch()}
                                                            />
                                                        )}
                                                        {authType === AuthorizationType.OAUTH2 && (
                                                            <div className="col-span-1 sm:col-span-1">
                                                                <div className="flex items-center gap-x-4">
                                                                    <Select
                                                                        {...register(
                                                                            `authorization.${index}.meta.grantType`,
                                                                            {
                                                                                required: {
                                                                                    value: true,
                                                                                    message: 'Please select grant type',
                                                                                },
                                                                            }
                                                                        )}
                                                                        placeholder="Select your Grant Type"
                                                                        options={API_AUTHENTICATION_GRANT_TYPES}
                                                                        currentValue={
                                                                            watch(
                                                                                `authorization.${index}.meta.grantType`
                                                                            ) || AuthenticationGrantType.Empty
                                                                        }
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.grantType?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.grantType?.message as string
                                                                        }
                                                                    />
                                                                    <Input
                                                                        {...register(
                                                                            `authorization.${index}.meta.headerPrefix`,
                                                                            {
                                                                                validate: value =>
                                                                                    value
                                                                                        ? validateSpaces(
                                                                                              value,
                                                                                              'Header Prefix'
                                                                                          )
                                                                                        : true,
                                                                            }
                                                                        )}
                                                                        placeholder="Header Prefix (e.g., Bearer)"
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.headerPrefix?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.headerPrefix?.message as string
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-x-4 mt-4">
                                                                    <Input
                                                                        {...register(
                                                                            `authorization.${index}.meta.clientId`,
                                                                            {
                                                                                required: {
                                                                                    value: true,
                                                                                    message: 'Please enter client ID',
                                                                                },
                                                                                validate: value =>
                                                                                    validateSpaces(value, 'client id'),
                                                                            }
                                                                        )}
                                                                        placeholder="Client ID"
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.clientId?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.clientId?.message as string
                                                                        }
                                                                    />
                                                                    <VaultSelector
                                                                        {...register(
                                                                            `authorization.${index}.meta.clientSecret`,
                                                                            {
                                                                                required: {
                                                                                    value: true,
                                                                                    message: 'Please select vault key',
                                                                                },
                                                                            }
                                                                        )}
                                                                        placeholder={
                                                                            secrets.length > 0
                                                                                ? 'Select client secret (vault)'
                                                                                : 'No vault key found'
                                                                        }
                                                                        options={secrets}
                                                                        currentValue={
                                                                            watch(
                                                                                `previewApis.${index}.authorization.0.meta.clientSecret`
                                                                            ) || ''
                                                                        }
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.clientSecret?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.clientSecret?.message as string
                                                                        }
                                                                        loadingSecrets={loadingSecrets}
                                                                        onRefetch={() => refetch()}
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-x-4 mt-4">
                                                                    <Input
                                                                        {...register(
                                                                            `authorization.${index}.meta.audience`,
                                                                            {
                                                                                validate: value =>
                                                                                    value
                                                                                        ? validateSpaces(
                                                                                              value,
                                                                                              'audience'
                                                                                          )
                                                                                        : true,
                                                                            }
                                                                        )}
                                                                        placeholder="Audience"
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.audience?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.audience?.message as string
                                                                        }
                                                                    />
                                                                    <Input
                                                                        {...register(
                                                                            `authorization.${index}.meta.scope`,
                                                                            {
                                                                                validate: value =>
                                                                                    value
                                                                                        ? validateSpaces(value, 'scope')
                                                                                        : true,
                                                                            }
                                                                        )}
                                                                        placeholder="Scope (space-separated)"
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.scope?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta?.scope
                                                                                ?.message as string
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-x-4 mt-4">
                                                                    <Input
                                                                        {...register(
                                                                            `authorization.${index}.meta.tokenUrl`,
                                                                            {
                                                                                required: {
                                                                                    value: true,
                                                                                    message: 'Please enter token URL',
                                                                                },
                                                                                validate: value =>
                                                                                    validateUrl(value, 'Token URL'),
                                                                            }
                                                                        )}
                                                                        placeholder="Token URL"
                                                                        isDestructive={
                                                                            !!errors?.authorization?.[index]?.meta
                                                                                ?.tokenUrl?.message
                                                                        }
                                                                        supportiveText={
                                                                            errors?.authorization?.[index]?.meta
                                                                                ?.tokenUrl?.message as string
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    id: BulkApiStepType.PREVIEW,
                    label: 'Preview',
                    content: <ApiPreviewStep {...props} />,
                },
                {
                    id: BulkApiStepType.IMPORT,
                    label: 'Import',
                    content: (
                        <div className="py-6">
                            <ImportProgress
                                title={(() => {
                                    if (importProgress < 100) return 'Importing...';
                                    if (!importStats) return 'Successfully imported';
                                    if (importStats.created === 0 && importStats.duplicate > 0)
                                        return 'No APIs created - All duplicates';
                                    if (importStats.created > 0 && importStats.duplicate > 0) {
                                        return `Successfully imported ${importStats.created} API${importStats.created !== 1 ? 's' : ''} and ignored ${importStats.duplicate} duplicate${importStats.duplicate !== 1 ? 's' : ''}`;
                                    }
                                    return `Successfully imported ${importStats.created} API${importStats.created !== 1 ? 's' : ''}`;
                                })()}
                                // subtitle={
                                //     importProgress >= 100
                                //         ? undefined
                                //         : `${selectedCount} API${selectedCount !== 1 ? 's' : ''} selected`
                                // }
                                progress={importProgress}
                                titleClassName={(() => {
                                    if (importProgress < 100 || isErrorOnCreate) return undefined;
                                    if (importStats?.created === 0 && importStats?.duplicate > 0)
                                        return 'text-yellow-600';
                                    return 'text-green-600';
                                })()}
                                isError={isErrorOnCreate}
                                isWarning={
                                    importProgress >= 100 &&
                                    !isErrorOnCreate &&
                                    importStats !== null &&
                                    importStats.created === 0 &&
                                    importStats.duplicate > 0
                                }
                            />
                        </div>
                    ),
                },
            ]}
            activeStep={activeStep}
            headerClassName="pb-3"
        />
    );
};
