/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModel, LanguageProvider } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { IntelligenceSourceModel } from '@/components/organisms/workflow-editor-form/voice-agent-form';

export const transformModels = (allModels: IModel[] | undefined): LanguageProvider[] => {
    const providerMap = new Map<string, LanguageProvider>();

    allModels?.forEach(model => {
        const providerId = model.configurations?.providerConfig?.id ?? model.provider;
        const providerName = model.configurations?.providerConfig?.value ?? model.provider;
        const providerLogoPath = model.configurations?.providerConfig?.logo?.['48'] ?? '';

        if (!providerMap.has(providerId)) {
            providerMap.set(providerId, {
                id: providerId,
                providerName,
                providerLogoPath,
                models: [],
            });
        }

        // Use a stable ID based on the model's unique attributes
        const stableModelId = `${model.modelName}-${providerId}`;

        providerMap.get(providerId)!.models.push({
            id: stableModelId,
            modelId: model.id,
            modelName: model.modelName,
            modelDescription: model.configurations?.description ?? model.description,
        });
    });
    return Array.from(providerMap.values());
};

const getVoiceModalData = (voiceModal: IntelligenceSourceModel, allSTSModels: IModel[] | undefined) => {
    const matchedSTSModal = allSTSModels?.find((x: any) => x.id === voiceModal.modelId);
    if (!matchedSTSModal) return undefined;

    return {
        id: matchedSTSModal.id,
        name: matchedSTSModal.name,
        description: matchedSTSModal.description,
        modelType: 'speech_to_speech',
        provider: matchedSTSModal.provider,
        modelName: matchedSTSModal.modelName,
        voice: matchedSTSModal.configurations.voice,
        language: matchedSTSModal.configurations.language,
        temperature: matchedSTSModal.configurations.temperature,
        region: matchedSTSModal.configurations.region,
        authType: matchedSTSModal.configurations.authType,
    };
};

const findProviderAndModel = (currentData: any, isSTS: boolean, modelsToSearch: IModel[] | undefined) => {
    if (!modelsToSearch) return undefined;

    const providers = transformModels(modelsToSearch);

    return providers
        .map(provider => {
            const model = provider.models.find(m => m.modelId === (isSTS ? currentData?.id : currentData?.modelId));
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
};

const checkTextModelDiscrepancy = (currentData: any, provider: any, model: any, isSlm: boolean) => {
    if (
        model &&
        (currentData?.provider !== provider?.providerName ||
            currentData?.modelName !== model?.modelName ||
            currentData?.modelDescription !== model?.modelDescription ||
            currentData?.modelId !== model.modelId ||
            currentData?.providerLogo !== provider?.providerLogoPath ||
            currentData?.modelUniqueId !== model?.id)
    ) {
        return {
            id: provider?.id,
            provider: provider?.providerName,
            modelName: model?.modelName,
            modelDescription: model?.modelDescription,
            modelId: model?.modelId,
            providerLogo: provider?.providerLogoPath,
            isSlm: isSlm,
        };
    }
    return false;
};

const checkVoiceModelDiscrepancy = (
    currentData: any,
    provider: any,
    model: any,
    allSTSModels: IModel[] | undefined
) => {
    const tempVoiceModal = {
        modelId: model?.modelId, // Only modelId is needed for getVoiceModalData's find
    } as IntelligenceSourceModel;

    const result = getVoiceModalData(tempVoiceModal, allSTSModels);

    if (
        result &&
        (currentData?.name !== result?.name ||
            currentData?.description !== result?.description ||
            currentData?.provider !== result?.provider ||
            currentData?.modelName !== result?.modelName ||
            currentData?.voice !== result?.voice ||
            currentData?.language !== result?.language ||
            currentData?.temperature !== result?.temperature ||
            currentData?.region !== result?.region ||
            currentData?.authType !== result?.authType)
    ) {
        return result;
    }
    return false;
};

export const validateLargeLanguageModel = (
    currentData: any,
    isSTS: boolean,
    allModels: IModel[] | undefined,
    allSLMModels: IModel[] | undefined,
    allSTSModels: IModel[] | undefined
) => {
    if (!currentData) return undefined;

    const isSlm = !!currentData?.isSlm;
    const modelsToSearch = (() => {
        if (isSTS) return allSTSModels;
        if (isSlm) return allSLMModels;
        return allModels;
    })();

    const provider = findProviderAndModel(currentData, isSTS, modelsToSearch);

    if (!provider) return undefined;

    const model = provider.models[0];

    if (isSTS) {
        return checkVoiceModelDiscrepancy(currentData, provider, model, allSTSModels);
    } else {
        return checkTextModelDiscrepancy(currentData, provider, model, isSlm);
    }
};
