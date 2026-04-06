import React, { useState, useEffect, useRef } from 'react';
import { Button, FormFieldGroup, Input, Label, OptionModel, Select, Spinner, VaultSelector } from '@/components';
import { Textarea } from '@/components/atoms/textarea';
import { DialogBody, DialogFooter } from '@/components/atoms/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/atoms/tooltip';
import { Switch } from '@/components/atoms/switch';
import { cn } from '@/lib/utils';
import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IWorkFlowAvatarConfiguration } from '@/models';
import { validatePositiveNumber } from '@/utils/validation';
import { TavusReplica } from '@/hooks/use-tavus-replicas';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface AvatarConfigurationProps {
    isLoading: boolean;
    isFormLoading: boolean;
    loading: boolean;
    secrets: OptionModel[];
    isValid: boolean;
    errors: FieldErrors<IWorkFlowAvatarConfiguration>;
    loadingSecrets: boolean;
    avatarCreateError: string | null;
    refetch: () => void;
    register: UseFormRegister<IWorkFlowAvatarConfiguration>;
    watch: UseFormWatch<IWorkFlowAvatarConfiguration>;
    control: Control<IWorkFlowAvatarConfiguration>;
    setValue: UseFormSetValue<IWorkFlowAvatarConfiguration>;
    handleSubmit: UseFormHandleSubmit<IWorkFlowAvatarConfiguration>;
    onHandleSubmit: (data: IWorkFlowAvatarConfiguration) => void;
    onEdit: () => void;
    // Tavus replicas props
    tavusReplicas: TavusReplica[];
    isLoadingReplicas: boolean;
    isReplicasError: boolean;
    refetchReplicas: () => void;
}

// Default models for each STT provider
const STT_DEFAULT_MODELS: Record<string, string> = {
    deepgram_flux: 'nova-3',
    elevenlabs: 'scribe_v1',
    gladia: 'solaria-1',
    groq_whisper: 'whisper-large-v3-turbo',
    openai_whisper: 'gpt-4o-transcribe',
};

// Default models for each TTS provider
const TTS_DEFAULT_MODELS: Record<string, string> = {
    cartesia: 'sonic-3',
    elevenlabs: 'eleven_multilingual_v2',
    openai: 'gpt-4o-mini-tts',
};

// Default voice IDs for each TTS provider
const TTS_DEFAULT_VOICES: Record<string, string> = {
    aws_polly: 'Joanna',
    cartesia: 'e8e5fffb-252c-436d-b842-8879b84445b6',
    deepgram: 'aura-asteria-en',
    elevenlabs: 'cgSgspJ2msm6clMCkdW9',
    google_cloud: 'en-US-Neural2-A',
    openai: 'alloy',
};

