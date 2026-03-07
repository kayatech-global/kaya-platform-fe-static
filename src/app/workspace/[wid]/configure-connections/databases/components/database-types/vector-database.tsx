'use client';

import { Input, VaultSelector } from '@/components';
import { DatabasesFormProp } from '../databases-form';
import { DatabaseProviderType } from '@/enums';
import { sanitizeNumericInput, validateSpaces } from '@/lib/utils';

const VaultSecret = ({
    errors,
    isEdit,
    isReadOnly,
    secrets,
    loadingSecrets,
    isModalRequest,
    refetch,
    register,
    watch,
}: DatabasesFormProp) => {
    const usernameSelector = (
        <VaultSelector
            {...register('configurations.userName', {
                required: { value: true, message: 'Please select vault key' },
            })}
            label="Username"
            placeholder={secrets.length > 0 ? 'Select Username Key/Vault' : 'No vault key found'}
            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
            options={secrets}
            currentValue={watch('configurations.userName')}
            isDestructive={!!errors?.configurations?.userName?.message}
            supportiveText={errors?.configurations?.userName?.message}
            disableCreate={isEdit && isReadOnly}
            loadingSecrets={loadingSecrets}
            onRefetch={() => refetch()}
        />
    );

    const passwordSelector = (
        <VaultSelector
            {...register('configurations.password', {
                required: { value: true, message: 'Please select vault key' },
            })}
            label="Password"
            placeholder={secrets.length > 0 ? 'Select Password Key/Vault' : 'No vault key found'}
            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
            options={secrets}
            currentValue={watch('configurations.password')}
            isDestructive={!!errors?.configurations?.password?.message}
            supportiveText={errors?.configurations?.password?.message}
            disableCreate={isEdit && isReadOnly}
            loadingSecrets={loadingSecrets}
            onRefetch={() => refetch()}
        />
    );

    return (
        <>
            {isModalRequest ? (
                <>
                    <div className="col-span-1 sm:col-span-2">{usernameSelector}</div>
                    <div className="col-span-1 sm:col-span-2">{passwordSelector}</div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {usernameSelector}
                        {passwordSelector}
                    </div>
                </div>
            )}
        </>
    );
};

const VectorDatabase = (props: DatabasesFormProp) => {
    const { errors, isEdit, isReadOnly, secrets, loadingSecrets, refetch, register, watch } = props;

    return (
        <>
            {watch('configurations.provider') === DatabaseProviderType.PGVECTOR && (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('configurations.host', {
                                required: { value: true, message: 'Please enter a host' },
                                pattern: {
                                    value: /^(?:(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(?:\d{1,3}(?:\.\d{1,3}){3})|localhost)$/,
                                    message: 'Invalid host or IP address',
                                },
                            })}
                            className="w-full"
                            placeholder="Enter a Host"
                            label="Host"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.host?.message}
                            supportiveText={errors?.configurations?.host?.message}
                        />
                        <Input
                            {...register('configurations.port', {
                                required: { value: true, message: 'Please enter a port' },
                                min: {
                                    value: 1,
                                    message: 'Port must be at least 1',
                                },
                                max: {
                                    value: 65535,
                                    message: 'Port cannot exceed 65535',
                                },
                                valueAsNumber: true,
                            })}
                            className="w-full"
                            placeholder="Enter a Port"
                            label="Port"
                            type="number"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.port?.message}
                            supportiveText={errors?.configurations?.port?.message}
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                </div>
            )}

            {watch('configurations.provider') === DatabaseProviderType.CHROMA && (
                <div className="col-span-1 sm:col-span-2">
                    <Input
                        {...register('configurations.tenantId', {
                            required: { value: true, message: 'Please enter a tenant ID' },
                            validate: value => validateSpaces(value, 'tenant ID'),
                        })}
                        className="w-full"
                        placeholder="Enter a Tenant ID"
                        label="Tenant ID"
                        readOnly={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.tenantId?.message}
                        supportiveText={errors?.configurations?.tenantId?.message}
                    />
                </div>
            )}

            {watch('configurations.provider') && watch('configurations.provider') !== '' && (
                <div className="col-span-1 sm:col-span-2">
                    <Input
                        {...register('configurations.databaseName', {
                            required: { value: true, message: 'Please enter a database name' },
                            validate: value => validateSpaces(value, 'database name'),
                        })}
                        className="w-full"
                        placeholder="Enter a Database Name"
                        label="Database Name"
                        readOnly={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.databaseName?.message}
                        supportiveText={errors?.configurations?.databaseName?.message}
                    />
                </div>
            )}

            {watch('configurations.provider') === DatabaseProviderType.PGVECTOR && <VaultSecret {...props} />}

            {watch('configurations.provider') === DatabaseProviderType.CHROMA && (
                <div className="col-span-1 sm:col-span-2">
                    <VaultSelector
                        {...register('configurations.apiKey', {
                            required: { value: true, message: 'Please select vault key' },
                        })}
                        label="API Key/Vault"
                        placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No vault key found'}
                        disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                        options={secrets}
                        currentValue={watch('configurations.apiKey')}
                        isDestructive={!!errors?.configurations?.apiKey?.message}
                        supportiveText={errors?.configurations?.apiKey?.message}
                        disableCreate={isEdit && isReadOnly}
                        loadingSecrets={loadingSecrets}
                        onRefetch={() => refetch()}
                    />
                </div>
            )}
        </>
    );
};

export default VectorDatabase;
