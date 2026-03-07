import { OptionModel } from '@/components';
import {
    ScheduleTriggerDataModeType,
    ScheduleTriggerDataSourceType,
    ScheduleTriggerTimezoneType,
    ScheduleTriggerType,
    TimeUnitType,
} from '@/enums';

const structurePlaceholder = `{
  "customers": [
    {
      "id": Variable:customer_id,
      "email": Variable:email
    }
  ]
}`;

const tooltip = (
    <div>
        <p className="text-xs font-bold text-gray-400">How to Map Response to Variables:</p>
        <ul className="list-disc pl-4 space-y-1 pt-2 pb-2">
            <li>Use @variable_name to map fields to workflow variables</li>
            <li>The structure should match your expected API, Connector or File response</li>
            <li>Only the top-level array or object will be iterated for workflow execution</li>
        </ul>
        <p className="text-xs font-normal text-gray-400">
            Example: {`{ "customers": [{ "id": "@customer_id", "email": "@user_email" }] }`}
        </p>
    </div>
);

const intervalTooltip = (
    <div>
        <ul className="list-disc pl-4 space-y-1">
            <li>Minutes: 1 - 1,440</li>
            <li>Hours: 1 - 24</li>
            <li>Days: 1 - 366</li>
        </ul>
    </div>
);

export const SCHEDULE_TRIGGER_TYPES = [
    {
        value: ScheduleTriggerDataModeType.STATIC_VARIABLES,
        label: 'Static Variables',
        description: 'Use pre-configured values that remain the same for each execution',
    },
    {
        value: ScheduleTriggerDataModeType.EXTERNAL_DATA_SOURCE,
        label: 'External Data Source',
        description: 'Fetch data from API, connector, or file before each execution',
    },
];

export const SCHEDULE_TYPES: OptionModel[] = [
    {
        value: ScheduleTriggerType.DAILY,
        name: 'Daily',
    },
    {
        value: ScheduleTriggerType.WEEKLY,
        name: 'Weekly',
    },
    {
        value: ScheduleTriggerType.MONTHLY,
        name: 'Monthly',
    },
    {
        value: ScheduleTriggerType.INTERVAL,
        name: 'Interval',
    },
    {
        value: ScheduleTriggerType.CRON_EXPRESSION,
        name: 'Cron Expression',
    },
];

export const SCHEDULE_UNIT_TYPES: OptionModel[] = [
    {
        value: TimeUnitType.MINUTES,
        name: 'Minutes',
    },
    {
        value: TimeUnitType.HOURS,
        name: 'Hours',
    },
    {
        value: TimeUnitType.DAYS,
        name: 'Days',
    },
];

export const SCHEDULE_TIMEZONE_TYPES: OptionModel[] = [
    {
        value: ScheduleTriggerTimezoneType.UTC,
        name: 'UTC',
    },
    {
        value: ScheduleTriggerTimezoneType.EASTERN_TIME,
        name: 'Eastern Time',
    },
    {
        value: ScheduleTriggerTimezoneType.CENTRAL_TIME,
        name: 'Central Time',
    },
    {
        value: ScheduleTriggerTimezoneType.MOUNTAIN_TIME,
        name: 'Mountain Time',
    },
    {
        value: ScheduleTriggerTimezoneType.PACIFIC_TIME,
        name: 'Pacific Time',
    },
];

export const SCHEDULE_DATA_SOURCE_TYPES = [
    {
        value: ScheduleTriggerDataSourceType.API,
        label: 'API',
    },
    {
        value: ScheduleTriggerDataSourceType.CONNECTOR,
        label: 'Connector',
    },
    {
        value: ScheduleTriggerDataSourceType.FILE,
        label: 'Excel/CSV',
    },
];

export const SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_TOOLTIP = tooltip;

export const SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_PLACEHOLDER = structurePlaceholder;

export const SCHEDULE_DATA_SOURCE_INTERVAL_TOOLTIP = intervalTooltip;
