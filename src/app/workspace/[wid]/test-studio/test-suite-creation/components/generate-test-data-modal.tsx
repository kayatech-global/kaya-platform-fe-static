import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components';
import { ListChecks, Network, WandSparkles, AlertTriangle } from 'lucide-react';
import { IVariableOption } from '@/models';
import { ITestSuite, TestCaseMethod } from '../../data-generation';
import { useForm, UseFormWatch } from 'react-hook-form';
import { ReviewTestCaseList } from './review-test-case-list';
import { ReviewTestCaseDetail } from './review-test-case-detail';
import { useGenerateSyntheticData } from '@/hooks/use-generate-synthetic-data';
import { reverseMapTestDataSet } from '@/app/workspace/[wid]/test-studio/utils/test-suite-mapper';
import { SyntheticTestSuiteComplexityType } from '@/enums/test-studio-type';

type GenerateTestDataModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setDrawerOpen?: (open: boolean) => void;
    agentNames?: string[];
    agentIds?: string[];
    testCaseMethod?: string;
    testName?: string;
    workflowName?: string;
    onCreate?: (
        data: Array<{
            input?: { message: string; variables?: IVariableOption[] };
            expectedBehaviour?: string;
            expectedOutput?: string;
            instruction?: string;
            variables?: IVariableOption[];
        }>,
        agentFields?: Record<string, { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]>
    ) => void;
    isEdit?: boolean;
    onUpdate?: (
        data: Array<{
            input?: { message: string; variables?: IVariableOption[] };
            expectedBehaviour?: string;
            expectedOutput?: string;
            instruction?: string;
            variables?: IVariableOption[];
        }>,
        agentFields?: Record<string, { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]>
    ) => void;
    watch: UseFormWatch<ITestSuite>;
};

