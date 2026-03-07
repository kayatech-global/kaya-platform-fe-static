import { ReactNode, useEffect, useMemo, useState } from 'react';
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
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { AuthenticationType, GuardrailModelInputType, GuardrailModelProviderType, ProviderType } from '@/enums';
import { cn, getSubmitButtonLabel, validateUrl, validateSpaces, validateUrlWithPort } from '@/lib/utils';
import { IGuardrailModelConfig } from '@/models';
import { descriptionValidate, nameValidate } from '@/utils/validation';
import { ShieldBan } from 'lucide-react';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import {
    GUARDRAIL_ANTHROPIC_MODEL_NAME_OPTIONS,
    GUARDRAIL_GOOGLE_MODEL_NAME_OPTIONS,
    GUARDRAIL_MODEL_NAME_OPTIONS,
    GUARDRAIL_MODEL_PROVIDER_OPTIONS,
    GUARDRAIL_MODEL_TYPE_OPTIONS,
} from '@/constants';

interface GuardrailsModelConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IGuardrailModelConfig>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    control: Control<IGuardrailModelConfig, unknown>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IGuardrailModelConfig>;
    watch: UseFormWatch<IGuardrailModelConfig>;
    setValue: UseFormSetValue<IGuardrailModelConfig>;
    handleSubmit: UseFormHandleSubmit<IGuardrailModelConfig>;
    onHandleSubmit: (data: IGuardrailModelConfig) => void;
    refetch: () => void;
}

// Define props interface for provider-specific field components
interface ProviderFieldsProps extends GuardrailsModelConfigurationFormProps {
    isReadOnly: boolean;
    inputType?: GuardrailModelInputType;
    options?: OptionModel[];
}

const VaultSecretSection = ({ provider, children }: { provider?: string; children: ReactNode }) => {
    if (provider === ProviderType.Bedrock) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
    }
    return <>{children}</>;
};

const GuardrailInput: React.FC<ProviderFieldsProps> = ({
    errors,
    isEdit,
    isReadOnly,
    secrets,
    loadingSecrets,
    inputType,
    options,
    register,
    watch,
    refetch,
}) => (
    <>
        {inputType === GuardrailModelInputType.ANALYZER_SERVICE_HOST && (
            <Input
                {...register('configurations.analyzerServiceHost', {
                    required: {
                        value: true,
                        message: 'Please enter an analyzer service host',
                    },
                    validate: value => validateUrlWithPort(value, 'analyzer service host'),
                })}
                label="Analyzer Service Host"
                placeholder="Enter an Analyzer Service Host (Port is Optional)"
                readOnly={isEdit && isReadOnly}
                type="text"
                isDestructive={!!errors?.configurations?.analyzerServiceHost?.message}
                supportiveText={errors?.configurations?.analyzerServiceHost?.message}
            />
        )}

        {inputType === GuardrailModelInputType.ANONYMIZER_SERVICE_HOST && (
            <Input
                {...register('configurations.anonymizerServiceHost', {
                    required: {
                        value: true,
                        message: 'Please enter an anonymizer service host',
                    },
                    validate: value => validateUrlWithPort(value, 'anonymizer service host'),
                })}
                label="Anonymizer Service Host"
                placeholder="Enter an Anonymizer Service Host (Port is Optional)"
                readOnly={isEdit && isReadOnly}
                type="text"
                isDestructive={!!errors?.configurations?.anonymizerServiceHost?.message}
                supportiveText={errors?.configurations?.anonymizerServiceHost?.message}
            />
        )}

        {inputType === GuardrailModelInputType.API_KEY && (
            <VaultSelector
                {...register('configurations.apiKey', {
                    required: { value: true, message: 'Please select an API key/vault' },
                })}
                label="API Key/Vault"
                placeholder={secrets.length > 0 ? 'Select API key/vault' : 'No API key/vault found'}
                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                options={secrets}
                currentValue={watch('configurations.apiKey')}
                isDestructive={!!errors?.configurations?.apiKey?.message}
                supportiveText={errors?.configurations?.apiKey?.message}
                disableCreate={isEdit && isReadOnly}
                loadingSecrets={loadingSecrets}
                onRefetch={() => refetch()}
            />
        )}

        {inputType === GuardrailModelInputType.PROJECT_ID && (
            <Input
                {...register('configurations.projectId', {
                    required: { value: true, message: 'Please enter a Project ID' },
                    validate: value => validateSpaces(value, 'Project ID'),
                })}
                placeholder="Enter your Project ID"
                readOnly={isEdit && isReadOnly}
                label="Project ID"
                isDestructive={!!errors?.configurations?.projectId?.message}
                supportiveText={errors?.configurations?.projectId?.message}
            />
        )}

        {inputType === GuardrailModelInputType.LOCATION && (
            <Input
                {...register('configurations.location', {
                    required: { value: true, message: 'Please enter a Location' },
                    validate: value => validateSpaces(value, 'Location'),
                })}
                placeholder="Enter your Location"
                readOnly={isEdit && isReadOnly}
                label="Location"
                isDestructive={!!errors?.configurations?.location?.message}
                supportiveText={errors?.configurations?.location?.message}
            />
        )}

        {inputType === GuardrailModelInputType.MODEL_NAME && (
            <Select
                {...register('configurations.modelName', {
                    required: { value: true, message: 'Please select a model name' },
                })}
                label="Model Name"
                placeholder="Please select a model name"
                disabled={isEdit && isReadOnly}
                options={options ?? []}
                currentValue={watch('configurations.modelName')}
                isDestructive={!!errors?.configurations?.modelName?.message}
                supportiveText={errors?.configurations?.modelName?.message}
            />
        )}

        {inputType === GuardrailModelInputType.AUTHENTICATION_TYPE && (
            <Select
                {...register('configurations.authenticationType', {
                    required: { value: true, message: 'Please select authentication' },
                })}
                placeholder="Select your Authentication"
                options={[{ value: AuthenticationType.BearerToken, name: 'Bearer Token' }]}
                disabled={isEdit && isReadOnly}
                currentValue={watch('configurations.authenticationType')}
                isDestructive={!!errors?.configurations?.authenticationType?.message}
                supportiveText={errors?.configurations?.authenticationType?.message}
            />
        )}

        {inputType === GuardrailModelInputType.TOKEN && (
            <VaultSelector
                {...register('configurations.meta.token', {
                    required: { value: true, message: 'Please select vault key' },
                })}
                placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                options={secrets}
                currentValue={watch('configurations.meta.token') || ''}
                isDestructive={!!errors?.configurations?.meta?.token?.message}
                supportiveText={errors?.configurations?.meta?.token?.message}
                disableCreate={isEdit && isReadOnly}
                loadingSecrets={loadingSecrets}
                onRefetch={() => refetch()}
            />
        )}

        {inputType === GuardrailModelInputType.BASE_URL && (
            <Input
                {...register('configurations.baseUrl', {
                    required: {
                        value: true,
                        message: 'Please enter a Base URL',
                    },
                    validate: value => validateUrl(value, 'Base URL'),
                })}
                placeholder="Enter your Base URL"
                readOnly={isEdit && isReadOnly}
                label="Base URL"
                isDestructive={!!errors?.configurations?.baseUrl?.message}
                supportiveText={errors?.configurations?.baseUrl?.message}
            />
        )}
    </>
);

