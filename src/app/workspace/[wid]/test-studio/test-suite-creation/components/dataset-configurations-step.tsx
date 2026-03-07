'use client';

import React, { useState } from 'react';
import { getExcelHeaders } from '@/utils/excel-utils';
import {
    Button,
    Input,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components';
import { Plus, FileSpreadsheet, Maximize2, Minimize2 } from 'lucide-react';

import { ITestStudioFormProps, ITestSuite, TestCaseMethod, WorkflowType } from '../../data-generation';
import FileUploader from '@/components/atoms/file-uploader';
import { ManualTestCaseList } from './manual-test-case-list';
import { AutoTestCaseList } from './auto-test-case-list';
import { UploadTestCaseList } from './upload-test-case-list';
import { IVariableOption } from '@/models';
import {FieldErrors, useFieldArray, UseFormReset, useWatch } from 'react-hook-form';
import VariableConfigModal from '@/app/workspace/[wid]/workflows/workflow-authoring/components/variable-config-modal';
import { AgentConfigurationModal } from './agent-configuration-modal';
import { DetailAlert } from '@/components/atoms/detail-alert';
import { AlertVariant } from '@/enums/component-type';
import { useVariable } from '@/hooks/use-variable';

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error instanceof Error ? error : new Error('File read failed'));
    });

const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const dataPrefix = arr[0] ?? '';
    const colonIdx = dataPrefix.indexOf(':');
    const semicolonIdx = dataPrefix.indexOf(';');
    const mime =
        colonIdx !== -1 && semicolonIdx !== -1 && semicolonIdx > colonIdx
            ? dataPrefix.slice(colonIdx + 1, semicolonIdx)
            : '';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = (bstr.codePointAt(i) ?? 0) & 0xff;
    }
    return new File([u8arr], filename, { type: mime });
};

const validateAutoCount = (value:number|undefined) => {
    if(!value || value<1){
        return 'Number should be greater than 0'
    }
    return true
}

type TestCaseToolbarProps = {
    isEdit: boolean;
    testCaseMethod: TestCaseMethod;
    register: ITestStudioFormProps['register'];
    append: ITestStudioFormProps['append'];
    isModalFullscreen?: boolean;
    setIsModalFullscreen?: React.Dispatch<React.SetStateAction<boolean>>;
    errors: FieldErrors<ITestSuite>;
};

