import ReRankingModelService from '@/services/reranking-model.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('ReRankingModelService', () => {
    let rerankingModelService: ReRankingModelService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        rerankingModelService = new ReRankingModelService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(rerankingModelService).toBeInstanceOf(ReRankingModelService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const modelId = 'test-model-id';
        const mockModelData = { id: modelId, name: 'Test Reranking Model', provider: 'cohere' };
        const mockModelsList = [mockModelData];

        describe('get', () => {
            it('should fetch all reranking models for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelsList,
                });

                const result = await rerankingModelService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/reranking-model`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific reranking model by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelData,
                });

                const result = await rerankingModelService.getById(workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/reranking-model/${modelId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelData);
            });
        });

        describe('create', () => {
            const newModelData = { name: 'New Reranking Model', provider: 'bge' };

            it('should create a new reranking model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newModelData, id: modelId },
                });

                const result = await rerankingModelService.create(newModelData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/reranking-model`, {
                    method: 'POST',
                    body: JSON.stringify(newModelData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newModelData, id: modelId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Reranking Model' };

            it('should update an existing reranking model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockModelData, ...updateData },
                });

                const result = await rerankingModelService.update(updateData, workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/reranking-model/${modelId}`,
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
            it('should delete a reranking model', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await rerankingModelService.delete(modelId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/reranking-model/${modelId}`,
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
