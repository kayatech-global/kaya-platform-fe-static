import DatabaseService from '@/services/database.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('DatabaseService', () => {
    let databaseService: DatabaseService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        databaseService = new DatabaseService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(databaseService).toBeInstanceOf(DatabaseService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const databaseId = 'test-database-id';
        const mockDatabaseData = { id: databaseId, name: 'Test Database', type: 'postgresql' };
        const mockDatabasesList = [mockDatabaseData];

        describe('get', () => {
            it('should fetch all databases for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockDatabasesList,
                });

                const result = await databaseService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/databases`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockDatabasesList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific database by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockDatabaseData,
                });

                const result = await databaseService.getById(workspaceId, databaseId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/databases/${databaseId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockDatabaseData);
            });
        });

        describe('create', () => {
            const newDatabaseData = { name: 'New Database', type: 'mysql' };

            it('should create a new database', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newDatabaseData, id: databaseId },
                });

                const result = await databaseService.create(newDatabaseData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/databases`, {
                    method: 'POST',
                    body: JSON.stringify(newDatabaseData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newDatabaseData, id: databaseId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Database' };

            it('should update an existing database', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockDatabaseData, ...updateData },
                });

                const result = await databaseService.update(updateData, workspaceId, databaseId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/databases/${databaseId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockDatabaseData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a database', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await databaseService.delete(databaseId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/databases/${databaseId}`,
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
