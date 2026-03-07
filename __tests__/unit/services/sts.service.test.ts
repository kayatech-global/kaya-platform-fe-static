import STSService from '@/services/sts.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('STSService', () => {
    let stsService: STSService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        stsService = new STSService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(stsService).toBeInstanceOf(STSService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const modelId = 'test-sts-id';
        const mockModelData = { id: modelId, name: 'Test STS Model', provider: 'elevenlabs' };
        const mockModelsList = [mockModelData];

        describe('get', () => {
            it('should fetch all STS models for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelsList,
                });

                const result = await stsService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/speech-to-speech-model`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific STS model by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockModelData,
                });

                const result = await stsService.getById(workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/speech-to-speech-model/${modelId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockModelData);
            });
        });

        describe('create', () => {
            const newModelData = { name: 'New STS Model', provider: 'microsoft' };

            it('should create a new STS model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newModelData, id: modelId },
                });

                const result = await stsService.create(newModelData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/speech-to-speech-model`, {
                    method: 'POST',
                    body: JSON.stringify(newModelData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newModelData, id: modelId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated STS Model' };

            it('should update an existing STS model', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockModelData, ...updateData },
                });

                const result = await stsService.update(updateData, workspaceId, modelId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/speech-to-speech-model/${modelId}`,
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
            it('should delete an STS model', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await stsService.delete(modelId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/speech-to-speech-model/${modelId}`,
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
