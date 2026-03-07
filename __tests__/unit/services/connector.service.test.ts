import ConnectorService from '@/services/connector.service';
import { $fetch } from '@/utils';
import { IConnectorGenerateQuery, IConnectorTestQuery, IGenerateQueryResponse } from '@/models';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('ConnectorService', () => {
    let connectorService: ConnectorService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        connectorService = new ConnectorService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(connectorService).toBeInstanceOf(ConnectorService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const connectorId = 'test-connector-id';
        const mockConnectorData = { id: connectorId, name: 'Test Connector', type: 'postgresql' };
        const mockConnectorsList = [mockConnectorData];

        describe('get', () => {
            it('should fetch all connectors for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockConnectorsList,
                });

                const result = await connectorService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/connectors`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockConnectorsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific connector by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockConnectorData,
                });

                const result = await connectorService.getById(workspaceId, connectorId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/connectors/${connectorId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockConnectorData);
            });
        });

        describe('create', () => {
            const newConnectorData = { name: 'New Connector', type: 'mysql' };

            it('should create a new connector', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newConnectorData, id: connectorId },
                });

                const result = await connectorService.create(newConnectorData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/connectors`, {
                    method: 'POST',
                    body: JSON.stringify(newConnectorData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newConnectorData, id: connectorId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Connector' };

            it('should update an existing connector', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockConnectorData, ...updateData },
                });

                const result = await connectorService.update(updateData, workspaceId, connectorId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/connectors/${connectorId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockConnectorData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a connector', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await connectorService.delete(connectorId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/connectors/${connectorId}`,
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

    describe('custom methods', () => {
        const workspaceId = 'test-workspace-id';
        const testQueryData: IConnectorTestQuery = {
            databaseId: 'test-connector-id',
            query: 'SELECT * FROM test_table',
            parameters: [],
        };
        const generateQueryData: IConnectorGenerateQuery = {
            databaseId: 'test-connector-id',
            databaseSchema: 'users(id: int, name: string)',
            userPrompt: 'Get all users',
        };
        const mockGenerateResponse: IGenerateQueryResponse = {
            generatedQuery: 'SELECT * FROM users',
        };

        describe('testQuery', () => {
            it('should test a connector query', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true, results: [] },
                });

                const result = await connectorService.testQuery(testQueryData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/connectors/test-query`, {
                    method: 'POST',
                    body: JSON.stringify(testQueryData),
                    headers: {
                        'x-workspace-id': workspaceId,
                    },
                });
                expect(result).toEqual({ success: true, results: [] });
            });

            it('should handle test query errors', async () => {
                const error = new Error('Query failed') as Error & { status?: number };
                error.status = 400;
                mockFetch.mockRejectedValue(error);

                await expect(connectorService.testQuery(testQueryData, workspaceId)).rejects.toThrow('Query failed');
            });
        });

        describe('aiQuery', () => {
            it('should generate an AI query', async () => {
                mockFetch.mockResolvedValue({
                    data: mockGenerateResponse,
                });

                const result = await connectorService.aiQuery(generateQueryData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/connectors/ai-query`, {
                    method: 'POST',
                    body: JSON.stringify(generateQueryData),
                    headers: {
                        'x-workspace-id': workspaceId,
                    },
                });
                expect(result).toEqual(mockGenerateResponse);
            });

            it('should handle AI query errors', async () => {
                const error = new Error('AI generation failed') as Error & { status?: number };
                error.status = 500;
                mockFetch.mockRejectedValue(error);

                await expect(connectorService.aiQuery(generateQueryData, workspaceId)).rejects.toThrow(
                    'AI generation failed'
                );
            });
        });
    });
});
