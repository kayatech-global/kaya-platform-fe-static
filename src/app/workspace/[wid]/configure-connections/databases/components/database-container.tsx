'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React from 'react';
import { DatabaseTable } from './database-table';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { DatabasesForm } from './databases-form';
import { useDatabase } from '@/hooks/use-database';

export const DatabaseContainer = () => {
    const { isLg } = useBreakpoint();
    const {
        isFetching,
        databases,
        isOpen,
        isEdit,
        isReadOnly,
        selectedDatabase,
        errors,
        secrets,
        loadingSecrets,
        isSaving,
        isValid,
        control,
        setIsOpen,
        register,
        watch,
        setValue,
        refetch,
        onDatabaseFilter,
        handleCreate,
        onEdit,
        onDelete,
        handleSubmit,
        onHandleSubmit,
    } = useDatabase();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} hasRecentActivity={false} />;

    return (
        <React.Fragment>
            <div className="database-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <DatabaseTable
                            data={databases}
                            onDatabaseFilter={onDatabaseFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </div>
            <DatabasesForm
                isOpen={isOpen}
                isReadOnly={isReadOnly}
                selectedDatabase={selectedDatabase}
                isEdit={isEdit}
                errors={errors}
                secrets={secrets}
                loadingSecrets={loadingSecrets}
                isSaving={isSaving}
                isValid={isValid}
                control={control}
                setValue={setValue}
                setIsOpen={setIsOpen}
                register={register}
                watch={watch}
                refetch={refetch}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
            />
        </React.Fragment>
    );
};
