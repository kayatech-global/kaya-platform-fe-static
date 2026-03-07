export enum ComponentType {
    OverallUsage,
    Consumption,
    MonthlyUsage,
}

export enum CodeDisplayBoxVariant {
    Default = 'default',
    Primary = 'primary',
    Secondary = 'secondary',
}

export enum AlertVariant {
    Info = 'info',
    Warning = 'warning',
    Success = 'success',
    Error = 'error',
}

export enum ExecutionStepBadgeType {
    Score = 'score',
    Status = 'status',
}

export interface APIConfig {
    label: string;
    value: string;
}

export interface CodeSnippets {
    [key: string]: string;
}
export interface APIConfigData {
    apiConfig: APIConfig[];
    codeSnippets: CodeSnippets;
}