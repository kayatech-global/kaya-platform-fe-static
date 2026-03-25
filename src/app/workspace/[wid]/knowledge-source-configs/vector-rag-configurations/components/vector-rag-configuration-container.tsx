'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { useVectorRagConfiguration } from '@/hooks/use-vector-rag-configuration';
import { VectorRagConfigurationTable } from './vector-rag-configuration-table';
import { cn } from '@/lib/utils';
import { VectorRagConfigurationForm } from './vector-rag-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const VectorRagConfigurationContainer = () => {
    const {
        isFetching,
        isSaving,
        isEdit,
        isValid,
        isOpen,
        embeddings,
        reRankings,
        vectorRagConfigurationsTableData,
        currentStep,
        retrievalFields,
        completed,
        control,
        errors,
        databases,
        allModels,
        allSLMModels,
        allPrompts,
        promptsLoading,
        slmModelsLoading,
        llmModelsLoading,
        loadingDatabases,
        loadingEmbeddings,
        loadingReRankings,
        appendRetrieval,
        removeRetrieval,
        setCurrentStep,
        setIsOpen,
        onEdit,
        onVectorRagConfigurationFilter,
        onDelete,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        handleCreate,
        handleSubmit,
        onHandleSubmit,
        refetch,
        refetchEmbedding,
        refetchReRanking,
        refetchLlms,
        refetchSLM,
        refetchPrompts,
    } = useVectorRagConfiguration();

    const { isLg } = useBreakpoint();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} hasRecentActivity={false} />;

    return (
        <>
            <div className="database-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <VectorRagConfigurationTable
                            data={vectorRagConfigurationsTableData}
                            onVectorRagConfigurationFilter={onVectorRagConfigurationFilter}
                            onNewButtonClick={handleCreate}
                            onEditButtonClick={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </div>
            <VectorRagConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                isValid={isValid}
                errors={errors}
                isSaving={isSaving}
                databases={databases ?? []}
                embeddings={embeddings ?? []}
                reRankings={reRankings ?? []}
                retrievalFields={retrievalFields}
                allModels={allModels}
                allSLMModels={allSLMModels}
                allPrompts={allPrompts}
                currentStep={currentStep}
                completed={completed}
                loadingDatabases={loadingDatabases}
                loadingEmbeddings={loadingEmbeddings}
                loadingReRankings={loadingReRankings}
                llmModelsLoading={llmModelsLoading}
                slmModelsLoading={slmModelsLoading}
                promptsLoading={promptsLoading}
                control={control}
                setOpen={setIsOpen}
                setCurrentStep={setCurrentStep}
                register={register}
                watch={watch}
                setValue={setValue}
                trigger={trigger}
                getValues={getValues}
                appendRetrieval={appendRetrieval}
                removeRetrieval={removeRetrieval}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
                refetchEmbedding={refetchEmbedding}
                refetchReRanking={refetchReRanking}
                refetchLlms={refetchLlms}
                refetchSLM={refetchSLM}
                onRefetchPrompt={refetchPrompts}
                showTestConnectionScenarioToggle={true}
            />
        </>
    );
};
