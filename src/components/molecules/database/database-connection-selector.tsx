'use client';
import { FormBody as DatabaseFormBody } from '@/app/workspace/[wid]/configure-connections/databases/components/form-body';
import { Button, Input, SelectableRadioItem } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { DatabaseItemType, DatabaseProviderType, SelectableType } from '@/enums';
import { useDatabase } from '@/hooks/use-database';
import { getEnumValueByKey } from '@/lib/utils';
import { IDatabase } from '@/models';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DatabaseConnectionSelectorProps {
    database: IDatabase | undefined;
    isReadonly?: boolean;
    databaseLoading?: boolean;
    allDatabases: IDatabase[];
    label?: string;
    labelClassName?: string;
    description?: string;
    hideDescription?: boolean;
    databaseType?: DatabaseItemType;
    setDatabase: React.Dispatch<React.SetStateAction<IDatabase | undefined>>;
    onDatabaseChange?: (database: IDatabase | undefined) => void;
    onModalChange?: (open: boolean) => void;
    onRefetch: () => void;
    onlyRelationalTypeEnabled?: boolean;
}

export const DatabaseConnectionSelector = ({
    database,
    isReadonly,
    allDatabases,
    databaseLoading,
    label,
    labelClassName,
    description,
    hideDescription = false,
    databaseType,
    setDatabase,
    onRefetch,
    onDatabaseChange,
    onModalChange,
    onlyRelationalTypeEnabled,
}: DatabaseConnectionSelectorProps) => {
    const [allSearchableDatabases, setAllSearchableDatabases] = useState<IDatabase[]>(allDatabases);
    const [checkedItemId, setCheckedItemId] = useState<string>();
    const [openNewModal, setOpenNewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const {
        isOpen,
        isEdit,
        isReadOnly,
        selectedDatabase,
        errors,
        isSaving,
        isValid,
        secrets,
        loadingSecrets,
        control,
        setIsOpen,
        register,
        watch,
        setValue,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        refetch,
    } = useDatabase({ triggerQuery: false, onRefetch });

    useEffect(() => {
        if (searchTerm !== '') {
            const filteredDb = allDatabases.filter(db => db.name.toLowerCase().includes(searchTerm));
            setAllSearchableDatabases(filteredDb);
        } else {
            setAllSearchableDatabases(allDatabases);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (onModalChange) {
            onModalChange(openNewModal);
        }
    }, [openNewModal]);

    useEffect(() => {
        if (!isOpen || !openNewModal) {
            setEdit(false);
            setSearchTerm('');
        }
    }, [isOpen, openNewModal]);

    useEffect(() => {
        if (openNewModal && database) {
            setCheckedItemId(database?.id);
        } else {
            setCheckedItemId(undefined);
        }
    }, [openNewModal, database]);

    useEffect(() => {
        setAllSearchableDatabases(allDatabases);
    }, [allDatabases, allDatabases?.length]);

    const handleClick = () => {
        const selectedDb = allSearchableDatabases.find(p => p.id === checkedItemId);
        setDatabase(selectedDb);
        setOpenNewModal(false);
        setAllSearchableDatabases(allDatabases);
        if (onDatabaseChange) {
            onDatabaseChange(selectedDb);
        }
    };

    const handleRemove = () => {
        setDatabase(undefined);
        setCheckedItemId(undefined);
        if (onDatabaseChange) {
            onDatabaseChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openNewModal);
        }
    };

    const getDatabase = () => {
        if (!database) {
            return undefined;
        }

        const value: valuesProps[] = [];

        if (database) {
            value.push({
                title: database.name,
                description: `${database.description?.slice(0, 65)}...`,
                imagePath: '/png/database_image.png',
            });
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenNewModal(true);
        if (database) {
            setCheckedItemId(database.id);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);
    };

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setIsOpen(false);
        } else if (cancel) {
            setOpenNewModal(false);
            setAllSearchableDatabases(allDatabases);
        } else {
            setOpenNewModal(open);
        }
    };

    const onEdit = (id: string) => {
        const obj = allDatabases?.find(x => x.id === id);
        if (obj) {
            setValue('id', obj.id);
            setValue('name', obj.name);
            setValue('description', obj.description);
            setValue('type', getEnumValueByKey(obj.type, DatabaseItemType) as DatabaseItemType);
            setValue('configurations', obj.configurations);
            setValue(
                'configurations.provider',
                getEnumValueByKey(obj.configurations.provider, DatabaseProviderType) as DatabaseProviderType
            );

            const provider = getEnumValueByKey(
                obj.configurations.provider,
                DatabaseProviderType
            ) as DatabaseProviderType;
            if (provider === DatabaseProviderType.REDSHIFT) {
                setValue('configurations.awsAccessKeyId', obj.configurations.accessKey);
                setValue('configurations.awsSecretAccessKeyId', obj.configurations.secretKey);
            }
        }
        setEdit(true);
        setIsOpen(true);
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'Database'}
                labelClassName={labelClassName}
                values={getDatabase()}
                imagePath="/png/database_empty.png"
                imageWidth="120"
                imageType="png"
                description={
                    description ??
                    "No database has been added. Please use 'Add Database' to provide instructions for the retrieval."
                }
                hideDescription={hideDescription}
                footer={
                    database ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!database && (
                                <Button variant="link" onClick={() => setOpenNewModal(true)}>
                                    Add Database
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <Dialog open={openNewModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                {isOpen && <Unplug />}
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    {(() => {
                                        if (!isOpen) return 'Databases';
                                        return isEdit ? 'Edit Database' : 'New Database';
                                    })()}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            {!isOpen && (
                                <div className="flex justify-end">
                                    <Button variant="link" disabled={isReadonly} onClick={() => setIsOpen(true)}>
                                        New Database
                                    </Button>
                                </div>
                            )}
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <DatabaseFormBody
                                        isOpen={isOpen}
                                        isReadOnly={isReadOnly}
                                        selectedDatabase={selectedDatabase}
                                        isEdit={isEdit}
                                        errors={errors}
                                        secrets={secrets}
                                        loadingSecrets={loadingSecrets}
                                        isSaving={isSaving}
                                        isValid={isValid}
                                        databaseType={databaseType}
                                        control={control}
                                        isModalRequest={true}
                                        setIsOpen={setIsOpen}
                                        register={register}
                                        setValue={setValue}
                                        watch={watch}
                                        refetch={() => refetch()}
                                        handleSubmit={handleSubmit}
                                        onHandleSubmit={onHandleSubmit}
                                        onlyRelationalTypeEnabled={onlyRelationalTypeEnabled}
                                    />
                                </div>
                            ) : (
                                <>
                                    {databaseLoading ? (
                                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                            <LoaderCircle
                                                className="animate-spin"
                                                size={25}
                                                width={25}
                                                height={25}
                                                absoluteStrokeWidth={undefined}
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                Please wait! loading the databases data for you...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                className="w-full"
                                                placeholder="Search databases"
                                                onChange={handleSearch}
                                            />
                                            {allSearchableDatabases?.length > 0 ? (
                                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                    {allSearchableDatabases.map(db => {
                                                        return (
                                                            <SelectableRadioItem
                                                                key={db.id as string}
                                                                id={db.id as string}
                                                                title="Database"
                                                                type={SelectableType.DATABASE}
                                                                label={db.name}
                                                                description={db.description}
                                                                isChecked={checkedItemId === db.id}
                                                                imagePath="/png/database_image.png"
                                                                expandTriggerName="Show Database"
                                                                handleClick={() => setCheckedItemId(db.id)}
                                                                onEdit={onEdit}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                                    <FileX className="text-gray-500 dark:text-gray-300" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                        {searchTerm !== '' ? (
                                                            <>No results found</>
                                                        ) : (
                                                            <>
                                                                No Databases have been
                                                                <br /> configured
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        {isOpen ? (
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isEdit ? 'Update' : 'Create'}
                            </Button>
                        ) : (
                            <Button disabled={checkedItemId === undefined} variant="primary" onClick={handleClick}>
                                Add database
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
