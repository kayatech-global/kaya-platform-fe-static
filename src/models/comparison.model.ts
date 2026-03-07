import { ComparisonItem } from '@/enums/config-type';

export interface IComparisonSectionData {
    title: string;
    items: ComparisonItem[];
}

export interface IComparison {
    currentVersion: string;
    previousVersion: string;
    sectionData: IComparisonSectionData[];
}

export interface IComparisonSection {
    id: string;
    label: string;
    differences: number;
    missing: number;
    comparison: IComparison | null;
}

export interface IComparisonValidateResponse {
    entities: IComparisonSection[];
    errors: string[];
    valid: boolean;
    validationResults: unknown;
    warnings: string[];
    workspaceId: string;
}

export interface IComparisonPackageDetailsResponse {
    package: {
        name: string;
        version: string;
        description?: string;
        metadata?: Record<string, unknown>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
