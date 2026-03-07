import LLMService from '@/services/llm.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('LLMService', () => {
    let llmService: LLMService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        llmService = new LLMService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(llmService).toBeInstanceOf(LLMService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const modelId = 'test-llm-id';
        const mockModelData = { id: modelId, name: 'Test LLM', provider: 'openai' };
        const mockModelsList = [mockModelData];

        describe('get', () => {
            it('should fetch all LLMs for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelsList,
                });

                const result = await llmService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/llm`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific LLM by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelData,
                });

                const result = await llmService.getById(workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/llm/${modelId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelData);
            });
        });

        describe('create', () => {
            const newModelData = { name: 'New LLM', provider: 'anthropic' };

            it('should create a new LLM', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newModelData, id: modelId },
                });

                const result = await llmService.create(newModelData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/llm`, {
                    method: 'POST',
                    body: JSON.stringify(newModelData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newModelData, id: modelId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated LLM' };

            it('should update an existing LLM', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockModelData, ...updateData },
                });

                const result = await llmService.update(updateData, workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/llm/${modelId}`,
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
            it('should delete an LLM', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await llmService.delete(modelId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/llm/${modelId}`,
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
