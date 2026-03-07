import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import JsonEditor from '@/components/molecules/json-editor/json-editor';
import { Button } from '@/components';
import { Code, FileCode2, Sparkles } from 'lucide-react';
import {
    IDataLineageEvent,
    IDataLineageSessionExecution,
    IDataLineageStepExplanation,
    IDataLineageViewStep,
    IDataLineageVisualGraph,
} from '@/models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { Params } from 'next/dist/server/request/params';
import { LineageEventType, LineageStepExplanationType, SessionViewType } from '@/enums';
import ReactMarkdown from 'react-markdown';
import { lineageService } from '@/services';

interface IStepListProps {
    steps: IDataLineageViewStep[];
    graphData?: IDataLineageVisualGraph; // Reserved for future use
    selectedExecution: IDataLineageSessionExecution | undefined;
    onHandleTab: (tabName: string, stepIndex: number, type: SessionViewType, workflowId: string) => Promise<void>;
}

const StepPayloadCopy = ({ step }: { step: IDataLineageViewStep }) => {
    const [jsonCopied, setJsonCopied] = useState<boolean>(false);

    const handleCopy = () => {
        if (step?.payload) {
            const payload = JSON.stringify(step?.payload, null, 2);
            navigator.clipboard.writeText(payload);
            setJsonCopied(true);
            setTimeout(() => setJsonCopied(false), 2000);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                className="bg-blue-600 border border-blue-600 rounded flex items-center px-2 py-1 gap-x-2"
                onClick={() => handleCopy()}
            >
                <p className="text-xs font-semibold text-white">Copy</p>
            </button>
            {jsonCopied && (
                <div
                    className="absolute left-[-35px] transform -translate-x-1/2 bottom-[-3px] text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                    style={{ zIndex: 10 }}
                >
                    Copied!
                </div>
            )}
        </div>
    );
};

const ExportJson = ({
    step,
    params,
    selectedExecution,
}: {
    step: IDataLineageViewStep;
    params: Params;
    selectedExecution: IDataLineageSessionExecution | undefined;
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const { mutateAsync } = useMutation(
        async ({ data }: { data: IDataLineageEvent }) => await lineageService.events(params.wid as string, data),
        {
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error fetching lineage events:', error?.message);
                setLoading(false);
            },
        }
    );

    const handleExportJson = async (step: IDataLineageViewStep) => {
        if (!step?.payload) return;
        setLoading(true);

        await mutateAsync({
            data: {
                sessionId: selectedExecution?.sessionId as string,
                workflowId: selectedExecution?.workflowId as string,
                executionId: selectedExecution?.id as string,
                workspaceId: params.wid as string,
                eventType: LineageEventType.ExportJSON,
                workflowName: selectedExecution?.workflowName as string,
                stepNumber: step.stepIndex,
            },
        });

        const payload = JSON.stringify(step?.payload, null, 2);
        const blob = new Blob([payload], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const workflowName = selectedExecution?.workflowName ?? 'UnknownWorkflow';
        const fileName = `${workflowName}_Step-${step.stepIndex ?? 0}.json`;

        // expected: <Workflow Name>_<Session ID>_<Agent Name>.json
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        setLoading(false);
    };

    return (
        <button
            className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
            disabled={loading}
            onClick={() => handleExportJson(step)}
        >
            <FileCode2 size={16} className="text-gray-700 dark:text-gray-300" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {loading ? 'Exporting' : 'Export JSON'}
            </p>
        </button>
    );
};

const StepExplanation = ({
    step,
    params,
    selectedExecution,
}: {
    step: IDataLineageViewStep;
    params: Params;
    selectedExecution: IDataLineageSessionExecution | undefined;
}) => {
    const [generated, setGenerated] = useState<boolean>(false);
    const {
        mutate: mutateStepExplanation,
        isLoading: loadingStepExplanation,
        data: stepExplanation,
    } = useMutation(
        async ({ data }: { data: IDataLineageStepExplanation }) =>
            await lineageService.stepExplanation(
                params.wid as string,
                selectedExecution?.sessionId as string,
                selectedExecution?.id as string,
                data
            ),
        {
            onSuccess: () => {
                setGenerated(true);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error fetching step explanation:', error?.message);
            },
        }
    );

    const onStepExplanation = () => {
        if (step?.payload) {
            mutateStepExplanation({
                data: { payload: step?.payload, type: LineageStepExplanationType.MODULAR_VIEW_DATA },
            });
        }
    };

    return (
        <div className="p-3 flex flex-col gap-y-3">
            <p className="text-gray-700 dark:text-gray-100 font-semibold text-sm">Step Explanation</p>
            <div className="w-full flex flex-col gap-y-4 justify-center items-center">
                <Sparkles size={52} />
                <div className="flex flex-col gap-y-3 items-center">
                    <p className="text-sm text-gray-700 dark:text-gray-100 text-left max-w-[415px]">
                        {generated && !loadingStepExplanation && (
                            <ReactMarkdown>{stepExplanation?.content}</ReactMarkdown>
                        )}
                    </p>
                    {!generated && (
                        <button
                            className="bg-blue-600 border border-blue-600 rounded flex items-center px-2 py-1 gap-x-2 w-fit"
                            disabled={loadingStepExplanation}
                            onClick={onStepExplanation}
                        >
                            <p className="text-xs font-semibold text-white">
                                {loadingStepExplanation ? 'Generating' : 'Generate step explanation'}
                            </p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailView = ({
    stepIndex,
    onHandleTab,
    workflowId,
}: {
    stepIndex: number;
    onHandleTab: (tabName: string, stepIndex: number, type: SessionViewType, workflowId: string) => Promise<void>;
    workflowId: string;
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const onHandleTabView = async () => {
        setLoading(true);
        await onHandleTab(`Step ${stepIndex} execution breakdown`, stepIndex, SessionViewType.MODULAR, workflowId);
        setLoading(false);
    };

    return (
        <Button className="absolute top-[16px] right-[32px] z-[99999]" variant="link" onClick={onHandleTabView}>
            {loading ? 'Loading' : 'Detail view'}
        </Button>
    );
};

export const StepList = ({ steps, selectedExecution, onHandleTab, graphData }: IStepListProps) => {
    const params = useParams();

    console.log(graphData?.nodes.find(node => node.id === params.stepId));

    return (
        <>
            {steps?.length > 0 ? (
                <Accordion type="multiple">
                    {steps.map(step => {
                        return (
                            <AccordionItem className="relative" key={step.stepIndex} value={String(step.stepIndex)}>
                                <AccordionTrigger className="px-3 py-4 dark:bg-gray-800 flex items-center">
                                    <div className="flex w-full justify-between mr-1">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 no-underline">
                                            Step {step.stepIndex}
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <DetailView
                                    workflowId={selectedExecution?.workflowId as string}
                                    stepIndex={step.stepIndex}
                                    onHandleTab={onHandleTab}
                                />
                                <AccordionContent forceMount>
                                    <div>
                                        <div className="p-3 border-b dark:border-b-gray-700 flex flex-col gap-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-x-1">
                                                    <Code size={16} />
                                                    <p className="text-gray-700 dark:text-gray-100 font-semibold text-sm">
                                                        Raw data
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-x-2">
                                                    <StepPayloadCopy step={step} />
                                                    <ExportJson
                                                        step={step}
                                                        params={params}
                                                        selectedExecution={selectedExecution}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <JsonEditor
                                                    className="h-[200px]"
                                                    value={step.payload ? JSON.stringify(step.payload, null, 2) : ''}
                                                    readOnly={true}
                                                    hideFormatter={true}
                                                />
                                            </div>
                                        </div>
                                        <StepExplanation
                                            step={step}
                                            params={params}
                                            selectedExecution={selectedExecution}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            ) : (
                <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center h-[90%]">
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">No steps available</p>
                </div>
            )}
        </>
    );
};