const TestCaseToolbar = ({
    isEdit,
    testCaseMethod,
    register,
    append,
    isModalFullscreen,
    setIsModalFullscreen,
    errors
}: TestCaseToolbarProps) => (
    <div className="flex items-center gap-2 max-h-[180px] overflow-y-auto">
        {(testCaseMethod === TestCaseMethod.Manual || isEdit) && (
            <Button
                size="sm"
                variant="primary"
                className="mr-1 h-10 text-xs"
                onClick={() => append({ input: { message: '' }, expectedBehaviour: '', expectedOutput: '' })}
                type="button"
            >
                <Plus size={14} className="mr-[0px]" /> Add Test Cases
            </Button>
        )}
        {!isEdit && testCaseMethod === TestCaseMethod.Auto && (
            <>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <label
                                htmlFor="auto-input-count"
                                className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-help"
                            >
                                No. of Inputs <span className="text-red-500">*</span>
                            </label>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[300px]">
                            <p>
                                Specify how many test cases the AI should generate for this scenario. Each test case
                                will have unique input variations while following the scenario pattern
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Input
                    id="auto-input-count"
                    type="number"
                    min={1}
                    defaultValue={1}
                    {...register('autoInputCount', { valueAsNumber: true,
                        required:{
                        value:true,
                         message:"Please enter a number"
                        },
                        validate: value => validateAutoCount(value)
                    })}
                    placeholder="Enter count"
                    className="w-32"
                    isDestructive={!!errors?.autoInputCount?.message}
                    supportiveText={errors?.autoInputCount?.message}
                />
            </>
        )}
        {!isEdit && testCaseMethod === TestCaseMethod.Upload && (
            <Button
                size="sm"
                variant="primary"
                className="ml-2"
                onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/doc/Excel_Template_for_Test_cases.xlsx';
                    link.download = 'Excel_Template_for_Test_cases.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }}
            >
                <FileSpreadsheet size={16} className="mr-1" />
                Download Template
            </Button>
        )}
        <button
            type="button"
            className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isModalFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={() => setIsModalFullscreen?.((prev: boolean) => !prev)}
        >
            {isModalFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
    </div>
);

type DatasetConfigurationsStepProps = ITestStudioFormProps & {
    isModalFullscreen?: boolean;
    setIsModalFullscreen?: React.Dispatch<React.SetStateAction<boolean>>;
    testConfiguration?: {
        name?: string;
        workflowType?: WorkflowType;
        workflowId?: string;
        workflowName?: string;
        description?: string;
        externalWorkflowUrl?: string;
    };
    agentIds?: string[];
};

export const DatasetConfigurationsStep = (props: DatasetConfigurationsStepProps) => {
    const {
        register,
        errors,
        fields,
        append,
        remove,
        watch,
        setValue,
        getValues,
        isModalFullscreen,
        setIsModalFullscreen,
        agentIds,
        isEdit,
        control,
    } = props;
    const [variableModalOpen, setVariableModalOpen] = useState(false);
    const [isAgentConfigModalOpen, setIsAgentConfigModalOpen] = useState(false);
    const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number | null>(null);
    const { testConfiguration } = props;

    const { variableTableData } = useVariable();
    // ----------------------------

    // Removed unused testCaseCount and fileUploaded
    // Use react-hook-form for file and dropdowns
    const excelHeaders = watch('excelHeaders') ?? [];
    const uploadedFile = watch('uploadedFile');
    const uploadedFileName = watch('uploadedFileName');
    const uploadedFileData = watch('uploadedFileData');
    const testCaseMethod = watch('testCaseMethod') || TestCaseMethod.Manual;

    const uploadVariables = useWatch({
        control: control,
        name: 'uploadVariables',
    });

    const { replace } = useFieldArray({
        name: 'uploadVariables',
        control: control,
    });

    // Restore file from base64 when data is available
    React.useEffect(() => {
        if (uploadedFileData && uploadedFileName) {
            // Guard: Only restore if the file isn't already in the form state
            // to avoid infinite loops of re-creating File objects
            const currentFile = watch('uploadedFile');
            if (currentFile?.name !== uploadedFileName) {
                try {
                    console.log('[File Restore] Attempting to restore file:', uploadedFileName);
                    const restoredFile = base64ToFile(uploadedFileData, uploadedFileName);
                    console.log('[File Restore] File restored successfully:', restoredFile.name, restoredFile.size);
                    setValue('uploadedFile', restoredFile);
                } catch (error) {
                    console.error('[File Restore] Error restoring file from base64:', error);
                }
            }
        }
    }, [uploadedFileData, uploadedFileName, setValue, watch]);

    const handleOpenVariableModal = () => {
        setVariableModalOpen(true);
    };

    const handleApplyVariables = (value: IVariableOption[] | undefined) => {
        if (value) {
            replace(value);
        }
    };
    const handleFileChange = async (files: File[]) => {
        const prevFile = watch('uploadedFile');
        const newFile = files[0] || null;
        setValue('uploadedFile', newFile);
        setValue('uploadedFileName', newFile?.name || '');
        setValue('uploadedFileSize', newFile?.size || 0);

        // Convert file to base64 for storage
        if (newFile) {
            try {
                const base64Data = await fileToBase64(newFile);
                setValue('uploadedFileData', base64Data);
            } catch (error) {
                console.error('Error converting file to base64:', error);
            }
        }

        // Only reset columns if a new file is uploaded (not on navigation) or if file is removed
        if ((newFile && newFile !== prevFile) || files?.length === 0) {
            setValue('excelHeaders', []);
            if (files?.[0]) {
                try {
                    const headers = await getExcelHeaders(files[0]);
                    setValue('excelHeaders', headers);
                    // Always reset dropdowns to empty so placeholder is shown
                    setValue('titleColumn', '');
                    setValue('inputColumn', '');
                    setValue('outputColumn', '');
                    setValue('truthColumn', '');
                } catch {
                    setValue('excelHeaders', []);
                    setValue('titleColumn', 'Select data');
                    setValue('inputColumn', 'Select data');
                    setValue('outputColumn', 'Select data');
                    setValue('truthColumn', 'Select data');
                }
            } else {
                setValue('titleColumn', 'Select data');
                setValue('inputColumn', 'Select data');
                setValue('outputColumn', 'Select data');
                setValue('truthColumn', 'Select data');
            }
        }
    };
    const getGuidanceContent = () => {
        switch (testCaseMethod) {
            case TestCaseMethod.Manual:
                return {
                    message: (
                        <span>
                            Define each test case individually by specifying{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Inputs</span> and{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Expected Outputs</span>.
                        </span>
                    ),
                    details: (
                        <div className="space-y-3">
                            <p>
                                This method allows you to craft specific test scenarios one by one. It&apos;s best for
                                precise, targeted testing.
                            </p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>
                                    Define the{' '}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Input</span>{' '}
                                    required for your scenario. These are the input messages and parameters your
                                    workflow needs.
                                </li>
                                <li>
                                    If your workflow uses dynamic variables (like user names or dates), click{' '}
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                        &quot;Configure Variables&quot;
                                    </span>{' '}
                                    to set them.
                                </li>
                                {/* <li>
                                    Enter the{' '}
                                    <span className="font-semibold text-green-600 dark:text-green-400">Test Data</span>{' '}
                                    into the input fields. Be as realistic as possible.
                                </li> */}
                                <li>
                                    Specify the{' '}
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                        Expected Output
                                    </span>
                                    . This is what you expect the workflow to produce. You can also define{' '}
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                        the Expected Behaviour
                                    </span>{' '}
                                    at the test case.
                                </li>
                                <li>
                                    Need more cases? Click{' '}
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        &quot;Add Test Cases&quot;
                                    </span>{' '}
                                    at the top to continue adding as many as you need.
                                </li>
                            </ol>
                        </div>
                    ),
                };
            case TestCaseMethod.Auto:
                return {
                    message: (
                        <span>
                            Define the{' '}
                            <span className="font-semibold text-purple-600 dark:text-purple-400">Scenario, Sample Input, Output, Expected Behaviour</span>{' '}
                             for the AI to generate test cases.
                        </span>
                    ),
                    details: (
                        <div className="space-y-3">
                            <p className="text-gray-600 dark:text-gray-800">
                                Let AI do the heavy lifting! Describe what you want to test, and the system will create
                                diverse test cases automatically.
                            </p>
                            <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-800">
                                <li>
                                    First, define{' '}
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">How many</span>{' '}
                                    test cases you need by entering the{' '}
                                    <span className="font-semibold">&quot;No of Inputs&quot;</span>.
                                </li>
                                <li>
                                    Describe the{' '}
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">Scenario</span>
                                    . For example:{' '}
                                    <em>&quot;Testing customer support responses for refund requests.&quot;</em>
                                </li>
                                <li>
                                    The system will check a sample to ensure it&apos;s on the right track. Review the
                                    sample{' '}
                                    <span className="font-semibold text-green-600 dark:text-green-400">Input</span> and{' '}
                                    <span className="font-semibold text-green-600 dark:text-green-400">Output</span>{' & '}
                                    <span className="font-semibold text-green-600 dark:text-green-400">Expected Behaviour</span>{' '}
                                    formats.
                                </li>
                            </ol>
                        </div>
                    ),
                };
            case TestCaseMethod.Upload:
                return {
                    message: (
                        <span>
                            Upload an{' '}
                            <span className="font-semibold text-green-600 dark:text-green-400">Excel file</span> with
                            your test data for bulk creation.
                        </span>
                    ),
                    details: (
                        <div className="space-y-3">
                            <p className="text-gray-600 dark:text-gray-800">
                                Perfect for large datasets! Use your existing spreadsheets to populate the test suite
                                instantly.
                            </p>
                            <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-800">
                                <li>
                                    Prepare your{' '}
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        Excel File (.xlsx)
                                    </span>{' '}
                                    .
                                </li>
                                <li>
                                    Ensure your top row (headers) contains columns for{' '}
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Input</span>,{' '}
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                        Expected Output
                                    </span>{' '}
                                    , and optionally{' '}
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                        Expected Behaviour
                                    </span>{' '}
                                    .
                                </li>
                                <li>Drag and drop your file into the upload area below, or click to browse.</li>
                                <li>
                                    Once uploaded, you&apos;ll need to{' '}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        Map the Columns
                                    </span>{' '}
                                    . Select which header from your file corresponds to the Input, Output, etc.
                                </li>
                            </ol>
                        </div>
                    ),
                };
            default:
                return { message: '', details: null };
        }
    };

    const guidance = getGuidanceContent();
    
    const closeAgentConfigurationsDialog = () => {
        setIsAgentConfigModalOpen(false);
        setActiveTestCaseIndex(null);
    };
    
    return (
        <div className="flex flex-col h-full gap-4 mt-6">
            {!isEdit && (
                <DetailAlert
                    variant={AlertVariant.Info}
                    message={guidance.message}
                    details={guidance.details}
                    className="mb-2"
                />
            )}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">Test Cases</span>
                </div>
                <TestCaseToolbar
                    isEdit={isEdit}
                    testCaseMethod={testCaseMethod}
                    register={register}
                    append={append}
                    isModalFullscreen={isModalFullscreen}
                    setIsModalFullscreen={setIsModalFullscreen}
                    errors={errors}
                />
            </div>

            {/* Test Cases Section */}
            {!isEdit && testCaseMethod === TestCaseMethod.Upload ? (
                <div className="w-full flex flex-col gap-4">
                    <FileUploader
                        accept={['.xlsx', '.xls']}
                        placeholder="Upload Excel file (.xlsx, .xls only)"
                        supportMultiUpload={false}
                        value={uploadedFile && uploadedFile instanceof File ? [uploadedFile] : []}
                        onChange={handleFileChange}
                        hideInbuiltUploadHandler={true}
                        toastErrorMessage="Only xlsx or xls files are allowed"
                    />

                    {(uploadedFile || excelHeaders.length > 0) && (
                        <UploadTestCaseList
                            control={control}
                            excelHeaders={excelHeaders}
                            uploadVariables={uploadVariables}
                            agentIds={agentIds}
                            onConfigureVariables={handleOpenVariableModal}
                            onConfigureAgents={() => {
                                setActiveTestCaseIndex(0);
                                setIsAgentConfigModalOpen(true);
                            }}
                        />
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-start gap-y-[6px] pr-2 w-full dark:border-gray-700 flex-1">
                    <div className="w-full pr-2 overflow-y-auto flex-1">
                        {(isEdit || testCaseMethod === TestCaseMethod.Manual) && fields && fields.length > 0 ? (
                            <ManualTestCaseList
                                fields={fields}
                                control={control}
                                errors={errors}
                                remove={remove}
                                setValue={setValue}
                                getValues={getValues}
                                variables={variableTableData}
                                onConfigureAgents={index => {
                                    setActiveTestCaseIndex(index);
                                    setIsAgentConfigModalOpen(true);
                                }}
                                testCaseMethod={watch('testCaseMethod')}
                            />
                        ) : null}

                        {!isEdit && testCaseMethod === TestCaseMethod.Auto && (
                            <AutoTestCaseList
                                control={control}
                                setValue={setValue}
                                variables={variableTableData}
                                onConfigureAgents={() => {
                                    // For auto, we use index 0 as it's a single configuration
                                    setActiveTestCaseIndex(0);
                                    setIsAgentConfigModalOpen(true);
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
            <VariableConfigModal
                isOpen={variableModalOpen}
                isLoading={false}
                variables={variableTableData}
                currentVariable={uploadVariables || []}
                setOpen={setVariableModalOpen}
                onApplyVariables={value => handleApplyVariables(value as IVariableOption[])}
                excelHeaders={testCaseMethod === TestCaseMethod.Upload ? excelHeaders : undefined}
            />
            {isAgentConfigModalOpen && activeTestCaseIndex !== null && (
                <AgentConfigurationModal
                    isOpen={isAgentConfigModalOpen}
                    onClose={closeAgentConfigurationsDialog}
                    testCaseIndex={activeTestCaseIndex}
                    workflowId={testConfiguration?.workflowId ?? ''}
                    watch={watch}
                    setValue={setValue}
                    control={control}
                    testCaseMethod={testCaseMethod}
                    register={register}
                    errors={errors}
                    isEdit={isEdit}
                />
            )}
        </div>
    );
};
