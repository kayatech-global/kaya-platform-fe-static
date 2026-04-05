export interface DeploymentInfo {
    workflowName: string;
    workflowVersion: string;
    runtimeName: string;
    region: string;
    sourceArtifact: string;
    status: 'ready' | 'running' | 'error';
    deploymentId: string;
    deployedAt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isAgentCore?: boolean;
}

export type CodeLanguage = 'python' | 'javascript';

export interface CodeSnippet {
    language: CodeLanguage;
    code: string;
}
