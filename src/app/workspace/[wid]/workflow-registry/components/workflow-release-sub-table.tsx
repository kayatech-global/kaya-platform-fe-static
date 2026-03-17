'use client';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { convert_MMM_DD_YYYY, handleNoValue, isNullOrEmpty } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { NotepadText, Repeat2, Cog } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { WorkflowReleaseNote } from './workflow-release-note';
import { IArtifactWorkflowVersions } from '@/models';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { WorkflowDeploymentWizard } from './workflow-pull-wizard';
import { useAuth } from '@/context/auth-context';
import { WorkflowEnvironmentConfiguration } from './workflow-environment-configuration';
import { mock_release_notes } from '../mock_data';

interface WorkflowReleaseSubTableProps {
    workflowReleases: IArtifactWorkflowVersions[];
    onDeploy: (workflowId: string, artifactVersion: string, token: string) => Promise<void>;
    openReleaseNoteModal: boolean;
    setOpenReleaseNoteModal: Dispatch<SetStateAction<boolean>>;
    releaseNote: string | null;
    refetch: () => void;
}

export const WorkflowReleaseSubTable = ({
    workflowReleases,
    refetch,
}: Omit<WorkflowReleaseSubTableProps, 'openReleaseNoteModal' | 'setOpenReleaseNoteModal' | 'releaseNote' | 'onDeploy'>) => {
    const { isWorkspaceAdmin } = useAuth();
    const [isOpenDeployWizardModal, setIsOpenDeployWizardModal] = useState(false);
    const [isOpenEnvVariableModal, setIsOpenEnvVariableModal] = useState<boolean>(false);
    const [openReleaseNoteModal, setOpenReleaseNoteModal] = useState(false);
    const [releaseNote, setReleaseNote] = useState<string | null>(null);
    const [selectedArtifactVersion, setSelectedArtifactVersion] = useState<string | null>(null);
    const [selectedArtifactPath, setSelectedArtifactPath] = useState<string | null>(null);

    const { mutate, isLoading, reset } = useMutation({
        mutationFn: async ({ artifactPath, artifactVersion }: { artifactPath: string; artifactVersion: string }) => {
            // Mocking API delay
            await new Promise(resolve => setTimeout(resolve, 600));
            const note = mock_release_notes[artifactPath]?.[artifactVersion];
            return note || "No release notes available for this version.";
        },
        onSuccess: data => {
            setReleaseNote(data);
        },
        onError: () => {
            toast.warning('Error generating release note');
        },
    });

    const generateReleaseNote = (path: string, version: string) => {
        setSelectedArtifactVersion(version);
        setSelectedArtifactPath(path);
        setOpenReleaseNoteModal(true);
        mutate({ artifactPath: path, artifactVersion: version });
    };

    useEffect(() => {
        // Clear state when modal is closed
        if (!openReleaseNoteModal) {
            setReleaseNote(null);
            setSelectedArtifactVersion(null);
            setSelectedArtifactPath(null);
            reset();
        }
    }, [openReleaseNoteModal, reset]);

    const handleOnPullWorkflow = (path: string, version: string) => {
        setIsOpenDeployWizardModal(true);
        setSelectedArtifactVersion(version);
        setSelectedArtifactPath(path);
    };

    const generateWorkflowVariables = (path: string, version: string) => {
        setIsOpenEnvVariableModal(true);
        setSelectedArtifactVersion(version);
        setSelectedArtifactPath(path);
    };

    const generateColumns = () => {
        const columns: ColumnDef<IArtifactWorkflowVersions>[] = [
            {
                accessorKey: 'workflowName',
                meta: {
                    width: '35%',
                },
                enableSorting: false,
                header() {
                    return <div className="w-full text-left">Workflow Name</div>;
                },
                cell({ row }) {
                    return (
                        <div className="flex justify-between items-center flex-wrap gap-x-12 w-full">
                            <div className="flex-1 min-w-0 break-words">
                                {handleNoValue(row.getValue('workflowName'))}
                            </div>
                            <div className="ml-auto mt-2 sm:mt-0">
                                <Button
                                    className="w-full sm:w-max"
                                    variant="link"
                                    size="icon"
                                    onClick={() => {
                                        generateReleaseNote(row.original.artifactPath, row.original.version);
                                    }}
                                >
                                    <div className="relative flex items-center">
                                        <span className="flex items-center gap-x-1">
                                            <NotepadText size={18} />
                                            <span>Release note</span>
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'version',
                enableSorting: true,
                meta: {
                    width: '15%',
                },
                header() {
                    return <div className="w-full text-left">Version</div>;
                },
                cell({ row }) {
                    return (
                        <div className="flex justify-between items-center gap-2">
                            <span>{isNullOrEmpty(row.getValue('version')) ? '-' : `V${row.getValue('version')}`}</span>
                            {isWorkspaceAdmin && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="cursor-pointer"
                                                variant="link"
                                                size="icon"
                                                onClick={() =>
                                                    generateWorkflowVariables(
                                                        row.original.artifactPath,
                                                        row.original.version
                                                    )
                                                }
                                            >
                                                <Cog size={18} className="text-gray-500 dark:text-gray-200" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <p>Environment Configuration</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'date',
                enableSorting: true,
                meta: {
                    width: '15%',
                },
                header() {
                    return <div className="w-full text-left">Date</div>;
                },
                cell({ row }) {
                    return (
                        <div>
                            {isNullOrEmpty(row.getValue('date'))
                                ? handleNoValue(row.getValue('date'))
                                : convert_MMM_DD_YYYY(row.getValue('date'))}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'id',
                enableSorting: false,
                meta: {
                    width: '20%',
                },
                header() {
                    return <div className="w-full text-left"></div>;
                },
                cell({ row }) {
                    return (
                        <div className="flex items-center gap-x-4">
                            {isWorkspaceAdmin ? (
                                <Button
                                    className={'w-full sm:w-max'}
                                    variant="link"
                                    size="icon"
                                    onClick={() =>
                                        handleOnPullWorkflow(row.original.artifactPath, row.original.version)
                                    }
                                >
                                    <span className="flex items-center gap-x-1">
                                        <Repeat2 size={20} className="" />
                                        <span className="text-xs font-semibold">Pull Workflow</span>
                                    </span>
                                </Button>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-not-allowed">
                                                <Button
                                                    className={
                                                        'w-full sm:w-max text-gray-500 hover:text-gray-500 cursor-not-allowed'
                                                    }
                                                    variant="link"
                                                    size="icon"
                                                    disabled
                                                >
                                                    <span className="flex items-center gap-x-1">
                                                        <Repeat2 size={20} className="" />
                                                        <span className="text-xs font-semibold">Pull Workflow</span>
                                                    </span>
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Only workspace admins can pull workflows.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    );
                },
            },
        ];

        return columns;
    };

    const columns = generateColumns();

    return (
        <>
            <div>
                <DataTable
                    columns={columns}
                    data={workflowReleases}
                    searchColumnName="workflow-release"
                    showHeader={false}
                    showFooter={workflowReleases?.length > 10}
                    showTableSearch={false}
                    manualSpan={true}
                    enableExpandByRowClick={false}
                    expandedColumnWidth="7%"
                />
            </div>
            {/* workflow release note modal */}
            <WorkflowReleaseNote
                isOpen={openReleaseNoteModal}
                setOpen={setOpenReleaseNoteModal}
                artifactVersion={selectedArtifactVersion}
                note={releaseNote}
                isFetching={isLoading}
            />
            {/* workflow deployment wizard modal */}
            <WorkflowDeploymentWizard
                artifactVersion={selectedArtifactVersion}
                setArtifactVersion={setSelectedArtifactVersion}
                artifactPath={selectedArtifactPath}
                setArtifactPath={setSelectedArtifactPath}
                isOpen={isOpenDeployWizardModal}
                setIsOpen={setIsOpenDeployWizardModal}
                refetch={refetch}
            />
            {/* workflow environment variable modal */}
            <WorkflowEnvironmentConfiguration
                open={isOpenEnvVariableModal}
                artifactPath={selectedArtifactPath}
                artifactVersion={selectedArtifactVersion}
                setOpen={setIsOpenEnvVariableModal}
            />
        </>
    );
};
