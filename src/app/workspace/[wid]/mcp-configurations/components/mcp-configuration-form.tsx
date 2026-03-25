'use client';
import React from 'react';
import {
    Button,
    Input,
    Label,
    MultiSelect,
    OptionModel,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VaultSelector,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { AuthorizationType } from '@/enums';
import { TransportType } from '@/enums/transport-type';
import { AvailableTool } from '@/hooks/use-mcp-configuration';
import { cn, getSubmitButtonLabel, validateSpaces, validateUrl } from '@/lib/utils';
import { TestConnectionState, TestConnectionError, TestConnectionSuccess } from '@/components/molecules/test-connection';
import {
    SelectV2 as ScenarioSelect,
    SelectContentV2 as SelectContent,
    SelectItemV2 as SelectItem,
    SelectTriggerV2 as SelectTrigger,
    SelectValueV2 as SelectValue,
} from '@/components/atoms/select-v2';
import { Alert } from '@/components/atoms/alert';
import { AlertVariant } from '@/enums/component-type';
import { Loader2, PlugZap, RefreshCcw, ServerCog } from 'lucide-react';
import { IMcpConfigForm } from '@/models';
import { validateField } from '@/utils/validation';
import { useEffect, useMemo } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';

export type McpConfigurationFormProps = {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IMcpConfigForm>;
    isSaving: boolean;
    hasTestConnection?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IMcpConfigForm>;
    watch: UseFormWatch<IMcpConfigForm>;
    setValue: UseFormSetValue<IMcpConfigForm>;
    control: Control<IMcpConfigForm, unknown>;
    handleSubmit: UseFormHandleSubmit<IMcpConfigForm>;
    onHandleSubmit: (data: IMcpConfigForm) => void;
    refetch: () => void;
    loadingSecrets?: boolean;
    secrets: OptionModel[];
    tools: AvailableTool[];
    getAllTool: () => void;
    toolLoading: boolean;
    onTestConnection?: () => Promise<{ success: boolean; data?: TestConnectionSuccess; error?: TestConnectionError }>;
    showTestConnectionScenarioToggle?: boolean;
};

export const FormBody = (props: McpConfigurationFormProps) => {
    const {
        register,
        watch,
        setValue,
        hasTestConnection = true,
        errors,
        isEdit,
        refetch,
        secrets,
        loadingSecrets,
        control,
        getAllTool,
        tools,
        toolLoading,
    } = props;

    const validateName = (value: string) => {
        if (value) {
            const validHeaderRegex = /^\w+$/;
            if (value.startsWith(' ')) {
                return 'No leading spaces in variable name';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in variable name';
            }
            if (!validHeaderRegex.test(value)) {
                return 'Letters, digits and _ only allowed';
            }
        }
        return true;
    };

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    useEffect(() => {
        if (watch('authorization.authType') === AuthorizationType.NoAuthorization) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (watch('authorization.authType') === AuthorizationType.BasicAuth) {
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (watch('authorization.authType') === AuthorizationType.BearerToken) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (watch('authorization.authType') === AuthorizationType.APIKey) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.token', '');
        }
    }, [watch('authorization.authType')]);

    const hasServerName = useMemo(() => {
        return !!(watch('name') && watch('name').trim() !== '');
    }, [watch('name')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const gridCol = useMemo(() => {
        if (
            watch('authorization.authType') === AuthorizationType.BasicAuth ||
            watch('authorization.authType') === AuthorizationType.APIKey
        ) {
            return 'grid-cols-1 sm:grid-cols-3';
        } else if (watch('authorization.authType') === AuthorizationType.BearerToken) {
            return 'grid-cols-1 sm:grid-cols-2';
        }
        return 'grid-cols-1 sm:grid-cols-1';
    }, [watch('authorization.authType')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Server Name', { required: { value: true } }).required,
                        validate: value => validateName(value),
                    })}
                    placeholder="Enter your Server Name"
                    readOnly={isEdit && isReadOnly}
                    label="Server Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <p className="mb-3">Requirements to connect</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {hasServerName
                        ? "You've entered the Server name. To establish the connection successfully, please complete the fields below with accurate values"
                        : "Please enter the Server Name to display the form specific to your choice. If nothing is visible here yet, it's because no Server Name has been given."}
                </p>
            </div>
            {hasServerName && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="flex flex-col items-start gap-y-3 w-full p-3 pt-2 rounded-lg border border-gray-300 dark:border-gray-700">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Server URL Config
                            </Label>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input
                                    {...register('url', {
                                        required: {
                                            value: true,
                                            message: 'Please enter a server URL',
                                        },
                                        validate: value => validateUrl(value, 'Server URL'),
                                    })}
                                    placeholder="Enter your Server URL"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors?.url?.message}
                                    supportiveText={errors?.url?.message}
                                    containerClassName="col-span-1 sm:col-span-2"
                                />
                                <Select
                                    {...register('transport', {
                                        required: { value: true, message: 'Please select Transport' },
                                    })}
                                    placeholder="Select Transport"
                                    options={[
                                        { value: TransportType.SSE, name: 'SSE' },
                                        { value: TransportType.StreamableHTTP, name: 'Streamable HTTP' },
                                        // { value: TransportType.Stdio, name: 'Stdio' },
                                    ]}
                                    disabled={isEdit && isReadOnly}
                                    currentValue={watch('transport')}
                                    isDestructive={!!errors?.authorization?.authType?.message}
                                    supportiveText={errors?.authorization?.authType?.message}
                                />
                                <div className="col-span-1 sm:col-span-3 flex flex-col gap-y-2">
                                    {watch('url') &&
                                    !errors?.url?.message &&
                                    watch('transport') &&
                                    !errors?.transport?.message ? (
                                        <div className="w-full flex items-center gap-x-3">
                                            <Controller
                                                name="availableTools"
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: 'Select Available Tools',
                                                    },
                                                }}
                                                disabled={toolLoading}
                                                render={({ field }) => (
                                                    <MultiSelect
                                                        {...field}
                                                        options={tools.map(x => ({
                                                            label: `${x.name}`.trimEnd(),
                                                            value: x.name,
                                                        }))}
                                                        isDestructive={!!errors?.availableTools?.message}
                                                        defaultValue={field?.value}
                                                        menuPortalTarget={document.body}
                                                        placeholder="Select Available Tools"
                                                        onChange={selectedOptions => field.onChange(selectedOptions)}
                                                        menuClass="!z-50"
                                                        menuPortalClass="!z-50 pointer-events-auto"
                                                        isMulti
                                                        isSearchable
                                                        isDisabled={toolLoading}
                                                    />
                                                )}
                                            />
                                            <Button
                                                size="icon"
                                                type="button"
                                                className="size-9 min-w-9"
                                                onClick={getAllTool}
                                                disabled={toolLoading}
                                            >
                                                <RefreshCcw size={18} className={cn(toolLoading && 'animate-spin')} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-full p-3 rounded-md bg-gray-100 flex flex-col items-center justify-center gap-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">
                                                Server URL and Transport Required
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Please enter a valid server URL and select a transport method to load
                                                and display the available tools.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Textarea
                            {...register('description', {
                                required: descriptionValidate.required,
                                minLength: descriptionValidate.minLength,
                            })}
                            label="Description"
                            placeholder="Enter your description"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.description?.message}
                            supportiveText={errors?.description?.message}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                            Authorization
                        </span>
                        <div className={`grid gap-4 mt-2 ${gridCol}`}>
                            <Select
                                {...register('authorization.authType', {
                                    required: { value: true, message: 'Please select authorization' },
                                })}
                                placeholder="Select your authorization"
                                options={[
                                    { value: AuthorizationType.NoAuthorization, name: 'No Authorization' },
                                    { value: AuthorizationType.BasicAuth, name: 'Basic Auth' },
                                    { value: AuthorizationType.BearerToken, name: 'Bearer Token' },
                                    { value: AuthorizationType.APIKey, name: 'API Key' },
                                    { value: AuthorizationType.SSO, name: 'Single Sign-On' },
                                    // { value: AuthorizationType.OAUTH2, name: 'OAuth' },
                                ]}
                                disabled={isEdit && isReadOnly}
                                currentValue={watch('authorization.authType')}
                                isDestructive={!!errors?.authorization?.authType?.message}
                                supportiveText={errors?.authorization?.authType?.message}
                            />
                            {watch('authorization.authType') === AuthorizationType.BasicAuth && (
                                <>
                                    <Input
                                        {...register('authorization.meta.username', {
                                            required: validateField('Username', { required: { value: true } }).required,
                                            validate: value => validateSpaces(value, 'username'),
                                        })}
                                        placeholder="Enter your username"
                                        readOnly={isEdit && isReadOnly}
                                        autoComplete="off"
                                        isDestructive={!!errors?.authorization?.meta?.username?.message}
                                        supportiveText={errors?.authorization?.meta?.username?.message}
                                    />
                                    <VaultSelector
                                        {...register('authorization.meta.password', {
                                            required: { value: true, message: 'Please select vault key' },
                                        })}
                                        placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                        disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                        options={secrets}
                                        currentValue={watch('authorization.meta.password')}
                                        isDestructive={!!errors?.authorization?.meta?.password?.message}
                                        supportiveText={errors?.authorization?.meta?.password?.message}
                                        disableCreate={isEdit && isReadOnly}
                                        loadingSecrets={loadingSecrets}
                                        onRefetch={() => refetch()}
                                    />
                                </>
                            )}
                            {watch('authorization.authType') === AuthorizationType.BearerToken && (
                                <VaultSelector
                                    {...register('authorization.meta.token', {
                                        required: { value: true, message: 'Please select vault key' },
                                    })}
                                    placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('authorization.meta.token')}
                                    isDestructive={!!errors?.authorization?.meta?.token?.message}
                                    supportiveText={errors?.authorization?.meta?.token?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            )}
                            {watch('authorization.authType') === AuthorizationType.APIKey && (
                                <>
                                    <Input
                                        {...register('authorization.meta.headerName', {
                                            required: validateField('Header Name', { required: { value: true } })
                                                .required,
                                            validate: value => validateSpaces(value, 'header name'),
                                        })}
                                        placeholder="Enter your header name"
                                        readOnly={isEdit && isReadOnly}
                                        autoComplete="off"
                                        isDestructive={!!errors?.authorization?.meta?.headerName?.message}
                                        supportiveText={errors?.authorization?.meta?.headerName?.message}
                                    />
                                    <VaultSelector
                                        {...register('authorization.meta.headerValue', {
                                            required: { value: true, message: 'Please select vault key' },
                                        })}
                                        placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                        disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                        options={secrets}
                                        currentValue={watch('authorization.meta.headerValue')}
                                        isDestructive={!!errors?.authorization?.meta?.headerValue?.message}
                                        supportiveText={errors?.authorization?.meta?.headerValue?.message}
                                        disableCreate={isEdit && isReadOnly}
                                        loadingSecrets={loadingSecrets}
                                        onRefetch={() => refetch()}
                                    />
                                </>
                            )}
                            {watch('authorization.authType') === AuthorizationType.OAUTH2 && (
                                <div className="col-span-1 sm:col-span-1 mt-2">
                                    <div className="flex items-center gap-x-4">
                                        <Input placeholder="Authorization URL" autoComplete="off" />
                                        <Input placeholder="Token URL" autoComplete="off" />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input placeholder="Client ID" autoComplete="off" />
                                        <VaultSelector
                                            placeholder="Client Secret"
                                            options={secrets}
                                            onRefetch={() => {}}
                                        />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input placeholder="Redirect URI" autoComplete="off" />
                                        <MultiSelect
                                            options={[]}
                                            menuPortalTarget={document.body}
                                            isMulti
                                            placeholder="Scopes"
                                            menuClass="!z-50"
                                            menuPortalClass="!z-50 pointer-events-auto"
                                            isDisabled={isEdit && isReadOnly}
                                        />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input
                                            placeholder="Grant Type"
                                            autoComplete="off"
                                            value={'authorization_code'}
                                            disabled
                                        />
                                        <Input placeholder="Audience" autoComplete="off" />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Select
                                            placeholder="Prompt Type"
                                            options={[
                                                { value: 'login', name: 'Login' },
                                                { value: 'consent', name: 'Consent' },
                                                { value: 'none', name: 'None' },
                                            ]}
                                        />
                                        <Input placeholder="Login hint" />
                                    </div>
                                    <div className="flex items-center gap-x-3 mt-4">
                                        <Input placeholder="User Info URL" />
                                        <Input placeholder="Issuer URL" />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input placeholder="Discovery URL" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('timeout', {
                                    required: validateField('Timeout', { required: { value: true } }).required,
                                })}
                                placeholder="Enter Timeout"
                                readOnly={isEdit && isReadOnly}
                                label="Timeout (seconds)"
                                isDestructive={!!errors?.timeout?.message}
                                supportiveText={errors?.timeout?.message}
                            />
                            <Input
                                {...register('retryCount', {
                                    required: validateField('Retry Count', { required: { value: true } }).required,
                                })}
                                placeholder="Enter your Retry Count"
                                readOnly={isEdit && isReadOnly}
                                label="Retry Count"
                                isDestructive={!!errors?.retryCount?.message}
                                supportiveText={errors?.retryCount?.message}
                            />
                        </div>
                    </div> */}
                </>
            )}
            {hasTestConnection && (
                <div className="col-span-1 sm:col-span-2" hidden>
                    <div
                        className="p-4 mb-4 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
                        role="alert"
                    >
                        <div className="flex items-center">
                            <h3 className="text-lg font-medium">Test Connection</h3>
                        </div>
                        <div className="mt-2 mb-4 text-sm">
                            After completing all the required fields, you can test the connection to ensure everything
                            is set up correctly before proceeding to create it.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const McpConfigurationForm = (props: McpConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving, onTestConnection, showTestConnectionScenarioToggle, tools } = props;
    const [testState, setTestState] = React.useState<TestConnectionState>('idle');
    const [testSuccess, setTestSuccess] = React.useState<TestConnectionSuccess | null>(null);
    const [testError, setTestError] = React.useState<TestConnectionError | null>(null);
    const [scenarioState, setScenarioState] = React.useState<TestConnectionState | 'auto'>('auto');

    // Demo data for scenario toggles
    const demoSuccess: TestConnectionSuccess = {
        message: `MCP connection successful. ${tools.length || 5} tools discovered.`,
        details: tools.length > 0 ? `Tools: ${tools.slice(0, 3).map(t => t.name).join(', ')}${tools.length > 3 ? '...' : ''}` : undefined,
    };
    const demoError: TestConnectionError = {
        message: 'Unable to connect to MCP server',
        details: '404 Not Found - The server URL could not be reached',
    };

    const handleTestConnection = async () => {
        setTestState('loading');
        setTestSuccess(null);
        setTestError(null);

        if (onTestConnection) {
            try {
                const result = await onTestConnection();
                if (result.success && result.data) {
                    setTestState('success');
                    setTestSuccess(result.data);
                } else if (!result.success && result.error) {
                    setTestState('error');
                    setTestError(result.error);
                }
            } catch (err) {
                setTestState('error');
                setTestError({
                    message: 'An unexpected error occurred',
                    details: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        } else {
            // Default mock behavior for demo
            setTimeout(() => {
                setTestState('success');
                setTestSuccess(demoSuccess);
            }, 1500);
        }
    };

    const displayState = scenarioState !== 'auto' ? scenarioState : testState;
    const displaySuccess = scenarioState === 'success' ? demoSuccess : testSuccess;
    const displayError = scenarioState === 'error' ? demoError : testError;

    console.log('[v0] MCP Form - showTestConnectionScenarioToggle:', showTestConnectionScenarioToggle, 'displayState:', displayState);

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            header={isEdit ? 'Edit MCP Config' : 'New MCP Config'}
            headerIcon={<ServerCog />}
            dismissible={false}
            footer={
                <div className="flex flex-col gap-3">
                    {/* Scenario Toggle for Reviewers */}
                    {showTestConnectionScenarioToggle && (
                        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Preview State:
                            </span>
                            <ScenarioSelect
                                value={scenarioState}
                                onValueChange={(value) => setScenarioState(value as TestConnectionState | 'auto')}
                            >
                                <SelectTrigger className="h-7 w-[120px] text-xs">
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="idle">Idle</SelectItem>
                                    <SelectItem value="loading">Loading</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </ScenarioSelect>
                        </div>
                    )}
                    
                    {/* Success Banner */}
                    {displayState === 'success' && displaySuccess && (
                        <Alert
                            variant={AlertVariant.Success}
                            title="Connection Successful"
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{displaySuccess.message}</span>
                                    {displaySuccess.details && (
                                        <span className="text-xs opacity-80">{displaySuccess.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    {/* Error Banner */}
                    {displayState === 'error' && displayError && (
                        <Alert
                            variant={AlertVariant.Error}
                            title="Connection Failed"
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{displayError.message}</span>
                                    {displayError.details && (
                                        <span className="text-xs opacity-70">{displayError.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={!isValid || displayState === 'loading' || (isEdit && !!watch('isReadOnly'))}
                                onClick={handleTestConnection}
                            >
                                {displayState === 'loading' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <PlugZap className="mr-2 h-4 w-4" />
                                        Test Connection
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size={'sm'}
                                                disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                                onClick={handleSubmit(onHandleSubmit)}
                                            >
                                                {getSubmitButtonLabel(isSaving, isEdit)}
                                            </Button>
                                        </TooltipTrigger>
                                        {!isValid && (
                                            <TooltipContent side="left" align="center">
                                                All details need to be filled before the form can be saved
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};
