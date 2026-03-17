/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import {
    FieldMeta,
    IPullTypeIdentifierResponse,
    IWorkflowComparisonResponse,
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
import { useMutation, useQuery } from 'react-query';
import { PullingStep } from '@/app/workspace/[wid]/workflow-registry/components/pulling-step';
import { OptionModel } from '@/components';
import { useVaultQuery } from './use-common';
import { ArtifactApproachType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { mock_configurations } from '@/app/workspace/[wid]/workflow-registry/mock_data';
import { IntellisenseTools } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';

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
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    cleaned = cleaned.replaceAll(String.raw`\n`, '\n');
    cleaned = cleaned.replaceAll(String.raw`\"`, '"');
    cleaned = cleaned.replaceAll(String.raw`\\`, '\\');
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

    const [pullTypeReceivedSuccessfully, setPullTypeReceivedSuccessfully] = useState(false);
    const [pullTypeReceivedFailedMessage, setPullTypeReceivedFailedMessage] = useState<string | undefined>(undefined);
    const [workflowComparisonReceivedSuccessfully, setWorkflowComparisonReceivedSuccessfully] = useState(false);
    const [envSpecificDataRetrievedSuccessfully, setEnvSpecificDataRetrievedSuccessfully] = useState(false);
    const [envSpecificDataPostedSuccessfully, setEnvSpecificDataPostedSuccessfully] = useState(false);
    const [workflowDeploymentExecutionSuccess, setWorkflowDeploymentExecutionSuccess] = useState(false);
    const [validating, setValidating] = useState<boolean>(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [nameHistory, setNameHistory] = useState<WorkflowNameHistory[]>([]);

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

    const migrationStrategy = watch('migrationStrategy');

    const isNewStrategy = useMemo(() => {
        if (migrationStrategy === ArtifactApproachType.CREATE_AS_NEW) {
            return true;
        }
        return false;
    }, [migrationStrategy]);

    const isCloneStrategy = useMemo(() => {
        if (migrationStrategy === ArtifactApproachType.CLONE) {
            return true;
        }
        return false;
    }, [migrationStrategy]);

    const { refetch: refetchWorkflowPullType, isFetching: pullTypeLoading } = useQuery(
        ['mock_pull_type', artifactPath, artifactVersion],
        async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                sessionId: 'mock-session-' + Date.now(),
                migrationStrategies: [ArtifactApproachType.CREATE_AS_NEW, ArtifactApproachType.OVERWRITE_EXISTING],
                errors: []
            } as IPullTypeIdentifierResponse;
        },
        {
            enabled: false,
            retry: false,
            refetchOnWindowFocus: false,
            onSuccess: pullValidationResponse => {
                setPullType(pullValidationResponse);
                setValue('migrationStrategy', ArtifactApproachType.CREATE_AS_NEW);
                setPullTypeReceivedSuccessfully(true);
                if (pullValidationResponse?.errors && pullValidationResponse.errors.length > 0) {
                    setPullTypeReceivedFailedMessage(pullValidationResponse.errors[0]?.message || 'Validation failed');
                }
            },
            onError: (error: any) => {
                setPullTypeReceivedFailedMessage(error?.message || 'Failed to fetch pull type');
            },
        }
    );

    const { refetch: refetchWorkflowComparisonType, isFetching: workflowComparisonLoading } = useQuery(
        ['mock_workflow_diff', artifactPath, artifactVersion],
        async () => {
             await new Promise(resolve => setTimeout(resolve, 500));
             return {
                 comparisonOutput: '### Mock Diff\n- Changed agent prompt\n- Added new variable',
                 currentPublishGraph: { nodes: [], edges: [] },
                 incomingPublishGraph: { nodes: [], edges: [] }
             };
        },
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setWorkflowComparisonData({
                    comparisonOutput: sanitizeMarkdownString(data.comparisonOutput),
                    currentPublishGraph: JSON.stringify(data.currentPublishGraph, null, 2),
                    incomingPublishGraph: JSON.stringify(data.incomingPublishGraph, null, 2),
                });
                setWorkflowComparisonReceivedSuccessfully(true);
                setCurrentStep(2);
            },
        }
    );

    const { refetch: refetchWorkflowEnvSpecificValues, isFetching: workflowEnvSpecificValuesLoading } = useQuery(
        ['mock_workflow_configs', artifactPath, artifactVersion],
        async () => {
             await new Promise(resolve => setTimeout(resolve, 500));
             return mock_configurations as WorkflowEnvConfigItemForm[];
        },
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                const mappedData = mapData(data);
                setValue('configs', mappedData);
                trigger('configs').then(() => {
                    setEnvSpecificDataRetrievedSuccessfully(true);
                    setCurrentStep(3);
                });
            },
        }
    );

    const { isLoading: workflowEnvSpecificValuesPostLoading, mutateAsync: mutateEnvSpecificData } = useMutation(
        async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setEnvSpecificDataPostedSuccessfully(true);
        }
    );

    const { isLoading: workflowDeploymentExecutionLoading, mutateAsync: executeWorkflowMutation } = useMutation(
        async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            setWorkflowDeploymentExecutionSuccess(true);
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

    // Intellisense Fetching (Mocked)
    const { data: allIntellisense } = useQuery(
        'mock_intellisense',
        async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return {
                agents: { shared: [{ name: 'Math Tutor' }, { name: 'Coder' }] },
                api: { shared: [{ name: 'Google Search' }, { name: 'Weather API' }] },
                variables: { shared: [{ name: 'user_id' }, { name: 'session_token' }] },
                mcp: { shared: [{ name: 'Tool A' }] },
                rag: { shared: [{ name: 'Doc Search' }] },
                graphRag: { shared: [{ name: 'Graph Search' }] },
                connectors: { shared: [{ name: 'Postgres' }] },
                executableFunction: { shared: [{ name: 'Format JSON' }] },
            };
        }
    );

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense) return [];

        const mapToOptions = (items: any[], tool: string) => 
            items?.filter(i => i.name).map(i => ({ label: i.name, value: `${tool}:${i.name}` })) || [];

        return [
            { name: 'Agents', options: mapToOptions(allIntellisense.agents?.shared, IntellisenseTools.Agent) },
            { name: 'APIs', options: mapToOptions(allIntellisense.api?.shared, IntellisenseTools.API) },
            { name: 'Variables', options: mapToOptions(allIntellisense.variables?.shared, IntellisenseTools.Variable) },
            { name: 'MCPs', options: mapToOptions(allIntellisense.mcp?.shared, IntellisenseTools.MCP) },
            { name: 'Vector RAGs', options: mapToOptions(allIntellisense.rag?.shared, IntellisenseTools.VectorRAG) },
            { name: 'Graph RAGs', options: mapToOptions(allIntellisense.graphRag?.shared, IntellisenseTools.GraphRAG) },
            { name: 'Database Connectors', options: mapToOptions(allIntellisense.connectors?.shared, IntellisenseTools.DatabaseConnector) },
            { name: 'Executable Functions', options: mapToOptions(allIntellisense.executableFunction?.shared, IntellisenseTools.ExecutableFunction) },
        ];
    }, [allIntellisense]);

    const validateWorkflowName = async (value: string) => {
        if (value) {
            if (value.startsWith(' ')) return 'No leading spaces in workflow name';
            if (value.endsWith(' ')) return 'No trailing spaces in workflow name';

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

    const validateWorkspaceNameByFetch = (value: string) => {
        setValidating(true);
        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(async () => {
            const isAvailable = value.toLowerCase() !== 'taken';
            setNameHistory(prev => [...prev, { name: value.trim(), isDirty: !isAvailable }]);
            if (!isAvailable) {
                setError('workflowName', { type: 'manual', message: `Workflow '${value}' already exists` });
            } else {
                clearErrors('workflowName');
            }
            setValidating(false);
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
                    migrationStrategy={migrationStrategy}
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
                    intellisenseOptions={intellisenseOptions}
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
            refetchWorkflowComparisonType();
        } else {
            setCurrentStep(2);
        }
    };

    const getEnvSpecificValueData = () => {
        if (envSpecificDataRetrievedSuccessfully === false) {
            refetchWorkflowEnvSpecificValues();
        } else {
            setCurrentStep(3);
        }
    };

    const postEnvSpecificValueData = async () => {
        await mutateEnvSpecificData();
        await postExecuteData();
    };

    const postExecuteData = async () => {
        if (watch('migrationStrategy')) {
            await executeWorkflowMutation();
        }
    };

    const handleNext = async () => {
        if (isNewStrategy && currentStep === 1) {
            getEnvSpecificValueData();
            return;
        }

        if (watch('migrationStrategy') === ArtifactApproachType.OVERWRITE_EXISTING && currentStep === 1) {
            getWorkflowComparisonData();
            return;
        }

        if (isCloneStrategy && currentStep === 1) {
            const isWorkflowNameValid = await trigger('workflowName', { shouldFocus: true });
            if (!isWorkflowNameValid) return;
            setEnvSpecificDataPostedSuccessfully(true);
            postExecuteData();
            setCurrentStep(4);
        }
        if (currentStep === 2) {
            getEnvSpecificValueData();
            return;
        }

        if (currentStep === 3) {
            postEnvSpecificValueData();
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (isNewStrategy && currentStep === 3) {
            setCurrentStep(1);
            return;
        }
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const onCancel = () => {
        const isSuccess = envSpecificDataPostedSuccessfully && workflowDeploymentExecutionSuccess;
        setArtifactPath(null);
        setArtifactVersion(null);
        setCurrentStep(1);
        reset({ configs: [], migrationStrategy: undefined, workflowName: undefined });
        setPullType(undefined);
        setWorkflowComparisonData(undefined);
        setPullTypeReceivedSuccessfully(false);
        setWorkflowComparisonReceivedSuccessfully(false);
        setEnvSpecificDataRetrievedSuccessfully(false);
        setEnvSpecificDataPostedSuccessfully(false);
        setWorkflowDeploymentExecutionSuccess(false);
        setPullTypeReceivedFailedMessage(undefined);
        setIsOpen(false);
        setValidating(false);
        setNameHistory([]);
        if (isSuccess) refetch();
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
                        ...f.meta,
                        initFinalValue: f.meta.finalValue,
                        finalValue: f.meta.finalValue ?? '',
                    } as FieldMeta,
                    readOnly: !isEmptyFinalValue,
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
        intellisenseOptions,
    };
};


