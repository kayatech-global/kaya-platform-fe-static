import { MessageBrokerTriggerType } from '@/enums';
import { IMessageBrokerFeedbackTopic, IMessageBrokerInputFeedback } from './message-broker.model';

export interface INodeHumanInput extends IMessageBrokerFeedbackTopic {
    enableHumanInput: boolean;
    instruction: string;
    enableBroker: boolean;
    option?: MessageBrokerTriggerType;
}

export interface IMessagePublisher {
    option: MessageBrokerTriggerType;
    topicProducer: IMessageBrokerInputFeedback;
}
