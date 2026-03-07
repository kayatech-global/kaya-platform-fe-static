import MessageBrokerService from '@/services/message-broker.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('MessageBrokerService', () => {
    let messageBrokerService: MessageBrokerService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        messageBrokerService = new MessageBrokerService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(messageBrokerService).toBeInstanceOf(MessageBrokerService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const queueId = 'test-queue-id';
        const mockQueueData = { id: queueId, name: 'Test Message Queue', type: 'rabbitmq' };
        const mockQueuesList = [mockQueueData];

        describe('get', () => {
            it('should fetch all message queues for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockQueuesList,
                });

                const result = await messageBrokerService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/message-queues`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockQueuesList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific message queue by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockQueueData,
                });

                const result = await messageBrokerService.getById(workspaceId, queueId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/message-queues/${queueId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockQueueData);
            });
        });

        describe('create', () => {
            const newQueueData = { name: 'New Message Queue', type: 'kafka' };

            it('should create a new message queue', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newQueueData, id: queueId },
                });

                const result = await messageBrokerService.create(newQueueData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/message-queues`, {
                    method: 'POST',
                    body: JSON.stringify(newQueueData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newQueueData, id: queueId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Message Queue' };

            it('should update an existing message queue', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockQueueData, ...updateData },
                });

                const result = await messageBrokerService.update(updateData, workspaceId, queueId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/message-queues/${queueId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockQueueData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a message queue', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await messageBrokerService.delete(queueId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/message-queues/${queueId}`,
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
