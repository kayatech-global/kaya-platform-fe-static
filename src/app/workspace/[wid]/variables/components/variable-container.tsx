'use client';
import React from 'react';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { useVariable } from '@/hooks/use-variable';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { VariableTableContainer } from './variable-table-container';
import { VariableForm } from './variable-form';

export const VariableContainer = () => {
    const {
        isFetching,
        isOpen,
        isEdit,
        isValid,
        isSaving,
        activityData,
        variablePageRef,
        isDrawerOpen,
        variablePageHeighInDrawer,
        variableTableData,
        errors,
        setOpen,
        bottomRef,
        register,
        watch,
        setValue,
        setIsDrawerOpen,
        handleClick,
        onVariableFilter,
        handleCreate,
        handleEdit,
        onDelete,
        handleSubmit,
        onHandleSubmit,
        control,
    } = useVariable();
    const { isLg, isMobile } = useBreakpoint();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={variablePageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <VariableTableContainer
                            variables={variableTableData}
                            onVariableFilter={onVariableFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onRecentActivity={handleClick}
                        />
                    </div>
                </div>
            </div>
            {/* Recent activities will be shown in the below drawer on small screens */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={variablePageHeighInDrawer}
                        />
                    </div>
                }
            />
            <VariableForm
                isOpen={isOpen}
                errors={errors}
                isEdit={isEdit}
                isValid={isValid}
                isSaving={isSaving}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                control={control}
            />
        </React.Fragment>
    );
};