// Component for Microsoft Presidio fields
const MicrosoftPresidioFields: React.FC<ProviderFieldsProps> = props => (
    <>
        <div className="col-span-1 sm:col-span-2">
            <GuardrailInput {...props} inputType={GuardrailModelInputType.ANALYZER_SERVICE_HOST} />
        </div>
        <div className="col-span-1 sm:col-span-2">
            <GuardrailInput {...props} inputType={GuardrailModelInputType.ANONYMIZER_SERVICE_HOST} />
        </div>
    </>
);

// Component for Vertex AI Content Moderation fields
const VertexAIContentModerationFields: React.FC<ProviderFieldsProps> = props => {
    const gridCol = useMemo(() => {
        return props?.watch('configurations.authenticationType') === AuthenticationType.BearerToken
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-1';
    }, [props?.watch('configurations.authenticationType')]);

    return (
        <>
            <GuardrailInput {...props} inputType={GuardrailModelInputType.PROJECT_ID} />
            <GuardrailInput {...props} inputType={GuardrailModelInputType.LOCATION} />
            <div className="col-span-1 sm:col-span-2">
                <GuardrailInput
                    {...props}
                    inputType={GuardrailModelInputType.MODEL_NAME}
                    options={GUARDRAIL_MODEL_NAME_OPTIONS}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                    Authentication
                </span>
                <div className={cn('grid gap-4 mt-2', gridCol)}>
                    <GuardrailInput {...props} inputType={GuardrailModelInputType.AUTHENTICATION_TYPE} />
                    {props?.watch('configurations.authenticationType') === AuthenticationType.BearerToken && (
                        <GuardrailInput {...props} inputType={GuardrailModelInputType.TOKEN} />
                    )}
                </div>
            </div>
        </>
    );
};

// Component for Anthropic-Claude 3 fields
const AnthropicClaude3Fields: React.FC<ProviderFieldsProps> = props => (
    <>
        <div className="col-span-1 sm:col-span-2">
            <GuardrailInput {...props} inputType={GuardrailModelInputType.BASE_URL} />
        </div>
        <div className="col-span-1 sm:col-span-2">
            <GuardrailInput
                {...props}
                inputType={GuardrailModelInputType.MODEL_NAME}
                options={GUARDRAIL_ANTHROPIC_MODEL_NAME_OPTIONS}
            />
        </div>
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <VaultSecretSection provider={props?.watch('provider')}>
                <GuardrailInput {...props} inputType={GuardrailModelInputType.API_KEY} />
            </VaultSecretSection>
        </div>
    </>
);

