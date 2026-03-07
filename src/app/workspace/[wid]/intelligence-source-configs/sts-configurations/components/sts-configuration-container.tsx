'use client';

import { Button } from '@/components';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';
import STSConfigurationForm from './sts-configuration-form';
import { STSConfigurationTableContainer } from './sts-configuration-table-container';
import { useStsConfiguration } from '@/hooks/use-sts-configuration';

export const STSConfigurationContainer = () => {
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const {
        providers,
        stsConfigurationTableData,
        onStsConfigurationFilter,
        setOpen,
        onEdit,
        onDelete,
        isOpen,
        isValid,
        secrets,
        control,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        errors,
    } = useStsConfiguration();

    const handleCreate = () => {
        setIsEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setIsEdit(true);
        setOpen(true);
    };

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full mt-4', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <STSConfigurationTableContainer
                            providers={providers}
                            stsConfigurations={stsConfigurationTableData}
                            onStsConfigurationFilter={onStsConfigurationFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
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
                        <ActivityFeed data={[]} />
                    </div>
                }
            />
            <STSConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                providers={providers}
                isValid={isValid}
                secrets={secrets}
                isSaving={false}
                control={control}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={() => {}}
                errors={errors}
                loadingSecrets={false}
            />
        </React.Fragment>
    );
};
