import VaultService from '@/services/vault.service';
import { $fetch } from '@/utils';

jest.mock('@/utils', () => ({
    $fetch: jest.fn(),
}));

jest.mock('@/config/environment-variables', () => ({
    BASE_API_URL: 'http://localhost:3000/api',
}));

describe('VaultService', () => {
    let vaultService: VaultService;
    let mockFetch: jest.MockedFunction<typeof $fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        vaultService = new VaultService();
        mockFetch = $fetch as jest.MockedFunction<typeof $fetch>;
    });

    describe('constructor', () => {
        it('should create an instance with correct path', () => {
            expect(vaultService).toBeInstanceOf(VaultService);
        });
    });

    describe('inherited methods from BaseService', () => {
        const workspaceId = 'test-workspace-id';
        const vaultId = 'test-vault-id';
        const mockVaultData = { id: vaultId, name: 'Test Vault', type: 'hashicorp' };
        const mockVaultsList = [mockVaultData];

        describe('get', () => {
            it('should fetch all vaults for a workspace', async () => {
                mockFetch.mockResolvedValue({
                    data: mockVaultsList,
                });

                const result = await vaultService.get(workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/key-vault`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockVaultsList);
            });
        });

        describe('getById', () => {
            it('should fetch a specific vault by ID', async () => {
                mockFetch.mockResolvedValue({
                    data: mockVaultData,
                });

                const result = await vaultService.getById(workspaceId, vaultId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/key-vault/${vaultId}`, {
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual(mockVaultData);
            });
        });

        describe('create', () => {
            const newVaultData = { name: 'New Vault', type: 'aws' };

            it('should create a new vault', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...newVaultData, id: vaultId },
                });

                const result = await vaultService.create(newVaultData, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(`/workspaces/${workspaceId}/key-vault`, {
                    method: 'POST',
                    body: JSON.stringify(newVaultData),
                    headers: { 'x-workspace-id': workspaceId },
                });
                expect(result).toEqual({ ...newVaultData, id: vaultId });
            });
        });

        describe('update', () => {
            const updateData = { name: 'Updated Vault' };

            it('should update an existing vault', async () => {
                mockFetch.mockResolvedValue({
                    data: { ...mockVaultData, ...updateData },
                });

                const result = await vaultService.update(updateData, workspaceId, vaultId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/key-vault/${vaultId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(updateData),
                        headers: { 'x-workspace-id': workspaceId },
                    },
                    {
                        denyRedirectOnForbidden: true,
                    }
                );
                expect(result).toEqual({ ...mockVaultData, ...updateData });
            });
        });

        describe('delete', () => {
            it('should delete a vault', async () => {
                mockFetch.mockResolvedValue({
                    data: { success: true },
                });

                const result = await vaultService.delete(vaultId, workspaceId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `/workspaces/${workspaceId}/key-vault/${vaultId}`,
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
