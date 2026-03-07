import McpService from '@/services/mcp.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('McpService', () => {
    let mcpService: McpService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        mcpService = new McpService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(mcpService).toBeInstanceOf(McpService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const mcpId = 'test-mcp-id';
        const mockMcpData = { id: mcpId, name: 'Test MCP', description: 'Test description' };
        const mockMcpList = [mockMcpData];

        describe('get', () => {
            it('should fetch all MCPs for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockMcpList,
                });

                const result = await mcpService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/mcp`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockMcpList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific MCP by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockMcpData,
                });

                const result = await mcpService.getById(workspaceId, mcpId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/mcp/${mcpId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockMcpData);
            });
        });

        describe('create', () => {
            const newMcpData = { name: 'New MCP', description: 'New description' };

            it('should create a new MCP', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newMcpData, id: mcpId },
                });

                const result = await mcpService.create(newMcpData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/mcp`, {
                    method: 'POST',
                    body: JSON.stringify(newMcpData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newMcpData, id: mcpId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated MCP' };

            it('should update an existing MCP', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockMcpData, ...updateData },
                });

                const result = await mcpService.update(updateData, workspaceId, mcpId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/mcp/${mcpId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockMcpData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete an MCP', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await mcpService.delete(mcpId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/mcp/${mcpId}`,
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
