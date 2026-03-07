export enum ConfigType {
    Empty = '',
    IntelligenceSource = 'Intelligence Source',
    API = 'API',
    MCP = 'MCP',
    Prompt = "Prompt",
}
export interface ComparisonSection {
    id: string;
    label: string;
    differences: number;
    missing: number;
    comparison: {
        currentVersion: string;
        previousVersion: string;
        sectionData: SectionData[];
    } | null;
}
export interface SectionData {
    title: string;
    items: ComparisonItem[];
}
export type ComparisonValue = string | number | null;

export interface ComparisonItem {
    label: string;
    current: ComparisonValue;
    previous: ComparisonValue;
    status: ComparisonStatus;
    globalId?: string; // Added globalId field
    field?: string; // Added field property from backend
    failureMessage?: string; // Optional field for failure messages
}

export enum ComparisonStatus {
    MATCH = 'match',
    MISSING = 'missing',
    DIFFERENT = 'different',
    CONFIGURE = 'configure',
    UPDATED = 'updated',
    VERIFIED = 'verified',
    VALIDATED = 'validated',
    FAILED = 'failed',
}

export interface Configuration {
    [globalId: string]: {
        [field: string]: string | number | null;
    };
}