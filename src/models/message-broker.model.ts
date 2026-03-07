import { AuthenticationType, MessageBrokerTopicType } from '@/enums';
import { IBaseEntity } from './common.model';

export interface IMessageBroker extends IBaseEntity {
    name: string;
    description: string;
    provider: string;
    configurations: IMessageBrokerConfiguration;
}

export interface IMessageBrokerConfiguration {
    clusterUrl: string;
    authenticationType: AuthenticationType;
    meta?: IMessageBrokerConfigurationMeta;
    topics: IMessageBrokerTopic[];
}

export interface IMessageBrokerTopic {
    id: string;
    title: string;
    topicType: MessageBrokerTopicType;
    requestStructure: string;
}

export interface IMessageBrokerConfigurationMeta {
    username?: string;
    password?: string;
    token?: string;
    secret?: string;
    certificate?: string;
    clientKey?: string;
}

export interface IMessageBrokerSelector {
    id?: string;
    topicId?: string;
}

export interface IMessageBrokerFeedback {
    feedbackPublisher?: IMessageBrokerInputFeedback[];
    feedbackConsumer?: IMessageBrokerInputFeedback[];
}

export interface IMessageBrokerFeedbackTopic {
    topicProducer?: IMessageBrokerInputFeedback;
    topicConsumer?: IMessageBrokerInputFeedback;
}

export interface IMessageBrokerInputFeedback {
    messageBrokerId: string;
    topicId: string;
    requestStructure: string;
}
