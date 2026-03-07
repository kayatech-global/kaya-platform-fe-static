import { useEffect, useMemo } from 'react';
import { DatePicker, DaysOfWeekSelector, Input, Select, TimePicker } from '@/components/atoms';
import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { ScheduleTriggerStepInfoBox } from './schedule-trigger-step-info-box';
import {
    SCHEDULE_DATA_SOURCE_INTERVAL_TOOLTIP,
    SCHEDULE_TIMEZONE_TYPES,
    SCHEDULE_TYPES,
    SCHEDULE_UNIT_TYPES,
} from '@/constants';
import { ScheduleTriggerType, TimeUnitType } from '@/enums';
import { Controller } from 'react-hook-form';
import { sanitizeNumericInput } from '@/lib/utils';
import { isValidCron } from 'cron-validator';

const ScheduleTriggerStep = ({
    control,
    errors,
    isEdit,
    isReadOnly,
    register,
    watch,
    trigger,
}: ScheduleTriggerFormProps) => {
    useEffect(() => {
        if (watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.INTERVAL) {
            (async () => await trigger('configurations.scheduler.interval'))();
        }
    }, [watch('configurations.scheduler.unit'), watch('configurations.scheduler.scheduleType')]);

    const intervalRules = useMemo(() => {
        if (watch('configurations.scheduler.unit') === TimeUnitType.DAYS) {
            return {
                max: {
                    value: 366,
                    message: 'Interval cannot exceed 366',
                },
            };
        } else if (watch('configurations.scheduler.unit') === TimeUnitType.MINUTES) {
            return {
                max: {
                    value: 1440,
                    message: 'Interval cannot exceed 1440',
                },
            };
        }
        return {
            max: {
                value: 24,
                message: 'Interval cannot exceed 24',
            },
        };
    }, [watch('configurations.scheduler.unit')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <ScheduleTriggerStepInfoBox
                    title="Schedule Configuration"
                    description="Define when and how often your workflow should execute. Choose from simple intervals or advanced cron expressions for complex scheduling needs."
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('configurations.scheduler.scheduleType', {
                        required: { value: true, message: 'Please select a schedule type' },
                    })}
                    label="Schedule Type"
                    placeholder="Select a Schedule Type"
                    options={SCHEDULE_TYPES}
                    currentValue={watch('configurations.scheduler.scheduleType')}
                    disabled={isEdit && isReadOnly}
                    isDestructive={!!errors?.configurations?.scheduler?.scheduleType?.message}
                    supportiveText={errors?.configurations?.scheduler?.scheduleType?.message}
                />
            </div>
            {watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.INTERVAL ? (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('configurations.scheduler.interval', {
                                required: { value: true, message: 'Please enter an interval' },
                                min: {
                                    value: 1,
                                    message: 'Interval must be at least 1',
                                },
                                ...intervalRules,
                                valueAsNumber: true,
                            })}
                            label="Interval"
                            placeholder="Enter an Interval"
                            type="number"
                            helperInfo={SCHEDULE_DATA_SOURCE_INTERVAL_TOOLTIP}
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.scheduler?.interval?.message}
                            supportiveText={errors?.configurations?.scheduler?.interval?.message}
                            onInput={sanitizeNumericInput}
                        />
                        <Select
                            {...register('configurations.scheduler.unit', {
                                required: { value: true, message: 'Please select an unit' },
                            })}
                            label="Unit"
                            placeholder="Select an Unit"
                            options={SCHEDULE_UNIT_TYPES}
                            currentValue={watch('configurations.scheduler.unit')}
                            disabled={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.scheduler?.unit?.message}
                            supportiveText={errors?.configurations?.scheduler?.unit?.message}
                        />
                    </div>
                </div>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    {watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.DAILY && (
                        <Controller
                            control={control}
                            name="configurations.scheduler.timeOfDay"
                            rules={{
                                required: { value: true, message: 'Please select a time of day' },
                            }}
                            render={({ field, fieldState }) => (
                                <TimePicker
                                    {...field}
                                    label="Time of Day"
                                    placeholder="Pick a Time of Day"
                                    value={field.value || undefined}
                                    onValueChange={field.onChange}
                                    disabled={isEdit && isReadOnly}
                                    isDestructive={!!fieldState?.error?.message}
                                    supportiveText={fieldState?.error?.message}
                                />
                            )}
                        />
                    )}
                    {watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.WEEKLY && (
                        <Controller
                            control={control}
                            name="configurations.scheduler.daysOfWeek"
                            rules={{
                                required: { value: true, message: 'Please select a days of week' },
                            }}
                            render={({ field, fieldState }) => (
                                <>
                                    <DaysOfWeekSelector
                                        label="Days of Week"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isEdit && isReadOnly}
                                    />
                                    {!!fieldState?.error?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {fieldState?.error?.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    )}
                    {watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.MONTHLY && (
                        <Input
                            {...register('configurations.scheduler.dayOfMonth', {
                                required: { value: true, message: 'Please enter a day of month' },
                                min: {
                                    value: 1,
                                    message: 'Day of month must be at least 1',
                                },
                                max: {
                                    value: 31,
                                    message: 'Day of month cannot exceed 31',
                                },
                                valueAsNumber: true,
                            })}
                            label="Day of Month"
                            helperInfo="If selected date doesn't exist in a month, trigger runs on the last day of that month"
                            placeholder="Enter a Day of Month"
                            type="number"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.scheduler?.dayOfMonth?.message}
                            supportiveText={errors?.configurations?.scheduler?.dayOfMonth?.message}
                            onInput={sanitizeNumericInput}
                        />
                    )}
                    {watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.CRON_EXPRESSION && (
                        <Input
                            {...register('configurations.scheduler.cronExpression', {
                                required: 'Please enter a Cron Expression',
                                validate: value =>
                                    isValidCron(value as string, { seconds: false }) || 'Enter a valid cron expression',
                            })}
                            label="Cron Expression"
                            placeholder="Enter a Cron Expression"
                            helperInfo="Example: 0 0 * * * - triggers every day at midnight"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.scheduler?.cronExpression?.message}
                            supportiveText={errors?.configurations?.scheduler?.cronExpression?.message}
                        />
                    )}
                </div>
            )}

            {(watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.WEEKLY ||
                watch('configurations.scheduler.scheduleType') === ScheduleTriggerType.MONTHLY) && (
                <div className="col-span-1 sm:col-span-2">
                    <Controller
                        control={control}
                        name="configurations.scheduler.time"
                        rules={{
                            required: { value: true, message: 'Please select a time' },
                        }}
                        render={({ field, fieldState }) => (
                            <TimePicker
                                {...field}
                                label="Time"
                                placeholder="Pick a time"
                                value={field.value || undefined}
                                onValueChange={field.onChange}
                                disabled={isEdit && isReadOnly}
                                isDestructive={!!fieldState?.error?.message}
                                supportiveText={fieldState?.error?.message}
                            />
                        )}
                    />
                </div>
            )}

            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('configurations.scheduler.timezone', {
                        required: { value: true, message: 'Please select a timezone' },
                    })}
                    label="Timezone"
                    placeholder="Select a Timezone"
                    options={SCHEDULE_TIMEZONE_TYPES}
                    currentValue={watch('configurations.scheduler.timezone')}
                    disabled={isEdit && isReadOnly}
                    isDestructive={!!errors?.configurations?.scheduler?.timezone?.message}
                    supportiveText={errors?.configurations?.scheduler?.timezone?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                        control={control}
                        name="configurations.scheduler.startDate"
                        rules={{
                            required: { value: true, message: 'Please pick a start date' },
                        }}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                mode="single"
                                label="Start Date"
                                value={field.value || undefined}
                                placeholder="Pick a Start Date"
                                {...(watch('configurations.scheduler.endDate') && {
                                    disabled: { after: new Date(watch('configurations.scheduler.endDate') as Date) },
                                })}
                                onSelect={field.onChange}
                                onBlur={async () => await trigger('configurations.scheduler.startDate')}
                                disabledTrigger={isEdit && isReadOnly}
                                isDestructive={!!fieldState?.error?.message}
                                supportiveText={fieldState?.error?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="configurations.scheduler.endDate"
                        render={({ field, fieldState }) => (
                            <DatePicker
                                mode="single"
                                label="End Date (Optional)"
                                value={field.value || undefined}
                                placeholder="Pick an End Date"
                                {...(watch('configurations.scheduler.startDate') && {
                                    disabled: {
                                        before: new Date(watch('configurations.scheduler.startDate') as Date),
                                    },
                                })}
                                onSelect={field.onChange}
                                disabledTrigger={isEdit && isReadOnly}
                                isDestructive={!!fieldState?.error?.message}
                                supportiveText={fieldState?.error?.message}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScheduleTriggerStep;
