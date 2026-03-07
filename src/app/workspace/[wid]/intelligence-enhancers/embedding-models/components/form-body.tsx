import { useEffect, useMemo, useState } from 'react';
import { Input, Label, MultiSelect, Select, Textarea, VaultSelector } from '@/components';
import { sanitizeNumericInput, validateSpaces, validateUrl } from '@/lib/utils';
import { EmbeddingModelConfigurationFormProps } from './embedding-model-configuration-form';
import { validateField } from '@/utils/validation';
import { EmbeddingProviderType } from '@/enums';
import { REGION_LIST } from '@/constants';
import { Controller } from 'react-hook-form';

export const FormBody = (props: EmbeddingModelConfigurationFormProps) => {
    const {
        register,
        watch,
        refetch,
        setValue,
        secrets,
        errors,
        isEdit,
        loadingSecrets,
        providers,
        control,
        isModalRequest,
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

    const hasValues = useMemo(() => {
        return !!(
            watch('name') &&
            watch('name').trim() !== '' &&
            watch('provider') &&
            watch('provider').trim() !== '' &&
            watch('modelNameOption')
        );
    }, [watch('name'), watch('modelNameOption'), watch('provider')]);

    const selectedModels = useMemo(() => {
        if (watch('provider') && watch('provider').trim() !== '') {
            const provider = providers?.find(x => x.value === watch('provider').trim());
            if (provider) {
                return provider.models?.map(x => ({ label: x.value, value: x.value }));
            }
        }
        return [];
    }, [watch('provider')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const providerSelector = (
        <Select
            {...register('provider', { required: { value: true, message: 'Please select a provider' } })}
            label="Provider"
            placeholder={'Select a Provider'}
            disabled={isEdit && isReadOnly}
            options={providers?.map(x => ({ name: x.value, value: x.value }))}
            currentValue={watch('provider')}
            isDestructive={!!errors?.provider?.message}
            supportiveText={errors?.provider?.message}
        />
    );

    const modelSelector = (
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
                            onCreateOption={value => setValue('modelNameOption', { label: value, value })}
                        />
                    )}
                />
            </div>
            {!!errors?.modelNameOption?.message && (
                <p className="text-xs font-normal text-red-500 dark:text-red-500">{errors?.modelNameOption?.message}</p>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-y-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    placeholder="Enter a name"
                    readOnly={isEdit && isReadOnly}
                    label="Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            {isModalRequest ? (
                <>
                    <div className="col-span-1 sm:col-span-2">{providerSelector}</div>
                    <div className="col-span-1 sm:col-span-2">{modelSelector}</div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {providerSelector}
                        {modelSelector}
                    </div>
                </div>
            )}
            {hasValues && (
                <>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <Textarea
                            {...register('description', {
                                required: descriptionValidate.required,
                                minLength: descriptionValidate.minLength,
                                validate: value => validateSpaces(value, 'description'),
                            })}
                            placeholder="Enter a Description"
                            readOnly={isEdit && isReadOnly}
                            label="Description"
                            autoComplete="off"
                            rows={3}
                            isDestructive={!!errors?.description?.message}
                            supportiveText={errors?.description?.message}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSelector
                            {...register('configurations.apiKey', {
                                required:
                                    watch('provider') === EmbeddingProviderType.Bedrock
                                        ? undefined
                                        : { value: true, message: 'Please select an API key/vault' },
                            })}
                            label="API Key/Vault"
                            placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                            options={secrets}
                            currentValue={watch('configurations.apiKey')}
                            hasClear={true}
                            isDestructive={!!errors?.configurations?.apiKey?.message}
                            supportiveText={errors?.configurations?.apiKey?.message}
                            disableCreate={isEdit && isReadOnly}
                            loadingSecrets={loadingSecrets}
                            onClear={() => setValue('configurations.apiKey', '', { shouldValidate: true })}
                            onRefetch={() => refetch()}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('configurations.dimensions', {
                                    required: { value: true, message: 'Please enter a dimension' },
                                    min: {
                                        value: 1,
                                        message: 'Dimension must be at least 1',
                                    },
                                    valueAsNumber: true,
                                })}
                                placeholder="Enter a Dimension"
                                readOnly={isEdit && isReadOnly}
                                label="Dimension"
                                type="number"
                                isDestructive={!!errors?.configurations?.dimensions?.message}
                                supportiveText={errors?.configurations?.dimensions?.message}
                                onInput={sanitizeNumericInput}
                            />
                            <Input
                                {...register('configurations.baseURL', {
                                    validate: value => validateUrl(value, 'base URL'),
                                })}
                                placeholder="Enter a Base URL"
                                isDestructive={!!errors?.configurations?.baseURL?.message}
                                supportiveText={errors?.configurations?.baseURL?.message}
                                readOnly={isEdit && isReadOnly}
                                label="Base URL (Optional)"
                            />
                        </div>
                    </div>
                    {watch('provider') === EmbeddingProviderType.Bedrock && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-2">
                            <div className="mb-4">
                                <VaultSelector
                                    {...register('configurations.secretKey', {
                                        required: { value: true, message: 'Please select a Secret key from vault' },
                                    })}
                                    label="Secret Key"
                                    placeholder={secrets.length > 0 ? 'Select secret key' : 'No secret key found'}
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('configurations.secretKey')}
                                    isDestructive={!!errors?.configurations?.secretKey?.message}
                                    supportiveText={errors?.configurations?.secretKey?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    {...register('configurations.accessKeyId', {
                                        required: { value: true, message: 'Please enter an access key' },
                                        validate: value => validateSpaces(value, 'access key'),
                                    })}
                                    placeholder="Enter Access Key"
                                    readOnly={isEdit && isReadOnly}
                                    label="Access Key ID"
                                    isDestructive={!!errors?.configurations?.accessKeyId?.message}
                                    supportiveText={errors?.configurations?.accessKeyId?.message}
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
                </>
            )}
        </div>
    );
};
