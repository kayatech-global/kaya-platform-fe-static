/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Input,
    OptionModel,
    Select,
    VaultSelector,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Checkbox,
    Label,
    MultiSelect,
    Textarea,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { REGION_LIST } from '@/constants';
import { ProviderType } from '@/enums';
import { cn, getSubmitButtonLabel, validateUrl, validateSpaces } from '@/lib/utils';
import { IProvider, ISLMForm } from '@/models';
import { validateField } from '@/utils/validation';
import { Unplug } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';

interface SlmConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    providers: IProvider[];
    errors: FieldErrors<ISLMForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    control: Control<ISLMForm, any>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<ISLMForm>;
    watch: UseFormWatch<ISLMForm>;
    setValue: UseFormSetValue<ISLMForm>;
    handleSubmit: UseFormHandleSubmit<ISLMForm>;
    onHandleSubmit: (data: ISLMForm) => void;
    refetch: () => void;
}

const VaultSecretSection = ({ provider, children }: { provider?: string; children: ReactNode }) => {
    if (provider === ProviderType.Bedrock) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
    }
    return <>{children}</>;
};

export const FormBody = (props: SlmConfigurationFormProps) => {
    const {
        register,
        watch,
        setValue,
        refetch,
        providers,
        secrets,
        errors,
        isEdit,
        hasTestConnection = true,
        loadingSecrets,
        control,
    } = props;
    const [oldValue, setOldValue] = useState<string>('');

    useEffect(() => {
        if (watch('provider') !== '' && isEdit && oldValue === '') {
            setOldValue(watch('provider'));
        } else if (watch('provider') !== '' && isEdit && oldValue !== '') {
            setValue('modelNameOption', undefined);
        } else if (!isEdit) {
            setValue('modelNameOption', undefined);
        }
    }, [watch('provider'), isEdit]);

    useEffect(() => {
        if (Number.isNaN(watch('configurations.temperature') ?? 0)) {
            setValue('configurations.temperature', null);
        }
    }, [watch('configurations.temperature')]);

    const hasValues = useMemo(() => {
        return !!(
            watch('name') &&
            watch('name').trim() !== '' &&
            watch('provider') &&
            watch('provider').trim() !== '' &&
            watch('modelNameOption')
        );
    }, [watch('name'), watch('modelNameOption'), watch('provider')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const selectedModels = useMemo(() => {
        if (watch('provider') && watch('provider').trim() !== '') {
            const provider = providers?.find(x => x.value === watch('provider').trim());
            if (provider) {
                return provider.models?.map(x => ({ label: x.value, value: x.value }));
            }
        }
        return [];
    }, [watch('provider')]);

    const handleDecimalInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        value = value.replace(/[^0-9.]/g, '');
        const dotCount = (value.match(/\./g) || []).length;
        if (dotCount > 1) {
            const parts = value.split('.');
            value = parts.slice(0, 2).join('.');
        }
        if (Number.parseFloat(value) > 1) {
            value = '1';
        }
        if (Number.parseFloat(value) < 0) {
            value = '0';
        }
        if (value.includes('.')) {
            const parts = value.split('.');
            parts[1] = parts[1].slice(0, 1);
            value = parts.join('.');
        }
        event.target.value = value;
    };

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        event.target.value = value.replace(/\D/g, '');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-y-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    placeholder="Enter Connection Name"
                    readOnly={isEdit && isReadOnly}
                    label="Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        {...register('provider', { required: { value: true, message: 'Please select a provider' } })}
                        label="Provider"
                        placeholder={providers.length > 0 ? 'Select SLM Provider' : 'No SLM Provider found'}
                        disabled={providers.length === 0 || (isEdit && isReadOnly)}
                        options={providers?.map(provider => ({ name: provider.value, value: provider.value }))}
                        currentValue={watch('provider')}
                        isDestructive={!!errors?.provider?.message}
                        supportiveText={errors?.provider?.message}
                    />
                    <div className="flex flex-col items-start gap-y-[6px] w-full">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Model Name</Label>
                        <div className="relative flex items-center w-full">
                            <Controller
                                name="modelNameOption"
                                control={control}
                                rules={{ required: { value: true, message: 'Please select or enter a model' } }}
                                render={({ field }) => (
                                    <MultiSelect
                                        {...field}
                                        options={selectedModels}
                                        isDestructive={!!errors?.modelNameOption?.message}
                                        value={watch('modelNameOption') || null}
                                        menuPortalTarget={document.body}
                                        isClearable
                                        placeholder="Select or Enter Model"
                                        onChange={selectedOptions => field.onChange(selectedOptions)}
                                        menuClass="!z-50"
                                        menuPortalClass="!z-50 pointer-events-auto"
                                        isDisabled={(isEdit && isReadOnly) || selectedModels?.length === 0}
                                        isCreatable={true}
                                        onCreateOption={value =>
                                            setValue(
                                                'modelNameOption',
                                                { label: value, value },
                                                { shouldValidate: true }
                                            )
                                        }
                                    />
                                )}
                            />
                        </div>
                        {!!errors?.modelNameOption?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500">
                                {errors?.modelNameOption?.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {hasValues && (
                <>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <Textarea
                            {...register('configurations.description', {
                                required: descriptionValidate.required,
                                minLength: descriptionValidate.minLength,
                                validate: value => validateSpaces(value, 'description'),
                            })}
                            placeholder="Enter your Description"
                            readOnly={isEdit && isReadOnly}
                            label="Description"
                            autoComplete="off"
                            rows={3}
                            isDestructive={!!errors?.configurations?.description?.message}
                            supportiveText={errors?.configurations?.description?.message}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2 flex gap-4">
                        <Input
                            {...register('configurations.baseUrl', {
                                required: {
                                    value: true,
                                    message: 'Please enter a base URL',
                                },
                                validate: value => validateUrl(value, 'base URL'),
                            })}
                            placeholder="Enter Base URL"
                            readOnly={isEdit && isReadOnly}
                            label="Base URL (Optional)"
                            isDestructive={!!errors?.configurations?.baseUrl?.message}
                            supportiveText={errors?.configurations?.baseUrl?.message}
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`flex items-center gap-2 flex-shrink-0 ${
                                            errors?.configurations?.baseUrl?.message ? 'mt-1' : 'mt-6'
                                        }`}
                                    >
                                        <Checkbox
                                            id="custom-runtime"
                                            checked={watch('configurations.customRuntime')}
                                            onCheckedChange={checked => {
                                                setValue('configurations.customRuntime', checked === true);
                                            }}
                                        />
                                        <Label
                                            className="text-sm font-medium text-gray-700 dark:text-gray-100"
                                            htmlFor="custom-runtime"
                                        >
                                            Custom Runtime
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" align="center">
                                    Enables support for environments that host various multiple models on a single
                                    endpoint.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSecretSection provider={watch('provider')}>
                            <VaultSelector
                                {...register('configurations.apiAuthorization')}
                                label="API Key/Vault"
                                placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('configurations.apiAuthorization')}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                hasClear={true}
                                onClear={() => setValue('configurations.apiAuthorization', '')}
                                onRefetch={() => refetch()}
                            />
                            {watch('provider') === ProviderType.Bedrock && (
                                <VaultSelector
                                    {...register('configurations.secretKey', {
                                        required: { value: true, message: 'Please select a secret key/vault' },
                                    })}
                                    label="Secret Key"
                                    placeholder={
                                        secrets.length > 0 ? 'Select Secret Key/Vault' : 'No Secret Key/Vault found'
                                    }
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('configurations.secretKey')}
                                    isDestructive={!!errors?.configurations?.secretKey?.message}
                                    supportiveText={errors?.configurations?.secretKey?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            )}
                        </VaultSecretSection>
                    </div>
                    {watch('provider') === ProviderType.Bedrock && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    {...register('configurations.accessKey', {
                                        required: validateField('Access Key', { required: { value: true } }).required,
                                        validate: value => validateSpaces(value, 'access key'),
                                    })}
                                    placeholder="Enter Access Key"
                                    readOnly={isEdit && isReadOnly}
                                    label="Access Key ID"
                                    isDestructive={!!errors?.configurations?.accessKey?.message}
                                    supportiveText={errors?.configurations?.accessKey?.message}
                                />
                                <Select
                                    {...register('configurations.region', {
                                        required: { value: true, message: 'Please select a region' },
                                    })}
                                    label="Region"
                                    placeholder="Select Region"
                                    disabled={isEdit && isReadOnly}
                                    options={REGION_LIST?.map(region => ({
                                        name: region,
                                        value: region,
                                    }))}
                                    currentValue={watch('configurations.region')}
                                    isDestructive={!!errors?.configurations?.region?.message}
                                    supportiveText={errors?.configurations?.region?.message}
                                />
                            </div>
                        </div>
                    )}
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('configurations.temperature', { valueAsNumber: true })}
                                placeholder="Enter Temperature"
                                readOnly={isEdit && isReadOnly}
                                label="Temperature"
                                onInput={handleDecimalInputChange}
                            />
                            <Input
                                {...register('configurations.tokenLimit', {
                                    valueAsNumber: true,
                                    required: validateField('Token limit', { required: { value: true } }).required,
                                    min: { value: 1, message: 'Minimum value should be 1' },
                                })}
                                type="number"
                                placeholder="Enter token limit"
                                readOnly={isEdit && isReadOnly}
                                label="Token Limit"
                                isDestructive={!!errors?.configurations?.tokenLimit?.message}
                                supportiveText={errors?.configurations?.tokenLimit?.message}
                                onInput={handleInputChange}
                            />
                        </div>
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

export const SlmConfigurationForm = (props: SlmConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Unplug />}
            header={isEdit ? 'Edit SLM Connection' : 'New SLM Connection'}
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
                    <FormBody {...props} />
                </div>
            }
        />
    );
};

export default SlmConfigurationForm;