// Component for Google Deepmind/Gemini fields
const GoogleDeepmindGeminiFields: React.FC<ProviderFieldsProps> = props => {
    const gridCol = useMemo(() => {
        return props?.watch('configurations.authenticationType') === AuthenticationType.BearerToken
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-1';
    }, [props?.watch('configurations.authenticationType')]);
    return (
        <>
            <GuardrailInput {...props} inputType={GuardrailModelInputType.PROJECT_ID} />
            <GuardrailInput {...props} inputType={GuardrailModelInputType.LOCATION} />
            <div className="col-span-1 sm:col-span-2">
                <GuardrailInput
                    {...props}
                    inputType={GuardrailModelInputType.MODEL_NAME}
                    options={GUARDRAIL_GOOGLE_MODEL_NAME_OPTIONS}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <span className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-100">
                    Authentication
                </span>
                <div className={cn('grid gap-4 mt-2', gridCol)}>
                    <GuardrailInput {...props} inputType={GuardrailModelInputType.AUTHENTICATION_TYPE} />
                    {props?.watch('configurations.authenticationType') === AuthenticationType.BearerToken && (
                        <GuardrailInput {...props} inputType={GuardrailModelInputType.TOKEN} />
                    )}
                </div>
            </div>
        </>
    );
};

export const GuardrailsFormBody = (props: GuardrailsModelConfigurationFormProps) => {
    const { errors, isEdit, register, watch, setValue } = props;
    const [oldValue, setOldValue] = useState<string>('');

    useEffect(() => {
        if (watch('guardrailType') !== '' && isEdit && oldValue === '') {
            setOldValue(watch('guardrailType'));
        } else if (watch('guardrailType') !== '' && isEdit && oldValue !== '') {
            setValue('provider', GuardrailModelProviderType.EMPTY);
        } else if (!isEdit) {
            setValue('provider', GuardrailModelProviderType.EMPTY);
        }
    }, [watch('guardrailType'), isEdit]);

    // Get provider options based on selected guardrail type
    const providerOptions = useMemo(() => {
        return GUARDRAIL_MODEL_PROVIDER_OPTIONS?.find(x => x.type === watch('guardrailType'))?.options || [];
    }, [watch('guardrailType')]);

    const hasProvider = useMemo(() => {
        return !!(watch('provider') && watch('provider').trim() !== '');
    }, [watch('provider')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    // Render appropriate fields based on selected provider
    const providerSpecificField = useMemo(() => {
        const provider = watch('provider');

        switch (provider) {
            case GuardrailModelProviderType.MICROSOFT_PRESIDIO:
                return <MicrosoftPresidioFields {...props} isReadOnly={isReadOnly} />;
            case GuardrailModelProviderType.VERTEX_AI_CONTENT_MODERATION:
                return <VertexAIContentModerationFields {...props} isReadOnly={isReadOnly} />;
            case GuardrailModelProviderType.ANTHROPIC_CLAUDE_3:
                return <AnthropicClaude3Fields {...props} isReadOnly={isReadOnly} />;
            case GuardrailModelProviderType.GOOGLE_DEEPMIND_GEMINI:
                return <GoogleDeepmindGeminiFields {...props} isReadOnly={isReadOnly} />;
            default:
                return null;
        }
    }, [watch('provider'), isReadOnly, props]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: nameValidate.required,
                        minLength: nameValidate.minLength,
                        maxLength: nameValidate.maxLength,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    label="Name"
                    placeholder="Enter a Name"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('guardrailType', {
                        required: { value: true, message: 'Please select a guardrail type' },
                    })}
                    label="Guardrail Type"
                    placeholder="Select a Guardrail Type"
                    disabled={isEdit && isReadOnly}
                    options={GUARDRAIL_MODEL_TYPE_OPTIONS}
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
                        maxLength: descriptionValidate.maxLength,
                        validate: value => validateSpaces(value, 'description'),
                    })}
                    label="Description"
                    placeholder="Enter a Description"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('provider', {
                        required: { value: true, message: 'Please select a guardrail model provider' },
                    })}
                    label="Guardrail Model Provider"
                    placeholder="Select a Guardrail Model Provider"
                    disabled={(isEdit && isReadOnly) || providerOptions.length === 0}
                    options={providerOptions}
                    currentValue={watch('provider')}
                    isDestructive={!!errors?.provider?.message}
                    supportiveText={errors?.provider?.message}
                />
            </div>

            {hasProvider && providerSpecificField}
        </div>
    );
};

export const GuardrailsModelConfigurationForm = (props: GuardrailsModelConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<ShieldBan />}
            header={isEdit ? 'Edit Guardrail Model Configuration' : 'New Guardrail Model Configuration'}
            footer={
                <div className="flex gap-2 justify-end">
                    <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
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
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <GuardrailsFormBody {...props} />
                </div>
            }
        />
    );
};

export default GuardrailsModelConfigurationForm;
