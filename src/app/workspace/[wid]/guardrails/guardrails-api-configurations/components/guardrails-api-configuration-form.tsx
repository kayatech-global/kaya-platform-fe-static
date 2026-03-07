import {
    Button,
    Input,
    OptionModel,
    Select,
    VaultSelector,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    MultiSelect,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { AuthorizationType } from '@/enums';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { IGuardrailConfigForm } from '@/models';
import { validateField } from '@/utils/validation';
import { CloudCog } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';

interface GuardrailsApiConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IGuardrailConfigForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IGuardrailConfigForm>;
    watch: UseFormWatch<IGuardrailConfigForm>;
    setValue: UseFormSetValue<IGuardrailConfigForm>;
    apiHeaders: FieldArrayWithId<IGuardrailConfigForm, 'apiHeaders', 'id'>[];
    payloads: FieldArrayWithId<IGuardrailConfigForm, 'payloads', 'id'>[];
    remove: (index: number, type: number) => void;
    append: (type: number) => void;
    control: Control<IGuardrailConfigForm, unknown>;
    handleSubmit: UseFormHandleSubmit<IGuardrailConfigForm>;
    onHandleSubmit: (data: IGuardrailConfigForm) => void;
    updatePayloadDataType: () => void;
    refetch: () => void;
    promotedVariables: FieldArrayWithId<IGuardrailConfigForm, 'promotedVariables', 'id'>[];
    updatePromotedVariablesDataType: () => void;
}

const GUARDRAIL_PROVIDER_OPTIONS: Record<string, OptionModel[]> = {
    'Sensitive Data Detection': [
        { value: 'Google DLP', name: 'Google DLP' },
        { value: 'Guardrail AI', name: 'Guardrail AI' },
        { value: 'Amazon Comprehend', name: 'Amazon Comprehend' },
        { value: 'Azure AI Language', name: 'Azure AI Language' },
    ],
    'Content Moderation': [
        { value: 'Detoxify (UnitoryAI)', name: 'Detoxify (UnitoryAI)' },
        { value: 'Open AI Moderation', name: 'Open AI Moderation' },
        { value: 'Google Perspective', name: 'Google Perspective' },
        { value: 'Azure AI Content Safety', name: 'Azure AI Content Safety' },
    ],
    'Prompt Injection Prevention': [{ value: 'Azure AI Content Safety', name: 'Azure AI Content Safety' }],
    'Hallucination Protection': [{ value: 'Azure AI Content Safety', name: 'Azure AI Content Safety' }],
};

// Default empty options
const DEFAULT_PROVIDER_OPTIONS: OptionModel[] = [];

