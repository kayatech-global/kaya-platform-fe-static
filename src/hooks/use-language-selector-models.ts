import { useLlmConfiguration } from '@/hooks/use-llm-configuration';
import { useSlmConfiguration } from '@/hooks/use-slm-configuration';
import { IModel } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';

export function useLanguageSelectorModels() {
    const {
        llmConfigurationTableData,
        isFetching: llmModelsLoading,
        refetch: refetchLlms,
        providers: llmProviders,
    } = useLlmConfiguration();
    const {
        slmConfigurationTableData,
        isFetching: slmModelsLoading,
        refetch: refetchSlms,
        providers: slmProviders,
    } = useSlmConfiguration();

    // Map LLMs to IModel, filling missing fields with safe defaults
    const allModels: IModel[] = (llmConfigurationTableData ?? []).map(
        (
            llm: import('@/app/workspace/[wid]/intelligence-source-configs/llm-configurations/components/llm-configuration-table-container').LlmConfigurationData
        ) => {
            const providerMeta = llmProviders?.find(p => p.value === llm.provider);
            let logo: { '16': string; '32': string; '48': string } = { '16': '', '32': '', '48': '' };
            if (providerMeta?.logo && typeof providerMeta.logo === 'object') {
                const toLogoStr = (v: unknown) => (typeof v === 'string' ? v : ((v as { src?: string })?.src ?? ''));
                logo = {
                    '16': toLogoStr(providerMeta.logo['16']),
                    '32': toLogoStr(providerMeta.logo['32']),
                    '48': toLogoStr(providerMeta.logo['48']),
                };
            }
            const providerDescription = providerMeta?.description ?? '';
            return {
                id: llm.id ?? '',
                name: llm.connectionName ?? llm.modelName ?? '',
                modelName: llm.modelName ?? '',
                provider: llm.provider ?? '',
                description: llm.configurations?.description ?? providerDescription,
                voice: '',
                language: '',
                configurations: {
                    providerConfig: {
                        id: llm.provider ?? '',
                        logo,
                        value: llm.provider ?? '',
                        description: providerDescription ?? llm.configurations?.description ?? '',
                    },
                    temperature: llm.configurations?.temperature ?? 0,
                    voice: '',
                    tone: '',
                    language: '',
                    apiAuthorization: llm.configurations?.apiAuthorization ?? '',
                    customerHeaders: [],
                    baseUrl: llm.configurations?.baseUrl ?? '',
                    customRuntime: false,
                    description: llm.configurations?.description ?? providerDescription,
                    accessKey: llm.configurations?.accessKey ?? '',
                    secretKey: llm.configurations?.secretKey ?? '',
                    region: llm.configurations?.region ?? '',
                    tokenLimit: null,
                    maxTokens: llm.configurations?.maxTokens ?? null,
                },
                isReadOnly: llm.isReadOnly ?? false,
            };
        }
    );
    // (Removed duplicate allModels declaration and mapping block)

    // Map SLMs to IModel, filling missing fields with safe defaults
    const allSLMModels: IModel[] = (slmConfigurationTableData ?? []).map(
        (
            slm: import('@/app/workspace/[wid]/intelligence-source-configs/slm-configurations/components/slm-configuration-table-container').SlmConfigurationData
        ) => {
            const providerMeta = slmProviders?.find(p => p.value === slm.provider);
            let logo: { '16': string; '32': string; '48': string } = { '16': '', '32': '', '48': '' };
            if (providerMeta?.logo && typeof providerMeta.logo === 'object') {
                const toLogoStr = (v: unknown) => (typeof v === 'string' ? v : ((v as { src?: string })?.src ?? ''));
                logo = {
                    '16': toLogoStr(providerMeta.logo['16']),
                    '32': toLogoStr(providerMeta.logo['32']),
                    '48': toLogoStr(providerMeta.logo['48']),
                };
            }
            const providerDescription = providerMeta?.description ?? '';
            return {
                id: slm.id ?? '',
                name: slm.name ?? slm.modelName ?? '',
                modelName: slm.modelName ?? '',
                provider: slm.provider ?? '',
                description: slm.configurations?.description ?? providerDescription,
                voice: '',
                language: '',
                configurations: {
                    providerConfig: {
                        id: slm.provider ?? '',
                        logo,
                        value: slm.provider ?? '',
                        description: providerDescription || slm.configurations?.description || '',
                    },
                    temperature: slm.configurations?.temperature ?? 0,
                    voice: '',
                    tone: '',
                    language: '',
                    apiAuthorization: slm.configurations?.apiAuthorization ?? '',
                    customerHeaders: [],
                    baseUrl: slm.configurations?.baseUrl ?? '',
                    customRuntime: slm.configurations?.customRuntime ?? false,
                    description: slm.configurations?.description ?? providerDescription,
                    accessKey: slm.configurations?.accessKey ?? '',
                    secretKey: slm.configurations?.secretKey ?? '',
                    region: slm.configurations?.region ?? '',
                    tokenLimit: slm.configurations?.tokenLimit ?? null,
                    maxTokens: null,
                },
                isReadOnly: slm.isReadOnly ?? false,
            };
        }
    );
    return {
        allModels,
        allSLMModels,
        llmModelsLoading,
        slmModelsLoading,
        refetchLlms,
        refetchSlms,
    };
}
