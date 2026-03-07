'use client';

import {
    Button,
    Input,
    SelectableRadioItem,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType } from '@/components/organisms';
import { useVectorRagConfiguration } from '@/hooks/use-vector-rag-configuration';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { FormBody as VectorRagFormBody } from '@/app/workspace/[wid]/knowledge-source-configs/vector-rag-configurations/components/form-body';
import { IVectorRag } from '@/models';
import { ActivationType } from '@/enums';
import { toast } from 'sonner';

const VectorRagEmptyState = ({ searchTerm, className }: { searchTerm: string; className?: string }) => (
    <div
        className={`w-full flex flex-col items-center gap-y-1 justify-center h-full border dark:border-gray-700 px-3 py-3 rounded-lg ${className}`}
    >
        <FileX className="text-gray-500 dark:text-gray-300" />
        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
            {searchTerm === '' ? (
                <>
                    No Vector RAGs have been
                    <br />
                    configured
                </>
            ) : (
                <>No results found</>
            )}
        </p>
    </div>
);

const VectorRagLoadingState = ({ message }: { message?: string }) => (
    <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
        <LoaderCircle className="animate-spin" size={25} width={25} height={25} absoluteStrokeWidth={undefined} />
        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
            {message || 'Please wait! loading the vector RAGs data for you...'}
        </p>
    </div>
);

const VectorRagList = ({
    rags,
    checkedItemId,
    handleItemCheck,
    onEdit,
}: {
    rags: IVectorRag[];
    checkedItemId: string[] | undefined;
    handleItemCheck: (rag: IVectorRag) => void;
    onEdit: (id: string) => void;
}) => (
    <>
        {rags.map(rag => (
            <SelectableRadioItem
                key={rag.id as string}
                id={rag.id as string}
                title="Vector RAG"
                label={rag.name}
                description={rag.description}
                isChecked={checkedItemId?.includes(rag.id as string) ?? false}
                imagePath="/png/rag-state-icon.png"
                handleClick={() => handleItemCheck(rag)}
                onEdit={onEdit}
                hasEdit={!rag?.isReadOnly}
            />
        ))}
    </>
);

export interface VectorRagSelectorRef {
    onMount: () => void;
}

export type VectorRagSelectorProps = {
    agent: AgentType | undefined;
    vectorRags: IVectorRag[];
    allVectorRags: IVectorRag[];
    vectorRagLoading?: boolean;
    labelClassName?: string;
    isReadonly?: boolean;
    setVectorRags: (rags: IVectorRag[]) => void;
    onRefetch: () => void;
    onVectorRagChange?: (mcp: IVectorRag[] | undefined) => void;
    isMultiple?: boolean;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
};

