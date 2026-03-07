import { IVariableOption } from '@/models';
import {
    ITestSuite,
    ITestDataSet,
    IAgentEvaluation,
    IToolMockConfig,
    IMockScenario,
    ITestSuitePayload,
    ITestDataSetPayload,
    IAgentEvaluationPayload,
    IToolMockConfigPayload,
    IMockScenarioPayload,
    IToolMockSelectionPayload,
    ITestSuiteDetailResponse,
} from '@/models/test-studio.model';
import { TestCaseMethod } from '@/enums/test-studio-type';
/**
 * Convert IVariableOption[] to Record<string, unknown>
 */
export function variablesArrayToRecord(variables?: IVariableOption[]): Record<string, unknown> {
    if (!variables || variables.length === 0) return {};
    return variables.reduce<Record<string, unknown>>((acc, v) => {
        acc[v.label] = v.value;
        return acc;
    }, {});
}

/**
 * Map creation source from form testCaseMethod to API enum
 */
export function resolveCreationSource(testCaseMethod?: TestCaseMethod): string {
    switch (testCaseMethod) {
        case TestCaseMethod.Auto:
            return 'AI_GENERATED';
        case TestCaseMethod.Upload:
            return 'FILE';
        case TestCaseMethod.Manual:
        default:
            return 'MANUAL';
    }
}

/**
 * Parse a scenario config string into {request, response} objects.
 * Falls back to putting the whole parsed value into response if it's not already split.
 */
export function parseScenarioConfig(config: string): { request: Record<string, unknown>; response: Record<string, unknown> } {
    try {
        const parsed = JSON.parse(config);
        if (parsed && typeof parsed === 'object' && ('request' in parsed || 'response' in parsed)) {
            return {
                request: parsed.request ?? {},
                response: parsed.response ?? {},
            };
        }
        return { request: {}, response: parsed };
    } catch {
        return { request: {}, response: {} };
    }
}

/**
 * Map IToolMockConfig[] to IToolMockConfigPayload[]
 */
export function mapToolMockConfigs(configs?: IToolMockConfig[]): IToolMockConfigPayload[] {
    if (!configs || configs.length === 0) return [];
    return configs.map(config => {
        const scenarios: IMockScenarioPayload[] = config.scenarios.map(scenario => {
            const { request, response } = parseScenarioConfig(scenario.config);
            return {
                id: scenario.id,
                name: scenario.name,
                config: { request, response },
                mockMode: scenario.mockMode ?? 'static',
                description: scenario.name,
                llmInstruction: scenario.llmInstruction,
            };
        });
        return {
            toolId: config.toolId || config.id,
            toolName: config.toolName || config.id,
            scenarios,
            mockEnabled: config.mockEnabled ?? true,
            defaultScenarioId: config.defaultScenarioId ?? config.scenarios[0]?.id,
        };
    });
}

/**
 * Map a single IAgentEvaluation to IAgentEvaluationPayload
 */
export function mapAgentEvaluation(evaluation: IAgentEvaluation): IAgentEvaluationPayload {
    const toolMockSelections: IToolMockSelectionPayload[] = (evaluation.toolMockSelections ?? []).map(t => ({
        toolId: t.toolId,
        toolName: t.toolName,
        selectedScenarioId: t.selectedScenarioId,
    }));

    return {
        nodeId: evaluation.nodeId,
        agentName: evaluation.agentName,
        expectedAgentBehaviour: evaluation.expectedBehaviour,
        expectedOutput: evaluation.expectedOutput,
        toolMockSelections,
    };
}

/**
 * Merge agentOutputFields from ITestSuite into test data sets that lack agent evaluations.
 * Returns enriched agent evaluations for a given test data set index.
 */
export function mergeAgentOutputFields(
    existingEvaluations: IAgentEvaluation[] | undefined,
    agentOutputFields: ITestSuite['agentOutputFields'],
    testDataSetIndex: number
): IAgentEvaluation[] {
    if (existingEvaluations && existingEvaluations.length > 0) {
        return existingEvaluations;
    }
    if (!agentOutputFields) return [];

    // agentOutputFields is Record<agentNodeId, { expectedOutput, expectedBehaviour, instruction? }[]>
    // Each array index corresponds to a test data set index
    const evaluations: IAgentEvaluation[] = [];
    for (const [nodeId, fields] of Object.entries(agentOutputFields)) {
        const field = fields[testDataSetIndex];
        if (field) {
            evaluations.push({
                nodeId,
                agentName: nodeId,
                expectedBehaviour: field.expectedBehaviour ?? '',
                expectedOutput: field.expectedOutput ?? '',
                toolMockSelections: [],
            });
        }
    }
    return evaluations;
}


const getPrefix = (method: string) => {
    if (method === 'auto') return 'G';
    if (method === 'upload') return 'U';
    return 'M';
};
/**
 * Map a single ITestDataSet to ITestDataSetPayload
 */
