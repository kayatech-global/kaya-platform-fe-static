import { StepDetailsPanelProps } from '@/app/workspace/[wid]/data-lineage/components/step-details-panel';
import { LineageEventType, LineageStepExplanationType, SessionViewType } from '@/enums';
import {
    IDataLineageEvent,
    IDataLineageLinear,
    IDataLineageStepExplanation,
    IDataLineageViewStep,
    IDataLineageSubStep,
    IDataLineageStep,
} from '@/models';
import { Edge, Node } from '@xyflow/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'sonner';

interface DataLineageStepProps {
    stepDetailsPanelProps: StepDetailsPanelProps;
    explanationType: LineageStepExplanationType;
}

export const useDataLineageStep = ({ stepDetailsPanelProps, explanationType }: DataLineageStepProps) => {
    const params = useParams();
    const { activeTab, selectedNode, steps, selectedExecution, handleAddTab } = stepDetailsPanelProps;
    const [modularViewSteps, setModularViewSteps] = useState<IDataLineageViewStep[]>([]);
    const [linearViewStep, setLinearViewStep] = useState<IDataLineageLinear>();
    const [detailViewStep, setDetailViewStep] = useState<IDataLineageSubStep>();
    const [jsonCopied, setJsonCopied] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [generated, setGenerated] = useState<boolean>(false);

    useEffect(() => {
        if (activeTab === SessionViewType.LINEAR && selectedNode) {
            setGenerated(false);
            setJsonCopied(false);
            setLoading(false);
            setLinearViewStep(selectedNode.data as unknown as IDataLineageLinear);
        }
    }, [activeTab, steps, selectedNode]);

    useEffect(() => {
        if (activeTab === SessionViewType.MODULAR && selectedNode) {
            setModularViewSteps(steps?.filter(x => x.agentId === selectedNode?.id) ?? []);
        }
    }, [activeTab, steps, selectedNode]);

    useEffect(() => {
        if (activeTab && activeTab.includes('detail-') && selectedNode) {
            setDetailViewStep(selectedNode.data as unknown as IDataLineageSubStep);
        }
    }, [activeTab, steps, selectedNode]);

    const { mutateAsync } = useMutation(
        async (_data: { data: IDataLineageEvent }) => {
            if (_data) return;
        },
        {
            onError: (error: Error) => {
                toast.error(error?.message);
                setLoading(false);
            },
        }
    );

    const {
        mutate: mutateStepExplanation,
        isLoading: loadingStepExplanation,
        data: stepExplanation,
    } = useMutation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (_: { data: IDataLineageStepExplanation }) => {
            return { content: 'Mocked explanation for this step.' } as IDataLineageStepExplanation;
        },
        {
            onSuccess: () => {
                setGenerated(true);
            },
            onError: (error: Error) => {
                toast.error(error?.message);
            },
        }
    );

    const { mutateAsync: mutateStepView, isLoading: loadingStepView } = useMutation(
        async (variables: { stepIndex: number; type: SessionViewType; workflowId: string }) => {
            return { stepIndex: variables.stepIndex, substeps: [] } as unknown as IDataLineageStep;
        },
        {
            onSuccess: () => {
                setGenerated(true);
            },
            onError: (error: Error) => {
                toast.error(error?.message);
            },
        }
    );

    const handleExportJson = async () => {
        // Early returns for invalid states
        if (activeTab === SessionViewType.LINEAR && !linearViewStep?.payload) return;
        if (activeTab?.includes('detail-') && !detailViewStep?.payload) return;

        setLoading(true);

        // Extract data based on active tab
        const isLinearView = activeTab === SessionViewType.LINEAR;
        const stepData = isLinearView ? linearViewStep : detailViewStep;
        const payload = stepData?.payload as IDataLineageViewStep['payload'];

        const stepIndex = isLinearView
            ? (linearViewStep?.stepIndex as number)
            : (detailViewStep?.substepIndex as number);

        // Track export event
        await mutateAsync({
            data: {
                sessionId: selectedExecution?.sessionId as string,
                workflowId: selectedExecution?.workflowId as string,
                executionId: selectedExecution?.id as string,
                workspaceId: params.wid as string,
                eventType: LineageEventType.ExportJSON,
                workflowName: selectedExecution?.workflowName as string,
                stepNumber: stepIndex,
                // add substep number if it is a substep
                substepNumber: detailViewStep?.substepIndex || undefined,
            },
        });

        // Create and download file
        const fileName =
            [
                selectedExecution?.workflowName || 'UnknownWorkflow',
                `Step-${stepIndex || 0}${
                    isLinearView ? '' : `.${detailViewStep?.substepIndex || 0}_DetailView`
                }`.trim(),
            ].join('_') + '.json';

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        setLoading(false);
    };

    const handleCopy = () => {
        if (activeTab === SessionViewType.LINEAR && linearViewStep?.payload) {
            const payload = JSON.stringify(linearViewStep?.payload);
            navigator.clipboard.writeText(payload);
            setJsonCopied(true);
            setTimeout(() => setJsonCopied(false), 2000);
        } else if (activeTab && activeTab.includes('detail-') && detailViewStep?.payload) {
            const payload = JSON.stringify(detailViewStep?.payload);
            navigator.clipboard.writeText(payload);
            setJsonCopied(true);
            setTimeout(() => setJsonCopied(false), 2000);
        }
    };

    const onStepExplanation = () => {
        if (linearViewStep?.payload) {
            mutateStepExplanation({
                data: { payload: linearViewStep?.payload, type: explanationType },
            });
        }
    };

    const onHandleTab = async (tabName: string, stepIndex: number, type: SessionViewType, workflowId: string) => {
        const data = await mutateStepView({ stepIndex, type, workflowId });
        if (data && data?.substeps?.length > 0) {
            const { nodes, edges } = data.substeps.reduce(
                (acc: { nodes: Node[]; edges: Edge[] }, graph: IDataLineageSubStep, index: number) => {
                    const node: Node = {
                        id: `detail_node_${index}`,
                        type: graph.substepType,
                        data: {
                            name: graph.substepName,
                            type: graph.substepType,
                            ...graph,
                        },
                        measured: {
                            width: 88,
                            height: 114,
                        },
                        position: {
                            x: 475 + index * 350,
                            y: 280,
                        },
                    };

                    if (index > 0) {
                        const edge: Edge = {
                            id: `detail_edge_${index}`,
                            type: 'smoothstep',
                            source: `detail_node_${index - 1}`,
                            target: `detail_node_${index}`,
                            animated: true,
                        };
                        acc.edges.push(edge);
                    }

                    acc.nodes.push(node);
                    return acc;
                },
                { nodes: [] as Node[], edges: [] as Edge[] }
            );
            console.log('nodes', nodes);
            console.log('adding new tab');
            handleAddTab(tabName, { nodes, edges, variables: undefined });
        } else {
            console.log('adding new tab');
            handleAddTab(tabName, undefined);
        }
    };

    return {
        modularViewSteps,
        linearViewStep,
        detailViewStep,
        loadingStepView,
        jsonCopied,
        loading,
        generated,
        loadingStepExplanation,
        stepExplanation,
        onHandleTab,
        onStepExplanation,
        handleCopy,
        handleExportJson,
    };
};
