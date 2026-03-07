'use client';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import React from 'react';
import { ExecutableFunctionTableContainer } from '@/app/workspace/[wid]/executable-functions/components/executable-function-table';
import { ExecutableFunctionForm } from '@/app/workspace/[wid]/executable-functions/components/executable-function-config-form';
import { useExecutableFunction } from '@/hooks/use-executable-function';

export const ExecutableFunctionContainer = () => {
    const {
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onDelete,
        setEdit,
        onEdit,
        onExecutableFunctionFilter,
        refetch,
        appendPayload,
        removePayload,
        executableFunctionTableData,
        isFetching,
        control,
        errors,
        isOpen,
        isValid,
        secrets,
        isDeploying,
        loadingSecrets,
        isEdit,
        payload,
        dependencies,
        appendDependency,
        removeDependency,
        environmentVariables,
        appendEnvironmentVariable,
        removeEnvironmentVariable,
    } = useExecutableFunction();
    const { isLg, isMobile } = useBreakpoint();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };
    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <ExecutableFunctionTableContainer
                            executableFunctions={executableFunctionTableData}
                            onFunctionFilter={onExecutableFunctionFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </div>
            <AppDrawer
                open={isOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
            />
            <ExecutableFunctionForm
                isOpen={isOpen}
                errors={errors}
                isEdit={isEdit}
                isValid={isValid}
                isDeploying={isDeploying}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                control={control}
                secrets={secrets}
                loadingSecrets={loadingSecrets}
                refetch={refetch}
                payload={payload}
                appendPayload={appendPayload}
                removePayload={removePayload}
                dependencies={dependencies}
                appendDependency={appendDependency}
                removeDependency={removeDependency}
                environmentVariables={environmentVariables}
                appendEnvironmentVariable={appendEnvironmentVariable}
                removeEnvironmentVariable={removeEnvironmentVariable}
            />
        </React.Fragment>
    );
};
