import { WorkflowAuthoringData } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/workflow-authoring-table-container';
import { ActivityProps, DashboardDataCardProps } from '@/components';
import { ISharedItem, IWorkflowAuthoringForm, IWorkflowLimit, Workflow, WorkFlowMessageExecute } from '@/models';
import { $fetch, FetchError, logger } from '@/utils';
import { Coins, Database, Disc } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQuery } from 'react-query';
import config from '@/config/environment-variables';
import { useForm } from 'react-hook-form';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { promptService } from '@/services';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Triggered',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Credits Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: Database,
        showTrendIcon: false,
    },
    {
        title: 'Most credit consumed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Highest Tokens Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Coins,
        TrendIcon: Database,
        showTrendIcon: false,
    },
    {
        title: 'Highest processing time',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Executed Most in Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Disc,
        TrendIcon: Database,
        showTrendIcon: false,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Workflow Execution',
        description: 'Workflow Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Amber,
    },
    {
        title: 'API Execution',
        description: 'API Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'LLM Execution',
        description: 'LLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export const mockTagNames = [
    {
        label: 'Workflow Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'executed', label: 'Executed' },
            { value: 'inprogress', label: 'In Progress' },
        ],
    },
    {
        label: 'Domain Tags',
        options: [
            { value: 'finance', label: 'Finance' },
            { value: 'hr', label: 'HR' },
            { value: 'user_management', label: 'User Management' },
        ],
    },
    {
        label: 'Author Role',
        options: [
            { value: 'sales_manager', label: 'Sales Manager' },
            { value: 'customer_support', label: 'Customer Support' },
            { value: 'devops', label: 'DevOps' },
        ],
    },
];

const MOCK_WORKFLOW_LIMIT: IWorkflowLimit = { workflowLimit: 10 };

const MOCK_WORKFLOWS: Workflow[] = [
    {
        id: 'mock-wf-1',
        name: 'Customer Support Flow',
        description: 'Handles support queries and escalations',
        tags: {
            list: [
                { value: 'published', label: 'Published' },
                { value: 'customer_support', label: 'Customer Support' },
            ],
        },
    },
    {
        id: 'mock-wf-2',
        name: 'Lead Generation',
        description: 'Automates lead capture and qualification',
        tags: {
            list: [
                { value: 'draft', label: 'Draft' },
                { value: 'sales_manager', label: 'Sales Manager' },
            ],
        },
    },
];

