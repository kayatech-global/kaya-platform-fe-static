import { fetchVault } from '@/utils/vault-api';
import { useQuery } from 'react-query';

export const useVaultSecretsFetcher = (workspaceId: string) => {
    return useQuery({
        queryKey: ['secrets', workspaceId],
        queryFn: () => fetchVault(workspaceId),
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
};
