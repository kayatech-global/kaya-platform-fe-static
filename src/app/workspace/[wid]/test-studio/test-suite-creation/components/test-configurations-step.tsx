import { Input, Select, Textarea, Button } from '@/components';
import { RadioGroup } from '@/components/atoms/radio-group';
import RadioCard from '@/components/molecules/radio-card/radio-card';
import { FormFieldGroup } from '@/components/atoms/form-field-group';
import { ITestStudioFormProps, TestCaseMethod } from '../../data-generation';
import { useTestStudioWorkflow } from '@/hooks/use-test-studio-workflow';
import { useEffect, useState } from 'react';
import { ExternalWorkflowParamsModal } from './external-workflow-params-modal';
import { Settings } from 'lucide-react';
import { Controller } from 'react-hook-form';

export const TestConfigurationsStep = (props: ITestStudioFormProps) => {
    const { register, errors, watch, setValue, control, isEdit, existingTestSuites } = props;
    const { workflows } = useTestStudioWorkflow();

    const workflowId = watch('workflowId');
    const [isExternalWorkflowModalOpen, setIsExternalWorkflowModalOpen] = useState(false);

    const handleTestCaseMethodChange = () => {
        setValue('testDataSets', []);

        setValue('autoInputCount', 1);
        setValue('autoScenario', '');
        setValue('autoSampleInput', '');
        setValue('autoOutput', '');
        setValue('autoGroundTruth', '');
        setValue('uploadedFile', null);
        setValue('uploadedFileName', '');
        setValue('uploadedFileSize', 0);
        setValue('uploadedFileData', '');
        setValue('excelHeaders', []);
        setValue('inputColumn', '');
        setValue('outputColumn', '');
        setValue('truthColumn', '');
        setValue('toolOutputDefinitions', {});
        setValue('agentOutputFields', {});
    };

    // Ensure workflowId is valid when workflows are loaded
    useEffect(() => {
        if (workflows.length > 0) {
            // If workflowId is set but not found in the list, clear it
            if (workflowId && !workflows.some(w => w.id === workflowId)) {
                setValue('workflowId', '', { shouldValidate: true });
            }
        }
    }, [workflows, workflowId, setValue]);

    const validateName = (value: string) => {
        const currentId = watch('id');
        const duplicate = (existingTestSuites ?? [])
            .filter(ts => !isEdit || ts.id !== currentId)
            .some(ts => ts.name.toLowerCase().trim() === value.toLowerCase().trim());
        if (duplicate) {
            return 'A Test Suite with this name already exists';
        }
        return true;
    };

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <div className="col-span-1 sm:col-span-12">
                <FormFieldGroup title="Test Suite Details" className="border-gray-300 dark:border-gray-600" labelClassName="dark:bg-gray-900">
                    <Input
                        {...register('name', {
                            required: {
                                value: true,
                                message: 'Please enter a Test Suite name',
                            },
                            validate:validateName
                        })}
                        placeholder="Enter your Test Suite Name"
                        label="Test Suite Name"
                        isDestructive={!!errors?.name?.message}
                        supportiveText={errors?.name?.message}
                        className="w-full"
                    />
                    {isEdit ? (
                        <Input
                            label="Workflow"
                            value={watch('workflowName') || ''}
                            disabled
                            className="w-full"
                        />
                    ) : (
                        <>
                            <Controller
                                name="workflowType"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Please select a Workflow Type',
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <Select
                                        {...field}
                                        label="Workflow Type"
                                        placeholder="Please select a Workflow Type"
                                        options={[
                                            { name: 'Internal', value: 'internal' },
                                            { name: 'External', value: 'external' },
                                        ]}
                                        currentValue={field.value || ''}
                                        onChange={e => field.onChange(e.target.value)}
                                        isDestructive={!!fieldState.error?.message}
                                        supportiveText={fieldState.error?.message}
                                        className="w-full"
                                    />
                                )}
                            />

                            {watch('workflowType') == 'internal' && (
                                <div className="col-span-1 sm:col-span-2">
                                    <Controller
                                        name="workflowId"
                                        control={control}
                                        rules={{
                                            required: {
                                                value: true,
                                                message: 'Please select a workflow',
                                            },
                                        }}
                                        render={({ field, fieldState }) => (
                                            <Select
                                                {...field}
                                                label="Workflow"
                                                currentValue={field.value || ''}
                                                onChange={e => {
                                                    const selectedId = e.target.value;
                                                    field.onChange(selectedId);
                                                    const matchedWorkflow = workflows.find(w => w.id === selectedId);
                                                    setValue('workflowName', matchedWorkflow ? matchedWorkflow.name : '', {
                                                        shouldValidate: true,
                                                    });
                                                }}
                                                options={(() => {
                                                    const baseOptions =
                                                        workflows?.map(x => ({ name: x.name, value: x.id })) || [];
                                                    if (field.value && !baseOptions.some(opt => opt.value === field.value)) {
                                                        const fallbackName = watch('workflowName') || 'Unknown Workflow';
                                                        return [{ name: fallbackName, value: field.value }, ...baseOptions];
                                                    }
                                                    return baseOptions;
                                                })()}
                                                placeholder="Please select a workflow"
                                                disabled={workflows.length === 0 && !field.value}
                                                isDestructive={!!fieldState.error?.message}
                                                supportiveText={fieldState.error?.message}
                                                className="w-full"
                                            />
                                        )}
                                    />
                                </div>
                            )}

                            {watch('workflowType') == 'external' && (
                                <div className="col-span-1 sm:col-span-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsExternalWorkflowModalOpen(true)}
                                        className=""
                                        leadingIcon={
                                            <Settings className="text-gray-600 dark:text-gray-400" size={16} />
                                        }
                                    >
                                        <p className="text-gray-700 dark:text-gray-400">Configure external workflow</p>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="col-span-1 sm:col-span-2">
                        <Textarea
                            {...register('description' )}
                            label="Description"
                            placeholder="Enter your description"
                            isDestructive={!!errors?.description?.message}
                            supportiveText={errors?.description?.message}
                            rows={5}
                            className="resize-none w-full"
                        />
                    </div>
                </FormFieldGroup>
            </div>

            {/* Test Case Method - read-only badge in edit mode, interactive radio cards in create mode */}
            {isEdit ? (
                <div className="col-span-1 sm:col-span-12 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generation Method:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {(() => {
                                const method = watch('testCaseMethod');
                                if (method === TestCaseMethod.Auto) return 'Auto Generated';
                                if (method === TestCaseMethod.Upload) return 'File Upload';
                                return 'Manually Defined';
                            })()}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="col-span-1 sm:col-span-12 mt-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            How would you like to create the Test cases?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select a method to create test cases. You can manually input your cases, get leverage AI for
                            automatic generation, or import an existing Excel file.
                        </p>
                    </div>
                    <Controller
                        name="testCaseMethod"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value || TestCaseMethod.Manual}
                                onValueChange={value => {
                                    field.onChange(value);
                                    handleTestCaseMethodChange();
                                }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-3">
                                    <RadioCard
                                        value={TestCaseMethod.Manual}
                                        label="Manually Define"
                                        description="You can manually configure the required test case inputs one by one."
                                        checked={field.value === TestCaseMethod.Manual}
                                        isInline={true}
                                    />
                                    <RadioCard
                                        value={TestCaseMethod.Auto}
                                        label="Auto Generate"
                                        description="You can automatically generate test cases using AI, based on your requirements."
                                        checked={field.value === TestCaseMethod.Auto}
                                        isInline={true}
                                    />
                                    <RadioCard
                                        value={TestCaseMethod.Upload}
                                        label="File Upload"
                                        description="You can upload an Excel file containing the test cases in bulk. "
                                        checked={field.value === TestCaseMethod.Upload}
                                        isInline={true}
                                    />
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            )}
            <ExternalWorkflowParamsModal
                isOpen={isExternalWorkflowModalOpen}
                onClose={() => setIsExternalWorkflowModalOpen(false)}
            />
        </div>
    );
};
