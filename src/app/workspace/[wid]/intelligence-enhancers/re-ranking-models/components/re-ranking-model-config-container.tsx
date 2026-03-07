'use client';

import React, { useRef } from 'react';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { ReRankingModelConfigurationTableContainer } from './re-ranking-model-config-table-container';
import { useReRankingModelConfiguration } from '@/hooks/use-re-ranking-model-configuration';
import { ReRankingModelConfigurationForm } from './re-ranking-model-config-form';

export const ReRankingModelConfigurationContainer = () => {
    const {
        isFetching,
        providers,
        reRankingTableData,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        isEdit,
        control,
        onReRankingFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        handleCreate,
        onEdit,
        onDelete,
        refetch,
    } = useReRankingModelConfiguration();

    const { isLg } = useBreakpoint();
    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);

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
                        <ReRankingModelConfigurationTableContainer
                            reRanking={reRankingTableData}
                            providers={providers}
                            onReRankingFilter={onReRankingFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={onEdit}
                            onDelete={onDelete}
                            onRecentActivity={() => {}}
                        />
                    </div>
                </div>
            </div>
            <ReRankingModelConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                isValid={isValid}
                secrets={secrets}
                isSaving={isSaving}
                providers={providers}
                control={control}
                errors={errors}
                loadingSecrets={loadingSecrets}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
            />
        </React.Fragment>
    );
};
