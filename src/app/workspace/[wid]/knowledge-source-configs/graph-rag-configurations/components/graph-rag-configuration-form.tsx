/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormWatch,
    UseFormSetValue,
    UseFormTrigger,
    UseFormGetValues,
    FieldArrayWithId,
    UseFieldArrayRemove,
} from 'react-hook-form';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { SendToBack, Loader2, PlugZap } from 'lucide-react';
import { Alert } from '@/components/atoms/alert';
import { AlertVariant } from '@/enums/component-type';
import {
    SelectV2 as Select,
    SelectContentV2 as SelectContent,
    SelectItemV2 as SelectItem,
    SelectTriggerV2 as SelectTrigger,
    SelectValueV2 as SelectValue,
} from '@/components/atoms/select-v2';
import { IAllModel, IDatabase, IEmbedding, IGraphRag, IReRanking, ISLMForm } from '@/models';
import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import { BasicInfoTab } from './forms/basic-info-tab';
import { RetrievalTab } from './forms/retrieval-tab';
import { GeneratorTab } from './forms/generator-tab';

export type TestConnectionState = 'idle' | 'loading' | 'success' | 'error';

export interface GraphRagTestConnectionError {
    step: 'DB connectivity' | 'Node Label' | 'Embedding Property' | 'Query Execution';
    message: string;
    details?: string;
}

export interface GraphRagTestConnectionSuccess {
    message: string;
    details?: string;
}