export const useWorkflowAuthoring = () => {
    const [workspaceDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [workflowAuthoringTableData, setWorkflowAuthoringTableData] = useState<WorkflowAuthoringData[]>([]);
    const [workflowAuthoring, setWorkflowAuthoring] = useState<WorkflowAuthoringData[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<IWorkflowAuthoringForm>({
        mode: 'all',
    });

    const mapAllWorkflows = (arr: Workflow[]) => {
        const data = arr?.map((x: Workflow) => ({
            id: x.id as string,
            workflowName: x.name,
            description: x.description,
            workflowTags: x.tags?.list?.map(tag => tag.label).join(', '),
            workflowUrl: `${config.CHAT_BOT_URL}/workflows/execute`,
            options: x.tags?.list,
            isReadOnly: x?.isReadOnly,
        }));
        setWorkflowAuthoringTableData(data);
        setWorkflowAuthoring(data);
    };

    useEffect(() => {
        const stored = localStorage.getItem('mock_workflows');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                mapAllWorkflows(parsed);
            } catch {
                mapAllWorkflows(MOCK_WORKFLOWS);
            }
        } else {
            mapAllWorkflows(MOCK_WORKFLOWS);
        }
    }, []);

    const saveToLocalStorage = (data: Workflow[]) => {
        localStorage.setItem('mock_workflows', JSON.stringify(data));
        mapAllWorkflows(data);
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                options: [],
                description: '',
                name: '',
                isReadOnly: undefined,
            });
        }
    }, [isOpen, reset]);

    const workflowLimitation = MOCK_WORKFLOW_LIMIT;
    const isWorkflowLimitFetching = false;
    const isWorkflowLimitLoading = false;

    const workflowQuota = useMemo(() => {
        if (workflowLimitation) {
            return `${workflowAuthoringTableData?.length} of ${workflowLimitation.workflowLimit} workflows used`;
        }
        return undefined;
    }, [workflowAuthoringTableData]);

    const hasQuota = useMemo(() => {
        return (workflowLimitation?.workflowLimit ?? 0) > workflowAuthoringTableData?.length;
    }, [workflowAuthoringTableData]);

    const creating = false;
    const mutateCreate = (data: Workflow) => {
        const newWorkflow = { ...data, id: Math.random().toString(36).substring(2, 11) };
        const updated = [
            ...workflowAuthoring.map(x => ({
                id: x.id,
                name: x.workflowName,
                description: x.description,
                tags: { list: x.options ?? [] },
                isReadOnly: x.isReadOnly,
            })),
            newWorkflow,
        ];
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Workflow saved successfully (Mock)');
    };

    const updating = false;
    const mutateUpdate = ({ data, id }: { data: Workflow; id: string }) => {
        const updated = workflowAuthoring.map(x => {
            if (x.id === id) {
                return { ...data, id };
            }
            return {
                id: x.id,
                name: x.workflowName,
                description: x.description,
                tags: { list: x.options ?? [] },
                isReadOnly: x.isReadOnly,
            };
        });
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Workflow updated successfully (Mock)');
    };

    const mutateDeleteWorkflow = ({ id }: { id: string }) => {
        const updated = workflowAuthoring
            .filter(x => x.id !== id)
            .map(x => ({
                id: x.id,
                name: x.workflowName,
                description: x.description,
                tags: { list: x.options ?? [] },
                isReadOnly: x.isReadOnly,
            }));
        saveToLocalStorage(updated);
        toast.success('Workflow deleted successfully (Mock)');
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = workflowAuthoringTableData.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('description', obj.description);
                setValue('name', obj.workflowName);
                setValue('isReadOnly', obj?.isReadOnly);
                if (obj.options) {
                    setValue('options', obj.options);
                }
            }
        }
    };

    const isFetching = false;
    const isLoading = false;

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onHandleSubmit = (data: IWorkflowAuthoringForm) => {
        try {
            const body: Workflow = {
                name: data.name,
                description: data.description,
                tags: { list: data.options },
            };
            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your Workflow");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onWorkflowAuthoringFilter = (filter: WorkflowAuthoringData | null) => {
        let result = workflowAuthoring;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x.workflowName.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.workflowName)) {
            result = result.filter(x => x.workflowName.toLowerCase() === filter?.workflowName.toLowerCase());
        }
        if (filter?.options && filter?.options?.length > 0) {
            const filterLabels = filter.options.map(item => item.label);
            result = result.filter(item => item?.options?.some(option => filterLabels.includes(option.label)));
        }
        if (!isNullOrEmpty(filter?.workflowUrl)) {
            result = result.filter(x => x.workflowUrl.toLowerCase() === filter?.workflowUrl.toLowerCase());
        }

        setWorkflowAuthoringTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteWorkflow({ id });
        }
    };

    const handleConfigApiKeyFetch = async (workspaceId: string, workFlowId: string) => {
        logger.log('Mock fetchWorkflowApiKey called');
        return { apikey: 'mock-api-key' };
    };

    const handleWorkFlowExecute = async (data: WorkFlowMessageExecute, workspaceId: string) => {
        logger.log('Mock fetchWorkflowExecuteMessage called');
        return new Response('Mock workflow execution response');
    };

    const loadingVariables = false;
    const variables: ISharedItem[] = [];

    const onWorkFlowConfigModel = (id: string) => {
        logger.log('Mock onWorkFlowConfigModel called', id);
    };

    return {
        workspaceDataCardInfo,
        activityData,
        workflowAuthoringTableData,
        isFetching,
        isLoading,
        tagNames: mockTagNames,
        control,
        errors,
        isOpen,
        isValid,
        isSaving: creating || updating,
        workflowQuota,
        hasQuota,
        loadingVariables,
        variables,
        bottomRef: ref,
        onWorkflowAuthoringFilter,
        register,
        watch,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onEdit,
        onDelete,
        handleConfigApiKeyFetch,
        handleWorkFlowExecute,
        onWorkFlowConfigModel,
        setValue,
    };
};
