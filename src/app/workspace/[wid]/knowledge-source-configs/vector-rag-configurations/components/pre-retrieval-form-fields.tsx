/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { Controller } from 'react-hook-form';
import { Switch } from '@/components/atoms/switch';
import { Label } from '@/components';
import { IModel, LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { PromptResponse } from '../../../agents/components/agent-form';
import { IntelligenceSourceModel, Prompt } from '@/components/organisms';
import {
    applyLanguageModelToForm,
    applyPromptToForm,
    handleTrigger,
    toLanguageModelState,
} from '../../graph-rag-configurations/components/forms/retrieval-form-helpers';

interface IPreRetrievalFormFieldsProps {
    props: VectorRagConfigurationFormProps;
    isReadOnly: boolean;
}

const HydeComponent = ({ props, isReadOnly }: IPreRetrievalFormFieldsProps) => {
    const {
        control,
        isEdit,
        errors,
        allModels,
        allSLMModels,
        allPrompts,
        promptsLoading,
        slmModelsLoading,
        llmModelsLoading,
        index = 0,
        getValues,
        trigger,
        watch,
        setValue,
        refetchLlms,
        refetchSLM,
        onRefetchPrompt,
    } = props;
    const [isSlm, setIsSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);

    useEffect(() => {
        const values = getValues();
        const slmId = values.configurations?.retrievals?.[index]?.hydeSource?.slmId;
        const llmId = values.configurations?.retrievals?.[index]?.hydeSource?.llmId;
        const promptId = values.configurations?.retrievals?.[index]?.hydeSource?.promptId;

        // Set SLM flag
        const isSlmSelected = !!(slmId && slmId !== '');
        setIsSlm(isSlmSelected);

        // Set prompt
        const selectedPromptId = isEdit ? promptId : watch(`configurations.retrievals.${index}.hydeSource.promptId`);
        const selectedPrompt = allPrompts?.find(prompt => prompt.id === selectedPromptId);
        setPrompt(selectedPrompt);

        // Determine selected model (LLM or SLM)
        let selectedModelId;
        if (isSlmSelected) {
            selectedModelId = isEdit ? slmId : watch(`configurations.retrievals.${index}.hydeSource.slmId`);
        } else {
            selectedModelId = isEdit ? llmId : watch(`configurations.retrievals.${index}.hydeSource.llmId`);
        }

        const selectedModel = isSlmSelected
            ? allSLMModels?.find((model: any) => model.id === selectedModelId)
            : allModels?.find((model: any) => model.id === selectedModelId);

        if (selectedModel) {
            setLanguageModel(toLanguageModelState(selectedModel));
        }
    }, [
        isEdit,
        index,
        allPrompts,
        allModels,
        allSLMModels,
        getValues,
        watch(`configurations.retrievals.${index}.hydeSource.sourceValue`),
        watch(`configurations.retrievals.${index}.hydeSource.promptId`),
        watch(`configurations.retrievals.${index}.hydeSource.slmId`),
        watch(`configurations.retrievals.${index}.hydeSource.llmId`),
    ]);

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
                                    llmModelsLoading={llmModelsLoading}
                                    slmModelsLoading={slmModelsLoading}
                                    setLanguageModel={setLanguageModel}
                                    allModels={(allModels as unknown as IModel[]) ?? []}
                                    allSTSModels={[]}
                                    allSLMModels={(allSLMModels as unknown as IModel[]) ?? []}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    onIntelligenceSourceChange={value => setIsSlm(value)}
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
                                        refetchLlms?.();
                                        refetchSLM?.();
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
                                    promptsLoading={promptsLoading}
                                    setPrompt={setPrompt}
                                    allPrompts={allPrompts as PromptResponse[]}
                                    onPromptChange={e =>
                                        applyPromptToForm(e, `configurations.retrievals.${index}.hydeSource`, setValue)
                                    }
                                    onModalChange={() =>
                                        handleTrigger(`configurations.retrievals.${index}.hydeSource.promptId`, trigger)
                                    }
                                    onRefetch={onRefetchPrompt}
                                />
                            )}
                        />
                        {errors?.configurations?.retrievals?.[index]?.hydeSource?.promptId?.message && (
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

export const PreRetrievalFormFields = ({ props, isReadOnly }: IPreRetrievalFormFieldsProps) => {
    const {
        control,
        isEdit,
        errors,
        allModels,
        allSLMModels,
        allPrompts,
        promptsLoading,
        slmModelsLoading,
        llmModelsLoading,
        index = 0,
        getValues,
        trigger,
        watch,
        setValue,
        refetchLlms,
        refetchSLM,
        onRefetchPrompt,
    } = props;
    const [isSlm, setIsSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);

    useEffect(() => {
        const values = getValues();
        const slmId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.slmId;
        const llmId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.llmId;
        const promptId = values.configurations?.retrievals?.[index]?.queryExpansionSource?.promptId;

        // Set SLM flag
        const isSlmSelected = !!(slmId && slmId !== '');
        setIsSlm(isSlmSelected);

        // Set prompt
        const selectedPromptId = isEdit
            ? promptId
            : watch(`configurations.retrievals.${index}.queryExpansionSource.promptId`);
        const selectedPrompt = allPrompts?.find(prompt => prompt.id === selectedPromptId);
        setPrompt(selectedPrompt);

        // Determine selected model (LLM or SLM)
        let selectedModelId;
        if (isSlmSelected) {
            selectedModelId = isEdit ? slmId : watch(`configurations.retrievals.${index}.queryExpansionSource.slmId`);
        } else {
            selectedModelId = isEdit ? llmId : watch(`configurations.retrievals.${index}.queryExpansionSource.llmId`);
        }

        const selectedModel = isSlmSelected
            ? allSLMModels?.find((model: any) => model.id === selectedModelId)
            : allModels?.find((model: any) => model.id === selectedModelId);

        if (selectedModel) {
            setLanguageModel(toLanguageModelState(selectedModel));
        }
    }, [
        isEdit,
        index,
        allPrompts,
        allModels,
        allSLMModels,
        getValues,
        watch(`configurations.retrievals.${index}.queryExpansionSource.sourceValue`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.promptId`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.slmId`),
        watch(`configurations.retrievals.${index}.queryExpansionSource.llmId`),
    ]);

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
                                            llmModelsLoading={llmModelsLoading}
                                            slmModelsLoading={slmModelsLoading}
                                            setLanguageModel={setLanguageModel}
                                            allModels={(allModels as unknown as IModel[]) ?? []}
                                            allSTSModels={[]}
                                            allSLMModels={(allSLMModels as unknown as IModel[]) ?? []}
                                            isReadonly={isEdit && !!watch('isReadOnly')}
                                            onIntelligenceSourceChange={value => setIsSlm(value)}
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
                                                refetchLlms?.();
                                                refetchSLM?.();
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
                                            promptsLoading={promptsLoading}
                                            setPrompt={setPrompt}
                                            allPrompts={allPrompts as PromptResponse[]}
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
                                            onRefetch={onRefetchPrompt}
                                        />
                                    )}
                                />
                                {Boolean(
                                    errors?.configurations?.retrievals?.[index]?.queryExpansionSource?.promptId?.message
                                ) && (
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
                <HydeComponent props={props} isReadOnly={isReadOnly} />
            </div>
        </div>
    );
};
