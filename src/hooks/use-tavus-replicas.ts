import { useQuery } from 'react-query';
import { useState } from 'react';
import { $fetch, logger } from '@/utils';
import { useParams } from 'next/navigation';

export interface TavusReplica {
    replica_id: string;
    replica_name: string;
    thumbnail_video_url?: string;
    status?: string;
}

interface TavusReplicasResponse {
    replicas: TavusReplica[];
}

interface UseTavusReplicasOptions {
    apiKeyName?: string;
    enabled?: boolean;
}

export const useTavusReplicas = (options?: UseTavusReplicasOptions) => {
    const params = useParams();
    const [retryCount, setRetryCount] = useState(0);

    const fetchTavusReplicas = async (): Promise<TavusReplica[]> => {
        if (!options?.apiKeyName) {
            return [];
        }

        const response = await $fetch<TavusReplicasResponse>(
            `/workspaces/${params.wid}/tavus/replicas`,
            {
                method: 'POST',
                body: JSON.stringify({
                    api_key_name: options.apiKeyName,
                }),
                headers: {
                    'x-workspace-id': params.wid as string,
                },
            }
        );

        return response.data?.replicas || [];
    };

    const {
        data: replicas = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<TavusReplica[], Error>(
        ['tavus-replicas', params.wid, options?.apiKeyName, retryCount],
        fetchTavusReplicas,
        {
            enabled: !!options?.apiKeyName && options?.enabled !== false,
            refetchOnWindowFocus: false,
            retry: 1,
            onError: (err) => {
                logger.error('Failed to fetch Tavus replicas:', err);
            },
        }
    );

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        refetch();
    };

    return {
        replicas,
        isLoading: isLoading || isFetching,
        isError,
        error,
        refetch: handleRetry,
    };
};
