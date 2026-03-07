import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { IWorkspace, IWorkspaceForm, IAzureDomain, IOption, IWorkspaceMetadata } from '@/models';
import { $fetch, FetchError, logger } from '@/utils';
import { EmailType } from '@/enums';
import { WorkspaceFormProps } from '@/app/workspaces/components/workspace-form';
import { validateField } from '@/utils/validation';
import { usePlatformQuery } from './use-common';

interface WorkspaceNameHistory {
    name: string;
    isDirty: boolean | undefined;
}

const requiredUserEmail = 'Please make sure to add at least one user email';

const licenseKeyValidate = validateField('License Key', {
    required: { value: true },
});
const licenseKeyValidation = {
    required: licenseKeyValidate.required,
};

const workspaceNameValidate = validateField('Workspace Name', {
    required: { value: true },
    minLength: { value: 2 },
    maxLength: { value: 50 },
});
const workspaceNameValidation = {
    required: workspaceNameValidate.required,
    minLength: workspaceNameValidate.minLength,
    maxLength: workspaceNameValidate.maxLength,
};

const descriptionValidate = validateField('Description', {
    required: { value: true },
    minLength: { value: 5 },
    maxLength: { value: 300 },
});
const workspaceDescriptionValidation = {
    required: descriptionValidate.required,
    minLength: descriptionValidate.minLength,
};

const createWorkspace = async (workspace: IWorkspace) => {
    const response = await $fetch<IWorkspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(workspace),
    });
    return response.data;
};

const fetchWorkspaceNameValidation = async (name: string, workspaceId?: number | string) => {
    try {
        const headers: Record<string, string> = {};

        if (workspaceId) {
            headers['x-workspace-id'] = workspaceId.toString();
        }

        const response = await $fetch<boolean>('/workspaces/find', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: name.toLowerCase() }),
        });
        return response?.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error?.message) {
            toast.error(error.message);
        }
        return false;
    }
};

const getWorkspaceDetails = async (workspaceId: number | string) => {
    const response = await $fetch<IWorkspace>(`/workspaces/${workspaceId}/details`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId.toString(),
        },
    });

    return response.data;
};

const updateWorkspace = async (workspaceId: number | string, data: IWorkspace) => {
    await $fetch<void>(`/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'x-workspace-id': workspaceId.toString(),
        },
    });
};

export const deleteWorkspace = async (workspaceId: number | string) => {
    await $fetch<void>(`/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
            'x-workspace-id': workspaceId.toString(),
        },
    });
};

const validateEmailFormat = (value: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,}$/;
    if (!emailPattern.test(value)) {
        return 'Please enter a valid email address';
    }
    return null;
};

const validateEmailDomain = (value: string, domains: string[] | undefined) => {
    if (domains && domains.length > 0) {
        const domain = value.split('@')[1];
        const validDomain = domains.find(x => x.toLowerCase() === domain.toLowerCase());
        if (!validDomain) {
            return `Invalid domain ${domain}, only ${domains.join(', ')} allowed`;
        }
    }
    return null;
};

const validateEmailUniqueness = (value: string, userEmails: string[] = [], adminEmails: string[] = []) => {
    const existingUser = userEmails?.find(x => x?.toLowerCase() === value.toLowerCase());
    const existingAdmin = adminEmails?.find(x => x?.toLowerCase() === value.toLowerCase());
    if (existingUser || existingAdmin) {
        return 'This email is already in use';
    }
    return null;
};

