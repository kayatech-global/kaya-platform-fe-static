/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DaysOfWeekType,
    ScheduleTriggerDataModeType,
    ScheduleTriggerDataSourceType,
    ScheduleTriggerFileSourceType,
    ScheduleTriggerTimezoneType,
    ScheduleTriggerType,
    TimeUnitType,
} from '@/enums';
import { IBaseEntity } from './common.model';
import { IConnectorTestQueryParams } from './connector.model';

export interface IScheduleTrigger extends IBaseEntity {
    name: string;
    description: string;
    configurations: IScheduleTriggerCOnfiguration;
}

export interface IScheduleTriggerCOnfiguration {
    scheduler: IScheduleTriggerStructure;
    data: IScheduleTriggerData;
}

export interface IScheduleTriggerStructure {
    scheduleType: ScheduleTriggerType;
    timeOfDay?: string | null;
    daysOfWeek?: DaysOfWeekType[];
    dayOfMonth?: number;
    interval?: number;
    unit?: TimeUnitType;
    cronExpression?: string;
    time?: string | null;
    timezone: ScheduleTriggerTimezoneType;
    startDate: Date | null;
    endDate?: Date | null;
}

export interface IScheduleTriggerData {
    message: string;
    dataMode: ScheduleTriggerDataModeType;
    workflowVariables?: IConnectorTestQueryParams[];
    externalDataSource?: IScheduleTriggerExternalDataSource;
}

export interface IScheduleTriggerExternalDataSource {
    externalDataSourceType: ScheduleTriggerDataSourceType;
    toolId?: string;
    connector?: IScheduleTriggerConnector;
    file?: IScheduleTriggerFile;
    responseStructure?: string;
}

export interface IScheduleTriggerFile {
    schema?: File | null;
    source: ScheduleTriggerFileSourceType;
    reference?: IScheduleTriggerFileReference;
    fileUrl?: string;
    sheetName?: string;
    hasHeaderRow: boolean;
    startFromRow?: number | null;
}

export interface IScheduleTriggerConnector {
    id: string;
    variables?: IConnectorTestQueryParams[];
}

export interface IScheduleTriggerFileReference {
    size: number;
    mimeType: string;
    originalName: string;
}
