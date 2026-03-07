import EmbeddingModelService from '@/services/embedding-model.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('EmbeddingModelService', () => {
    let embeddingModelService: EmbeddingModelService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        embeddingModelService = new EmbeddingModelService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(embeddingModelService).toBeInstanceOf(EmbeddingModelService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const modelId = 'test-model-id';
        const mockModelData = { id: modelId, name: 'Test Embedding Model', provider: 'openai' };
        const mockModelsList = [mockModelData];

        describe('get', () => {
            it('should fetch all embedding models for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelsList,
                });

                const result = await embeddingModelService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/embedding-model`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific embedding model by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelData,
                });

                const result = await embeddingModelService.getById(workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/embedding-model/${modelId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelData);
            });
        });

        describe('create', () => {
            const newModelData = { name: 'New Model', provider: 'huggingface' };

            it('should create a new embedding model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newModelData, id: modelId },
                });

                const result = await embeddingModelService.create(newModelData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/embedding-model`, {
                    method: 'POST',
                    body: JSON.stringify(newModelData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newModelData, id: modelId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Model' };

            it('should update an existing embedding model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockModelData, ...updateData },
                });

                const result = await embeddingModelService.update(updateData, workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/embedding-model/${modelId}`,
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
            it('should delete an embedding model', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await embeddingModelService.delete(modelId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/embedding-model/${modelId}`,
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
