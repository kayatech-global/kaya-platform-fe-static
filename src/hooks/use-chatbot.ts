/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import config from '@/config/environment-variables';
import { IFile, WorkFlowMessageExecute } from '@/models';
import { GenerateMethod, IApiCallConfig } from './use-workflow-execution';
import { ChatbotProps } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/chat-bot';
import { DataType } from '@/enums';

export interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
    id?: string;
    timestamp?: string;
    file?: IFile[];
}

export interface IApiCallAction {
    apiConfigs: IApiCallConfig[];
    buttonCallback: (apiCall?: IApiCallConfig) => Promise<void>;
}

interface MockChatMessage {
    response: string | ((vars: Record<string, any>) => string);
    message: string;
    apiCalls: IApiCallConfig[];
}

const fetchWorkflowExecuteMessage = async (data: WorkFlowMessageExecute, workspaceId: string) => {
    try {
        // Determine authentication header based on auth_type
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-workspace-id': workspaceId,
        };

        // Set the appropriate authentication header
        if (data.auth_type === 'SSO') {
            headers['Authorization'] = `Bearer ${data.apikey}`;
        } else {
            // Default to API_KEY
            headers['x-api-key'] = data.apikey;
        }

        const response = await fetch(`${config.CHAT_BOT_URL}/workflows/execute`, {
            method: 'POST',
            body: JSON.stringify({
                is_stream: true,
                auth_type: data.auth_type ?? 'API_KEY',
                ...data,
            }),
            headers,
        });

        if (!response.ok) {
            console.error('Failed to execute workflow', response.status);
            return { detail: `Error: ${response.status}` };
        }

        return response;
    } catch (error) {
        console.error('Error executing workflow:', error);
        return { detail: 'Failed to connect to server' };
    }
};

