/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Input,
    Label,
    OptionModel,
    Select,
    VaultSelector,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    MultiSelect,
    Textarea,
    Checkbox,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateUrl, validateSpaces } from '@/lib/utils';
import { ILLMConfigForm, IProvider } from '@/models';
import { validateField } from '@/utils/validation';
import { Unplug } from 'lucide-react';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { ProviderType } from '@/enums';
import { REGION_LIST } from '@/constants';

interface LlmConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    providers: IProvider[];
    errors: FieldErrors<ILLMConfigForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    control: Control<ILLMConfigForm, any>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<ILLMConfigForm>;
    watch: UseFormWatch<ILLMConfigForm>;
    setValue: UseFormSetValue<ILLMConfigForm>;
    handleSubmit: UseFormHandleSubmit<ILLMConfigForm>;
    onHandleSubmit: (data: ILLMConfigForm) => void;
    refetch: () => void;
}

const VaultSecretSection = ({ provider, children }: { provider?: string; children: ReactNode }) => {
    if (provider === ProviderType.Bedrock) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
    }
    return <>{children}</>;
};

export const FormBody = (props: LlmConfigurationFormProps) => {
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
        if (Number.isNaN(watch('temperature') ?? 0)) {
            setValue('temperature', null);
        }
    }, [watch('temperature')]);

    const hasValues = useMemo(() => {
        return !!(
            watch('connectionName') &&
            watch('connectionName').trim() !== '' &&
            watch('provider') &&
            watch('provider').trim() !== '' &&
            watch('modelNameOption')
        );
    }, [watch('connectionName'), watch('modelNameOption'), watch('provider')]);

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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-y-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('connectionName', {
                        required: validateField('Connection Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'connection name'),
                    })}
                    placeholder="Enter Connection Name"
                    readOnly={isEdit && isReadOnly}
                    label="Name"
                    isDestructive={!!errors?.connectionName?.message}
                    supportiveText={errors?.connectionName?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        {...register('provider', { required: { value: true, message: 'Please select a provider' } })}
                        label="LLM Provider"
                        placeholder={providers.length > 0 ? 'Select LLM Provider' : 'No LLM Provider found'}
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
                            {...register('description', {
                                required: descriptionValidate.required,
                                minLength: descriptionValidate.minLength,
                                validate: value => validateSpaces(value, 'description'),
                            })}
                            placeholder="Enter your Description"
                            readOnly={isEdit && isReadOnly}
                            label="Description"
                            autoComplete="off"
                            rows={3}
                            isDestructive={!!errors?.description?.message}
                            supportiveText={errors?.description?.message}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSecretSection provider={watch('provider')}>
                            {watch('provider') !== ProviderType.Bedrock && (
                                <VaultSelector
                                    {...register('apiAuthorization', {
                                        required: { value: true, message: 'Please select an API key/vault' },
                                    })}
                                    label="API Key/Vault"
                                    placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('apiAuthorization')}
                                    isDestructive={!!errors?.apiAuthorization?.message}
                                    supportiveText={errors?.apiAuthorization?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            )}
                        </VaultSecretSection>
                    </div>
                    {watch('provider') === ProviderType.Bedrock && (
                        <>
                            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            {...register('useIamRole')}
                                            disabled={isEdit && isReadOnly}
                                            checked={!!watch('useIamRole')}
                                            onCheckedChange={val =>
                                                setValue('useIamRole', !!val, { shouldValidate: true })
                                            }
                                        />
                                        <div className="flex flex-col gap-y-1">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                                Use IAM Role
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300">
                                                AWS IAM Identity Center credentials will be used for authentication
                                            </p>
                                        </div>
                                    </div>
                                    <Select
                                        {...register('region', {
                                            required: { value: true, message: 'Please select a region' },
                                        })}
                                        label="Region"
                                        placeholder={REGION_LIST.length > 0 ? 'Select Region' : 'No Regions Found'}
                                        disabled={isEdit && isReadOnly}
                                        options={REGION_LIST?.map(region => ({
                                            name: region,
                                            value: region,
                                        }))}
                                        currentValue={watch('region') || ''}
                                        isDestructive={!!errors?.region?.message}
                                        supportiveText={errors?.region?.message}
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {!watch('useIamRole') && (
                                        <Input
                                            {...register('accessKey', {
                                                required: {
                                                    value: !watch('useIamRole'),
                                                    message: 'Please enter an access key',
                                                },
                                                validate: value => validateSpaces(value, 'access key'),
                                            })}
                                            placeholder="Enter Access Key"
                                            readOnly={isEdit && isReadOnly}
                                            label="Access Key ID"
                                            isDestructive={!!errors?.accessKey?.message}
                                            supportiveText={errors?.accessKey?.message}
                                        />
                                    )}
                                    {watch('provider') === ProviderType.Bedrock && !watch('useIamRole') && (
                                        <VaultSelector
                                            {...register('secretKey', {
                                                required: {
                                                    value: !watch('useIamRole'),
                                                    message: 'Please select a secret key/vault',
                                                },
                                            })}
                                            label="Secret Key"
                                            placeholder={
                                                secrets.length > 0
                                                    ? 'Select Secret Key/Vault'
                                                    : 'No Secret Key/Vault found'
                                            }
                                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                            options={secrets}
                                            currentValue={watch('secretKey') || ''}
                                            isDestructive={!!errors?.secretKey?.message}
                                            supportiveText={errors?.secretKey?.message}
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('temperature', { valueAsNumber: true })}
                                placeholder="Enter Temperature"
                                readOnly={isEdit && isReadOnly}
                                label="Temperature"
                                onInput={handleDecimalInputChange}
                            />
                            <Input
                                {...register('timeout', {
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Timeout must be >= 0' },
                                })}
                                placeholder="Enter timeout in seconds"
                                readOnly={isEdit && isReadOnly}
                                type="number"
                                label="Timeout (seconds)"
                                isDestructive={!!errors?.timeout?.message}
                                supportiveText={errors?.timeout?.message}
                            />
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <Input
                            {...register('baseUrl', {
                                validate: value => validateUrl(value, 'base URL'),
                            })}
                            placeholder="Enter Base URL"
                            isDestructive={!!errors?.baseUrl?.message}
                            supportiveText={errors?.baseUrl?.message}
                            readOnly={isEdit && isReadOnly}
                            label="Base URL (Optional)"
                        />
                    </div>
                </>
            )}
            {hasTestConnection && (
                <div
                    className={cn('col-span-1 sm:col-span-2', {
                        'absolute bottom-16 me-8': !hasValues,
                    })}
                    hidden
                >
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

export const LlmConfigurationForm = (props: LlmConfigurationFormProps) => {
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
            header={<h3>{isEdit ? 'Edit LLM Connection' : 'New LLM Connection'}</h3>}
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

export default LlmConfigurationForm;