export const useWorkspace = ({ onClose, refetchEnvironment, workspaceId, metadataCollection }: WorkspaceFormProps) => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(false);
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [nameHistory, setNameHistory] = useState<WorkspaceNameHistory[]>([]);
    const [admins, setAdmins] = useState<string[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string | null>();
    const [defaultKey, setDefaultKey] = useState<string>();
    const [workspaceCreateError, setWorkspaceCreateError] = useState<string>('');
    const [metadataList, setMetadataList] = useState<IOption[]>([]);

    const { isFetching, data: domains } = usePlatformQuery({
        queryKey: 'domains',
        select: response => {
            if (response?.approvedAzureAdDomains) {
                const azureDomain: IAzureDomain = JSON.parse(response.approvedAzureAdDomains);
                if (azureDomain) {
                    return azureDomain.domains;
                }
            }
            return [];
        },
    });

    useEffect(() => {
        if (workspaceId) {
            onEdit(workspaceId);
        } else {
            setWorkspaceName(null);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (metadataCollection?.length > 0) {
            setMetadataList(metadataCollection?.map(x => ({ label: x, value: x })));
        } else {
            setMetadataList([]);
        }
    }, [metadataCollection]);

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
        setError,
        clearErrors,
    } = useForm<IWorkspaceForm>({ mode: 'all' });

    const _metadata = useWatch({
        control,
        name: 'metadata',
    });

    const hasDuplicateMetadata = useMemo(() => {
        if (!Array.isArray(_metadata) || _metadata.length === 0 || _metadata.length === 1) return false;
        const seen = new Set<string>();

        for (const item of _metadata) {
            const value = `${item?.name?.trim()}`;
            if (seen.has(value)) return true;
            seen.add(value);
        }

        return false;
    }, [_metadata]);

    const metadataOptions = useMemo(() => {
        if (metadataList?.length > 0) {
            return metadataList.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
        }
        return [];
    }, [metadataList]);

    useEffect(() => {
        const subscription = watch(() => {
            setWorkspaceCreateError('');
        });

        return () => subscription.unsubscribe();
    }, [watch]);

    const { append: appendUserEmail, remove: removeUserEmail } = useFieldArray({
        control,
        name: 'userEmails' as never,
    });

    const { append: appendAdminEmail, remove: removeAdminEmail } = useFieldArray({
        control,
        name: 'adminEmails' as never,
    });

    const {
        fields: metadata,
        append: _appendMetadata,
        remove: removeMetadata,
    } = useFieldArray({
        name: 'metadata',
        control,
    });

    const { isLoading, mutate: mutateWorkspace } = useMutation(createWorkspace, {
        onSuccess: () => {
            queryClient.invalidateQueries('workspaces');
            refetchEnvironment();
            reset();
            setNameHistory([]);
            setWorkspaceName(null);
            setDebounceTimer(null);
            setLoading(false);
            onClose();
            toast.success('Workspace saved successfully');
        },
        onError: (error: FetchError) => {
            const errorMessage =
                error?.status === 400 ? error?.message : "Something went wrong! We couldn't save your workspace";
            setWorkspaceCreateError(errorMessage);
            // 'Commented' might be reused if we need to trigger a toast notification.
            // toast.error(errorMessage, { position: 'top-center', duration: 7000, closeButton: true });
            logger.error('Error creating workspace:', error?.message);
        },
    });

    const { isLoading: isUpdating, mutate: mutateUpdate } = useMutation(
        (data: IWorkspace) => updateWorkspace(workspaceId as string, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('workspaces');
                refetchEnvironment();
                reset();
                setWorkspaceName(null);
                setNameHistory([]);
                setDebounceTimer(null);
                setLoading(false);
                onClose();
                toast.success('Workspace updated successfully');
            },
            onError: (error: FetchError) => {
                const errorMessage =
                    error?.status === 400 ? error?.message : "Something went wrong! We couldn't update your workspace";
                setWorkspaceCreateError(errorMessage);
                // 'Commented' might be reused if we need to trigger a toast notification.
                // toast.error(errorMessage, { position: 'top-center', duration: 7000, closeButton: true });
                logger.error('Error updating workspace:', error?.message);
            },
        }
    );

    const manageMetadata = (metadata?: IWorkspaceMetadata[]) => {
        if (metadata && metadata?.length > 0) {
            return metadata?.map(x => ({ ...x, modelNameOption: undefined }) as IWorkspaceMetadata);
        }
        return undefined;
    };

    const onHandleSubmit = (data: IWorkspaceForm) => {
        try {
            if (workspaceId) {
                const body: IWorkspace = {
                    licenseKey: data.licenseKey,
                    name: data.name,
                    description: data.description,
                    metadata: manageMetadata(data?.metadata),
                    adminEmails: data.adminEmails,
                    userEmails: data.userEmails,
                };
                mutateUpdate(body);
            } else {
                const body: IWorkspace = {
                    licenseKey: data.licenseKey,
                    name: data.name,
                    description: data.description,
                    metadata: manageMetadata(data?.metadata),
                    adminEmails: data.adminEmails,
                    userEmails: data.userEmails,
                };
                mutateWorkspace(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your workspace");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onEdit = async (id: number | string) => {
        setFormLoading(true);
        if (id) {
            const obj = await getWorkspaceDetails(id);
            if (obj) {
                setDefaultKey(obj.licenseKey);
                setWorkspaceName(obj.name);
                setValue('id', obj.id);
                setValue('description', obj.description);
                setValue('name', obj.name);
                setValue('licenseKey', obj.licenseKey);
                setValue('adminEmails', obj.adminEmails);
                setValue('userEmails', obj.userEmails);
                setAdmins(obj.adminEmails);
                const mappedMetadata = obj?.metadata?.map(
                    x =>
                        ({
                            ...x,
                            modelNameOption: { label: x.name, value: x.name },
                        }) as IWorkspaceMetadata
                );
                setValue('metadata', mappedMetadata);
                setFormLoading(false);
            }
        }
    };

    const manageUserEmail = async () => {
        const _userEmail = getValues('email');
        appendUserEmail(_userEmail);
        setValue('email', '');
        trigger('email');
        await adminEmailError();
    };

    const validateEmail = async (value: string, type: EmailType) => {
        if (value && value.trim() !== '') {
            const formatError = validateEmailFormat(value);
            if (formatError) return formatError;

            const domainError = validateEmailDomain(value, domains);
            if (domainError) return domainError;

            const uniqueError = validateEmailUniqueness(value, getValues('userEmails'), getValues('adminEmails'));
            if (uniqueError) return uniqueError;
        }

        if (type === EmailType.User) {
            const emails = [...(getValues('userEmails') ?? []), ...(getValues('adminEmails') ?? [])];
            if (!emails || emails?.length === 0) {
                return requiredUserEmail;
            }
        }
        return true;
    };

    const validateWorkspaceName = async (value: string) => {
        if (value === workspaceName) return true;
        if (value) {
            const specialCharRegex = /[^a-zA-Z0-9 ]/;
            if (value.startsWith(' ')) {
                return 'No leading spaces in workspace name';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in workspace name';
            }
            if (specialCharRegex.test(value)) {
                return 'Workspace name cannot contain special characters';
            }

            if (value.trim() !== '') {
                const history = nameHistory?.find(x => x.name === value.trim());
                if (history?.isDirty) {
                    return `Workspace ${value} already exists on platform, please enter a different name`;
                } else if (!history) {
                    validateWorkspaceNameByFetch(value);
                }
            }
        }
        return true;
    };

    const validateWorkspaceNameByFetch = (value: string) => {
        setLoading(true);
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(async () => {
            try {
                const result = await fetchWorkspaceNameValidation(value, workspaceId);
                setNameHistory(prevHistory => [...prevHistory, { name: value.trim(), isDirty: result }]);

                if (result) {
                    setError('name', {
                        type: 'manual',
                        message: `Workspace ${value} already exists on platform, please enter a different name`,
                    });
                }
            } finally {
                setLoading(false);
            }
        }, 1000);
        setDebounceTimer(timer);
    };

    const validateWorkspaceDescription = (value: string) => {
        if (value) {
            if (value.startsWith(' ')) {
                return 'No leading spaces in workspace description';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in workspace description';
            }
        }
        return true;
    };

    const removeEmailByType = async (index: number, type: EmailType) => {
        if (type === EmailType.User) {
            removeUserEmail(index);
        } else {
            removeAdminEmail(index);
        }

        if (getValues('userEmails')?.length === 0 && getValues('adminEmails')?.length === 0) {
            trigger('email');
        } else if (getValues('adminEmails')?.length === 0) {
            await adminEmailError();
        }
    };

    const mangeUserRole = async (index: number, type: EmailType) => {
        if (type === EmailType.User) {
            const user = getValues('userEmails')[index];
            if (user) {
                appendAdminEmail(user);
                removeUserEmail(index);
            }
        } else {
            const admin = getValues('adminEmails')[index];
            if (admin) {
                appendUserEmail(admin);
                removeAdminEmail(index);
            }
        }
        await adminEmailError();
    };

    const adminEmailError = async () => {
        const admins = getValues('adminEmails');
        if (admins?.length === 0) {
            setError('adminEmails', {
                type: 'manual',
                message: 'Please make sure to add at least one admin email',
            });
        } else {
            clearErrors('adminEmails');
        }
        await trigger('adminEmails');
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (isLoading || isUpdating) return 'Saving';
        if (loading) return 'Verifying';
        return 'Save';
    };

    const hasErrors = useMemo(() => {
        return !isValid || !!errors?.adminEmails?.message || hasDuplicateMetadata;
    }, [isValid, errors?.adminEmails?.message, hasDuplicateMetadata]);

    const appendMetadata = () => {
        _appendMetadata({ name: '', value: '' });
    };

    const addMetadata = (value: string) => {
        if (!metadataList?.find(x => x.value?.toLowerCase() === value?.toLowerCase()?.trim())) {
            setMetadataList(prev => [...prev, { label: value.trim(), value: value.trim() }]);
        }
    };

    return {
        isLoading: isLoading || isUpdating,
        isFormLoading,
        loading,
        isFetching,
        isValid,
        hasErrors,
        errors,
        control,
        requiredUserEmail,
        workspaceNameValidation,
        workspaceDescriptionValidation,
        licenseKeyValidation,
        admins,
        defaultKey,
        metadata,
        metadataList: metadataOptions,
        hasDuplicateMetadata,
        manageUserEmail,
        removeEmailByType,
        mangeUserRole,
        register,
        getValues,
        setValue,
        trigger,
        watch,
        validateEmail,
        validateWorkspaceName,
        validateWorkspaceDescription,
        handleSubmit,
        onHandleSubmit,
        buttonText,
        addMetadata,
        appendMetadata,
        removeMetadata,
        workspaceCreateError,
    };
};
