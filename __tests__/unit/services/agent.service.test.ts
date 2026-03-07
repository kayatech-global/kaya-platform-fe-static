import AgentService from '@/services/agent.service';
import { $fetch } from '@/utils';

// Mock the $fetch utility
jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

// Mock the environment config
jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('AgentService', () => {
    let agentService: AgentService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        agentService = new AgentService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(agentService).toBeInstanceOf(AgentService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const agentId = 'test-agent-id';
        const mockAgentData = { id: agentId, name: 'Test Agent', type: 'chatbot' };
        const mockAgentsList = [mockAgentData];

        describe('get', () => {
            it('should fetch all agents for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockAgentsList,
                });

                const result = await agentService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/agent`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockAgentsList);
            });

            it('should handle fetch errors when getting agents', async () => {
                const error = new Error('Network error') as Error & { status?: number };
                error.status = 500;
                mockFetch.mockRejectedValue(error);

                await expect(agentService.get(workspaceId)).rejects.toThrow('Network error');
            });
        });

        describe('getById', () => {
            it('should fetch a specific agent by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockAgentData,
                });

                const result = await agentService.getById(workspaceId, agentId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/agent/${agentId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockAgentData);
            });

            it('should handle fetch errors when getting agent by ID', async () => {
                const error = new Error('Agent not found') as Error & { status?: number };
                error.status = 404;
                mockFetch.mockRejectedValue(error);

                await expect(agentService.getById(workspaceId, agentId)).rejects.toThrow('Agent not found');
            });
        });

        describe('create', () => {
            const newAgentData = { name: 'New Agent', type: 'voice' };

            it('should create a new agent', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newAgentData, id: agentId },
                });

                const result = await agentService.create(newAgentData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/agent`, {
                    method: 'POST',
                    body: JSON.stringify(newAgentData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newAgentData, id: agentId });
            });

            it('should handle fetch errors when creating agent', async () => {
                const error = new Error('Validation failed') as Error & { status?: number };
                error.status = 400;
                mockFetch.mockRejectedValue(error);

                await expect(agentService.create(newAgentData, workspaceId)).rejects.toThrow('Validation failed');
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Agent' };

            it('should update an existing agent', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockAgentData, ...updateData },
                });

                const result = await agentService.update(updateData, workspaceId, agentId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/agent/${agentId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockAgentData, ...updateData });
            });

            it('should handle fetch errors when updating agent', async () => {
                const error = new Error('Update failed') as Error & { status?: number };
                error.status = 500;
                mockFetch.mockRejectedValue(error);

                await expect(agentService.update(updateData, workspaceId, agentId)).rejects.toThrow('Update failed');
            });
        });

        describe('delete', () => {
            it('should delete an agent', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await agentService.delete(agentId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/agent/${agentId}`,
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

            it('should handle fetch errors when deleting agent', async () => {
                const error = new Error('Delete failed') as Error & { status?: number };
                error.status = 500;
                mockFetch.mockRejectedValue(error);

                await expect(agentService.delete(agentId, workspaceId)).rejects.toThrow('Delete failed');
            });
        });
    });
});
