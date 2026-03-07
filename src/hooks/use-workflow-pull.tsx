/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import {
    FieldMeta,
    IEnvSpecificValuePayload,
    IPullTypeIdentifierResponse,
    IWorkflowComparisonResponse,
    IWorkflowDeploymentExecution,
    IWorkflowPullType,
    WorkflowEnvConfigFieldForm,
    WorkflowEnvConfigFormBase,
    WorkflowEnvConfigItemForm,
} from '@/models';
import { useEffect, useMemo, useState } from 'react';
import { IStep } from '@/components/organisms/stepper/stepper';
import { PullTypeStep } from '@/app/workspace/[wid]/workflow-registry/components/pull-type-step';
import { DifferencesStep } from '@/app/workspace/[wid]/workflow-registry/components/workflow-comparison';
import { ConfigurationStep } from '@/app/workspace/[wid]/workflow-registry/components/configuration-step';
import { FetchError, logger } from '@/utils';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { PullingStep } from '@/app/workspace/[wid]/workflow-registry/components/pulling-step';
import { OptionModel } from '@/components';
import { useApp } from '@/context/app-context';
import { useVaultQuery } from './use-common';
import { registryService, workflowService } from '@/services';
import { ArtifactApproachType, QueryKeyType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';

interface WorkflowNameHistory {
    name: string;
    isDirty: boolean | undefined;
}

const PULL_TYPES_CONSTANT: IWorkflowPullType[] = [
    {
        type: ArtifactApproachType.CREATE_AS_NEW,
        label: 'As a New Workflow',
        description: "This action will create a 'New Workflow' in your environment based on the selected version.",
    },
    {
        type: ArtifactApproachType.OVERWRITE_EXISTING,
        label: 'Override the Existing Workflow',
        description:
            'This will replace the existing workflow with the selected version. Any current workflow changes will be overwritten.',
    },
    {
        type: ArtifactApproachType.CLONE,
        label: 'Create Linked Copy',
        description:
            'This will create a new workflow that references the same underlying entities as the original. Because these entities are shared, changes made to them may affect other workflows. This copy can only be used within the current workspace.',
    },
];

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

interface IUseWorkflowPullProp {
    artifactPath: string | null;
    artifactVersion: string | null;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    setArtifactVersion: React.Dispatch<React.SetStateAction<string | null>>;
    setArtifactPath: React.Dispatch<React.SetStateAction<string | null>>;
    refetch: () => void;
}

export const useWorkflowPull = ({
    artifactPath,
    artifactVersion,
    setArtifactPath,
    setArtifactVersion,
    setIsOpen,
    isOpen,
    refetch,
}: IUseWorkflowPullProp) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [pullType, setPullType] = useState<IPullTypeIdentifierResponse>();
    const [workflowComparisonData, setWorkflowComparisonData] = useState<IWorkflowComparisonResponse>();
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

    // states to keep track of data receive success or not
    const [pullTypeReceivedSuccessfully, setPullTypeReceivedSuccessfully] = useState(false);
    const [pullTypeReceivedFailedMessage, setPullTypeReceivedFailedMessage] = useState<string | undefined>(undefined);
    const [workflowComparisonReceivedSuccessfully, setWorkflowComparisonReceivedSuccessfully] = useState(false);
    const [envSpecificDataRetrievedSuccessfully, setEnvSpecificDataRetrievedSuccessfully] = useState(false);
    const [envSpecificDataPostedSuccessfully, setEnvSpecificDataPostedSuccessfully] = useState(false);
    const [workflowDeploymentExecutionSuccess, setWorkflowDeploymentExecutionSuccess] = useState(false);
    const [validating, setValidating] = useState<boolean>(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    // Make sure to clear history when submit
    const [nameHistory, setNameHistory] = useState<WorkflowNameHistory[]>([]);

    const params = useParams();
    const { intelligentSource } = useApp();

    const {
        control,
        watch,
        formState: { errors, isValid },
        trigger,
        reset,
        setValue,
        setError,
        register,
        clearErrors,
    } = useForm<WorkflowEnvConfigFormBase>({
        mode: 'all',
        defaultValues: {
            configs: [],
            migrationStrategy: undefined,
            workflowName: undefined,
        },
    });

    const pullTypes = useMemo(() => {
        if (pullType?.migrationStrategies && pullType?.migrationStrategies?.length > 0) {
            return PULL_TYPES_CONSTANT.filter(item => pullType?.migrationStrategies?.includes(item.type))?.map(item => {
                const matchingError = pullType.errors?.find(err => err.migrationStrategy === item.type);
                return {
                    ...item,
                    error: matchingError,
                };
            });
        }
        return [];
    }, [pullType]);

    const hasError = useMemo(() => {
        if (isNullOrEmpty(pullTypeReceivedFailedMessage)) return false;
        return true;
    }, [pullTypeReceivedFailedMessage]);

    const isNewStrategy = useMemo(() => {
        if (watch('migrationStrategy') === ArtifactApproachType.CREATE_AS_NEW) {
            return true;
        }
        return false;
    }, [watch('migrationStrategy')]);

    const isCloneStrategy = useMemo(() => {
        if (watch('migrationStrategy') === ArtifactApproachType.CLONE) {
            return true;
        }
        return false;
    }, [watch('migrationStrategy')]);

    const { refetch: refetchWorkflowPullType, isFetching: pullTypeLoading } = useQuery(
        [QueryKeyType.WORKFLOW_PULL_TYPE, artifactPath, artifactVersion],
        () => registryService.validate(params.wid as string, artifactPath as string, artifactVersion as string),
        {
            enabled: false,
            retry: false,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setPullType(data);
                const errorStrategies = new Set(data?.errors?.map(err => err.migrationStrategy) ?? []);
                const firstValidStrategy = data?.migrationStrategies?.find(strategy => !errorStrategies.has(strategy));
                setValue('migrationStrategy', firstValidStrategy);
                setTimeout(async () => {
                    await trigger('workflowName', { shouldFocus: false });
                    await trigger('migrationStrategy', { shouldFocus: true });
                    clearErrors(['migrationStrategy', 'workflowName']);
                }, 100);
                setPullTypeReceivedSuccessfully(true);
            },
            onError: (error: FetchError) => {
                setPullTypeReceivedFailedMessage(error?.message);
                console.error('Failed to fetch workflow pull type', error?.message);
            },
        }
    );

    const { refetch: refetchWorkflowComparisonType, isFetching: workflowComparisonLoading } = useQuery(
        [QueryKeyType.WORKFLOW_COMPARISON, artifactPath, artifactVersion, pullType?.sessionId],
        () =>
            registryService.diff(
                params.wid as string,
                artifactPath as string,
                artifactVersion as string,
                pullType?.sessionId as string
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            retry: false,
            onSuccess: data => {
                setWorkflowComparisonData({
                    comparisonOutput: sanitizeMarkdownString(data.comparisonOutput),
                    currentPublishGraph: JSON.stringify(data.currentPublishGraph, null, 2),
                    incomingPublishGraph: JSON.stringify(data.incomingPublishGraph, null, 2),
                });
                setWorkflowComparisonReceivedSuccessfully(true);
                setCurrentStep(2);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                console.error('Failed to fetch comparison data', error?.message);
            },
        }
    );

    const { refetch: refetchWorkflowEnvSpecificValues, isFetching: workflowEnvSpecificValuesLoading } = useQuery(
        [
            QueryKeyType.WORKFLOW_ENV_SPECIFIC_VALUES,
            artifactPath,
            artifactVersion,
            pullType?.sessionId,
            watch('migrationStrategy'),
        ],
        () =>
            registryService.configurations(
                params.wid as string,
                artifactPath as string,
                artifactVersion as string,
                pullType?.sessionId as string,
                watch('migrationStrategy')
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            retry: false,
            onSuccess: data => {
                const mappedData = mapData(data);
                setValue('configs', mappedData);
                trigger('configs')
                    .then(() => {
                        setEnvSpecificDataRetrievedSuccessfully(true);
                        setCurrentStep(3);
                    })
                    .catch(error => {
                        logger.error('Failed to trigger validation:', error);
                    });
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                console.error('Failed to fetch comparison data', error?.message);
            },
        }
    );

    const { isLoading: workflowEnvSpecificValuesPostLoading, mutateAsync: mutateEnvSpecificData } = useMutation(
        ({
            data,
            workspaceId,
            artifactPath,
            artifactVersion,
        }: {
            data: IEnvSpecificValuePayload;
            workspaceId: string;
            artifactPath: string;
            artifactVersion: string;
        }) => registryService.createConfigurations(data, workspaceId, artifactPath, artifactVersion),
        {
            onSuccess: () => {
                setEnvSpecificDataPostedSuccessfully(true);
            },
            onError: (error: FetchError) => {
                toast.error('Workflow pull failed. Please try again');
                logger.error('Error updating environment specific data:', error?.message);
            },
        }
    );

    const { isLoading: workflowDeploymentExecutionLoading, mutateAsync: executeWorkflowMutation } = useMutation(
        ({
            data,
            workspaceId,
            artifactPath,
            artifactVersion,
        }: {
            data: IWorkflowDeploymentExecution;
            workspaceId: string;
            artifactPath: string;
            artifactVersion: string;
        }) => registryService.execute(data, workspaceId, artifactPath, artifactVersion),
        {
            onSuccess: () => {
                setWorkflowDeploymentExecutionSuccess(true);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating environment specific data:', error?.message);
            },
        }
    );

    const { refetch: refetchSecrets, isLoading: loadingSecrets } = useVaultQuery({
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

    const validateWorkflowName = async (value: string) => {
        if (value) {
            if (value.startsWith(' ')) {
                return 'No leading spaces in workflow name';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in workflow name';
            }

            if (value.trim() !== '') {
                const history = nameHistory?.find(x => x.name === value.trim());
                if (history?.isDirty) {
                    return `Workflow '${value}' already exists, please enter a different name`;
                } else if (!history) {
                    validateWorkspaceNameByFetch(value);
                }
            }
        }
        return true;
    };

    const handleWorkflowCheckResult = (value: string, result: { isAvailable: boolean }) => {
        setNameHistory(prevHistory => [...prevHistory, { name: value.trim(), isDirty: !result?.isAvailable }]);
        if (!result?.isAvailable) {
            setError('workflowName', {
                type: 'manual',
                message: `Workflow '${value}' already exists, please enter a different name`,
            });
        } else {
            clearErrors('workflowName');
        }
    };

    const validateWorkspaceNameByFetch = (value: string) => {
        setValidating(true);
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(async () => {
            await workflowService
                .check(params.wid as string, value)
                .then(result => handleWorkflowCheckResult(value, result))
                .finally(() => setValidating(false));
        }, 1000);
        setDebounceTimer(timer);
    };

    const wizardSteps: IStep[] = [
        {
            id: '1',
            step: 1,
            title: 'Pull Type',
            icon: 'ri-install-fill',
            body: (
                <PullTypeStep
                    migrationStrategy={watch('migrationStrategy')}
                    pullTypes={pullTypes}
                    isLoading={pullTypeLoading}
                    pullTypeReceivedFailedMessage={pullTypeReceivedFailedMessage}
                    errors={errors}
                    control={control}
                    register={register}
                    validateWorkflowName={validateWorkflowName}
                />
            ),
            isDisabled: false,
        },
        {
            id: '2',
            step: 2,
            title: 'Differences',
            icon: 'ri-arrow-left-right-fill',
            body: (
                <DifferencesStep
                    workflowComparisonData={workflowComparisonData}
                    setWorkflowComparisonData={setWorkflowComparisonData}
                    setWorkflowComparisonReceivedSuccessfully={setWorkflowComparisonReceivedSuccessfully}
                    artifactPath={artifactPath}
                    artifactVersion={artifactVersion}
                    pullType={pullType}
                />
            ),
            isDisabled: isNewStrategy || isCloneStrategy,
        },
        {
            id: '3',
            step: 3,
            title: 'Configuration',
            icon: 'ri-settings-5-fill',
            body: (
                <ConfigurationStep
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    control={control}
                    errors={errors}
                    secrets={secrets}
                    refetchSecrets={refetchSecrets}
                    loadingSecrets={loadingSecrets}
                    trigger={trigger}
                />
            ),
            isDisabled: isCloneStrategy,
        },
        {
            id: '4',
            step: 4,
            title: 'Confirm',
            icon: 'ri-check-double-line',
            body: (
                <PullingStep
                    isEnvValuePosting={workflowEnvSpecificValuesPostLoading}
                    isEnvValuePostingSuccess={envSpecificDataPostedSuccessfully}
                    isPulling={workflowDeploymentExecutionLoading}
                    isPullingSuccess={workflowDeploymentExecutionSuccess}
                />
            ),
            isDisabled: false,
        },
    ];

    const getWorkflowComparisonData = () => {
        if (workflowComparisonReceivedSuccessfully === false) {
            if (intelligentSource) {
                refetchWorkflowComparisonType();
                return;
            } else {
                setCurrentStep(2);
                return;
            }
        }
        setCurrentStep(2); // if workflowComparisonReceivedSuccessfully === true set the step from here
    };

    const getEnvSpecificValueData = () => {
        if (envSpecificDataRetrievedSuccessfully === false) {
            refetchWorkflowEnvSpecificValues();
            return;
        }
        setCurrentStep(3);
    };

    const postEnvSpecificValueData = async () => {
        await mutateEnvSpecificData({
            data: { items: watch('configs'), sessionId: pullType?.sessionId as string },
            workspaceId: params.wid as string,
            artifactPath: artifactPath as string,
            artifactVersion: artifactVersion as string,
        });
        await postExecuteData();
    };

    const postExecuteData = async () => {
        if (watch('migrationStrategy')) {
            await executeWorkflowMutation({
                data: {
                    sessionId: pullType?.sessionId as string,
                    migrationStrategy: watch('migrationStrategy') as ArtifactApproachType,
                    workflowName:
                        watch('migrationStrategy') === ArtifactApproachType.CLONE ? watch('workflowName') : undefined,
                },
                workspaceId: params.wid as string,
                artifactPath: artifactPath as string,
                artifactVersion: artifactVersion as string,
            });
        }
    };

    const handleNext = async () => {
        if (isNewStrategy && currentStep === 1) {
            getEnvSpecificValueData();
            return;
        }

        if (watch('migrationStrategy') === ArtifactApproachType.OVERWRITE_EXISTING && currentStep === 1) {
            // fetch the workflow comparison cz we're moving into 2 step
            getWorkflowComparisonData();
            return;
        }

        if (isCloneStrategy && currentStep === 1) {
            const isWorkflowNameValid = await trigger('workflowName', { shouldFocus: true });
            if (!isWorkflowNameValid) {
                return;
            }
            // for clone we can directly move to configuration step cz there is no comparison needed, but we need to fetch env specific values in advance
            setEnvSpecificDataPostedSuccessfully(true);
            postExecuteData();
            setCurrentStep(4);
        }
        if (currentStep === 2) {
            // fetch env variables cz we're moving into 3 step
            getEnvSpecificValueData();
            return;
        }

        if (currentStep === 3) {
            postEnvSpecificValueData();
            setCurrentStep(4);
        }

        // handle final step first
        if (currentStep === 4) {
            // post do the deployment
            return;
        }
    };

    const handleBack = () => {
        // If CREATE_AS_NEW was used and we're coming back from step 3 → jump to step 1
        if (isNewStrategy && currentStep === 3) {
            setCurrentStep(1);
            return;
        }

        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onCancel = () => {
        const isSuccess = envSpecificDataPostedSuccessfully && workflowDeploymentExecutionSuccess;
        // resetting parent states
        setArtifactPath(null);
        setArtifactVersion(null);

        //
        setCurrentStep(1);
        reset({ configs: [], migrationStrategy: undefined, workflowName: undefined });
        setPullType(undefined);
        setWorkflowComparisonData(undefined);

        // resetting tracking states
        setPullTypeReceivedSuccessfully(false);
        setWorkflowComparisonReceivedSuccessfully(false);
        setEnvSpecificDataRetrievedSuccessfully(false);
        setEnvSpecificDataPostedSuccessfully(false);
        setWorkflowDeploymentExecutionSuccess(false);
        setPullTypeReceivedFailedMessage(undefined);

        setIsOpen(false);
        setValidating(false);
        setNameHistory([]);
        if (isSuccess) {
            refetch();
        }
    };

    const mapData = (data: WorkflowEnvConfigItemForm[]): WorkflowEnvConfigItemForm[] => {
        return data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            fields: item.fields.map((f: WorkflowEnvConfigFieldForm) => {
                const isEmptyFinalValue = !f.meta.finalValue || String(f.meta.finalValue).trim() === '';

                return {
                    name: f.name,
                    meta: {
                        // copy the meta object fully
                        ...f.meta,
                        initFinalValue: f.meta.finalValue,
                        finalValue: f.meta.finalValue ?? '',
                    } as FieldMeta,
                    readOnly: !isEmptyFinalValue, // default locked in UI
                };
            }),
            reference: item.reference,
        }));
    };

    useEffect(() => {
        if (artifactPath && artifactVersion && pullTypeReceivedSuccessfully === false && isOpen) {
            refetchWorkflowPullType();
        }
    }, [isOpen, artifactPath, artifactVersion, pullTypeReceivedSuccessfully, refetchWorkflowPullType]);

    return {
        hasError,
        control,
        watch,
        errors,
        trigger,
        reset,
        pullType,
        handleBack,
        handleNext,
        onCancel,
        wizardSteps,
        currentStep,
        setCurrentStep,
        workflowComparisonLoading,
        workflowEnvSpecificValuesLoading,
        pullTypeLoading,
        loadingSecrets,
        isValid,
        pullTypeReceivedFailedMessage,
        validating,
        validateWorkflowName,
    };
};
