import { PackageReleaseType } from '@/enums';

export interface IPackageCommit {
    releaseType: PackageReleaseType;
    releaseNote: string;
    version: string;
}

export interface IPackageWorkflow {
    id: string;
    workflow: string;
    source: string;
    destination: string;
    hasCurrentVersion?: boolean;
}
