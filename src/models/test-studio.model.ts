/* eslint-disable @typescript-eslint/no-explicit-any */
import { IVariableOption } from '@/models';
import {
    TestCaseMethod,
    TestType,
    ExecutionSessionStatus,
    ExecutionItemStatus,
    TestExecutionSafetyStatus,
    TestStatus,
    MockMode,
} from '@/enums/test-studio-type';
import {
    UseFormRegister,
    UseFormHandleSubmit,
    Control,
    UseFormWatch,
    UseFormSetValue,
    UseFormReset,
    FieldErrors,
    FieldArrayWithId,
    UseFieldArrayAppend,
    UseFieldArrayRemove,
    UseFormGetValues,
} from 'react-hook-form';
import {IVariableDefinitions} from "@/hooks/use-generate-synthetic-data";

export type WorkflowType = 'internal' | 'external';

export interface IMockScenario {
    id: string;
    name: string;
    config: string;
    mockMode: MockMode;
    llmInstruction?: string;
}

export interface IToolMockConfig {
    id: string;
    scenarios: IMockScenario[];
    toolName?: string;
    toolId?: string;
    mockEnabled?: boolean;
    defaultScenarioId?: string;
}

export type ITestSuite = {
    id: string;
    workflowType: WorkflowType;
    workflowName?: string;
    workflowId?: string;
    externalWorkflowUrl?: string;
    name: string;
    description: string;
    testType: TestType;
    testDataSets?: ITestDataSet[];
    isReadOnly?: boolean;
    search?: string;
    testCaseMethod?: TestCaseMethod;
    autoScenario?: string;
    autoSampleInput?: string;
    autoOutput?: string;
    autoGroundTruth?: string;
    autoInputCount?: number;
    autoInstruction?: string;
    autoVariables?: IVariableDefinitions[];
    uploadedFile: File | null;
    uploadedFileName?: string;
    uploadedFileSize?: number;
    uploadedFileData?: string; // base64 encoded file data
    titleColumn?: string;
    inputColumn: string;
    outputColumn: string;
    truthColumn: string;
    agentSampleSelections: any;
    excelHeaders: any;
    agentColumnMappings?: Record<string, { outputColumn?: string; truthColumn?: string }>;
    toolOutputDefinitions?: any; // testCaseIndex (should be testCaseId) -> agentId -> toolId -> mockConfigId
    // workflowGraph: IDataLineageVisualGraph; // Changed to any to prevent "Type instantiation is excessively deep" error in React Hook Form
    workflowGraph?: any;
    agentOutputFields?: Record<string, { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]>;
    agentSelectedTools?: Record<string, string[]>;
    uploadVariables?: IVariableOption[];
    //New config
    toolMockConfigs?: IToolMockConfig[];
    workflowVersion?: number;
    creationSource?: string;
};
export type IToolMock = {
    toolId: string;
    toolName: string;
    selectedScenarioId?: string;
};
export type IAgentEvaluation = {
    nodeId: string;
    agentName: string;
    expectedBehaviour: string;
    expectedOutput: string;
    toolMockSelections: IToolMock[];
};
// --- API Payload Types ---

export interface IMockScenarioPayload {
    id: string;
    name: string;
    config: {
        request: Record<string, unknown>;
        response: Record<string, unknown>;
    };
    mockMode: MockMode;
    description: string;
    llmInstruction?: string;
}

export interface IToolMockSelectionPayload {
    toolId: string;
    toolName: string;
    selectedScenarioId?: string;
}

export interface IAgentEvaluationPayload {
    nodeId: string;
    agentName: string;
    expectedAgentBehaviour: string;
    expectedOutput: string;
    toolMockSelections: IToolMockSelectionPayload[];
}

export interface ITestDataSetPayload {
    name: string;
    displayId: string;
    description: string;
    input: {
        message: string;
        variables: Record<string, unknown>;
    };
    expectedWorkflowBehaviour: string;
    expectedOutput: string;
    expectedOrchestrationPath: string[];
    agentEvaluations: IAgentEvaluationPayload[];
}

export interface IToolMockConfigPayload {
    toolId: string;
    toolName: string;
    scenarios: IMockScenarioPayload[];
    mockEnabled: boolean;
    defaultScenarioId?: string;
}

export interface ITestSuitePayload {
    name: string;
    description?: string;
    workflowId?: string;
    workflowVersion: number;
    creationSource: string;
    testDataSets: ITestDataSetPayload[];
    toolMockConfigs: IToolMockConfigPayload[];
}

// --- API Response Types ---

export interface ITestSuiteListItem {
    id: string;
    name: string;
    description: string;
    workflowId: string;
    workflowVersion: number;
    workflowName: string;
    configurations: Record<string, unknown>;
    creationSource: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    workspaceId: number;
    testDataSetsCount: number;
}