// LLM Models for Video Integrated
const LLM_MODELS = [
    { value: 'gpt-4o', name: 'GPT-4o' },
    { value: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { value: 'claude-3-opus', name: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    { value: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
];

export const AvatarConfigurationForm = (props: AvatarConfigurationProps) => {
    const {
        isLoading,
        isFormLoading,
        loading,
        secrets,
        isValid,
        errors,
        loadingSecrets,
        avatarCreateError,
        refetch,
        register,
        watch,
        control,
        setValue,
        handleSubmit,
        onHandleSubmit,
        tavusReplicas,
        isLoadingReplicas,
        isReplicasError,
        refetchReplicas,
    } = props;
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    const sttProvider = watch('stt_configs.provider');
    const ttsProvider = watch('tts_configs.provider');
    const videoIntegratedEnabled = watch('video_integrated.enabled');

    // Track previous provider values to detect actual changes (not initial load)
    const prevSttProvider = useRef(sttProvider);
    const prevTtsProvider = useRef(ttsProvider);

    // Reset STT fields when provider changes (but not on initial load)
    useEffect(() => {
        if (prevSttProvider.current && prevSttProvider.current !== sttProvider) {
            setValue('stt_configs.api_key', '');
            // Set default model for the selected provider
            setValue('stt_configs.model', STT_DEFAULT_MODELS[sttProvider] || '');
            // Set AWS-specific fields to undefined (not empty string) to avoid secret lookup errors
            setValue('stt_configs.secret_access_key', undefined);
            setValue('stt_configs.region', sttProvider === 'aws_transcribe' ? 'us-east-1' : undefined);
        }
        prevSttProvider.current = sttProvider;
    }, [sttProvider, setValue]);

    // Reset TTS fields when provider changes (but not on initial load)
    useEffect(() => {
        if (prevTtsProvider.current && prevTtsProvider.current !== ttsProvider) {
            setValue('tts_configs.api_key', '');
            // Set default model and voice for the selected provider
            setValue('tts_configs.model', TTS_DEFAULT_MODELS[ttsProvider] || '');
            setValue('tts_configs.voice_id', TTS_DEFAULT_VOICES[ttsProvider] || '');
            // Set AWS-specific fields to undefined (not empty string) to avoid secret lookup errors
            setValue('tts_configs.secret_access_key', undefined);
            setValue('tts_configs.region', ttsProvider === 'aws_polly' ? 'us-east-1' : undefined);
        }
        prevTtsProvider.current = ttsProvider;
    }, [ttsProvider, setValue]);

    return (
        <>
            {isFormLoading ? (
                <div className="my-20">
                    <div className="flex justify-center w-full h-fit">
                        <div className="z-50 flex items-center flex-col gap-y-2">
                            <Spinner />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <DialogBody className="pb-2 pt-3 max-h-[calc(90vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                        <div className={cn('flex gap-y-4 gap-x-4 flex-col')}>
                            <div className={cn('flex flex-col gap-y-4')}>
                                <FormFieldGroup
                                    title="Avatar Settings"
                                    description="Define Settings for Avatar"
                                    showSeparator={false}
                                >
                                    <div className="col-span-1 sm:col-span-2">
                                        <Select
                                            {...register('avatar_configs.provider')}
                                            placeholder="Select a provider"
                                            options={[{ value: 'tavus', name: 'Tavus' }]}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1.5 block">
                                            Avatar
                                        </Label>
                                        {isReplicasError ? (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                <span className="text-sm text-red-600 dark:text-red-400">
                                                    Failed to load avatars
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={refetchReplicas}
                                                    className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    Retry
                                                </button>
                                            </div>
                                        ) : (
                                            <Select
                                                {...register('avatar_configs.replica_id', {
                                                    required: { value: true, message: 'Please select an avatar' },
                                                })}
                                                placeholder={
                                                    isLoadingReplicas
                                                        ? 'Loading avatars...'
                                                        : tavusReplicas.length > 0
                                                          ? 'Select an avatar'
                                                          : 'No avatars available'
                                                }
                                                options={tavusReplicas.map((replica) => ({
                                                    name: replica.replica_name,
                                                    value: replica.replica_id,
                                                }))}
                                                disabled={isLoadingReplicas || tavusReplicas.length === 0}
                                                isDestructive={!!errors?.avatar_configs?.replica_id?.message}
                                                supportiveText={errors?.avatar_configs?.replica_id?.message}
                                            />
                                        )}
                                    </div>

                                    {/* Avatar Preview */}
                                    {watch('avatar_configs.replica_id') && !isReplicasError && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1.5 block">
                                                Avatar Preview
                                            </Label>
                                            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                {(() => {
                                                    const selectedReplica = tavusReplicas.find(
                                                        (r) => r.replica_id === watch('avatar_configs.replica_id')
                                                    );
                                                    if (selectedReplica?.thumbnail_video_url) {
                                                        return (
                                                            <video
                                                                key={selectedReplica.replica_id}
                                                                src={selectedReplica.thumbnail_video_url}
                                                                className="w-full h-full object-cover"
                                                                autoPlay
                                                                loop
                                                                muted
                                                                playsInline
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                                                            No preview available for {selectedReplica?.replica_name || 'this avatar'}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-span-1 sm:col-span-2">
                                        <VaultSelector
                                            {...register('avatar_configs.api_key', {
                                                required: { value: true, message: 'Please select vault key' },
                                            })}
                                            label="API Key"
                                            placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                            disabled={secrets.length === 0 /*|| (isEdit && isReadOnly)*/}
                                            options={secrets}
                                            currentValue={watch('avatar_configs.api_key')}
                                            isDestructive={!!errors?.avatar_configs?.api_key?.message}
                                            supportiveText={errors?.avatar_configs?.api_key?.message}
                                            // disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={refetch}
                                        />
                                    </div>
                                </FormFieldGroup>

                                {/* Video Integrated Toggle */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <Controller
                                        name="video_integrated.enabled"
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor="video-integrated" className="text-sm font-medium">
                                                        Enable Video Integrated
                                                    </Label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Tavus manages the full session pipeline including STT and TTS
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="video-integrated"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Video Integrated Settings - shown when toggle is ON */}
                                {videoIntegratedEnabled && (
                                    <FormFieldGroup title="Video Integrated Settings" showSeparator={false}>
                                        <div className="col-span-1 sm:col-span-2">
                                            <Select
                                                {...register('video_integrated.llm_model')}
                                                label="LLM Model"
                                                placeholder="Select an LLM model (optional)"
                                                options={LLM_MODELS}
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-2">
                                            <Textarea
                                                {...register('video_integrated.persona_context', {
                                                    required: {
                                                        value: videoIntegratedEnabled,
                                                        message: 'Persona Context is required when Video Integrated is enabled',
                                                    },
                                                })}
                                                label="Persona Context"
                                                placeholder="Define the persona and behavior for the avatar (e.g., 'You are a helpful customer service representative for Acme Corp...')"
                                                rows={4}
                                                isDestructive={!!errors?.video_integrated?.persona_context?.message}
                                                supportiveText={errors?.video_integrated?.persona_context?.message}
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-2">
                                            <Textarea
                                                {...register('video_integrated.conversation_context')}
                                                label="Conversation Context"
                                                placeholder="Provide background context for the conversation (optional)"
                                                rows={3}
                                                helperInfo="Background information the avatar can reference during the conversation"
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-2">
                                            <Textarea
                                                {...register('video_integrated.info_content')}
                                                label="Info Content"
                                                placeholder="Content to display when users click the info button during chat (optional)"
                                                rows={3}
                                                helperInfo="This content will be shown to end users via an info button in the chat interface"
                                            />
                                        </div>
                                    </FormFieldGroup>
                                )}

                                {/* STT/TTS/Advanced Settings - hidden when Video Integrated is ON */}
                                {!videoIntegratedEnabled && (
                                    <>
                                <FormFieldGroup title="Speech to Text Settings" showSeparator={false}>
                                    <div className="col-span-1 sm:col-span-2">
                                        <Select
                                            {...register('stt_configs.provider')}
                                            placeholder="Select a provider"
                                            options={[
                                                { value: 'aws_transcribe', name: 'AWS Transcribe' },
                                                { value: 'deepgram_flux', name: 'Deepgram Flux' },
                                                { value: 'elevenlabs', name: 'ElevenLabs' },
                                                { value: 'gladia', name: 'Gladia' },
                                                { value: 'groq_whisper', name: 'Groq Whisper' },
                                                { value: 'openai_whisper', name: 'OpenAI Whisper' },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <VaultSelector
                                            {...register('stt_configs.api_key', {
                                                required: { value: !videoIntegratedEnabled, message: 'Please select vault key' },
                                            })}
                                            label={sttProvider === 'aws_transcribe' ? 'AWS Access Key ID' : 'API Key'}
                                            placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                            disabled={secrets.length === 0}
                                            options={secrets}
                                            currentValue={watch('stt_configs.api_key')}
                                            isDestructive={!!errors?.stt_configs?.api_key?.message}
                                            supportiveText={errors?.stt_configs?.api_key?.message}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={refetch}
                                        />
                                    </div>
                                    {/* AWS Transcribe specific fields - grouped together */}
                                    {sttProvider === 'aws_transcribe' && (
                                        <>
                                            <div className="col-span-1 sm:col-span-2">
                                                <VaultSelector
                                                    {...register('stt_configs.secret_access_key', {
                                                        required: { value: !videoIntegratedEnabled && sttProvider === 'aws_transcribe', message: 'AWS Secret Access Key is required' },
                                                    })}
                                                    label="AWS Secret Access Key"
                                                    placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                                    disabled={secrets.length === 0}
                                                    options={secrets}
                                                    currentValue={watch('stt_configs.secret_access_key')}
                                                    isDestructive={!!errors?.stt_configs?.secret_access_key?.message}
                                                    supportiveText={errors?.stt_configs?.secret_access_key?.message}
                                                    loadingSecrets={loadingSecrets}
                                                    onRefetch={refetch}
                                                />
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <Input
                                                    {...register('stt_configs.region', {
                                                        required: { value: !videoIntegratedEnabled && sttProvider === 'aws_transcribe', message: 'AWS Region is required' },
                                                    })}
                                                    placeholder="e.g., us-east-1"
                                                    label="AWS Region"
                                                    defaultValue="us-east-1"
                                                    isDestructive={!!errors?.stt_configs?.region?.message}
                                                    supportiveText={errors?.stt_configs?.region?.message}
                                                />
                                            </div>
                                        </>
                                    )}
                                    {/* Model field - hidden for AWS Transcribe as it doesn't support model selection */}
                                    {sttProvider !== 'aws_transcribe' && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <Input
                                                {...register('stt_configs.model', {
                                                    required: { value: !videoIntegratedEnabled && sttProvider !== 'aws_transcribe', message: 'Model is required' },
                                                })}
                                                placeholder="Enter speech to text model name"
                                                label="Model"
                                                isDestructive={!!errors?.stt_configs?.model?.message}
                                                supportiveText={errors?.stt_configs?.model?.message}
                                            />
                                        </div>
                                    )}
                                </FormFieldGroup>
                                <FormFieldGroup title="Text to Speech Settings" showSeparator={false}>
                                    <div className="col-span-1 sm:col-span-2">
                                        <Select
                                            {...register('tts_configs.provider')}
                                            placeholder="Select a provider"
                                            options={[
                                                { value: 'aws_polly', name: 'AWS Polly' },
                                                { value: 'cartesia', name: 'Cartesia' },
                                                { value: 'deepgram', name: 'Deepgram' },
                                                { value: 'elevenlabs', name: 'ElevenLabs' },
                                                { value: 'google_cloud', name: 'Google Cloud TTS' },
                                                { value: 'openai', name: 'OpenAI TTS' },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <VaultSelector
                                            {...register('tts_configs.api_key', {
                                                required: { value: !videoIntegratedEnabled, message: 'Please select vault key' },
                                            })}
                                            label={ttsProvider === 'aws_polly' ? 'AWS Access Key ID' : 'API Key'}
                                            placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                            disabled={secrets.length === 0}
                                            options={secrets}
                                            currentValue={watch('tts_configs.api_key')}
                                            isDestructive={!!errors?.tts_configs?.api_key?.message}
                                            supportiveText={errors?.tts_configs?.api_key?.message}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={refetch}
                                        />
                                    </div>
                                    {/* AWS Polly specific fields - grouped together */}
                                    {ttsProvider === 'aws_polly' && (
                                        <>
                                            <div className="col-span-1 sm:col-span-2">
                                                <VaultSelector
                                                    {...register('tts_configs.secret_access_key', {
                                                        required: { value: !videoIntegratedEnabled && ttsProvider === 'aws_polly', message: 'AWS Secret Access Key is required' },
                                                    })}
                                                    label="AWS Secret Access Key"
                                                    placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                                    disabled={secrets.length === 0}
                                                    options={secrets}
                                                    currentValue={watch('tts_configs.secret_access_key')}
                                                    isDestructive={!!errors?.tts_configs?.secret_access_key?.message}
                                                    supportiveText={errors?.tts_configs?.secret_access_key?.message}
                                                    loadingSecrets={loadingSecrets}
                                                    onRefetch={refetch}
                                                />
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <Input
                                                    {...register('tts_configs.region', {
                                                        required: { value: !videoIntegratedEnabled && ttsProvider === 'aws_polly', message: 'AWS Region is required' },
                                                    })}
                                                    placeholder="e.g., us-east-1"
                                                    label="AWS Region"
                                                    defaultValue="us-east-1"
                                                    isDestructive={!!errors?.tts_configs?.region?.message}
                                                    supportiveText={errors?.tts_configs?.region?.message}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-1 sm:col-span-2">
                                        <Input
                                            {...register('tts_configs.voice_id', {
                                                required: { value: !videoIntegratedEnabled, message: 'Voice ID is required' },
                                            })}
                                            placeholder="Enter your Voice ID"
                                            label="Voice ID"
                                            isDestructive={!!errors?.tts_configs?.voice_id?.message}
                                            supportiveText={errors?.tts_configs?.voice_id?.message}
                                        />
                                    </div>
                                    {/* Model field - hidden for Deepgram and Google Cloud TTS as they don't support model selection */}
                                    {!['deepgram', 'google_cloud'].includes(ttsProvider) && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <Input
                                                {...register('tts_configs.model', {
                                                    required: { value: !videoIntegratedEnabled && !['deepgram', 'google_cloud'].includes(ttsProvider), message: 'Model is required' },
                                                })}
                                                placeholder="Enter text to speech model name"
                                                label="Model"
                                                isDestructive={!!errors?.tts_configs?.model?.message}
                                                supportiveText={errors?.tts_configs?.model?.message}
                                            />
                                        </div>
                                    )}
                                </FormFieldGroup>

                                <button
                                    hidden={showAdvancedOptions}
                                    className={'text-blue-500 hover:underline text-sm'}
                                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                >
                                    Show advanced settings
                                </button>
                                <div hidden={!showAdvancedOptions}>
                                    <FormFieldGroup title="Advanced Settings" showSeparator={false}>
                                        <div hidden={!showAdvancedOptions} className="col-span-1 sm:col-span-2">
                                            <Input
                                                {...register('idle_timeout_secs', {
                                                    validate: value => validatePositiveNumber(value),
                                                })}
                                                placeholder="Enter idle timeout in seconds"
                                                label="Idle Timeout (seconds)"
                                                min={1}
                                                type="number"
                                                isDestructive={!!errors?.idle_timeout_secs?.message}
                                                supportiveText={errors?.idle_timeout_secs?.message}
                                            />
                                        </div>

                                        <div hidden={!showAdvancedOptions} className="col-span-1 sm:col-span-2">
                                            <Input
                                                {...register('vad_stop_secs', {
                                                    validate: value => validatePositiveNumber(value),
                                                })}
                                                placeholder="Enter Vad Stop in seconds"
                                                label="Vad Stop (seconds)"
                                                min={0}
                                                type="number"
                                                isDestructive={!!errors?.vad_stop_secs?.message}
                                                supportiveText={errors?.vad_stop_secs?.message}
                                            />
                                        </div>

                                        <div hidden={!showAdvancedOptions} className="col-span-1 sm:col-span-2">
                                            <Controller
                                                name="enable_fillers"
                                                control={control}
                                                defaultValue={true}
                                                render={({ field }) => (
                                                    <div className="flex items-center gap-x-3">
                                                        <Switch
                                                            id="enable-fillers"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor="enable-fillers" className="text-sm font-medium">
                                                            Enable Fillers
                                                        </Label>
                                                    </div>
                                                )}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Enable conversational fillers for more natural responses
                                            </p>
                                        </div>
                                    </FormFieldGroup>
                                </div>
                                    </>
                                )}
                            </div>
                            {avatarCreateError && (
                                <div className="p-3 bg-red-50 border-l-4 border-red-400 border-y border-r border-r-red-400 rounded-md dark:bg-red-900 dark:border-l-4 dark:border-red-600 dark:border-y dark:border-r dark:border-y-red-600 dark:border-r-red-600">
                                    <p className="text-xs text-red-600 dark:text-red-100">{avatarCreateError}</p>
                                </div>
                            )}
                        </div>
                    </DialogBody>
                    <DialogFooter className="py-4">
                        <div className="flex justify-end flex-col items-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleSubmit(onHandleSubmit)}
                                            size={'sm'}
                                            loading={isLoading || loading}
                                            disabled={!isValid}
                                        >
                                            Save
                                        </Button>
                                    </TooltipTrigger>
                                    {isValid && (
                                        <TooltipContent side="left" align="center">
                                            All details need to be filled before the form can be saved
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </DialogFooter>
                </>
            )}
        </>
    );
};
