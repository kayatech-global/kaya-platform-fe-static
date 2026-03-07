import { useMemo, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { WorkspaceCardProps } from '@/components/molecules/workspace-card/workspace-card';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { $fetch, FetchError, logger } from '@/utils';
import { IGroupWorkspace, IOption, IPaginationParam, IResultWrapper, ISearch, PaginationResponse } from '@/models';
import { toast } from 'sonner';
import { deleteWorkspace } from './use-workspace';
import { isNullOrEmpty } from '@/lib/utils';
import { usePlatformQuery } from './use-common';

const fetchWorkspaces = async (pageParam: IPaginationParam) => {
    // const searchTerm = pageParam?.searchTerm
    //     ? 'filterBy=' + encodeURIComponent(`name~'${pageParam?.searchTerm}'`)
    //     : undefined;
    // let queryParam = pageParam?.page > -1 ? `?cursor=${pageParam?.page}&take=${pageParam?.take}` : '';
    // if (isNullOrEmpty(queryParam) && searchTerm) {
    //     queryParam = `?${searchTerm}`;
    // } else if (!isNullOrEmpty(queryParam) && searchTerm) {
    //     queryParam = queryParam + `&${searchTerm}`;
    // }

    // const response = await $fetch<PaginationResponse<WorkspaceCardProps[]>>(`/workspaces${queryParam}`);
    // return response.data;

    return {
        items: [
            {
                id: 1,
                uuid: 'mock-ws-1',
                name: 'Mock Project Alpha',
                description: 'This is a locally mocked workspace environment for development.',
                createdAt: new Date(),
                metadata: [{ id: 1, name: 'Environment', value: 'Development' }],
                avatars: [],
            },
            {
                id: 2,
                uuid: 'mock-ws-2',
                name: 'Mock Project Beta',
                description: 'Another sample offline workspace instance.',
                createdAt: new Date(),
                metadata: [{ id: 2, name: 'Environment', value: 'Production' }],
                avatars: [],
            },
        ],
        totalCount: 2,
    } as unknown as PaginationResponse<WorkspaceCardProps[]>;
};

const fetchMetadata = async () => {
    // const response = await $fetch<string[]>('/workspaces/metadata');
    // return response.data;
    return ['Development', 'Production'];
};

export const useWorkspaceContainer = () => {
    const { token, isSuperAdmin } = useAuth();
    const queryClient = useQueryClient();
    const [workspaceDataState, setWorkspaceDataState] = useState<WorkspaceCardProps[]>([]);
    const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceCardProps[]>([]);
    const [metadataOption, setMetadataOption] = useState<IOption | null>(null);
    const [openNewWorkspaceForm, setOpenNewWorkspaceForm] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<number | string | undefined>(undefined);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageParam, setPageParam] = useState<IPaginationParam>({ page: 1, take: 9 });

    const { isFetching, isSuccess } = useQuery(['workspaces', { pageParam }], () => fetchWorkspaces(pageParam), {
        enabled: !!token,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        onSuccess: data => {
            if (data && data?.items?.length > 0) {
                setWorkspaceDataState(data?.items);
                setTotalPages(Math.ceil(data.totalCount / pageParam.take));
            } else {
                setWorkspaceDataState([]);
            }
            setAllWorkspaces(data?.items);
        },
        onError: () => {
            setWorkspaceDataState([]);
            setAllWorkspaces([]);
        },
    });

    const {
        isFetching: fetchingEnvironment,
        data: environmentData,
        refetch: refetchEnvironment,
    } = usePlatformQuery({
        queryKey: 'environment',
        select: data =>
            ({
                isValid: !isNullOrEmpty(data?.platformEnvironment),
                data: data?.platformEnvironment,
            }) as IResultWrapper<string>,
        onError: error => {
            console.error('Failed to fetch environment:', error);
        },
    });

    const {
        isFetching: fetchingMetadata,
        data: metadata,
        refetch: refetchMetadata,
    } = useQuery('metadata', fetchMetadata, {
        enabled: !!token,
        refetchOnWindowFocus: false,
        onSuccess: data => {
            if (data?.length === 0) {
                setMetadataOption(null);
                onPageUpdate(1);
            } else if (metadataOption) {
                const result = data?.find(x => x === metadataOption?.value);
                if (!result) {
                    setMetadataOption(null);
                    onPageUpdate(1);
                }
            }
        },
        onError: error => {
            console.error('Failed to fetch metadata:', error);
        },
    });

    const { mutate: mutateDelete } = useMutation(deleteWorkspace, {
        onSuccess: () => {
            queryClient.invalidateQueries('workspaces');
            toast.success('Workspace deleted successfully');
        },
        onError: (error: FetchError) => {
            if (error?.status === 400) {
                toast.error(error?.message);
            } else {
                toast.error("Something went wrong! We couldn't delete your workspace");
            }
            logger.error('Error deleting workspace:', error?.message);
        },
    });

    const metadataList = useMemo(() => {
        if (metadata) {
            return metadata.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        }
        return [];
    }, [metadata]);

    const onHandleDelete = (workspaceId: number | string) => {
        try {
            mutateDelete(workspaceId);
        } catch (error) {
            toast.error("Something went wrong! We couldn't delete your workspace");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onSkeltonWorkspaceCardClick = () => {
        setOpenNewWorkspaceForm(true);
        setWorkspaceId(undefined);
    };

    const groupWorkspaces = useMemo(() => {
        if (metadataOption) {
            return groupWorkspacesByMetadata(allWorkspaces, metadataOption?.value);
        }
        return [];
    }, [allWorkspaces, metadataOption]);

    const workspaces = useMemo(() => {
        const adminActionOnEmpty = isSuperAdmin
            ? [
                  {
                      showSkelton: true,
                      onSkeltonClick: () => onSkeltonWorkspaceCardClick(),
                  } as WorkspaceCardProps,
              ]
            : [];
        const onLastPage = isSuperAdmin
            ? [
                  ...workspaceDataState,
                  {
                      showSkelton: true,
                      onSkeltonClick: () => onSkeltonWorkspaceCardClick(),
                  } as WorkspaceCardProps,
              ]
            : workspaceDataState;

        if (metadataOption) {
            return groupWorkspaces;
        }
        if (workspaceDataState?.length === 0 && !isNullOrEmpty(pageParam.searchTerm)) {
            return workspaceDataState;
        }

        return (() => {
            if (!workspaceDataState?.length) return adminActionOnEmpty;
            if (totalPages === pageParam.page) return onLastPage;
            return [...workspaceDataState];
        })();
    }, [
        workspaceDataState?.length,
        totalPages,
        pageParam.page,
        pageParam.searchTerm,
        isSuperAdmin,
        isFetching,
        groupWorkspaces,
        metadataOption,
    ]);

    const onPageUpdate = (page: number) => {
        setPageParam(prev => ({
            ...prev,
            page,
        }));
    };

    const onFilter = (data: ISearch) => {
        let result = {
            ...pageParam,
            searchTerm: isNullOrEmpty(data.search) ? undefined : data.search,
        } as IPaginationParam;

        if (!metadataOption) {
            result = {
                ...result,
                page: 1,
            };
        }
        setPageParam(result);
    };

    return {
        fetchingEnvironment,
        environmentData,
        workspaces,
        page: pageParam.page,
        totalPages,
        isFetching,
        isSuccess,
        metadata: metadataList,
        metadataOption,
        openNewWorkspaceForm,
        workspaceId,
        fetchingMetadata,
        hasFilters: !isNullOrEmpty(pageParam.searchTerm),
        setMetadataOption,
        setWorkspaceId,
        setOpenNewWorkspaceForm,
        onHandleDelete,
        onFilter,
        onPageUpdate,
        refetchEnvironment,
        refetchMetadata,
    };
};

const groupWorkspacesByMetadata = (workspaces: WorkspaceCardProps[], paramName: string) => {
    const groups: Record<string, WorkspaceCardProps[]> = {};

    for (const ws of workspaces) {
        const meta = ws?.metadata?.find(m => m.name === paramName);
        const rawKey = meta ? meta.value : '(None)';
        const key = rawKey ? rawKey.trim().toLowerCase() : '(none)';

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(ws);
    }

    return Object.entries(groups)
        .map(([, workspaces]) => {
            const labels = workspaces.map(ws => ws.metadata?.find(m => m.name === paramName)?.value).filter(Boolean);

            const displayValue = labels.find(v => v !== v?.toUpperCase()) || labels[0] || '(None)';

            return {
                metadataValue: displayValue,
                workspaces,
            } as IGroupWorkspace;
        })
        .sort((a, b) => {
            const aVal = a.metadataValue.toLowerCase();
            const bVal = b.metadataValue.toLowerCase();
            if (aVal === '(none)') return 1;
            if (bVal === '(none)') return -1;
            return aVal.localeCompare(bVal);
        });
};
