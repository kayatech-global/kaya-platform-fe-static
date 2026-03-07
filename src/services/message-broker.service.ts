import BaseService from './base.service';

class MessageBrokerService extends BaseService {
    constructor() {
        super('message-queues');
    }
}

export default MessageBrokerService;
