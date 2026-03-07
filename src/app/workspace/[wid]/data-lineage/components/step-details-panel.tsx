import React, { useEffect, useRef, useState } from 'react';
import type { Node as XYNode } from '@xyflow/react';
import { StepList } from './step-list';
import { Code, FileCode2, Sparkles } from 'lucide-react';
import JsonEditor from '@/components/molecules/json-editor/json-editor';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { LineageStepExplanationType, SessionViewType } from '@/enums';
import { IDataLineageSessionExecution, IDataLineageViewStep, IDataLineageVisualGraph } from '@/models';
import { useDataLineageStep } from '@/hooks/use-data-lineage-step';
import ReactMarkdown from 'react-markdown';

export interface StepDetailsPanelProps {
    readonly selectedNode?: XYNode;
    readonly steps: ReadonlyArray<IDataLineageViewStep>;
    readonly graphData?: IDataLineageVisualGraph;
    readonly activeTab: SessionViewType | string;
    readonly selectedExecution: IDataLineageSessionExecution | undefined;
    readonly handleAddTab: (tabName: string, content: IDataLineageVisualGraph | undefined) => void;
    readonly workflowId?: string;
}

function computeEditorHeight(containerRef: React.RefObject<HTMLDivElement | null>): number {
    if (!containerRef.current) return 200;
    const maxHeight = containerRef.current.clientHeight - 130;
    return maxHeight > 0 ? maxHeight : 200;
}

interface RawDataAndExplanationProps {
    readonly activeTab: SessionViewType | string;
    readonly linearViewStep: { payload?: unknown } | undefined;
    readonly detailViewStep: { payload?: unknown } | undefined;
    readonly height: number;
    readonly jsonCopied: boolean;
    readonly loading: boolean;
    readonly generated: boolean;
    readonly loadingStepExplanation: boolean;
    readonly stepExplanation: { content?: string } | undefined;
    readonly onCopy: () => void;
    readonly onExportJson: () => void;
    readonly onStepExplanation: () => void;
}

function RawDataAndExplanation({
    activeTab,
    linearViewStep,
    detailViewStep,
    height,
    jsonCopied,
    loading,
    generated,
    loadingStepExplanation,
    stepExplanation,
    onCopy,
    onExportJson,
    onStepExplanation,
}: RawDataAndExplanationProps) {
    const isLinear = activeTab === SessionViewType.LINEAR;
    return (
        <div>
            <div className="p-3 border-b dark:border-b-gray-700 flex flex-col gap-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-1">
                        <Code size={16} />
                        <p className="text-gray-700 dark:text-gray-100 font-semibold text-sm">Raw data</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <div className="relative inline-block">
                            <button
                                className="bg-blue-600 border border-blue-600 rounded flex items-center px-2 py-1 gap-x-2"
                                onClick={() => onCopy()}
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
                        <button
                            onClick={onExportJson}
                            disabled={loading}
                            className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
                        >
                            <FileCode2 size={16} className="text-gray-700 dark:text-gray-300" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                {loading ? 'Exporting' : 'Export JSON'}
                            </p>
                        </button>
                    </div>
                </div>
                <div>
                    {isLinear ? (
                        <JsonEditor
                            className="h-[200px]"
                            value={linearViewStep?.payload ? JSON.stringify(linearViewStep?.payload, null, 2) : ''}
                            readOnly={true}
                            hideFormatter={true}
                        />
                    ) : (
                        <JsonEditor
                            value={detailViewStep?.payload ? JSON.stringify(detailViewStep?.payload, null, 2) : ''}
                            readOnly={true}
                            hideFormatter={true}
                            maxHeight={height}
                            isAutoHeight={true}
                        />
                    )}
                </div>
            </div>
            <div className={cn('p-3 flex flex-col gap-y-3', { hidden: activeTab !== 'linear' })}>
                <p className="text-gray-700 dark:text-gray-100 font-semibold text-sm">Step Explanation</p>
                <div className="w-full flex flex-col gap-y-4 justify-center items-center">
                    <Sparkles size={52} />
                    <div className="flex flex-col gap-y-3 items-center">
                        <p className="text-sm text-gray-700 dark:text-gray-100 text-center max-w-[415px]">
                            {generated && !loadingStepExplanation ? (
                                <ReactMarkdown>{stepExplanation?.content}</ReactMarkdown>
                            ) : (
                                'Get an explanation of what this step does and how it processes the data.'
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
        </div>
    );
}

export const StepDetailsPanel = (props: StepDetailsPanelProps) => {
    const { activeTab, graphData, selectedExecution, workflowId, selectedNode, steps, handleAddTab } = props;
    const {
        linearViewStep,
        modularViewSteps,
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
    } = useDataLineageStep({
        stepDetailsPanelProps: props,
        explanationType: LineageStepExplanationType.LINEAR_VIEW_DATA,
    });
    const divRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(200);

    useEffect(() => {
        setHeight(computeEditorHeight(divRef));
    }, [divRef]);

    console.log(selectedNode, steps, handleAddTab);

    return (
        <div ref={divRef} className="!w-[600px] h-full bg-white dark:bg-gray-900 overflow-y-auto z-[99]">
            <div className="p-3 border-b border-b-gray-700 flex items-center justify-between">
                <p className="text-gray-700 dark:text-gray-100 font-semibold text-md">Agent Info</p>
                {activeTab === SessionViewType.LINEAR && (
                    <Button
                        variant="link"
                        onClick={() =>
                            onHandleTab(
                                `Step ${linearViewStep?.stepIndex} execution breakdown`,
                                linearViewStep?.stepIndex ?? 0,
                                SessionViewType.LINEAR,
                                workflowId as string
                            )
                        }
                    >
                        {loadingStepView ? 'Loading' : 'Detail view'}
                    </Button>
                )}
            </div>
            {activeTab === SessionViewType.MODULAR ? (
                <StepList
                    steps={modularViewSteps}
                    graphData={graphData}
                    selectedExecution={selectedExecution}
                    onHandleTab={onHandleTab}
                />
            ) : (
                <RawDataAndExplanation
                    activeTab={activeTab}
                    linearViewStep={linearViewStep}
                    detailViewStep={detailViewStep}
                    height={height}
                    jsonCopied={jsonCopied}
                    loading={loading}
                    generated={generated}
                    loadingStepExplanation={loadingStepExplanation}
                    stepExplanation={stepExplanation}
                    onCopy={handleCopy}
                    onExportJson={handleExportJson}
                    onStepExplanation={onStepExplanation}
                />
            )}
        </div>
    );
};
