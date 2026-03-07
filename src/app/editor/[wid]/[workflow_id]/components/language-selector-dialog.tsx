'use client';

import { FormBody as LlmFormBody } from '@/app/workspace/[wid]/intelligence-source-configs/llm-configurations/components/llm-configuration-form';
import { FormBody as SlmFormBody } from '@/app/workspace/[wid]/intelligence-source-configs/slm-configurations/components/slm-configuration-form';
import { FormBody as StsFormBody } from '@/app/workspace/[wid]/intelligence-source-configs/sts-configurations/components/sts-configuration-form';

import { Button, RadioChips, SelectableRadioItem } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DraggableTabsList, Tabs, TabsContent, TabsTrigger } from '@/components/atoms/tabs';
import { IntelligenceSourceModel } from '@/components/organisms';
import { IntelligenceSourceType } from '@/enums';
import { useLlmConfiguration } from '@/hooks/use-llm-configuration';
import { useSlmConfiguration } from '@/hooks/use-slm-configuration';
import { useStsConfiguration } from '@/hooks/use-sts-configuration';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { IModel, LanguageModel, LanguageProvider } from './language-selector';
import { isNullOrEmpty } from '@/lib/utils';

interface LanguageSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    languageModel: IntelligenceSourceModel | undefined;
    setLanguageModel: React.Dispatch<React.SetStateAction<IntelligenceSourceModel | undefined>>;
    allModels: IModel[];
    allSLMModels: IModel[];
    allSTSModels: IModel[];
    llmModelsLoading?: boolean;
    slmModelsLoading?: boolean;
    stsModelsLoading?: boolean;
    onRefetch: () => void;
    onLanguageModelChange?: (model: IntelligenceSourceModel | undefined) => void;
    onIntelligenceSourceChange: (value: boolean) => void;
    disabledSourceTypes?: IntelligenceSourceType[];
    visibleSourceTypes?: IntelligenceSourceType[];
    isSlm?: boolean;
}

