'use client';
import React, { useEffect, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { EditorPanel } from './editor-panel';
import { ToolPanel } from './tool-panel';
import { EditorPlayground, EditorPlaygroundRef } from './editor-playground';
import { ReactFlowProvider } from '@xyflow/react';
import { Button, Spinner, useSidebar } from '@/components';
import { EditorHeaderMain } from '@/components/organisms/editor-header-main.tsx/editor-header-main';
import { useWorkflowEditor } from '@/hooks/use-workflow-editor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms/dialog';

export const WorkflowEditorContainer = () => {
    const { setOpen } = useSidebar();
    const workflowEditorHook = useWorkflowEditor();
    const {
        data,
        isFetching,
        isLoading,
        loader,
        initialSnapshot,
        openModal,
        setOpenModal,
        setLoader,
        onUpdate,
        onClear,
        refetch,
        refetchWorkflow,
    } = workflowEditorHook;

    const editorPlaygroundRef = useRef<EditorPlaygroundRef | null>(null);

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setOpen(false);
        setLoader(true);
    }, []);

    const onIntellisenseRefresh = async () => {
        if (editorPlaygroundRef.current) {
            await editorPlaygroundRef.current.onRefetch();
        }
    };

    if (isLoading || loader) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-y-2">
                    <Spinner />
                    <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                        We are getting workflow information, please hold...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <div className="h-screen flex flex-col">
                <EditorHeaderMain
                    workflowName={data?.name as string}
                    isDraft={data?.isDraft}
                    availableVersions={data?.availableVersions}
                    version={data?.version}
                    refetchWorkflow={refetchWorkflow}
                    isLoading={isFetching}
                    hasChanges={hasChanges}
                />
                <div className="flex-1 flex gap-x-1 p-1 bg-gray-200 dark:bg-gray-700 overflow-hidden min-h-0">
                    <ToolPanel /> {/*Editor left tool panel*/}
                    {/*D&D Editor*/}
                    <EditorPlayground
                        ref={editorPlaygroundRef}
                        visualGraphData={data?.visualGraphData}
                        workflowName={data?.name}
                        version={data?.version}
                        isReadOnly={data?.isReadOnly}
                        refetchGraph={refetch}
                        isDraft={data?.isDraft}
                        availableVersions={data?.availableVersions}
                        initialSnapshot={initialSnapshot}
                        hasChanges={hasChanges}
                        setHasChanges={setHasChanges}
                    />
                    <EditorPanel
                        {...workflowEditorHook}
                        workflow={data}
                        isReadOnly={data?.isReadOnly}
                        setHasChanges={setHasChanges}
                        onIntellisenseRefetch={onIntellisenseRefresh}
                    />
                </div>
                <Dialog open={openModal} onOpenChange={setOpenModal}>
                    <DialogContent className="overflow-y-auto max-h-[80%]" hideCloseButtonClass="hidden">
                        <DialogHeader>
                            <DialogTitle>
                                <p className="text-sm">Incoming updates detected</p>
                            </DialogTitle>
                            <DialogDescription>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Some system-applied updates are not yet saved. Would you like to apply them now?
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 p-3">
                            <Button variant={'secondary'} size="sm" onClick={onClear}>
                                Keep Current Changes
                            </Button>
                            <Button variant={'primary'} size="sm" onClick={onUpdate}>
                                Apply
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </ReactFlowProvider>
    );
};
