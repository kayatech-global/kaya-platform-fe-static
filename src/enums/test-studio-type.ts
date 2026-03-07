export enum TestType {
    Smoke = 'Smoke',
    Sanity = 'Sanity',
    Regression = 'Regression',
    Integration = 'Integration',
}

export enum TestCaseMethod {
    Manual = 'manual',
    Auto = 'auto',
    Upload = 'upload',
}

export enum MockMode {
    Static = 'STATIC',
    Llm = 'LLM',
}

export enum WorkflowSource {
    Custom = 'custom',
    AwsBedrock = 'aws_bedrock',
}

export enum AgentToolType {
    Api = 'api',
    Mcp = 'mcp',
    Connectors = 'connectors',
    Guardrails = 'guardrails',
    KnowledgeBase = 'knowledgeBase',
    RAG = 'rag',
}

export enum TestStatus {
    Passed = 'Passed',
    Failed = 'Failed',
}

export enum ExecutionSessionStatus {
    Running = 'RUNNING',
    Completed = 'COMPLETED',
    Failed = 'FAILED',
}

export enum ExecutionItemStatus {
    Passed = 'PASSED',
    Failed = 'FAILED',
    Running = 'RUNNING',
    Pending = 'PENDING',
    partial = 'PARTIAL',
}

export enum ExecutionGroupBy {
    TestSuite = 'testsuite',
    Workflow = 'workflow',
}

export enum TestExecutionType {
    Partial = 'PARTIAL',
    FullSuite = 'FULL_SUITE',
}

export enum DataGenerationStepType {
    CONFIGURE = 1,
    DATASET,
    REVIEW,
    AGENTCONFIG,
}

export enum TestExecutionStepType {
    CONFIGURE = 1,
    EXECUTION,
}

export enum SyntheticTestSuiteComplexityType {
    SIMPLE = 'simple',
    MIXED = 'mixed',
    COMPLEX = 'complex',
}

export enum TestExecutionSafetyStatus  {
    PASSED='passed',
    FAILED='failed',
    WARNING='warning',
}

export enum EvaluationVerdict {
    Pass = 'PASS',
    Partial = 'PARTIAL',
    Fail = 'FAIL',
}