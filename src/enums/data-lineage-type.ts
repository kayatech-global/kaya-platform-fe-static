export enum SessionViewType {
    LINEAR = 'linear',
    MODULAR = 'modular',
}

export enum SessionDateType {
    StartAt,
    EndAt,
}

export enum ExecutionStatusType {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum LineageEventType {
    ExportJSON = 'ExportJSON',
}

export enum LineageStepExplanationType {
    MODULAR_VIEW_DATA = 'MODULARVIEWDATA',
    LINEAR_VIEW_DATA = 'LINEARVIEWDATA',
}

export enum LineageSubStepExplanationType {
    LLM = 'LLM',
    SLM = 'SLM',
    API = 'API',
    VECTORRAG = 'RAG',
    GRAPHRAG = 'GRAPH_RAG',
    MCP = 'MCP',
    STS = 'STS',
    DATABASE_CONNECTOR = 'DATABASE_CONNECTOR',
    EXECUTABLE_FUNCTION = 'EXECUTABLE_FUNCTION',
    SUB_WORKFLOW = 'SUB_WORKFLOW',
    ITERATOR = 'ITERATOR',
}
