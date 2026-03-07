'use client';

import { Input, VaultSelector } from '@/components';
import { DatabasesFormProp } from '../databases-form';
import { DatabaseProviderType } from '@/enums';
import { validateSpaces } from '@/lib/utils';

const NoSqlDatabase = ({
    errors,
    isEdit,
    isReadOnly,
    secrets,
    loadingSecrets,
    register,
    watch,
    refetch,
}: DatabasesFormProp) => (
    <>
        {watch('configurations.provider') === DatabaseProviderType.MONGODB && (
            <>
                <div className="col-span-1 sm:col-span-2">
                    <VaultSelector
                        {...register('configurations.endpoint', {
                            required: { value: true, message: 'Please select vault key' },
                        })}
                        label="Connection URL/Vault"
                        placeholder={secrets.length > 0 ? 'Select a Connection URL/Vault' : 'No vault key found'}
                        disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                        options={secrets}
                        currentValue={watch('configurations.endpoint')}
                        isDestructive={!!errors?.configurations?.endpoint?.message}
                        supportiveText={errors?.configurations?.endpoint?.message}
                        disableCreate={isEdit && isReadOnly}
                        loadingSecrets={loadingSecrets}
                        onRefetch={() => refetch()}
                    />
                </div>
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
            </>
        )}
    </>
);

export default NoSqlDatabase;
