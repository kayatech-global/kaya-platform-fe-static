import { useMutation } from 'react-query';
import { $fetch } from '@/utils';
import { useParams } from 'next/navigation';
import {  IToolMockConfig, ITestDataSetPayload } from '@/models/test-studio.model';
import { toast } from 'sonner';
import {SyntheticTestSuiteComplexityType} from "@/enums/test-studio-type";

// Request types
export interface ISampleTestScenario {
    scenario: string;
    sampleInput: {
        message: string;
    };
    sampleOutput: string;
    sampleExpectedWorkflowBehaviour: string;
    variableDefinitions: IVariableDefinitions[];
    agentEvaluations: {
        nodeId: string;
        agentName: string;
        sampleOutput: string;
    sampleExpectedAgentBehaviour: string;
    }[];
}

export interface IToolMockScenario {
    id: string;
    name: string;
    config: {
        request: Record<string, unknown>;
        response: Record<string, unknown>;
    };
    mockMode: string;
    description: string;
    llmInstruction?: string;
}

export interface IToolMock {
    toolId: string;
    toolName: string;
    scenarios: IToolMockScenario[];
    mockEnabled: boolean;
    defaultScenarioId?: string;
}
export interface IVariableDefinitions{
    "key": string;
    "description": string;
    "dataType": string;
    "strict":boolean;
    "allowedValues": string[];
}
export interface IGenerateSyntheticDataRequest {
    workflowId: string;
    workflowVersion?: number;
    count: number;
    complexity?: SyntheticTestSuiteComplexityType;
    sampleTestScenario: ISampleTestScenario;
    toolMockConfigs?: IToolMock[];
}

// Response types
export interface IGenerateSyntheticDataResponse {
        workflowId: string;
        workflowVersion: number;
        generatedMataData:{
            count:number;
            complexity:string;
            includedEdgeCases:boolean;
            usedSamplingData:boolean;
            generatedAt:string;
        }
        testDataSets: ITestDataSetPayload[];
    }

export const useGenerateSyntheticData = () => {
    const params = useParams();

    const generateSyntheticData = async (request: IGenerateSyntheticDataRequest) => {
        const workspaceId = params.wid as string;
        const response = await $fetch<IGenerateSyntheticDataResponse>(
            `/workspaces/${workspaceId}/teststudio/generate-synthetic-data`,
            {
                method: 'POST',
                headers: {
                    'x-workspace-id': workspaceId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            }
        );

        console.log('API response:', response);
        // $fetch returns { data: <response body> }, so we return the full structure for the modal to process
        return response.data;
    };

    const {
        mutate: generateData,
        mutateAsync: generateDataAsync,
        isLoading: isGenerating,
        error: generateError,
        data: generatedData,
        reset: resetGeneration,
    } = useMutation<IGenerateSyntheticDataResponse, Error, IGenerateSyntheticDataRequest>(
        'generateSyntheticData',
        generateSyntheticData,
        {
            onError: ()=> {
                toast.error("Failed to generate tests")
            }
        }
    );

    // Helper function to build the request from form data
    const buildSyntheticDataRequest = (params: {
        workflowId: string;
        workflowVersion?: number;
        count: number;
        complexity?: SyntheticTestSuiteComplexityType
        scenario: string;
        sampleInput: string;
        sampleOutput: string;
        sampleExpectedWorkflowBehaviour: string;
        agentEvaluations?: {
            nodeId: string;
            agentName: string;
            expectedOutput: string;
        sampleExpectedAgentBehaviour: string;
        }[];
        toolMockConfigs?: IToolMockConfig[];
        variableDefinitions?: IVariableDefinitions[];
    }): IGenerateSyntheticDataRequest => {
        const {
            workflowId,
            workflowVersion = 1,
            count,
            complexity = SyntheticTestSuiteComplexityType.MIXED,
            scenario,
            sampleInput,
            sampleOutput,
            sampleExpectedWorkflowBehaviour,
            agentEvaluations = [],
            toolMockConfigs = [],
            variableDefinitions= [],
        } = params;

        // Build agent evaluations for the request
        const requestAgentEvaluations = agentEvaluations.map(ae => ({
            nodeId: ae.nodeId,
            agentName: ae.agentName,
            sampleOutput: ae.expectedOutput,
            sampleExpectedAgentBehaviour: ae.sampleExpectedAgentBehaviour,
        }));

        // Build tool mocks from tool mock configs
        const toolMocks: IToolMock[] = toolMockConfigs.map(config => ({
            toolId: config.toolId || config.id,
            toolName: config.toolName || config.id,
            scenarios: config.scenarios.map(scenario => {
                let parsed: { request?: Record<string, unknown>; response?: Record<string, unknown> } = {};
                try { parsed = JSON.parse(scenario.config || '{}'); } catch { /* empty */ }
                const hasRequestResponse = parsed && typeof parsed === 'object' && ('request' in parsed || 'response' in parsed);
                return {
                    id: scenario.id,
                    name: scenario.name,
                    config: {
                        request: hasRequestResponse ? (parsed.request ?? {}) : {},
                        response: hasRequestResponse ? (parsed.response ?? {}) : parsed as Record<string, unknown>,
                    },
                    mockMode: scenario.mockMode || 'LLM',
                    description: scenario.name,
                    llmInstruction: scenario.llmInstruction,
                };
            }),
            mockEnabled: config.mockEnabled ?? true,
            defaultScenarioId: config.defaultScenarioId || config.scenarios[0]?.id || '',
        }));

        return {
            workflowId,
            workflowVersion,
            count,
            complexity,
            sampleTestScenario: {
                scenario,
                sampleInput: {
                    message: sampleInput,
                },
                sampleOutput,
                sampleExpectedWorkflowBehaviour: sampleExpectedWorkflowBehaviour,
                agentEvaluations: requestAgentEvaluations,
                variableDefinitions:variableDefinitions
            },
            toolMockConfigs: toolMocks,
        };
    };

    return {
        generateData,
        generateDataAsync,
        isGenerating,
        generateError,
        generatedData,
        resetGeneration,
        buildSyntheticDataRequest,
    };
};
