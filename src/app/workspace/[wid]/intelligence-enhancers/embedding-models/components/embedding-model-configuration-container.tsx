'use client';

import React, { useRef } from 'react';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { EmbeddingModelConfigurationForm } from './embedding-model-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { EmbeddingModelConfigurationTableContainer } from './embedding-model-configuration-table-container';
import { useEmbeddingModelConfiguration } from '@/hooks/use-embedding-model-configuration';

export const EmbeddingModelConfigurationContainer = () => {
    const {
        isFetching,
        providers,
        embeddingTableData,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        isEdit,
        control,
        onEmbeddingFilter,
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
    } = useEmbeddingModelConfiguration();
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
                        <EmbeddingModelConfigurationTableContainer
                            embeddings={embeddingTableData}
                            providers={providers}
                            onEmbeddingFilter={onEmbeddingFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={onEdit}
                            onDelete={onDelete}
                            onRecentActivity={() => {}}
                        />
                    </div>
                </div>
            </div>
            <EmbeddingModelConfigurationForm
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
