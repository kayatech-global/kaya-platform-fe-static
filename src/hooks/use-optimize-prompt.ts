import { OptimizePromptProps } from '@/app/workspace/[wid]/prompt-templates/components/optimize-prompt';
import { IEnhanceForm } from '@/models';
import { promptService } from '@/services';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { usePlatformQuery } from './use-common';

export const useOptimizePrompt = (props: OptimizePromptProps) => {
    const params = useParams();
    const { intelligentSource, setOpenModal, onInsertClick } = props;
    const queryClient = useQueryClient();
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>(props?.allIntellisenseValues ?? []);
    const [responseContent, setResponseContent] = useState<string>('');

    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        control,
        setValue,
        trigger,
        watch,
        getValues,
        reset,
    } = useForm<IEnhanceForm>({ mode: 'all' });

    const [currentPrompt, promptFrameworkType] = watch(['currentPrompt', 'promptFrameworkOption.value']);

    const isValidEnhance = useMemo(
        () => currentPrompt?.trim() !== '' && !!promptFrameworkType,
        [currentPrompt, promptFrameworkType]
    );

    // Fetch full platform config once
    const { data: platformConfig, isFetching } = usePlatformQuery({
        queryKey: 'platform-config',
    });

    // Derive prompt frameworks from the fetched config
    const promptFrameworks = useMemo(() => {
        if (platformConfig?.promptFrameworks) {
            try {
                return JSON.parse(platformConfig.promptFrameworks) as Array<{
                    type: string;
                    title: string;
                    description?: string;
                    fields?: string[];
                    instructions?: string;
                }>;
            } catch {
                logger.warn('Failed to parse promptFrameworks from platform config');
            }
        }
        return [];
    }, [platformConfig]);

    // Mutation
    const { isLoading, mutate } = useMutation(
        (data: IEnhanceForm) => promptService.enhance(data, params.wid as string),
        {
            onSuccess: data => {
                setResponseContent(data?.replace(/{{|}}/g, ''));
                // Invalidate the platform-config so changes propagate
                queryClient.invalidateQueries('platform-config');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error enhancing prompt:', error?.message);
            },
        }
    );

    const onHandleSubmit = (data: IEnhanceForm) => {
        try {
            setAllIntellisenseValues([]);
            setResponseContent('');
            reset({ currentPrompt: '', enhancedPrompt: '', promptFrameworkType: '', promptFrameworkOption: undefined });
            onInsertClick(data.enhancedPrompt!);
            setOpenModal(false);
        } catch (error) {
            toast.error("Something went wrong! We couldn't pass your prompt");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onEnhanceClick = () => {
        try {
            if (!intelligentSource) {
                toast.error('You need to set your intelligent source in Settings.');
                return;
            }

            const typeValue = getValues('promptFrameworkOption');
            const activePromptFramework = promptFrameworks.find(f => f.type === typeValue?.value);
            if (!activePromptFramework) {
                toast.error('Please select a valid prompt framework.');
                return;
            }

            const payload: IEnhanceForm = {
                promptFramework: {
                    type: activePromptFramework.type,
                    title: activePromptFramework.title,
                    description: activePromptFramework.description ?? '',
                },
                intelligentSource: {
                    id: intelligentSource.id,
                    isSLM: intelligentSource.isSLM,
                },
                currentPrompt: watch('currentPrompt'),
                promptFrameworkType: getValues('promptFrameworkOption')?.value as string,
            };

            mutate(payload);
        } catch (error) {
            console.error('Error enhancing prompt:', error);
        }
    };

    return {
        isFetching,
        isLoading,
        promptFrameworks,
        isValid,
        errors,
        allIntellisenseValues,
        responseContent,
        control,
        isValidEnhance,
        register,
        handleSubmit,
        onHandleSubmit,
        setResponseContent,
        setValue,
        trigger,
        watch,
        onEnhanceClick,
    };
};
