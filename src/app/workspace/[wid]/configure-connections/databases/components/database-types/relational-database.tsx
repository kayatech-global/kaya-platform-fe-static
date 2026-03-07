'use client';

import { Input, VaultSelector } from '@/components';
import { DatabasesFormProp } from '../databases-form';
import { DatabaseProviderType } from '@/enums';
import { sanitizeNumericInput, validateSpaces } from '@/lib/utils';
import RedshiftExtras from './redshift-extras';

const RelationalDatabase = ({
    errors,
    isEdit,
    isReadOnly,
    secrets,
    loadingSecrets,
    isModalRequest,
    control,
    refetch,
    register,
    watch,
    setValue,
}: DatabasesFormProp) => {
    const provider = watch('configurations.provider');

    const isRelational =
        provider === DatabaseProviderType.POSTGRESQL ||
        provider === DatabaseProviderType.MYSQL ||
        provider === DatabaseProviderType.REDSHIFT;

    const isServerless = !!watch('configurations.isServerless');

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

    if (!isRelational) return <></>;

    return (
        <>
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
                        label="Host / Endpoint"
                        readOnly={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.host?.message}
                        supportiveText={errors?.configurations?.host?.message}
                    />
                    <Input
                        {...register('configurations.port', {
                            required: { value: true, message: 'Please enter a port' },
                            min: { value: 1, message: 'Port must be at least 1' },
                            max: { value: 65535, message: 'Port cannot exceed 65535' },
                            valueAsNumber: true,
                        })}
                        className="w-full"
                        placeholder="5439"
                        label="Port"
                        type="number"
                        readOnly={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.port?.message}
                        supportiveText={errors?.configurations?.port?.message}
                        onInput={sanitizeNumericInput}
                    />
                </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('configurations.databaseName', {
                        required: { value: true, message: 'Please enter a database name' },
                        validate: value => validateSpaces(value, 'database name'),
                    })}
                    className="w-full"
                    placeholder="Enter a database name"
                    label="Database"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.configurations?.databaseName?.message}
                    supportiveText={errors?.configurations?.databaseName?.message}
                />
            </div>

            {isModalRequest ? (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {usernameSelector}
                            {passwordSelector}
                        </div>
                    </div>

                    {provider === DatabaseProviderType.REDSHIFT && !isServerless && (
                        <div className="col-span-1 sm:col-span-2">
                            <Input
                                {...register('configurations.clusterIdentifier', {
                                    required: {
                                        value: true,
                                        message: 'Cluster identifier is required for Provisioned',
                                    },
                                })}
                                label="Cluster Identifier"
                                placeholder="redshift-cluster-1"
                                readOnly={isEdit && isReadOnly}
                                isDestructive={!!errors?.configurations?.clusterIdentifier?.message}
                                supportiveText={errors?.configurations?.clusterIdentifier?.message}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {usernameSelector}
                        {passwordSelector}

                        {provider === DatabaseProviderType.REDSHIFT && !isServerless && (
                            <div className="col-span-2">
                                <Input
                                    {...register('configurations.clusterIdentifier', {
                                        required: {
                                            value: true,
                                            message: 'Cluster identifier is required for Provisioned',
                                        },
                                    })}
                                    label="Cluster Identifier"
                                    placeholder="redshift-cluster-1"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors?.configurations?.clusterIdentifier?.message}
                                    supportiveText={errors?.configurations?.clusterIdentifier?.message}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {provider === DatabaseProviderType.REDSHIFT && (
                <RedshiftExtras
                    errors={errors}
                    isEdit={isEdit}
                    isReadOnly={isReadOnly}
                    secrets={secrets}
                    loadingSecrets={loadingSecrets}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    refetch={refetch}
                />
            )}
        </>
    );
};

export default RelationalDatabase;
