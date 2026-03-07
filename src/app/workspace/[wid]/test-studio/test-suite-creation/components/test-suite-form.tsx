import { Button, StepWizardView } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { Columns3Cog, Maximize2, Minimize2 } from 'lucide-react';
import { DataGenerationStepType, ITestSuite, ITestDataSet, ITestStudioFormProps, TestCaseMethod } from '../../data-generation';
import { resolveCreationSource } from '@/app/workspace/[wid]/test-studio/utils/test-suite-mapper';
import { useState, useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { TestConfigurationsStep } from './test-configurations-step';
import { DatasetConfigurationsStep } from './dataset-configurations-step';
import { AgentConfigurationStep } from './agent-configuration-step';
import { ReviewTestDataModal } from './review-test-data-modal';
import { GenerateTestDataModal } from './generate-test-data-modal';
import { useTestStudioWorkflowGraph } from '@/hooks/use-test-studio-workflow-graph';

export const TestSuiteForm = (props: ITestStudioFormProps) => {
    const { isOpen, setIsOpen, isEdit, reset, onCreate, onUpdate, watch, control, errors } = props;
    const [activeStep, setActiveStep] = useState<DataGenerationStepType>(1);
    const [isModalFullscreen, setIsModalFullscreen] = useState<boolean>(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

    const testCaseMethod = watch('testCaseMethod') ?? 'manual';
    const autoInputCount = watch('autoInputCount') ?? 1;
    let inputs = watch('testDataSets') ?? [];

    // useWatch gives a proper new reference whenever nested fields change,
    const watchedTestDataSets = useWatch({ control, name: 'testDataSets' });
    const watchAutoScenario = useWatch({ control, name: 'autoScenario' });
    const watchAutoSampleInput = useWatch({ control, name: 'autoSampleInput' });
    const watchAutoOutput = useWatch({ control, name: 'autoOutput' });
    const watchAutoGroundTruth = useWatch({ control, name: 'autoGroundTruth' });
    const watchInputColumn = useWatch({ control, name: 'inputColumn' });
    const watchOutputColumn = useWatch({ control, name: 'outputColumn' });
    const watchTruthColumn = useWatch({ control, name: 'truthColumn' });
    // Step 1: Collect Test Configuration values
    const testConfiguration = {
        name: watch('name'),
        workflowType: watch('workflowType'),
        workflowId: watch('workflowId'),
        workflowName: watch('workflowName'),
        description: watch('description'),
        externalWorkflowUrl: watch('externalWorkflowUrl'),
    };

    // In auto mode (create only), always fill inputs to match autoInputCount
    if (!isEdit && testCaseMethod === TestCaseMethod.Auto) {
        if (inputs.length < autoInputCount) {
            inputs = [
                ...inputs,
                ...Array.from({ length: autoInputCount - inputs.length }, () => ({
                    input: { message: '' },
                    expectedBehaviour: '',
                    expectedOutput: '',
                })),
            ];
        } else if (inputs.length > autoInputCount) {
            inputs = inputs.slice(0, autoInputCount);
        }
    }
    const workflowName = watch('workflowName');

    // Agent output fields and agent names/ids (lifted state)
    // Remove local state for agentOutputFields, always use form state
    const [agentNames, setAgentNames] = useState<string[]>([]);
    const [agentIds, setAgentIds] = useState<string[]>([]);

    // Fetch workflow graph to populate agent names/ids for Review modal
    const { workflowVisual } = useTestStudioWorkflowGraph(testConfiguration.workflowId as string);

    useEffect(() => {
        if (workflowVisual?.nodes) {
            const agentNodes = workflowVisual.nodes.filter(
                node => node.type && (node.type.includes('agent') || node.type.includes('decision'))
            );
            const agentNodeNames: string[] = agentNodes.map(node => String(node.data?.name || node.data?.label || '-'));
            const agentNodeIds: string[] = agentNodes.map(node => node.id);

            setAgentNames(agentNodeNames);
            setAgentIds(agentNodeIds);
        }
    }, [workflowVisual]);

    // Group agent output values per agent for future use/view
    const agentOutputsConfig = {
        agentOutputFields: watch('agentOutputFields'),
        agentSampleSelections: watch('agentSampleSelections'),
    };

    // @Purpose: Handle cancel - reset form and close drawer
    const handleCancel = () => {
        reset({
            id: '',
            workflowId: undefined,
            workflowName: undefined,
            workflowType: undefined,
            name: '',
            description: '',
            testType: '' as unknown as ITestSuite['testType'],
            testDataSets: [{ input: { message: '', variables: [] }, expectedBehaviour: '' }],
            isReadOnly: false,
        });
        setIsOpen(false);
        setActiveStep(1);
    };

    // Reset step to first tab when modal opens, clear form on close
    useEffect(() => {
        if (isOpen) {
            setActiveStep(DataGenerationStepType.CONFIGURE);
        } else {
            reset({
                id: '',
                workflowId: '',
                workflowName: '',
                name: '',
                description: '',
                testType: '' as unknown as ITestSuite['testType'],
                testCaseMethod: TestCaseMethod.Manual,
                testDataSets: [{ input: { message: '', variables: [] }, expectedBehaviour: '' }],
                isReadOnly: false,
                workflowType: 'internal',
                autoScenario: '',
                autoSampleInput: '',
                autoOutput: '',
                autoGroundTruth: '',
                inputColumn: 'Select data',
                outputColumn: 'Select data',
                truthColumn: 'Select data',
                excelHeaders: [],
                agentSampleSelections: {},
                toolOutputDefinitions: {},
                toolMockConfigs: [],
                autoVariables: [],
                workflowGraph: undefined,
            });
            setActiveStep(1);
            setIsModalFullscreen(false);
        }
    }, [isOpen]);

    // Handler for create/update from modal
    // Accepts optional override values (from modal tables)
    const handleCreateOrUpdate = (override?: {
        inputs?: ITestSuite['testDataSets'];
        agentOutputFields?: Record<
            string,
            { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]
        >;
        agentSampleSelections?: Record<string, object>;
    }) => {
        // If override values provided (from modal), update form state before saving
        if (override) {
            if (override.inputs) {
                props.setValue('testDataSets', override.inputs);
            }
            if (override.agentOutputFields) {
                props.setValue('agentOutputFields', override.agentOutputFields);
            }
            if (override.agentSampleSelections) {
                props.setValue('agentSampleSelections', override.agentSampleSelections);
            }
        }
        // Always ensure agentOutputFields and agentSampleSelections are in formValues
        const formValues = {
            ...props.control._formValues,
            agentOutputFields: props.control._formValues.agentOutputFields ?? watch('agentOutputFields'),
            agentSampleSelections: props.control._formValues.agentSampleSelections ?? watch('agentSampleSelections'),
        } as ITestSuite;

        // Enrich with API-required fields before submission
        formValues.workflowVersion = formValues.workflowVersion ?? 1;
        formValues.creationSource = formValues.creationSource ?? resolveCreationSource(formValues.testCaseMethod);

        console.log('All form values (ITest) on create/update:', formValues);
        if (isEdit && onUpdate) {
            onUpdate(formValues);
        } else if (onCreate) {
            onCreate(formValues);
        }
    };
    // Check if all test cases have the required fields filled based on the test case method
    // NOTE: watchedTestDataSets (from useWatch) is used as the dep so useMemo recomputes
    // whenever any nested field (name, input.message, etc.) changes.
    // watch('testDataSets') returns the same mutated reference on nested changes, which
    // would cause useMemo to skip recomputation and leave isTestCasesValid stale.
    const isTestCasesValid = useMemo(() => {
        // In edit mode all methods show existing testDataSets via ManualTestCaseList
        if (isEdit || testCaseMethod === TestCaseMethod.Manual) {
            const testDataSets = watchedTestDataSets || [];
            if (testDataSets.length === 0) return false;
            return testDataSets.every(
                tc =>
                    tc.name?.trim() &&
                    tc.input?.message?.trim() &&
                    tc.expectedOutput?.trim() &&
                    tc.expectedBehaviour?.trim()
            );
        }
        if (testCaseMethod === TestCaseMethod.Auto) {
            const scenario = watch('autoScenario') || '';
            const sampleInput = watch('autoSampleInput') || '';
            const output = watch('autoOutput') || '';
            const behaviour = watch('autoGroundTruth') || '';
            return !!(
                scenario.trim() &&
                sampleInput.trim() &&
                output.trim() &&
                behaviour.trim() &&
                !errors.autoInputCount?.message
            );
        }
        if (testCaseMethod === TestCaseMethod.Upload) {
            const inputCol = watch('inputColumn') || '';
            const outputCol = watch('outputColumn') || '';
            const truthCol = watch('truthColumn') || '';
            return !!(
                inputCol &&
                inputCol !== 'Select data' &&
                outputCol &&
                outputCol !== 'Select data' &&
                truthCol &&
                truthCol !== 'Select data'
            );
        }
        return true;
    }, [
        isEdit,
        testCaseMethod,
        watchedTestDataSets,
        watchAutoScenario,
        watchAutoSampleInput,
        watchAutoOutput,
        watchAutoGroundTruth,
        watchInputColumn,
        watchOutputColumn,
        watchTruthColumn,
    ]);

    const FooterButtons = () => {
        if (activeStep < 2) {
            return (
                <Button
                    size={'sm'}
                    disabled={!!errors.name || watch('name') === '' || watch('workflowId') === ''}
                    onClick={() => setActiveStep(s => (s < 2 ? ((s + 1) as 1 | 2) : s))}
                >
                    Next
                </Button>
            );
        } else if (isEdit) {
            return (
                <Button size={'sm'} disabled={!isTestCasesValid} onClick={() => setIsReviewModalOpen(true)}>
                    Update
                </Button>
            );
        } else if (testCaseMethod === TestCaseMethod.Auto) {
            return (
                <Button size={'sm'} disabled={!isTestCasesValid} onClick={() => setIsReviewModalOpen(true)}>
                    Generate Data
                </Button>
            );
        } else {
            return (
                <Button size={'sm'} disabled={!isTestCasesValid} onClick={() => setIsReviewModalOpen(true)}>
                    Review
                </Button>
            );
        }
    };

    return (
        <>
            <AppDrawer
                open={isOpen}
                direction={isModalFullscreen ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsOpen}
                className={
                    isModalFullscreen ? 'custom-drawer-content !w-full !h-full' : 'custom-drawer-content !w-[1200px]'
                }
                dismissible={false}
                headerIcon={<Columns3Cog />}
                header={isEdit ? 'Edit Test Suite' : 'New Test Suite'}
                footer={
                    <div className="flex justify-between items-center w-full">
                        <div>
                            {activeStep > 1 && activeStep < 4 && (
                                <Button
                                    variant={'secondary'}
                                    size={'sm'}
                                    onClick={() => {
                                        setActiveStep(s => (s > 1 ? ((s - 1) as DataGenerationStepType) : s));
                                        setIsModalFullscreen(false);
                                    }}
                                >
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant={'secondary'} size={'sm'} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <FooterButtons />
                        </div>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4 h-full flex flex-col')}>
                        <div className="flex flex-col relative flex-1 h-full min-h-0">
                            <div className="flex-1 h-full min-h-0 overflow-y-auto">
                                <StepWizardView
                                    activeStep={activeStep}
                                    panes={[
                                        {
                                            id: DataGenerationStepType.CONFIGURE,
                                            label: 'Test Suite Configurations',
                                            content: <TestConfigurationsStep {...props} />,
                                        },
                                        {
                                            id: DataGenerationStepType.DATASET,
                                            label: 'Workflow Test Case Configurations',
                                            content: (
                                                <DatasetConfigurationsStep
                                                    {...props}
                                                    isModalFullscreen={isModalFullscreen}
                                                    setIsModalFullscreen={setIsModalFullscreen}
                                                    testConfiguration={testConfiguration}
                                                    agentIds={agentIds}
                                                />
                                            ),
                                        },

                                        {
                                            id: DataGenerationStepType.AGENTCONFIG,
                                            label: 'Agent Output Configurations',
                                            content: (
                                                <AgentConfigurationStep
                                                    {...props}
                                                    isModalFullscreen={isModalFullscreen}
                                                    testCaseMethod={props.watch('testCaseMethod')}
                                                    agentOutputFields={watch('agentOutputFields')}
                                                    agentNames={agentNames}
                                                    setAgentNames={setAgentNames}
                                                    agentIds={agentIds}
                                                    setAgentIds={setAgentIds}
                                                    testConfiguration={testConfiguration}
                                                    agentOutputsConfig={agentOutputsConfig}
                                                />
                                            ),
                                        },
                                        {
                                            id: DataGenerationStepType.REVIEW,
                                            label: 'Review Test Cases',
                                            content: <></>,
                                        },
                                    ].filter(pane => {
                                        if (
                                            testCaseMethod === TestCaseMethod.Manual ||
                                            testCaseMethod === TestCaseMethod.Auto ||
                                            testCaseMethod === TestCaseMethod.Upload
                                        ) {
                                            return pane.id !== DataGenerationStepType.AGENTCONFIG;
                                        }
                                        return true;
                                    })}
                                />
                                {activeStep === DataGenerationStepType.AGENTCONFIG && (
                                    <button
                                        onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                                        className="ml-4 p-2 hover:bg-gray-100 rounded transition-colors absolute left-[-5px] top-12"
                                        aria-label={isModalFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    >
                                        {isModalFullscreen ? (
                                            <Minimize2 size={20} className="text-gray-600" />
                                        ) : (
                                            <Maximize2 size={20} className="text-gray-600" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                }
            />

            {!isEdit && testCaseMethod === TestCaseMethod.Auto ? (
                <GenerateTestDataModal
                    isOpen={isReviewModalOpen}
                    setIsOpen={setIsReviewModalOpen}
                    setDrawerOpen={setIsOpen}
                    agentNames={agentNames}
                    testCaseMethod={watch('testCaseMethod')}
                    agentIds={agentIds}
                    watch={watch}
                    onCreate={(modalData, agentFields) =>
                        handleCreateOrUpdate({ inputs: modalData as ITestDataSet[], agentOutputFields: agentFields })
                    }
                    isEdit={isEdit}
                    onUpdate={(modalData, agentFields) =>
                        handleCreateOrUpdate({ inputs: modalData as ITestDataSet[], agentOutputFields: agentFields })
                    }
                />
            ) : (
                <ReviewTestDataModal
                    isOpen={isReviewModalOpen}
                    setIsOpenAction={setIsReviewModalOpen}
                    setDrawerOpen={setIsOpen}
                    inputs={inputs as unknown as ITestDataSet[]}
                    workflowName={workflowName}
                    agentOutputFields={watch('agentOutputFields')}
                    agentNames={agentNames}
                    agentIds={agentIds}
                    testName={watch('name')}
                    control={control}
                    // Patch: Save modal table values to form state before create
                    onCreateAction={(modalData, agentFields) =>
                        handleCreateOrUpdate({ inputs: modalData, agentOutputFields: agentFields })
                    }
                    isEdit={isEdit}
                    onUpdateAction={(modalData, agentFields) =>
                        handleCreateOrUpdate({ inputs: modalData, agentOutputFields: agentFields })
                    }
                    testCaseMethod={watch('testCaseMethod')}
                    uploadedFile={watch('uploadedFile')}
                    titleColumn={watch('titleColumn')}
                    inputColumn={watch('inputColumn')}
                    outputColumn={watch('outputColumn')}
                    truthColumn={watch('truthColumn')}
                    agentColumnMappings={watch('agentColumnMappings')}
                    toolOutputDefinitions={watch('toolMockConfigs')}
                    uploadVariables={watch('uploadVariables')}
                />
            )}
        </>
    );
};;
