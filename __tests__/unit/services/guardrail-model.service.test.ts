import GuardrailModelService from '@/services/guardrail-model.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('GuardrailModelService', () => {
    let guardrailModelService: GuardrailModelService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        guardrailModelService = new GuardrailModelService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(guardrailModelService).toBeInstanceOf(GuardrailModelService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const modelId = 'test-model-id';
        const mockModelData = { id: modelId, name: 'Test Guardrail Model', provider: 'openai' };
        const mockModelsList = [mockModelData];

        describe('get', () => {
            it('should fetch all guardrail models for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelsList,
                });

                const result = await guardrailModelService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/guardrails/model`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific guardrail model by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelData,
                });

                const result = await guardrailModelService.getById(workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/guardrails/model/${modelId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelData);
            });
        });

        describe('create', () => {
            const newModelData = { name: 'New Guardrail Model', provider: 'anthropic' };

            it('should create a new guardrail model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newModelData, id: modelId },
                });

                const result = await guardrailModelService.create(newModelData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/guardrails/model`, {
                    method: 'POST',
                    body: JSON.stringify(newModelData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newModelData, id: modelId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Guardrail Model' };

            it('should update an existing guardrail model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockModelData, ...updateData },
                });

                const result = await guardrailModelService.update(updateData, workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/guardrails/model/${modelId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockModelData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a guardrail model', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await guardrailModelService.delete(modelId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/guardrails/model/${modelId}`,
                    {
                        method: 'DELETE',
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ success: true });
            });
        });
    });
});
