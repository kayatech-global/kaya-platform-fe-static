import BaseService from './base.service';

class VaultService extends BaseService {
    constructor() {
        super('key-vault');
    }

    async get<T>(workspaceId: string) {
        return [] as any as T;
    }
}

export default VaultService;
