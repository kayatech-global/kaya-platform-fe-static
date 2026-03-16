'use client';

import { Button } from '@/components';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType } from '@/components/organisms';
import { forwardRef, useImperativeHandle } from 'react';
import { FormBody as GraphRagFormBody } from '@/app/workspace/[wid]/knowledge-source-configs/graph-rag-configurations/components/graph-rag-configuration-form';
import { IGraphRag } from '@/models';
import { useGraphRagConfiguration } from '@/hooks/use-graph-rag-configuration';
import { getEnumValueByKey } from '@/lib/utils';
import { ActivationType, GraphRagType, KnowledgeGraphSearchType } from '@/enums';
import { useGraphRagSelection } from './graph-rag-selector/use-graph-rag-selection';
import { GraphRagList } from './graph-rag-selector/graph-rag-list';
import { GraphRagDialog } from './graph-rag-selector/graph-rag-dialog';
import { GraphRagFooter } from './graph-rag-selector/graph-rag-footer';

export interface GraphRagSelectorRef {
    onMount: () => void;
}

export type GraphRagSelectorProps = {
    agent: AgentType | undefined;
    graphRags: IGraphRag[];
    allGraphRags: IGraphRag[];
    setGraphRags: (configs: IGraphRag[]) => void;
    onRefetch: () => void;
    onGraphRagChange?: (mcp: IGraphRag[] | undefined) => void;
    labelClassName?: string;
    graphRagLoading?: boolean;
    isReadonly?: boolean;
    isMultiple?: boolean;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
};

