'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { VaultTableContainer } from './vault-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import VaultForm from './vault-form';
import { useVault } from '@/hooks/use-vault';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const VaultContainer = () => {
    const {
        isOpen,
        isFetching,
        activityData,
        vaultData,
        secretKeyValidation,
        secretDescriptionValidation,
        secretValueValidation,
        errors,
        isValid,
        isSaving,
        bottomRef,
        onVaultFilter,
        register,
        watch,
        handleSubmit,
        onHandleSubmit,
        validateVault,
        setOpen,
        onEdit,
        onDelete,
        setSecretValueValidation,
    } = useVault();
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setSecretValueValidation(prevState => ({
            ...prevState,
            required: {
                ...prevState.required,
                value: true,
                message: prevState.required?.message || 'This field is required',
            },
        }));
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        setSecretValueValidation(prevState => ({
            ...prevState,
            required: {
                ...prevState.required,
                value: false,
                message: prevState.required?.message || 'This field is required',
            },
        }));
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <VaultTableContainer
                            secrets={vaultData}
                            onVaultFilter={onVaultFilter}
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
                            activityBodyHeight={workflowAuthoringPageHeighInDrawer}
                        />
                    </div>
                }
            />
            <VaultForm
                isOpen={isOpen}
                secretKeyValidation={secretKeyValidation}
                secretDescriptionValidation={secretDescriptionValidation}
                secretValueValidation={secretValueValidation}
                errors={errors}
                isEdit={isEdit}
                isValid={isValid}
                isSaving={isSaving}
                setOpen={setOpen}
                register={register}
                watch={watch}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                validateVault={validateVault}
            />
        </React.Fragment>
    );
};
