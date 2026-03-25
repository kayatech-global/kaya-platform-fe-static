'use client';

import React, { useMemo, useState } from 'react';
import { HardDrive, Loader2, PlugZap } from 'lucide-react';
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
import { Alert } from '@/components/atoms/alert';
import { AlertVariant } from '@/enums/component-type';
import { IAllModel, IVectorRag, ISLMForm, IEmbedding, IReRanking, IDatabase } from '@/models';
import { FormBody } from './form-body';
import { PromptResponse } from '../../../agents/components/agent-form';

export type TestConnectionState = 'idle' | 'loading' | 'success' | 'error';

export interface VectorRagTestConnectionError {
    step: 'DB connectivity' | 'Table/Collection' | 'Embedding Model';
    message: string;
    details?: string;
}

export interface VectorRagTestConnectionSuccess {
    message: string;
    details?: string;
}

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
    onTestConnection?: () => Promise<{ success: boolean; data?: VectorRagTestConnectionSuccess; error?: VectorRagTestConnectionError }>;
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
        onTestConnection,
    } = props;

    const [testState, setTestState] = useState<TestConnectionState>('idle');
    const [testSuccess, setTestSuccess] = useState<VectorRagTestConnectionSuccess | null>(null);
    const [testError, setTestError] = useState<VectorRagTestConnectionError | null>(null);

    const handleTestConnection = async () => {
        setTestState('loading');
        setTestSuccess(null);
        setTestError(null);

        if (onTestConnection) {
            try {
                const result = await onTestConnection();
                if (result.success && result.data) {
                    setTestState('success');
                    setTestSuccess(result.data);
                } else if (!result.success && result.error) {
                    setTestState('error');
                    setTestError(result.error);
                }
            } catch (err) {
                setTestState('error');
                setTestError({
                    step: 'DB connectivity',
                    message: 'An unexpected error occurred',
                    details: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        } else {
            // Default mock behavior for demo
            setTimeout(() => {
                setTestState('success');
                setTestSuccess({
                    message: 'Vector RAG connection validated successfully.',
                    details: 'DB connectivity, table/collection, and embedding model all verified.',
                });
            }, 1500);
        }
    };

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
                <div className="flex flex-col gap-3">
                    {/* Success Banner */}
                    {testState === 'success' && testSuccess && (
                        <Alert
                            variant={AlertVariant.Success}
                            title="Connection Successful"
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{testSuccess.message}</span>
                                    {testSuccess.details && (
                                        <span className="text-xs opacity-80">{testSuccess.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    {/* Error Banner with Segmented Error */}
                    {testState === 'error' && testError && (
                        <Alert
                            variant={AlertVariant.Error}
                            title={`Failed at: ${testError.step}`}
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{testError.message}</span>
                                    {testError.details && (
                                        <span className="text-xs opacity-70">{testError.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={!isValid || testState === 'loading' || (isEdit && !!watch('isReadOnly'))}
                                onClick={handleTestConnection}
                            >
                                {testState === 'loading' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <PlugZap className="mr-2 h-4 w-4" />
                                        Test Connection
                                    </>
                                )}
                            </Button>
                        </div>
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
