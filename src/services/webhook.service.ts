import BaseService from './base.service';

class WebhookService extends BaseService {
    constructor() {
        super('webhooks');
    }

    async get<T>(workspaceId: string) {
        return [] as any as T;
    }
}

export default WebhookService;
