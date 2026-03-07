'use client';

import React, { useMemo } from 'react';
import { HardDrive } from 'lucide-react';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFieldArrayRemove,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { IAllModel, IVectorRag, ISLMForm, IEmbedding, IReRanking, IDatabase } from '@/models';
import { FormBody } from './form-body';
import { PromptResponse } from '../../../agents/components/agent-form';

export type VectorRagConfigurationFormProps = {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IVectorRag>;
    isSaving: boolean;
    embeddings: IEmbedding[];
    reRankings: IReRanking[];
    loadingEmbeddings: boolean;
    loadingReRankings: boolean;
    isModalRequest?: boolean;
    loadingDatabases: boolean;
    databases: IDatabase[];
    isReadOnly?: boolean;
    control: Control<IVectorRag, unknown>;
    allModels: IAllModel[] | undefined;
    llmModelsLoading?: boolean;
    allSLMModels: ISLMForm[] | undefined;
    slmModelsLoading?: boolean;
    allPrompts: PromptResponse[] | undefined;
    promptsLoading?: boolean;
    currentStep?: number;
    completed?: boolean;
    retrievalFields: FieldArrayWithId<IVectorRag, 'configurations.retrievals', 'id'>[];
    index?: number;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IVectorRag>;
    watch: UseFormWatch<IVectorRag>;
    trigger: UseFormTrigger<IVectorRag>;
    getValues: UseFormGetValues<IVectorRag>;
    setValue: UseFormSetValue<IVectorRag>;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    removeRetrieval: UseFieldArrayRemove;
    appendRetrieval: () => void;
    handleSubmit: UseFormHandleSubmit<IVectorRag>;
    onHandleSubmit: (data: IVectorRag) => void;
    refetch: () => void;
    refetchEmbedding: () => void;
    refetchReRanking: () => void;
    refetchLlms: () => void;
    refetchSLM: () => void;
    onRefetchPrompt: () => void;
};

export const VectorRagConfigurationForm = (props: VectorRagConfigurationFormProps) => {
    const {
        isOpen,
        isEdit,
        isValid,
        isSaving,
        currentStep,
        setCurrentStep,
        setOpen,
        handleSubmit,
        onHandleSubmit,
        watch,
        trigger,
    } = props;

    const buttonLabel = useMemo(() => {
        if (currentStep === 3) {
            if (isSaving) return 'Saving';
            return isEdit ? 'Update' : 'Create';
        }
        return 'Next';
    }, [currentStep, isSaving, isEdit]);

    const handleNext = () => {
        if (currentStep! < 3) {
            setCurrentStep?.(currentStep! + 1);
        }
    };

    const handlePrevious = async () => {
        if (currentStep! > 1) {
            setCurrentStep?.(currentStep! - 1);
        }
        await trigger();
    };

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            bodyClassName="p-0 my-0"
            dismissible={false}
            headerIcon={<HardDrive />}
            header={isEdit ? 'Edit Vector RAG Configurations' : 'New Vector RAG Configurations'}
            footer={
                <div className="flex justify-end">
                    <div className="flex justify-end gap-2">
                        {!currentStep || currentStep === 1 ? (
                            <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                        ) : (
                            <Button variant={'secondary'} size={'sm'} onClick={handlePrevious}>
                                Previous
                            </Button>
                        )}
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                            onClick={currentStep !== 3 ? handleNext : handleSubmit(onHandleSubmit)}
                                        >
                                            {buttonLabel}
                                        </Button>
                                    </TooltipTrigger>
                                    {currentStep !== 1 && (
                                        <TooltipContent side="left" align="center">
                                            All details need to be filled before the form can be continued
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};
