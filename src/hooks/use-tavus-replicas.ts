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
    useMockData?: boolean;
}

// Mock data for testing/demo purposes
const MOCK_TAVUS_REPLICAS: TavusReplica[] = [
    {
        replica_id: 'r79e1c033f',
        replica_name: 'Anna - Professional',
        thumbnail_video_url: 'https://tavus-static.s3.amazonaws.com/preview-videos/anna-professional.mp4',
        status: 'ready',
    },
    {
        replica_id: 'r8a2b4c5d6',
        replica_name: 'Marcus - Casual',
        thumbnail_video_url: 'https://tavus-static.s3.amazonaws.com/preview-videos/marcus-casual.mp4',
        status: 'ready',
    },
    {
        replica_id: 'r9c3d5e7f8',
        replica_name: 'Sarah - Corporate',
        thumbnail_video_url: 'https://tavus-static.s3.amazonaws.com/preview-videos/sarah-corporate.mp4',
        status: 'ready',
    },
    {
        replica_id: 'ra4e6f8g9h',
        replica_name: 'James - Friendly',
        thumbnail_video_url: 'https://tavus-static.s3.amazonaws.com/preview-videos/james-friendly.mp4',
        status: 'ready',
    },
    {
        replica_id: 'rb5f7g9h0i',
        replica_name: 'Emily - Expert',
        thumbnail_video_url: 'https://tavus-static.s3.amazonaws.com/preview-videos/emily-expert.mp4',
        status: 'ready',
    },
];

export const useTavusReplicas = (options?: UseTavusReplicasOptions) => {
    const params = useParams();
    const [retryCount, setRetryCount] = useState(0);

    const fetchTavusReplicas = async (): Promise<TavusReplica[]> => {
        // Return mock data for testing/demo
        if (options?.useMockData) {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            return MOCK_TAVUS_REPLICAS;
        }

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
        ['tavus-replicas', params.wid, options?.apiKeyName, options?.useMockData, retryCount],
        fetchTavusReplicas,
        {
            enabled: (!!options?.apiKeyName || !!options?.useMockData) && options?.enabled !== false,
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
