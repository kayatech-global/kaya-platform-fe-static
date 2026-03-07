/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { $fetch } from '@/utils';
import config from '@/config/environment-variables';
import { APIConfigData } from '@/enums/component-type';
import { IVariableOption, IWorkflowTypes } from '@/models';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { ChatMessage } from './use-chatbot';

const API_CONFIG_TEMPLATE = {
    codeSnippets: {
        curl: `
curl --request POST \
  --url ${config.CHAT_BOT_URL}/workflows/execute \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <YOUR_GENERATED_API_KEY>' \
  --data '{
  "message": "<YOUR_MESSAGE>",
  "workflow_id": "{current_workflow_id}",
  "session_id": "<AUTO_GENERATED_UUID>",
  "variables": <YOUR_VARIABLES>,
  "is_stream": true,
  "auth_type": "API_KEY",
  "workflow_version": <DRAFT_VERSION>
}'
`,
        python: `
import requests

url = "${config.CHAT_BOT_URL}/workflows/execute"

payload = {
    "message": "<YOUR_MESSAGE>",
    "workflow_id": "{current_workflow_id}",
    "session_id": "<AUTO_GENERATED_UUID>",
    "variables": <YOUR_VARIABLES>,
    "is_stream": True,
    "auth_type": "API_KEY",
    "workflow_version": <DRAFT_VERSION>
}
headers = {
    "x-api-key": "<YOUR_GENERATED_API_KEY>",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)
`,
        javascript: `
const options = {
  method: 'POST',
  headers: {'x-api-key': '<YOUR_GENERATED_API_KEY>', 'Content-Type': 'application/json'},
  body: '{"message":"<YOUR_MESSAGE>","workflow_id":"{current_workflow_id}","session_id":"<AUTO_GENERATED_UUID>","variables": <YOUR_VARIABLES>,"is_stream":true,"auth_type":"API_KEY","workflow_version": <DRAFT_VERSION>}'
};

fetch('${config.CHAT_BOT_URL}/workflows/execute', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
`,
        java: `
OkHttpClient client = new OkHttpClient();

MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create(mediaType, "{\n  \\"message\\": \\"<YOUR_MESSAGE>\\",\n  \\"workflow_id\\": \\"{current_workflow_id}\\",\n  \\"session_id\\": \\"<AUTO_GENERATED_UUID>\\",\n  \\"variables\\": <YOUR_VARIABLES>,\n  \\"is_stream\\": true,\n  \\"auth_type\\": \\"API_KEY,\\"\n  \\"workflow_version\\": <DRAFT_VERSION>\n}");
Request request = new Request.Builder()
  .url("${config.CHAT_BOT_URL}/workflows/execute")
  .post(body)
  .addHeader("x-api-key", "<YOUR_GENERATED_API_KEY>")
  .addHeader("Content-Type", "application/json")
  .build();

Response response = client.newCall(request).execute();
`,
    },
    ssoCodeSnippets: {
        curl: `
curl --request POST \
  --url ${config.CHAT_BOT_URL}/workflows/execute \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <YOUR_SSO_TOKEN>' \
  --data '{
  "message": "<YOUR_MESSAGE>",
  "workflow_id": "{current_workflow_id}",
  "session_id": "<AUTO_GENERATED_UUID>",
  "variables": <YOUR_VARIABLES>,
  "is_stream": true,
  "auth_type": "SSO",
  "workflow_version": <DRAFT_VERSION>
}'
`,
        python: `
import requests

url = "${config.CHAT_BOT_URL}/workflows/execute"

payload = {
    "message": "<YOUR_MESSAGE>",
    "workflow_id": "{current_workflow_id}",
    "session_id": "<AUTO_GENERATED_UUID>",
    "variables": <YOUR_VARIABLES>,
    "is_stream": True,
    "auth_type": "SSO",
    "workflow_version": <DRAFT_VERSION>
}
headers = {
    "Authorization": "Bearer <YOUR_SSO_TOKEN>",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)
`,
        javascript: `
const options = {
  method: 'POST',
  headers: {'Authorization': 'Bearer <YOUR_SSO_TOKEN>', 'Content-Type': 'application/json'},
  body: '{"message":"<YOUR_MESSAGE>","workflow_id":"{current_workflow_id}","session_id":"<AUTO_GENERATED_UUID>","variables": <YOUR_VARIABLES>,"is_stream":true,"auth_type":"SSO","workflow_version": <DRAFT_VERSION>}'
};

fetch('${config.CHAT_BOT_URL}/workflows/execute', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
`,
        java: `
OkHttpClient client = new OkHttpClient();

MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create(mediaType, "{\n  \\"message\\": \\"<YOUR_MESSAGE>\\",\n  \\"workflow_id\\": \\"{current_workflow_id}\\",\n  \\"session_id\\": \\"<AUTO_GENERATED_UUID>\\",\n  \\"variables\\": <YOUR_VARIABLES>,\n  \\"is_stream\\": true,\n  \\"auth_type\\": \\"SSO\\",\n  \\"workflow_version\\": <DRAFT_VERSION>\n}");
Request request = new Request.Builder()
  .url("${config.CHAT_BOT_URL}/workflows/execute")
  .post(body)
  .addHeader("Authorization", "Bearer <YOUR_SSO_TOKEN>")
  .addHeader("Content-Type", "application/json")
  .build();

Response response = client.newCall(request).execute();
`,
    },
};