export interface ITestSuiteDetailResponse {
    id: string;
    name: string;
    description: string;
    workflowId: string;
    workflowVersion: number;
    workflowName: string;
    tags: string[] | null;
    configurations: Record<string, unknown>;
    creationSource: string;
    testDataSets: ITestDataSetPayload[];
    toolMockDefinitions: IToolMockConfigPayload[];
    version: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: number;
    createdAt: string;
    updatedBy: number | null;
    updatedAt: string;
    workspaceId: number;
}
export type ITestDataSet = {
    id?: string;
    displayId?: string;
    title?: string;
    name?: string;
    description?: string;
    input: { message: string; variables?: IVariableOption[] };
    expectedBehaviour: string;
    expectedOutput: string;
    instruction?: string;
    sampleInput?: string;
    expectedOrchestrationPath?: string[];

    agentEvaluations?: IAgentEvaluation[];
};

export interface AgentStepDetail {
    agent: string;
    agentActualInput: string;
    agentExpectedOutput: string;
    agentActualOutput: string;
    agentExpectedGroundTruth: string;
    agentActualGroundTruth: string;
    status?: TestStatus;
    score?: number;
}

export interface ITestExecutionInputReport {
    id: string;
    input: string;
    status: TestStatus;
    steps: string[];
    groundTruth: string;
    actualGroundTruth?: string;
    agentOutput: string;
    expectedOutput?: string;
    actualOutput?: string;
    agentStepDetails?: AgentStepDetail[];
    testName?: string;
    workflow?: string;
    executionId?: string;
    executedAt?: string;
    duration?: string;
    score?: number;
    groundTruthScore?: number;
    tokens?: number;
    totalLatency?: number;
    ragLatency?: number;
    llmLatency?: number;
    safetyStatus?: TestExecutionSafetyStatus;
    aiInsights?: string;
    outputDifferenceRationale?: string;
    behaviourDifferenceRationale?: string;
    executionLineage?: any[]; // Raw execution lineage from API
}

export interface IExecutionReport {
    id: string;
    summary: string;
    resultCount: {
        total: number;
        passed: number;
        failed: number;
        skipped?: number;
    };
    score: number;
    inputReport: ITestExecutionInputReport[];
}

export interface ITestExecutionHistory {
    id: string;
    name: string;
    description: string;
    testId: string;
    passedCount: number;
    failedCount: number;
    skippedCount?: number;
    createdAt: string;
    executionDuration: string;
    datasets: ITestDataSet[];
    report: IExecutionReport;
    workflowId?: string;
}

export interface ITestSuiteExecutionHistory {
    testId: string;
    name: string;
    executions: ITestExecutionHistory[];
}

// Execution Configuration Types
export interface IExecutionConfiguration {
    testSuiteId: string;
    testCaseIndices: number[];
    configurations?: Record<string, unknown>;
    generateReport?: boolean;
}

export interface IExecutionResponse {
    sessionId: string;
    status: string;
    message: string;
    total: number;
}

export interface IExecutionProgress {
    sessionId: string;
    testSuiteId: string;
    testSuiteName: string;
    workflowId: string;
    status: ExecutionSessionStatus;
    total: number; // Total number of test cases
    completed: number; // Number of completed test cases
    passed: number; // Number of passed test cases
    failed: number; // Number of failed test cases
    currentIndex: number; // Index of currently executing test case (-1 if none)
    currentDataSetName: string; // Name of current test case being executed
    startedAt: string; // ISO timestamp
    completedAt?: string; // ISO timestamp when completed
    items: Array<{
        index: number;
        name: string;
        status: ExecutionItemStatus;
        workflowSessionId?: string;
        executionId?: string;
        startedAt?: string;
        completedAt?: string;
    }>;
}

// ============================================================================
// TEST EXECUTION API RESPONSE TYPES (from backend)
// ============================================================================

/** Summary of a batch of test executions */
export interface IBatchExecutionSummary {
    batchId: string;
    suiteSummary?: string | null;
    executionCount: number;
    executionType?: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    passedCount: number;
    failedCount: number;
    errorCount: number;
    testSuiteId: string;
    testSuiteName: string;
    testCases?: Array<{
        testDataSetIndex: number;
        testDataSetName: string | null;
        status: string;
        executionId: string;
    }>;
}

/** Grouped test executions by test suite */
export interface ITestSuiteExecutionGroup {
    testSuiteId: string;
    testSuiteName: string;
    workflowId: string;
    lastExecutedAt: string;
    executions: IBatchExecutionSummary[];
}

/** Response from GET /workspaces/{wid}/teststudio/test-executions */
export interface ITestExecutionsResponse {
    message: string;
    data: ITestSuiteExecutionGroup[];
}

