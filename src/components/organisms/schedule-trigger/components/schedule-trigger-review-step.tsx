import { useMemo } from 'react';
import { Label, TruncateCell } from '@/components/atoms';
import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { ScheduleTriggerStepInfoBox } from './schedule-trigger-step-info-box';
import { handleNoValue, isNullOrEmpty } from '@/lib/utils';
import {
    SCHEDULE_DATA_SOURCE_TYPES,
    SCHEDULE_TIMEZONE_TYPES,
    SCHEDULE_TRIGGER_TYPES,
    SCHEDULE_TYPES,
} from '@/constants';
import moment from 'moment';
import { ScheduleTriggerDataModeType } from '@/enums';
import { IConnectorTestQueryParams } from '@/models';

const ScheduleTriggerReviewStep = ({ isEdit, watch }: ScheduleTriggerFormProps) => {
    const scheduleTypes = useMemo(() => {
        return SCHEDULE_TYPES?.find(x => x.value === watch('configurations.scheduler.scheduleType'))?.name;
    }, [watch('configurations.scheduler.scheduleType')]);

    const scheduleTriggerType = useMemo(() => {
        if (watch('configurations.data.dataMode') === ScheduleTriggerDataModeType.STATIC_VARIABLES) {
            return 'Static';
        }
        return 'External';
    }, [watch('configurations.data.dataMode')]);

    const scheduleTriggerData = useMemo(() => {
        return SCHEDULE_TRIGGER_TYPES?.find(x => x.value === watch('configurations.data.dataMode'))?.label;
    }, [watch('configurations.data.dataMode')]);

    const scheduleTimezone = useMemo(() => {
        return SCHEDULE_TIMEZONE_TYPES?.find(x => x.value === watch('configurations.scheduler.timezone'))?.name;
    }, [watch('configurations.data.dataMode')]);

    const scheduleDataSourceType = useMemo(() => {
        return SCHEDULE_DATA_SOURCE_TYPES?.find(
            x => x.value === watch('configurations.data.externalDataSource.externalDataSourceType')
        )?.label;
    }, [watch('configurations.data.externalDataSource.externalDataSourceType')]);

    const buildQueryString = (params?: IConnectorTestQueryParams[]) => {
        return params?.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <ScheduleTriggerStepInfoBox
                    title="Ready to Save"
                    description={`Review your configuration below and click "${isEdit ? 'Update' : 'Create'}" to ${
                        isEdit ? 'update' : 'create'
                    } your scheduled workflow.`}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Configuration Summary</Label>
                <div className="mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                        <p className="text-xs font-normal">{handleNoValue(watch('name'))}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                        <TruncateCell
                            className="text-xs font-normal"
                            value={handleNoValue(watch('description')) as string}
                            length={40}
                        />
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Type</p>
                        <p className="text-xs font-normal">{handleNoValue(scheduleTypes)}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</p>
                        <p className="text-xs font-normal">{handleNoValue(scheduleTimezone)}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</p>
                        <p className="text-xs font-normal">
                            {handleNoValue(moment(watch('configurations.scheduler.startDate')).format('DD/MM/YYYY'))}
                        </p>
                    </div>
                    {!isNullOrEmpty(watch('configurations.scheduler.endDate') as never) && (
                        <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</p>
                            <p className="text-xs font-normal">
                                {handleNoValue(moment(watch('configurations.scheduler.endDate')).format('DD/MM/YYYY'))}
                            </p>
                        </div>
                    )}
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Mode</p>
                        <p className="text-xs font-normal">{handleNoValue(scheduleTriggerType)}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{scheduleTriggerData}</p>
                        {watch('configurations.data.dataMode') === ScheduleTriggerDataModeType.STATIC_VARIABLES ? (
                            <p className="text-xs font-normal">
                                {handleNoValue(buildQueryString(watch('configurations.data.workflowVariables')))}
                            </p>
                        ) : (
                            <p className="text-xs font-normal">{handleNoValue(scheduleDataSourceType)}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleTriggerReviewStep;
