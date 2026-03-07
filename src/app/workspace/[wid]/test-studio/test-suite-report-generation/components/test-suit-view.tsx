import { ITestSuite } from '@/app/workspace/[wid]/test-studio/data-generation';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { AlignLeft, Columns3Cog, FileText, ListChecks, Network } from 'lucide-react';
import { Button, TruncateCell } from '@/components';
import { IDataLineageVisualGraph } from '@/models';
import WorkflowGraphView from '@/app/workspace/[wid]/test-studio/test-suite-creation/components/workflow-graph-view';
import { TestSuitTestCaseTable } from '@/app/workspace/[wid]/test-studio/test-suite-report-generation/components/test-suit-test-case-table';

interface TestSuiteProps {
    appDrawerOpen: boolean;
    setAppDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onClick: () => void;
    selectedTest: ITestSuite | undefined;
    testSuitWorkflowGraph?: IDataLineageVisualGraph;
}
export const TestSuitView = (props: TestSuiteProps) => {
    const { appDrawerOpen, setAppDrawerOpen, onClick, selectedTest, testSuitWorkflowGraph } = props;
    return (
        <AppDrawer
            open={appDrawerOpen}
            setOpen={setAppDrawerOpen}
            direction="right"
            headerIcon={<Columns3Cog />}
            header={<span className="flex items-center gap-2">View Test Suite Details</span>}
            footer={
                <div className="flex justify-end">
                    <Button variant="secondary" size="sm" onClick={onClick}>
                        Cancel
                    </Button>
                </div>
            }
            className="w-[70%] h-screen"
            content={
                selectedTest && (
                    <div className="px-2 py-4">
                        <div className="mb-4 gap-y-3 flex flex-col bg-white dark:bg-gray-800 py-2 rounded-md gap-2">
                            {/* Top row with 4 fields */}
                            <div className="flex items-center justify-between">
                                {/* Test Name Card */}
                                <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 flex gap-3 items-center bg-blue-600 dark:bg-blue-900 pr-5 pl-5 py-3 rounded-md w-[350px] justify-between">
                                    <div className="flex gap-2 flex-col text-white dark:text-white text-sm font-light">
                                        Test Name{' '}
                                        <span className="font-medium text-white dark:text-white rounded-md text-md">
                                           <TruncateCell value={selectedTest.name ?? ''} length={25} />
                                        </span>
                                    </div>
                                    <FileText size={66} className="text-white dark:text-white opacity-60" />
                                </div>
                                
                                {/* connecting line */}
                                <div className="h-0.5 w-3 bg-blue-600 dark:bg-blue-900"></div>
                                
                                {/* Workflow Type Card */}
                                <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 flex gap-3 items-center bg-green-600 dark:bg-green-900 px-5 py-3 pr-5 rounded-md w-[250px] justify-between">
                                    <div className="flex gap-2 flex-col text-white dark:text-white text-sm font-light">
                                        Workflow Type{' '}
                                        <span className="font-medium text-white dark:text-white rounded-md text-md">
                                            {/*This is hard coded as Internal since External workflow type is not implemented yet. Update this after implementing*/}
                                            Internal
                                            {/*{selectedTest.workflowType}*/}
                                        </span>
                                    </div>
                                     <ListChecks size={66} className="text-white dark:text-white opacity-60" />
                                </div>
                                
                                {/* connecting line */}
                                <div className="h-0.5 w-3 bg-green-600 dark:bg-green-900"></div>
                                
                                {/* Workflow Card */}
                                <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 flex gap-3 items-center bg-amber-600 dark:bg-amber-900 px-5 py-3 pr-5 rounded-md w-[350px] justify-between">
                                    <div className="flex flex-col gap-2 text-white dark:text-white text-sm font-light">
                                        Workflow{' '}
                                        <span className="font-medium text-white dark:text-white rounded-md text-md">
                                            <TruncateCell value={selectedTest.workflowName ?? ''} length={25} />
                                        </span>
                                    </div>
                                     <Network size={60} className="text-white dark:text-white opacity-60" />
                                </div>
                                
                                {/*  connecting line */}
                                <div className="h-0.5 w-3 bg-amber-600 dark:bg-amber-900"></div>
                                
                                {/* Test Case Type Card */}
                                <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 flex gap-3 items-center bg-amber-500 dark:bg-amber-500 px-5 py-3 pr-5 rounded-md w-[250px] justify-between">
                                    <div className="flex gap-2 flex-col text-white dark:text-white text-sm font-light">
                                        Test Case Type{' '}
                                        <span className="font-medium text-white dark:text-white rounded-md text-md">
                                            {selectedTest.testCaseMethod
                                                ? selectedTest.testCaseMethod.charAt(0).toUpperCase() +
                                                  selectedTest.testCaseMethod.slice(1)
                                                : '-'}{' '}
                                        </span>
                                    </div>
                                     <ListChecks size={66} className="text-white dark:text-white opacity-60" />
                                </div>
                            </div>

                            {/* Description - Full width below */}
                            <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 flex flex-col  px-0 py-3 rounded-md w-full">
                                <div className="flex items-center gap-2 pb-5">
                                    <AlignLeft size={16} className="text-amber-600 dark:text-amber-400" />
                                    Description
                                </div>
                                <span className="font-medium bg-blue-50 dark:bg-gray-900 dark:text-gray-300 px-3 py-3 rounded-md">
                                    <TruncateCell value={selectedTest.description ?? ''} length={200} />
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            {testSuitWorkflowGraph &&
                            Array.isArray(testSuitWorkflowGraph.nodes) &&
                            testSuitWorkflowGraph.nodes.length > 0 ? (
                                <div className="mb-4">
                                    <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-md">
                                        Workflow Graph View
                                    </div>
                                    <div className="border-2 border-blue-100 dark:border-blue-800 rounded-md bg-white dark:bg-gray-800 p-2">
                                        <WorkflowGraphView graph={testSuitWorkflowGraph} />
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-md">
                                        Workflow Graph View
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                        No workflow graph data available.
                                    </div>
                                </div>
                            )}
                            {/* Review Data Section */}
                            <div className="mb-4 mt-8 border-t border-gray-200 dark:border-gray-700 pt-7">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-md">
                                        Review Data
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 pb-3">
                                    <TestSuitTestCaseTable selectedTest={selectedTest} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        />
    );
};
