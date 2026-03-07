/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { FormFieldGroup, Label } from '@/components';
import { Controller } from 'react-hook-form';
import { Switch } from '@/components/atoms/switch';
import { IModel, LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptResponse } from '../../../agents/components/agent-form';

import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { IntelligenceSourceModel, Prompt } from '@/components/organisms';
import { RagVariantType } from '@/enums';
import {
    applyLanguageModelToForm,
    applyPromptToForm,
    handleTrigger,
    toLanguageModelState,
} from '../../graph-rag-configurations/components/forms/retrieval-form-helpers';

const FusionRagConfiguration = (props: VectorRagConfigurationFormProps) => {
    const {
        isEdit,
        control,
        allModels,
        allSLMModels,
        slmModelsLoading,
        llmModelsLoading,
        setValue,
        watch,
        getValues,
        trigger,
        refetchLlms,
        refetchSLM,
    } = props;
    const [isSlm, setSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();

    useEffect(() => {
        if (!isEdit) {
            if (isSlm) {
                setValue('configurations.fusionRag.llmId', undefined);
                setValue('configurations.fusionRag.slmId', languageModel?.modelId as string);
            } else {
                setValue('configurations.fusionRag.slmId', undefined);
                setValue('configurations.fusionRag.llmId', languageModel?.modelId as string);
            }
            setValue('configurations.fusionRag.sourceValue', languageModel?.modelId);
        }
    }, [prompt, languageModel, isSlm]);

    useEffect(() => {
        const slmId = getValues('configurations.fusionRag.slmId');
        if (slmId && slmId !== '') {
            setSlm(true);
        } else {
            setSlm(false);
        }
    }, [getValues('configurations.fusionRag.llmId'), getValues('configurations.fusionRag.slmId')]);

    useEffect(() => {
        if (isEdit) {
            const llm = isSlm
                ? allSLMModels?.find((model: any) => model.id === getValues().configurations?.fusionRag?.slmId)
                : allModels?.find((model: any) => model.id === getValues().configurations?.fusionRag?.llmId);
            if (llm) {
                setLanguageModel(toLanguageModelState(llm));
            }
        }
    }, [isEdit, allModels, allSLMModels, isSlm]);

    return (
        <div className="grid col-span-1 sm:col-span-2 gap-4">
            <div className="w-full">
                <Controller
                    name="configurations.fusionRag.sourceValue"
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
                            description="Select an intelligence source for Fusion RAG Grader & Rewriter Section"
                            languageModel={languageModel}
                            llmModelsLoading={llmModelsLoading}
                            slmModelsLoading={slmModelsLoading}
                            setLanguageModel={setLanguageModel}
                            allModels={(allModels as IModel[]) ?? []}
                            allSTSModels={[]}
                            allSLMModels={(allSLMModels as IModel[]) ?? []}
                            isReadonly={isEdit && !!watch('isReadOnly')}
                            onIntelligenceSourceChange={value => setSlm(value)}
                            onLanguageModelChange={e =>
                                applyLanguageModelToForm(e, 'configurations.fusionRag', isSlm, setValue)
                            }
                            onModalChange={() => handleTrigger('configurations.fusionRag.sourceValue', trigger)}
                            onRefetch={() => {
                                refetchLlms();
                                refetchSLM();
                            }}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export const GeneratorTab = (props: VectorRagConfigurationFormProps) => {
    const {
        isEdit,
        errors,
        control,
        allModels,
        allSLMModels,
        allPrompts,
        promptsLoading,
        slmModelsLoading,
        llmModelsLoading,
        setValue,
        watch,
        getValues,
        trigger,
        refetchLlms,
        refetchSLM,
        onRefetchPrompt,
    } = props;
    const [isSlm, setSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [prompt, setPrompt] = useState<Prompt>();

    useEffect(() => {
        if (!isEdit) {
            setValue('configurations.generatorSource.promptId', prompt?.id as string);
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

    useEffect(() => {
        const slmId = getValues('configurations.generatorSource.slmId');
        if (slmId && slmId !== '') {
            setSlm(true);
        } else {
            setSlm(false);
        }
    }, [getValues('configurations.generatorSource.llmId'), getValues('configurations.generatorSource.slmId')]);

    useEffect(() => {
        if (isEdit) {
            setPrompt(allPrompts?.find(prompt => prompt.id === getValues().configurations?.generatorSource?.promptId));
            const llm = isSlm
                ? allSLMModels?.find((model: any) => model.id === getValues().configurations?.generatorSource?.slmId)
                : allModels?.find((model: any) => model.id === getValues().configurations?.generatorSource?.llmId);
            if (llm) {
                setLanguageModel(toLanguageModelState(llm));
            }
        }
    }, [isEdit, allModels, allPrompts, allSLMModels, isSlm]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full -mt-8">
            <FormFieldGroup
                title="General"
                description="If not selected, the agent's default response generation settings will be used. If selected, these settings will override the agent's defaults."
                showSeparator={false}
            >
                <div className="col-span-1 sm:col-span-2">
                    <div>
                        <Controller
                            name="configurations.generator"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <div className="flex items-center gap-x-2">
                                    <Switch
                                        id="enable-enableGenerator"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isEdit && isReadOnly}
                                    />
                                    <Label htmlFor="enable_enableGenerator">Enable Response Generation</Label>
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
                                                llmModelsLoading={llmModelsLoading}
                                                slmModelsLoading={slmModelsLoading}
                                                setLanguageModel={setLanguageModel}
                                                allModels={(allModels as IModel[]) ?? []}
                                                allSTSModels={[]}
                                                allSLMModels={(allSLMModels as IModel[]) ?? []}
                                                isReadonly={isEdit && !!watch('isReadOnly')}
                                                onIntelligenceSourceChange={value => setSlm(value)}
                                                onLanguageModelChange={e =>
                                                    applyLanguageModelToForm(
                                                        e,
                                                        'configurations.generatorSource',
                                                        isSlm,
                                                        setValue
                                                    )
                                                }
                                                onModalChange={() =>
                                                    handleTrigger('configurations.generatorSource.sourceValue', trigger)
                                                }
                                                onRefetch={() => {
                                                    refetchLlms?.();
                                                    refetchSLM?.();
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
                                <div className="col-span-1 sm:col-span-2 mb-2 w-full">
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
                                                promptsLoading={promptsLoading}
                                                setPrompt={setPrompt}
                                                allPrompts={allPrompts as PromptResponse[]}
                                                onPromptChange={e =>
                                                    applyPromptToForm(e, 'configurations.generatorSource', setValue)
                                                }
                                                onModalChange={() =>
                                                    handleTrigger('configurations.generatorSource.promptId', trigger)
                                                }
                                                onRefetch={onRefetchPrompt!}
                                            />
                                        )}
                                    />
                                    {!!errors?.configurations?.generatorSource?.promptId?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {errors?.configurations?.generatorSource?.promptId?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FormFieldGroup>
            {watch('configurations.ragVariant') === RagVariantType.FUSION && (
                <>
                    <FormFieldGroup
                        title="Fusion RAG Configurations"
                        showSeparator={false}
                        isDestructive={!!errors?.configurations?.fusionRag?.sourceValue?.message}
                    >
                        <FusionRagConfiguration {...props} />
                    </FormFieldGroup>
                    {!!errors?.configurations?.fusionRag?.sourceValue?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 -mt-5">
                            {errors?.configurations?.fusionRag?.sourceValue?.message}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
