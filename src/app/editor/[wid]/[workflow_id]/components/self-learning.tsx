/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Dispatch, forwardRef, SetStateAction, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Check, Copy, Info, X } from 'lucide-react';
import {
    Control,
    Controller,
    FieldArrayWithId,
    FieldErrors,
    UseFormClearErrors,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import {
    Button,
    Checkbox,
    EmbeddingModelSelector,
    FormFieldGroup,
    HeaderInput,
    Input,
    Label,
    MultiSelect,
    OptionModel,
    RadioChips,
    ScrollArea,
    Switch,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import {
    AgentType,
    API,
    IntelligenceSourceModel,
    Prompt,
} from '@/components/organisms/workflow-editor-form/agent-form';
import { LearningModeType, LearningSourceType, MessageBrokerTriggerType } from '@/enums';
import { HeaderType, useSelfLearning } from '@/hooks/use-self-learning';
import {
    ConnectorType,
    IConnectorForm,
    IEmbedding,
    IMessageBroker,
    ISelfLearning,
    IWorkflowGraphResponse,
    RequestToolType,
} from '@/models';
import { ApiToolResponseType, PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { APISelector } from './api-selector';
import { LanguageSelector } from './language-selector';
import { PromptSelector } from './prompt-selector';
import { ConnectorSelector } from './connector-selector';
import { validateField } from '@/utils/validation';
import { cn, formatIntellisenseTokens, validatePython, validateSpaces } from '@/lib/utils';
import { Category } from '@/hooks/use-condition-completion';
import { getVariableServiceMap, transformCondition } from '@/lib/intellisense-utils';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { MessageTopic } from './message-broker/message-topic';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';
import { MetaDataEditor } from '@/app/editor/[wid]/[workflow_id]/components/meta-data-editor/meta-data-editor';
import {
    META_DATA_EDITOR_PLACEHOLDER_TEXT,
    META_DATA_EDITOR_TOOLTIP_TEXT,
} from '@/constants/meta-data-editor-constants';
import PlatformMonacoEditor from '@/components/molecules/platform-monaco-editor/platform-monaco-editor';

export interface SelfLearningRef {
    getSelfLearningData: () => ISelfLearning;
}

export interface SelfLearningProps {
    isReadOnly?: boolean;
    nodeId?: string;
    apis: API[] | undefined;
    workflow?: IWorkflowGraphResponse;
    selfLearning: ISelfLearning | undefined;
    agent?: AgentType;
    allApiTools: ApiToolResponseType[] | undefined;
    llms: any;
    slms: any;
    embeddings?: IEmbedding[];
    refetchEmbedding?: () => void;
    allPrompts: PromptResponse[] | undefined;
    llmModelsLoading: boolean;
    slmModelsLoading: boolean;
    loadingEmbeddings?: boolean;
    promptsLoading: boolean;
    messageBrokers: IMessageBroker[];
    setSelfLearning: React.Dispatch<React.SetStateAction<ISelfLearning | undefined>>;
    onSelfLearningChange?: (learning: ISelfLearning | undefined) => void;
    onRefetch: () => void;
    onRefetchIntelligence: () => void;
    onRefetchPrompt: () => Promise<void>;
    allConnectors: IConnectorForm[];
    onRefetchConnector: () => void;
    connectorsLoading: boolean;
}

interface SelfLearningFormProps extends SelfLearningProps {
    openModal: boolean;
    feedbackUrl: string;
    feedbackUrlCopied: boolean;
    control: Control<ISelfLearning, any>;
    tools: API[] | undefined;
    errors: FieldErrors<ISelfLearning>;
    isSlm: boolean;
    languageModel: IntelligenceSourceModel | undefined;
    embeddingModel: IEmbedding | undefined;
    prompt: Prompt | undefined;
    connectors: IConnectorForm[] | undefined;
    inboundOptions: OptionModel[];
    outboundOptions: OptionModel[];
    loadingIntellisense: boolean;
    intellisenseOptions: { name: string; options: { label: string; value: string }[] }[];
    allIntellisenseValues: string[];
    attributes: { label: string; value: string }[];
    setPrompt: Dispatch<SetStateAction<Prompt | undefined>>;
    setLanguageModel: Dispatch<SetStateAction<IntelligenceSourceModel | undefined>>;
    setEmbeddingModel: Dispatch<SetStateAction<IEmbedding | undefined>>;
    setSlm: Dispatch<SetStateAction<boolean>>;
    register: UseFormRegister<ISelfLearning>;
    setTools: Dispatch<SetStateAction<API[] | undefined>>;
    watch: UseFormWatch<ISelfLearning>;
    setValue: UseFormSetValue<ISelfLearning>;
    clearErrors: UseFormClearErrors<ISelfLearning>;
    onApiChange: (items: API[] | undefined) => void;
    handleFeedbackUrlCopy: () => void;
    onLanguageChange: (item: IntelligenceSourceModel | undefined) => Promise<void>;
    onPromptChange: (item: Prompt | undefined) => Promise<void>;
    onIntegrationTypeChange: (id: string) => void;
    setConnectors: Dispatch<SetStateAction<IConnectorForm[] | undefined>>;
    allConnectors: IConnectorForm[];
    onRefetchConnector: () => void;
    connectorsLoading: boolean;
    onConnectorChange: (items: IConnectorForm[] | undefined) => void;
    outputInstructions: FieldArrayWithId<ISelfLearning, 'outputInstructions', 'id'>[];
    appendInstructions: (type: number) => void;
    removeInstructions: (index: number) => void;
    updateInstructions: () => void;
    updateIntellisenseVariable: () => void;
    completion: Category[];
    trigger: UseFormTrigger<ISelfLearning>;
    refetchVariables: () => Promise<void>;
    additionalCriteriaFields: any[];
    appendAdditionalCriteria: () => void;
    removeAdditionalCriteria: (index: number) => void;
    adminEmails: string[];
    loadingAdminEmails: boolean;
}

// Subcomponents to reduce SelfLearning cognitive complexity
const SelfLearningDetailOther = ({
    selfLearning,
    getLearningConfig,
}: {
    selfLearning: ISelfLearning | undefined;
    getLearningConfig?: string;
}) => {
    if (!selfLearning) return undefined;
    return (
        <>
            {getLearningConfig && (
                <p className="flex items-center text-sm font-regular text-green-500">
                    <Check size={16} />
                    &nbsp;-&nbsp;{getLearningConfig}
                </p>
            )}
            {(selfLearning?.learningSource === LearningSourceType.LearnFromSummary ||
                selfLearning?.learningSource === LearningSourceType.SmartFeedbackSearch) && (
                <p
                    className={`flex items-center text-sm font-regular ${
                        selfLearning?.overridePrompt ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {selfLearning?.overridePrompt ? <Check size={16} /> : <X size={16} />}
                    &nbsp;-&nbsp;Override Default Prompt
                </p>
            )}
            <p
                className={`flex items-center text-sm font-regular ${
                    selfLearning?.retry ? 'text-green-500' : 'text-red-500'
                }`}
            >
                {selfLearning?.retry ? <Check size={16} /> : <X size={16} />}
                &nbsp;-&nbsp;Retry After Learning
            </p>
            {selfLearning?.learningType === LearningModeType.Supervised && (
                <p
                    className={`flex items-center text-sm font-regular ${
                        selfLearning?.feedbackRequestIntegration?.id ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {selfLearning?.feedbackRequestIntegration?.id ? <Check size={16} /> : <X size={16} />}
                    &nbsp;-&nbsp;Feedback Requestor Tool
                </p>
            )}
        </>
    );
};

const SelfLearningDetailFooter = ({
    selfLearning,
    agent,
    workflow,
    setOpenModal,
    handleRemove,
    onViewLearning,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    watch,
}: {
    selfLearning: ISelfLearning | undefined;
    agent?: AgentType;
    workflow?: IWorkflowGraphResponse;
    setOpenModal: (open: boolean) => void;
    handleRemove: () => void;
    onViewLearning: () => void;
    setValue: UseFormSetValue<ISelfLearning>;
    watch: UseFormWatch<ISelfLearning>;
}) => {
    if (selfLearning) {
        return (
            <div className="w-full flex grid-col-2">
                <div className="flex w-full justify-start items-center gap-x-2">
                    <Button variant="link" className="text-blue-400" onClick={() => setOpenModal(true)}>
                        {agent?.isReusableAgentSelected ? 'View Self Learning' : 'Change'}
                    </Button>
                    {!agent?.isReusableAgentSelected && (
                        <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                            Remove
                        </Button>
                    )}
                </div>
                <div className="flex w-full justify-end items-center gap-x-2">
                    {workflow && (
                        <Button size="sm" variant="link" onClick={() => onViewLearning()}>
                            View learnings
                        </Button>
                    )}
                </div>
            </div>
        );
    }
    if (!selfLearning && !agent) {
        return (
            <Button variant="link" onClick={() => setOpenModal(true)}>
                Enable Self Learning
            </Button>
        );
    }
    return null;
};

const FormBody = (props: SelfLearningFormProps) => {
    const {
        openModal,
        selfLearning,
        feedbackUrl,
        isReadOnly,
        workflow,
        allApiTools,
        agent,
        control,
        tools,
        errors,
        llms,
        embeddings,
        refetchEmbedding,
        slms,
        llmModelsLoading,
        slmModelsLoading,
        loadingEmbeddings,
        isSlm,
        languageModel,
        embeddingModel,
        prompt,
        allPrompts,
        promptsLoading,
        messageBrokers,
        inboundOptions,
        outboundOptions,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        attributes,
        setPrompt,
        setLanguageModel,
        setEmbeddingModel,
        register,
        setSlm,
        setTools,
        watch,
        setValue,
        clearErrors,
        onApiChange,
        onRefetch,
        onRefetchIntelligence,
        onRefetchPrompt,
        onLanguageChange,
        onPromptChange,
        connectors,
        setConnectors,
        allConnectors,
        onRefetchConnector,
        onConnectorChange,
        onIntegrationTypeChange,
        connectorsLoading,
        outputInstructions,
        appendInstructions,
        removeInstructions,
        updateInstructions,
        completion,
        updateIntellisenseVariable,
        trigger,
        handleFeedbackUrlCopy,
        refetchVariables,
        additionalCriteriaFields,
        appendAdditionalCriteria,
        removeAdditionalCriteria,
        adminEmails,
        loadingAdminEmails,
    } = props;

    const initalValue = watch('feedbackTriggeringCriteria');
    const [apiKeyCopied, setApiKeyCopied] = useState<boolean>(false);
    const [learningTypeShow, setLearningTypeShow] = useState<boolean>(true);

    const curlData = `
curl --request POST \
--url ${feedbackUrl} \
--header 'Content-Type: application/json' \
--data '{
    "api_key": "<API_KEY_OF_THE_WORKFLOW>",
    "session_id": "<SESSION_ID_SHARED_WITH_FEEDBACK_DETAILS>",
    "feedback_message": "<FEEDBACK_MESSAGE>",
    "feedback_data": {<FEEDBACK_DATA>},
    "feedback_rationale": <FEEDBACK_RATIONALE>,
    "agent_id": "<AGENT_ID_OF_THE_WORKFLOW>",
    "workflow_version":"<WORKFLOW_VERSION>",
    "metadata":{<METADATA>},
    "provided_by":"<PROVIDED_BY>",
    "file_input":"<FILE_INPUT>",
    "supporting_file":[<SUPPORTING_FILE>],
}'
    `;

    useEffect(() => {
        const _outputInstructions = outputInstructions?.some(x => x.dataType === 'list' || x.dataType === 'dict');
        if (_outputInstructions) {
            updateInstructions();
        }
    }, [outputInstructions, updateInstructions]);

    const isConditionRestored = useRef<boolean>(false);

    // purpose : transform the condition by adding service prefixes (eg : variable → function.variable ) - Can be removed if we're saving the complete condition (function.variable) - this is applied only for workflow variables
    useEffect(() => {
        if (!initalValue || isConditionRestored.current) return;

        const variableServiceMap: Record<string, string> = getVariableServiceMap(completion);
        const restoredCondition = transformCondition(initalValue, variableServiceMap);

        if (restoredCondition !== initalValue) {
            setValue('feedbackTriggeringCriteria', restoredCondition);
        }

        // Mark as restored so we don't apply transform again and strip user's spaces as they type
        if (initalValue.length > 0) {
            isConditionRestored.current = true;
        }
    }, [initalValue, completion, setValue]);

    useEffect(() => {
        if (!openModal) {
            isConditionRestored.current = false;
        }
    }, [openModal]);

    const handleApiKeyCopy = () => {
        navigator.clipboard.writeText(curlData);
        setApiKeyCopied(true);
        setTimeout(() => setApiKeyCopied(false), 2000);
    };

    const onEmbeddingChange = async (embedding: IEmbedding | undefined) => {
        setValue('embedding', embedding?.id);
    };

    const generateIntellisense = useMemo(() => {
        const filteredVariables = intellisenseOptions.filter(option => option.name === 'Variables');
        return [...filteredVariables, { name: 'Attributes', options: attributes }];
    }, [intellisenseOptions, attributes]);

    return (
        <div className="grid grid-cols-1 gap-2 w-full">
            <div className="w-full p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 flex items-start gap-x-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                <Info size={14} className="min-w-[14px] mt-[2px]" />
                This section lets you control how the AI Agent learns and improves. You can choose how it learns from
                feedback, and how that feedback is given—either automatically or by a person.
            </div>
            {/* Learning config */}
            <button
                type="button"
                className="w-full text-left border-0 bg-transparent p-0"
                onClick={() => setLearningTypeShow(!learningTypeShow)}
            >
                <p className="text-lg font-medium text-gray-700 dark:text-gray-100">Learning Configuration</p>
                <p className="text-xs font-normal text-gray-400">
                    Choose how the Agent should process and learn from feedback.
                </p>
            </button>
            <div className="mt-2" hidden={learningTypeShow}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Mode</p>
            </div>
            <div hidden={learningTypeShow}>
                <Controller
                    control={control}
                    name="learningSource"
                    rules={{
                        required: { value: true, message: 'Please select a learning mode' },
                    }}
                    render={({ field }) => (
                        <div className="w-full">
                            <RadioGroup
                                value={field.value}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onValueChange={field.onChange}
                            >
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={LearningSourceType.LearnFromSummary}
                                            id="learn-from-summary"
                                        />
                                        <Label
                                            className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                            htmlFor="learn-from-summary"
                                        >
                                            Learn From Summary
                                        </Label>
                                    </div>
                                    <p className="text-xs font-normal ml-6">
                                        Summarize all feedback into one concise learning input for the Agent.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={LearningSourceType.LearnFromAllFeedback}
                                            id="learn-from-all-feedback"
                                        />
                                        <Label
                                            className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                            htmlFor="learn-from-all-feedback"
                                        >
                                            Learn From All Feedback
                                        </Label>
                                    </div>
                                    <p className="text-xs font-normal ml-6">
                                        Feed every individual feedback entry directly into the Agent with no
                                        summarization.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={LearningSourceType.SmartFeedbackSearch}
                                            id="smart-feedback-search"
                                        />
                                        <Label
                                            className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                            htmlFor="smart-feedback-search"
                                        >
                                            Smart Feedback Search
                                        </Label>
                                    </div>
                                    <p className="text-xs font-normal ml-6">
                                        Use smart search to retrieve and use only the most relevant feedback.
                                    </p>
                                </div>
                            </RadioGroup>
                            {errors?.learningSource?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {errors?.learningSource?.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>

            {(watch('learningSource') === LearningSourceType.LearnFromSummary ||
                watch('learningSource') === LearningSourceType.SmartFeedbackSearch) && (
                <>
                    <div className="mt-2">
                        <Controller
                            name="intelligentSource"
                            control={control}
                            rules={{
                                required: { value: true, message: 'Please select an intelligent source' },
                            }}
                            render={() => (
                                <div
                                    className={`p-2 border-2 border-solid rounded-lg ${
                                        errors?.intelligentSource?.message
                                            ? 'border-red-300'
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    <LanguageSelector
                                        isSlm={isSlm}
                                        agent={agent}
                                        languageModel={languageModel}
                                        description="Select the AI model that will handle the learning process."
                                        labelClassName="text-xs font-medium font-normal"
                                        setLanguageModel={setLanguageModel}
                                        allModels={llms}
                                        allSLMModels={slms}
                                        allSTSModels={[]}
                                        isReadonly={isReadOnly}
                                        llmModelsLoading={llmModelsLoading}
                                        slmModelsLoading={slmModelsLoading}
                                        onRefetch={onRefetchIntelligence}
                                        onIntelligenceSourceChange={value => setSlm(value)}
                                        onLanguageModelChange={onLanguageChange}
                                    />
                                </div>
                            )}
                        />
                        {errors?.intelligentSource?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.intelligentSource?.message}
                            </p>
                        )}
                    </div>
                    <div className="mt-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Checkbox
                                id="override-default-prompt"
                                checked={!!watch('overridePrompt')}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onCheckedChange={checked => {
                                    setValue('overridePrompt', checked === true);
                                    trigger('overridePrompt');
                                }}
                            />
                            <Label
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                htmlFor="override-default-prompt"
                            >
                                Override Default Prompt
                            </Label>
                        </div>
                        <p className="text-xs font-normal ml-6">
                            Enable this to use your own custom prompt instead of the system&apos;s default.
                        </p>
                    </div>
                    {watch('overridePrompt') && (
                        <div className="mt-2">
                            <Controller
                                name="promptId"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Please select a prompt' },
                                }}
                                render={() => (
                                    <div
                                        className={`p-2 border-2 border-solid rounded-lg ${
                                            errors?.promptId?.message
                                                ? 'border-red-300'
                                                : 'border-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        <PromptSelector
                                            label="Prompt"
                                            description="Select a reusable prompt to control how learning is handled."
                                            labelClassName="text-xs font-medium font-normal"
                                            agent={agent}
                                            prompt={prompt}
                                            setPrompt={setPrompt}
                                            allPrompts={allPrompts as PromptResponse[]}
                                            isReadonly={isReadOnly}
                                            promptsLoading={promptsLoading}
                                            onRefetch={onRefetchPrompt}
                                            onPromptChange={onPromptChange}
                                        />
                                    </div>
                                )}
                            />
                            {errors?.promptId?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {errors?.promptId?.message}
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
            {watch('learningSource') === LearningSourceType.SmartFeedbackSearch && (
                <div className="mt-2">
                    <Controller
                        name="intelligentSource"
                        control={control}
                        rules={{
                            required: { value: true, message: 'Please select an embedding ' },
                        }}
                        render={() => (
                            <div
                                className={`p-2 border-2 border-solid rounded-lg ${
                                    errors?.intelligentSource?.message
                                        ? 'border-red-300'
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <EmbeddingModelSelector
                                    embedding={embeddingModel}
                                    allEmbeddings={embeddings ?? []}
                                    embeddingsLoading={loadingEmbeddings}
                                    isReadonly={false}
                                    labelClassName="text-xs font-medium font-normal"
                                    setEmbedding={setEmbeddingModel}
                                    onModalChange={async () => await trigger(`embedding`)}
                                    onRefetch={() => refetchEmbedding?.()}
                                    onEmbeddingChange={onEmbeddingChange}
                                    imageWidth="70"
                                />
                            </div>
                        )}
                    />
                    {errors?.intelligentSource?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.intelligentSource?.message}
                        </p>
                    )}
                </div>
            )}

            {watch('learningSource') === LearningSourceType.LearnFromSummary && (
                <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Summary Length</p>
                    <p className="text-xs font-normal text-gray-400">
                        Sets the maximum length in tokens for the AI-generated summary. Shorter limits may miss details;
                        longer limits may be more costly.
                    </p>
                    <div className="flex items-center gap-4 w-full">
                        <Input
                            {...register('maxSummaryLength', {
                                required: { value: true, message: 'Please enter max summary length' },
                                min: { value: 1, message: 'Minimum value should be 1' },
                                valueAsNumber: true,
                            })}
                            className="mt-2"
                            placeholder="Enter your max summary length"
                            readOnly={
                                isReadOnly || !watch('overrideMaxSummaryLength') || agent?.isReusableAgentSelected
                            }
                            type="number"
                            autoComplete="off"
                            isDestructive={!!errors?.maxSummaryLength?.message}
                            supportiveText={errors?.maxSummaryLength?.message}
                        />
                        <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                            <Checkbox
                                id="override-prompt"
                                checked={!!watch('overrideMaxSummaryLength')}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onCheckedChange={checked => {
                                    setValue('overrideMaxSummaryLength', checked === true);
                                }}
                            />
                            <Label
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                htmlFor="override-prompt"
                            >
                                Override
                            </Label>
                        </div>
                    </div>
                </div>
            )}
            {/* feedback config */}
            <div>
                <hr className="my-4 border-b dark:border-gray-700" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-100">Feedback Configuration</p>
                <p className="text-xs font-normal text-gray-400">
                    Configure how the agent receives, processes, and responds to feedback during learning.
                </p>
            </div>
            <div className="mt-2">
                <Controller
                    name="learningType"
                    control={control}
                    rules={{ required: { value: true, message: 'Please select a feedback type' } }}
                    render={({ field }) => (
                        <div className="w-full">
                            <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback Type</p>
                                <p className="text-xs font-normal">
                                    Choose whether feedback is provided manually (Supervised) or generated
                                    automatically.
                                </p>
                            </div>
                            <RadioGroup
                                value={field.value}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onValueChange={field.onChange}
                                className="flex items-center gap-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    {/*unsupervised is disabled*/}
                                    <RadioGroupItem
                                        value={LearningModeType.Unsupervised}
                                        id="learning-unsupervised"
                                        disabled={true}
                                    />
                                    <Label
                                        className="text-gray-300 dark:text-gray-300 cursor-pointer "
                                        htmlFor="learning-unsupervised"
                                    >
                                        Unsupervised
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={LearningModeType.Supervised} id="learning-supervised" />
                                    <Label
                                        className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                        htmlFor="learning-supervised"
                                    >
                                        Supervised
                                    </Label>
                                </div>
                            </RadioGroup>
                            {errors?.learningType?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {errors?.learningType?.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>

            {watch('learningType') && (
                <>
                    {watch('learningType') === LearningModeType.Supervised && (
                        <>
                            <div className="mt-2">
                                <Controller
                                    name="feedbackRequestIntegration.type"
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please select an Feedback Requestor Tool',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <RadioChips
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={[
                                                {
                                                    label: 'Connector',
                                                    value: RequestToolType.Connector,
                                                },
                                                {
                                                    label: MessageBrokerTriggerType.API,
                                                    value: RequestToolType.API,
                                                },
                                                {
                                                    label: MessageBrokerTriggerType.MessageBroker,
                                                    value: RequestToolType.MessageBroker,
                                                },
                                            ]}
                                        />
                                    )}
                                />
                            </div>
                            {/* if selected type is api */}
                            {watch('feedbackRequestIntegration.type') == RequestToolType.API && (
                                <div>
                                    <Controller
                                        name="feedbackRequestIntegration.id"
                                        control={control}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: 'Please select a feedback requestor tool',
                                            },
                                        }}
                                        render={() => (
                                            <div
                                                className={`mt-2 p-2 border-2 border-solid rounded-lg ${
                                                    errors?.feedbackRequestIntegration?.id?.message
                                                        ? 'border-red-300'
                                                        : 'border-gray-300 dark:border-gray-700'
                                                }`}
                                            >
                                                <APISelector
                                                    agent={agent}
                                                    apis={tools}
                                                    isMultiple={false}
                                                    setApis={setTools}
                                                    allApiTools={allApiTools as ApiToolResponseType[]}
                                                    isReadonly={isReadOnly}
                                                    isSelfLearning={true}
                                                    label="Feedback Details API"
                                                    description="Choose the API that enables agents to request targeted feedback for continuous improvement and task refinement."
                                                    labelClassName="text-xs font-medium font-normal"
                                                    onRefetch={onRefetch}
                                                    onApiChange={onApiChange}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors?.feedbackRequestIntegration?.id?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {errors?.feedbackRequestIntegration?.id?.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* if selected type is connector */}

                            {watch('feedbackRequestIntegration.type') == RequestToolType.Connector && (
                                <div>
                                    <Controller
                                        name="feedbackRequestIntegration.id"
                                        control={control}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: 'Please select a feedback requestor tool',
                                            },
                                        }}
                                        render={() => (
                                            <div
                                                className={`mt-2 p-2 border-2 border-solid rounded-lg ${
                                                    errors?.feedbackRequestIntegration?.id?.message
                                                        ? 'border-red-300'
                                                        : 'border-gray-300 dark:border-gray-700'
                                                }`}
                                            >
                                                <ConnectorSelector
                                                    agent={agent}
                                                    connectors={connectors ?? []}
                                                    isMultiple={false}
                                                    setConnectors={setConnectors}
                                                    allConnectors={allConnectors}
                                                    isReadonly={isReadOnly}
                                                    isSelfLearning={true}
                                                    label="Feedback Details Connector"
                                                    description="Choose and configure a connector to share feedback details and enable agents to request targeted feedback for continuous improvement and task refinement."
                                                    labelClassName="text-xs font-medium font-normal"
                                                    onRefetch={onRefetchConnector}
                                                    onConnectorsChange={onConnectorChange}
                                                    connectorLoading={connectorsLoading}
                                                />

                                                <div className="w-full p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 flex items-start gap-x-2 mt-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                                    <Info size={14} className="min-w-[14px] mt-[2px]" />
                                                    {!connectors?.length &&
                                                        'Select a connector to proceed with the setup.'}

                                                    {connectors?.length && connectors?.length > 0 && (
                                                        <>
                                                            {connectors?.length &&
                                                            connectors?.[0]?.type !== ConnectorType?.Pega
                                                                ? `No configuration is needed to set up ${connectors?.[0]?.name}. Click Add to continue.`
                                                                : `Additional configuration is required to complete setup for ${connectors?.[0]?.name}.
                                                            Fill in the fields below and click Add to add the connector.`}
                                                        </>
                                                    )}
                                                </div>

                                                {(connectors ?? [])?.length > 0 &&
                                                    connectors?.[0]?.type == ConnectorType?.Pega && (
                                                        <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3">
                                                            {/* caseTypeID */}
                                                            <div className="col-span-1 sm:col-span-12">
                                                                <Input
                                                                    {...register(
                                                                        'feedbackRequestIntegration.configuration.caseTypeId',
                                                                        {
                                                                            required: {
                                                                                value: true,
                                                                                message: 'Please enter a Case Type ID',
                                                                            },
                                                                            validate: value =>
                                                                                validateSpaces(value, 'Case Type ID'),
                                                                        }
                                                                    )}
                                                                    label="Case Type ID"
                                                                    placeholder="Enter your Case Type ID"
                                                                    isDestructive={
                                                                        !!errors?.feedbackRequestIntegration
                                                                            ?.configuration?.caseTypeId?.message
                                                                    }
                                                                    supportiveText={
                                                                        errors?.feedbackRequestIntegration
                                                                            ?.configuration?.caseTypeId?.message
                                                                    }
                                                                />
                                                            </div>

                                                            {/* Case Creation Url */}
                                                            <div className="col-span-1 sm:col-span-12">
                                                                <Input
                                                                    {...register(
                                                                        'feedbackRequestIntegration.configuration.caseCreateUrl',
                                                                        {
                                                                            required: {
                                                                                value: true,
                                                                                message:
                                                                                    'Please enter a Case Creation URL',
                                                                            },
                                                                            validate: value =>
                                                                                validateSpaces(
                                                                                    value,
                                                                                    'Case Creation URL'
                                                                                ),
                                                                        }
                                                                    )}
                                                                    label="Case Creation URL"
                                                                    placeholder="Enter your Case Creation URL"
                                                                    isDestructive={
                                                                        !!errors?.feedbackRequestIntegration
                                                                            ?.configuration?.caseCreateUrl?.message
                                                                    }
                                                                    supportiveText={
                                                                        errors?.feedbackRequestIntegration
                                                                            ?.configuration?.caseCreateUrl?.message
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-span-1 sm:col-span-12 text-xs text-gray-500 flex items-start gap-x-2 mt-3 dark:text-gray-400">
                                                                <Info size={14} className="min-w-[14px] mt-[2px]" />
                                                                The fields below will be used for mapping during
                                                                connector execution.
                                                            </div>

                                                            {/* title */}
                                                            <div className="col-span-1 sm:col-span-6">
                                                                <Input value="Title" disabled />
                                                            </div>
                                                            <div className="col-span-1 sm:col-span-6">
                                                                <Input
                                                                    {...register(
                                                                        'feedbackRequestIntegration.configuration.mapping.titleMapping',
                                                                        {
                                                                            required: validateField('Title', {
                                                                                required: {
                                                                                    value: true,
                                                                                },
                                                                            }).required,
                                                                            validate: value =>
                                                                                validateSpaces(value, 'Title'),
                                                                        }
                                                                    )}
                                                                    placeholder="Enter Value"
                                                                    isDestructive={
                                                                        !!errors?.feedbackRequestIntegration
                                                                            ?.configuration?.mapping?.titleMapping
                                                                            ?.message
                                                                    }
                                                                    supportiveText={
                                                                        errors?.feedbackRequestIntegration
                                                                            ?.configuration?.mapping?.titleMapping
                                                                            ?.message
                                                                    }
                                                                />
                                                            </div>

                                                            {/* description */}
                                                            <div className="col-span-1 sm:col-span-6">
                                                                <Input value="Description" disabled />
                                                            </div>
                                                            <div className="col-span-1 sm:col-span-6">
                                                                <Input
                                                                    {...register(
                                                                        'feedbackRequestIntegration.configuration.mapping.descriptionMapping',
                                                                        {
                                                                            required: validateField('Description', {
                                                                                required: {
                                                                                    value: true,
                                                                                },
                                                                            }).required,
                                                                            validate: value =>
                                                                                validateSpaces(value, 'Description'),
                                                                        }
                                                                    )}
                                                                    placeholder="Enter Value"
                                                                    isDestructive={
                                                                        !!errors?.feedbackRequestIntegration
                                                                            ?.configuration?.mapping?.descriptionMapping
                                                                            ?.message
                                                                    }
                                                                    supportiveText={
                                                                        errors?.feedbackRequestIntegration
                                                                            ?.configuration?.mapping?.descriptionMapping
                                                                            ?.message
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    />
                                    {errors?.feedbackRequestIntegration?.id?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {errors?.feedbackRequestIntegration?.id?.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {watch('feedbackRequestIntegration.type') == RequestToolType.MessageBroker && (
                                <>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Producer
                                        </Label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                                            <MessageTopic
                                                isOpen={openModal}
                                                inboundOptions={inboundOptions}
                                                outboundOptions={outboundOptions}
                                                isFeedbackPublisher={true}
                                                propertyName="feedbackRequestIntegration.messageBroker.topicProducer"
                                                messageBrokers={messageBrokers}
                                                isReadOnly={isReadOnly}
                                                agent={agent}
                                                control={control}
                                                loadingIntellisense={loadingIntellisense}
                                                intellisenseOptions={intellisenseOptions}
                                                allIntellisenseValues={allIntellisenseValues}
                                                selfLearning={selfLearning}
                                                helperInfo={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.publisher.helperInfo
                                                }
                                                tooltip={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.publisher.tooltip
                                                }
                                                structurePlaceholder={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.publisher
                                                        .structurePlaceholder
                                                }
                                                setValue={setValue}
                                                watch={watch}
                                                trigger={trigger}
                                                clearErrors={clearErrors}
                                                refetchVariables={refetchVariables}
                                                onValuesChange={onIntegrationTypeChange}
                                                topicDropdownDisabled={
                                                    !watch(
                                                        'feedbackRequestIntegration.messageBroker.topicProducer.messageBrokerId'
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Consumer
                                        </Label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                                            <MessageTopic
                                                isOpen={openModal}
                                                inboundOptions={inboundOptions}
                                                outboundOptions={outboundOptions}
                                                isFeedbackPublisher={false}
                                                propertyName="feedbackRequestIntegration.messageBroker.topicConsumer"
                                                messageBrokers={messageBrokers}
                                                isReadOnly={isReadOnly}
                                                agent={agent}
                                                control={control}
                                                loadingIntellisense={loadingIntellisense}
                                                intellisenseOptions={intellisenseOptions}
                                                allIntellisenseValues={allIntellisenseValues}
                                                selfLearning={selfLearning}
                                                helperInfo={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.consumer.helperInfo
                                                }
                                                tooltip={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.consumer.tooltip
                                                }
                                                structurePlaceholder={
                                                    MESSAGE_BROKER_TOPIC_CONTENT.selfLearningTopic.consumer
                                                        .structurePlaceholder
                                                }
                                                setValue={setValue}
                                                watch={watch}
                                                trigger={trigger}
                                                clearErrors={clearErrors}
                                                refetchVariables={refetchVariables}
                                                onValuesChange={onIntegrationTypeChange}
                                                topicDropdownDisabled={
                                                    !watch(
                                                        'feedbackRequestIntegration.messageBroker.topicConsumer.messageBrokerId'
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="mt-5">
                                <FormFieldGroup
                                    title="Feedback Attributes"
                                    description="Define the attributes that will be sent to the selected connector/API. These attributes will be used in the feedback criteria and response structure."
                                    showSeparator={false}
                                >
                                    <div className="col-span-1 sm:col-span-2">
                                        <HeaderInput
                                            register={register}
                                            fields={outputInstructions}
                                            namePrefix="outputInstructions"
                                            append={appendInstructions}
                                            remove={removeInstructions}
                                            type={HeaderType.OutputInstructions}
                                            control={control}
                                            isQueryParams={false}
                                            isResponseField={true}
                                            valuePlaceholder="Enter a detailed description explaining the attribute and the scenario in which the attribute will be used to gather input."
                                            list={watch('outputInstructions')}
                                            disabledInputs={isReadOnly}
                                            onInputsValid={updateIntellisenseVariable}
                                            className="border-none p-0"
                                            useTextarea
                                        />
                                    </div>
                                </FormFieldGroup>
                            </div>
                            <div className="mt-1">
                                <FormFieldGroup
                                    title="Feedback Triggering Criteria"
                                    showSeparator={false}
                                    tooltipMessage={
                                        <>
                                            Define the condition that triggers feedback and fallback.This condition is
                                            evaluated during execution to determine if the Agent should be redirected to
                                            a fallback. You can use the attributes defined under Feedback Attributes as
                                            variables in this condition—for example, <strong>isValid == false</strong>.
                                            These variables allow you to create logic based on feedback data to control
                                            Agent behaviour dynamically.
                                        </>
                                    }
                                >
                                    <div className="col-span-1 sm:col-span-2">
                                        <Controller
                                            name="feedbackTriggeringCriteria"
                                            control={control}
                                            rules={{
                                                required: validateField('query', { required: { value: true } })
                                                    .required,
                                                validate: value => validatePython(value),
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <PlatformMonacoEditor
                                                    value={formatIntellisenseTokens(field.value ?? '', 'unwrap')}
                                                    onChange={(val: string) => {
                                                        const transformed = formatIntellisenseTokens(val, 'wrap');
                                                        field.onChange(transformed);
                                                    }}
                                                    intellisenseData={generateIntellisense}
                                                    isDestructive={!!error}
                                                    supportiveText={errors?.feedbackTriggeringCriteria?.message}
                                                    // onRefetchVariables={onRefetchVariables}
                                                    onRefetchVariables={refetchVariables}
                                                    height="h-[100px]"
                                                    onFocusHeight="h-[300px]"
                                                    onBlur={() => trigger('feedbackTriggeringCriteria')}
                                                    language="custom-python"
                                                    label="Criteria"
                                                    helperInfo="Type @ for adding variables for your query. Use Generate Query option for converting natural language to query."
                                                />
                                            )}
                                        />
                                        {additionalCriteriaFields.map((field, index) => (
                                            <div className="mt-2 flex items-start gap-2" key={field.id}>
                                                <div className="flex-grow">
                                                    <Controller
                                                        name={`additionalCriteria.${index}`}
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{
                                                            validate: value => validatePython(value),
                                                        }}
                                                        render={({ field: criteriaField, fieldState: { error } }) => (
                                                            <PlatformMonacoEditor
                                                                value={formatIntellisenseTokens(
                                                                    criteriaField.value ?? '',
                                                                    'unwrap'
                                                                )}
                                                                onChange={(val: string) => {
                                                                    const transformed = formatIntellisenseTokens(
                                                                        val,
                                                                        'wrap'
                                                                    );
                                                                    criteriaField.onChange(transformed);
                                                                }}
                                                                intellisenseData={generateIntellisense}
                                                                isDestructive={!!error}
                                                                supportiveText={error?.message}
                                                                onRefetchVariables={refetchVariables}
                                                                height="h-[100px]"
                                                                onFocusHeight="h-[300px]"
                                                                onBlur={() => trigger(`additionalCriteria.${index}`)}
                                                                language="custom-python"
                                                                helperInfo="Type @ for adding variables for your query."
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeAdditionalCriteria(index)}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="mt-2" hidden={true}>
                                            <Button
                                                hidden={true}
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => appendAdditionalCriteria()}
                                                className="flex items-center gap-1"
                                            >
                                                + Add
                                            </Button>
                                        </div>
                                    </div>
                                </FormFieldGroup>
                            </div>
                        </>
                    )}

                    <div className="mt-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Controller
                                name="enable_metadata_filter"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <div className="flex items-center gap-x-2">
                                        <Switch
                                            id="enable-Metadata-filtering"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isReadOnly || agent?.isReusableAgentSelected}
                                        />
                                        <Label htmlFor="enable-https">Enable metadata filtering </Label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    {watch('enable_metadata_filter') && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Meta Data</Label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                                <MetaDataEditor
                                    isOpen={openModal}
                                    isFeedbackPublisher={false}
                                    propertyName="metadataFilter"
                                    isReadOnly={isReadOnly}
                                    agent={agent}
                                    control={control}
                                    loadingIntellisense={loadingIntellisense}
                                    intellisenseOptions={intellisenseOptions}
                                    allIntellisenseValues={allIntellisenseValues}
                                    helperInfo={META_DATA_EDITOR_PLACEHOLDER_TEXT}
                                    tooltip={META_DATA_EDITOR_TOOLTIP_TEXT}
                                    structurePlaceholder={META_DATA_EDITOR_PLACEHOLDER_TEXT}
                                    setValue={setValue}
                                    watch={watch}
                                    trigger={trigger}
                                    refetchVariables={refetchVariables}
                                />
                            </div>
                        </div>
                    )}
                    <div className="mt-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Checkbox
                                id="retry"
                                checked={!!watch('retry')}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onCheckedChange={checked => {
                                    setValue('retry', checked === true);
                                }}
                            />
                            <Label
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                htmlFor="retry"
                            >
                                Retry After Learning
                            </Label>
                        </div>
                        <p className="text-xs font-normal ml-6">
                            Automatically re-run the agent task using updated knowledge after learning.
                        </p>
                    </div>

                    <div className="mt-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Checkbox
                                id="feedbackAuthoring"
                                checked={!!watch('feedbackAuthoring')}
                                disabled={isReadOnly || agent?.isReusableAgentSelected}
                                onCheckedChange={checked => {
                                    setValue('feedbackAuthoring', checked === true);
                                }}
                            />
                            <Label
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                htmlFor="feedbackAuthoring"
                            >
                                Enable Feedback Authoring
                            </Label>
                        </div>
                        <p className="text-xs font-normal ml-6">Enable authoring for feedback</p>
                    </div>

                    {watch('feedbackAuthoring') && (
                        <div className="mt-1" hidden>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allowed Reviewers
                            </Label>
                            <p className="text-xs font-normal text-gray-400 mb-2">
                                Select who can approve or reject feedbacks
                            </p>
                            <Controller
                                name="allowedAuthors"
                                control={control}
                                render={({ field }) => {
                                    const emailOptions = (adminEmails ?? []).map((email: string) => ({
                                        value: email,
                                        label: email,
                                    }));

                                    return (
                                        <MultiSelect
                                            isMulti
                                            options={emailOptions}
                                            value={(field.value ?? []).map((email: string) => ({
                                                value: email,
                                                label: email,
                                            }))}
                                            onChange={selected =>
                                                field.onChange(selected?.map((s: any) => s.value) ?? [])
                                            }
                                            placeholder={
                                                loadingAdminEmails ? 'Loading admin emails...' : 'Select admin emails'
                                            }
                                            isDisabled={
                                                isReadOnly || agent?.isReusableAgentSelected || loadingAdminEmails
                                            }
                                            isLoading={loadingAdminEmails}
                                            menuPortalTarget={document.body}
                                            menuClass="!z-50"
                                            menuPortalClass="!z-50 pointer-events-auto"
                                            isClearable
                                        />
                                    );
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {workflow && watch('learningType') === LearningModeType.Supervised && (
                <div className="flex items-end justify-between mt-2 gap-1">
                    <div className="w-full">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback Collector URL</p>
                        <p className="text-xs font-normal text-gray-400">
                            The endpoint that will collect incoming feedback data for learning.
                        </p>
                        <div className="mt-2">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem
                                    value="feedback-url-item"
                                    className="border-[1px] px-2 py-1 bg-gray-50 rounded-md w-full dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <div className="flex items-center justify-between">
                                        <AccordionTrigger className="hover:no-underline px-0 py-1 text-gray-600 dark:text-white truncate flex items-center gap-x-2">
                                            <p className="w-[500px] truncate overflow-hidden hover:border-none active:border-none text-left">
                                                {feedbackUrl}
                                            </p>
                                        </AccordionTrigger>
                                        <Button
                                            type="button"
                                            onClick={e => {
                                                e?.preventDefault();
                                                handleFeedbackUrlCopy();
                                            }}
                                            leadingIcon={<Copy />}
                                            size="icon"
                                            className="p-1 asffd"
                                        />
                                    </div>
                                    <AccordionContent className="py-2" forceMount>
                                        <ScrollArea className="relative bg-gray-900 text-white p-4 rounded-md mt-2">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <div className="flex gap-x-3 ml-auto">
                                                    <div className="relative inline-block">
                                                        <button
                                                            className="antialiased cursor-pointer disabled:cursor-auto inline-flex justify-center items-center gap-x-2 rounded-lg font-semibold transition-all duration-50 ease-in-out !w-fit !h-fit !p-0 text-blue-700 hover:text-blue-800 disabled-text-gray-300 focus:ring-0 outline-none"
                                                            onClick={handleApiKeyCopy}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2" // Changed from stroke-width
                                                                strokeLinecap="round" // Changed from stroke-linecap
                                                                strokeLinejoin="round" // Changed from stroke-linejoin
                                                                className="lucide lucide-copy text-gray-300"
                                                                aria-hidden="true"
                                                            >
                                                                <rect
                                                                    width="14"
                                                                    height="14"
                                                                    x="8"
                                                                    y="8"
                                                                    rx="2"
                                                                    ry="2"
                                                                ></rect>
                                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                                            </svg>
                                                        </button>
                                                        {apiKeyCopied && (
                                                            <div
                                                                className="absolute left-1/2 transform -translate-x-[calc(100%+16px)] top-0 text-[10px] text-gray-600 bg-white px-2 py-0 rounded-md shadow-lg"
                                                                style={{ zIndex: 10 }}
                                                            >
                                                                Copied!
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <ScrollArea className="text-sm whitespace-pre-wrap max-w-[460px] h-auto pb-4 custom-overflow-auto text-blue-500">
                                                <pre className="language-curl block">{curlData}</pre>
                                            </ScrollArea>
                                        </ScrollArea>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const SelfLearning = forwardRef<SelfLearningRef, SelfLearningProps>((props, ref) => {
    const { agent, selfLearning, workflow, isReadOnly } = props;
    const {
        isValid,
        feedbackUrl,
        feedbackUrlCopied,
        control,
        getModelFromReusableAgent,
        getLearningConfig,
        openModal,
        tools,
        errors,
        isSlm,
        languageModel,
        prompt,
        inboundOptions,
        outboundOptions,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        attributes,
        setPrompt,
        setLanguageModel,
        setSlm,
        register,
        clearErrors,
        setTools,
        setOpenModal,
        watch,
        getValues,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onViewLearning,
        handleFeedbackUrlCopy,
        handleRemove,
        onApiChange,
        onLanguageChange,
        onPromptChange,
        onIntegrationTypeChange,
        connectors,
        setConnectors,
        onConnectorChange,
        appendInstructions,
        removeInstructions,
        outputInstructions,
        updateInstructionsList,
        completion,
        updateIntellisenseVariable,
        trigger,
        refetchVariables,
        embeddings,
        refetchEmbedding,
        loadingEmbeddings,
        setEmbeddingModel,
        embeddingModel,
        additionalCriteriaFields,
        appendAdditionalCriteria,
        removeAdditionalCriteria,
        adminEmails,
        loadingAdminEmails,
    } = useSelfLearning(props);

    useImperativeHandle(ref, () => ({
        getSelfLearningData: () => {
            return getValues();
        },
    }));

    return (
        <>
            <DetailItemInput
                label="Self Learning"
                values={getModelFromReusableAgent}
                imagePath="/png/knowledge_empty.png"
                imageType="png"
                imageWidth="100"
                description="Set up how your agent learns from interactions, including selecting learning sources and enabling feedback"
                other={
                    selfLearning ? (
                        <SelfLearningDetailOther selfLearning={selfLearning} getLearningConfig={getLearningConfig} />
                    ) : undefined
                }
                footer={
                    <SelfLearningDetailFooter
                        selfLearning={selfLearning}
                        agent={agent}
                        workflow={workflow}
                        setOpenModal={setOpenModal}
                        handleRemove={handleRemove}
                        onViewLearning={onViewLearning}
                        setValue={setValue}
                        watch={watch}
                    />
                }
            />

            <AppDrawer
                open={openModal}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpenModal}
                className="custom-drawer-content !w-[633px]"
                dismissible={false}
                header={'Self Learning'}
                footer={
                    <div className={`flex items-center ${workflow ? 'justify-between' : 'justify-end'} w-full`}>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setOpenModal(false)}>
                                Cancel
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="primary"
                                            disabled={!isValid || agent?.isReusableAgentSelected || isReadOnly}
                                            // onClick={handleSubmit(onHandleSubmit)}
                                            onClick={handleSubmit(data => {
                                                // Temporarily auto-populate allowedAuthors with all admin emails
                                                if (data.feedbackAuthoring && adminEmails?.length) {
                                                    data.allowedAuthors = adminEmails;
                                                }
                                                onHandleSubmit(data);
                                            })}
                                        >
                                            {selfLearning ? 'Change' : 'Add'}
                                        </Button>
                                    </TooltipTrigger>
                                    {!isValid && (
                                        <TooltipContent side="left" align="center">
                                            All details needs to be filled before the form can be saved
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <FormBody
                            {...props}
                            openModal={openModal}
                            control={control}
                            feedbackUrl={feedbackUrl}
                            feedbackUrlCopied={feedbackUrlCopied}
                            tools={tools}
                            errors={errors}
                            isSlm={isSlm}
                            languageModel={languageModel}
                            prompt={prompt}
                            inboundOptions={inboundOptions}
                            outboundOptions={outboundOptions}
                            loadingIntellisense={loadingIntellisense}
                            intellisenseOptions={intellisenseOptions}
                            allIntellisenseValues={allIntellisenseValues}
                            setPrompt={setPrompt}
                            setLanguageModel={setLanguageModel}
                            setSlm={setSlm}
                            register={register}
                            setTools={setTools}
                            watch={watch}
                            setValue={setValue}
                            clearErrors={clearErrors}
                            onApiChange={onApiChange}
                            handleFeedbackUrlCopy={handleFeedbackUrlCopy}
                            onLanguageChange={onLanguageChange}
                            onPromptChange={onPromptChange}
                            onIntegrationTypeChange={onIntegrationTypeChange}
                            connectors={connectors}
                            setConnectors={setConnectors}
                            onConnectorChange={onConnectorChange}
                            outputInstructions={outputInstructions}
                            appendInstructions={appendInstructions}
                            removeInstructions={removeInstructions}
                            updateInstructions={updateInstructionsList}
                            completion={completion}
                            updateIntellisenseVariable={updateIntellisenseVariable}
                            trigger={trigger}
                            refetchVariables={async () => {
                                await refetchVariables();
                            }}
                            embeddings={embeddings}
                            refetchEmbedding={refetchEmbedding}
                            loadingEmbeddings={loadingEmbeddings}
                            setEmbeddingModel={setEmbeddingModel}
                            embeddingModel={embeddingModel}
                            additionalCriteriaFields={additionalCriteriaFields}
                            appendAdditionalCriteria={appendAdditionalCriteria}
                            removeAdditionalCriteria={removeAdditionalCriteria}
                            adminEmails={adminEmails}
                            loadingAdminEmails={loadingAdminEmails}
                            attributes={attributes}
                        />
                    </div>
                }
            />
        </>
    );
});

SelfLearning.displayName = 'SelfLearning';

export default SelfLearning;
