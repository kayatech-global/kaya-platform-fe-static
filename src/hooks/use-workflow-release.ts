import { IArtifactWorkflow, IArtifactWorkflowVersions, IVersionResponse } from '@/models';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { mock_artifacts, mock_artifact_versions } from '@/app/workspace/[wid]/workflow-registry/mock_data';

export const useWorkflowRelease = () => {
    const [openReleaseNoteModal, setOpenReleaseNoteModal] = useState<boolean>(false);
    const [workflowArtifactTableData, setWorkflowArtifactTableData] = useState<IArtifactWorkflow[]>([]);
    const [allWorkflows, setAllWorkflows] = useState<IArtifactWorkflow[]>([]); // store original data
    const [releaseNote, setReleaseNote] = useState<string | null>(null);
    const [expandedArtifactPath, setExpandedArtifactPath] = useState<string>('');
    const [workflowVersions, setWorkflowVersions] = useState<Record<string, IArtifactWorkflowVersions[]>>({});

    const [loadingRow, setLoadingRow] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { isFetching, refetch } = useQuery(
        'mock_artifacts',
        async () => {
            // Mocking API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return mock_artifacts;
        },
        {
            refetchOnWindowFocus: false,
            onSuccess: data => {
                const formattedWorkflowData: IArtifactWorkflow[] = data.map(d => {
                    return {
                        workflowId: d.workflowId,
                        name: d.workflowName,
                        artifactName: d.artifactName,
                        artifactUrl: d.artifactUrl,
                        artifactPath: d.artifactPath,
                        workflowMetadata: d.workflowMetadata,
                    };
                });
                setAllWorkflows(formattedWorkflowData);
                setWorkflowArtifactTableData(formattedWorkflowData);
            },
            onError: () => {
                setAllWorkflows([]);
                setWorkflowArtifactTableData([]);
            },
        }
    );

    const { isFetching: loadingArtifactVersion } = useQuery(
        ['mock_artifact_versions', 'dynamic-artifact'],
        async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const versionsData = (mock_artifact_versions as Record<string, { versions: IVersionResponse[] }>)[expandedArtifactPath];
            return versionsData || { versions: [] };
        },
        {
            enabled: false,
        }
    );

    const getWorkflowArtifactVersion = async (workflowId: string, workflowName: string, artifactPath: string) => {
        setLoadingRow(workflowId);
        setExpandedArtifactPath(artifactPath);

        const cacheKey = ['mock_artifact_versions', artifactPath];

        const versionResponse = await queryClient.fetchQuery(cacheKey, async () => {
             await new Promise(resolve => setTimeout(resolve, 300));
             const versionsData = (mock_artifact_versions as Record<string, { versions: IVersionResponse[] }>)[artifactPath];
             return versionsData || { versions: [] };
        });

        const versions: IArtifactWorkflowVersions[] = (versionResponse?.versions || [])
            .sort((a, b) => {
                const pa = a.version.split('.').map(Number);
                const pb = b.version.split('.').map(Number);

                return (
                    pb[0] - pa[0] || 
                    pb[1] - pa[1] || 
                    pb[2] - pa[2] 
                );
            })
            .map(v => ({
                id: crypto.randomUUID(),
                workflowName,
                workflowId,
                uri: v.uri,
                version: v.version,
                date: v.createdAt,
                artifactPath: artifactPath,
            }));

        setWorkflowVersions(prev => ({
            ...prev,
            [workflowId]: versions,
        }));

        setLoadingRow(null);
    };

    const onWorkflowArtifactFilter = (filter: IArtifactWorkflow | null) => {
        if (!filter?.name) {
            setWorkflowArtifactTableData(allWorkflows);
            return;
        }

        const filterNameLower = filter.name.toLowerCase();
        const filteredWorkflows = allWorkflows.filter(w => w.artifactName.toLowerCase().includes(filterNameLower));
        setWorkflowArtifactTableData(filteredWorkflows);
    };

    const onDeploy = async (workflowId: string, artifactVersion: string, token: string) => {
        console.log(`Deploying workflow ${workflowId} version ${artifactVersion} with token ${token}`);
    };

    return {
        isFetching,
        workflowArtifactTableData,
        openReleaseNoteModal,
        setOpenReleaseNoteModal,
        onWorkflowArtifactFilter,
        onDeploy,
        releaseNote,
        setReleaseNote,
        getWorkflowArtifactVersion,
        loadingArtifactVersion,
        loadingRow,
        workflowVersions,
        refetch,
    };
};

