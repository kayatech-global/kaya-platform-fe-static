import { ComponentType } from '@/enums';
import { IPlatformConfiguration, OverallUsageResponse } from '@/models';
import { $fetch } from '@/utils';

class PlatformService {
    async config() {
        // const response = await $fetch<IPlatformConfiguration>(`/platform/config`);
        // return response.data;
        return {} as any;
    }

    async usage(body: unknown, workspaceId: string) {
        const response = await $fetch<OverallUsageResponse>(
            '/platform/usage',
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'x-workspace-id': workspaceId,
                },
            },
            { component: ComponentType.OverallUsage }
        );

        return response.data;
    }
}

export default PlatformService;
