import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';
import { DataLineageSessionTableProps } from '@/app/workspace/[wid]/data-lineage/components/data-lineage-session-table';
import { IDataLineageSession, IDataLineageSessionFilter } from '@/models';
import { lineageService } from '@/services';
import { QueryKeyType } from '@/enums';

export const useDataLineageSession = (props: DataLineageSessionTableProps) => {
    const params = useParams();
    const { token } = useAuth();
    const { row, sessionQueryParams, selectedRowId } = props;
    const [sessions, setSessions] = useState<IDataLineageSession[]>([]);
    const [sessionParams, setSessionParams] = useState<IDataLineageSessionFilter | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [take] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        if (sessionQueryParams) {
            if (selectedRowId && selectedRowId === row.original.id) {
                setSessionParams({
                    startDate: sessionQueryParams?.startDate,
                    endDate: sessionQueryParams?.endDate,
                    startTime: sessionQueryParams?.startTime,
                    endTime: sessionQueryParams?.endTime,
                    textSearch: sessionQueryParams?.textSearch,
                });
            } else {
                setSessionParams({
                    startDate: sessionQueryParams?.startDate,
                    endDate: sessionQueryParams?.endDate,
                });
            }
        } else {
            setSessionParams(undefined);
        }
        if (page > 1) setPage(1);
        if (!mounted) setMounted(true);
    }, [sessionQueryParams, selectedRowId]);

    const { isFetching } = useQuery(
        [QueryKeyType.DATA_LINEAGE_SESSIONS, params.wid, row.original.id, sessionParams, { page, take }],
        () => lineageService.sessions(params.wid as string, row.original.id, page, take, sessionParams),
        {
            enabled: !!token && mounted,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                if (data && data?.items?.length > 0) {
                    setSessions(data?.items);
                    setTotalPages(Math.ceil(data.totalCount / take));
                } else {
                    setSessions([]);
                    setTotalPages(0);
                }
            },
            onError: () => {
                setSessions([]);
                setTotalPages(0);
            },
        }
    );

    return {
        isFetching: isFetching || !mounted,
        sessions,
        page,
        defaultPageSize: take,
        totalPages,
        setPage,
    };
};
