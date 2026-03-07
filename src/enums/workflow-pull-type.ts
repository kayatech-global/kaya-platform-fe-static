export enum WorkflowPullReferenceType {
    LLM = 'LLM',
    SLM = 'SLM',
    VECTOR_DB = 'VECTOR_DB',
    RELATIONAL_DB = 'RELATIONAL_DB',
    MODEL = 'MODEL',
    RAG = 'RAG',
    UNKNOWN = 'UNKNOWN',
}

export enum WorkflowSaveType {
    DRAFT = 'draft',
    PUBLISH = 'publish',
}

export enum ArtifactApproachType {
    CREATE_AS_NEW = 'createAsNew',
    OVERWRITE_EXISTING = 'overwriteExisting',
    CLONE = 'clone',
}
