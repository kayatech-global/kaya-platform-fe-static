/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { GraphRagConfigurationFormProps } from '../graph-rag-configuration-form';
import { FormFieldGroup, Label } from '@/components';
import { Controller } from 'react-hook-form';
import { Switch } from '@/components/atoms/switch';
import { IModel, LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { IntelligenceSourceModel, Prompt } from '@/components/organisms';
import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import { GraphRagType } from '@/enums';
import {
    applyLanguageModelToForm,
    applyPromptToForm,
    handleTrigger,
    toLanguageModelState,
} from './retrieval-form-helpers';

const CorrectiveRagConfiguration = (props: GraphRagConfigurationFormProps) => {
    const {
        isEdit,
        control,
        llmModels,
        slmModels,
        loadingLlmModels,
        loadingSlmModels,
        setValue,
        trigger,
        getValues,
        watch,
        refetchLLM,
        refetchSLM,
    } = props;
    const [isSlm, setIsSlm] = useState(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);

    useEffect(() => {
        if (!isEdit) {
            if (isSlm) {
                setValue('configurations.correctiveRag.llmId', undefined);
                setValue('configurations.correctiveRag.slmId', languageModel?.modelId as string);
            } else {
                setValue('configurations.correctiveRag.slmId', undefined);
                setValue('configurations.correctiveRag.llmId', languageModel?.modelId as string);
            }
            setValue('configurations.correctiveRag.sourceValue', languageModel?.modelId);
        }
    }, [prompt, languageModel, isSlm]);

    const correctiveRagLlmId = getValues('configurations.correctiveRag.llmId');
    const correctiveRagSlmId = getValues('configurations.correctiveRag.slmId');
    useEffect(() => {
        if (correctiveRagSlmId && correctiveRagSlmId !== '') {
            setIsSlm(true);
        } else {
            setIsSlm(false);
        }
    }, [correctiveRagLlmId, correctiveRagSlmId]);

    useEffect(() => {
        if (isEdit) {
            const llm = isSlm
                ? slmModels?.find((model: any) => model.id === getValues().configurations?.correctiveRag?.slmId)
                : llmModels?.find((model: any) => model.id === getValues().configurations?.correctiveRag?.llmId);
            if (llm) {
                setLanguageModel(toLanguageModelState(llm));
            }
        }
    }, [isEdit, llmModels, slmModels, isSlm]);

    return (
        <div className="grid col-span-1 sm:col-span-2 gap-4">
            <div className="w-full">
                <Controller
                    name="configurations.correctiveRag.sourceValue"
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
                            description="Select an intelligence source for Corrective RAG Grader & Rewriter Section"
                            languageModel={languageModel}
                            llmModelsLoading={loadingLlmModels}
                            slmModelsLoading={loadingSlmModels}
                            setLanguageModel={setLanguageModel}
                            allModels={(llmModels as IModel[]) ?? []}
                            allSTSModels={[]}
                            allSLMModels={(slmModels as IModel[]) ?? []}
                            isReadonly={isEdit && !!watch('isReadOnly')}
                            onIntelligenceSourceChange={value => setIsSlm(value)}
                            onLanguageModelChange={e =>
                                applyLanguageModelToForm(e, 'configurations.correctiveRag', isSlm, setValue)
                            }
                            onModalChange={() => handleTrigger('configurations.correctiveRag.sourceValue', trigger)}
                            onRefetch={() => {
                                refetchLLM();
                                refetchSLM();
                            }}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export const GeneratorTab = (props: GraphRagConfigurationFormProps) => {
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
        setValue,
        trigger,
        getValues,
        watch,
        refetchLLM,
        refetchSLM,
        refetchPrompt,
    } = props;
    const [isSlm, setIsSlm] = useState(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);

    useEffect(() => {
        if (!isEdit) {
            setValue('configurations.generatorSource.promptId', prompt?.id ?? '');
            if (isSlm) {
                setValue('configurations.generatorSource.llmId', undefined);
                setValue('configurations.generatorSource.slmId', languageModel?.modelId as string);
            } else {
                setValue('configurations.generatorSource.slmId', undefined);
                setValue('configurations.generatorSource.llmId', languageModel?.modelId as string);
            }
            setValue('configurations.generatorSource.sourceValue', languageModel?.modelId);
        }
    }, [prompt, languageModel, isSlm]);

    const generatorSourceLlmId = getValues('configurations.generatorSource.llmId');
    const generatorSourceSlmId = getValues('configurations.generatorSource.slmId');
    useEffect(() => {
        if (generatorSourceSlmId && generatorSourceSlmId !== '') {
            setIsSlm(true);
        } else {
            setIsSlm(false);
        }
    }, [generatorSourceLlmId, generatorSourceSlmId]);

    useEffect(() => {
        if (isEdit) {
            setPrompt(prompts?.find(prompt => prompt.id === getValues().configurations?.generatorSource?.promptId));
            const llm = isSlm
                ? slmModels?.find((model: any) => model.id === getValues().configurations?.generatorSource?.slmId)
                : llmModels?.find((model: any) => model.id === getValues().configurations?.generatorSource?.llmId);
            if (llm) {
                setLanguageModel(toLanguageModelState(llm));
            }
        }
    }, [isEdit, llmModels, prompts, slmModels, isSlm]);

    const isReadOnlyValue = watch('isReadOnly');
    const isReadOnly = useMemo(() => !!isReadOnlyValue, [isReadOnlyValue]);

    return (
        <>
            {watch('configurations.graphRagType') && (
                <>
                    <FormFieldGroup
                        title="General"
                        showSeparator={false}
                        description="If not selected, the agent's default response generation settings will be used. If selected, these settings will override the agent's defaults."
                    >
                        <div className="grid col-span-1 sm:col-span-2 gap-4">
                            <div className="col-span-1 sm:col-span-2">
                                <div>
                                    <Controller
                                        name="configurations.generator"
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }) => (
                                            <div className="flex items-center gap-x-2">
                                                <Switch
                                                    id="enable-generator"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isEdit && isReadOnly}
                                                />
                                                <Label htmlFor="enable-generator">Enable Response Generation</Label>
                                            </div>
                                        )}
                                    />
                                    {watch('configurations.generator') && (
                                        <div className="flex gap-x-2 items-start">
                                            <div className="w-full">
                                                <Controller
                                                    name="configurations.generatorSource.sourceValue"
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
                                                            description="Please select an intelligence source for generator"
                                                            languageModel={languageModel}
                                                            llmModelsLoading={loadingLlmModels}
                                                            slmModelsLoading={loadingSlmModels}
                                                            setLanguageModel={setLanguageModel}
                                                            allModels={(llmModels as IModel[]) ?? []}
                                                            allSTSModels={[]}
                                                            allSLMModels={(slmModels as IModel[]) ?? []}
                                                            isReadonly={isEdit && !!watch('isReadOnly')}
                                                            onIntelligenceSourceChange={value => setIsSlm(value)}
                                                            onLanguageModelChange={e =>
                                                                applyLanguageModelToForm(
                                                                    e,
                                                                    'configurations.generatorSource',
                                                                    isSlm,
                                                                    setValue
                                                                )
                                                            }
                                                            onModalChange={() =>
                                                                handleTrigger(
                                                                    'configurations.generatorSource.sourceValue',
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
                                                {!!errors?.configurations?.generatorSource?.sourceValue?.message && (
                                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                                        {errors?.configurations?.generatorSource?.sourceValue?.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="bg-gray-200 w-[1px] h-[120px]" />
                                            <div className="col-span-1 sm:col-span-2 w-full">
                                                <Controller
                                                    name="configurations.generatorSource.promptId"
                                                    control={control}
                                                    render={() => (
                                                        <PromptSelector
                                                            label=""
                                                            description="Choose a prompt for generator. If not, the agent will use the default attached prompt"
                                                            agent={undefined}
                                                            prompt={prompt}
                                                            isReadonly={isEdit && !!watch('isReadOnly')}
                                                            promptsLoading={loadingPrompts}
                                                            setPrompt={setPrompt}
                                                            allPrompts={prompts as PromptResponse[]}
                                                            onPromptChange={e =>
                                                                applyPromptToForm(
                                                                    e,
                                                                    'configurations.generatorSource',
                                                                    setValue
                                                                )
                                                            }
                                                            onModalChange={() =>
                                                                handleTrigger(
                                                                    'configurations.generatorSource.promptId',
                                                                    trigger
                                                                )
                                                            }
                                                            onRefetch={refetchPrompt}
                                                        />
                                                    )}
                                                />
                                                {errors?.configurations?.generatorSource?.promptId?.message && (
                                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                                        {errors?.configurations?.generatorSource?.promptId?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FormFieldGroup>
                    {watch('configurations.graphRagType') === GraphRagType.CORRECTIVERAG && (
                        <>
                            <FormFieldGroup
                                title="Corrective RAG Configurations"
                                showSeparator={false}
                                isDestructive={!!errors?.configurations?.correctiveRag?.sourceValue?.message}
                            >
                                <CorrectiveRagConfiguration {...props} />
                            </FormFieldGroup>
                            {errors?.configurations?.correctiveRag?.sourceValue?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 -mt-5">
                                    {errors?.configurations?.correctiveRag?.sourceValue?.message}
                                </p>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
};
