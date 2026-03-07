export enum ScheduleTriggerType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    INTERVAL = 'INTERVAL',
    CRON_EXPRESSION = 'CRON_EXPRESSION',
}

export enum ScheduleTriggerTimezoneType {
    EMPTY = '',
    UTC = 'UTC',
    EASTERN_TIME = 'EASTERN_TIME',
    CENTRAL_TIME = 'CENTRAL_TIME',
    MOUNTAIN_TIME = 'MOUNTAIN_TIME',
    PACIFIC_TIME = 'PACIFIC_TIME',
}

export enum ScheduleTriggerDataModeType {
    STATIC_VARIABLES = 'STATIC_VARIABLES',
    EXTERNAL_DATA_SOURCE = 'EXTERNAL_DATA_SOURCE',
}

export enum ScheduleTriggerDataSourceType {
    API = 'API',
    CONNECTOR = 'CONNECTOR',
    FILE = 'FILE',
}

export enum ScheduleTriggerFileSourceType {
    UPLOAD = 'UPLOAD',
    FILE_URL = 'FILE_URL',
}

export enum ScheduleTriggerStepType {
    BASIC = 1,
    SCHEDULE,
    DATA,
    REVIEW,
}