export const LanguageSelectorDialog = ({
    open,
    onOpenChange,
    languageModel,
    setLanguageModel,
    allModels,
    allSLMModels,
    allSTSModels,
    llmModelsLoading,
    slmModelsLoading,
    stsModelsLoading,
    onRefetch,
    onLanguageModelChange,
    onIntelligenceSourceChange,
    disabledSourceTypes = [],
    visibleSourceTypes = [IntelligenceSourceType.LLM, IntelligenceSourceType.SLM, IntelligenceSourceType.STS],
    isSlm = false,
}: LanguageSelectorDialogProps) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [selectedModelByProvider, setSelectedModelByProvider] = useState<LanguageProvider | undefined>(undefined);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [currentIntelligenceSource, setCurrentIntelligenceSource] = useState<IntelligenceSourceType>(
        IntelligenceSourceType.LLM
    );

    const llmConfig = useMemo(() => ({ triggerQuery: false, onRefetch }), [onRefetch]);
    const {
        isOpen,
        isValid,
        providers,
        errors,
        secrets,
        isSaving,
        loadingSecrets,
        control,
        setOpen,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        refetch,
    } = useLlmConfiguration(llmConfig);

    const slmConfig = useMemo(() => ({ triggerQuery: false, onRefetch }), [onRefetch]);
    const {
        isOpen: isOpenSlm,
        isValid: isValidSlm,
        providers: slmProviders,
        errors: errorsSlm,
        secrets: secretsSlm,
        isSaving: isSavingSlm,
        loadingSecrets: loadingSecretsSlm,
        control: controlSlm,
        setOpen: setOpenSlm,
        register: registerSlm,
        watch: watchSlm,
        setValue: setValueSlm,
        handleSubmit: handleSubmitSlm,
        onHandleSubmit: onHandleSubmitSlm,
        refetch: refetchSlm,
    } = useSlmConfiguration(slmConfig);

    const stsConfig = useMemo(() => ({ triggerQuery: false, onRefetch }), [onRefetch]);
    const {
        isOpen: isOpenSts,
        isValid: isValidSts,
        providers: stsProviders,
        errors: errorsSts,
        secrets: secretsSts,
        isSaving: isSavingSts,
        loadingSecrets: loadingSecretsSts,
        control: controlSts,
        setOpen: setOpenSts,
        register: registerSts,
        watch: watchSts,
        setValue: setValueSts,
        handleSubmit: handleSubmitSts,
        onHandleSubmit: onHandleSubmitSts,
        refetch: refetchSts,
    } = useStsConfiguration(stsConfig);

    useEffect(() => {
        const isLlmEnabled = !disabledSourceTypes.includes(IntelligenceSourceType.LLM);
        const isSlmEnabled = !disabledSourceTypes.includes(IntelligenceSourceType.SLM);

        if (isSlm && isSlmEnabled) {
            setCurrentIntelligenceSource(IntelligenceSourceType.SLM);
        } else if (isLlmEnabled) {
            setCurrentIntelligenceSource(IntelligenceSourceType.LLM);
        } else {
            setCurrentIntelligenceSource(IntelligenceSourceType.STS);
        }
    }, [isSlm, disabledSourceTypes]);

    useEffect(() => {
        if (!isOpen && !isOpenSlm && !isOpenSts) {
            setIsEdit(false);
        }
    }, [isOpen, isOpenSlm, isOpenSts]);

    useEffect(() => {
        if (open && languageModel) {
            setSelectedModelId(languageModel?.modelId);
        } else {
            setSelectedModelId(null);
        }
    }, [open, languageModel]);

    const languageModels = useMemo(() => {
        switch (currentIntelligenceSource) {
            case IntelligenceSourceType.LLM:
                return allModels ?? [];
            case IntelligenceSourceType.SLM:
                return allSLMModels ?? [];
            case IntelligenceSourceType.STS:
                return allSTSModels ?? [];
            default:
                return [];
        }
    }, [currentIntelligenceSource, allModels, allSLMModels, allSTSModels]);

    const transformModels = (modelsToTransform: IModel[]): LanguageProvider[] => {
        const providerMap = new Map<string, LanguageProvider>();

        modelsToTransform?.forEach(model => {
            const providerId = model.configurations?.providerConfig?.id || model.provider;
            const providerName = model.configurations?.providerConfig?.value || model.provider;
            const providerLogoPath = model.configurations?.providerConfig?.logo?.['48'] ?? '';

            if (!providerMap.has(providerId)) {
                providerMap.set(providerId, {
                    id: providerId,
                    providerName,
                    providerLogoPath,
                    models: [],
                });
            }

            const stableModelId = `${model.modelName}-${providerId}`;

            providerMap.get(providerId)!.models.push({
                id: stableModelId,
                modelId: model.id,
                modelName: model.name,
                modelDescription: model.configurations?.description || model.description,
            });
        });
        return Array.from(providerMap.values());
    };

    const [selections, setSelections] = useState<{
        [key in IntelligenceSourceType]?: {
            modelId: string;
            provider: LanguageProvider;
        };
    }>({});

    useEffect(() => {
        if (open && selectedModelId && !selectedModelByProvider) {
            const modelArrays = [
                { models: allModels, type: IntelligenceSourceType.LLM },
                { models: allSLMModels, type: IntelligenceSourceType.SLM },
                { models: allSTSModels, type: IntelligenceSourceType.STS },
            ];

            for (const { models, type } of modelArrays) {
                const _provider = transformModels(models)
                    .map(provider => {
                        const model = provider.models.find(m => m.modelId === selectedModelId);
                        if (model) {
                            return {
                                id: provider.id,
                                providerName: provider.providerName,
                                providerLogoPath: provider.providerLogoPath,
                                models: [model],
                            };
                        }
                        return null;
                    })
                    .find(item => item !== null);

                if (_provider) {
                    setSelectedModelByProvider(_provider);
                    setCurrentIntelligenceSource(type);
                    break;
                }
            }
        }
    }, [selectedModelId, open, selectedModelByProvider, allModels, allSLMModels, allSTSModels]);

    const getModelsForSource = () => {
        if (currentIntelligenceSource === IntelligenceSourceType.STS) {
            return allSTSModels;
        }
        if (isSlm) {
            return allSLMModels;
        }
        return allModels;
    };

    const findProviderAndModel = (modelsForSource: IModel[]) => {
        const providerData = transformModels(modelsForSource)
            .map(provider => {
                const model = provider.models.find(m => m.modelId === selectedModelId);
                if (model) {
                    return {
                        id: provider.id,
                        providerName: provider.providerName,
                        providerLogoPath: provider.providerLogoPath,
                        models: [model],
                    };
                }
                return null;
            })
            .find(item => item !== null);

        const selectedModel = providerData?.models.find(model => model.modelId === selectedModelId);

        return { providerData, selectedModel };
    };

    const createSelectedModelObject = (providerData: ReturnType<typeof findProviderAndModel>['providerData']) => {
        if (!providerData || !selectedModelByProvider) return undefined;

        return {
            id: providerData.id ?? selectedModelByProvider.id,
            provider: providerData.providerName ?? selectedModelByProvider.providerName,
            modelName: providerData.models[0]?.modelName ?? selectedModelByProvider.models[0].modelName,
            modelDescription:
                providerData.models[0]?.modelDescription ?? selectedModelByProvider.models[0].modelDescription,
            modelId: providerData.models[0]?.modelId ?? selectedModelByProvider.models[0].modelId,
            providerLogo: providerData.providerLogoPath ?? selectedModelByProvider.providerLogoPath,
            modelUniqueId: providerData.models[0]?.id ?? selectedModelByProvider.models[0].id,
        };
    };

    const handleConfirm = () => {
        if (selectedModelByProvider) {
            const modelsForSource = getModelsForSource();
            const { providerData, selectedModel } = findProviderAndModel(modelsForSource);

            if (selectedModel) {
                const newModel = createSelectedModelObject(providerData);
                if (newModel) {
                    setLanguageModel(newModel);
                    if (onLanguageModelChange) {
                        onLanguageModelChange(newModel);
                    }
                }
            }
        }
        onOpenChange(false);
    };

    const getSortedModels = (provider: LanguageProvider) => {
        if (!selectedModelId) return provider.models;
        return [
            ...provider.models.filter(m => m.modelId === selectedModelId),
            ...provider.models.filter(m => m.modelId !== selectedModelId),
        ];
    };

    const handleSelectModel = (provider: LanguageProvider, model: LanguageModel) => {
        setSelectedModelId(model.modelId);
        setSelectedModelByProvider({
            id: provider.id,
            providerName: provider.providerName,
            providerLogoPath: provider.providerLogoPath,
            models: [model],
        });

        setSelections(prev => ({
            ...prev,
            [currentIntelligenceSource]: {
                modelId: model.modelId,
                provider,
            },
        }));
    };

    const handleIntelligenceSourceChange = (value: IntelligenceSourceType) => {
        if (disabledSourceTypes.includes(value)) return;

        setCurrentIntelligenceSource(value);
        onIntelligenceSourceChange(value === IntelligenceSourceType.SLM);
        const saved = selections[value];
        if (saved) {
            setSelectedModelId(saved.modelId);
            setSelectedModelByProvider(saved.provider);
        } else {
            setSelectedModelId(null);
            setSelectedModelByProvider(undefined);
        }
    };

    const handleEditLLM = (obj: IModel) => {
        setValue('id', obj.id);
        setValue('connectionName', obj.name);
        setValue('provider', obj.provider);
        setValue('modelName', obj.modelName);
        setValue(
            'temperature',
            Number.isNaN(Number(obj?.configurations?.temperature)) ? null : obj?.configurations?.temperature
        );
        setValue(
            'maxTokens',
            Number.isNaN(Number(obj?.configurations?.maxTokens)) ? null : obj?.configurations?.maxTokens
        );
        setValue('apiAuthorization', obj.configurations?.apiAuthorization);
        setValue('baseUrl', obj.configurations?.baseUrl);
        setValue('customerHeaders', obj.configurations?.customerHeaders);
        setValue('isReadOnly', obj?.isReadOnly);
        setValue('description', obj?.configurations?.description);
        setValue('accessKey', obj?.configurations?.accessKey);
        setValue('secretKey', obj?.configurations?.secretKey);
        setValue('region', obj?.configurations?.region);
        setValue('timeout', obj?.configurations?.timeout);
        const useIamRole =
            isNullOrEmpty(obj?.configurations?.accessKey) && isNullOrEmpty(obj?.configurations?.secretKey);
        setValue('useIamRole', useIamRole);
        const originalProvider = providers?.find(x => x.value === obj.provider);
        if (originalProvider) {
            const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
            if (originalModel) {
                setValue('modelNameOption', { label: originalModel.value, value: originalModel.value });
            } else {
                setValue('modelNameOption', { label: obj.modelName, value: obj.modelName });
            }
        }
        setIsEdit(true);
        setOpen(true);
    };

    const handleEditSLM = (obj: IModel) => {
        setValueSlm('id', obj.id);
        setValueSlm('name', obj.name);
        setValueSlm('provider', obj.provider);
        setValueSlm('modelName', obj.modelName);
        setValueSlm(
            'configurations.temperature',
            Number.isNaN(Number(obj.configurations?.temperature)) ? null : (obj.configurations?.temperature ?? null)
        );
        setValueSlm('configurations.baseUrl', obj?.configurations?.baseUrl);
        setValueSlm('configurations.apiAuthorization', obj.configurations?.apiAuthorization ?? '');
        setValueSlm('configurations.providerConfig', obj.configurations?.providerConfig);
        setValueSlm('configurations.customRuntime', !!obj.configurations?.customRuntime);
        setValueSlm('configurations.description', obj.configurations?.description ?? '');
        setValueSlm('isReadOnly', obj?.isReadOnly);
        setValueSlm('configurations.accessKey', obj.configurations?.accessKey);
        setValueSlm('configurations.secretKey', obj.configurations?.secretKey);
        setValueSlm('configurations.region', obj.configurations?.region);
        setValueSlm(
            'configurations.tokenLimit',
            Number.isNaN(Number(obj.configurations?.tokenLimit)) ? null : (obj.configurations?.tokenLimit ?? null)
        );
        const originalProvider = slmProviders?.find(x => x.value === obj.provider);
        if (originalProvider) {
            const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
            if (originalModel) {
                setValueSlm('modelNameOption', { label: originalModel.value, value: originalModel.value });
            } else {
                setValueSlm('modelNameOption', { label: obj.modelName, value: obj.modelName });
            }
        }
        setIsEdit(true);
        setOpenSlm(true);
    };

    interface IStsProvider {
        value: string;
        models?: { value: string }[];
        voices?: { name: string }[];
        languages?: { name: string; code: string }[];
    }

    const populateStsDropdowns = (obj: IModel, provider: IStsProvider) => {
        const originalModel = provider.models?.find((x: { value: string }) => x.value === obj.modelName);
        if (originalModel) {
            setValueSts('modelNameOption', { label: originalModel.value, value: originalModel.value });
        } else {
            setValueSts('modelNameOption', { label: obj.modelName, value: obj.modelName });
        }

        if (obj.configurations?.voice) {
            const originalVoice = provider.voices?.find((x: { name: string }) => x.name === obj.configurations?.voice);
            if (originalVoice) {
                setValueSts('voiceOption', { label: originalVoice.name, value: originalVoice.name });
            } else {
                setValueSts('voiceOption', {
                    label: obj.configurations.voice,
                    value: obj.configurations.voice,
                });
            }
        }

        if (obj.configurations?.language) {
            const originalLanguage = provider.languages?.find(
                (x: { name: string }) => x.name === obj.configurations?.language
            );
            if (originalLanguage) {
                setValueSts('languageOption', {
                    label: originalLanguage.name,
                    value: originalLanguage.code,
                });
            } else {
                setValueSts('languageOption', {
                    label: obj.configurations.language,
                    value: obj.configurations.language,
                });
            }
        }
    };

    const handleEditSTS = (obj: IModel) => {
        setValueSts('id', obj.id);
        setValueSts('name', obj.name);
        setValueSts('provider', obj.provider);
        setValueSts('modelName', obj.modelName);
        setValueSts('description', obj?.description ?? '');
        setValueSts('secretKey', obj.configurations?.secretKey ?? '');
        setValueSts('voice', obj.configurations?.voice ?? '');
        setValueSts('tone', obj.configurations?.tone ?? '');
        setValueSts(
            'temperature',
            Number.isNaN(Number(obj?.configurations?.temperature)) ? null : (obj?.configurations?.temperature ?? null)
        );
        setValueSts('language', obj.configurations?.language ?? '');
        setValueSts('isReadOnly', obj?.isReadOnly ?? false);
        setValueSts('region', obj.configurations?.region ?? '');
        setValueSts('authType', obj.configurations?.authType ?? '');
        setValueSts('awsAccessKey', obj.configurations?.accessKey ?? '');
        setValueSts('awsSecretKey', obj.configurations?.secretKey ?? '');

        const originalProvider = stsProviders?.find((x: { value: string }) => x.value === obj.provider);
        if (originalProvider) {
            populateStsDropdowns(obj, originalProvider);
        }
        setIsEdit(true);
        setOpenSts(true);
    };

    const onEdit = (id: string) => {
        if (currentIntelligenceSource === IntelligenceSourceType.LLM) {
            const obj = allModels.find(x => x.id === id);
            if (obj) handleEditLLM(obj);
        } else if (currentIntelligenceSource === IntelligenceSourceType.SLM) {
            const obj = allSLMModels.find(x => x.id === id);
            if (obj) handleEditSLM(obj);
        } else if (currentIntelligenceSource === IntelligenceSourceType.STS) {
            const obj = allSTSModels.find(x => x.id === id);
            if (obj) handleEditSTS(obj);
        }
    };

    const generateDescription = (description: string) => {
        if (description) {
            return `${description.slice(0, 110)}${description?.length > 110 ? '...' : ''}`;
        }
        return '';
    };

    const tabDefaultValue = useMemo(() => {
        const models = languageModels;

        if (!models || models.length === 0) {
            return '001';
        }

        if (selectedModelId) {
            const selectedModel = models.find(m => m.id === selectedModelId);
            if (selectedModel) {
                return selectedModel.configurations?.providerConfig?.id ?? selectedModel.provider;
            }
        }

        return models[0]?.configurations?.providerConfig?.id ?? models[0]?.provider ?? '001';
    }, [selectedModelId, languageModels]);

    const intelligenceSourceOptions = useMemo(
        () => [
            {
                label: IntelligenceSourceType.LLM,
                value: IntelligenceSourceType.LLM,
                disabled:
                    disabledSourceTypes.includes(IntelligenceSourceType.LLM) ||
                    !visibleSourceTypes.includes(IntelligenceSourceType.LLM),
            },
            {
                label: IntelligenceSourceType.SLM,
                value: IntelligenceSourceType.SLM,
                disabled:
                    disabledSourceTypes.includes(IntelligenceSourceType.SLM) ||
                    !visibleSourceTypes.includes(IntelligenceSourceType.SLM),
            },
            {
                label: IntelligenceSourceType.STS,
                value: IntelligenceSourceType.STS,
                disabled:
                    disabledSourceTypes.includes(IntelligenceSourceType.STS) ||
                    !visibleSourceTypes.includes(IntelligenceSourceType.STS),
            },
        ],
        [disabledSourceTypes, visibleSourceTypes]
    );

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen || isOpenSlm || isOpenSts) {
            setOpen(false);
            setOpenSlm(false);
            setOpenSts(false);
        } else if (cancel) {
            onOpenChange(false);
            setSelectedModelByProvider(undefined);
        } else {
            onOpenChange(open);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onModalClose}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {(isOpen || isOpenSlm || isOpenSts) && <Unplug />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                {(() => {
                                    if (!(isOpen || isOpenSlm || isOpenSts)) return 'Intelligence Source';
                                    const action = isEdit ? 'Edit' : 'New';
                                    const sourceLabel =
                                        {
                                            [IntelligenceSourceType.LLM]: 'LLM',
                                            [IntelligenceSourceType.SLM]: 'SLM',
                                            [IntelligenceSourceType.STS]: 'STS',
                                        }[currentIntelligenceSource] ?? '';
                                    return `${action} ${sourceLabel} Connection`;
                                })()}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                        {allModels === undefined && allSLMModels === undefined && allSTSModels === undefined ? (
                            <div>Loading</div>
                        ) : (
                            <>
                                {!isOpen && !isOpenSlm && !isOpenSts ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <RadioChips
                                                value={currentIntelligenceSource}
                                                onValueChange={handleIntelligenceSourceChange}
                                                options={intelligenceSourceOptions}
                                            />
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    if (currentIntelligenceSource === IntelligenceSourceType.STS) {
                                                        setIsEdit(false);
                                                        setOpenSts(true);
                                                    } else if (
                                                        currentIntelligenceSource === IntelligenceSourceType.LLM
                                                    ) {
                                                        setIsEdit(false);
                                                        setOpen(true);
                                                    } else {
                                                        setIsEdit(false);
                                                        setOpenSlm(true);
                                                    }
                                                }}
                                            >
                                                {(() => {
                                                    if (currentIntelligenceSource === IntelligenceSourceType.STS)
                                                        return 'New STS';
                                                    if (currentIntelligenceSource === IntelligenceSourceType.LLM)
                                                        return 'New LLM';
                                                    return 'New SLM';
                                                })()}
                                            </Button>
                                        </div>
                                        {llmModelsLoading || slmModelsLoading || stsModelsLoading ? (
                                            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-[calc(100%-32px)]">
                                                <LoaderCircle
                                                    className="animate-spin"
                                                    size={25}
                                                    width={25}
                                                    height={25}
                                                    absoluteStrokeWidth={undefined}
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                    Please wait! loading the data for you...
                                                </p>
                                            </div>
                                        ) : (
                                            <Tabs
                                                key={`${tabDefaultValue}-${currentIntelligenceSource}`}
                                                defaultValue={tabDefaultValue}
                                                className="w-[550px] h-full"
                                            >
                                                <DraggableTabsList className="dark:bg-gray-700 p-[5px] rounded-[6px] w-full justify-start gap-x-1">
                                                    {transformModels(languageModels)?.map(provider => (
                                                        <TabsTrigger
                                                            key={provider.id}
                                                            className="px-3 py-[6px] rounded-sm text-sm font-medium"
                                                            value={provider.id}
                                                        >
                                                            {provider.providerName}
                                                        </TabsTrigger>
                                                    ))}
                                                </DraggableTabsList>

                                                {transformModels(languageModels)?.length > 0 ? (
                                                    transformModels(languageModels)?.map(provider => (
                                                        <TabsContent
                                                            key={provider.id}
                                                            value={provider.id}
                                                            className="mt-0"
                                                        >
                                                            <div className="overflow-y-auto flex flex-col gap-y-2 mt-4 h-[263px]">
                                                                {getSortedModels(provider).map(model => (
                                                                    <SelectableRadioItem
                                                                        key={model.modelId}
                                                                        id={model.modelId}
                                                                        label={model.modelName}
                                                                        title={currentIntelligenceSource}
                                                                        description={generateDescription(
                                                                            model.modelDescription
                                                                        )}
                                                                        isChecked={model.modelId === selectedModelId}
                                                                        imagePath={provider.providerLogoPath}
                                                                        imageType="svg"
                                                                        imageClassname="h-[56px] w-[56px]"
                                                                        handleClick={() =>
                                                                            handleSelectModel(provider, model)
                                                                        }
                                                                        onEdit={onEdit}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </TabsContent>
                                                    ))
                                                ) : (
                                                    <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-[calc(100%-32px)]">
                                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                            No {currentIntelligenceSource} Model has been
                                                            <br /> configured
                                                        </p>
                                                    </div>
                                                )}
                                            </Tabs>
                                        )}
                                    </>
                                ) : (
                                    <div className="overflow-y-auto flex flex-col gap-y-2 mt-4 h-[335px]">
                                        {(() => {
                                            if (currentIntelligenceSource === IntelligenceSourceType.LLM) {
                                                return (
                                                    <LlmFormBody
                                                        isOpen={isOpen}
                                                        isEdit={isEdit}
                                                        isValid={isValid}
                                                        providers={providers}
                                                        errors={errors}
                                                        secrets={secrets}
                                                        isSaving={isSaving}
                                                        hasTestConnection={false}
                                                        loadingSecrets={loadingSecrets}
                                                        control={control}
                                                        setOpen={setOpen}
                                                        register={register}
                                                        watch={watch}
                                                        setValue={setValue}
                                                        handleSubmit={handleSubmit}
                                                        onHandleSubmit={onHandleSubmit}
                                                        refetch={refetch}
                                                    />
                                                );
                                            }
                                            if (currentIntelligenceSource === IntelligenceSourceType.SLM) {
                                                return (
                                                    <SlmFormBody
                                                        isOpen={isOpenSlm}
                                                        isEdit={isEdit}
                                                        isValid={isValidSlm}
                                                        providers={slmProviders}
                                                        errors={errorsSlm}
                                                        secrets={secretsSlm}
                                                        isSaving={isSavingSlm}
                                                        hasTestConnection={false}
                                                        loadingSecrets={loadingSecretsSlm}
                                                        control={controlSlm}
                                                        setOpen={setOpenSlm}
                                                        register={registerSlm}
                                                        watch={watchSlm}
                                                        setValue={setValueSlm}
                                                        handleSubmit={handleSubmitSlm}
                                                        onHandleSubmit={onHandleSubmitSlm}
                                                        refetch={refetchSlm}
                                                    />
                                                );
                                            }
                                            if (currentIntelligenceSource === IntelligenceSourceType.STS) {
                                                return (
                                                    <StsFormBody
                                                        isOpen={isOpenSts}
                                                        isEdit={isEdit}
                                                        isValid={isValidSts}
                                                        providers={stsProviders}
                                                        errors={errorsSts}
                                                        secrets={secretsSts}
                                                        isSaving={isSavingSts}
                                                        hasTestConnection={false}
                                                        loadingSecrets={loadingSecretsSts}
                                                        control={controlSts}
                                                        setOpen={setOpenSts}
                                                        register={registerSts}
                                                        watch={watchSts}
                                                        setValue={setValueSts}
                                                        handleSubmit={handleSubmitSts}
                                                        onHandleSubmit={onHandleSubmitSts}
                                                        refetch={refetchSts}
                                                    />
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                        Cancel
                    </Button>
                    {(() => {
                        if (isOpen) {
                            return (
                                <Button
                                    variant="primary"
                                    disabled={!isValid || isSaving}
                                    onClick={handleSubmit(onHandleSubmit)}
                                >
                                    {isEdit ? 'Update' : 'Create'}
                                </Button>
                            );
                        } else if (isOpenSlm) {
                            return (
                                <Button
                                    variant="primary"
                                    disabled={!isValidSlm || isSavingSlm}
                                    onClick={handleSubmitSlm(onHandleSubmitSlm)}
                                >
                                    {isEdit ? 'Update' : 'Create'}
                                </Button>
                            );
                        } else if (isOpenSts) {
                            return (
                                <Button
                                    variant="primary"
                                    disabled={!isValidSts || isSavingSts}
                                    onClick={handleSubmitSts(onHandleSubmitSts)}
                                >
                                    {isEdit ? 'Update' : 'Create'}
                                </Button>
                            );
                        } else {
                            return (
                                <Button
                                    disabled={selectedModelByProvider === undefined}
                                    variant="primary"
                                    onClick={handleConfirm}
                                >
                                    Add language model
                                </Button>
                            );
                        }
                    })()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
