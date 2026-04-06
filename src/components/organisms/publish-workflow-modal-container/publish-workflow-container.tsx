'use client';

import { Button, Textarea } from '@/components/atoms';
import { BannerInfo } from '@/components/atoms/banner-info';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogBody } from '@/components/atoms/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Select } from '@/components/atoms/select';
import { Label } from '@/components/atoms/label';
import { useWorkflowPublish } from '@/hooks/useWorkflowPublish';
import { validateSpaces, cn } from '@/lib/utils';
import { IWorkflowTypes } from '@/models';
import { CircleFadingArrowUp, SaveOff, Server, Cloud, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface PublishWorkflowModalContainerProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    version?: string;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    openSaveConfirmationModal: boolean;
    setOpenSaveConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock data for AgentCore runtimes - should come from the agentcore-runtimes listing
const MOCK_CONFIGURED_RUNTIMES = [
    { id: '1', name: 'Production Runtime', region: 'us-east-1', status: 'Deployed' },
    { id: '2', name: 'Staging Runtime', region: 'us-east-1', status: 'Deployed' },
    { id: '3', name: 'Development Runtime', region: 'us-west-2', status: 'Deployed' },
    { id: '4', name: 'EU Production Runtime', region: 'eu-west-1', status: 'Queued' },
];

type ExecutionRuntime = 'kaya-default' | 'aws-agentcore';

export const PublishWorkflowModalContainer = ({
    open,
    setOpen,
    refetchGraph,
    availableVersions,
    openSaveConfirmationModal,
    setOpenSaveConfirmationModal,
}: PublishWorkflowModalContainerProps) => {
    const { register, watch, errors, onSubmit, handleModalCancel, isSuccessfullyPublished, isPublishing } =
        useWorkflowPublish(open, refetchGraph, setOpen, availableVersions);

    // AgentCore specific state
    const [executionRuntime, setExecutionRuntime] = useState<ExecutionRuntime>('kaya-default');
    const [selectedRuntime, setSelectedRuntime] = useState('');

    // Reset AgentCore state when modal closes
    useEffect(() => {
        if (!open) {
            setExecutionRuntime('kaya-default');
            setSelectedRuntime('');
        }
    }, [open]);

    // Get available runtimes (only deployed ones)
    const availableRuntimes = MOCK_CONFIGURED_RUNTIMES.filter(r => r.status === 'Deployed');

    return (
        <div>
            {/* Publish form modal */}
            <Dialog open={open} onOpenChange={handleModalCancel}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[650px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <CircleFadingArrowUp size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Publish Workflow | Draft {watch('draftVersion')} → {watch('publishedVersion')}
                        </p>
                    </DialogHeader>

                    <DialogBody className="px-4 py-6 flex flex-col gap-y-6">
                        {isSuccessfullyPublished && executionRuntime === 'kaya-default' ? (
                            <div className="w-full flex flex-col gap-y-4 items-center">
                                <Image
                                    src="/png/success-publish.png"
                                    width={100}
                                    height={100}
                                    alt="publish-workflow-success"
                                />
                                <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Workflow published successfully
                                </p>
                            </div>
                        ) : (
                            <>
                                <BannerInfo
                                    label={
                                        <p className="text-sm text-blue-600">
                                            Publishing this workflow will create version{' '}
                                            <span className="font-bold">{watch('publishedVersion')}</span> from the
                                            current draft <span className="font-bold">{watch('draftVersion')}</span>
                                        </p>
                                    }
                                    icon="ri-information-2-fill"
                                />

                                {/* Execution Runtime Selection */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                        Execution Runtime
                                    </Label>
                                    <RadioGroup value={executionRuntime} onValueChange={(value) => setExecutionRuntime(value as ExecutionRuntime)} className="grid grid-cols-2 gap-4">
                                        <div className={cn(
                                            "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                            executionRuntime === 'kaya-default' 
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}>
                                            <RadioGroupItem value="kaya-default" id="kaya-default-2" className="sr-only" />
                                            <Label htmlFor="kaya-default-2" className="flex items-center gap-3 cursor-pointer w-full">
                                                <Cloud className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">KAYA Default</p>
                                                    <p className="text-xs text-gray-500">Standard execution</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className={cn(
                                            "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                            executionRuntime !== 'kaya-default'
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}>
                                            <RadioGroupItem value="aws-agentcore" id="aws-agentcore-2" className="sr-only" />
                                            <Label htmlFor="aws-agentcore-2" className="flex items-center gap-3 cursor-pointer w-full">
                                                <Server className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">AWS AgentCore</p>
                                                    <p className="text-xs text-gray-500">Custom runtime</p>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Runtime Selection for AWS AgentCore */}
                                {executionRuntime === 'aws-agentcore' && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Select Runtime
                                        </Label>
                                        {availableRuntimes.length > 0 ? (
                                            <>
                                                <Select
                                                    value={selectedRuntime}
                                                    onChange={(e) => setSelectedRuntime(e.target.value)}
                                                    options={[
                                                        { value: '', name: 'Select a runtime...' },
                                                        ...availableRuntimes.map(rt => ({
                                                            value: rt.id,
                                                            name: `${rt.name} (${rt.region})`,
                                                        }))
                                                    ]}
                                                    className="w-full"
                                                />
                                                {selectedRuntime && (
                                                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        <span className="text-sm text-green-700 dark:text-green-300">
                                                            Runtime connection ready
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    No deployed runtimes available. Please configure a runtime in the Runtimes page first.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Textarea
                                    {...register('comment', {
                                        validate: value => validateSpaces(value, 'publish comment'),
                                    })}
                                    label="Publish Comment"
                                    placeholder="Add a short note about the updates or changes in this version..."
                                    rows={8}
                                    className="w-full resize-none"
                                    isDestructive={!!errors?.comment?.message}
                                    supportiveText={errors?.comment?.message}
                                />
                            </>
                        )}
                    </DialogBody>

                    {!isSuccessfullyPublished && (
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleModalCancel}>
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={onSubmit} 
                                loading={isPublishing}
                                disabled={executionRuntime === 'aws-agentcore' && !selectedRuntime}
                            >
                                {isPublishing ? 'Publishing...' : 'Publish'}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Save confirmation modal */}
            <Dialog open={openSaveConfirmationModal} onOpenChange={setOpenSaveConfirmationModal}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[450px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <SaveOff size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Publish Without Saving?
                        </p>
                    </DialogHeader>
                    <DialogBody className="px-4 py-6 flex flex-col justify-center items-center gap-y-4">
                        <SaveOff size={96} color="#316FED" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                            You have changes that haven&apos;t been saved. You can still proceed with publishing, but the
                            latest edits won&apos;t be included.
                        </p>
                    </DialogBody>
                    <DialogFooter>
                        <Button size={'sm'} variant="secondary" onClick={() => setOpenSaveConfirmationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            size={'sm'}
                            variant="primary"
                            onClick={() => {
                                setOpen(true);
                                setOpenSaveConfirmationModal(false);
                            }}
                            loading={isPublishing}
                        >
                            Publish Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
