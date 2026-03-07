export enum MessageBrokerTopicType {
    Inbound = 'Inbound',
    Outbound = 'Outbound',
}

export enum MessageBrokerProviderType {
    ApacheKafka = 'kafka_apache',
    AWS_MSK_Provisioned = 'aws_msk_provisioned',
}

export enum MessageBrokerTriggerType {
    MessageBroker = 'Message Broker',
    API = 'API',
    Recurring = 'SCHEDULER',
}

export enum MessageBrokerSelectorType {
    OutputBroadcasting = 'Output Broadcasting',
}
