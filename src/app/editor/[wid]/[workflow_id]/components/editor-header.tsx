'use client';
import { WorkflowConfigurationModel } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/workflow-config-model';
import { useDnD } from '@/context';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { GuardrailSelector } from './guardrail-selector';
import { useGuardrail } from '@/hooks/use-common';
import { GuardrailBindingLevelType } from '@/enums';
import { ReleaseManagementContainer } from './release-management-container';
import { EditorSaveContainer } from './editor-save-container/editor-save-container';
import { Edge, Node } from '@xyflow/react';
import { IWorkflowTypes } from '@/models';
import { AvatarConfigurationFormContainer } from '@/app/editor/[wid]/[workflow_id]/components/avatar-configuration-form-container';
import { GuardrailsButtonWrapper } from './guardrails-button-wrapper';
import { useAvatarConfiguration } from '@/hooks/use-avatar-configuration';
import { VoiceWorkflowPlayground } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/voice-workflow-playground';
import { RuntimeSelector } from './runtime-selector';

interface EditorHeaderProps {
    isReadOnly?: boolean;
    isLoading: boolean;
    handleSave: () => Promise<void>;
    handleReset: () => void;
    refetchGuardrailBinding: () => void;
    version?: string;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    nodes?: Node[];
    edges?: Edge[];
    initialSnapshot: {
        nodes: Node[];
        edges: Edge[];
    } | null;
    hasChanges: boolean;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
    canUndo?: boolean;
    canRedo?: boolean;
    handleUndo?: () => void;
    handleRedo?: () => void;
}