export const GuardrailsFormBody = (props: GuardrailsApiConfigurationFormProps) => {
    const { register, watch, setValue, loadingSecrets, errors, secrets, isEdit, refetch } = props;

    const descriptionValidate = validateField('description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    // Get provider options based on selected guardrail type
    const providerOptions = useMemo(() => {
        const selectedGuardrailType = watch('guardrailType');
        return GUARDRAIL_PROVIDER_OPTIONS[selectedGuardrailType] || DEFAULT_PROVIDER_OPTIONS;
    }, [watch('guardrailType')]);

    useEffect(() => {
        setValue('guardrailApiProvider', '');
    }, [watch('guardrailType')]);
    // inside GuardrailsFormBody
    const renderProviderFields = (provider: string) => {
        switch (provider) {
            case 'Google DLP':
                return (
                    <>
                        <Input
                            {...register('projectId', {
                                required: { value: true, message: 'Please enter a Project ID' },
                                validate: value => validateSpaces(value, 'Project ID'),
                            })}
                            placeholder="Enter your Project ID"
                            readOnly={isEdit && isReadOnly}
                            label="Project ID"
                            isDestructive={!!errors?.projectId?.message}
                            supportiveText={errors?.projectId?.message}
                        />
                        <Input
                            {...register('location', {
                                required: { value: true, message: 'Please enter a Location' },
                                validate: value => validateSpaces(value, 'Location'),
                            })}
                            placeholder="Enter your Location"
                            readOnly={isEdit && isReadOnly}
                            label="Location"
                            isDestructive={!!errors?.location?.message}
                            supportiveText={errors?.location?.message}
                        />
                    </>
                );
            case 'Guardrail AI':
                return (
                    <Input
                        {...register('guardName', {
                            required: { value: true, message: 'Please enter a Guard Name' },
                            validate: value => validateSpaces(value, 'Guard Name'),
                        })}
                        placeholder="Enter your Guard Name"
                        readOnly={isEdit && isReadOnly}
                        label="Guard Name"
                        isDestructive={!!errors?.guardName?.message}
                        supportiveText={errors?.guardName?.message}
                    />
                );
            case 'Amazon Comprehend':
                return (
                    <>
                        <Input
                            {...register('region', {
                                required: { value: true, message: 'Please enter a Region' },
                            })}
                            placeholder="Enter your Region"
                            readOnly={isEdit && isReadOnly}
                            label="Region"
                            isDestructive={!!errors?.region?.message}
                            supportiveText={errors?.region?.message}
                        />
                        <VaultSelector
                            {...register('awsAccessKeyId', {
                                required: { value: true, message: 'Please select AWS Access Key ID' },
                            })}
                            placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                            options={secrets}
                            label="AWS Access Key ID"
                            currentValue={watch('awsAccessKeyId')}
                            isDestructive={!!errors?.awsAccessKeyId?.message}
                            supportiveText={errors?.awsAccessKeyId?.message}
                            disableCreate={isEdit && isReadOnly}
                            loadingSecrets={loadingSecrets}
                            onRefetch={() => refetch()}
                        />
                        <VaultSelector
                            {...register('awsSecretAccessKey', {
                                required: { value: true, message: 'Please select AWS Secret Access Key' },
                            })}
                            placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                            options={secrets}
                            label="AWS Secret Access Key"
                            currentValue={watch('awsSecretAccessKey')}
                            isDestructive={!!errors?.awsSecretAccessKey?.message}
                            supportiveText={errors?.awsSecretAccessKey?.message}
                            disableCreate={isEdit && isReadOnly}
                            loadingSecrets={loadingSecrets}
                            onRefetch={() => refetch()}
                        />
                    </>
                );
            case 'Azure AI Language':
            case 'Azure AI Content Safety':
                return (
                    <Input
                        {...register('resourceName', {
                            required: { value: true, message: 'Please enter a Resource Name' },
                            validate: value => validateSpaces(value, 'Resource Name'),
                        })}
                        placeholder="Enter your Resource Name"
                        readOnly={isEdit && isReadOnly}
                        label="Resource Name"
                        isDestructive={!!errors?.resourceName?.message}
                        supportiveText={errors?.resourceName?.message}
                    />
                );
            case 'Open AI Moderation':
                return (
                    <Input
                        {...register('organizationName', {
                            required: { value: true, message: 'Please enter Organization Name' },
                            validate: value => validateSpaces(value, 'Organization Name'),
                        })}
                        placeholder="Enter your Organization Name"
                        readOnly={isEdit && isReadOnly}
                        label="Organization Name"
                        isDestructive={!!errors?.organizationName?.message}
                        supportiveText={errors?.organizationName?.message}
                    />
                );
            // Detoxify & Google Perspective → no extra fields
            default:
                return null;
        }
    };

    const authOptions = useMemo(() => {
        const selectedProvider = watch('guardrailApiProvider');

        // Define authentication options for each provider
        const authOptionsMap: Record<string, AuthorizationType[]> = {
            'Google DLP': [AuthorizationType.BasicAuth, AuthorizationType.BearerToken],
            'Guardrail AI': [AuthorizationType.BearerToken, AuthorizationType.APIKey],
            'Azure AI Language': [AuthorizationType.BearerToken, AuthorizationType.APIKey],
            'Detoxify (UnitoryAI)': [AuthorizationType.BearerToken, AuthorizationType.APIKey],
            'Open AI Moderation': [AuthorizationType.NoAuthorization, AuthorizationType.APIKey],
            'Google Perspective': [AuthorizationType.BearerToken, AuthorizationType.APIKey],
            'Azure AI Content Safety': [AuthorizationType.BearerToken, AuthorizationType.APIKey],
        };

        // Get allowed auth types for the selected provider, or all types for unknown providers
        const allowedAuthTypes =
            selectedProvider && authOptionsMap[selectedProvider]
                ? authOptionsMap[selectedProvider]
                : [
                      AuthorizationType.BasicAuth,
                      AuthorizationType.BearerToken,
                      AuthorizationType.APIKey,
                      AuthorizationType.SSO,
                  ];

        // Return the options based on allowed auth types
        return [
            { value: AuthorizationType.BasicAuth, name: 'Basic Auth' },
            { value: AuthorizationType.BearerToken, name: 'Bearer Token' },
            { value: AuthorizationType.APIKey, name: 'API Key' },
            { value: AuthorizationType.SSO, name: 'Single Sign-On' },
        ].filter(option => allowedAuthTypes.includes(option.value));
    }, [watch('guardrailApiProvider')]);

    useEffect(() => {
        if (watch('authorization.authType') === AuthorizationType.BasicAuth) {
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

    const hasGuardrailApiProvider = useMemo(() => {
        return !!(watch('guardrailApiProvider') && watch('guardrailApiProvider').trim() !== '');
    }, [watch('guardrailApiProvider')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const gridCol = useMemo(() => {
        if (watch('authorization.authType') === AuthorizationType.BearerToken) {
            return 'grid-cols-1 sm:grid-cols-2';
        }
        return 'grid-cols-1 sm:grid-cols-1';
    }, [watch('authorization.authType')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('guardrailType', {
                        required: { value: true, message: 'Please select Guardrails Type' },
                    })}
                    label="Guardrail Type"
                    placeholder="Select your Guardrails Type"
                    className="cursor-pointer"
                    disabled={isEdit && isReadOnly}
                    options={[
                        { value: 'Sensitive Data Detection', name: 'Sensitive Data Detection' },
                        { value: 'Content Moderation', name: 'Content Moderation' },
                        { value: 'Prompt Injection Prevention', name: 'Prompt Injection Prevention' },
                        { value: 'Hallucination Protection', name: 'Hallucination Protection' },
                    ]}
                    currentValue={watch('guardrailType')}
                    isDestructive={!!errors?.guardrailType?.message}
                    supportiveText={errors?.guardrailType?.message}
                />
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
                <Select
                    {...register('guardrailApiProvider', {
                        required: { value: true, message: 'Please select Guardrails API Provider' },
                    })}
                    label="Guardrail API Provider"
                    placeholder="Select your Guardrails API Provider"
                    className="cursor-pointer"
                    disabled={(isEdit && isReadOnly) || !watch('guardrailType')}
                    options={providerOptions}
                    currentValue={watch('guardrailApiProvider') || ''}
                    isDestructive={!!errors?.guardrailApiProvider?.message}
                    supportiveText={errors?.guardrailApiProvider?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <p className="mb-3">Requirements to connect</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {hasGuardrailApiProvider
                        ? "You've entered the Guardrail Type and API Provider. To establish the connection successfully, Please complete the fields below with accurate values"
                        : "Please enter the Guardrail Type and API Provider to display the form specific to your choice. If nothing is visible here yet, it's because no Guardrails API Name has been given."}
                </p>
            </div>
            {hasGuardrailApiProvider && (
                <>
                    <div className="col-span-1 sm:col-span-2 grid gap-4">
                        {renderProviderFields(watch('guardrailApiProvider'))}
                    </div>
                    {hasGuardrailApiProvider && watch('guardrailApiProvider') !== 'Amazon Comprehend' && (
                        <div className="col-span-1 sm:col-span-2">
                            <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                                Authentication
                            </span>
                            <div className={`grid gap-4 mt-2 ${gridCol}`}>
                                <Select
                                    {...register('authorization.authType', {
                                        required: { value: true, message: 'Please select Authentication' },
                                    })}
                                    placeholder="Select your Authentication"
                                    options={authOptions}
                                    disabled={isEdit && isReadOnly}
                                    currentValue={watch('authorization.authType')}
                                    isDestructive={!!errors?.authorization?.authType?.message}
                                    supportiveText={errors?.authorization?.authType?.message}
                                />
                                {(watch('authorization.authType') === AuthorizationType.BasicAuth ||
                                    watch('authorization.authType') === AuthorizationType.APIKey) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {watch('authorization.authType') === AuthorizationType.BasicAuth && (
                                            <>
                                                <Input
                                                    {...register('authorization.meta.username', {
                                                        required: validateField('Username', {
                                                            required: { value: true },
                                                        }).required,
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
                                        {watch('authorization.authType') === AuthorizationType.APIKey && (
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
                    )}
                </>
            )}
        </div>
    );
};

export const GuardrailsApiConfigurationForm = (props: GuardrailsApiConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<CloudCog />}
            header={isEdit ? 'Edit Guardrails API Config' : 'New Guardrails API Config'}
            footer={
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        {/* <Button variant="secondary" size={'sm'} disabled>
                            Test Connection
                        </Button> */}
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
                    <GuardrailsFormBody {...props} />
                </div>
            }
        />
    );
};

export default GuardrailsApiConfigurationForm;
