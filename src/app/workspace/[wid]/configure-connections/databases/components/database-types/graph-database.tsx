'use client';

import { Input, Label, Select, VaultSelector } from '@/components';
import { DatabasesFormProp } from '../databases-form';
import { DatabaseProviderType } from '@/enums';
import { sanitizeNumericInput, validateSpaces } from '@/lib/utils';
import { REGION_LIST } from '@/constants';
import { Controller } from 'react-hook-form';
import { Switch } from '@/components/atoms/switch';

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

const SecuritySection = ({ isEdit, isReadOnly, control, isModalRequest }: DatabasesFormProp) => {
    const httpSelector = (
        <Controller
            name="configurations.useHttps"
            control={control}
            defaultValue={false}
            render={({ field }) => (
                <div className="flex items-center gap-x-2">
                    <Switch
                        id="enable-https"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isEdit && isReadOnly}
                    />
                    <Label htmlFor="enable-https">Use Secure Client Connections</Label>
                </div>
            )}
        />
    );
    const authSelector = (
        <Controller
            name="configurations.useIamAuth"
            control={control}
            defaultValue={false}
            render={({ field }) => (
                <div className="flex items-center gap-x-2">
                    <Switch
                        id="enable-iam-auth"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isEdit && isReadOnly}
                    />
                    <Label htmlFor="enable-iam-auth">Enable IAM (SigV4) Authentication</Label>
                </div>
            )}
        />
    );

    return (
        <>
            {isModalRequest ? (
                <>
                    <div className="col-span-1 sm:col-span-2">{httpSelector}</div>
                    <div className="col-span-1 sm:col-span-2">{authSelector}</div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {httpSelector}
                        {authSelector}
                    </div>
                </div>
            )}
        </>
    );
};

const GraphDatabase = (props: DatabasesFormProp) => {
    const { errors, isEdit, isReadOnly, secrets, loadingSecrets, refetch, register, watch } = props;

    return (
        <>
            {watch('configurations.provider') === DatabaseProviderType.NEO4J && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('configurations.endpoint', {
                                    required: { value: true, message: 'Please enter a Neo4j URL' },
                                    validate: value => validateSpaces(value, 'Neo4j URL'),
                                })}
                                className="w-full"
                                placeholder="Enter a Neo4j URL"
                                label="Neo4j URL"
                                readOnly={isEdit && isReadOnly}
                                isDestructive={!!errors?.configurations?.endpoint?.message}
                                supportiveText={errors?.configurations?.endpoint?.message}
                            />
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
                    </div>
                    <VaultSecret {...props} />
                </>
            )}
            {watch('configurations.provider') === DatabaseProviderType.AMAZONNEPTUNE && (
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
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <Select
                                {...register('configurations.region', {
                                    required: { value: true, message: 'Please select a AWS region' },
                                })}
                                label="AWS Region"
                                placeholder="Select an AWS Region"
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
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <VaultSelector
                                {...register('configurations.awsAccessKeyId')}
                                label="AWS Key"
                                placeholder={secrets.length > 0 ? 'Select AWS Key/Vault' : 'No vault key found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('configurations.awsAccessKeyId')}
                                isDestructive={!!errors?.configurations?.awsAccessKeyId?.message}
                                supportiveText={errors?.configurations?.awsAccessKeyId?.message}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                            <VaultSelector
                                {...register('configurations.awsSecretAccessKeyId')}
                                label="AWS Secret"
                                placeholder={secrets.length > 0 ? 'Select AWS Secret/Vault' : 'No vault key found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('configurations.awsSecretAccessKeyId')}
                                isDestructive={!!errors?.configurations?.awsSecretAccessKeyId?.message}
                                supportiveText={errors?.configurations?.awsSecretAccessKeyId?.message}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                        </div>
                    </div>
                    <SecuritySection {...props} />
                </>
            )}
        </>
    );
};

export default GraphDatabase;
