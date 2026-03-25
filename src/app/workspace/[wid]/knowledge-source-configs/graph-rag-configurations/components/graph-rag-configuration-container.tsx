'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { GraphRagConfigurationTable } from './graph-rag-configuration-table';
import { useGraphRagConfiguration } from '@/hooks/use-graph-rag-configuration';
import { GraphRagConfigurationForm } from './graph-rag-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const GraphRagConfigurationContainer = () => {
    const {
        isFetching,
        isOpen,
        isEdit,
        isValid,
        errors,
        isSaving,
        graphRagConfigsTableData,
        databases,
        embeddings,
        reRankings,
        llmModels,
        slmModels,
        prompts,
        loadingDatabases,
        loadingEmbeddings,
        loadingReRankings,
        loadingLlmModels,
        loadingSlmModels,
        loadingPrompts,
        control,
        currentStep,
        completed,
        retrievalFields,
        appendRetrieval,
        removeRetrieval,
        setCurrentStep,
        getValues,
        onGraphRagConfigurationFilter,
        setIsOpen,
        onDelete,
        onEdit,
        setValue,
        register,
        trigger,
        watch,
        onHandleSubmit,
        handleSubmit,
        handleCreate,
        refetchDatabase,
        refetchEmbedding,
        refetchReRanking,
        refetchLLM,
        refetchSLM,
        refetchPrompt,
    } = useGraphRagConfiguration();
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
                        <GraphRagConfigurationTable
                            data={graphRagConfigsTableData}
                            onGraphRagConfigurationFilter={onGraphRagConfigurationFilter}
                            onNewButtonClick={handleCreate}
                            onEditButtonClick={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </div>
            <GraphRagConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                isValid={isValid}
                errors={errors}
                isSaving={isSaving}
                databases={databases ?? []}
                embeddings={embeddings ?? []}
                reRankings={reRankings ?? []}
                llmModels={llmModels}
                slmModels={slmModels}
                prompts={prompts}
                loadingDatabases={loadingDatabases}
                loadingEmbeddings={loadingEmbeddings}
                loadingReRankings={loadingReRankings}
                loadingLlmModels={loadingLlmModels}
                loadingSlmModels={loadingSlmModels}
                loadingPrompts={loadingPrompts}
                control={control}
                currentStep={currentStep}
                completed={completed}
                retrievalFields={retrievalFields}
                appendRetrieval={appendRetrieval}
                removeRetrieval={removeRetrieval}
                setCurrentStep={setCurrentStep}
                getValues={getValues}
                setOpen={setIsOpen}
                register={register}
                trigger={trigger}
                setValue={setValue}
                watch={watch}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetchDatabase={refetchDatabase}
                refetchEmbedding={refetchEmbedding}
                refetchReRanking={refetchReRanking}
                refetchLLM={refetchLLM}
                refetchSLM={refetchSLM}
                refetchPrompt={refetchPrompt}
                showTestConnectionScenarioToggle={true}
            />
        </>
    );
};
