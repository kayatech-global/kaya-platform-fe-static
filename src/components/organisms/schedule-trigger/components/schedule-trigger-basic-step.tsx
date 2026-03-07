import { Input, Textarea } from '@/components/atoms';
import { ScheduleTriggerStepInfoBox } from './schedule-trigger-step-info-box';
import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { descriptionValidate, nameValidate } from '@/utils/validation';
import { validateSpaces } from '@/lib/utils';

const ScheduleTriggerBasicStep = ({ errors, isEdit, isReadOnly, register }: ScheduleTriggerFormProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <ScheduleTriggerStepInfoBox
                    title="Scheduled Workflow Execution"
                    description="Configure your workflow to run automatically on a recurring schedule. Perfect for periodic tasks like reports, data syncs, and automated notifications."
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: nameValidate.required,
                        minLength: nameValidate.minLength,
                        maxLength: nameValidate.maxLength,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    label="Name"
                    placeholder="Enter a Name"
                    autoComplete="off"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        maxLength: descriptionValidate.maxLength,
                        validate: value => validateSpaces(value, 'description'),
                    })}
                    label="Description"
                    placeholder="Enter a Description"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
        </div>
    );
};

export default ScheduleTriggerBasicStep;
