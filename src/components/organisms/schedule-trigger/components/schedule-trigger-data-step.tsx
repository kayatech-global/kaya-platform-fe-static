import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { ScheduleTriggerStepInfoBox } from './schedule-trigger-step-info-box';
import { Controller } from 'react-hook-form';
import { RadioGroup } from '@/components/atoms/radio-group';
import RadioCard from '@/components/molecules/radio-card/radio-card';
import { SCHEDULE_TRIGGER_TYPES } from '@/constants';
import { ScheduleTriggerDataModeType } from '@/enums';
import { Input, Label } from '@/components';
import { get } from 'lodash';
import { ScheduleExternalDataSource } from './schedule-external-data-source';
import { ScheduleStaticVariables } from './schedule-static-variables';

const ScheduleTriggerDataStep = (props: ScheduleTriggerFormProps) => {
    const { control, errors, isEdit, isReadOnly, register, watch } = props;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <ScheduleTriggerStepInfoBox
                    title="Execution Data Configuration"
                    description="Choose how to provide data for each workflow execution. Use static values for consistent data or fetch from external sources for dynamic execution."
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Data Mode</Label>
                    <Controller
                        control={control}
                        name="configurations.data.dataMode"
                        rules={{
                            required: { value: true, message: 'Please select a data mode' },
                        }}
                        render={({ field }) => (
                            <RadioGroup
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isEdit && isReadOnly}
                            >
                                {SCHEDULE_TRIGGER_TYPES?.map((item) => (
                                    <RadioCard
                                        key={item.value}
                                        value={item.value}
                                        label={item.label}
                                        description={item.description}
                                        checked={field.value === item.value}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    />
                </div>
                {!!errors?.configurations?.data?.dataMode?.message && (
                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                        {errors?.configurations?.data?.dataMode?.message}
                    </p>
                )}
            </div>

            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('configurations.data.message', {
                        required: { value: true, message: 'Please enter a message' },
                    })}
                    label="Message"
                    placeholder="Enter a Message"
                    autoComplete="off"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!get(errors, 'configurations.data.message.message')}
                    supportiveText={get(errors, 'configurations.data.message.message')}
                />
            </div>

            {watch('configurations.data.dataMode') === ScheduleTriggerDataModeType.STATIC_VARIABLES && (
                <ScheduleStaticVariables {...props} />
            )}

            {watch('configurations.data.dataMode') === ScheduleTriggerDataModeType.EXTERNAL_DATA_SOURCE && (
                <ScheduleExternalDataSource {...props} />
            )}
        </div>
    );
};

export default ScheduleTriggerDataStep;