export const useChatbot = (props: ChatbotProps) => {
    const {
        openWorkFlowConfigModel,
        apiConfigData,
        workFlowId,
        currentGenerateMethod,
        sessionId,
        variableOptions,
        apiKey,
        wid,
        messageHistory,
        setMessageHistory,
        setSessionId,
        onReload,
        draftVersion,
        isDraft,
    } = props;
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const chatSectionRef = useRef<HTMLDivElement>(null);
    const activeWebSocketRef = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedApiCallAction, setSelectedApiCallAction] = useState<IApiCallAction>();
    const [selectedFiles, setSelectedFiles] = useState<IFile[]>();
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [mockChatResponse, setMockChatResponse] = useState<MockChatMessage[]>([]);
    const [isMessageResponseLoading, setIsMessageResponseLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!openWorkFlowConfigModel) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFiles(undefined);
        }
    }, [openWorkFlowConfigModel]);

    useEffect(() => {
        if (!openWorkFlowConfigModel) {
            setMessageHistory([...chatMessages]);
        }
    }, [openWorkFlowConfigModel, chatMessages]);

    useEffect(() => {
        if (openWorkFlowConfigModel) {
            setChatMessages([...messageHistory]);
        }
    }, [openWorkFlowConfigModel, messageHistory]);

    useEffect(() => {
        if (chatContainerRef?.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [userMessage]);

    useEffect(() => {
        const key: string = `demo_${workFlowId}`;
        const response = localStorage.getItem(key);
        if (response) {
            const data: MockChatMessage[] = JSON.parse(response);
            setMockChatResponse(data?.length ? data : []);
        }
    }, [workFlowId]);

    const calculateRows = useMemo(() => {
        const rowCount = userMessage?.split('\n').length;
        if (rowCount <= 1) {
            return 1;
        } else if (rowCount > 4) {
            return 4;
        }
        return rowCount;
    }, [userMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.shiftKey) {
            return;
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isMessageResponseLoading && apiConfigData && !isStreaming) {
                handleSendMessage();
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const selected: IFile[] = [];
            for (const file of Array.from(files)) {
                selected.push({
                    name: file.name,
                    size: file.size,
                    file: file,
                });
            }
            setSelectedFiles(prev => [...(prev ?? []), ...selected]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => (prev ?? []).filter((_, i) => i !== index));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error =>
                reject(error instanceof Error ? error : new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    };

    const resolveField = (field: string | ((vars: Record<string, any>) => string), vars: Record<string, any>) => {
        return typeof field === 'function' ? field(vars) : field;
    };

    const buildApiCallHeaders = (c: IApiCallConfig, vars: Record<string, any>): Record<string, string> => {
        const headers: Record<string, string> = {};
        if (c.headers) {
            for (const [key, val] of Object.entries(c.headers)) {
                headers[key] = resolveField(val as any, vars);
            }
        }
        if (c.auth) {
            const cred = resolveField(c.auth.credentials, vars);
            if (c.auth.type === 'bearer') headers['Authorization'] = `Bearer ${cred}`;
            if (c.auth.type === 'basic') headers['Authorization'] = `Basic ${cred}`;
            if (c.auth.type === 'apikey') headers['x-api-key'] = cred;
        }
        return headers;
    };

    const runSingleApiCall = async (c: IApiCallConfig, vars: Record<string, any>) => {
        const url = resolveField(c.url, vars);
        const headers = buildApiCallHeaders(c, vars);
        const init: RequestInit = { method: c.method, headers };

        if (['POST', 'PUT', 'PATCH'].includes(c.method) && c.bodyTemplate) {
            init.body = resolveField(c.bodyTemplate, vars);
            if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(url, init);
        let body: any = null;
        try {
            body = await res.json();
        } catch {}
        vars[c.name] = { status: res.status, body };
    };

    const runApiCalls = async (vars: Record<string, any>, calls: IApiCallConfig[] = []) => {
        for (const c of calls) {
            try {
                await runSingleApiCall(c, vars);
            } catch (error: any) {
                throw error?.message === 'Failed to fetch'
                    ? new Error(`Failed to fetch API call for "${c.name}". Please check the endpoint or network`)
                    : error;
            }
        }
    };

    const removeLoadingMessage = (loadingMessageId: string) => (prev: ChatMessage[]) =>
        prev.filter(msg => msg.id !== loadingMessageId);

    const appendMessage = (msg: ChatMessage) => (prev: ChatMessage[]) => [...prev, msg];

    const updateMessageById = (id: string, updates: Partial<ChatMessage>) => (prev: ChatMessage[]) =>
        prev.map(m => (m.id === id ? { ...m, ...updates } : m));

    const findConfirmationResponse = (messageId: string) =>
        mockChatResponse?.find(chat => chat?.message?.toLowerCase() === messageId?.toLowerCase());

    const applyTimeoutConfirmation = async (
        apiCall: IApiCallConfig,
        loadingMessageId: string,
        resolve: () => void
    ) => {
        setChatMessages(removeLoadingMessage(loadingMessageId));
        const confirmationMessageId = String(apiCall.confirmationMessage);
        const confirmationResponse = findConfirmationResponse(confirmationMessageId);
        if (confirmationResponse) {
            await handleConfirmationAsNewMessage(confirmationResponse, confirmationMessageId);
        } else {
            const msg: ChatMessage = {
                text: apiCall.confirmationMessage ?? 'Confirmation received!',
                sender: 'bot',
                timestamp: new Date().toTimeString().split(' ')[0],
            };
            setChatMessages(appendMessage(msg));
        }
        resolve();
    };

    // Reusable function to handle WebSocket confirmations for any trigger type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleWebSocketConfirmation = async (apiCall: IApiCallConfig, vars: Record<string, any>) => {
        if (!apiCall.waitingConfirmation) return;

        const waitingMessage = apiCall.waitingMessage ?? 'Waiting for confirmation...';
        const loadingMessageId = `loading_${Date.now()}`;
        const loadingMessage: ChatMessage = {
            text: `<div class="flex items-center space-x-2"><div class="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div><span>${waitingMessage}</span></div>`,
            sender: 'bot',
            timestamp: new Date().toTimeString().split(' ')[0],
            id: loadingMessageId,
        };
        setChatMessages(appendMessage(loadingMessage));

        return new Promise<void>(resolve => {
            if (apiCall.confirmationTrigger === 'websocket' && apiCall.websocketUrl) {
                let socket: WebSocket | null = null;
                let pingInterval: ReturnType<typeof setInterval> | null = null;
                let closedByClient = false;
                let reconnectAttempts = 0;
                const maxReconnectDelay = 10000;

                const cleanup = () => {
                    if (pingInterval) clearInterval(pingInterval);
                    if (socket) {
                        socket.onopen = null;
                        socket.onclose = null;
                        socket.onerror = null;
                        socket.onmessage = null;
                    }
                    if (activeWebSocketRef.current) activeWebSocketRef.current = null;
                };

                const sendPing = () => {
                    if (socket?.readyState === WebSocket.OPEN) socket.send('ping');
                };

                const handleOpen = () => {
                    reconnectAttempts = 0;
                    pingInterval = setInterval(sendPing, 30000);
                };

                const handleClose = () => {
                    cleanup();
                    if (!closedByClient) {
                        reconnectAttempts += 1;
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
                        setTimeout(connectWebSocket, delay);
                    }
                };

                const processConfirmationEvent = async (data: { event?: string }) => {
                    if (apiCall.websocketEvent && data.event !== apiCall.websocketEvent) return;
                    closedByClient = true;
                    cleanup();
                    setChatMessages(removeLoadingMessage(loadingMessageId));
                    const confirmationMessageId = String(apiCall.confirmationMessage);
                    const confirmationResponse = findConfirmationResponse(confirmationMessageId);
                    if (confirmationResponse) {
                        await handleConfirmationAsNewMessage(confirmationResponse, confirmationMessageId);
                    } else {
                        const msg: ChatMessage = {
                            text: apiCall.confirmationMessage ?? 'Confirmation received!',
                            sender: 'bot',
                            timestamp: new Date().toTimeString().split(' ')[0],
                        };
                        setChatMessages(appendMessage(msg));
                    }
                    if (socket?.readyState === WebSocket.OPEN) socket.close();
                    resolve();
                };

                const handleMessage = async (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data);
                        await processConfirmationEvent(data);
                    } catch (err) {
                        console.log(err);
                    }
                };

                function connectWebSocket() {
                    socket = new WebSocket(String(apiCall.websocketUrl));
                    activeWebSocketRef.current = socket;
                    socket.onopen = handleOpen;
                    socket.onclose = handleClose;
                    socket.onerror = cleanup;
                    socket.onmessage = handleMessage;
                }

                connectWebSocket();
            } else {
                const delay = apiCall.confirmationDelay ?? 3000;
                setTimeout(() => applyTimeoutConfirmation(apiCall, loadingMessageId, resolve), delay);
            }
        });
    };

    const buttonAction = async (apiCall?: IApiCallConfig) => {
        const now = new Date();
        const formattedTime = now.toTimeString().split(' ')[0];
        const vars: Record<string, any> = { message: userMessage };

        setIsMessageResponseLoading(true);
        setIsStreaming(true);

        try {
            if (apiCall) {
                await runApiCalls(vars, [apiCall]);
                const text = apiCall?.response ?? 'Request proceed successfully';
                const message: ChatMessage = {
                    text,
                    sender: 'bot',
                    timestamp: formattedTime,
                };
                setChatMessages(appendMessage(message));

                // Handle waiting confirmation if configured
                if (apiCall.waitingConfirmation) {
                    await handleWebSocketConfirmation(apiCall, vars);
                }
            }
            setIsMessageResponseLoading(false);
            setIsStreaming(false);
        } catch (e: any) {
            const errorMessage: ChatMessage = {
                text: e?.message,
                sender: 'bot',
                timestamp: formattedTime,
            };
            setChatMessages(appendMessage(errorMessage));
            setIsMessageResponseLoading(false);
            setIsStreaming(false);
            return;
        }
    };

    // New function to handle confirmation as a new message flow
    const handleConfirmationAsNewMessage = async (confirmationResponse: MockChatMessage, messageId: string) => {
        const now = new Date();
        const formattedTime = now.toTimeString().split(' ')[0];
        const vars: Record<string, any> = { message: messageId };

        // Set up API call actions for the confirmation message
        setSelectedApiCallAction({
            apiConfigs: confirmationResponse?.apiCalls?.filter(x => x.trigger === 'button') ?? [],
            buttonCallback: buttonAction,
        });

        try {
            // Get all 'before' API calls
            const beforeApiCalls = confirmationResponse?.apiCalls?.filter(c => c.trigger === 'before') ?? [];

            // Process each API call individually to handle WebSocket confirmations
            for (const apiCall of beforeApiCalls) {
                await runApiCalls(vars, [apiCall]);

                // Handle WebSocket confirmation if configured
                if (apiCall.waitingConfirmation) {
                    await handleWebSocketConfirmation(apiCall, vars);
                }
            }
        } catch (e: any) {
            const errorMessage: ChatMessage = {
                text: e?.message,
                sender: 'bot',
                timestamp: formattedTime,
            };
            setChatMessages(appendMessage(errorMessage));
            return;
        }

        // Process the confirmation response
        const text =
            typeof confirmationResponse?.response === 'function'
                ? confirmationResponse.response(vars)
                : confirmationResponse?.response;

        const botMessage: ChatMessage = {
            text,
            sender: 'bot',
            timestamp: formattedTime,
        };

        // Map and display the response message before processing 'after' API calls
        const output = mapMessage(vars, botMessage);
        setChatMessages(appendMessage(output));

        try {
            // Get all 'after' API calls
            const afterApiCalls = confirmationResponse?.apiCalls?.filter(c => c.trigger === 'after') ?? [];

            // Process each API call individually to handle WebSocket confirmations
            for (const apiCall of afterApiCalls) {
                await runApiCalls({ ...vars }, [apiCall]);

                // Handle WebSocket confirmation if configured
                if (apiCall.waitingConfirmation) {
                    await handleWebSocketConfirmation(apiCall, vars);
                }
            }
        } catch (e: any) {
            const errorMessage: ChatMessage = {
                text: e?.message,
                sender: 'bot',
                timestamp: formattedTime,
            };
            setChatMessages(appendMessage(errorMessage));
            return;
        }
    };

    const processStreamChunk = (chunk: string, currentText: string): { text: string; isEos: boolean } => {
        if (!chunk.includes('<<EOS_TOKEN>>')) return { text: currentText + chunk, isEos: false };
        if (currentText.trim() === '' && chunk.trim() === '<<EOS_TOKEN>>') {
            return { text: 'No response received.', isEos: true };
        }
        return { text: (currentText + chunk).replace('<<EOS_TOKEN>>', '').trim(), isEos: true };
    };

    const handleWorkFlowExecute = async (data: WorkFlowMessageExecute, workspaceId: string) => {
        const res = await fetchWorkflowExecuteMessage(data, workspaceId);
        return res;
    };

    const reportError = (message: string, formattedTime: string) => {
        setChatMessages(appendMessage({ text: message, sender: 'bot', timestamp: formattedTime }));
        setIsMessageResponseLoading(false);
        setIsStreaming(false);
    };

    const processApiCallsByTrigger = async (
        apiCalls: IApiCallConfig[],
        vars: Record<string, any>,
        formattedTime: string
    ): Promise<boolean> => {
        try {
            for (const apiCall of apiCalls) {
                await runApiCalls(vars, [apiCall]);
                if (apiCall.waitingConfirmation) await handleWebSocketConfirmation(apiCall, vars);
            }
            return true;
        } catch (e: any) {
            reportError(e?.message, formattedTime);
            return false;
        }
    };

    const runMockResponseFlow = async (
        mockResponse: MockChatMessage,
        newMessage: ChatMessage,
        formattedTime: string
    ): Promise<void> => {
        const vars: Record<string, any> = { message: userMessage };
        setSelectedApiCallAction({
            apiConfigs: mockResponse?.apiCalls?.filter(x => x.trigger === 'button') ?? [],
            buttonCallback: buttonAction,
        });

        const beforeApiCalls = mockResponse?.apiCalls?.filter(c => c.trigger === 'before') ?? [];
        if (!(await processApiCallsByTrigger(beforeApiCalls, vars, formattedTime))) return;

        const text =
            typeof mockResponse?.response === 'function' ? mockResponse.response(vars) : mockResponse?.response;
        const botMessage: ChatMessage = { text, sender: 'bot', timestamp: formattedTime };
        if (newMessage?.file?.length) {
            botMessage.file = await Promise.all(
                newMessage.file.map(async item => ({ ...item, base64Url: await fileToBase64(item.file) }))
            );
        }
        setChatMessages(appendMessage(mapMessage(vars, botMessage)));

        const afterApiCalls = mockResponse?.apiCalls?.filter(c => c.trigger === 'after') ?? [];
        if (!(await processApiCallsByTrigger(afterApiCalls, { ...vars }, formattedTime))) return;

        setIsMessageResponseLoading(false);
        setIsStreaming(false);
    };

    const streamResponseBody = async (
        body: ReadableStream<Uint8Array>,
        formattedTime: string
    ): Promise<void> => {
        const botMessageId = Date.now().toString();
        setChatMessages(appendMessage({ text: '', sender: 'bot', id: botMessageId, timestamp: formattedTime }));
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let botMessageText = '';
        let firstChunkReceived = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const { text, isEos } = processStreamChunk(chunk, botMessageText);
            botMessageText = text;
            if (isEos) {
                setIsMessageResponseLoading(false);
                break;
            }
            setChatMessages(updateMessageById(botMessageId, { text: botMessageText, timestamp: formattedTime }));
            if (!firstChunkReceived && chunk.length > 0) {
                firstChunkReceived = true;
                setIsMessageResponseLoading(false);
            }
        }
        setChatMessages(updateMessageById(botMessageId, { text: botMessageText, timestamp: formattedTime }));
    };

    const runWorkflowApiFlow = async (
        newMessage: ChatMessage,
        formattedTime: string
    ): Promise<void> => {
        const variables = variableOptions?.reduce(
            (acc, curr) => {
                acc[curr.label] = curr.type === DataType.bool ? curr.value === 'true' : curr.value;
                return acc;
            },
            {} as Record<string, string>
        );
        const bodyValues: any = {
            message: newMessage.text,
            workflow_id: workFlowId,
            session_id: sessionId,
            apikey: apiKey,
            auth_type: currentGenerateMethod === GenerateMethod.BY_SSO ? 'SSO' : 'API_KEY',
        };
        if (variableOptions?.length) bodyValues.variables = variables;
        if (draftVersion !== null && isDraft) bodyValues.workflow_version = draftVersion;

        const response: any = await handleWorkFlowExecute(bodyValues, wid as string);

        if (response.detail) {
            reportError(`Error: ${response.detail}`, formattedTime);
            return;
        }
        if (response.body) {
            await streamResponseBody(response.body, formattedTime);
        } else {
            const responseData = await response.json();
            setIsMessageResponseLoading(false);
            setChatMessages(
                appendMessage({
                    text: responseData.detail ? 'Something went wrong' : responseData,
                    sender: 'bot',
                    timestamp: formattedTime,
                })
            );
        }
    };

    const handleSendMessage = async () => {
        const formattedTime = new Date().toTimeString().split(' ')[0];
        if (!userMessage.trim() && !selectedFiles?.length) return;

        setIsMessageResponseLoading(true);
        const newMessage: ChatMessage = { text: userMessage, sender: 'user', timestamp: formattedTime };
        if (selectedFiles?.length) {
            newMessage.file = selectedFiles;
            setSelectedFiles(undefined);
        }
        setChatMessages(appendMessage(newMessage));
        setUserMessage('');
        setIsStreaming(true);
        setSelectedApiCallAction(undefined);

        const mockResponse = await getResponseFromMock(userMessage.trim());
        if (mockResponse) {
            await runMockResponseFlow(mockResponse, newMessage, formattedTime);
            return;
        }

        try {
            await runWorkflowApiFlow(newMessage, formattedTime);
        } catch (error) {
            console.error('Error handling message:', error);
            reportError('An error occurred while processing your message.', formattedTime);
        } finally {
            setIsStreaming(false);
        }
    };

    const getResponseFromMock = async (userMessage: string): Promise<MockChatMessage | null> => {
        const response = mockChatResponse?.find(chat => chat?.message?.toLowerCase() === userMessage.toLowerCase());

        await new Promise(resolve => setTimeout(resolve, 4000));

        return response ?? null;
    };


    const findTemplateVars = (text: string): string[] => {
        const results: string[] = [];
        let pos = 0;
        while (pos < text.length) {
            const openIdx = text.indexOf('{{', pos);
            if (openIdx === -1) break;
            const closeIdx = text.indexOf('}}', openIdx + 2);
            if (closeIdx === -1) break;
            const inner = text.slice(openIdx + 2, closeIdx);
            const innerChars = new Set(inner);
            if (!innerChars.has('{') && !innerChars.has('}')) {
                results.push(text.slice(openIdx, closeIdx + 2));
            }
            pos = closeIdx + 2;
        }
        return results;
    };

    const mapMessage = (vars: Record<string, any>, message: ChatMessage) => {
        const lastMessage = message;
        if (lastMessage) {
            const result = findTemplateVars(lastMessage.text);
            if (result.length > 0) {
                for (const expr of result) {
                    const inner = expr.slice(2, -2);
                    const clean = inner.trim();
                    const value = clean.split('.').reduce((obj, key) => obj?.[key], vars) ?? 'N/A';
                    lastMessage.text = lastMessage.text.replace(
                        expr,
                        typeof value === 'object' ? JSON.stringify(value) : String(value)
                    );
                }
            }
        }
        return lastMessage;
    };

    const handleReload = () => {
        if (activeWebSocketRef.current?.readyState === WebSocket.OPEN) {
            activeWebSocketRef.current.close();
        }
        setChatMessages([]);
        setSessionId(crypto.randomUUID());
        onReload();
    };

    return {
        chatSectionRef,
        chatContainerRef,
        fileInputRef,
        chatMessages,
        selectedApiCallAction,
        isMessageResponseLoading,
        selectedFiles,
        userMessage,
        calculateRows,
        isStreaming,
        setChatMessages,
        setUserMessage,
        handleKeyDown,
        handleReload,
        removeFile,
        handleFileChange,
        handleSendMessage,
    };
};
