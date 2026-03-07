import { OptionModel } from '@/components';
import { useAuth } from '@/context';
import { useApp } from '@/context/app-context';
import { IntelligenceSourceType, PlatformConfigurationType } from '@/enums';
import {
    IPlatformSettingResponse,
    IIntelligenceSourceForm,
    IPlatformSettingData,
    ILLMForm,
    ISLMForm,
    ISharedItem,
} from '@/models';
import { $fetch, FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { promptService } from '@/services';
import { useLLMQuery, useSLMQuery } from './use-common';

const fetchPlatformConfig = async (workspaceId: number | string) => {
    // const response = await $fetch<IPlatformSettingResponse[]>(`/workspaces/${workspaceId}/configurations`, {
    //     method: 'GET',
    //     headers: {
    //         'x-workspace-id': workspaceId.toString(),
    //     },
    // });
    // return response.data;
    return [] as IPlatformSettingResponse[];
};

const postConfiguration = async (body: IPlatformSettingResponse, workspaceId: number | string) => {
    const response = await $fetch<IPlatformSettingResponse>(`/workspaces/${workspaceId}/configurations`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'x-workspace-id': workspaceId.toString() },
    });
    return response.data;
};

export const useIntellisenseData = (workspaceId: string, token: string | null) => {
    return useQuery(['intellisense-data', workspaceId], () => promptService.intellisense(workspaceId), {
        enabled: !!token, // Only fetch if we have a token
        refetchOnWindowFocus: false,
        select: data => ({
            api: data?.tools?.api?.shared?.filter((tool: ISharedItem) => tool?.name) ?? [],
            mcp: data?.tools?.mcp?.shared?.filter((tool: ISharedItem) => tool?.selected_tools?.length != 0) ?? [],
            rag: data?.tools?.rag?.shared?.filter((tool: ISharedItem) => tool?.name) ?? [],
            graphRag: data?.tools?.graphRag?.shared?.filter((tool: ISharedItem) => tool?.name) ?? [],
            variables: data?.variables?.shared?.filter((variable: ISharedItem) => variable?.name) ?? [],
            agents: data?.agents?.shared?.filter((agent: ISharedItem) => agent?.name) ?? [],
        }),
    });
};

export const useIntelligenceSource = ({
    isOpen,
    onChange,
}: {
    isOpen: boolean;
    onChange?: (value?: IPlatformSettingData) => void;
}) => {
    const params = useParams();
    const { token } = useAuth();
    const { intelligentSource, setIntelligentSource } = useApp();
    const queryClient = useQueryClient();
    const [openLlmCreationModal, setOpenLlmCreationModal] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
    } = useForm<IIntelligenceSourceForm>({ mode: 'all', defaultValues: { type: IntelligenceSourceType.LLM } });

    useEffect(() => {
        if (isOpen) {
            setOpenLlmCreationModal(false);
        }
    }, [isOpen]);

    const { data: platformConfig, isFetching } = useQuery(
        'intelligent-source',
        () => fetchPlatformConfig(params.wid as string),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            select: data => {
                const result = data.find(
                    (config: IPlatformSettingResponse) =>
                        config.key === PlatformConfigurationType.PROMPT_ENHANCEMENT_INTELLIGENT_SOURCE
                );
                if (result?.value?.startsWith('{') && result.value.endsWith('}')) {
                    return JSON.parse(result.value) as IPlatformSettingData;
                }
                return undefined;
            },
        }
    );

    const { isFetching: llmFetching, data: llms } = useLLMQuery({
        select: data =>
            data.map(
                (llm: ILLMForm) =>
                    ({
                        name: llm.name,
                        value: llm.id,
                    }) as OptionModel
            ),
    });

    const { isFetching: slmFetching, data: slms } = useSLMQuery({
        select: data =>
            data.map(
                (llm: ISLMForm) =>
                    ({
                        name: llm.name,
                        value: llm.id,
                    }) as OptionModel
            ),
    });

    const { isLoading: isSaving, mutate } = useMutation(
        (data: IPlatformSettingResponse) => postConfiguration(data, params.wid as string),
        {
            onSuccess: data => {
                queryClient.invalidateQueries('intelligent-source');
                queryClient.invalidateQueries('llms');
                queryClient.invalidateQueries('slms');
                toast.success('Workspace Intelligence Source saved successfully');
                if (data?.value?.startsWith('{') && data.value.endsWith('}')) {
                    onChange?.(JSON.parse(data.value) as IPlatformSettingData);
                }
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error configure settings:', error?.message);
            },
        }
    );

    useEffect(() => {
        if (platformConfig) {
            setValue('id', platformConfig.id);
            setValue('isSLM', platformConfig.isSLM);
            // KAPC-502 Compliance: For now Ensure SLMs are *not* set as the default for Prompt Enhancements.
            // setValue('type', platformConfig.isSLM ? IntelligenceSourceType.SLM : IntelligenceSourceType.LLM);
            setValue('type', IntelligenceSourceType.LLM);
        } else {
            setValue('id', '');
            setValue('isSLM', false);
            // KAPC-502 Compliance: For now Ensure SLMs are *not* set as the default for Prompt Enhancements.
            // setValue('type', '');
            setValue('type', IntelligenceSourceType.LLM);
        }
        setIntelligentSource(platformConfig);
    }, [platformConfig]);

    useEffect(() => {
        if (llms && llms?.length > 0 && intelligentSource && !intelligentSource?.isSLM) {
            const isDeleted = !llms.some(x => x.value === intelligentSource.id);
            if (intelligentSource.isDeleted !== isDeleted) {
                setIntelligentSource(prev => (prev ? { ...prev, isDeleted } : prev));
            }
        } else if ((!llms || llms.length === 0) && intelligentSource && !intelligentSource?.isSLM) {
            if (intelligentSource.isDeleted !== true) {
                setIntelligentSource(prev => (prev ? { ...prev, isDeleted: true } : prev));
            }
        }
    }, [intelligentSource, llms]);

    const dropdownOptions = useMemo(() => {
        if (watch('type') === IntelligenceSourceType.LLM) {
            return llms;
        } else if (watch('type') === IntelligenceSourceType.SLM) {
            return slms;
        }
        return [];
    }, [watch('type'), llms, slms]);

    const onHandleSubmit = (data: IIntelligenceSourceForm) => {
        try {
            const value = { id: data.id, isSLM: data.type === IntelligenceSourceType.SLM } as IPlatformSettingData;
            mutate({
                key: PlatformConfigurationType.PROMPT_ENHANCEMENT_INTELLIGENT_SOURCE,
                value: JSON.stringify(value),
            });
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your settings");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onTypeChange = () => {
        setValue('id', '');
    };

    return {
        isFetching: isFetching || llmFetching || slmFetching,
        errors,
        isValid,
        dropdownOptions: dropdownOptions ?? [],
        isSaving,
        openLlmCreationModal,
        setOpenLlmCreationModal,
        register,
        watch,
        handleSubmit,
        onHandleSubmit,
        onTypeChange,
    };
};