export const EditorHeader = ({
    handleSave,
    handleReset,
    refetchGuardrailBinding,
    isLoading,
    isReadOnly,
    version,
    refetchGraph,
    isDraft,
    availableVersions,
    nodes,
    edges,
    initialSnapshot,
    hasChanges,
    setHasChanges,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
}: EditorHeaderProps) => {
    const params = useParams();
    const { workflowVariables, isVoiceWorkflow } = useDnD();
    const [openTextPlayground, setOpenTextPlayground] = useState(false);
    const [openVoicePlayground, setOpenVoicePlayground] = useState(false);
    const { guardrailRef, guardrails, guardrailsLoading, onGuardrail, onRefetch, onWorkflowGuardrailsChange } =
        useGuardrail();
    const [videoMode, setVideoMode] = useState(false);

    const [headerNode, setHeaderNode] = useState<HTMLDivElement | null>(null);
    const [isButtonBreakpointReach, setIsButtonBreakpointReach] = useState(false);

    console.log(videoMode);

    useEffect(() => {
        if (!headerNode) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                setIsButtonBreakpointReach(width <= 750);
            }
        });

        resizeObserver.observe(headerNode);

        return () => {
            resizeObserver.disconnect();
        };
    }, [headerNode]);
    const [openAvatarForm, setOpenAvatarForm] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { allAvatarConfiguration, isFetching } = useAvatarConfiguration();

    // On first load, enable video mode if allAvatarConfiguration is not empty
    useEffect(() => {
        if (isFirstLoad && !isFetching && allAvatarConfiguration.length > 0) {
            setVideoMode(true);
            setIsFirstLoad(false);
        } else if (isFirstLoad && !isFetching) {
            setIsFirstLoad(false);
        }
    }, [allAvatarConfiguration, isFetching, isFirstLoad]);

    const onGuardrailsChange = async (data: string[] | undefined) => {
        await onWorkflowGuardrailsChange(data);
        refetchGuardrailBinding();
    };

    // Open correct playground based on workflow type
    const handlePlaygroundOpen = () => {
        if (isVoiceWorkflow) {
            setOpenVoicePlayground(true);
        } else {
            setOpenTextPlayground(true);
        }
    };

    return (
        <React.Fragment>
            <div ref={setHeaderNode} className="absolute w-full z-10 p-2 flex justify-between items-center">
                <div className="flex items-center">
                    {/* Main primary button */}
                    <div className="flex items-center gap-x-2">
                        <EditorSaveContainer
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                            handleSave={handleSave}
                            nodes={nodes}
                            edges={edges}
                            initialSnapshot={initialSnapshot}
                            hasChanges={hasChanges}
                            setHasChanges={setHasChanges}
                        />
                        <button
                            className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
                            onClick={() => handleReset()}
                        >
                            <i className="ri-history-line text-xs text-gray-700 dark:text-gray-300" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reset</p>
                        </button>
                        {/* Undo Button */}
                        <button
                            className={`bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2 ${
                                !canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={handleUndo}
                            disabled={!canUndo}
                            title="Undo (Ctrl+Z)"
                        >
                            <i className="ri-arrow-go-back-line text-xs text-gray-700 dark:text-gray-300" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Undo</p>
                        </button>
                        {/* Redo Button */}
                        <button
                            className={`bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2 ${
                                !canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={handleRedo}
                            disabled={!canRedo}
                            title="Redo (Ctrl+Shift+Z)"
                        >
                            <i className="ri-arrow-go-forward-line text-xs text-gray-700 dark:text-gray-300" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Redo</p>
                        </button>
                    </div>
                    <hr aria-orientation="vertical" className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 border-0" />
                    <ReleaseManagementContainer
                        refetchGraph={refetchGraph}
                        version={version}
                        isDraft={isDraft}
                        availableVersions={availableVersions}
                        isLoading={isLoading}
                        hasChanges={hasChanges}
                        isButtonBreakpointReach={isButtonBreakpointReach}
                        nodes={nodes}
                        edges={edges}
                        GuardrailsButtonWrapper={
                            <GuardrailsButtonWrapper
                                onGuardrail={onGuardrail}
                                isReadOnly={isReadOnly}
                                supportDropdown={true}
                            />
                        }
                    />
                </div>

                <div className="flex items-center gap-x-2">
                    {/* Runtime Selector */}
                    <RuntimeSelector />
                    <hr aria-orientation="vertical" className="h-6 w-px bg-gray-200 dark:bg-gray-700 border-0" />
                    <button
                        className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
                        onClick={() => setOpenAvatarForm(true)}
                    >
                        <i className="ri-video-ai-line text-xs text-gray-700 dark:text-gray-300" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Media Stream Setup</p>
                    </button>
                    {!isButtonBreakpointReach && (
                        <GuardrailsButtonWrapper onGuardrail={onGuardrail} isReadOnly={isReadOnly} />
                    )}
                    <button
                        className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
                        onClick={handlePlaygroundOpen}
                    >
                        <i className="ri-flask-line text-xs text-gray-700 dark:text-gray-300" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Playground</p>
                    </button>
                </div>
            </div>
            <AvatarConfigurationFormContainer
                openAvatarConfigForm={openAvatarForm}
                setOpenAvatarConfigForm={setOpenAvatarForm}
                setVideoModeSwitch={setVideoMode}
            />

            {/* Text Workflow Playground */}
            <WorkflowConfigurationModel
                workFlowId={params.workflow_id as string}
                openWorkFlowConfigModel={openTextPlayground}
                variables={workflowVariables}
                setOpenWorkFlowConfigModel={setOpenTextPlayground}
                availableVersions={availableVersions}
                isDraft={isDraft}
            />

            {/* Voice Workflow Playground */}
            <VoiceWorkflowPlayground
                openVoiceWorkflowPlayground={openVoicePlayground}
                setOpenVoiceWorkflowPlayground={setOpenVoicePlayground}
                workFlowId={params.workflow_id as string}
            />
            {/* <CompareConfig
                isEditor={true}
                open={compareOpen}
                setOpen={setCompareOpen}
                sourcePackageName={workflowName.replaceAll(' ', '-').toLowerCase()}
                targetPackageName={workflowName.replaceAll(' ', '-').toLowerCase()}
                sourceVersion={sourceVersion}
                targetVersion={sourceVersion}
                workFlowId={params.workflow_id as string}
                heading="Compare changes"
            /> */}
            <GuardrailSelector
                ref={guardrailRef}
                allGuardrails={guardrails ?? []}
                guardrailsLoading={guardrailsLoading}
                title="Workflow Level Guardrails"
                level={GuardrailBindingLevelType.WORKFLOW}
                onRefetch={onRefetch}
                onGuardrailsChange={onGuardrailsChange}
            />
        </React.Fragment>
    );
};