export interface GraphRagConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IGraphRag>;
    isSaving: boolean;
    databases: IDatabase[];
    embeddings: IEmbedding[];
    reRankings: IReRanking[];
    loadingDatabases: boolean;
    loadingEmbeddings: boolean;
    loadingReRankings: boolean;
    loadingLlmModels: boolean;
    loadingSlmModels: boolean;
    loadingPrompts: boolean;
    llmModels: IAllModel[] | undefined;
    slmModels: ISLMForm[] | undefined;
    prompts: PromptResponse[] | undefined;
    control: Control<IGraphRag, any>;
    isModalRequest?: boolean;
    currentStep?: number;
    completed?: boolean;
    retrievalFields: FieldArrayWithId<IGraphRag, 'configurations.retrievals', 'id'>[];
    index?: number;
    removeRetrieval: UseFieldArrayRemove;
    appendRetrieval: () => void;
    setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
    getValues: UseFormGetValues<IGraphRag>;
    setValue: UseFormSetValue<IGraphRag>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IGraphRag>;
    trigger: UseFormTrigger<IGraphRag>;
    watch: UseFormWatch<IGraphRag>;
    handleSubmit: UseFormHandleSubmit<IGraphRag>;
    onHandleSubmit: (data: IGraphRag) => void;
    refetchDatabase: () => void;
    refetchEmbedding: () => void;
    refetchReRanking: () => void;
    refetchLLM: () => void;
    refetchSLM: () => void;
    refetchPrompt: () => void;
    onTestConnection?: () => Promise<{ success: boolean; data?: GraphRagTestConnectionSuccess; error?: GraphRagTestConnectionError }>;
    showTestConnectionScenarioToggle?: boolean;
}
export const FormBody = (props: GraphRagConfigurationFormProps) => {
    const { currentStep, completed, isEdit, setCurrentStep } = props;

    const tabValues = ['basic_info', 'retrieval', 'generator'];
    const activeTab = tabValues[(currentStep ?? 1) - 1];

    const ragFormTabHeaders = [
        { id: 'basic_info', label: '1. General Settings', content: <BasicInfoTab {...props} /> },
        { id: 'retrieval', label: '2. Retrieval Settings', content: <RetrievalTab {...props} /> },
        { id: 'generator', label: '3. Generator Settings', content: <GeneratorTab {...props} /> },
    ];

    const handleOnTabClick = (tabId: string) => {
        const index = ragFormTabHeaders.findIndex(tab => tab.id === tabId);
        if (index !== -1) {
            if (setCurrentStep) {
                setCurrentStep(index + 1);
            }
        }
    };

    const isTabClickable = (tabIndex: number) => {
        return isEdit || completed || (currentStep !== undefined && currentStep >= tabIndex);
    };

    return (
        <Tabs value={activeTab} className="w-full">
            <TabsList className="p-0 px-1 w-full rounded-none dark:bg-gray-700">
                {ragFormTabHeaders.map((tab, index) => (
                    <TabsTrigger
                        key={tab.id}
                        className="w-full data-[state=active]:dark:bg-gray-600 rounded-sm h-[95%]"
                        value={tab.id}
                        onClick={() => {
                            if (isTabClickable(index + 1)) handleOnTabClick(tab.id);
                        }}
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {ragFormTabHeaders.map(tab => (
                <TabsContent
                    key={tab.id}
                    value={tab.id}
                    {...(currentStep === 3
                        ? {
                              forceMount: true,
                              className: `px-6 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                                  activeTab === tab.id ? '' : 'hidden'
                              }`.trimEnd(),
                          }
                        : {
                              className: 'px-6 pt-4 flex flex-col gap-y-5 data-[state=inactive]:hidden',
                          })}
                >
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
};
export const GraphRagConfigurationForm = (props: GraphRagConfigurationFormProps) => {
    const {
        isOpen,
        currentStep,
        isEdit,
        isValid,
        isSaving,
        setCurrentStep,
        setOpen,
        handleSubmit,
        onHandleSubmit,
        watch,
        trigger,
        onTestConnection,
        showTestConnectionScenarioToggle,
    } = props;

    const [testState, setTestState] = useState<TestConnectionState>('idle');
    const [testSuccess, setTestSuccess] = useState<GraphRagTestConnectionSuccess | null>(null);
    const [testError, setTestError] = useState<GraphRagTestConnectionError | null>(null);
    const [scenarioState, setScenarioState] = useState<TestConnectionState | 'auto'>('auto');

    // Demo data for scenario toggles
    const demoSuccess: GraphRagTestConnectionSuccess = {
        message: 'Graph RAG connection validated successfully.',
        details: 'DB connectivity, node label, embedding property, and query execution all verified.',
    };
    const demoError: GraphRagTestConnectionError = {
        step: 'Node Label',
        message: 'Node label not found in the graph database',
        details: 'The specified node label does not exist in the database schema',
    };

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
                setTestSuccess(demoSuccess);
            }, 1500);
        }
    };

    const displayState = scenarioState !== 'auto' ? scenarioState : testState;
    const displaySuccess = scenarioState === 'success' ? demoSuccess : testSuccess;
    const displayError = scenarioState === 'error' ? demoError : testError;

    // Show test connection only on Step 2: Retrieval Settings
    const showTestConnection = currentStep === 2;

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
            headerIcon={<SendToBack />}
            header={isEdit ? 'Edit Graph RAG Configurations' : 'New Graph RAG Configurations'}
            footer={
                <div className="flex flex-col gap-3">
                    {/* Scenario Toggle for Reviewers - only show on Step 2 */}
                    {showTestConnection && showTestConnectionScenarioToggle && (
                        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Preview State:
                            </span>
                            <Select
                                value={scenarioState}
                                onValueChange={(value) => setScenarioState(value as TestConnectionState | 'auto')}
                            >
                                <SelectTrigger className="h-7 w-[120px] text-xs">
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="idle">Idle</SelectItem>
                                    <SelectItem value="loading">Loading</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Success Banner - only show on Step 2 */}
                    {showTestConnection && displayState === 'success' && displaySuccess && (
                        <Alert
                            variant={AlertVariant.Success}
                            title="Connection Successful"
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{displaySuccess.message}</span>
                                    {displaySuccess.details && (
                                        <span className="text-xs opacity-80">{displaySuccess.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    {/* Error Banner with Segmented Error - only show on Step 2 */}
                    {showTestConnection && displayState === 'error' && displayError && (
                        <Alert
                            variant={AlertVariant.Error}
                            title={`Failed at: ${displayError.step}`}
                            message={
                                <div className="flex flex-col gap-1">
                                    <span>{displayError.message}</span>
                                    {displayError.details && (
                                        <span className="text-xs opacity-70">{displayError.details}</span>
                                    )}
                                </div>
                            }
                            small
                        />
                    )}

                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            {/* Test Connection Button - only show on Step 2 */}
                            {showTestConnection && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={!isValid || displayState === 'loading' || (isEdit && !!watch('isReadOnly'))}
                                    onClick={handleTestConnection}
                                >
                                    {displayState === 'loading' ? (
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
                            )}
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
                                        {!isValid && (
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
