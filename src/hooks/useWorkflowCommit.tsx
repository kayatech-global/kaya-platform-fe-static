import { useAuth } from '@/context';
import { useApp } from '@/context/app-context';
import { QueryKeyType } from '@/enums';
import { handleNoValue, isNullOrEmpty } from '@/lib/utils';
import { IWorkflowPush } from '@/models';
import { registryService } from '@/services';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'sonner';

const isLowerVersionError = (msg: string) =>
    msg.includes('Entered version must be higher than the latest pushed version');

const isArtifactNameError = (msg: string) =>
    msg.includes('Artifact name is already in use. Please provide a different name');

const getWorkflowPushErrorMessage = (error: FetchError): string => {
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
        return 'Push to registry failed. Please try again.';
    }
    return error?.message ?? 'Push to registry failed. Please try again.';
};

const sanitizeMarkdownString = (input: string): string => {
    if (!input) return '';
    let cleaned = input.trim();
    // 1. Remove accidental wrapping quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    // 2. Replace escaped newlines \\n → real newline
    cleaned = cleaned.replace(/\\n/g, '\n');
    // 3. Replace escaped quotes \" → "
    cleaned = cleaned.replace(/\\"/g, '"');
    // 4. Convert double backslashes \\ → \
    cleaned = cleaned.replace(/\\\\/g, '\\');
    // 5. Trim again for safety
    return cleaned.trim();
};

export const useWorkflowCommit = (open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>) => {
    const [isCommittedSuccessfully, setIsCommittedSuccessfully] = useState(false);
    const [openIntelligenceForm, setOpenIntelligenceForm] = useState(false);

    const { token } = useAuth();
    const params = useParams();
    const { intelligentSource } = useApp();

    const {
        register,
        watch,
        formState: { errors, isValid },
        handleSubmit,
        reset,
        setError,
        setValue,
        control,
    } = useForm<IWorkflowPush>({
        mode: 'all',
        defaultValues: {
            version: '',
            releaseNote: '',
            artifactName: '',
        },
    });

    const {
        isFetching,
        data: artifactStatus,
        isError,
    } = useQuery(
        QueryKeyType.ARTIFACT_STATUS,
        async () => await registryService.status(params.wid as string, params.workflow_id as string),
        {
            enabled: !!token && open,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                if (data?.isArtifactAvailable) {
                    setValue('artifactName', handleNoValue(data.artifactName, 'N/A') as string);
                } else {
                    setValue('artifactName', '');
                }
            },
            onError: e => {
                console.error('Failed to fetch Artifact Status:', e);
            },
        }
    );

    const { isLoading: isCommitting, mutate } = useMutation(
        (data: IWorkflowPush) => registryService.commit(params.wid as string, params.workflow_id as string, data),
        {
            onSuccess: () => {
                setIsCommittedSuccessfully(true);
            },
            onError: (error: FetchError) => {
                const isVersionMismatched = isLowerVersionError(error.message);
                const isArtifactNameExist = isArtifactNameError(error.message);

                if (isVersionMismatched || isArtifactNameExist) {
                    if (isVersionMismatched) {
                        setError('version', {
                            type: 'manual',
                            message: error.message,
                        });
                    }

                    if (isArtifactNameExist) {
                        setError('artifactName', {
                            type: 'manual',
                            message: error.message,
                        });
                    }
                } else {
                    const errorMessage = getWorkflowPushErrorMessage(error);
                    logger.error('Error pushing workflow to registry:', error?.message);
                    toast.error(errorMessage);
                }
            },
        }
    );

    const { isLoading: generatingReleaseNote, mutate: fetchReleaseNote } = useMutation(
        () => registryService.generateReleaseNote(params.wid as string, params.workflow_id as string),
        {
            onSuccess: data => {
                toast.success('Release note generated successfully');
                const formattedMarkdown = sanitizeMarkdownString(data.releaseNote);
                setValue('releaseNote', formattedMarkdown);
            },
            onError: (error: FetchError) => {
                logger.error(error?.message);
                toast.error(error?.message);
            },
        }
    );

    const handleAutoGenerate = () => {
        fetchReleaseNote();
    };

    const onSubmit = handleSubmit(data => {
        mutate({
            ...data,
            artifactName: artifactStatus?.isArtifactAvailable ? artifactStatus.artifactName : data.artifactName,
        });
    });

    const handleModalCancel = () => {
        setOpen(false);
        reset({ version: '', releaseNote: '', artifactName: '' });
    };

    const validateArtifactName = (value: string) => {
        const allowedChars = /^[a-z0-9_-]+$/;
        if (!allowedChars.test(value)) {
            return 'Only lowercase letters, numbers, "_" and "-" are allowed';
        }

        const validFormat = /^[a-z][a-z0-9_-]*$/;
        if (!validFormat.test(value)) {
            return 'Invalid artifact name. Eg: my-artifact_1 or my-artifact';
        }

        return true;
    };

    const compareVersions = (a: string, b: string): number => {
        const pa = a.split('.').map(Number);
        const pb = b.split('.').map(Number);

        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const diff = (pa[i] || 0) - (pb[i] || 0);
            if (diff !== 0) return diff;
        }

        return 0;
    };

    const validateVersion = (value: string) => {
        const lastVersion = artifactStatus?.lastPushedVersion;

        if (isNullOrEmpty(value) || isNullOrEmpty(lastVersion)) return true;

        if (compareVersions(value, lastVersion as string) <= 0) {
            return `Please enter a version higher than ${lastVersion}`;
        }

        return true;
    };

    const lastPushedVersion = artifactStatus?.lastPushedVersion ?? undefined;

    useEffect(() => {
        if (open) {
            setIsCommittedSuccessfully(false);
        }
    }, [open]);

    const isArtifactAvailable = useMemo(() => {
        if (isError || artifactStatus?.isArtifactAvailable) {
            return true;
        }
        return false;
    }, [isError, artifactStatus]);

    return {
        isFetching,
        isArtifactAvailable,
        register,
        watch,
        setValue,
        errors,
        onSubmit,
        isValid,
        handleAutoGenerate,
        isCommitting,
        isCommittedSuccessfully,
        handleModalCancel,
        generatingReleaseNote,
        intelligentSource,
        openIntelligenceForm,
        setOpenIntelligenceForm,
        control,
        validateArtifactName,
        validateVersion,
        lastPushedVersion,
    };
};