// ============================================================================
// Execution Report Interfaces
// ============================================================================

export interface IAgentEvaluationSnapshot {
    nodeId: string;
    agentName: string;
    expectedOutput: string;
    toolMockSelections: any[];
    expectedAgentBehaviour: string;
}

export interface IExpectedOutputSnapshot {
    expectedOutput: string;
    agentEvaluations: IAgentEvaluationSnapshot[];
    expectedOrchestrationPath: any[];
    expectedWorkflowBehaviour: string;
}

export interface IAgentOutput {
    agentName: string;
    agent_output: string;
    nodeId?: string;
}

export interface IActualOutput {
    agent_outputs: IAgentOutput[];
    workflow_output: string;
    workflow_reasoning: string;
    workflowBehaviour?: string; 
}

export interface IAgentEvaluationResult {
    nodeId: string;
    matched: boolean;
    verdict: string;
    agentName: string;
    breakdown: {
        tool_usage: number;
        reasoning_quality: number;
        output_correctness: number;
    };
    total_score: number;
    justification: string;
}

export interface IWorkflowEvaluation {
    verdict: string;
    breakdown: {
        reasoning_quality: number;
        output_correctness: number;
        execution_correctness: number;
    };
    total_score: number;
    justification: string;
}

export interface IOutputComparisonResult {
    overall_verdict: string;
    agent_evaluations: IAgentEvaluationResult[];
    workflow_evaluation: IWorkflowEvaluation;
}

export interface IOrchestrationComparisonResult {
    score: number;
    actual: any[];
    verdict: string;
    expected: any[];
    evaluation: string;
}

export interface ITestReportMetrics {
    totalCost: number;
    totalLatencyMs: number;
    inputTokenCount: number;
    outputTokenCount: number;
}

export interface ITestReport {
    id: string;
    testExecutionId: string;
    testSuiteId: string;
    testDataSetIndex: number;
    testDataSetName: string;
    workflowId: string;
    overallStatus: string;
    outputComparisonResult: IOutputComparisonResult;
    orchestrationComparisonResult: IOrchestrationComparisonResult;
    metrics: ITestReportMetrics;
    score: string;
    summary: string;
    reportVersion: number;
    isDeleted: boolean;
    createdBy: number;
    createdAt: string;
    updatedBy: number | null;
    updatedAt: string;
    workspaceId: number;
}

export interface ITestSuiteInfo {
    id: string;
    name: string;
    description: string;
    workflowId: string;
    workflowVersion: number;
    tags: any;
    configurations: any;
    creationSource: string;
    testDataSets: any[];
    toolMockDefinitions: any[];
    version: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: number;
    createdAt: string;
    updatedBy: number | null;
    updatedAt: string;
    workspaceId: number;
}

export interface IExecutionReportData {
    id: string;
    testSuiteId: string;
    testDataSetIndex: number;
    testDataSetName: string;
    workflowId: string;
    workflowVersion: number;
    workflowSessionId: string;
    status: string;
    executionType: string;
    batchId: string;
    inputDataSnapshot: {
        message: string;
        variables: any;
    };
    expectedOutputSnapshot: IExpectedOutputSnapshot;
    actualOutput: IActualOutput;
    actualOrchestrationPath: any[];
    executionLineage: any[];
    inputTokenCount: number;
    outputTokenCount: number;
    totalLatencyMs: number;
    totalCost: string;
    startedAt: string;
    completedAt: string;
    errorMessage: string | null;
    errorStackTrace: string | null;
    isDeleted: boolean;
    createdBy: number;
    createdAt: string;
    updatedBy: number | null;
    updatedAt: string;
    workspaceId: number;
    TestSuite: ITestSuiteInfo;
    TestReports: ITestReport[];
    workflowName?: string;
}

export interface IExecutionReportResponse {
    message: string;
    data: IExecutionReportData;
}

// ============================================================================

export type ITestStudioFormProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    onCreate?: (data: ITestSuite) => void;
    onUpdate?: (data: ITestSuite) => void;
    register: UseFormRegister<ITestSuite>;
    handleSubmit: UseFormHandleSubmit<ITestSuite>;
    control: Control<ITestSuite, unknown>;
    watch: UseFormWatch<ITestSuite>;
    setValue: UseFormSetValue<ITestSuite>;
    reset: UseFormReset<ITestSuite>;
    errors: FieldErrors<ITestSuite>;
    isValid: boolean;
    fields: FieldArrayWithId<ITestSuite, 'testDataSets', 'id'>[];
    append: UseFieldArrayAppend<ITestSuite, 'testDataSets'>;
    remove: UseFieldArrayRemove;
    getValues: UseFormGetValues<ITestSuite>;
    existingTestSuites?: ITestSuiteListItem[];
};
