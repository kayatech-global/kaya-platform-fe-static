import { useMemo, useState } from 'react';
import { Button, Label, OptionModel, VariablePicker, VariableValuePicker } from '@/components/atoms';
import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { Info, Plus, X } from 'lucide-react';

export const ScheduleStaticVariables = ({
    control,
    errors,
    workflowVariableFields,
    workflowVariables,
    isEdit,
    isReadOnly,
    register,
    watch,
    setValue,
    trigger,
    appendWorkflowVariable,
    removeWorkflowVariable,
}: ScheduleTriggerFormProps) => {
    const [forceRender, setForceRender] = useState<number>(0);

    const availableOptions = useMemo(() => {
        if (workflowVariables) {
            return workflowVariables.map(x => ({
                name: x.name,
                value: x.name,
                disabled: watch('configurations.data.workflowVariables')?.some(o => o.key === x.name),
            })) as OptionModel[];
        }
        return [];
    }, [workflowVariables, watch('configurations.data.workflowVariables'), forceRender]);

    return (
        <div className="col-span-1 sm:col-span-2">
            <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Workflow Variables</Label>
                <Button variant="link" size="sm" disabled={isEdit && isReadOnly} onClick={appendWorkflowVariable}>
                    <Plus />
                    Add Variable
                </Button>
            </div>
            <div className="w-full mt-4 p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 flex items-start gap-x-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                <Info size={14} className="min-w-[14px] mt-[2px]" />
                Static variables provide constant values to your workflow. These values will be the same for every
                execution. Use this mode when your workflow doesn&apos;t need dynamic data input.
            </div>
            {workflowVariableFields?.length > 0 ? (
                <div className="mt-4">
                    {workflowVariableFields?.map((variable, index) => (
                        <div key={variable.id} className="w-full flex flex-col sm:flex-row gap-4 mb-4">
                            <VariablePicker
                                {...register(`configurations.data.workflowVariables.${index}.key`, {
                                    required: { value: true, message: 'Please select a variable' },
                                })}
                                placeholder="Please select a variable"
                                options={availableOptions}
                                variables={workflowVariables}
                                labelField={`configurations.data.workflowVariables.${index}.key`}
                                valueField={`configurations.data.workflowVariables.${index}.value`}
                                typeField={`configurations.data.workflowVariables.${index}.type`}
                                index={index}
                                forceRender={forceRender}
                                setForceRender={setForceRender}
                                setValue={setValue}
                                trigger={trigger}
                                watch={watch}
                                disabled={isEdit && isReadOnly}
                                isDestructive={!!errors?.configurations?.data?.workflowVariables?.[index]?.key?.message}
                                supportiveText={errors?.configurations?.data?.workflowVariables?.[index]?.key?.message}
                            />
                            <VariableValuePicker
                                fieldType={`configurations.data.workflowVariables.${index}.type`}
                                fieldName={`configurations.data.workflowVariables.${index}.value`}
                                data={{
                                    type: watch(`configurations.data.workflowVariables.${index}.type`),
                                    value: watch(`configurations.data.workflowVariables.${index}.value`),
                                }}
                                placeholder="Enter a value"
                                required="Please enter a value"
                                disabled={isEdit && isReadOnly}
                                errorMessage={errors?.configurations?.data?.workflowVariables?.[index]?.value?.message}
                                control={control}
                                register={register}
                                setValue={setValue}
                                watch={watch}
                                trigger={trigger}
                            />
                            <Button
                                className="w-full sm:w-max max-h-[36px]"
                                variant="ghost"
                                size="icon"
                                disabled={isEdit && isReadOnly}
                                onClick={() => removeWorkflowVariable(index)}
                            >
                                <X />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full mt-4 p-3 rounded-md border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-x-2 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No variables configured yet</p>
                    <p className="text-xs font-normal text-gray-400">{`Click "Add Variable" to define workflow variables`}</p>
                </div>
            )}
        </div>
    );
};
