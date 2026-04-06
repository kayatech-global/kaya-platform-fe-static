import { getPublishedVersion } from '@/lib/utils';
import { IWorkflowPublish, IWorkflowPublishPayload, IWorkflowTypes } from '@/models';
import { logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'sonner';

//--- API call ---
const publishWorkflow = async (workspaceId: string, id: string, body: IWorkflowPublishPayload) => {
    // Mock implementation - simulate successful publish
    // In production, this would make an actual API call:
    // const response = await $fetch<IWorkflowPublishPayload>(
    //     `/workspaces/${workspaceId}/workflows/${id}/actions/publish`,
    //     {
    //         method: 'POST',
    //         headers: { 'x-workspace-id': workspaceId },
    //         body: JSON.stringify(body),
    //     },
    //     {
    //         denyRedirectOnForbidden: true,
    //     }
    // );
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock success response
    return {
        comments: body.comments,
        publishedAt: new Date().toISOString(),
        version: '1.0.0',
    };
};

// --- Custom hook ---
export const useWorkflowPublish = (
    open: boolean,
    refetchGraph: () => void,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    availableVersions?: IWorkflowTypes[]
) => {
    const [isSuccessfullyPublished, setIsSuccessfullyPublished] = useState(false);
    const params = useParams();

    const {
        register,
        watch,
        formState: { errors, isValid },
        setValue,
        handleSubmit,
        reset,
    } = useForm<IWorkflowPublish>({
        mode: 'onChange',
        defaultValues: {
            draftVersion: undefined,
            publishedVersion: undefined,
            comment: '',
        },
    });

    // --- Extract versions from availableVersions ---
    const { draftVersion, publishedVersion } = useMemo(() => {
        const draft = availableVersions?.find(v => v.name === 'draft')?.version;
        const publish = availableVersions?.find(v => v.name === 'publish')?.version;
        return { draftVersion: draft, publishedVersion: publish };
    }, [availableVersions]);

    // --- Mutation for publishing workflow ---
    const { isLoading: isPublishing, mutate } = useMutation(
        (data: IWorkflowPublishPayload) => publishWorkflow(params.wid as string, params.workflow_id as string, data),
        {
            onSuccess: () => {
                setIsSuccessfullyPublished(true);
            },
            onError: (error: Error) => {
                logger.error(error?.message);
                toast.error(error?.message || 'Failed to publish workflow');
            },
        }
    );

    // --- Submit handler ---
    const onSubmit = handleSubmit(data => {
        const body: IWorkflowPublishPayload = { comments: data.comment };
        mutate(body);
    });

    // --- Cancel handler ---
    const handleModalCancel = () => {
        if (isSuccessfullyPublished) {
            refetchGraph();
        }
        reset({
            draftVersion: undefined,
            publishedVersion: undefined,
            comment: '',
        });
        setOpen(false);
    };

    // --- Prefill versions when modal opens ---
    useEffect(() => {
        if (!open || !availableVersions?.length) return;

        if (draftVersion) {
            setValue('draftVersion', draftVersion);
            const nextPublishVersion = getPublishedVersion(draftVersion);
            setValue('publishedVersion', nextPublishVersion);
        }
    }, [open, availableVersions, setValue, draftVersion, publishedVersion]);

    useEffect(() => {
        if (open) {
            setIsSuccessfullyPublished(false);
        }
    }, [open]);

    return {
        register,
        watch,
        errors,
        onSubmit,
        isValid,
        isPublishing,
        handleModalCancel,
        isSuccessfullyPublished,
    };
};
