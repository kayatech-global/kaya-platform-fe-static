import {
    Button,
    HeaderInput,
    Input,
    OptionModel,
    Select,
    VaultSelector,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import TestApiModal from '@/components/molecules/test-api-modal/test-api-modal';
import { API_AUTHENTICATION_GRANT_TYPES } from '@/constants';
import { AuthenticationGrantType, AuthorizationType } from '@/enums';
import { HeaderType } from '@/hooks/use-api-configuration';
import { MOCK_QUERY_PARAM_OPTIONS, MOCK_RESPONSE_FIELD_OPTIONS } from '@/components/atoms/header-input';
import {
    cn,
    getSubmitButtonLabel,
    validateUrl,
    validateSpaces,
    validateHeaderIdentifier,
    validateIdentifier,
} from '@/lib/utils';
import { IApiConfigForm, IHeaderValues } from '@/models';
import { validateField } from '@/utils/validation';
import { CloudCog, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';

export interface ApiConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IApiConfigForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IApiConfigForm>;
    watch: UseFormWatch<IApiConfigForm>;
    setValue: UseFormSetValue<IApiConfigForm>;
    apiHeaders: FieldArrayWithId<IApiConfigForm, 'apiHeaders', 'id'>[];
    payloads: FieldArrayWithId<IApiConfigForm, 'payloads', 'id'>[];
    defaultApiParameters: FieldArrayWithId<IApiConfigForm, 'defaultApiParameters', 'id'>[];
    remove: (index: number, type: number) => void;
    append: (type: number) => void;
    control: Control<IApiConfigForm, unknown>;
    handleSubmit: UseFormHandleSubmit<IApiConfigForm>;
    onHandleSubmit: (data: IApiConfigForm) => void;
    updatePayloadDataType: () => void;
    refetch: () => void;
    promotedVariables: FieldArrayWithId<IApiConfigForm, 'promotedVariables', 'id'>[];
    updatePromotedVariablesDataType: () => void;
    updateDefaultApiParametersData: () => void;
}

export const FormBody = (props: ApiConfigurationFormProps) => {
    const {
        register,
        watch,
        setValue,
        apiHeaders,
        payloads,
        defaultApiParameters,
        control,
        hasTestConnection = true,
        loadingSecrets,
        remove,
        append,
        errors,
        secrets,
        isEdit,
        updatePayloadDataType,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
        updateDefaultApiParametersData,
    } = props;

    // Extract watched values to stable variables for cleaner hook dependencies
    const apiMethod = watch('apiMethod');
    const payloadsVal = watch('payloads');
    const promotedVariablesVal = watch('promotedVariables');
    const authType = watch('authorization.authType');
    const apiNameVal = watch('apiName');
    const isReadOnlyVal = watch('isReadOnly');

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const isQueryParams = useMemo(() => {
        if (apiMethod === 'GET' || apiMethod === 'DELETE') {
            return true;
        }
        return false;
    }, [apiMethod]);

    useEffect(() => {
        if (isQueryParams) {
            const _payloads = payloadsVal?.some(x => x.dataType === 'list' || x.dataType === 'dict');
            if (_payloads) {
                updatePayloadDataType();
            }
        }
    }, [isQueryParams, payloadsVal, updatePayloadDataType]);

    useEffect(() => {
        const _promotedVariables = promotedVariablesVal?.some(x => x.dataType === 'list' || x.dataType === 'dict');
        if (_promotedVariables) {
            updatePromotedVariablesDataType();
        }
    }, [promotedVariablesVal, updatePromotedVariablesDataType]);

    useEffect(() => {
        const _defaultApiParameters = watch('defaultApiParameters')?.some(
            x => x.dataType === 'list' || x.dataType === 'dict'
        );
        if (_defaultApiParameters) {
            updateDefaultApiParametersData();
        }
    }, [watch('defaultApiParameters'), watch('defaultApiParameters')?.length]);

    useEffect(() => {
        if (watch('authorization.authType') === AuthorizationType.NoAuthorization) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (authType === AuthorizationType.BasicAuth) {
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (authType === AuthorizationType.BearerToken) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        } else if (watch('authorization.authType') === AuthorizationType.APIKey && !isEdit) {
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.tokenUrl', '');
            setValue('authorization.meta.clientId', '');
            setValue('authorization.meta.clientSecret', '');
            setValue('authorization.meta.audience', '');
            setValue('authorization.meta.scope', '');
            setValue('authorization.meta.grantType', AuthenticationGrantType.Empty);
            setValue('authorization.meta.headerPrefix', '');
        } else if (watch('authorization.authType') === AuthorizationType.OAUTH2) {
            // Clear non-oauth fields and set sensible defaults for oauth2
            setValue('authorization.meta.username', '');
            setValue('authorization.meta.password', '');
            setValue('authorization.meta.token', '');
            setValue('authorization.meta.headerName', '');
            setValue('authorization.meta.headerValue', '');
        }
    }, [authType, setValue]);

    const hasApiName = useMemo(() => {
        return !!(apiNameVal && apiNameVal.trim() !== '');
    }, [apiNameVal]);

    const isReadOnly = useMemo(() => {
        return !!isReadOnlyVal;
    }, [isReadOnlyVal]);

    const gridCol = useMemo(() => {
        if (authType === AuthorizationType.BearerToken) {
            return 'grid-cols-1 sm:grid-cols-2';
        }
        return 'grid-cols-1 sm:grid-cols-1';
    }, [authType]);

    const customNameValidator = (value: string, index?: number) => {
        const result = validateHeaderIdentifier(value, 'name');

        if (result === true) {
            const headers = watch('apiHeaders') || [];

            const duplicate = headers.some((header, key) => {
                return key !== index && header.name.trim() === value.trim();
            });

            return duplicate ? 'Name must be unique' : true;
        }

        return result;
    };

    const validateUniqueTitle = (value: string, index?: number, isQueryParam?: boolean) => {
        const trimmedValue = value?.trim();

        const payloads = watch('payloads') ?? [];
        const defaults = watch('defaultApiParameters') ?? [];

        const currentList = isQueryParam ? payloads : defaults;
        const currentItem = currentList[index ?? -1];
        const hasValue = currentItem?.value?.trim();

        if (hasValue && !trimmedValue) {
            return 'Name is required';
        }

        if (!trimmedValue) return true;

        if (value.startsWith(' ')) return 'No leading spaces in name';
        if (value.endsWith(' ')) return 'No trailing spaces in name';

        const variableValidate = validateIdentifier(value, 'name');
        if (variableValidate !== true) {
            return variableValidate;
        }

        const duplicateInPayloads = payloads.some((item, i) => {
            if (isQueryParam && i === index) return false;
            return item?.name?.trim() === trimmedValue;
        });

        const duplicateInDefaults = defaults.some((item, i) => {
            if (!isQueryParam && i === index) return false;
            return item?.name?.trim() === trimmedValue;
        });

        if (duplicateInPayloads || duplicateInDefaults) {
            return 'Duplicate parameter name';
        }

        return true;
    };

    const validateValue = (value: string, index?: number, isQueryParam?: boolean, title = 'Description') => {
        const trimmedValue = value?.trim();

        const payloads = watch('payloads') ?? [];
        const defaults = watch('defaultApiParameters') ?? [];

        const currentList = isQueryParam ? payloads : defaults;
        const currentItem = currentList[index ?? -1];
        const hasValue = currentItem?.name?.trim();

        if (hasValue && !trimmedValue) {
            return `${title} is required`;
        }

        if (value.startsWith(' ')) {
            return `No leading spaces in ${title?.toLocaleLowerCase()}`;
        }
        if (value.endsWith(' ')) {
            return `No trailing spaces in ${title?.toLocaleLowerCase()}`;
        }

        return true;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('apiName', {
                        required: {
                            value: true,
                            message: 'Please enter an API name',
                        },
                        validate: value => validateSpaces(value, 'API name'),
                    })}
                    placeholder="Enter your API Name"
                    readOnly={isEdit && isReadOnly}
                    label="API Name"
                    isDestructive={!!errors?.apiName?.message}
                    supportiveText={errors?.apiName?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <p className="mb-3">Requirements to connect</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {hasApiName
                        ? "You've entered the API name. To establish the connection successfully, please complete the fields below with accurate values"
                        : "Please enter the API Name to display the form specific to your choice. If nothing is visible here yet, it's because no API Name has been given."}
                </p>
            </div>
            {hasApiName && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('apiUrl', {
                                    required: {
                                        value: true,
                                        message: 'Please enter an API URL',
                                    },
                                    validate: value => validateUrl(value, 'API URL'),
                                })}
                                placeholder="Enter your API URL"
                                readOnly={isEdit && isReadOnly}
                                label="API URL"
                                isDestructive={!!errors?.apiUrl?.message}
                                supportiveText={errors?.apiUrl?.message}
                            />
                            <Select
                                {...register('apiMethod', {
                                    required: { value: true, message: 'Please select API request method' },
                                })}
                                label="API Method"
                                placeholder="Select your API Method"
                                disabled={isEdit && isReadOnly}
                                options={[
                                    { value: 'GET', name: 'GET' },
                                    { value: 'POST', name: 'POST' },
                                    { value: 'PUT', name: 'PUT' },
                                    { value: 'PATCH', name: 'PATCH' },
                                    { value: 'DELETE', name: 'DELETE' },
                                ]}
                                currentValue={apiMethod}
                                isDestructive={!!errors?.apiMethod?.message}
                                supportiveText={errors?.apiMethod?.message}
                            />
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
                        <Input
                            {...register('concurrencyLimit', {
                                valueAsNumber: true,
                                min: { value: 1, message: 'Concurrency limit must be at least 1' },
                                validate: value =>
                                    value === null ||
                                    value === undefined ||
                                    Number.isNaN(value) ||
                                    (Number.isInteger(Number(value)) && Number(value) >= 1) ||
                                    'Concurrency limit must be a positive integer',
                            })}
                            type="number"
                            placeholder="Enter concurrency limit (optional)"
                            readOnly={isEdit && isReadOnly}
                            label="Concurrency Limit"
                            isDestructive={!!errors?.concurrencyLimit?.message}
                            supportiveText={
                                errors?.concurrencyLimit?.message ||
                                'Maximum number of concurrent requests allowed for this API'
                            }
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <HeaderInput
                            label="API Headers"
                            register={register}
                            fields={apiHeaders}
                            namePrefix="apiHeaders"
                            append={append}
                            remove={remove}
                            type={HeaderType.ApiHeader}
                            errors={errors}
                            control={control}
                            hasType={false}
                            list={watch('apiHeaders')}
                            disabledInputs={isEdit && isReadOnly}
                            isIncludeSecrets={true}
                            loadingSecrets={loadingSecrets}
                            secrets={secrets}
                            watch={watch}
                            customNameValidator={customNameValidator}
                            onSecretRefetch={() => refetch()}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                            Authentication
                        </span>
                        <div className={`grid gap-4 mt-2 ${gridCol}`}>
                            <Select
                                {...register('authorization.authType', {
                                    required: { value: true, message: 'Please select authentication' },
                                })}
                                placeholder="Select your authentication"
                                options={[
                                    { value: AuthorizationType.NoAuthorization, name: 'No Authentication' },
                                    { value: AuthorizationType.BasicAuth, name: 'Basic Auth' },
                                    { value: AuthorizationType.BearerToken, name: 'Bearer Token' },
                                    { value: AuthorizationType.APIKey, name: 'API Key' },
                                    { value: AuthorizationType.SSO, name: 'Single Sign-On' },
                                    { value: AuthorizationType.OAUTH2, name: 'OAuth' },
                                ]}
                                disabled={isEdit && isReadOnly}
                                currentValue={authType}
                                isDestructive={!!errors?.authorization?.authType?.message}
                                supportiveText={errors?.authorization?.authType?.message}
                            />
                            {(authType === AuthorizationType.BasicAuth || authType === AuthorizationType.APIKey) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {authType === AuthorizationType.BasicAuth && (
                                        <>
                                            <Input
                                                {...register('authorization.meta.username', {
                                                    required: validateField('Username', { required: { value: true } })
                                                        .required,
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
                                                placeholder={
                                                    secrets.length > 0 ? 'Select vault key' : 'No vault key found'
                                                }
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
                                    {authType === AuthorizationType.APIKey && (
                                        <>
                                            <Input
                                                {...register('authorization.meta.headerName', {
                                                    required: validateField('Header Name', {
                                                        required: { value: true },
                                                    }).required,
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
                                                placeholder={
                                                    secrets.length > 0 ? 'Select vault key' : 'No vault key found'
                                                }
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
                                </div>
                            )}
                            {authType === AuthorizationType.BearerToken && (
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
                            {watch('authorization.authType') === AuthorizationType.OAUTH2 && (
                                <div className="col-span-1 sm:col-span-1 mt-2">
                                    <div className="flex items-center gap-x-4">
                                        <Select
                                            {...register('authorization.meta.grantType', {
                                                required: { value: true, message: 'Please select grant type' },
                                            })}
                                            label="Grant Type"
                                            placeholder="Select your Grant Type"
                                            options={API_AUTHENTICATION_GRANT_TYPES}
                                            disabled={isEdit && isReadOnly}
                                            currentValue={watch('authorization.meta.grantType') || ''}
                                            isDestructive={!!errors?.authorization?.meta?.grantType?.message}
                                            supportiveText={errors?.authorization?.meta?.grantType?.message}
                                        />
                                        <Input
                                            {...register('authorization.meta.headerPrefix', {
                                                validate: value =>
                                                    value ? validateSpaces(value, 'Header Prefix') : true,
                                            })}
                                            placeholder="Header Prefix (e.g., Bearer)"
                                            label="Header Prefix"
                                            autoComplete="off"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors?.authorization?.meta?.headerPrefix?.message}
                                            supportiveText={errors?.authorization?.meta?.headerPrefix?.message}
                                        />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input
                                            {...register('authorization.meta.clientId', {
                                                required: {
                                                    value: true,
                                                    message: 'Please enter client ID',
                                                },
                                                validate: value => validateSpaces(value, 'client id'),
                                            })}
                                            placeholder="Client ID"
                                            label="Client ID"
                                            autoComplete="off"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors?.authorization?.meta?.clientId?.message}
                                            supportiveText={errors?.authorization?.meta?.clientId?.message}
                                        />
                                        <VaultSelector
                                            {...register('authorization.meta.clientSecret', {
                                                required: { value: true, message: 'Please select vault key' },
                                            })}
                                            placeholder={
                                                secrets.length > 0
                                                    ? 'Select client secret (vault)'
                                                    : 'No vault key found'
                                            }
                                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                            options={secrets}
                                            label="Client Secret"
                                            currentValue={watch('authorization.meta.clientSecret')}
                                            isDestructive={!!errors?.authorization?.meta?.clientSecret?.message}
                                            supportiveText={errors?.authorization?.meta?.clientSecret?.message}
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                        />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input
                                            {...register('authorization.meta.audience', {
                                                validate: value => (value ? validateSpaces(value, 'audience') : true),
                                            })}
                                            placeholder="Audience"
                                            label="Audience"
                                            autoComplete="off"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors?.authorization?.meta?.audience?.message}
                                            supportiveText={errors?.authorization?.meta?.audience?.message}
                                        />
                                        <Input
                                            {...register('authorization.meta.scope', {
                                                validate: value => (value ? validateSpaces(value, 'scope') : true),
                                            })}
                                            placeholder="Scope (space-separated)"
                                            label="Scope"
                                            autoComplete="off"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors?.authorization?.meta?.scope?.message}
                                            supportiveText={errors?.authorization?.meta?.scope?.message}
                                        />
                                    </div>
                                    <div className="flex items-center gap-x-4 mt-4">
                                        <Input
                                            {...register('authorization.meta.tokenUrl', {
                                                required: {
                                                    value: true,
                                                    message: 'Please enter token URL',
                                                },
                                                validate: value => validateUrl(value, 'Token URL'),
                                            })}
                                            placeholder="Token URL"
                                            label="Token URL"
                                            autoComplete="off"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors?.authorization?.meta?.tokenUrl?.message}
                                            supportiveText={errors?.authorization?.meta?.tokenUrl?.message}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <HeaderInput
                            label={isQueryParams ? 'Query Param Format' : 'Payload Format JSON'}
                            register={register}
                            fields={payloads}
                            namePrefix="payloads"
                            append={append}
                            remove={remove}
                            type={HeaderType.Payloads}
                            errors={errors}
                            control={control}
                            isQueryParams={isQueryParams}
                            valuePlaceholder="Description"
                            list={payloadsVal}
                            disabledInputs={isEdit && isReadOnly}
                            customNameValidator={(value, index) => validateUniqueTitle(value, index, true)}
                            customValueValidator={(value, index) => validateValue(value, index, true)}
                            useSelectableParamName={isQueryParams}
                            paramNameOptions={MOCK_QUERY_PARAM_OPTIONS}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <HeaderInput
                            label={isQueryParams ? 'Default Query Parameters' : 'Default Payload Parameters'}
                            register={register}
                            fields={defaultApiParameters}
                            namePrefix="defaultApiParameters"
                            append={append}
                            remove={remove}
                            type={HeaderType.DefaultApiParameters}
                            errors={errors}
                            control={control}
                            isQueryParams={isQueryParams}
                            isResponseField={true}
                            valuePlaceholder="Value"
                            list={watch('defaultApiParameters') as IHeaderValues[]}
                            disabledInputs={isEdit && isReadOnly}
                            customNameValidator={validateUniqueTitle}
                            customValueValidator={(value, index) => validateValue(value, index, false, 'Value')}
                            useSelectableParamName={isQueryParams}
                            paramNameOptions={MOCK_QUERY_PARAM_OPTIONS}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <HeaderInput
                            label="Response fields to promote as variables"
                            register={register}
                            fields={promotedVariables}
                            errors={errors}
                            namePrefix="promotedVariables"
                            append={append}
                            remove={remove}
                            type={HeaderType.PromotedVariables}
                            control={control}
                            isQueryParams={isQueryParams}
                            isResponseField={true}
                            valuePlaceholder="Description"
                            list={promotedVariablesVal}
                            disabledInputs={isEdit && isReadOnly}
                            useSelectableParamName={true}
                            paramNameOptions={MOCK_RESPONSE_FIELD_OPTIONS}
                        />
                    </div>
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

export const ApiConfigurationForm = (props: ApiConfigurationFormProps) => {
    const {
        isOpen,
        setOpen,
        handleSubmit,
        onHandleSubmit,
        watch,
        refetch,
        isEdit,
        isValid,
        isSaving,
        loadingSecrets,
        secrets,
    } = props;
    const [isTestOpen, setIsTestOpen] = useState(false);
    const apiNameForTest = watch('apiName') ?? '';
    const apiUrlForTest = watch('apiUrl') ?? '';
    const apiMethodForTest = watch('apiMethod') ?? '';
    const hasApiNameForTest = useMemo(() => apiNameForTest.trim().length > 0, [apiNameForTest]);
    const canTestApi = useMemo(
        () => hasApiNameForTest && apiUrlForTest.trim().length > 0 && apiMethodForTest.trim().length > 0,
        [hasApiNameForTest, apiUrlForTest, apiMethodForTest]
    );

    return (
        <>
            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpen}
                className="custom-drawer-content !w-[633px]"
                dismissible={false}
                headerIcon={<CloudCog />}
                header={isEdit ? 'Edit API Config' : 'New API Config'}
                footer={
                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="primary"
                                            size={'sm'}
                                            onClick={() => {
                                                setIsTestOpen(true);
                                                console.log('first');
                                            }}
                                            disabled={!canTestApi}
                                        >
                                            <Play className="h-4 w-4 mr-1" />
                                            Test API
                                        </Button>
                                    </TooltipTrigger>
                                    {!canTestApi && (
                                        <TooltipContent side="right" align="center">
                                            Please specify the API name, URL and the type to test the connection
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
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
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <FormBody {...props} />
                    </div>
                }
            />
            <TestApiModal
                open={isTestOpen}
                onOpenChange={setIsTestOpen}
                apiConfig={{
                    name: watch('apiName'),
                    url: watch('apiUrl'),
                    method: watch('apiMethod'),
                    pathParams: [],
                    queryParams: ['GET', 'DELETE'].includes(watch('apiMethod'))
                        ? watch('payloads').map(p => ({ ...p, value: '' }))
                        : [],
                    defaultQueryParams: ['GET', 'DELETE'].includes(watch('apiMethod'))
                        ? watch('defaultApiParameters')
                        : [],
                    bodyParams: ['PUT', 'POST', 'PATCH'].includes(watch('apiMethod'))
                        ? watch('payloads').map(p => ({ ...p, value: '' }))
                        : [],
                    headers: watch('apiHeaders'),
                    auth: watch('authorization'),
                }}
                loadingSecrets={loadingSecrets}
                secrets={secrets}
                onVaultRefetch={refetch}
            />
        </>
    );
};

export default ApiConfigurationForm;
