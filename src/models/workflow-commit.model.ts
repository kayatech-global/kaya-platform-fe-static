export interface IWorkflowPush {
    version: string;
    releaseNote: string;
    artifactName: string;
}
export interface IGenerateReleaseNoteResponse {
    releaseNote: string;
}

export interface IArtifactStatus {
    isArtifactAvailable: boolean;
    artifactName: string;
    lastPushedVersion: string;
}
