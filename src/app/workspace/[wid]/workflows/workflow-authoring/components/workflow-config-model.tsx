'use client';

import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, Badge } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { GenerateMethod, useWorkflowExecution } from '@/hooks/use-workflow-execution';
import { cn } from '@/lib/utils';
import { ISharedItem, IWorkflowTypes } from '@/models';
import { ArrowDownToLine, Copy, Eye, EyeOff, InfoIcon, MessageCircleMore, Server, Cloud, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import VariableConfigModal from './variable-config-modal';
import { Chatbot, ChatbotRef } from './chat-bot';

// Published deployment info type - reflects actual published workflow configuration
interface PublishedDeploymentInfo {
    isPublished: boolean;
    executionRuntime: 'kaya' | 'agentcore';
    version?: string;
    publishedAt?: string;
    // AgentCore specific fields - populated from publish values
    runtimeId?: string;
    runtimeName?: string;
    region?: string;
    sourceType?: 'S3' | 'ECR';
    sourcePath?: string;
    // Connection status
    connectionStatus?: 'ready' | 'error' | 'pending';
}

// Mock function to get published deployment info - replace with actual API call
// This should return the values selected during the publish flow
const getPublishedDeploymentInfo = async (workflowId: string): Promise<PublishedDeploymentInfo> => {
    // Simulate API call - in production, this would return actual published configuration
    // For demo, randomly return different configurations
    const isAgentCore = Math.random() > 0.5;
    
    if (isAgentCore) {
        return {
            isPublished: true,
            executionRuntime: 'agentcore',
            version: '1.2.0',
            publishedAt: '2026-03-28T10:30:00Z',
            runtimeId: '1',
            runtimeName: 'Production Runtime',
            region: 'us-east-1',
            sourceType: 'S3',
            sourcePath: 's3://kaya-workflows/production/',
            connectionStatus: Math.random() > 0.2 ? 'ready' : 'error',
        };
    }
    
    return {
        isPublished: true,
        executionRuntime: 'kaya',
        version: '1.2.0',
        publishedAt: '2026-03-28T10:30:00Z',
    };
};

// AgentCore boto3 code snippets
const getAgentCoreCodeSnippets = (workflowId: string, sessionId: string, apiKey: string, region: string = 'us-east-1') => ({
    Python: `import boto3
import json

# Initialize the Bedrock AgentCore client
client = boto3.client(
    'bedrock-agent-runtime',
    region_name='${region}'
)

# Workflow configuration
workflow_id = "${workflowId}"
session_id = "${sessionId}"
api_key = "${apiKey}"

def invoke_workflow(message: str, variables: dict = None):
    """Invoke the KAYA workflow deployed on AgentCore"""
    
    response = client.invoke_agent(
        agentId=workflow_id,
        agentAliasId='TSTALIASID',
        sessionId=session_id,
        inputText=message,
        sessionState={
            'sessionAttributes': {
                'api_key': api_key,
                'variables': json.dumps(variables or {})
            }
        }
    )
    
    # Process streaming response
    event_stream = response['completion']
    full_response = ""
    
    for event in event_stream:
        if 'chunk' in event:
            chunk = event['chunk']
            if 'bytes' in chunk:
                full_response += chunk['bytes'].decode('utf-8')
    
    return full_response

# Example usage
if __name__ == "__main__":
    result = invoke_workflow(
        message="Hello, how can you help me?",
        variables={"user_name": "John"}
    )
    print(result)
`,
    JavaScript: `import { 
    BedrockAgentRuntimeClient, 
    InvokeAgentCommand 
} from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize the Bedrock AgentCore client
const client = new BedrockAgentRuntimeClient({ 
    region: "${region}" 
});

// Workflow configuration
const workflowId = "${workflowId}";
const sessionId = "${sessionId}";
const apiKey = "${apiKey}";

async function invokeWorkflow(message, variables = {}) {
    const command = new InvokeAgentCommand({
        agentId: workflowId,
        agentAliasId: "TSTALIASID",
        sessionId: sessionId,
        inputText: message,
        sessionState: {
            sessionAttributes: {
                api_key: apiKey,
                variables: JSON.stringify(variables)
            }
        }
    });

    try {
        const response = await client.send(command);
        let fullResponse = "";

        // Process streaming response
        for await (const event of response.completion) {
            if (event.chunk?.bytes) {
                const chunk = new TextDecoder().decode(event.chunk.bytes);
                fullResponse += chunk;
            }
        }

        return fullResponse;
    } catch (error) {
        console.error("Error invoking workflow:", error);
        throw error;
    }
}

// Example usage
invokeWorkflow("Hello, how can you help me?", { user_name: "John" })
    .then(result => console.log(result))
    .catch(error => console.error(error));
`,
});

interface WorkFlowConfigurationModelProps {
    loadingVariables?: boolean;
    workFlowId: string;
    openWorkFlowConfigModel: boolean;
    variables: ISharedItem[] | undefined;
    setOpenWorkFlowConfigModel: React.Dispatch<React.SetStateAction<boolean>>;
    availableVersions?: IWorkflowTypes[];
    isDraft: boolean | undefined;
}

export const WorkflowConfigurationModel = ({
    loadingVariables,
    workFlowId,
    openWorkFlowConfigModel,
    variables,
    setOpenWorkFlowConfigModel,
    availableVersions,
    isDraft,
}: WorkFlowConfigurationModelProps) => {
    const params = useParams();
    const chatbotRef = useRef<ChatbotRef>(null);
    const { isMobile } = useBreakpoint();
    const [isChatSectionVisible, setIsChatSectionVisible] = useState(!isMobile);
    const [mounted, setMounted] = useState<boolean>(false);
    
    // Published deployment state - reflects actual published values
    const [publishedDeployment, setPublishedDeployment] = useState<PublishedDeploymentInfo | null>(null);
    const [isLoadingDeployment, setIsLoadingDeployment] = useState(false);
    
    // Runtime selection for playground (user can switch between available runtimes)
    const [selectedRuntime, setSelectedRuntime] = useState<'kaya' | 'agentcore'>('kaya');
    
    // Code snippet state
    const [agentCoreCodeSnippetLang, setAgentCoreCodeSnippetLang] = useState<'Python' | 'JavaScript'>('Python');
    const [agentCoreCodeCopied, setAgentCoreCodeCopied] = useState(false);
    
    const {
        key,
        isFullScreen,
        apiConfigData,
        isHidden,
        apiKeyCopied,
        isApiKeyLoading,
        isSsoLoading,
        selectedLanguage,
        apiConfigCopied,
        currentGenerateMethod,
        sessionId,
        variableOptions,
        apiKey,
        isVariableOpen,
        messageHistory,
        setMessageHistory,
        setVariableOptions,
        setSelectedLanguage,
        setApiConfigData,
        setSessionId,
        setIsHidden,
        setIsFullScreen,
        setVariableOpen,
        handleGenerate,
        handleDownloadPostmanCollection,
        handleApiKeyCopy,
        handleApConfigCopy,
        resetChat,
        draftVersion,
    } = useWorkflowExecution({ workFlowId, availableVersions, isDraft });

    // Load published deployment info when modal opens
    useEffect(() => {
        if (openWorkFlowConfigModel && workFlowId) {
            setIsLoadingDeployment(true);
            getPublishedDeploymentInfo(workFlowId)
                .then(deployment => {
                    setPublishedDeployment(deployment);
                    // Auto-select the runtime based on published configuration
                    if (deployment.isPublished) {
                        setSelectedRuntime(deployment.executionRuntime);
                    }
                })
                .finally(() => setIsLoadingDeployment(false));
        }
    }, [openWorkFlowConfigModel, workFlowId]);

    useEffect(() => {
        setApiConfigData(null);
        setIsChatSectionVisible(!isMobile);
        setSessionId(crypto.randomUUID());
    }, [workFlowId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (chatbotRef?.current && openWorkFlowConfigModel && !mounted) {
                setMessageHistory([]);
                chatbotRef.current.clearMessages();
                setMounted(true);
            }
        }, 0);
        return () => clearTimeout(timeout);
    }, [workFlowId, openWorkFlowConfigModel]);

    const handleAgentCoreCodeCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setAgentCoreCodeCopied(true);
        setTimeout(() => setAgentCoreCodeCopied(false), 2000);
    };

    // Generate code snippets with actual region from published deployment
    const agentCoreSnippets = getAgentCoreCodeSnippets(
        workFlowId, 
        sessionId, 
        apiKey || '<YOUR_API_KEY>',
        publishedDeployment?.region || 'us-east-1'
    );

    // Get workflow name from available versions
    const workflowName = availableVersions?.[0]?.name || 'Workflow';
    const workflowVersion = isDraft 
        ? `Draft (v${draftVersion || '1'})` 
        : publishedDeployment?.version || availableVersions?.find(v => v.name === 'publish')?.version || '1.0.0';

    // Check if AgentCore is available (published with AgentCore runtime)
    const isAgentCoreAvailable = publishedDeployment?.executionRuntime === 'agentcore' && publishedDeployment?.isPublished;

    return (
        <>
            <Sheet open={openWorkFlowConfigModel} onOpenChange={setOpenWorkFlowConfigModel}>
                <SheetContent side={'bottom'} className="pb-3 z-[100010]" hideClose={isFullScreen}>
                    <SheetHeader>
                        <SheetTitle>Workflow Config</SheetTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Use SSO or generate API key to test out the workflow
                        </p>
                    </SheetHeader>
                    <SheetDescription className="grid grid-cols-12 gap-6 mt-2" asChild>
                        <div>
                            <div
                                className={`col-span-12 md:col-span-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-y-auto max-h-[70vh] ${
                                    isMobile && isChatSectionVisible ? 'hidden' : ''
                                }`}
                            >
                                {/* Deployment Context Panel - Shows actual published values */}
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        Deployment Context
                                    </h4>
                                    
                                    {isLoadingDeployment ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Loading deployment info...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Workflow Name</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{workflowName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Version</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{workflowVersion}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">Execution Runtime</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button
                                                        onClick={() => setSelectedRuntime('kaya')}
                                                        className={cn(
                                                            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                                                            selectedRuntime === 'kaya'
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                        )}
                                                    >
                                                        <Cloud className="w-3.5 h-3.5" />
                                                        KAYA Default Engine
                                                    </button>
                                                    <button
                                                        onClick={() => isAgentCoreAvailable && setSelectedRuntime('agentcore')}
                                                        disabled={!isAgentCoreAvailable}
                                                        className={cn(
                                                            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                                                            selectedRuntime === 'agentcore'
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                                                            !isAgentCoreAvailable && 'opacity-50 cursor-not-allowed'
                                                        )}
                                                    >
                                                        <Server className="w-3.5 h-3.5" />
                                                        AWS AgentCore Runtime
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* AgentCore-specific info - populated from published deployment values */}
                                            {selectedRuntime === 'agentcore' && isAgentCoreAvailable && (
                                                <>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Runtime Connection</span>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {publishedDeployment?.runtimeName || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Region</span>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {publishedDeployment?.region || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Source Type</span>
                                                        <Badge variant={publishedDeployment?.sourceType === 'S3' ? 'default' : 'secondary'}>
                                                            {publishedDeployment?.sourceType === 'S3' ? 'S3 Bucket' : 'ECR Container'}
                                                        </Badge>
                                                    </div>
                                                    {publishedDeployment?.publishedAt && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Published</span>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                {new Date(publishedDeployment.publishedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Connection Health Status - for AgentCore */}
                                    {selectedRuntime === 'agentcore' && isAgentCoreAvailable && !isLoadingDeployment && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            {publishedDeployment?.connectionStatus === 'ready' ? (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">AgentCore Ready</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Connection Error — check runtime configuration</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Not Deployed to AgentCore Message */}
                                {selectedRuntime === 'agentcore' && !isAgentCoreAvailable && !isLoadingDeployment && (
                                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                    Workflow Not Deployed to AgentCore
                                                </p>
                                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                    This workflow has not been deployed to AgentCore. Publish with AgentCore runtime selected to deploy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* KAYA Default Engine - Original auth flow */}
                                {selectedRuntime === 'kaya' && (
                                    <>
                                        {apiConfigData ? (
                                            apiConfigData?.apiConfig?.map((item) => (
                                                <div
                                                    className="flex justify-between w-full items-end md:block mb-2"
                                                    key={item.label}
                                                >
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                                                            {item.label}
                                                        </label>
                                                        <div className="flex items-center bg-gray-100 dark:bg-gray-300 p-2 rounded-md">
                                                            <input
                                                                type={isHidden ? 'password' : 'text'}
                                                                value={item.value}
                                                                readOnly
                                                                className="flex-1 bg-transparent text-sm text-gray-900 outline-none"
                                                            />
                                                            <div>
                                                                <Button
                                                                    className="mx-2"
                                                                    size="icon"
                                                                    variant="link"
                                                                    onClick={() => setIsHidden(!isHidden)}
                                                                >
                                                                    {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                </Button>

                                                                <div className="relative inline-block">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="link"
                                                                        onClick={handleApiKeyCopy}
                                                                    >
                                                                        <Copy size={16} />
                                                                    </Button>

                                                                    {apiKeyCopied && (
                                                                        <div
                                                                            className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                                                                            style={{ zIndex: 10 }}
                                                                        >
                                                                            Copied!
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isMobile && (
                                                        <Button
                                                            size={'lg'}
                                                            variant="primary"
                                                            onClick={() => {
                                                                setIsChatSectionVisible(!isChatSectionVisible);
                                                            }}
                                                        >
                                                            <MessageCircleMore size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col gap-y-4">
                                                {/* API Key Authentication */}
                                                <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-center space-x-2">
                                                        <InfoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                API Key Authentication
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Use an Application Token to securely authenticate API requests.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="p-2"
                                                        onClick={() => handleGenerate(GenerateMethod.BY_API)}
                                                        loading={isApiKeyLoading}
                                                    >
                                                        Continue with API Key
                                                    </Button>
                                                </div>

                                                {/* SSO Authentication */}
                                                <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-center space-x-2">
                                                        <InfoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                Single Sign-On (SSO)
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Sign in using your organization&#39;s SSO to access workflows.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="p-2"
                                                        onClick={() => handleGenerate(GenerateMethod.BY_SSO)}
                                                        loading={isSsoLoading}
                                                    >
                                                        Continue with SSO
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {apiConfigData && (
                                            <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                                <TabsList className="flex justify-between">
                                                    <div className="flex gap-2">
                                                        {Object.keys(apiConfigData.codeSnippets).map(lang => (
                                                            <TabsTrigger
                                                                key={lang}
                                                                value={lang}
                                                                className={cn(
                                                                    'px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md',
                                                                    {
                                                                        'text-blue-500 dark:text-blue-400':
                                                                            selectedLanguage === lang,
                                                                        'text-gray-700 dark:text-gray-300':
                                                                            selectedLanguage !== lang,
                                                                    }
                                                                )}
                                                            >
                                                                {lang}
                                                            </TabsTrigger>
                                                        ))}
                                                    </div>

                                                    <Button
                                                        className="float-end me-2"
                                                        size="icon"
                                                        variant="link"
                                                        onClick={handleDownloadPostmanCollection}
                                                    >
                                                        <ArrowDownToLine className="text-dark" size={16} /> Postman request
                                                    </Button>
                                                </TabsList>
                                                {Object.entries(apiConfigData?.codeSnippets).map(([lang, code]) => (
                                                    <TabsContent
                                                        key={lang}
                                                        value={lang}
                                                        className="dark:border-blue-900 dark:border rounded-md"
                                                    >
                                                        <div className="relative bg-gray-900 text-white p-4 rounded-md mt-2">
                                                            <div className="flex justify-between text-sm font-semibold mb-2">
                                                                <span>{lang.toUpperCase()}</span>
                                                                <div className="flex gap-x-3">
                                                                    <div className="relative inline-block">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="link"
                                                                            onClick={() => {
                                                                                handleApConfigCopy(code);
                                                                            }}
                                                                        >
                                                                            <Copy className="text-gray-300" size={16} />
                                                                        </Button>

                                                                        {apiConfigCopied && (
                                                                            <div
                                                                                className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                                                                                style={{ zIndex: 10 }}
                                                                            >
                                                                                Copied!
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm whitespace-pre-wrap h-[35vh] custom-overflow-auto text-blue-500">
                                                                <pre className={`language-${lang.toLowerCase()} block`}>
                                                                    {code}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                ))}
                                            </Tabs>
                                        )}
                                    </>
                                )}

                                {/* AgentCore Runtime - Code Snippets */}
                                {selectedRuntime === 'agentcore' && isAgentCoreAvailable && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Programmatic Invocation
                                        </h4>
                                        <Tabs value={agentCoreCodeSnippetLang} onValueChange={(v) => setAgentCoreCodeSnippetLang(v as 'Python' | 'JavaScript')}>
                                            <TabsList className="flex gap-2 mb-2">
                                                <TabsTrigger
                                                    value="Python"
                                                    className={cn(
                                                        'px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm',
                                                        agentCoreCodeSnippetLang === 'Python'
                                                            ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    )}
                                                >
                                                    Python
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="JavaScript"
                                                    className={cn(
                                                        'px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm',
                                                        agentCoreCodeSnippetLang === 'JavaScript'
                                                            ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    )}
                                                >
                                                    JavaScript
                                                </TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="Python">
                                                <div className="relative bg-gray-900 text-white p-4 rounded-md">
                                                    <div className="flex justify-between text-sm font-semibold mb-2">
                                                        <span className="text-gray-400">boto3 bedrock-agent-runtime</span>
                                                        <div className="relative inline-block">
                                                            <Button
                                                                size="icon"
                                                                variant="link"
                                                                onClick={() => handleAgentCoreCodeCopy(agentCoreSnippets.Python)}
                                                            >
                                                                <Copy className="text-gray-300" size={16} />
                                                            </Button>
                                                            {agentCoreCodeCopied && (
                                                                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg z-10">
                                                                    Copied!
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm whitespace-pre-wrap h-[35vh] overflow-auto">
                                                        <pre className="language-python text-green-400">
                                                            {agentCoreSnippets.Python}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="JavaScript">
                                                <div className="relative bg-gray-900 text-white p-4 rounded-md">
                                                    <div className="flex justify-between text-sm font-semibold mb-2">
                                                        <span className="text-gray-400">@aws-sdk/client-bedrock-agent-runtime</span>
                                                        <div className="relative inline-block">
                                                            <Button
                                                                size="icon"
                                                                variant="link"
                                                                onClick={() => handleAgentCoreCodeCopy(agentCoreSnippets.JavaScript)}
                                                            >
                                                                <Copy className="text-gray-300" size={16} />
                                                            </Button>
                                                            {agentCoreCodeCopied && (
                                                                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg z-10">
                                                                    Copied!
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm whitespace-pre-wrap h-[35vh] overflow-auto">
                                                        <pre className="language-javascript text-yellow-400">
                                                            {agentCoreSnippets.JavaScript}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </div>
                            
                            {/* Chatbot - Works identically for both runtimes */}
                            <Chatbot
                                ref={chatbotRef}
                                key={key}
                                workFlowId={workFlowId}
                                currentGenerateMethod={currentGenerateMethod}
                                sessionId={sessionId}
                                variableOptions={variableOptions}
                                apiKey={apiKey}
                                wid={params?.wid}
                                apiConfigData={apiConfigData}
                                isFullScreen={isFullScreen}
                                isMobile={isMobile}
                                isChatSectionVisible={isChatSectionVisible}
                                openWorkFlowConfigModel={openWorkFlowConfigModel}
                                messageHistory={messageHistory}
                                setMessageHistory={setMessageHistory}
                                setIsFullScreen={setIsFullScreen}
                                setSessionId={setSessionId}
                                setIsChatSectionVisible={setIsChatSectionVisible}
                                setVariableOpen={setVariableOpen}
                                onReload={() => resetChat()}
                                draftVersion={draftVersion}
                                isDraft={isDraft}
                            />
                        </div>
                    </SheetDescription>
                </SheetContent>
            </Sheet>
            <VariableConfigModal
                isOpen={isVariableOpen}
                isLoading={loadingVariables}
                variables={variables}
                currentVariable={variableOptions}
                setOpen={setVariableOpen}
                onApplyVariables={value => setVariableOptions(value)}
            />
        </>
    );
};