export interface IApiCallConfig {
    name: string;
    trigger: 'before' | 'after' | 'button';
    buttonId?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string | ((vars: Record<string, any>) => string);
    headers?: Record<string, string | ((vars: Record<string, any>) => string)>;
    bodyTemplate?: string | ((vars: Record<string, any>) => string);
    auth?: {
        type: 'bearer' | 'basic' | 'apikey';
        credentials: string | ((vars: Record<string, any>) => string);
    };
    response?: string;
    // Websocket configuration for waiting messages
    waitingMessage?: string; // Message to show while waiting for confirmation
    waitingConfirmation?: boolean; // Whether to show waiting message after initial response
    confirmationMessage?: string; // Message to show after confirmation is received
    confirmationDelay?: number; // Simulated delay before showing confirmation (for demo)
    confirmationTrigger?: 'websocket' | 'timeout'; // How confirmation is triggered
    websocketUrl?: string; // URL for websocket connection (if using websocket trigger)
    websocketEvent?: string; // Event to listen for on websocket
}

export enum GenerateMethod {
    BY_API = 'BY_API',
    BY_SSO = 'BY_SSO',
}

const fetchWorkflowApiKey = async (workspaceId: string, workFlowId: string) => {
    const response = await $fetch(`/workspaces/${workspaceId}/workflows/${workFlowId}/apikey`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });
    return response.data;
};

