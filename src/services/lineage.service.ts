import { SessionViewType } from '@/enums';
import { isNullOrEmpty, toQueryParams } from '@/lib/utils';
import {
    IDataLineage,
    IDataLineageEvent,
    IDataLineageGraph,
    IDataLineageLinear,
    IDataLineageSession,
    IDataLineageSessionFilter,
    IDataLineageStep,
    IDataLineageStepExplanation,
    IDataLineageWorkflowFilter,
    PaginationResponse,
} from '@/models';
import { $fetch } from '@/utils';
import moment from 'moment';

class LineageService {
    private workflowParamBuilder(params?: IDataLineageWorkflowFilter) {
        if (params) {
            let startedAt = params?.startedAt;
            let endedAt = params?.endedAt;

            if (!isNullOrEmpty(params?.startedAt)) {
                if (moment(params?.startedAt).isValid()) {
                    startedAt = moment(params?.startedAt).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
                }
            }
            if (!isNullOrEmpty(params?.endedAt)) {
                if (moment(params?.endedAt).isValid()) {
                    endedAt = moment(params?.endedAt).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
                }
            }

            return {
                id: params?.id ? encodeURIComponent(params?.id) : undefined,
                startedAt,
                endedAt,
                timezone: params?.timezone,
            } as IDataLineageWorkflowFilter;
        }
        return params;
    }

    private sessionParamBuilder(params?: IDataLineageSessionFilter) {
        if (params) {
            let startDate = params?.startDate;
            let endDate = params?.endDate;

            if (!isNullOrEmpty(params?.startTime) && moment(params?.startTime, 'HH:mm', true).isValid()) {
                const startDateTime = `${params?.startDate} ${params?.startTime}`;
                if (moment(startDateTime).isValid()) {
                    startDate = moment(startDateTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
                }
            } else if (!isNullOrEmpty(params?.startDate)) {
                startDate = moment(params?.startDate).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
            }

            if (!isNullOrEmpty(params?.endTime) && moment(params?.endTime, 'HH:mm', true).isValid()) {
                const endDateTime = `${params?.endDate} ${params?.endTime}`;
                if (moment(endDateTime).isValid()) {
                    endDate = moment(endDateTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
                }
            } else if (!isNullOrEmpty(params?.endDate)) {
                endDate = moment(params?.endDate).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
            }

            return {
                startDate,
                endDate,
                textSearch: params?.textSearch,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            } as IDataLineageSessionFilter;
        }
        return params;
    }

    async workflows(workspaceId: string, params?: IDataLineageWorkflowFilter) {
        const convertToQueryParams = toQueryParams(this.workflowParamBuilder(params));
        const queryParams = convertToQueryParams ? `?${convertToQueryParams}` : '';
        const response = await $fetch<IDataLineage[]>(`/workspaces/${workspaceId}/lineage/workflows${queryParams}`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async modular(workspaceId: string, sessionId: string, executionId: string, workflowId: string) {
        const response = await $fetch<IDataLineageGraph>(
            `/workspaces/${workspaceId}/lineage/workflows/${workflowId}/sessions/${sessionId}/executions/${executionId}/modular_view`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async linear(workspaceId: string, sessionId: string, executionId: string, workflowId: string) {
        const response = await $fetch<IDataLineageLinear[]>(
            `/workspaces/${workspaceId}/lineage/workflows/${workflowId}/sessions/${sessionId}/executions/${executionId}/linear_view`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async sessions(
        workspaceId: string,
        workflowId: string,
        page: number,
        take: number,
        params?: IDataLineageSessionFilter
    ) {
        const convertToQueryParams = toQueryParams(this.sessionParamBuilder(params));
        const queryParams = convertToQueryParams ? `&${convertToQueryParams}` : '';
        const response = await $fetch<PaginationResponse<IDataLineageSession[]>>(
            `/workspaces/${workspaceId}/lineage/workflows/${workflowId}/sessions?cursor=${page}&take=${take}${queryParams}`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async steps(
        workspaceId: string,
        sessionId: string,
        executionId: string,
        stepIndex: number,
        type: SessionViewType,
        workflowId: string
    ) {
        const response = await $fetch<IDataLineageStep>(
            `/workspaces/${workspaceId}/lineage/workflows/${workflowId}/sessions/${sessionId}/executions/${executionId}/steps/${stepIndex}?viewType=${type}`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async stepExplanation(workspaceId: string, sessionId: string, executionId: string, body: unknown) {
        const response = await $fetch<IDataLineageStepExplanation>(
            `/workspaces/${workspaceId}/lineage/sessions/${sessionId}/executions/${executionId}/step_explanation`,
            {
                method: 'POST',
                headers: { 'x-workspace-id': workspaceId },
                body: JSON.stringify(body),
            }
        );

        return response.data;
    }

    async events(workspaceId: string, body: IDataLineageEvent) {
        const response = await $fetch<IDataLineageEvent>(`/workspaces/${workspaceId}/lineage/events`, {
            method: 'POST',
            headers: { 'x-workspace-id': workspaceId },
            body: JSON.stringify(body),
        });

        return response.data;
    }
}

export default LineageService;
