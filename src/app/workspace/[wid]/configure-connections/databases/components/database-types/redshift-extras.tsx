'use client';

import { Input, Select, Checkbox, VaultSelector } from '@/components';
import { sanitizeNumericInput } from '@/lib/utils';
import { REGION_LIST } from '@/constants';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IDatabase } from '@/models';

export const REDSHIFT_AUTH = {
    DATABASE_CREDENTIALS: 'database_credentials',
    CLUSTER_CREDENTIALS: 'cluster_credentials',
    ACCESS_KEYS: 'access_keys',
    ROLE: 'role',
    SSO: 'sso',
} as const;

type RedshiftAuth = (typeof REDSHIFT_AUTH)[keyof typeof REDSHIFT_AUTH];

interface OptionModel {
    name: string;
    value: string | number;
}

type RedshiftExtrasProps = {
    isEdit: boolean;
    isReadOnly: boolean;
    secrets?: OptionModel[];
    loadingSecrets?: boolean;
    control: Control<IDatabase, unknown>;
    errors: FieldErrors<IDatabase>;
    setValue: UseFormSetValue<IDatabase>;
    register: UseFormRegister<IDatabase>;
    watch: UseFormWatch<IDatabase>;
    refetch?: () => void;
};

export default function RedshiftExtras({
    errors,
    isEdit,
    isReadOnly,
    secrets = [],
    loadingSecrets,
    control,
    register,
    watch,
    setValue,
    refetch,
}: RedshiftExtrasProps) {
    const authMethod = (watch('configurations.authMethod') || REDSHIFT_AUTH.ACCESS_KEYS) as RedshiftAuth;
    const isServerless = !!watch('configurations.isServerless');
    const selectedAuthMethod = watch('configurations.authMethod');

    return (
        <>
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        {...register('configurations.region', {
                            required: { value: true, message: 'Please select a region' },
                        })}
                        label="Region"
                        placeholder="Select Region"
                        options={REGION_LIST.map((r: string) => ({ name: r, value: r }))}
                        currentValue={watch('configurations.region')}
                        disabled={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.region?.message}
                        supportiveText={errors?.configurations?.region?.message}
                    />

                    <Controller
                        name="configurations.ssl"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    disabled={isEdit && isReadOnly}
                                    checked={!!field.value}
                                    onCheckedChange={val => field.onChange(!!val)}
                                />
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">Use SSL</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-300">
                                        Enforce TLS when connecting to Redshift (recommended)
                                    </p>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        {...register('configurations.timeoutSec', {
                            valueAsNumber: true,
                            min: { value: 1, message: 'Timeout must be greater than 0' },
                        })}
                        type="number"
                        label="Timeout (seconds)"
                        placeholder="30"
                        onInput={sanitizeNumericInput}
                        isDestructive={!!errors?.configurations?.timeoutSec?.message}
                        supportiveText={errors?.configurations?.timeoutSec?.message}
                    />

                    <Controller
                        name="configurations.isServerless"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    disabled={isEdit && isReadOnly}
                                    checked={!!field.value}
                                    onCheckedChange={val => field.onChange(!!val)}
                                />
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                        Serverless (Workgroup)
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-300">
                                        Toggle on for Redshift Serverless; off for Provisioned clusters
                                    </p>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>

            {isServerless && (
                <div className="col-span-1 sm:col-span-2">
                    <Input
                        {...register('configurations.workgroupName', {
                            required: { value: true, message: 'Workgroup name is required for Serverless' },
                        })}
                        label="Workgroup Name"
                        placeholder="my-redshift-wg"
                        readOnly={isEdit && isReadOnly}
                        isDestructive={!!errors?.configurations?.workgroupName?.message}
                        supportiveText={errors?.configurations?.workgroupName?.message}
                    />
                </div>
            )}

            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name="configurations.authMethod"
                    control={control}
                    defaultValue={REDSHIFT_AUTH.ACCESS_KEYS}
                    render={({ field }) => (
                        <Select
                            label="Authentication Method"
                            placeholder="Select Authentication Method"
                            options={[
                                { name: 'IAM (Access Keys)', value: REDSHIFT_AUTH.ACCESS_KEYS },
                                { name: 'IAM (Role-based)', value: REDSHIFT_AUTH.ROLE },
                                { name: 'Database Credentials', value: REDSHIFT_AUTH.DATABASE_CREDENTIALS },
                                { name: 'Cluster Credentials', value: REDSHIFT_AUTH.CLUSTER_CREDENTIALS },
                                { name: 'IDP (SSO)', value: REDSHIFT_AUTH.SSO },
                            ]}
                            value={field.value}
                            currentValue={field.value}
                            disabled={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.authMethod?.message}
                            supportiveText={errors?.configurations?.authMethod?.message}
                            onChange={event => {
                                const selectedValue = event.target ? event.target.value : event;
                                field.onChange(selectedValue);
                                if (selectedValue === REDSHIFT_AUTH.ROLE) {
                                    setValue('configurations.awsAccessKeyId', '');
                                    setValue('configurations.awsSecretAccessKeyId', '');
                                }
                            }}
                        />
                    )}
                />
            </div>

            {selectedAuthMethod === REDSHIFT_AUTH.ACCESS_KEYS && (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('configurations.awsAccessKeyId', {
                                required: {
                                    value: authMethod === REDSHIFT_AUTH.ACCESS_KEYS,
                                    message: 'Please enter an access key',
                                },
                            })}
                            placeholder="Enter Access Key"
                            readOnly={isEdit && isReadOnly}
                            label="Access Key ID"
                            isDestructive={!!errors?.configurations?.awsAccessKeyId?.message}
                            supportiveText={errors?.configurations?.awsAccessKeyId?.message}
                        />

                        <VaultSelector
                            {...register('configurations.awsSecretAccessKeyId', {
                                required: {
                                    value: authMethod === REDSHIFT_AUTH.ACCESS_KEYS,
                                    message: 'Please select a secret key/vault',
                                },
                            })}
                            label="Secret Key"
                            placeholder={secrets.length > 0 ? 'Select Secret Key/Vault' : 'No vault key found'}
                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                            options={secrets}
                            currentValue={watch('configurations.awsSecretAccessKeyId')}
                            isDestructive={!!errors?.configurations?.awsSecretAccessKeyId?.message}
                            supportiveText={errors?.configurations?.awsSecretAccessKeyId?.message}
                            disableCreate={isEdit && isReadOnly}
                            loadingSecrets={loadingSecrets}
                            onRefetch={() => refetch?.()}
                        />
                    </div>
                </div>
            )}

            {selectedAuthMethod === REDSHIFT_AUTH.ROLE && (
                <div className="col-span-1 sm:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                        Will use the environment identity role on this runtime (EC2/ECS/Lambda/SSO).
                    </p>
                </div>
            )}

            {selectedAuthMethod === REDSHIFT_AUTH.SSO && (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('configurations.idp_host', {
                                required: { value: true, message: 'IDP Host is required' },
                            })}
                            placeholder="Enter IDP Host"
                            readOnly={isEdit && isReadOnly}
                            label="IDP Host"
                            isDestructive={!!errors?.configurations?.idp_host?.message}
                            supportiveText={errors?.configurations?.idp_host?.message}
                        />

                        <Input
                            {...register('configurations.principal_arn', {
                                required: { value: true, message: 'Principal ARN is required' },
                            })}
                            placeholder="Enter Principal ARN"
                            readOnly={isEdit && isReadOnly}
                            label="Principal ARN"
                            isDestructive={!!errors?.configurations?.principal_arn?.message}
                            supportiveText={errors?.configurations?.principal_arn?.message}
                        />

                        <Input
                            {...register('configurations.preferred_role', {
                                required: { value: true, message: 'Preferred Role is required' },
                            })}
                            placeholder="Enter Preferred Role"
                            readOnly={isEdit && isReadOnly}
                            label="Preferred Role"
                            isDestructive={!!errors?.configurations?.preferred_role?.message}
                            supportiveText={errors?.configurations?.preferred_role?.message}
                        />

                        <Input
                            {...register('configurations.credential_provider', {
                                required: { value: true, message: 'Credential Provider is required' },
                            })}
                            placeholder="Enter Credential Provider"
                            readOnly={isEdit && isReadOnly}
                            label="Credential Provider"
                            isDestructive={!!errors?.configurations?.credential_provider?.message}
                            supportiveText={errors?.configurations?.credential_provider?.message}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
