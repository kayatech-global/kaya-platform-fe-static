'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    SmallSpinner,
} from '@/components/atoms';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/atoms/breadcrumb';
import { cn } from '@/lib/utils';
import { IWorkflowGraphResponse, IWorkflowTypes } from '@/models';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/atoms/dialog';
import { SaveOff } from 'lucide-react';

interface VersionDropdownItem {
    name: string;
    version: string;
    available: boolean;
    message?: string;
}

interface WorkflowHeaderLeftProps {
    workflowName: string;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    version?: string;
    refetchWorkflow: (versionType?: string | undefined) => Promise<IWorkflowGraphResponse>;
    isLoading: boolean;
    hasChanges: boolean;
}

export const WorkflowHeaderLeft: React.FC<WorkflowHeaderLeftProps> = ({
    workflowName,
    isDraft,
    availableVersions,
    version,
    refetchWorkflow,
    isLoading,
    hasChanges,
}) => {
    const [switchingWorkflow, setSwitchingWorkflow] = useState(false);
    const [openSaveConfirmationModal, setOpenSaveConfirmationModal] = useState(false);

    const { isMobile } = useBreakpoint();
    const [workspaceInfo] = useLocalStorage('workspaceInfo');

    const getVersionDropdownItems = (): VersionDropdownItem | undefined => {
        if (!version) {
            return {
                name: 'Version not available',
                version: '',
                available: false,
                message: 'No version information found for this workflow.',
            };
        }

        const raw = String(version).trim();
        const cleaned = raw.replace(/^v/i, '');
        const [major] = cleaned.split('.');

        const hasPublishVersion = availableVersions?.some(v => v.name === 'publish');
        const hasDraftVersion = availableVersions?.some(v => v.name === 'draft');

        if (isDraft) {
            if (hasPublishVersion) {
                const publishVer = `${major}.0`;
                return { name: `Publish v${publishVer}`, version: publishVer, available: true };
            }
            return {
                name: 'No publish versions available',
                version: '',
                available: false,
                message: 'This workflow has no available published versions.',
            };
        } else {
            if (hasDraftVersion) {
                const draftVer = `${major}.1`;
                return { name: `Draft v${draftVer}`, version: draftVer, available: true };
            }
            return {
                name: 'No draft versions available',
                version: '',
                available: false,
                message: 'There are no draft versions available for this workflow.',
            };
        }
    };

    // local handler for switching
    const handleWorkflowVersionSwitch = async (isVersionAvailable: boolean) => {
        if (!isVersionAvailable) return;

        if (hasChanges) {
            setOpenSaveConfirmationModal(true);
        } else {
            switchWorkFlow();
        }
    };

    const switchWorkFlow = async () => {
        const fetchingVersion = isDraft ? 'publish' : 'draft';

        if (fetchingVersion) {
            setSwitchingWorkflow(true);
            try {
                await refetchWorkflow(fetchingVersion);
            } catch (error) {
                console.error('Failed to switch workflow version:', error);
                toast.warning('Failed to switch workflow version');
            }
            setSwitchingWorkflow(false);
        }
    };

    return (
        <div>
            {/* --- Title + Version switch --- */}
            <div className="left-side flex items-center gap-x-2">
                <p className="text-xl font-semibold text-blue-50">{workflowName}</p>
                {availableVersions?.length !== 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger disabled={switchingWorkflow}>
                            <div className="flex items-center h-full gap-x-2 cursor-pointer hover:bg-blue-400 pl-1 pr-2 rounded-lg transition-all duration-100 ease-in-out">
                                    <Badge
                                        variant={'success'}
                                        size={'sm'}
                                        className={cn(
                                            'h-6 overflow-hidden relative min-w-[89px] transition-opacity duration-200',
                                            switchingWorkflow && 'opacity-70 cursor-not-allowed'
                                        )}
                                    >
                                        {switchingWorkflow || isLoading ? (
                                            <div className="flex items-center w-full justify-center gap-x-2">
                                                <p className="text-xs font-regular text-gray-600">
                                                    {isLoading ? 'Loading' : 'Switching...'}
                                                </p>
                                                <SmallSpinner classNames="static" />
                                            </div>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={isDraft ? 'draft' : 'publish'}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                    className="inline-block w-full"
                                                >
                                                    {isDraft ? `Draft v${version}` : `Publish v${version}.0`}
                                                </motion.span>
                                            </AnimatePresence>
                                        )}
                                    </Badge>
                                    <i className="ri-arrow-down-s-fill text-[20px] text-white" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="ml-1">
                            <DropdownMenuItem
                                onClick={() => handleWorkflowVersionSwitch(!!getVersionDropdownItems()?.available)}
                                className="text-xs font-medium text-gray-700"
                            >
                                {getVersionDropdownItems()?.available ? (
                                    <>
                                        <Badge
                                            variant={'secondary'}
                                            size={'sm'}
                                            className="h-6 overflow-hidden relative"
                                            title="version switch display"
                                        >
                                            {getVersionDropdownItems()?.name}
                                        </Badge>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Switch &rarr;</p>
                                    </>
                                ) : (
                                    getVersionDropdownItems()?.message
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* --- Breadcrumb --- */}
            <div>
                <Breadcrumb>
                    <BreadcrumbList className="!gap-x-1">
                        <BreadcrumbItem>
                            <BreadcrumbPage
                                className={cn('text-xs font-regular text-blue-100', { 'text-xs': isMobile })}
                            >
                                {workspaceInfo?.name}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-xs font-regular text-blue-100" />
                        <BreadcrumbItem>
                            <BreadcrumbPage
                                className={cn('text-xs font-regular text-blue-50', { 'text-xs': isMobile })}
                            >
                                {workflowName}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Dialog open={openSaveConfirmationModal} onOpenChange={setOpenSaveConfirmationModal}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[450px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <SaveOff size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Switch Without Saving?
                        </p>
                    </DialogHeader>
                    <div className="px-4 py-6 flex flex-col justify-center items-center gap-y-4">
                        <SaveOff size={96} color="#316FED" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                            You have unsaved changes. If you switch to another version without saving, your changes will
                            be lost.
                        </p>
                    </div>
                    <DialogFooter className="py-3">
                        <Button size={'sm'} variant="secondary" onClick={() => setOpenSaveConfirmationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            size={'sm'}
                            variant="primary"
                            onClick={() => {
                                switchWorkFlow();
                                setOpenSaveConfirmationModal(false);
                            }}
                        >
                            Switch Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
