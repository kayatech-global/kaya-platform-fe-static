import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { IWorkFlowAvatarConfiguration, IWorkFlowAvatarConfigurationResponse, IWorkspace } from '@/models';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { $fetch, FetchError, logger } from '@/utils';
import { OptionModel } from '@/components';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';
import config from '@/config/environment-variables';
import { useDaily, useParticipantIds } from '@daily-co/daily-react';
import { GenerateMethod } from '@/hooks/use-workflow-execution';
import { AVATAR_PROFILE_ID } from '@/constants';
import { useVaultQuery } from './use-common';
import { useTavusReplicas } from './use-tavus-replicas';

type avatarCreateRequest = {
    profile_ids: string[];
    config: IWorkFlowAvatarConfiguration;
};
interface UseAvatarProps {
    onClose: () => void;
}
export const useAvatarConfiguration = (props?: UseAvatarProps) => {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors, isValid },
        trigger,
        setValue,
        control,
        watch,
    } = useForm<IWorkFlowAvatarConfiguration>({ mode: 'all' });
    const [loading, setLoading] = useState(false);
    const [isFormLoading, setFormLoading] = useState(false);
    const params = useParams();
    const { token } = useAuth();
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const [allAvatarConfiguration, setAllAvatarConfiguration] = useState<IWorkFlowAvatarConfigurationResponse[]>([]);
    const [avatarCreateError, setAvatarCreateError] = useState<string>('');
    const avatarClient = useDaily();
    const [avatarSessionId, setAvatarSessionId] = useState<string>('');
    const [isAvatarConnecting, setIsAvatarConnecting] = useState(false);
    const [avatarConnectionError, setAvatarConnectionError] = useState<string | null>(null);
    const [isAvatarConnected, setIsAvatarConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const usePartIds = useParticipantIds({
        filter: participant => participant.user_id === AVATAR_PROFILE_ID,
    });

    // Watch the avatar API key to fetch replicas when it changes
    const avatarApiKey = watch('avatar_configs.api_key');

    // Fetch Tavus replicas based on selected API key
    // TODO: Remove useMockData: true when ready to use real API
    const {
        replicas: tavusReplicas,
        isLoading: isLoadingReplicas,
        isError: isReplicasError,
        refetch: refetchReplicas,
    } = useTavusReplicas({
        apiKeyName: avatarApiKey,
        enabled: true,
        useMockData: true, // Enable mock data for testing/demo
    });

    const createAvatar = async (
        avatarConfiguration: IWorkFlowAvatarConfiguration,
        workspaceId: string | number,
        workflowId: string | number
    ) => {
        let id = crypto.randomUUID();
        if (allAvatarConfiguration.length > 0) {
            id = allAvatarConfiguration[0].id;
        }
        const body: avatarCreateRequest = {
            profile_ids: [id],
            config: avatarConfiguration,
        };
        const response = await $fetch<IWorkspace>(`/workspaces/${workspaceId}/workflows/${workflowId}/video-profile`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-workspace-id': workspaceId.toString(),
            },
        });
        return response.data;
    };

    const updateAvatar = async (data: IWorkFlowAvatarConfiguration, workspaceId: string | number) => {
        await $fetch(`/workspaces/${workspaceId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'x-workspace-id': workspaceId.toString(),
            },
        });
    };
    const getAvatarDetails = async (workspaceId: string | number, workflowId: string | number) => {
        // const response = await $fetch<IWorkFlowAvatarConfigurationResponse[]>(
        //     `/workspaces/${workspaceId}/workflows/${workflowId}/video-profile`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'x-workspace-id': workspaceId.toString(),
        //         },
        //     }
        // );
        // return response.data;
        return [] as IWorkFlowAvatarConfigurationResponse[];
    };

    const onEdit = () => {
        if (allAvatarConfiguration.length > 0) {
            const obj = allAvatarConfiguration[0];
            setValue('avatar_configs', obj.config.avatar_configs);
            setValue('stt_configs', obj.config.stt_configs);
            setValue('tts_configs', obj.config.tts_configs);
            setValue('idle_timeout_secs', obj.config.idle_timeout_secs);
            setValue('vad_stop_secs', obj.config.vad_stop_secs);
            setValue('enable_fillers', obj.config.enable_fillers ?? true);
            setFormLoading(false);
        } else {
            // New form - set default values
            // Note: secret_access_key and region should be undefined when not using AWS providers
            // Default models: deepgram_flux -> nova-3, elevenlabs -> eleven_flash_v2_5
            reset({
                avatar_configs: {
                    provider: 'tavus',
                    replica_id: '',
                    api_key: '',
                },
                stt_configs: {
                    provider: 'deepgram_flux',
                    api_key: '',
                    model: 'nova-3',
                },
                tts_configs: {
                    provider: 'elevenlabs',
                    api_key: '',
                    voice_id: 'cgSgspJ2msm6clMCkdW9',
                    model: 'eleven_multilingual_v2',
                },
                idle_timeout_secs: 90,
                vad_stop_secs: 0.8,
                enable_fillers: true,
            });
            setFormLoading(false);
        }
    };

    const { isFetching } = useQuery(
        'avatar',
        () => getAvatarDetails(params.wid as string, params.workflow_id as string),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setAllAvatarConfiguration(data);
            },
            onError: () => {
                setAllAvatarConfiguration([]);
            },
        }
    );

    const handleAvatarConnect = async (currentGenerateMethod: GenerateMethod, apiKey: string | undefined) => {
        setIsAvatarConnecting(true);
        setAvatarConnectionError(null);

        if (!avatarClient) {
            setAvatarConnectionError('Video client not initialized. Please check your configuration.');
            setIsAvatarConnecting(false);
            return;
        }

        if (!apiKey) {
            setAvatarConnectionError('API key is required. Please configure your settings.');
            setIsAvatarConnecting(false);
            return;
        }

        const profileId = allAvatarConfiguration[0].id;

        try {
            const avatarConfig = {
                session_id: crypto.randomUUID(),
                profile_id: profileId,
                variables: {},
                workflow_id: params.workflow_id as string,
                workflow_api_key: apiKey,
                auth_type: currentGenerateMethod === GenerateMethod.BY_SSO ? 'SSO' : 'API_KEY',
            };
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (currentGenerateMethod === GenerateMethod.BY_SSO) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            } else {
                // Default to API_KEY
                headers['x-api-key'] = apiKey;
            }
            const response = await fetch(`${config.CHAT_BOT_URL}/workflows/video-conversation`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(avatarConfig),
            });

            if (!response.ok) {
                setAvatarConnectionError(`Server responded with status ${response.status}`);
                setIsAvatarConnecting(false);
                return;
            }

            const data = await response.json();

            if (!data.room_url) {
                setAvatarConnectionError('No room URL returned from server');
                setIsAvatarConnecting(false);
                return;
            }
            //Disable user camera
            avatarClient
                ?.join({ url: data.room_url, startVideoOff: true })
                .then(() => {
                    setIsAvatarConnecting(false);
                    setIsAvatarConnected(true);
                    setAvatarConnectionError(null);
                })
                .catch(e => {
                    setIsAvatarConnected(false);
                    setIsAvatarConnecting(false);
                    setAvatarConnectionError(e.errorMsg);
                });
        } catch (error) {
            setIsAvatarConnecting(false);
            const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
            setAvatarConnectionError(errorMessage);
        }
    };
    useEffect(() => {
        if (usePartIds.length > 0) {
            setAvatarSessionId(usePartIds[0]);
        }
    }, [usePartIds]);

    const handleAvatarDisconnect = async () => {
        if (avatarClient && isAvatarConnected && !avatarClient.isDestroyed()) {
            try {
                await avatarClient.destroy();
                setIsAvatarConnected(false);
                setIsAvatarConnecting(false);
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        }
    };

    const handleUserMicMute = () => {
        avatarClient?.setLocalAudio(isMuted);
        setIsMuted(!isMuted);
    };

    const { isLoading, mutate: mutateWorkspace } = useMutation(
        (data: IWorkFlowAvatarConfiguration) => createAvatar(data, params.wid as string, params.workflow_id as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('avatar');
                reset();
                setLoading(false);
                props?.onClose();
                toast.success('Video configuration saved successfully');
            },
            onError: (error: FetchError) => {
                const errorMessage =
                    error?.status === 400
                        ? error?.message
                        : "Something went wrong! We couldn't save your video configuration";
                setAvatarCreateError(errorMessage);
                // 'Commented' might be reused if we need to trigger a toast notification.
                // toast.error(errorMessage, { position: 'top-center', duration: 7000, closeButton: true });
                logger.error('Error creating video configuration:', error?.message);
            },
        }
    );

    const { isLoading: isUpdating } = useMutation(
        (data: IWorkFlowAvatarConfiguration) => updateAvatar(data, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('avatar');
                reset();
                setLoading(false);
                props?.onClose();
                toast.success('Video configuration updated successfully');
            },
            onError: (error: FetchError) => {
                const errorMessage =
                    error?.status === 400
                        ? error?.message
                        : "Something went wrong! We couldn't update your video configuration";
                setAvatarCreateError(errorMessage);
                // 'Commented' might be reused if we need to trigger a toast notification.
                // toast.error(errorMessage, { position: 'top-center', duration: 7000, closeButton: true });
                logger.error('Error updating video configuration:', error?.message);
            },
        }
    );

    const onHandleSubmit = (data: IWorkFlowAvatarConfiguration) => {
        try {
            const body: IWorkFlowAvatarConfiguration = {
                avatar_configs: data.avatar_configs,
                stt_configs: data.stt_configs,
                tts_configs: data.tts_configs,
                idle_timeout_secs: data.idle_timeout_secs,
                vad_stop_secs: data.vad_stop_secs,
                enable_fillers: data.enable_fillers,
            };
            mutateWorkspace(body);
            props?.onClose();
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your video configuration");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const { refetch, isLoading: loadingSecrets } = useVaultQuery({
        onSuccess: data => {
            const mapData = data?.map(x => ({
                name: x.keyName as string,
                value: x.keyName as string,
            }));
            setSecrets([...mapData]);
        },
        onError: () => {
            setSecrets([]);
        },
    });

    return {
        isLoading: isLoading || isUpdating,
        isFormLoading,
        loading,
        secrets,
        isValid,
        errors,
        control,
        loadingSecrets,
        avatarCreateError,
        allAvatarConfiguration,
        isAvatarConnecting,
        isAvatarConnected,
        avatarConnectionError,
        isFetching,
        avatarSessionId,
        avatarClient,
        isMuted,
        handleUserMicMute,
        setIsAvatarConnecting,
        handleAvatarConnect,
        handleAvatarDisconnect,
        refetch,
        register,
        getValues,
        setValue,
        trigger,
        watch,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        // Tavus replicas
        tavusReplicas,
        isLoadingReplicas,
        isReplicasError,
        refetchReplicas,
    };
};
