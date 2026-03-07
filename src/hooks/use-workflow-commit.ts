import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { WorkflowCommitProps } from '@/app/editor/[wid]/[workflow_id]/components/commit/workflow-commit';
import { IPackageCommit, IPackageWorkflow } from '@/models';
import { getNextVersionNumber, handleNoValue, isNullOrEmpty } from '@/lib/utils';
import { $fetch, FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from 'react-query';

const createCommit = async (data: IPackageCommit, workspaceId: string, workflowId: string) => {
    const response = await $fetch<IPackageCommit>('/release/packages/upload', {
        method: 'POST',
        body: JSON.stringify({ ...data, workflowId }),
        headers: {
            'x-workspace-id': workspaceId,
        },
    });
    return response.data;
};

const generateCommit = async (data: IPackageCommit, workspaceId: string, workflowId: string) => {
    const response = await $fetch<string>(`/release/packages/generate`, {
        method: 'POST',
        body: JSON.stringify({ ...data, workflowId }),
        headers: {
            'x-workspace-id': workspaceId,
        },
    });
    return response.data;
};

export const useWorkflowCommit = (props: WorkflowCommitProps) => {
    const params = useParams();
    const { isOpenCommit, workflowName, version, setOpenCommit, refetchGraph } = props;
    const [isOpen, setOpen] = useState<boolean>(false);
    const [workflows, setWorkflows] = useState<IPackageWorkflow[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        control,
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<IPackageCommit>({
        mode: 'all',
    });

    useEffect(() => {
        if (!isOpenCommit) {
            reset({ releaseType: undefined, releaseNote: '', version: '' });
            setWorkflows([]);
        }
    }, [isOpenCommit]);

    const releaseVersion = useMemo(() => {
        return getNextVersionNumber(version, watch('releaseType'));
    }, [isOpenCommit, version, watch('releaseType')]);

    const hasCurrentVersion = useMemo(() => {
        if (version || !isNullOrEmpty(watch('releaseType'))) {
            return true;
        }
        return false;
    }, [version, watch('releaseType')]);

    useEffect(() => {
        if (isOpenCommit) {
            const data: IPackageWorkflow[] = [
                {
                    id: '1',
                    workflow: handleNoValue(workflowName) as string,
                    source: `V${releaseVersion}`,
                    destination: version ? `V${version}` : '-',
                    hasCurrentVersion,
                },
            ];
            setWorkflows(data);
            setValue('version', releaseVersion);
        }
    }, [workflowName, isOpenCommit, version, releaseVersion, hasCurrentVersion]);

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        (data: IPackageCommit) => createCommit(data, params.wid as string, params.workflow_id as string),
        {
            onSuccess: () => {
                refetchGraph();
                setOpenCommit(false);
                toast.success('Changes committed successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error committing changes:', error?.message);
            },
        }
    );

    const { isLoading: generatingCommit, mutate: mutateGenerate } = useMutation(
        (data: IPackageCommit) => generateCommit(data, params.wid as string, params.workflow_id as string),
        {
            onSuccess: async data => {
                setValue('releaseNote', data, { shouldValidate: true });
                await trigger('releaseNote');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error generating commit:', error?.message);
            },
        }
    );

    const onHandleSubmit = (data: IPackageCommit) => {
        mutateCreate(data);
    };

    const onAction = (data: IPackageCommit) => {
        mutateGenerate(data);
    };

    return {
        workflows,
        errors,
        isValid,
        control,
        isSaving: creating || generatingCommit,
        generatingCommit,
        releaseVersion,
        isOpen,
        setOpen,
        register,
        reset,
        setValue,
        watch,
        handleSubmit,
        onAction,
        onHandleSubmit,
    };
};
