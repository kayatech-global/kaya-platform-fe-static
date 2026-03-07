import { useAuth } from '@/context';
import { QueryKeyType } from '@/enums';
import { IArtifactWorkflow, IArtifactWorkflowVersions } from '@/models';
import { registryService } from '@/services';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

export const useWorkflowRelease = () => {
    const [openReleaseNoteModal, setOpenReleaseNoteModal] = useState<boolean>(false);
    const [workflowArtifactTableData, setWorkflowArtifactTableData] = useState<IArtifactWorkflow[]>([]);
    const [allWorkflows, setAllWorkflows] = useState<IArtifactWorkflow[]>([]); // store original data
    const [releaseNote, setReleaseNote] = useState<string | null>(null);
    const [expandedArtifactPath, setExpandedArtifactPath] = useState<string>('');
    const [workflowVersions, setWorkflowVersions] = useState<Record<string, IArtifactWorkflowVersions[]>>({});

    const [loadingRow, setLoadingRow] = useState<string | null>(null);
    const { token } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();

    const { isFetching, refetch } = useQuery(
        QueryKeyType.ARTIFACTS,
        () => registryService.artifacts(params.wid as string),
        {
            enabled: !!token,
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
        [QueryKeyType.ARTIFACT_VERSIONS, params.wid, 'dynamic-artifact'],
        () => registryService.versions(params.wid as string, expandedArtifactPath),
        {
            enabled: false,
        }
    );

    const getWorkflowArtifactVersion = async (workflowId: string, workflowName: string, artifactPath: string) => {
        setLoadingRow(workflowId);
        setExpandedArtifactPath(artifactPath);

        // 1) fetch using queryClient.fetchQuery with the actual artifactPath
        const cacheKey = [QueryKeyType.ARTIFACT_VERSIONS, params.wid, artifactPath];

        // fetchQuery will return cached result if present & fresh; otherwise it will call the fetcher
        // and also put it into the cache for future use.
        const versionResponse = await queryClient.fetchQuery(cacheKey, () =>
            registryService.versions(params.wid as string, artifactPath)
        );

        const versions: IArtifactWorkflowVersions[] = versionResponse?.versions
            .sort((a, b) => {
                const pa = a.version.split('.').map(Number);
                const pb = b.version.split('.').map(Number);

                // DESCENDING
                return (
                    pb[0] - pa[0] || // major
                    pb[1] - pa[1] || // minor
                    pb[2] - pa[2] // patch
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
        // Implement deployment logic here
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