export const GraphRagConfigSelector = forwardRef<GraphRagSelectorRef, GraphRagSelectorProps>(
    (
        {
            agent,
            graphRags,
            allGraphRags,
            setGraphRags,
            onRefetch,
            onGraphRagChange,
            labelClassName,
            graphRagLoading,
            isMultiple = true,
            showListOnly = false,
            isReadonly,
            setInputDataConnectModalOpen,
        },
        ref
    ) => {
        const {
            isOpen, // Form open state
            isEdit,
            isValid,
            errors,
            isSaving,
            control,
            databases,
            embeddings,
            reRankings,
            llmModels,
            slmModels,
            prompts,
            loadingEmbeddings,
            loadingReRankings,
            loadingDatabases,
            loadingLlmModels,
            loadingSlmModels,
            loadingPrompts,
            currentStep,
            completed,
            retrievalFields,
            removeRetrieval,
            appendRetrieval,
            setCurrentStep,
            setIsOpen, // Set form open state
            setEdit,
            setValue,
            register,
            getValues,
            trigger,
            watch,
            onHandleSubmit,
            handleSubmit,
            handleCreate,
            refetchEmbedding,
            refetchReRanking,
            refetchDatabase,
            refetchLLM,
            refetchSLM,
            refetchPrompt,
        } = useGraphRagConfiguration({ triggerQuery: false, onRefetch });

        const {
            openModal,
            setOpenModal,
            searchTerm,
            filteredGraphRAGs,
            checkedItemId,
            handleItemCheck,
            handleApplyChanges,
            handleSearch,
            handleRemoveAll,
            hasAnyChanges,
            onModalClose,
            setMounted,
        } = useGraphRagSelection({
            graphRags,
            allGraphRags,
            setGraphRags,
            isMultiple,
            onGraphRagChange,
            showListOnly,
            setInputDataConnectModalOpen,
            isOpen,
            setIsOpen,
        });

        useImperativeHandle(ref, () => ({
            onMount: () => {
                setMounted(ActivationType.DEACTIVATE);
            },
        }));

        const getModelFromReusableAgent = () => {
            if (!agent && !allGraphRags) {
                return undefined;
            }

            let value: valuesProps[] = [];

            if (agent?.isReusableAgentSelected) {
                if (!agent.knowledgeGraphs) return undefined;
                const knowledgeGraphDetails = allGraphRags?.filter(x =>
                    agent.knowledgeGraphs?.map(x => x.id)?.includes(x.id as string)
                );
                const configListFromReusableAgent = knowledgeGraphDetails?.map(config => {
                    return {
                        title: config.name,
                        description: `${config.description?.slice(0, 30)}...`,
                        imagePath: '/png/kg.png',
                    };
                });
                value = configListFromReusableAgent?.length ? [...configListFromReusableAgent] : [];
            } else if (graphRags) {
                const selectedConfigs = graphRags.map(config => {
                    return {
                        title: config.name,
                        description: `${config.description?.slice(0, 30)}...`,
                        imagePath: '/png/kg.png',
                    };
                });

                value = [...selectedConfigs];
            }

            return value.length > 0 ? value : undefined;
        };

        const onEdit = (id: string) => {
            if (id) {
                const obj = allGraphRags?.find(x => x.id === id);
                if (obj) {
                    const graphRagType = getEnumValueByKey(
                        obj.configurations.graphRagType,
                        GraphRagType
                    ) as GraphRagType;
                    const isGeneratorLlm = !!(
                        obj?.configurations?.generatorSource?.llmId &&
                        obj?.configurations?.generatorSource?.llmId?.trim() !== ''
                    );
                    const isCorrectiveRagLlm = !!(
                        obj?.configurations?.correctiveRag?.llmId &&
                        obj?.configurations?.correctiveRag?.llmId?.trim() !== ''
                    );
                    setValue('id', obj.id);
                    setValue('name', obj.name);
                    setValue('description', obj.description);
                    setValue('isReadOnly', obj.isReadOnly);
                    setValue('configurations', obj.configurations);
                    setValue('configurations.graphRagType', graphRagType);
                    setValue('configurations.retrievals', obj.configurations.retrievals);
                    setValue(
                        'configurations.generatorSource.sourceValue',
                        isGeneratorLlm
                            ? obj?.configurations?.generatorSource?.llmId
                            : obj?.configurations?.generatorSource?.slmId
                    );
                    setValue(
                        'configurations.correctiveRag.sourceValue',
                        isCorrectiveRagLlm
                            ? obj?.configurations?.correctiveRag?.llmId
                            : obj?.configurations?.correctiveRag?.slmId
                    );
                    if (obj.configurations?.retrievals?.length > 0) {
                        obj.configurations.retrievals.forEach((item, index) => {
                            const queryUnderstandingType = getEnumValueByKey(
                                item.queryUnderstanding?.queryType ?? '',
                                KnowledgeGraphSearchType
                            ) as KnowledgeGraphSearchType;
                            const isQueryExpansionLlm = !!(
                                item?.queryExpansionSource?.llmId && item?.queryExpansionSource?.llmId?.trim() !== ''
                            );
                            const isHydeLlm = !!(item?.hydeSource?.llmId && item?.hydeSource?.llmId?.trim() !== '');
                            const isQueryExpansionSourceLlm = !!(
                                item?.queryUnderstanding?.llmId && item?.queryUnderstanding?.llmId?.trim() !== ''
                            );
                            setValue(
                                `configurations.retrievals.${index}.queryUnderstanding.queryType`,
                                queryUnderstandingType ?? ''
                            );
                            setValue(
                                `configurations.retrievals.${index}.queryUnderstanding.sourceValue`,
                                isQueryExpansionSourceLlm
                                    ? item?.queryUnderstanding?.llmId
                                    : item?.queryUnderstanding?.slmId
                            );
                            setValue(
                                `configurations.retrievals.${index}.reRankingScoreThreshold`,
                                item.reRankingScoreThreshold ?? 0
                            );
                            setValue(
                                `configurations.retrievals.${index}.queryExpansionSource.sourceValue`,
                                isQueryExpansionLlm
                                    ? item?.queryExpansionSource?.llmId
                                    : item?.queryExpansionSource?.slmId
                            );
                            setValue(
                                `configurations.retrievals.${index}.hydeSource.sourceValue`,
                                isHydeLlm ? item?.hydeSource?.llmId : item?.hydeSource?.slmId
                            );
                        });
                    }
                }
                setEdit(true);
                setIsOpen(true);
            }
        };

        const handleNext = () => {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            }
        };

        const handlePrevious = async () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
            }
            await trigger();
        };

        const handleModalChange = () => {
            setOpenModal(true);
        };

        if (showListOnly) {
            return (
                <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                    {isOpen ? (
                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                            <GraphRagFormBody
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
                                isModalRequest={true}
                                retrievalFields={retrievalFields}
                                removeRetrieval={removeRetrieval}
                                appendRetrieval={appendRetrieval}
                                getValues={getValues}
                                setCurrentStep={setCurrentStep}
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
                            />
                        </div>
                    ) : (
                        <GraphRagList
                            isLoading={!!graphRagLoading} // coerce to boolean
                            searchTerm={searchTerm}
                            onSearchChange={handleSearch}
                            filteredGraphRAGs={filteredGraphRAGs}
                            graphRags={graphRags}
                            checkedItemIds={checkedItemId}
                            onItemCheck={handleItemCheck}
                            onEdit={onEdit}
                            isReadonly={isReadonly}
                            showAddNewButton={!isOpen}
                            onAddNew={() => setIsOpen(true)}
                        />
                    )}

                    <GraphRagFooter
                        isOpen={isOpen}
                        currentStep={currentStep}
                        isValid={isValid}
                        isSaving={isSaving}
                        isEdit={isEdit}
                        hasAnyChanges={hasAnyChanges}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onSubmit={handleSubmit(onHandleSubmit)}
                        onCancel={() => onModalClose(false, true)}
                        onApply={handleApplyChanges}
                    />
                </div>
            );
        }

        return (
            <>
                <DetailItemInput
                    label="Graph RAGs"
                    labelClassName={labelClassName}
                    values={getModelFromReusableAgent()}
                    imagePath="/png/empty-state-kg.png"
                    imageType="png"
                    description="Select graph RAG configurations for enhanced knowledge retrieval"
                    footer={
                        graphRags?.length && !agent?.isReusableAgentSelected ? (
                            <div className="w-full flex justify-start items-center gap-x-3">
                                <Button variant="link" className="text-blue-400" onClick={handleModalChange}>
                                    Change
                                </Button>
                                <Button
                                    variant="link"
                                    className="text-red-500 hover:text-red-400"
                                    onClick={handleRemoveAll}
                                >
                                    Remove all
                                </Button>
                            </div>
                        ) : (
                            <>
                                {!graphRags?.length && !agent && (
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setOpenModal(true);
                                        }}
                                    >
                                        Add Graph RAGs
                                    </Button>
                                )}
                            </>
                        )
                    }
                />

                <GraphRagDialog
                    open={openModal}
                    onOpenChange={onModalClose}
                    isFormOpen={isOpen}
                    isEdit={isEdit}
                    onCreateNew={() => handleCreate()}
                    footer={
                        <GraphRagFooter
                            isOpen={isOpen}
                            currentStep={currentStep}
                            isValid={isValid}
                            isSaving={isSaving}
                            isEdit={isEdit}
                            hasAnyChanges={hasAnyChanges}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onSubmit={handleSubmit(onHandleSubmit)}
                            onCancel={() => onModalClose(false, true)}
                            onApply={handleApplyChanges}
                        />
                    }
                >
                    {isOpen ? (
                        <div className="item-list-container pb-1 overflow-y-auto flex flex-col gap-y-2">
                            <GraphRagFormBody
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
                                isModalRequest={true}
                                retrievalFields={retrievalFields}
                                removeRetrieval={removeRetrieval}
                                appendRetrieval={appendRetrieval}
                                getValues={getValues}
                                setCurrentStep={setCurrentStep}
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
                            />
                        </div>
                    ) : (
                        <GraphRagList
                            isLoading={!!graphRagLoading} // coerce
                            searchTerm={searchTerm}
                            onSearchChange={handleSearch}
                            filteredGraphRAGs={filteredGraphRAGs}
                            graphRags={graphRags}
                            checkedItemIds={checkedItemId}
                            onItemCheck={handleItemCheck}
                            onEdit={onEdit}
                            isReadonly={isReadonly}
                            showAddNewButton={false} // Dialog doesn't show "New" button in list area (it has it in header if needed or relying on parent)
                            onAddNew={() => setIsOpen(true)}
                        />
                    )}
                </GraphRagDialog>
            </>
        );
    }
);

GraphRagConfigSelector.displayName = 'GraphRagConfigSelector';
