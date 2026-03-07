/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo } from 'react';
import { Database } from 'lucide-react';

import { Button, OptionModel, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { FormBody } from './form-body';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
    useForm,
} from 'react-hook-form';
import { IDatabase, IDatabaseType } from '@/models';
import { DatabaseItemType, DatabaseProviderType } from '@/enums';
import { REDSHIFT_AUTH } from './database-types/redshift-extras';

export interface DatabasesFormProp {
    isOpen: boolean;
    isReadOnly: boolean;
    selectedDatabase: IDatabaseType | undefined;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    options?: OptionModel[];
    errors: FieldErrors<IDatabase>;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    isSaving: boolean;
    isValid: boolean;
    databaseType?: DatabaseItemType;
    isModalRequest?: boolean;
    control: Control<IDatabase, any>;
    setValue: UseFormSetValue<IDatabase>;
    register: UseFormRegister<IDatabase>;
    watch: UseFormWatch<IDatabase>;
    refetch: () => void;
    handleSubmit: UseFormHandleSubmit<IDatabase>;
    onHandleSubmit: (data: IDatabase) => void;
    onlyRelationalTypeEnabled?: boolean;
}

export const DatabasesForm = (props: DatabasesFormProp) => {
    const {
        isOpen,
        isSaving,
        isValid,
        setIsOpen,
        isEdit,
        watch,
        handleSubmit,
        onHandleSubmit,
        control,
        register,
        setValue,
    } = props;
    console.log('Is Valid', isValid);
    const isRedshift = watch('configurations.provider') === DatabaseProviderType.REDSHIFT;
    const methods = useForm<IDatabase>({
        mode: 'all',
        defaultValues: {
            configurations: {
                port: 5432,
            },
        },
    });

    Object.assign(methods, {
        control,
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { isValid },
    });

    const canSubmit = useMemo(() => {
        if (isRedshift) {
            const configs = watch('configurations');
            console.log('Redshift Configuration:', configs);
            const hasRequiredFields = !!(
                configs.host &&
                configs.port &&
                configs.databaseName &&
                configs.userName &&
                configs.region
            );

            if (!hasRequiredFields) {
                console.groupEnd();
                return false;
            }
            if (configs.authMethod === REDSHIFT_AUTH.ACCESS_KEYS) {
                const hasAccessKeys = !!(configs.awsAccessKeyId && configs.awsSecretAccessKeyId);
                console.log('Access Keys Present:', hasAccessKeys);

                if (!hasAccessKeys) {
                    console.groupEnd();
                    return false;
                }
            }
            if (configs.isServerless) {
                const hasWorkgroup = !!configs.workgroupName;
                console.log('Serverless Config Valid:', hasWorkgroup);

                if (!hasWorkgroup) {
                    console.groupEnd();
                    return false;
                }
            } else {
                const hasCluster = !!configs.clusterIdentifier;
                if (!hasCluster) {
                    console.groupEnd();
                    return false;
                }
            }
        }

        const finalResult = true && !isSaving && !(isEdit && !!watch('isReadOnly'));
        console.log('Final canSubmit Result:', finalResult);
        console.groupEnd();

        return finalResult;
    }, [isValid, isSaving, isEdit, watch, isRedshift]);

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setIsOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Database />}
            header={<h3>{isEdit ? 'Edit Databases' : 'New Database'}</h3>}
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody {...props} />
                </div>
            }
            footer={
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        {/* <Button variant="secondary" size={'sm'} disabled>
                            Test Connection
                        </Button> */}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            onClick={() => {
                                setIsOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            disabled={
                                                !isValid || !canSubmit || isSaving || (isEdit && !!watch('isReadOnly'))
                                            }
                                            onClick={handleSubmit(onHandleSubmit)}
                                        >
                                            {getSubmitButtonLabel(isSaving, isEdit)}
                                        </Button>
                                    </TooltipTrigger>
                                    {(!isValid || !canSubmit) && (
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
        />
    );
};
