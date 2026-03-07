import VariableService from '@/services/variable.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('VariableService', () => {
    let variableService: VariableService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        variableService = new VariableService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(variableService).toBeInstanceOf(VariableService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const variableId = 'test-variable-id';
        const mockVariableData = { id: variableId, name: 'Test Variable', value: 'test-value' };
        const mockVariablesList = [mockVariableData];

        describe('get', () => {
            it('should fetch all variables for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockVariablesList,
                });

                const result = await variableService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/variable`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockVariablesList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific variable by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockVariableData,
                });

                const result = await variableService.getById(workspaceId, variableId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/variable/${variableId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockVariableData);
            });
        });

        describe('create', () => {
            const newVariableData = { name: 'New Variable', value: 'new-value' };

            it('should create a new variable', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newVariableData, id: variableId },
                });

                const result = await variableService.create(newVariableData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/variable`, {
                    method: 'POST',
                    body: JSON.stringify(newVariableData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newVariableData, id: variableId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Variable' };

            it('should update an existing variable', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockVariableData, ...updateData },
                });

                const result = await variableService.update(updateData, workspaceId, variableId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/variable/${variableId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockVariableData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a variable', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await variableService.delete(variableId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/variable/${variableId}`,
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
