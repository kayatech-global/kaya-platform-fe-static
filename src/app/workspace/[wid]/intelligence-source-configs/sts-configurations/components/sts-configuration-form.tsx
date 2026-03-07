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
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { ISTSConfigForm, IProvider } from '@/models';
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

interface StsConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    providers: IProvider[];
    errors: FieldErrors<ISTSConfigForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    control: Control<ISTSConfigForm, any>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<ISTSConfigForm>;
    watch: UseFormWatch<ISTSConfigForm>;
    setValue: UseFormSetValue<ISTSConfigForm>;
    handleSubmit: UseFormHandleSubmit<ISTSConfigForm>;
    onHandleSubmit: (data: ISTSConfigForm) => void;
    refetch: () => void;
}

interface VaultSecretSectionProps {
    provider?: string;
    children: ReactNode;
}

const VaultSecretSection = ({ provider, children }: VaultSecretSectionProps) => {
    if (provider === ProviderType.OpenAI) {
        return <div className="relative flex items-center w-full">{children}</div>;
    }
    return <>{children}</>;
};

function getProviderByValue(providers: IProvider[] | undefined, value: string) {
    return providers?.find(x => x.value === value?.trim());
}

export const FormBody = (props: StsConfigurationFormProps) => {
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
        const provider = watch('provider');
        const hasProvider = provider !== '';
        if (hasProvider && isEdit && oldValue === '') setOldValue(provider);
        else if (hasProvider && isEdit && oldValue !== '') setValue('modelNameOption', undefined);
        else if (!isEdit) setValue('modelNameOption', undefined);
    }, [watch('provider'), isEdit]);

    const selectedLanguages = useMemo(() => {
        const provider = getProviderByValue(providers, watch('provider'));
        return provider?.languages?.map(x => ({ label: x.name, value: x.code })) ?? [];
    }, [watch('provider'), providers]);

    useEffect(() => {
        if (isEdit && watch('provider') && (selectedLanguages?.length ?? 0) > 0) {
            const savedLanguageValue = (watch('languageOption') as any)?.value || watch('languageOption');
            if (savedLanguageValue && typeof savedLanguageValue === 'string') {
                const matchingLanguage = (selectedLanguages ?? []).find(lang => lang.value === savedLanguageValue);
                if (matchingLanguage && (watch('languageOption') as any)?.label === savedLanguageValue) {
                    setValue('languageOption', matchingLanguage);
                }
            }
        }
    }, [isEdit, watch('provider'), selectedLanguages]);

    useEffect(() => {
        if (Number.isNaN(watch('temperature') ?? 0)) {
            setValue('temperature', null);
        }
    }, [watch('temperature')]);

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
        const provider = getProviderByValue(providers, watch('provider'));
        return provider?.models?.map(x => ({ label: x.value, value: x.value })) ?? [];
    }, [watch('provider'), providers]);

    const selectedVoices = useMemo(() => {
        const provider = getProviderByValue(providers, watch('provider'));
        return provider?.voices?.map(x => ({ label: x.name, value: x.name })) ?? [];
    }, [watch('provider'), providers]);

    const selectedRegions = useMemo(() => {
        const provider = getProviderByValue(providers, watch('provider'));
        return provider?.regions?.map((x: { name: string; code: string }) => ({ name: x.name, value: x.code })) ?? [];
    }, [watch('provider'), providers]);

    const handleDecimalInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        value = value.replaceAll(/[^0-9.]/g, '');
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

    const isAWS = watch('provider') === ProviderType.AWS;
    const isOpenAI = watch('provider') === ProviderType.OpenAI;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-y-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    placeholder="Enter Name"
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
                        placeholder={providers.length > 0 ? 'Select STS Provider' : 'No STS Provider found'}
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
                                rules={{ required: { value: true, message: 'Please select or enter a model name' } }}
                                render={({ field }) => (
                                    <MultiSelect
                                        {...field}
                                        options={selectedModels}
                                        isDestructive={!!errors?.modelNameOption?.message}
                                        value={watch('modelNameOption') || null}
                                        menuPortalTarget={document.body}
                                        isClearable
                                        placeholder="Select or Enter a Model Name"
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

                    {/* Amazon specific fields */}
                    {isAWS && (
                        <>
                            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                                <Select
                                    {...register('region' as any, {
                                        required: { value: true, message: 'Please select a region' },
                                    })}
                                    label="Region"
                                    placeholder={
                                        selectedRegions.length > 0 ? 'Select Region' : 'No Region found'
                                    }
                                    disabled={selectedRegions.length === 0 || (isEdit && isReadOnly)}
                                    options={selectedRegions}
                                    currentValue={watch('region' as any)}
                                    isDestructive={!!(errors as any)?.region?.message}
                                    supportiveText={(errors as any)?.region?.message}
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <Select
                                    {...register('authType' as any, {
                                        required: { value: true, message: 'Please select a authentication method' },
                                    })}
                                    placeholder="Select your Credential Type"
                                    disabled={isEdit && isReadOnly}
                                    label="Credential Type"
                                    options={[
                                        { value: 'key-access', name: 'Key Access' },
                                        { value: 'managed-access', name: 'Managed Access' },
                                    ]}
                                    currentValue={watch('authType' as any)}
                                    isDestructive={!!(errors as any)?.authType?.message}
                                    supportiveText={(errors as any)?.authType?.message}
                                    helperInfo={
                                        watch('authType' as any) === 'managed-access'
                                            ? 'Credentials are read from ~/.aws/credentials or environment variables.'
                                            : undefined
                                    }
                                />
                            </div>

                            {watch('authType' as any) === 'key-access' && (
                                <div className="col-span-1 sm:col-span-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <VaultSelector
                                            {...register('awsAccessKey' as any, {
                                                required: { value: true, message: 'Please select an Access key/vault' },
                                            })}
                                            label="Access Key"
                                            placeholder={
                                                secrets.length > 0
                                                    ? 'Select Access Key/Vault'
                                                    : 'No Access Key/Vault found'
                                            }
                                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                            options={secrets}
                                            currentValue={watch('awsAccessKey' as any)}
                                            isDestructive={!!(errors as any)?.awsAccessKey?.message}
                                            supportiveText={(errors as any)?.awsAccessKey?.message}
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                        />
                                        <VaultSelector
                                            {...register('awsSecretKey' as any, {
                                                required: { value: true, message: 'Please select a secret key/vault' },
                                            })}
                                            label="Secret Key"
                                            placeholder={
                                                secrets.length > 0
                                                    ? 'Select Secret Key/Vault'
                                                    : 'No Secret Key/Vault found'
                                            }
                                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                            options={secrets}
                                            currentValue={watch('awsSecretKey' as any)}
                                            isDestructive={!!(errors as any)?.awsSecretKey?.message}
                                            supportiveText={(errors as any)?.awsSecretKey?.message}
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* OpenAI specific fields */}
                    {isOpenAI && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-2">
                            <VaultSecretSection provider={watch('provider')}>
                                <VaultSelector
                                    {...register('secretKey', {
                                        required: { value: true, message: 'Please select a Secret Key/vault' },
                                    })}
                                    label="Secret Key"
                                    placeholder={
                                        secrets.length > 0 ? 'Select Secret Key/Vault' : 'No Secret Key/Vault found'
                                    }
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('secretKey')}
                                    isDestructive={!!errors?.secretKey?.message}
                                    supportiveText={errors?.secretKey?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            </VaultSecretSection>
                        </div>
                    )}
                    {/* <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <Textarea
                            {...register('tone', { required: { value: true, message: 'Please enter a tone' } })}
                            placeholder="Enter your Tone"
                            readOnly={isEdit && isReadOnly}
                            label="Tone"
                            autoComplete="off"
                            rows={3}
                            isDestructive={!!errors?.tone?.message}
                            supportiveText={errors?.tone?.message}
                        />
                    </div> */}

                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col items-start gap-y-[6px] w-full">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Voice</Label>
                                <div className="relative flex items-center w-full">
                                    <Controller
                                        name="voiceOption"
                                        control={control}
                                        rules={{
                                            required: { value: true, message: 'Please select or enter a voice name' },
                                        }}
                                        render={({ field }) => (
                                            <MultiSelect
                                                {...field}
                                                menuPlacement="auto"
                                                options={selectedVoices}
                                                isMenuHeightAuto={true}
                                                isDestructive={!!errors?.voiceOption?.message}
                                                value={watch('voiceOption') || null}
                                                menuPortalTarget={document.body}
                                                isClearable
                                                placeholder="Select or Enter a Voice Name"
                                                onChange={selectedOptions => field.onChange(selectedOptions)}
                                                menuClass="!z-50"
                                                menuPortalClass="!z-50 pointer-events-auto"
                                                isDisabled={(isEdit && isReadOnly) || selectedVoices?.length === 0}
                                                isCreatable={true}
                                                onCreateOption={value =>
                                                    setValue('voiceOption', { label: value, value })
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                {!!errors?.voiceOption?.message && (
                                    <p className="text-xs font-normal text-red-500 dark:text-red-500">
                                        {errors?.voiceOption?.message}
                                    </p>
                                )}
                            </div>
                            {isOpenAI && (
                                <div className="flex flex-col items-start gap-y-[6px] w-full">
                                    <Input
                                        {...register('temperature', {
                                            required: { value: true, message: 'Temperature is required' },
                                            valueAsNumber: true,
                                        min: { value: 0.6, message: 'Temperature must be at least 0.6' }
                                        })}
                                        placeholder="Enter Temperature (min: 0.6)"
                                        readOnly={isEdit && isReadOnly}
                                        label="Temperature"
                                        onInput={handleDecimalInputChange}
                                        isDestructive={!!errors?.temperature?.message}
                                        supportiveText={errors?.temperature?.message}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <div className="flex flex-col items-start gap-y-[6px] w-full">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Language</Label>
                            <div className="relative flex items-center w-full">
                                <Controller
                                    name="languageOption"
                                    control={control}
                                    rules={{ required: { value: true, message: 'Please select or enter a language' } }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            {...field}
                                            menuPlacement="auto"
                                            options={selectedLanguages}
                                            isDestructive={!!errors?.languageOption?.message}
                                            value={watch('languageOption') || null}
                                            menuPortalTarget={document.body}
                                            isClearable
                                            placeholder="Select or Enter a Language"
                                            onChange={selectedOptions => field.onChange(selectedOptions)}
                                            menuClass="!z-50"
                                            menuPortalClass="!z-50 pointer-events-auto"
                                            isDisabled={(isEdit && isReadOnly) || selectedLanguages?.length === 0}
                                            isCreatable={true}
                                            onCreateOption={value =>
                                                setValue('languageOption', { label: value, value })
                                            }
                                        />
                                    )}
                                />
                            </div>
                            {!!errors?.languageOption?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500">
                                    {errors?.languageOption?.message}
                                </p>
                            )}
                        </div>
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

export const StsConfigurationForm = (props: StsConfigurationFormProps) => {
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
            header={<h3>{isEdit ? 'Edit STS Connection' : 'New STS Connection'}</h3>}
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

export default StsConfigurationForm;