export const GenerateTestDataModal = ({
    isOpen,
    setIsOpen,
    setDrawerOpen,
    agentNames = [],
    agentIds = [],
    testCaseMethod,
    testName,
    workflowName,
    onCreate,
    isEdit,
    onUpdate,
    watch,
}: GenerateTestDataModalProps) => {
    // Use actual agent names from workflow if provided, fallback to mock only if empty
    const actualAgentNames = useMemo(
        () => (agentNames && agentNames.length > 0 ? agentNames : ['Agent Alpha', 'Agent Beta', 'Agent Gamma']),
        [agentNames]
    );

    const actualAgentIds = useMemo(() => (agentIds && agentIds.length > 0 ? agentIds : ['a1', 'a2', 'a3']), [agentIds]);

    const [hasGenerated, setHasGenerated] = useState(false);
    const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

    // Form for local state management of generated data
    const methods = useForm<ITestSuite>({
        defaultValues: {
            testDataSets: [],
            agentOutputFields: {},
            toolOutputDefinitions: {},
        },
    });

    const { reset } = methods;

    const { generateDataAsync, buildSyntheticDataRequest, resetGeneration, isGenerating, generateError } =
        useGenerateSyntheticData();

    const prefix = (() => {
        if (testCaseMethod === TestCaseMethod.Auto) return 'G';
        if (testCaseMethod === TestCaseMethod.Upload) return 'U';
        return 'M';
    })();
    // Generate data via API when modal opens

    const generateData = async () => {
        try {
            const workflowId = watch('workflowId') || '';

            // Build agent evaluations from available agent data
            const templateDataSet = watch('testDataSets')?.[0];
            const agentEvaluations = actualAgentIds.map((agentId, idx) => {
                const agentEval = templateDataSet?.agentEvaluations?.find(ae => ae.nodeId === agentId);
                return {
                    nodeId: agentId,
                    agentName: actualAgentNames[idx] || '',
                    expectedOutput: agentEval?.expectedOutput || '',
                    sampleExpectedAgentBehaviour: agentEval?.expectedBehaviour || '',
                };
            });

            const request = buildSyntheticDataRequest({
                workflowId,
                count: watch('autoInputCount') || 1,
                complexity: SyntheticTestSuiteComplexityType.MIXED,
                scenario: watch('autoScenario') || '',
                sampleInput: watch('autoSampleInput') || '',
                sampleOutput: watch('autoOutput') || '',
                sampleExpectedWorkflowBehaviour: watch('autoGroundTruth') || '',
                agentEvaluations,
                toolMockConfigs: watch('toolMockConfigs') || [],
                variableDefinitions: watch('autoVariables') || [],
            });

            const response = await generateDataAsync(request);

            // Map response to local form state
            const testDataSets = response.testDataSets.map(reverseMapTestDataSet);
            // Build agentOutputFields from agentEvaluations in each test data set
            const agentFields: Record<string, { expectedOutput: string; expectedBehaviour: string }[]> = {};
            for (let index = 0; index < testDataSets.length; index++) {
                const testDataSet = testDataSets[index];
                if (testDataSet.agentEvaluations) {
                    for (const ae of testDataSet.agentEvaluations) {
                        if (!agentFields[ae.nodeId]) {
                            agentFields[ae.nodeId] = [];
                        }
                        agentFields[ae.nodeId][index] = {
                            expectedOutput: ae.expectedOutput,
                            expectedBehaviour: ae.expectedBehaviour,
                        };
                    }
                }
                testDataSet.displayId = `#${prefix}${index + 1}`;
            }

            reset({
                testDataSets,
                agentOutputFields: agentFields,
                toolOutputDefinitions: watch('autoScenario') || '',
            });

            setHasGenerated(true);
        } catch (error) {
            console.error('Failed to generate synthetic data:', error);
        }
    };

    useEffect(() => {
        if (!isOpen || hasGenerated) return;
        generateData()
    }, [isOpen, hasGenerated]);

    // Cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasGenerated(false);
            setSelectedTestCaseIndex(0);
            resetGeneration();
            reset({ testDataSets: [], agentOutputFields: {}, toolOutputDefinitions: {} });
        }
    }, [isOpen, reset, resetGeneration]);

    // Use local form watch for displaying generated data
    const watchedInputs = methods.watch('testDataSets') || [];
    const watchedAgentFields = methods.watch('agentOutputFields') || {};

    const selectedItem = watchedInputs[selectedTestCaseIndex];

    const isSubmitDisabled =
        isGenerating ||
        watchedInputs.length === 0 ||
        watchedInputs.some(
            item =>
                !item.input?.message?.trim() ||
                !item.expectedOutput?.trim() ||
                !item.expectedBehaviour?.trim()
        );

    const handleSave = () => {
        const currentData = methods.getValues();

        if (isEdit && onUpdate) {
            onUpdate(currentData.testDataSets || [], currentData.agentOutputFields);
        } else if (onCreate) {
            onCreate(currentData.testDataSets || [], currentData.agentOutputFields);
        }

        setIsOpen(false);
        setHasGenerated(false);
        if (setDrawerOpen) {
            setDrawerOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-[85vw] w-full h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-6 border-b bg-white dark:bg-gray-900 dark:border-gray-700 shrink-0 justify-between flex-row items-center">
                    <DialogTitle className="flex items-center gap-2">
                        <WandSparkles className="h-5 w-5 text-blue-500" />
                        {testCaseMethod === TestCaseMethod.Auto ? 'Review Generated Test Cases' : 'Review Test Cases'}
                    </DialogTitle>
                    {(testName || workflowName) && (
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 !mt-0 pr-10">
                            {testName && (
                                <span className="flex items-center gap-1.5">
                                    <ListChecks size={14} className="text-blue-600" />
                                    Test:{' '}
                                    <span className="font-medium text-gray-900 dark:text-gray-100 pl-1">
                                        {testName}
                                    </span>
                                </span>
                            )}
                            <span>|</span>
                            {workflowName && (
                                <span className="flex items-center gap-1.5">
                                    <Network size={14} className="text-green-600" />
                                    Workflow:{' '}
                                    <span className="font-medium text-gray-900 dark:text-gray-100 pl-1">
                                        {workflowName}
                                    </span>
                                </span>
                            )}
                        </div>
                    )}
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden relative">
                    {isGenerating ? (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-0">
                                <Image
                                    src="/png/Genrating_Auto.gif"
                                    alt="Generating"
                                    width={260}
                                    height={260}
                                    unoptimized
                                />
                                <div className="text-gray-600 dark:text-gray-300 text-lg font-semibold mt-2 flex items-center gap-1 flex-col">
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <span className="text-[30px] ">Generating</span>
                                        <span className="flex font-bold text-[35px] mt-[-6px]">
                                            <span
                                                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                                                style={{ animationDelay: '0s' }}
                                            >
                                                .
                                            </span>
                                            <span
                                                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                                                style={{ animationDelay: '0.2s' }}
                                            >
                                                .
                                            </span>
                                            <span
                                                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                                                style={{ animationDelay: '0.4s' }}
                                            >
                                                .
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[14px] text-amber-600 font-medium  px-3 py-2 rounded flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                            Note: This might take some time to generate. You will have to regenerate if
                                            you close the dialog box !
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ReviewTestCaseList
                                items={watchedInputs}
                                selectedTestCaseIndex={selectedTestCaseIndex}
                                setSelectedTestCaseIndex={setSelectedTestCaseIndex}
                                isLoadingFile={false}
                                fileError={null}
                                testCaseMethod={testCaseMethod}
                                agentOutputFields={watchedAgentFields}
                                agentIds={actualAgentIds}
                            />
                            <ReviewTestCaseDetail
                                selectedItem={selectedItem}
                                selectedTestCaseIndex={selectedTestCaseIndex}
                                isUpload={false}
                                agentNames={actualAgentNames}
                                toolsData={watch('toolMockConfigs')}
                                control={methods.control}
                                testCaseMethod={testCaseMethod}
                                onRegenerate={generateData}
                                errors={generateError}
                            />
                        </>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shrink-0">
                    <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isGenerating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitDisabled}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