export const useWorkflowExecution = ({
    workFlowId,
    availableVersions,
    isDraft,
}: {
    workFlowId: string;
    availableVersions?: IWorkflowTypes[];
    isDraft: boolean | undefined;
}) => {
    const params = useParams();
    const [key, setKey] = useState<number>(0);
    const [selectedLanguage, setSelectedLanguage] = useState('cURL');
    const [apiConfigData, setApiConfigData] = useState<APIConfigData | null>(null);
    const [isHidden, setIsHidden] = useState<boolean>(true);
    const [isApiKeyLoading, setIsApiKeyLoading] = useState<boolean>(false);
    const [isSsoLoading, setIsSsoLoading] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
    const [apiKey, setApiKey] = useState<string>('');
    const [apiKeyCopied, setApiKeyCopied] = useState<boolean>(false);
    const [apiConfigCopied, setApiConfigCopied] = useState<boolean>(false);
    const [isVariableOpen, setVariableOpen] = useState<boolean>(false);
    const [variableOptions, setVariableOptions] = useState<IVariableOption[] | undefined>([]);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [currentGenerateMethod, setCurrentGenerateMethod] = useState<GenerateMethod>(GenerateMethod.BY_API);
    const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);

    const draftVersion = availableVersions?.find(v => v.name === 'draft')?.version ?? null;

    const handleConfigApiKeyFetch = async (workspaceId: string, workFlowId: string) => {
        const res = await fetchWorkflowApiKey(workspaceId, workFlowId);
        return res;
    };

    const WORKFLOW_VERSION_REGEX = /,?\s{0,20}"workflow_version":\s{0,20}<DRAFT_VERSION>/;
    const workflowVersionReplacement =
        isDraft && draftVersion
            ? {
                  curl: `,\n  "workflow_version": ${draftVersion}`,
                  python: `,\n    "workflow_version": ${draftVersion}`,
                  js: `,"workflow_version": ${draftVersion}`,
              }
            : { curl: '', python: '', js: '' };

    const buildApiKeySnippets = (res: any, templateVariables: Record<string, string>) => {
        const vars = JSON.stringify(templateVariables);
        const snippets = API_CONFIG_TEMPLATE.codeSnippets;
        return {
            cURL: snippets.curl
                .replace('<YOUR_GENERATED_API_KEY>', res.apiKey)
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', res.workflowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.curl),
            Python: snippets.python
                .replace('<YOUR_GENERATED_API_KEY>', res.apiKey)
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', res.workflowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.python),
            Javascript: snippets.javascript
                .replace('<YOUR_GENERATED_API_KEY>', res.apiKey)
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', res.workflowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.js),
            Java: snippets.java
                .replace('<YOUR_GENERATED_API_KEY>', res.apiKey)
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', res.workflowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.curl),
        };
    };

    const buildSsoSnippets = (templateVariables: Record<string, string>) => {
        const vars = JSON.stringify(templateVariables);
        const snippets = API_CONFIG_TEMPLATE.ssoCodeSnippets;
        return {
            cURL: snippets.curl
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', workFlowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.curl),
            Python: snippets.python
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', workFlowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.python),
            Javascript: snippets.javascript
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', workFlowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.js),
            Java: snippets.java
                .replace('<YOUR_VARIABLES>', vars)
                .replace('{current_workflow_id}', workFlowId)
                .replace(WORKFLOW_VERSION_REGEX, workflowVersionReplacement.curl),
        };
    };

    const handleApiKeyGenerate = async (templateVariables: Record<string, string>) => {
        setIsApiKeyLoading(true);
        try {
            const res: any = await handleConfigApiKeyFetch(params?.wid as string, workFlowId);
            if (!res.apiKey) {
                toast.error('Unable to generate API key. Please try again.');
                console.error('API key not found in response:', res);
                return;
            }
            setApiKey(res?.apiKey);
            setApiConfigData({
                ...API_CONFIG_TEMPLATE,
                apiConfig: [{ label: 'API KEY', value: res?.apiKey }],
                codeSnippets: buildApiKeySnippets(res, templateVariables),
            });
        } catch (error) {
            console.error('Error generating API key:', error);
            toast.error('Network error or server unavailable. Please check your connection and try again.');
        } finally {
            setIsApiKeyLoading(false);
        }
    };

    const handleSsoGenerate = async (templateVariables: Record<string, string>) => {
        setIsSsoLoading(true);
        try {
            const token = 'mock-sso-token';
            setApiKey(token);
            setApiConfigData({
                ...API_CONFIG_TEMPLATE,
                apiConfig: [{ label: 'SSO TOKEN', value: token }],
                codeSnippets: buildSsoSnippets(templateVariables),
            });
        } catch (error) {
            console.error('Error retrieving SSO token:', error);
            toast.error('Unable to authenticate with SSO. Please try again or check your login status.');
        } finally {
            setIsSsoLoading(false);
        }
    };

    const handleGenerate = async (generateMethod: GenerateMethod) => {
        setCurrentGenerateMethod(generateMethod);
        const templateVariables =
            variableOptions?.reduce(
                (acc, curr) => {
                    acc[curr.label] = curr.value;
                    return acc;
                },
                {} as Record<string, string>
            ) || {};

        if (generateMethod === GenerateMethod.BY_API) {
            await handleApiKeyGenerate(templateVariables);
        } else if (generateMethod === GenerateMethod.BY_SSO) {
            await handleSsoGenerate(templateVariables);
        }
    };

    const handleDownloadPostmanCollection = () => {
        const isSSO = apiConfigData?.codeSnippets?.cURL?.includes('auth_type":"SSO"');
        const postmanCollection = {
            info: {
                _postman_id: '26ff32ce-bd1b-4339-a83c-7f2bde71043c',
                name: 'Workflow Execution',
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                _exporter_id: '15605230',
            },
            item: [
                {
                    name: 'Execute Workflow',
                    request: {
                        method: 'POST',
                        header: [
                            { key: 'Content-Type', value: 'application/json' },
                            ...(isSSO
                                ? [{ key: 'Authorization', value: `Bearer ${apiKey}` }]
                                : [{ key: 'x-api-key', value: apiKey }]),
                            { key: 'x-workspace-id', value: params?.wid?.toString() },
                        ],
                        url: {
                            raw: `${config.CHAT_BOT_URL}/workflows/execute`,
                            host: [config.CHAT_BOT_URL.replace(/^https?:\/\//, '')],
                            path: ['workflows', 'execute'],
                        },
                        body: {
                            mode: 'raw',
                            raw: JSON.stringify(
                                {
                                    message: '<Your Message>',
                                    workflow_id: workFlowId,
                                    session_id: sessionId,
                                    auth_type: isSSO ? 'SSO' : 'API_KEY',
                                    variables:
                                        variableOptions?.reduce(
                                            (acc, curr) => {
                                                acc[curr.label] = curr.value;
                                                return acc;
                                            },
                                            {} as Record<string, string>
                                        ) || {},
                                },
                                null,
                                2
                            ),
                        },
                    },
                },
            ],
        };

        const jsonString = JSON.stringify(postmanCollection, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow_postman_collection.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleApiKeyCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setApiKeyCopied(true);
        setTimeout(() => setApiKeyCopied(false), 2000);
    };

    const handleApConfigCopy = (config: string) => {
        navigator.clipboard.writeText(config);
        setApiConfigCopied(true);
        setTimeout(() => setApiConfigCopied(false), 2000);
    };

    const resetChat = () => {
        setMessageHistory([]);
        setKey(prev => prev + 1);
    };

    return {
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
        handleConfigApiKeyFetch,
        handleGenerate,
        handleDownloadPostmanCollection,
        handleApiKeyCopy,
        handleApConfigCopy,
        resetChat,
        draftVersion,
    };
};