export function mapTestDataSet(
    dataSet: ITestDataSet,
    testType: string,
    index: number,
    agentOutputFields?: ITestSuite['agentOutputFields']
): ITestDataSetPayload {
    const evaluations = mergeAgentOutputFields(dataSet.agentEvaluations, agentOutputFields, index);

    return {
        name: dataSet.name ?? dataSet.title ?? `Test Case ${index + 1}`,
        displayId: dataSet.displayId ?? `#${getPrefix(testType)}${index + 1}`,
        description: dataSet.description ?? '',
        input: {
            message: dataSet.input.message,
            variables: variablesArrayToRecord(dataSet.input.variables),
        },
        expectedWorkflowBehaviour: dataSet.expectedBehaviour,
        expectedOutput: dataSet.expectedOutput ?? '',
        expectedOrchestrationPath: dataSet.expectedOrchestrationPath ?? [],
        agentEvaluations: evaluations.map(mapAgentEvaluation),
    };
}

/**
 * Map the full ITestSuite form state to the ITestSuitePayload API shape
 */
export function mapTestSuiteToPayload(formData: ITestSuite): ITestSuitePayload {
    const testDataSets = (formData.testDataSets ?? []).map((ds, i) =>
        mapTestDataSet(ds,formData.testType, i, formData.agentOutputFields)
    );

    return {
        name: formData.name,
        description: formData.description,
        workflowId: formData.workflowId,
        workflowVersion: formData.workflowVersion ?? 1,
        creationSource: formData.creationSource || resolveCreationSource(formData.testCaseMethod),
        testDataSets,
        toolMockConfigs: mapToolMockConfigs(formData.toolMockConfigs),
    };
}

// --- Reverse Mappers (API Response → Form State) ---

/**
 * Convert Record<string, unknown> back to IVariableOption[] (inverse of variablesArrayToRecord)
 */
export function recordToVariablesArray(vars: Record<string, unknown>): IVariableOption[] {
    if (!vars || typeof vars !== 'object') return [];
    return Object.entries(vars).map(([key, value]) => ({
        label: key,
        value: String(value ?? ''),
    }));
}

/**
 * Derive testCaseMethod from API creationSource
 */
function reverseCreationSource(creationSource: string): TestCaseMethod {
    switch (creationSource) {
        case 'AI_GENERATED':
            return TestCaseMethod.Auto;
        case 'FILE':
            return TestCaseMethod.Upload;
        case 'MANUAL':
        default:
            return TestCaseMethod.Manual;
    }
}

/**
 * Map IAgentEvaluationPayload back to IAgentEvaluation
 */
function reverseMapAgentEvaluation(payload: IAgentEvaluationPayload): IAgentEvaluation {
    return {
        nodeId: payload.nodeId,
        agentName: payload.agentName,
        expectedBehaviour: payload.expectedAgentBehaviour,
        expectedOutput: typeof payload.expectedOutput === 'object' ? JSON.stringify(payload.expectedOutput) : String(payload.expectedOutput),
        // expectedOutput:"placeholder",
        toolMockSelections: (payload.toolMockSelections ?? []).map(t => ({
            toolId: t.toolId,
            toolName: t.toolName,
            selectedScenarioId: t.selectedScenarioId,
        })),
    };
}

/**
 * Map ITestDataSetPayload back to ITestDataSet
 */
export function reverseMapTestDataSet(payload: ITestDataSetPayload): ITestDataSet {
    return {
        name: payload.name,
        description: payload.description,
        input: {
            message: payload.input.message,
            variables: recordToVariablesArray(payload.input.variables),
        },
        expectedBehaviour: payload.expectedWorkflowBehaviour,

        expectedOutput: typeof payload.expectedOutput === 'object' ? JSON.stringify(payload.expectedOutput) : String(payload.expectedOutput),
        // expectedOutput: payload.expectedOutput,
        expectedOrchestrationPath: payload.expectedOrchestrationPath || [],
        agentEvaluations: (payload.agentEvaluations || []).map(reverseMapAgentEvaluation),
    };
}

/**
 * Map IToolMockConfigPayload back to IToolMockConfig
 */
function reverseMapToolMockConfig(payload: IToolMockConfigPayload): IToolMockConfig {
    const scenarios: IMockScenario[] = payload.scenarios.map(s => ({
        id: s.id,
        name: s.name,
        config: JSON.stringify(s.config),
        description: s.description,
        mockMode: s.mockMode,
        llmInstruction: s.llmInstruction,
    }));

    return {
        id: payload.toolId,
        toolName: payload.toolName,
        toolId: payload.toolId,
        mockEnabled: payload.mockEnabled,
        defaultScenarioId: payload.defaultScenarioId,
        scenarios,
    };
}

/**
 * Map the full API detail response back to Partial<ITestSuite> form state
 * (inverse of mapTestSuiteToPayload)
 */
export function mapDetailResponseToTestSuite(response: ITestSuiteDetailResponse): Partial<ITestSuite> {
    return {
        name: response.name,
        description: response.description,
        workflowId: response.workflowId,
        workflowVersion: response.workflowVersion,
        workflowName: response.workflowName,
        creationSource: response.creationSource,
        testCaseMethod: reverseCreationSource(response.creationSource),
        testDataSets: (response.testDataSets ?? []).map(reverseMapTestDataSet),
        toolMockConfigs: (response.toolMockDefinitions ?? []).map(reverseMapToolMockConfig),
    };
}
