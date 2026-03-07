import GraphRagService from '@/services/graph-rag.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('GraphRagService', () => {
    let graphRagService: GraphRagService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        graphRagService = new GraphRagService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(graphRagService).toBeInstanceOf(GraphRagService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const ragId = 'test-rag-id';
        const mockRagData = { id: ragId, name: 'Test Graph RAG', description: 'Test description' };
        const mockRagsList = [mockRagData];

        describe('get', () => {
            it('should fetch all graph RAGs for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockRagsList,
                });

                const result = await graphRagService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/graph-rag`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockRagsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific graph RAG by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockRagData,
                });

                const result = await graphRagService.getById(workspaceId, ragId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/graph-rag/${ragId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockRagData);
            });
        });

        describe('create', () => {
            const newRagData = { name: 'New Graph RAG', description: 'New description' };

            it('should create a new graph RAG', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newRagData, id: ragId },
                });

                const result = await graphRagService.create(newRagData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/graph-rag`, {
                    method: 'POST',
                    body: JSON.stringify(newRagData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newRagData, id: ragId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Graph RAG' };

            it('should update an existing graph RAG', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockRagData, ...updateData },
                });

                const result = await graphRagService.update(updateData, workspaceId, ragId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/graph-rag/${ragId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockRagData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a graph RAG', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await graphRagService.delete(ragId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/graph-rag/${ragId}`,
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