export const VectorRagSelector = forwardRef<VectorRagSelectorRef, VectorRagSelectorProps>(
    (
        {
            agent,
            vectorRags,
            allVectorRags,
            setVectorRags,
            onRefetch,
            vectorRagLoading,
            labelClassName,
            onVectorRagChange,
            isMultiple = true,
            showListOnly = false,
            isReadonly,
            setInputDataConnectModalOpen,
        },
        ref
    ) => {
        const {
            isSaving,
            control,
            errors,
            isValid,
            isOpen,
            isEdit,
            embeddings,
            reRankings,
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
            currentStep,
            retrievalFields,
            completed,
            appendRetrieval,
            removeRetrieval,
            setIsOpen,
            setCurrentStep,
            register,
            getValues,
            trigger,
            watch,
            setValue,
            handleSubmit,
            onHandleSubmit,
            setEdit,
            handleCreate,
            refetch,
            refetchEmbedding,
            refetchReRanking,
            refetchLlms,
            refetchSLM,
            refetchPrompts,
        } = useVectorRagConfiguration({ triggerQuery: false, onRefetch });

        const [openModal, setOpenModal] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [allSearchableRAGs, setAllSearchableRAGs] = useState<IVectorRag[]>(vectorRags);
        const [checkedItemId, setCheckedItemId] = useState<string[]>();
        const [mounted, setMounted] = useState<ActivationType>(ActivationType.DEACTIVATE);
        const [isReordered, setIsReordered] = useState(false);
        const [userIntentToRemove, setUserIntentToRemove] = useState(false);

        useEffect(() => {
            if (mounted === ActivationType.ACTIVATE) return;

            if (vectorRags?.length > 0 && allVectorRags?.length > 0) {
                setMounted(ActivationType.ACTIVATE);
                const ids = vectorRags?.map(x => x.id);
                const data = allVectorRags.filter(x => ids.includes(x.id as string));
                setVectorRags([...data]);
            }
        }, [vectorRags, allVectorRags, mounted, setVectorRags]);

        const dialogTitle = useMemo(() => {
            if (!isOpen) return 'Vector RAGs';
            return isEdit ? 'Edit Vector RAG Config' : 'New Vector RAG Config';
        }, [isOpen, isEdit]);

        const buttonLabel = useMemo(() => {
            if (currentStep === 3) {
                if (isSaving) return 'Saving';
                return isEdit ? 'Update' : 'Create';
            }
            return 'Next';
        }, [currentStep, isSaving, isEdit]);

        const selectedVectorRags = useMemo(() => {
            if (showListOnly && vectorRags?.length > 0 && allVectorRags?.length > 0) {
                const vectorRagIds = vectorRags?.map(x => x.id as string);
                return allVectorRags?.filter(x => vectorRagIds.includes(x.id as string));
            }
            return [];
        }, [vectorRags, allVectorRags, showListOnly]);

        useImperativeHandle(ref, () => ({
            onMount: () => {
                setMounted(ActivationType.DEACTIVATE);
            },
        }));

        const getModelFromReusableAgent = () => {
            if (!agent && !allVectorRags) return undefined;

            const targetRags = agent?.isReusableAgentSelected ? agent.rags : vectorRags;
            if (!targetRags) return undefined;

            const ragDetails = agent?.isReusableAgentSelected
                ? allVectorRags?.filter(x => agent.rags?.map(r => r.id)?.includes(x.id as string))
                : vectorRags;

            const value =
                ragDetails?.map(rag => ({
                    title: rag.name,
                    description: `${rag.description?.slice(0, 30)}...`,
                    imagePath: '/png/rag-state-icon.png',
                })) || [];

            return value.length > 0 ? value : undefined;
        };

        const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const searchTerm = e.target.value.toLowerCase();
            setSearchTerm(searchTerm);
        };

        const onModalClose = (open: boolean, cancel?: boolean) => {
            if (isOpen) {
                setIsOpen(false);
            } else if (cancel) {
                setOpenModal(false);
                // trigger only when showListOnly is true
                // setInputDataConnectModalOpen is the state function from parent component to close the modal
                setInputDataConnectModalOpen?.(false);
                setAllSearchableRAGs(allVectorRags);
            } else {
                setOpenModal(open);
            }
        };

        const handleClick = () => {
            const checkedRAGs = allSearchableRAGs.filter(rag => checkedItemId?.includes(rag.id as string));

            // Reorder: selected on top, others below (keep original relative order)
            const selected = allVectorRags.filter((rag: IVectorRag) => checkedItemId?.includes(rag.id as string));
            const unselected = allVectorRags.filter((rag: IVectorRag) => !checkedItemId?.includes(rag.id as string));
            const reorderedList = [...selected, ...unselected];

            setAllSearchableRAGs(reorderedList);
            setIsReordered(true); // Mark as reordered

            setVectorRags(checkedRAGs ?? []);
            setOpenModal(false);

            if (showListOnly) {
                toast.success('Vector RAGs updated successfully');
            }
            if (onVectorRagChange) {
                onVectorRagChange(checkedRAGs);
            }
        };

        const handleItemCheck = (rag: IVectorRag) => {
            const ragId = rag.id;
            if (!ragId) return;

            setCheckedItemId(prev => {
                const isSelected = prev?.includes(ragId);
                if (!isMultiple) return isSelected ? [] : [ragId];
                return isSelected ? prev!.filter(id => id !== ragId) : [...(prev || []), ragId];
            });
        };

        useEffect(() => {
            if (checkedItemId === undefined && vectorRags !== undefined && userIntentToRemove) {
                setVectorRags([]);
                if (onVectorRagChange) {
                    onVectorRagChange([]);
                }
                setAllSearchableRAGs(allVectorRags);
                setIsReordered(false);
                setUserIntentToRemove(false);
            }
        }, [checkedItemId, vectorRags, userIntentToRemove, setVectorRags, onVectorRagChange, allVectorRags]);

        const handleChange = () => {
            setOpenModal(true);

            if (!agent?.isReusableAgentSelected && vectorRags) {
                const selectedRAGs = vectorRags.map(rag => rag.id).filter((id): id is string => !!id);
                setCheckedItemId(selectedRAGs);

                // Reorder: selected on top, others below (keep original relative order)
                const selected = allVectorRags.filter((rag: IVectorRag) => selectedRAGs.includes(rag.id as string));
                const unselected = allVectorRags.filter((rag: IVectorRag) => !selectedRAGs.includes(rag.id as string));
                setAllSearchableRAGs([...selected, ...unselected]);
                setIsReordered(true); // Mark as reordered
            }
        };

        const hasAnyChanges = useMemo(() => {
            const originalIds = vectorRags?.map(rag => rag.id).filter((id): id is string => id != null) ?? [];
            const currentIds = checkedItemId || [];

            if (originalIds.length !== currentIds.length) return true;

            const currentIdsSet = new Set(currentIds);
            return !originalIds.every(id => currentIdsSet.has(id));
        }, [checkedItemId, vectorRags]);

        const handleRemove = () => {
            setCheckedItemId(undefined);
            setVectorRags([]);
            if (onVectorRagChange) {
                onVectorRagChange(undefined);
            }
        };

        useEffect(() => {
            if (vectorRags?.length > 0 && allVectorRags?.length > 0) {
                // If there are selected vector rags, maintain them at the top
                const selectedIds = new Set(vectorRags.map(rag => rag.id));
                const selected = allVectorRags.filter(rag => selectedIds.has(rag.id as string));
                const unselected = allVectorRags.filter(rag => !selectedIds.has(rag.id as string));
                setAllSearchableRAGs([...selected, ...unselected]);
                setIsReordered(true);
            } else if (!isReordered) {
                // Only use original order if nothing has been reordered yet
                setAllSearchableRAGs(allVectorRags);
            }

            if (showListOnly) {
                setCheckedItemId(vectorRags.map(rag => rag.id as string));
            } else {
                setCheckedItemId([]);
            }
        }, [allVectorRags, showListOnly, vectorRags, isReordered]);

        // Sync fresh objects from allVectorRags when data changes (e.g. after edit)
        useEffect(() => {
            if (vectorRags?.length > 0 && allVectorRags?.length > 0) {
                const ids = new Set(vectorRags.map(c => c.id as string));
                // Get fresh objects from allVectorRags to ensure latest data (name, description, etc.)
                const updatedRags = allVectorRags.filter(x => ids.has(x.id as string));

                // Deep consistency check to avoid infinite loop
                const hasSignificantChanges =
                    updatedRags.length !== vectorRags.length ||
                    updatedRags.some((updated, index) => {
                        const current = vectorRags[index];
                        return (
                            current &&
                            (updated.id !== current.id ||
                                updated.name !== current.name ||
                                updated.description !== current.description)
                        );
                    });

                if (hasSignificantChanges) {
                    setVectorRags(updatedRags);
                    if (onVectorRagChange) {
                        onVectorRagChange(updatedRags);
                    }
                }
            }
        }, [allVectorRags, vectorRags, setVectorRags, onVectorRagChange]);

        const getSourceValue = (source?: { llmId?: string; slmId?: string }) => {
            if (!source) return undefined;
            return source.llmId && source.llmId.trim() !== '' ? source.llmId : source.slmId;
        };

        const onEdit = (id: string) => {
            const obj = allVectorRags?.find((x: IVectorRag) => x.id === id);
            if (!obj) return;

            setEdit(true);
            setValue('id', obj.id);
            setValue('name', obj.name);
            setValue('description', obj.description);
            setValue('configurations', obj.configurations);
            setValue('configurations.ragVariant', obj.configurations.ragVariant);
            setValue('configurations.retrievals', obj.configurations.retrievals);
            setValue('configurations.generatorSource.sourceValue', getSourceValue(obj.configurations.generatorSource));
            setValue('configurations.fusionRag.sourceValue', getSourceValue(obj.configurations.fusionRag));

            obj.configurations?.retrievals?.forEach(
                (
                    item: {
                        reRankingScoreThreshold?: number;
                        queryExpansionSource?: { llmId?: string; slmId?: string };
                        hydeSource?: { llmId?: string; slmId?: string };
                    },
                    index: number
                ) => {
                    setValue(
                        `configurations.retrievals.${index}.reRankingScoreThreshold`,
                        item.reRankingScoreThreshold ?? 0
                    );
                    setValue(
                        `configurations.retrievals.${index}.queryExpansionSource.sourceValue`,
                        getSourceValue(item.queryExpansionSource)
                    );
                    setValue(
                        `configurations.retrievals.${index}.hydeSource.sourceValue`,
                        getSourceValue(item.hydeSource)
                    );
                }
            );
            setIsOpen(true);
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
        const filteredRAGs = allSearchableRAGs.filter(
            rag =>
                rag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rag.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        function renderFormBody() {
            return (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    <VectorRagFormBody
                        isOpen={isOpen}
                        isEdit={isEdit}
                        isValid={isValid}
                        errors={errors}
                        isSaving={isSaving}
                        control={control}
                        retrievalFields={retrievalFields}
                        databases={databases ?? []}
                        embeddings={embeddings ?? []}
                        reRankings={reRankings ?? []}
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
                        isModalRequest={true}
                        setCurrentStep={setCurrentStep}
                        setOpen={setIsOpen}
                        register={register}
                        getValues={getValues}
                        trigger={trigger}
                        watch={watch}
                        setValue={setValue}
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
                    />
                </div>
            );
        }

        function renderSelectorContent() {
            return (
                <>
                    <div className="flex items-center gap-x-5 w-full h-fit">
                        <Input className="w-full" placeholder="Search Vector RAGs" onChange={handleSearch} />
                        {!isOpen && (
                            <Button
                                variant="link"
                                disabled={isReadonly}
                                onClick={() => setIsOpen(true)}
                                className="min-w-fit"
                            >
                                New Vector RAGs
                            </Button>
                        )}
                    </div>
                    {filteredRAGs.length > 0 ? (
                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                            {selectedVectorRags && selectedVectorRags.length > 0 && (
                                <>
                                    <p className="text-xs dark:text-gray-400 uppercase tracking-wide mb-1">
                                        Selected Vector RAGs
                                    </p>

                                    <VectorRagList
                                        rags={selectedVectorRags}
                                        checkedItemId={checkedItemId}
                                        handleItemCheck={handleItemCheck}
                                        onEdit={onEdit}
                                    />
                                    <div className="border-t dark:border-gray-600 border-gray-400 my-3" />
                                </>
                            )}
                            <VectorRagList
                                rags={(() => {
                                    const selectedIds = new Set(vectorRags?.map(vr => vr.id));
                                    return filteredRAGs.filter((rag: IVectorRag) => !selectedIds.has(rag.id));
                                })()}
                                checkedItemId={checkedItemId}
                                handleItemCheck={handleItemCheck}
                                onEdit={onEdit}
                            />
                        </div>
                    ) : (
                        <VectorRagEmptyState searchTerm={searchTerm} />
                    )}
                </>
            );
        }

        function renderListOnlyFooter() {
            return (
                <div className="h-fit flex justify-end gap-x-2 mr-4">
                    {isOpen ? (
                        <>
                            {currentStep >= 2 ? (
                                <Button variant={'secondary'} size={'sm'} onClick={handlePrevious}>
                                    Previous
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={currentStep === 3 ? handleSubmit(onHandleSubmit) : handleNext}
                            >
                                {buttonLabel}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                                Cancel
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="primary" onClick={handleClick} disabled={!hasAnyChanges}>
                                            Apply Changes
                                        </Button>
                                    </TooltipTrigger>
                                    {hasAnyChanges ? null : (
                                        <TooltipContent side="left" align="center">
                                            No changes to apply
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}
                </div>
            );
        }

        function renderModalFooter() {
            return (
                <DialogFooter>
                    {isOpen && currentStep >= 2 ? (
                        <Button variant={'secondary'} onClick={handlePrevious}>
                            Previous
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                    )}
                    {isOpen ? (
                        <Button
                            variant="primary"
                            disabled={!isValid || isSaving}
                            onClick={currentStep === 3 ? handleSubmit(onHandleSubmit) : handleNext}
                        >
                            {buttonLabel}
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="primary" onClick={handleClick} disabled={!hasAnyChanges}>
                                        Apply Changes
                                    </Button>
                                </TooltipTrigger>
                                {hasAnyChanges ? null : (
                                    <TooltipContent side="left" align="center">
                                        No changes to apply
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </DialogFooter>
            );
        }

        function renderMainFooter() {
            if (vectorRags?.length && !agent?.isReusableAgentSelected) {
                return (
                    <div className=" w-full flex justify-start items-center gap-x-3">
                        <Button variant="link" className="text-blue-400" onClick={handleChange}>
                            Change
                        </Button>
                        <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                            {isMultiple ? 'Remove all' : 'Remove'}
                        </Button>
                    </div>
                );
            }

            return (
                <>
                    {vectorRags?.length || agent ? null : (
                        <Button variant="link" onClick={() => setOpenModal(true)}>
                            {isMultiple ? 'Add Vector RAGs' : 'Add Vector RAG'}
                        </Button>
                    )}
                </>
            );
        }

        function renderListOnlyView() {
            return (
                <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                    {isOpen ? (
                        renderFormBody()
                    ) : (
                        <>{vectorRagLoading ? <VectorRagLoadingState /> : renderSelectorContent()}</>
                    )}
                    {renderListOnlyFooter()}
                </div>
            );
        }

        function renderDefaultView() {
            return (
                <>
                    <DetailItemInput
                        label="Vector RAGs"
                        labelClassName={labelClassName}
                        values={getModelFromReusableAgent()}
                        imagePath="/png/empty-state-rag.png"
                        imageType="png"
                        imageWidth="120"
                        description="Select vector RAG configurations for enhanced retrieval capabilities"
                        footer={renderMainFooter()}
                    />
                    <Dialog open={openModal} onOpenChange={onModalClose}>
                        <DialogContent className="max-w-[unset] w-[580px]">
                            <DialogHeader className="px-0">
                                <DialogTitle asChild>
                                    <div className="px-4 flex gap-2">
                                        {isOpen && <Unplug />}
                                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                            {dialogTitle}
                                        </p>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>
                            <DialogDescription asChild>
                                <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                                    {!isOpen && (
                                        <div className="flex justify-end">
                                            <Button variant="link" disabled={isReadonly} onClick={() => handleCreate()}>
                                                New Vector RAGs
                                            </Button>
                                        </div>
                                    )}
                                    {isOpen ? (
                                        renderFormBody()
                                    ) : (
                                        <>
                                            {vectorRagLoading ? (
                                                <VectorRagLoadingState message="Please wait! loading the Vector Rags data for you..." />
                                            ) : (
                                                <>
                                                    <Input
                                                        className="w-full"
                                                        placeholder="Search Vector RAGs"
                                                        onChange={handleSearch}
                                                    />
                                                    {filteredRAGs.length > 0 ? (
                                                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                            <VectorRagList
                                                                rags={filteredRAGs}
                                                                checkedItemId={checkedItemId}
                                                                handleItemCheck={handleItemCheck}
                                                                onEdit={onEdit}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <VectorRagEmptyState
                                                            searchTerm={searchTerm}
                                                            className="bg-[#1e2835]"
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </DialogDescription>
                            {renderModalFooter()}
                        </DialogContent>
                    </Dialog>
                </>
            );
        }

        return showListOnly ? renderListOnlyView() : renderDefaultView();
    }
);

VectorRagSelector.displayName = 'VectorRagSelector';
