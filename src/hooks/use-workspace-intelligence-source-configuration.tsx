import { PlatformConfigurationType } from '@/enums';
import { IPlatformSettingResponse } from '@/models';
import { $fetch } from '@/utils';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';

// Hook to check if workspace-level LLM is configured
export const useWorkspaceIntelligenceSourceConfigured = () => {
    const params = useParams();
    const { data, isLoading } = useQuery(
        ['workspace-config', params.wid],
        async () => {
            const res = await $fetch(`/workspaces/${params.wid}/configurations`, {
                headers: { 'x-workspace-id': params.wid as string },
            });

            return res.data;
        },
        { enabled: !!params.wid }
    );
    const result = !!(data as IPlatformSettingResponse[])?.find(
        (config: IPlatformSettingResponse) =>
            config.key === PlatformConfigurationType.PROMPT_ENHANCEMENT_INTELLIGENT_SOURCE
    );

    return { isConfigured: result, isLoading };
};
