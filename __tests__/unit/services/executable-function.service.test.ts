import ExecutableFunctionService from '@/services/executable-function.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('ExecutableFunctionService', () => {
    let executableFunctionService: ExecutableFunctionService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        executableFunctionService = new ExecutableFunctionService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(executableFunctionService).toBeInstanceOf(ExecutableFunctionService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const functionId = 'test-function-id';
        const mockFunctionData = { id: functionId, name: 'Test Function', description: 'Test description' };
        const mockFunctionsList = [mockFunctionData];

        describe('get', () => {
            it('should fetch all executable functions for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockFunctionsList,
                });

                const result = await executableFunctionService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/executable-function`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockFunctionsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific executable function by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockFunctionData,
                });

                const result = await executableFunctionService.getById(workspaceId, functionId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/executable-function/${functionId}`,
                    {
                        headers: { 'x-workspace-id': workspaceId },
                    }
                );
                expect(result).toEqual(mockFunctionData);
            });
        });

        describe('create', () => {
            const newFunctionData = { name: 'New Function', description: 'New description' };

            it('should create a new executable function', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newFunctionData, id: functionId },
                });

                const result = await executableFunctionService.create(newFunctionData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tools/executable-function`, {
                    method: 'POST',
                    body: JSON.stringify(newFunctionData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newFunctionData, id: functionId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Function' };

            it('should update an existing executable function', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockFunctionData, ...updateData },
                });

                const result = await executableFunctionService.update(updateData, workspaceId, functionId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/executable-function/${functionId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockFunctionData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete an executable function', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await executableFunctionService.delete(functionId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/tools/executable-function/${functionId}`,
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
