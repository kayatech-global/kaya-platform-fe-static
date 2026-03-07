/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { GraphRagConfigurationFormProps } from '../graph-rag-configuration-form';
import { IntelligenceSourceModel, Prompt } from '@/components/organisms';
import { Switch } from '@/components/atoms/switch';
import { Controller } from 'react-hook-form';
import { Input, Label, Select } from '@/components';
import { IModel, LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import { KnowledgeGraphSearchType } from '@/enums';
import { validateSpaces } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import {
    applyLanguageModelToForm,
    applyPromptToForm,
    handleTrigger,
    toLanguageModelState,
} from './retrieval-form-helpers';

const QueryUnderstandingComponent = (props: GraphRagConfigurationFormProps) => {
    const {
        errors,
        isEdit,
        control,
        llmModels,
        slmModels,
        prompts,
        loadingLlmModels,
        loadingSlmModels,
        index = 0,
        getValues,
        setValue,
        trigger,
        register,
        watch,
        refetchLLM,
        refetchSLM,
    } = props;
    const [isSlm, setSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);

    useEffect(() => {
        const values = getValues();
        const slmId = values.configurations?.retrievals?.[index]?.queryUnderstanding?.slmId;
        const llmId = values.configurations?.retrievals?.[index]?.queryUnderstanding?.llmId;

        // Set SLM flag
        const isSlmSelected = !!(slmId && slmId !== '');
        setSlm(isSlmSelected);

        // Determine selected model (LLM or SLM)
        let selectedModelId;
        if (isSlmSelected) {
            selectedModelId = isEdit ? slmId : watch(`configurations.retrievals.${index}.queryUnderstanding.slmId`);
        } else {
            selectedModelId = isEdit ? llmId : watch(`configurations.retrievals.${index}.queryUnderstanding.llmId`);
        }

        const selectedModel = isSlmSelected
            ? slmModels?.find((model: any) => model.id === selectedModelId)
            : llmModels?.find((model: any) => model.id === selectedModelId);

        if (selectedModel) {
            setLanguageModel(toLanguageModelState(selectedModel));
        }
    }, [
        isEdit,
        index,
        prompts,
        llmModels,
        slmModels,
        getValues,
        watch(`configurations.retrievals.${index}.queryUnderstanding.sourceValue`),
        watch(`configurations.retrievals.${index}.queryUnderstanding.slmId`),
        watch(`configurations.retrievals.${index}.queryUnderstanding.llmId`),
    ]);

    return (
        <>
            <hr className="mt-4 border-b dark:border-gray-700" />
            {watch(`configurations.retrievals.${index}.queryUnderstanding.sourceValue`) ===
                KnowledgeGraphSearchType.NER && (
                <div className="mt-4">
                    <Input
                        {...register(`configurations.retrievals.${index}.queryUnderstanding.fullTextSearchIndex`, {
                            required: validateField('full text query index name', { required: { value: true } })
                                .required,
                            validate: value => validateSpaces(value, 'full text query index name'),
                        })}
                        placeholder="Enter a Full Text Query Index Name"
                        label="Full Text Query Index Name"
                        helperInfo="Full-text Search Index allows you to enable text-based search across multiple node labels and properties in your knowledge graph."
                        readOnly={isEdit && !!watch('isReadOnly')}
                        isDestructive={
                            !!errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.fullTextSearchIndex
                                ?.message
                        }
                        supportiveText={
                            errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.fullTextSearchIndex
                                ?.message
                        }
                    />
                </div>
            )}

            <hr className="mt-4 border-b dark:border-gray-700" />
            <Controller
                name={`configurations.retrievals.${index}.queryUnderstanding.sourceValue`}
                control={control}
                rules={{
                    required: {
                        value: true,
                        message: 'Please select an intelligence source',
                    },
                }}
                render={() => (
                    <LanguageSelector
                        isSlm={isSlm}
                        agent={undefined}
                        label=""
                        description="Select an intelligence source for NER"
                        languageModel={languageModel}
                        llmModelsLoading={loadingLlmModels}
                        slmModelsLoading={loadingSlmModels}
                        setLanguageModel={setLanguageModel}
                        allModels={(llmModels as IModel[]) ?? []}
                        allSTSModels={[]}
                        allSLMModels={(slmModels as IModel[]) ?? []}
                        isReadonly={isEdit && !!watch('isReadOnly')}
                        onIntelligenceSourceChange={value => setSlm(value)}
                        onLanguageModelChange={e =>
                            applyLanguageModelToForm(
                                e,
                                `configurations.retrievals.${index}.queryUnderstanding`,
                                isSlm,
                                setValue
                            )
                        }
                        onModalChange={() =>
                            handleTrigger(`configurations.retrievals.${index}.queryUnderstanding.sourceValue`, trigger)
                        }
                        onRefetch={() => {
                            refetchLLM();
                            refetchSLM();
                        }}
                    />
                )}
            />
            {!!errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.sourceValue?.message && (
                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                    {errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.sourceValue?.message}
                </p>
            )}
        </>
    );
};

const HydeComponent = (props: GraphRagConfigurationFormProps) => {
    const {
        errors,
        isEdit,
        control,
        llmModels,
        slmModels,
        prompts,
        loadingLlmModels,
        loadingSlmModels,
        loadingPrompts,
        index = 0,
        getValues,
        setValue,
        trigger,
        watch,
        refetchLLM,
        refetchSLM,
        refetchPrompt,
    } = props;
    const [isSlm, setSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);

    useEffect(() => {
        const values = getValues();
        const slmId = values.configurations?.retrievals?.[index]?.hydeSource?.slmId;
        const llmId = values.configurations?.retrievals?.[index]?.hydeSource?.llmId;
        const promptId = values.configurations?.retrievals?.[index]?.hydeSource?.promptId;

        // Set SLM flag
        const isSlmSelected = !!(slmId && slmId !== '');
        setSlm(isSlmSelected);

        // Set prompt
        const selectedPromptId = isEdit ? promptId : watch(`configurations.retrievals.${index}.hydeSource.promptId`);
        const selectedPrompt = prompts?.find(prompt => prompt.id === selectedPromptId);
        setPrompt(selectedPrompt);

        // Determine selected model (LLM or SLM)
        const selectedModelId = isSlmSelected
            ? isEdit
                ? slmId
                : watch(`configurations.retrievals.${index}.hydeSource.slmId`)
            : isEdit
              ? llmId
              : watch(`configurations.retrievals.${index}.hydeSource.llmId`);

        const selectedModel = isSlmSelected
            ? slmModels?.find((model: any) => model.id === selectedModelId)
            : llmModels?.find((model: any) => model.id === selectedModelId);

        if (selectedModel) {
            setLanguageModel(toLanguageModelState(selectedModel));
        }
    }, [
        isEdit,
        index,
        prompts,
        llmModels,
        slmModels,
        getValues,
        watch(`configurations.retrievals.${index}.hydeSource.sourceValue`),
        watch(`configurations.retrievals.${index}.hydeSource.promptId`),
        watch(`configurations.retrievals.${index}.hydeSource.slmId`),
        watch(`configurations.retrievals.${index}.hydeSource.llmId`),
    ]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div>
            <Controller
                name={`configurations.retrievals.${index}.hyde`}
                control={control}
                defaultValue={false}
                render={({ field }) => (
                    <div className="flex items-center gap-x-2">
                        <Switch
                            id={`enable-hyDeEnable${index}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isEdit && isReadOnly}
                        />
                        <Label htmlFor={`enable-hyDeEnable${index}`}>HyDE (Hypothetical Document Embeddings)</Label>
                    </div>
                )}
            />
            {watch(`configurations.retrievals.${index}.hyde`) && (
                <div className="flex gap-x-2 items-start">
                    <div className="w-full">
                        <Controller
                            name={`configurations.retrievals.${index}.hydeSource.sourceValue`}
                            control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: 'Please select an intelligence source',
                                },
                            }}
                            render={() => (
                                <LanguageSelector
                                    isSlm={isSlm}
                                    agent={undefined}
                                    label=""
                                    description="Please select an intelligence source for the HyDE process to work effectively and accurately"
                                    languageModel={languageModel}
                                    llmModelsLoading={loadingLlmModels}
                                    slmModelsLoading={loadingSlmModels}
                                    setLanguageModel={setLanguageModel}
                                    allModels={(llmModels as IModel[]) ?? []}
                                    allSTSModels={[]}
                                    allSLMModels={(slmModels as IModel[]) ?? []}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    onIntelligenceSourceChange={value => setSlm(value)}
                                    onLanguageModelChange={e =>
                                        applyLanguageModelToForm(
                                            e,
                                            `configurations.retrievals.${index}.hydeSource`,
                                            isSlm,
                                            setValue
                                        )
                                    }
                                    onModalChange={() =>
                                        handleTrigger(
                                            `configurations.retrievals.${index}.hydeSource.sourceValue`,
                                            trigger
                                        )
                                    }
                                    onRefetch={() => {
                                        refetchLLM();
                                        refetchSLM();
                                    }}
                                />
                            )}
                        />
                        {!!errors?.configurations?.retrievals?.[index]?.hydeSource?.sourceValue?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.configurations?.retrievals?.[index]?.hydeSource?.sourceValue?.message}
                            </p>
                        )}
                    </div>
                    <div className="bg-gray-200 w-[1px] h-[120px]" />
                    <div className="col-span-1 sm:col-span-2 w-full">
                        <Controller
                            name={`configurations.retrievals.${index}.hydeSource.promptId`}
                            control={control}
                            render={() => (
                                <PromptSelector
                                    label=""
                                    description="Choose a prompt for HyDE. If not, the agent will use the default attached prompt"
                                    agent={undefined}
                                    prompt={prompt}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    promptsLoading={loadingPrompts}
                                    setPrompt={setPrompt}
                                    allPrompts={prompts as PromptResponse[]}
                                    onPromptChange={e =>
                                        applyPromptToForm(e, `configurations.retrievals.${index}.hydeSource`, setValue)
                                    }
                                    onModalChange={() =>
                                        handleTrigger(`configurations.retrievals.${index}.hydeSource.promptId`, trigger)
                                    }
                                    onRefetch={refetchPrompt}
                                />
                            )}
                        />
                        {!!errors?.configurations?.retrievals?.[index]?.hydeSource?.promptId?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.configurations?.retrievals?.[index]?.hydeSource?.promptId?.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const PreRetrievalFormFields = (props: GraphRagConfigurationFormProps) => {
    const {
        errors,
        isEdit,
        control,
        llmModels,
        slmModels,
        prompts,
        loadingLlmModels,
        loadingSlmModels,
        loadingPrompts,
        index = 0,
        getValues,
        setValue,
        register,
        trigger,
        watch,
        refetchLLM,
        refetchSLM,
        refetchPrompt,
    } = props;
    const [isSlm, setSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);

    useEffect(() => {
        const values = getValues();
        const slmId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.slmId;
        const llmId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.llmId;
        const promptId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.promptId;

        // Set SLM flag
        const isSlmSelected = !!(slmId && slmId !== '');
        setSlm(isSlmSelected);

        // Set prompt
        const selectedPromptId = isEdit
            ? promptId
            : watch(`configurations.retrievals.${index}.queryExpansionSource.promptId`);
        const selectedPrompt = prompts?.find(prompt => prompt.id === selectedPromptId);
        setPrompt(selectedPrompt);

        // Determine selected model (LLM or SLM)
        const selectedModelId = isSlmSelected
            ? isEdit
                ? slmId
                : watch(`configurations.retrievals.${index}.queryExpansionSource.slmId`)
            : isEdit
              ? llmId
              : watch(`configurations.retrievals.${index}.queryExpansionSource.llmId`);

        const selectedModel = isSlmSelected
            ? slmModels?.find((model: any) => model.id === selectedModelId)
            : llmModels?.find((model: any) => model.id === selectedModelId);

        if (selectedModel) {
            setLanguageModel(toLanguageModelState(selectedModel));
        }
    }, [
        isEdit,
        index,
        prompts,
        llmModels,
        slmModels,
        getValues,
        watch(`configurations.retrievals.${index}.queryExpansionSource.sourceValue`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.promptId`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.slmId`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.llmId`),
    ]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid col-span-1 sm:col-span-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <div>
                    <Controller
                        name={`configurations.retrievals.${index}.queryExpansion`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <div className="flex items-center gap-x-2">
                                <Switch
                                    id={`enable-queryExpansion${index}`}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isEdit && isReadOnly}
                                />
                                <Label htmlFor={`enable-queryExpansion${index}`}>Query Expansion</Label>
                            </div>
                        )}
                    />
                    {watch(`configurations.retrievals.${index}.queryExpansion`) && (
                        <div className="flex gap-x-2 items-start">
                            <div className="w-full">
                                <Controller
                                    name={`configurations.retrievals.${index}.queryExpansionSource.sourceValue`}
                                    control={control}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: 'Please select an intelligence source',
                                        },
                                    }}
                                    render={() => (
                                        <LanguageSelector
                                            isSlm={isSlm}
                                            agent={undefined}
                                            label=""
                                            description="Please select an intelligence source for the query expansion process to work effectively and accurately"
                                            languageModel={languageModel}
                                            llmModelsLoading={loadingLlmModels}
                                            slmModelsLoading={loadingSlmModels}
                                            setLanguageModel={setLanguageModel}
                                            allModels={(llmModels as IModel[]) ?? []}
                                            allSTSModels={[]}
                                            allSLMModels={(slmModels as IModel[]) ?? []}
                                            isReadonly={isEdit && !!watch('isReadOnly')}
                                            onIntelligenceSourceChange={value => setSlm(value)}
                                            onLanguageModelChange={e =>
                                                applyLanguageModelToForm(
                                                    e,
                                                    `configurations.retrievals.${index}.queryExpansionSource`,
                                                    isSlm,
                                                    setValue
                                                )
                                            }
                                            onModalChange={() =>
                                                handleTrigger(
                                                    `configurations.retrievals.${index}.queryExpansionSource.sourceValue`,
                                                    trigger
                                                )
                                            }
                                            onRefetch={() => {
                                                refetchLLM();
                                                refetchSLM();
                                            }}
                                        />
                                    )}
                                />
                                {!!errors?.configurations?.retrievals?.[index]?.queryExpansionSource?.sourceValue
                                    ?.message && (
                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                        {
                                            errors?.configurations?.retrievals?.[index]?.queryExpansionSource
                                                ?.sourceValue?.message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="bg-gray-200 w-[1px] h-[120px]" />
                            <div className="col-span-1 sm:col-span-2 w-full">
                                <Controller
                                    name={`configurations.retrievals.${index}.queryExpansionSource.promptId`}
                                    control={control}
                                    render={() => (
                                        <PromptSelector
                                            label=""
                                            description="Choose a prompt for query expansion. If not, the agent will use the default attached prompt"
                                            agent={undefined}
                                            prompt={prompt}
                                            isReadonly={isEdit && !!watch('isReadOnly')}
                                            promptsLoading={loadingPrompts}
                                            setPrompt={setPrompt}
                                            allPrompts={prompts as PromptResponse[]}
                                            onPromptChange={e =>
                                                applyPromptToForm(
                                                    e,
                                                    `configurations.retrievals.${index}.queryExpansionSource`,
                                                    setValue
                                                )
                                            }
                                            onModalChange={() =>
                                                handleTrigger(
                                                    `configurations.retrievals.${index}.queryExpansionSource.promptId`,
                                                    trigger
                                                )
                                            }
                                            onRefetch={refetchPrompt}
                                        />
                                    )}
                                />
                                {!!errors?.configurations?.retrievals?.[index]?.queryExpansionSource?.promptId
                                    ?.message && (
                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                        {
                                            errors?.configurations?.retrievals?.[index]?.queryExpansionSource?.promptId
                                                ?.message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="col-span-1 sm:col-span-2 mt-4">
                <HydeComponent {...props} />
            </div>
            <div className="col-span-1 sm:col-span-2 mt-4">
                <div>
                    <Controller
                        name={`configurations.retrievals.${index}.enableQueryUnderstanding`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <div className="flex items-center gap-x-2">
                                <Switch
                                    id={`enable-queryUnderstanding${index}`}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isEdit && isReadOnly}
                                />
                                <Label htmlFor={`enable-queryUnderstanding${index}`}>
                                    Knowledge Graph Aware Query Understanding
                                </Label>
                            </div>
                        )}
                    />
                    {watch(`configurations.retrievals.${index}.enableQueryUnderstanding`) && (
                        <div className="flex gap-x-2 items-center mt-4">
                            <div className="w-full">
                                <Select
                                    {...register(`configurations.retrievals.${index}.queryUnderstanding.queryType`, {
                                        required: { value: true, message: 'Please select a search type' },
                                    })}
                                    label="Search Type"
                                    placeholder="Select a Search Type"
                                    options={[
                                        { name: KnowledgeGraphSearchType.NER, value: KnowledgeGraphSearchType.NER },
                                        {
                                            name: KnowledgeGraphSearchType.KGAUGMENTED,
                                            value: KnowledgeGraphSearchType.KGAUGMENTED,
                                        },
                                    ]}
                                    disabled={isEdit && isReadOnly}
                                    currentValue={watch(
                                        `configurations.retrievals.${index}.queryUnderstanding.queryType`
                                    )}
                                    isDestructive={
                                        !!errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.queryType
                                            ?.message
                                    }
                                    supportiveText={
                                        errors?.configurations?.retrievals?.[index]?.queryUnderstanding?.queryType
                                            ?.message
                                    }
                                />
                                <QueryUnderstandingComponent {...props} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreRetrievalFormFields;
