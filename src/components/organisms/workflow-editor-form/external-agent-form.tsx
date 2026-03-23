/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Button, Input, Label, Select, Switch } from '@/components/atoms';
import { ChevronDown, ChevronRight, Info, Lock, Search, Bot, Settings } from 'lucide-react';
import { CreationWizard } from '@/app/workspace/[wid]/standalone-agents/components/creation-wizard';
import type { StandaloneAgent } from '@/app/workspace/[wid]/standalone-agents/mock-data';
import { toast } from 'sonner';

type ProtocolType = 'a2a' | 'acp';
type AuthMode = 'none' | 'bearer' | 'apikey' | 'oauth' | 'jwt' | 'platform_managed';
type ExecutionMode = 'sync' | 'async_wait' | 'async_fire_forget';
type SessionOverride = 'single' | 'per_workflow' | 'per_execution';
type TracePropagation = 'w3c_traceparent' | 'otel_meta' | 'both';
type TraceLogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type ExternalAgentNodeData = {
    standaloneAgentId?: string;
    standaloneAgentName?: string;
    name?: string;
    protocol?: ProtocolType;
    endpointUrl?: string;
    authMode?: AuthMode;
    bearerToken?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    oauthTokenUrl?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
    oauthScopes?: string;
    jwtSecret?: string;
    jwtIssuer?: string;
    agentCardUrl?: string;
    a2aInputModes?: string;
    a2aOutputModes?: string;
    a2aPushNotificationUrl?: string;
    acpAgentName?: string;
    acpConfigId?: string;
    acpAwaitResumeEnabled?: boolean;
    executionMode?: ExecutionMode;
    timeoutMs?: number;
    pollingIntervalMs?: number;
    sendWorkflowVarsAsMetadata?: boolean;
    includeExecutionContext?: boolean;
    metadataKeyPrefix?: string;
    sessionOverride?: SessionOverride;
    tracingEnabled?: boolean;
    tracePropagation?: TracePropagation;
    captureTaskStateTransitions?: boolean;
    captureTokenUsage?: boolean;
    captureLatencyMetrics?: boolean;
    captureCostMetrics?: boolean;
    dataLineageEnabled?: boolean;
    traceLogLevel?: TraceLogLevel;
    otelExporterEndpoint?: string;
    otelServiceName?: string;
    customSpanAttributes?: string;
    customMetricMappings?: Array<{ metricName: string; protocolKey: string }>;
};

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

const MOCK_STANDALONE_AGENTS: StandaloneAgent[] = [
    { id: 'agent-001', name: 'Customer Support Agent', description: 'Handles customer inquiries and ticket resolution', instructions: 'You are a customer support agent. Resolve customer tickets efficiently by checking order status, processing refunds, and escalating complex issues.', framework: 'kaya-agent', status: 'running', a2aEndpoint: 'https://agents.kaya.ai/a2a/customer-support', version: '2.1.0', sessionMode: 'per-workflow', llmProvider: 'OpenAI', llmModel: 'gpt-4o', lastDeployed: '2026-03-15T14:30:00Z', cluster: 'prod-us-east-1', tools: ['email', 'web', 'memory', 'workflow-variables'] },
    { id: 'agent-002', name: 'Code Review Agent', description: 'Automated code review and suggestions', instructions: 'You are a code reviewer. Analyze pull requests for bugs, style issues, security vulnerabilities, and suggest improvements following team coding standards.', framework: 'openclaw', status: 'running', a2aEndpoint: 'https://agents.kaya.ai/a2a/code-review', version: '1.3.0', sessionMode: 'per-execution', llmProvider: 'Anthropic', llmModel: 'claude-sonnet-4-20250514', lastDeployed: '2026-03-14T09:15:00Z', cluster: 'prod-us-east-1', tools: ['shell', 'code-execution', 'file-ops', 'memory'] },
    { id: 'agent-003', name: 'Data Pipeline Orchestrator', description: 'Manages ETL pipelines and data transformations', instructions: 'You orchestrate ETL data pipelines. Monitor pipeline health, handle failures with retry logic, and optimize data transformations.', framework: 'kaya-agent', status: 'stopped', a2aEndpoint: 'https://agents.kaya.ai/a2a/data-pipeline', version: '1.0.2', sessionMode: 'single', llmProvider: 'OpenAI', llmModel: 'gpt-4o-mini', lastDeployed: '2026-03-10T11:00:00Z', cluster: 'prod-eu-west-1', tools: ['shell', 'code-execution', 'file-ops', 'task-scheduling', 'retry'] },
    { id: 'agent-004', name: 'QA Test Generator', description: 'Generates test cases and automation scripts', instructions: 'You generate test cases from requirements. Create comprehensive BDD scenarios, automation scripts, and edge case coverage.', framework: 'openclaw', status: 'running', a2aEndpoint: 'https://agents.kaya.ai/a2a/qa-test-gen', version: '0.9.1', sessionMode: 'per-execution', llmProvider: 'Google', llmModel: 'gemini-2.0-flash', lastDeployed: '2026-03-12T16:45:00Z', cluster: 'staging-us-east-1', tools: ['code-execution', 'file-ops', 'browser', 'planning'] },
    { id: 'agent-005', name: 'Research Assistant', description: 'Long-running research with web and RAG', instructions: 'You are a research assistant. Conduct thorough web research, synthesize findings, and provide well-structured reports with citations.', framework: 'kaya-agent', status: 'running', a2aEndpoint: 'https://agents.kaya.ai/a2a/research-assistant', version: '3.0.0', sessionMode: 'single', llmProvider: 'Anthropic', llmModel: 'claude-sonnet-4-20250514', lastDeployed: '2026-03-19T08:00:00Z', cluster: 'prod-us-east-1', tools: ['web', 'memory', 'file-ops', 'planning'] },
];

const SectionHeader = ({
    title,
    description,
    expanded,
    onToggle,
}: {
    title: string;
    description?: string;
    expanded: boolean;
    onToggle: () => void;
}) => (
    <button
        type="button"
        onClick={onToggle}
        className="flex items-start gap-x-2 w-full text-left"
    >
        {expanded ? (
            <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
        ) : (
            <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
        )}
        <div className="flex flex-col gap-y-0.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{title}</span>
            {description && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
            )}
        </div>
    </button>
);

const InfoBanner = ({ text }: { text: string }) => (
    <div className="flex items-start gap-x-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-gray-700/50 border border-violet-200 dark:border-gray-600">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#6c3def]" />
        <p className="text-xs text-gray-600 dark:text-gray-300">{text}</p>
    </div>
);

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // --- Agent Source ---
    const [standaloneAgentId, setStandaloneAgentId] = useState('');
    const [agentSearch, setAgentSearch] = useState('');
    const [showAgentPicker, setShowAgentPicker] = useState(false);

    // --- Core ---
    const [name, setName] = useState('');
    const [protocol, setProtocol] = useState<ProtocolType>('a2a');

    // --- Connection ---
    const [endpointUrl, setEndpointUrl] = useState('');
    const [authMode, setAuthMode] = useState<AuthMode>('none');
    const [bearerToken, setBearerToken] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
    const [oauthTokenUrl, setOauthTokenUrl] = useState('');
    const [oauthClientId, setOauthClientId] = useState('');
    const [oauthClientSecret, setOauthClientSecret] = useState('');
    const [oauthScopes, setOauthScopes] = useState('');
    const [jwtSecret, setJwtSecret] = useState('');
    const [jwtIssuer, setJwtIssuer] = useState('');

    // --- A2A-specific ---
    const [agentCardUrl, setAgentCardUrl] = useState('');
    const [a2aInputModes, setA2aInputModes] = useState('text/plain, application/json');
    const [a2aOutputModes, setA2aOutputModes] = useState('text/plain, application/json');
    const [a2aPushNotificationUrl, setA2aPushNotificationUrl] = useState('');

    // --- ACP-specific ---
    const [acpAgentName, setAcpAgentName] = useState('');
    const [acpConfigId, setAcpConfigId] = useState('');
    const [acpAwaitResumeEnabled, setAcpAwaitResumeEnabled] = useState(false);

    // --- Execution ---
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('sync');
    const [timeoutMs, setTimeoutMs] = useState<number>(30000);
    const [pollingIntervalMs, setPollingIntervalMs] = useState<number>(5000);

    // --- Metadata ---
    const [sendWorkflowVarsAsMetadata, setSendWorkflowVarsAsMetadata] = useState(true);
    const [includeExecutionContext, setIncludeExecutionContext] = useState(true);
    const [metadataKeyPrefix, setMetadataKeyPrefix] = useState('');

    // --- Session ---
    const [sessionOverride, setSessionOverride] = useState<SessionOverride>('per_workflow');

    // --- Tracing ---
    const [tracingEnabled, setTracingEnabled] = useState(true);
    const [tracePropagation, setTracePropagation] = useState<TracePropagation>('w3c_traceparent');
    const [captureTaskStateTransitions, setCaptureTaskStateTransitions] = useState(true);
    const [captureTokenUsage, setCaptureTokenUsage] = useState(true);
    const [captureLatencyMetrics, setCaptureLatencyMetrics] = useState(true);
    const [captureCostMetrics, setCaptureCostMetrics] = useState(false);
    const [dataLineageEnabled, setDataLineageEnabled] = useState(true);
    const [traceLogLevel, setTraceLogLevel] = useState<TraceLogLevel>('info');
    const [otelExporterEndpoint, setOtelExporterEndpoint] = useState('');
    const [otelServiceName, setOtelServiceName] = useState('');
    const [customSpanAttributes, setCustomSpanAttributes] = useState('');
    const [customMetricMappings, setCustomMetricMappings] = useState<Array<{ metricName: string; protocolKey: string }>>([
        { metricName: 'agent.token.input', protocolKey: 'token_input' },
        { metricName: 'agent.token.output', protocolKey: 'token_output' },
        { metricName: 'agent.execution.duration', protocolKey: 'execution_time_ms' },
        { metricName: 'agent.llm.calls', protocolKey: 'llm_call_count' },
        { metricName: 'agent.tool.calls', protocolKey: 'tool_call_count' },
        { metricName: 'agent.model', protocolKey: 'model' },
        { metricName: 'agent.cost.estimated', protocolKey: 'estimated_cost' },
        { metricName: 'agent.error.count', protocolKey: 'error_count' },
    ]);

    // --- Section toggles ---
    const [showA2aAdvanced, setShowA2aAdvanced] = useState(false);
    const [showAcpAdvanced, setShowAcpAdvanced] = useState(false);
    const [showTracingDetails, setShowTracingDetails] = useState(false);
    const [showOtelConfig, setShowOtelConfig] = useState(false);
    const [showMetricMappings, setShowMetricMappings] = useState(false);
    const [showAgentConfigModal, setShowAgentConfigModal] = useState(false);

    const selectedAgent = MOCK_STANDALONE_AGENTS.find(a => a.id === standaloneAgentId);
    const isStandaloneMode = !!selectedAgent;

    const filteredAgents = MOCK_STANDALONE_AGENTS.filter(a =>
        a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
        a.description.toLowerCase().includes(agentSearch.toLowerCase())
    );

    const handleSelectAgent = (agent: StandaloneAgent) => {
        setStandaloneAgentId(agent.id);
        setShowAgentPicker(false);
        setAgentSearch('');

        setName(agent.name);
        setProtocol('a2a');
        setEndpointUrl(agent.a2aEndpoint);
        setAuthMode('platform_managed');
        setAgentCardUrl(`${agent.a2aEndpoint.replace('/a2a/', '/')}/.well-known/agent.json`);
        setA2aInputModes('text/plain, application/json');
        setA2aOutputModes('text/plain, application/json');
        setTracingEnabled(true);
        setTracePropagation('w3c_traceparent');
        setCaptureTaskStateTransitions(true);
        setCaptureTokenUsage(true);
        setCaptureLatencyMetrics(true);
        setDataLineageEnabled(true);
        setTraceLogLevel('info');
        setOtelServiceName(`kaya-agent-${agent.id}`);

        const sessionMap: Record<string, SessionOverride> = {
            'single': 'single',
            'per-workflow': 'per_workflow',
            'per-execution': 'per_execution',
        };
        setSessionOverride(sessionMap[agent.sessionMode] ?? 'per_workflow');

        toast.success(`Connected to "${agent.name}" — configuration auto-mapped`);
    };

    const handleDisconnectAgent = () => {
        setStandaloneAgentId('');
        setName('');
        setEndpointUrl('');
        setAuthMode('none');
        setAgentCardUrl('');
        setSessionOverride('per_workflow');
        setOtelServiceName('');
    };

    const initFormData = useCallback(() => {
        const d = selectedNode?.data as ExternalAgentNodeData;
        setStandaloneAgentId(d?.standaloneAgentId ?? '');
        setName(d?.name ?? '');
        setProtocol(d?.protocol ?? 'a2a');
        setEndpointUrl(d?.endpointUrl ?? '');
        setAuthMode(d?.authMode ?? 'none');
        setBearerToken(d?.bearerToken ?? '');
        setApiKey(d?.apiKey ?? '');
        setApiKeyHeader(d?.apiKeyHeader ?? 'X-API-Key');
        setOauthTokenUrl(d?.oauthTokenUrl ?? '');
        setOauthClientId(d?.oauthClientId ?? '');
        setOauthClientSecret(d?.oauthClientSecret ?? '');
        setOauthScopes(d?.oauthScopes ?? '');
        setJwtSecret(d?.jwtSecret ?? '');
        setJwtIssuer(d?.jwtIssuer ?? '');
        setAgentCardUrl(d?.agentCardUrl ?? '');
        setA2aInputModes(d?.a2aInputModes ?? 'text/plain, application/json');
        setA2aOutputModes(d?.a2aOutputModes ?? 'text/plain, application/json');
        setA2aPushNotificationUrl(d?.a2aPushNotificationUrl ?? '');
        setAcpAgentName(d?.acpAgentName ?? '');
        setAcpConfigId(d?.acpConfigId ?? '');
        setAcpAwaitResumeEnabled(d?.acpAwaitResumeEnabled ?? false);
        setExecutionMode(d?.executionMode ?? 'sync');
        setTimeoutMs(d?.timeoutMs ?? 30000);
        setPollingIntervalMs(d?.pollingIntervalMs ?? 5000);
        setSendWorkflowVarsAsMetadata(d?.sendWorkflowVarsAsMetadata ?? true);
        setIncludeExecutionContext(d?.includeExecutionContext ?? true);
        setMetadataKeyPrefix(d?.metadataKeyPrefix ?? '');
        setSessionOverride(d?.sessionOverride ?? 'per_workflow');
        setTracingEnabled(d?.tracingEnabled ?? true);
        setTracePropagation(d?.tracePropagation ?? 'w3c_traceparent');
        setCaptureTaskStateTransitions(d?.captureTaskStateTransitions ?? true);
        setCaptureTokenUsage(d?.captureTokenUsage ?? true);
        setCaptureLatencyMetrics(d?.captureLatencyMetrics ?? true);
        setCaptureCostMetrics(d?.captureCostMetrics ?? false);
        setDataLineageEnabled(d?.dataLineageEnabled ?? true);
        setTraceLogLevel(d?.traceLogLevel ?? 'info');
        setOtelExporterEndpoint(d?.otelExporterEndpoint ?? '');
        setOtelServiceName(d?.otelServiceName ?? '');
        setCustomSpanAttributes(d?.customSpanAttributes ?? '');
        if (d?.customMetricMappings) setCustomMetricMappings(d.customMetricMappings);
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    const constructNodeData = useCallback((): ExternalAgentNodeData => {
        const base: ExternalAgentNodeData = {
            ...(selectedAgent ? { standaloneAgentId, standaloneAgentName: selectedAgent?.name } : {}),
            name,
            protocol,
            endpointUrl,
            authMode,
            ...(authMode === 'bearer' ? { bearerToken } : {}),
            ...(authMode === 'apikey' ? { apiKey, apiKeyHeader } : {}),
            ...(authMode === 'oauth' ? { oauthTokenUrl, oauthClientId, oauthClientSecret, oauthScopes } : {}),
            ...(authMode === 'jwt' ? { jwtSecret, jwtIssuer } : {}),
            executionMode,
            ...(executionMode !== 'async_fire_forget' ? { timeoutMs } : {}),
            ...(executionMode === 'async_wait' ? { pollingIntervalMs } : {}),
            sendWorkflowVarsAsMetadata,
            includeExecutionContext,
            ...(metadataKeyPrefix ? { metadataKeyPrefix } : {}),
            sessionOverride,
            tracingEnabled,
        };

        if (protocol === 'a2a') {
            Object.assign(base, {
                agentCardUrl: agentCardUrl || undefined,
                a2aInputModes,
                a2aOutputModes,
                a2aPushNotificationUrl: a2aPushNotificationUrl || undefined,
            });
        } else {
            Object.assign(base, {
                acpAgentName: acpAgentName || undefined,
                acpConfigId: acpConfigId || undefined,
                acpAwaitResumeEnabled,
            });
        }

        if (tracingEnabled) {
            Object.assign(base, {
                tracePropagation,
                captureTaskStateTransitions,
                captureTokenUsage,
                captureLatencyMetrics,
                captureCostMetrics,
                dataLineageEnabled,
                traceLogLevel,
                otelExporterEndpoint: otelExporterEndpoint || undefined,
                otelServiceName: otelServiceName || undefined,
                customSpanAttributes: customSpanAttributes || undefined,
                customMetricMappings: customMetricMappings.filter(m => m.protocolKey && m.metricName),
            });
        }

        return base;
    }, [
        standaloneAgentId, selectedAgent,
        name, protocol, endpointUrl, authMode, bearerToken, apiKey, apiKeyHeader,
        oauthTokenUrl, oauthClientId, oauthClientSecret, oauthScopes, jwtSecret, jwtIssuer,
        executionMode, timeoutMs, pollingIntervalMs,
        sendWorkflowVarsAsMetadata, includeExecutionContext, metadataKeyPrefix,
        sessionOverride,
        agentCardUrl, a2aInputModes, a2aOutputModes, a2aPushNotificationUrl,
        acpAgentName, acpConfigId, acpAwaitResumeEnabled,
        tracingEnabled, tracePropagation, captureTaskStateTransitions,
        captureTokenUsage, captureLatencyMetrics, captureCostMetrics,
        dataLineageEnabled, traceLogLevel, otelExporterEndpoint, otelServiceName, customSpanAttributes,
    ]);

    const handleSaveNodeData = () => {
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('External Agent updated');
        setTrigger((trigger ?? 0) + 1);
    };

    const showTimeout = executionMode === 'sync' || executionMode === 'async_wait';
    const showPolling = executionMode === 'async_wait';

    return (
        <div className="group">
            <div
                className={cn(
                    'external-agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700'
                )}
            >
                {/* ─── Connect Standalone Agent ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Connect Standalone Agent</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optionally connect a deployed standalone agent to auto-configure connection settings, or configure manually below.
                    </p>

                        {selectedAgent ? (
                            <div className="rounded-lg border border-[#6c3def] bg-violet-50 dark:bg-gray-700/50 p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-x-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c3def]/20">
                                            <Bot className="h-4 w-4 text-[#6c3def]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedAgent.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAgent.framework === 'kaya-agent' ? 'Kaya Agent' : 'OpenClaw'} · v{selectedAgent.version}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDisconnectAgent}
                                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                                        disabled={isReadOnly}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{selectedAgent.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-x-3 text-xs text-gray-400">
                                        <span className={cn('flex items-center gap-x-1', selectedAgent.status === 'running' ? 'text-green-500' : 'text-gray-400')}>
                                            <span className={cn('h-1.5 w-1.5 rounded-full', selectedAgent.status === 'running' ? 'bg-green-500' : 'bg-gray-400')} />
                                            {selectedAgent.status}
                                        </span>
                                        <span>{selectedAgent.llmProvider} / {selectedAgent.llmModel}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAgentConfigModal(true)}
                                        className="flex items-center gap-x-1 text-xs font-medium text-[#6c3def] hover:text-[#5925DC] transition-colors"
                                    >
                                        Edit Config
                                        <Settings className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div
                                    className={cn(
                                        'flex items-center gap-x-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                                        showAgentPicker
                                            ? 'border-[#6c3def] ring-2 ring-[#6c3def]/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    )}
                                    onClick={() => setShowAgentPicker(!showAgentPicker)}
                                >
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search standalone agents..."
                                        value={agentSearch}
                                        onChange={e => { setAgentSearch(e.target.value); setShowAgentPicker(true); }}
                                        onClick={e => { e.stopPropagation(); setShowAgentPicker(true); }}
                                        className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                                        disabled={isReadOnly}
                                    />
                                </div>

                                {showAgentPicker && (
                                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-[200px] overflow-y-auto">
                                        {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                                            <button
                                                key={agent.id}
                                                type="button"
                                                onClick={() => handleSelectAgent(agent)}
                                                className="w-full flex items-center gap-x-2.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#6c3def]/10">
                                                    <Bot className="h-3.5 w-3.5 text-[#6c3def]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{agent.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{agent.description}</p>
                                                </div>
                                                <span className={cn(
                                                    'h-1.5 w-1.5 rounded-full shrink-0',
                                                    agent.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
                                                )} />
                                            </button>
                                        )) : (
                                            <div className="px-3 py-4 text-center text-xs text-gray-400">No agents found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    {selectedAgent && (
                        <InfoBanner text="Connection settings are auto-configured from the agent registry. Locked fields are managed by the platform." />
                    )}
                </div>

                {/* ─── Name ─── */}
                <div className="flex flex-col gap-y-5 pb-4 bottom-gradient-border">
                    <Input
                        label="Name"
                        helperInfo="Display name for this external agent node in the workflow canvas and execution logs"
                        placeholder="Name of the external agent"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isReadOnly || isStandaloneMode}
                    />
                </div>

                {/* ─── Protocol Selection ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <div className="flex items-center gap-x-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Protocol</Label>
                        {isStandaloneMode && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <div className="flex gap-2">
                        {(['a2a', 'acp'] as const).map(p => (
                            <button
                                key={p}
                                type="button"
                                disabled={isReadOnly || isStandaloneMode}
                                onClick={() => setProtocol(p)}
                                className={cn(
                                    'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                                    protocol === p
                                        ? 'bg-[#6c3def] text-white border-[#6c3def]'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
                                    (isReadOnly || isStandaloneMode) && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {protocol === 'a2a'
                            ? 'Google Agent-to-Agent — JSON-RPC 2.0 over HTTP, Agent Card discovery, SSE streaming'
                            : 'Agent Communication Protocol — RESTful API, OpenAPI schema, config-then-invoke pattern'}
                    </p>
                </div>

                {/* ─── A2A-specific Configuration ─── */}
                {protocol === 'a2a' && (
                    <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                        <div className="flex items-center gap-x-1.5">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">A2A Agent Discovery</Label>
                            {isStandaloneMode && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <Input label="Agent Card URL" helperInfo="URL to the agent's JSON metadata card describing its identity, skills, and supported auth schemes" placeholder="https://agent.example.com/.well-known/agent.json" value={agentCardUrl} onChange={e => setAgentCardUrl(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        <InfoBanner text="The Agent Card (JSON) describes the agent's identity, capabilities, skills, and supported auth schemes. Typically at /.well-known/agent.json" />
                        <SectionHeader title="A2A Advanced Settings" description="Input/output modes, push notifications" expanded={showA2aAdvanced} onToggle={() => setShowA2aAdvanced(!showA2aAdvanced)} />
                        {showA2aAdvanced && (
                            <div className="flex flex-col gap-y-3 pl-6">
                                <Input label="Supported Input Modes" helperInfo="MIME types the agent accepts as input (comma-separated)" placeholder="text/plain, application/json" value={a2aInputModes} onChange={e => setA2aInputModes(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                                <Input label="Supported Output Modes" helperInfo="MIME types the agent produces as output (comma-separated)" placeholder="text/plain, application/json" value={a2aOutputModes} onChange={e => setA2aOutputModes(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                                <Input label="Push Notification URL (optional)" helperInfo="Callback URL for A2A push notifications when tasks complete asynchronously" placeholder="https://your-platform.com/a2a/callback" value={a2aPushNotificationUrl} onChange={e => setA2aPushNotificationUrl(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ACP-specific Configuration ─── */}
                {protocol === 'acp' && (
                    <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                        <div className="flex items-center gap-x-1.5">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">ACP Agent Configuration</Label>
                            {isStandaloneMode && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <Input label="Agent Name" helperInfo="The agent_name parameter used in ACP POST /runs requests to identify which agent to invoke" placeholder="Required — the agent_name for POST /runs" value={acpAgentName} onChange={e => setAcpAgentName(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        <Input label="Configuration ID (optional)" helperInfo="Pre-configured instance ID from the /configure endpoint. Reuses a saved agent configuration" placeholder="Pre-configured instance ID from /configure endpoint" value={acpConfigId} onChange={e => setAcpConfigId(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        <InfoBanner text="ACP uses a config-then-invoke pattern. If a Configuration ID is provided, it will be sent with each run request to use a pre-configured agent instance." />
                        <SectionHeader title="ACP Advanced Settings" description="Await/resume pattern" expanded={showAcpAdvanced} onToggle={() => setShowAcpAdvanced(!showAcpAdvanced)} />
                        {showAcpAdvanced && (
                            <div className="flex flex-col gap-y-3 pl-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-y-0.5">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Await / Resume</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow agent to pause and request additional input</p>
                                    </div>
                                    <Switch checked={acpAwaitResumeEnabled} onCheckedChange={setAcpAwaitResumeEnabled} disabled={isReadOnly || isStandaloneMode} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Endpoint URL ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Input
                        label={protocol === 'a2a' ? 'JSON-RPC Endpoint URL' : 'REST API Base URL'}
                        helperInfo={protocol === 'a2a' ? 'The JSON-RPC 2.0 endpoint where A2A tasks/send and tasks/get requests are sent' : 'Base URL for ACP REST API calls including /runs and /configure endpoints'}
                        placeholder={protocol === 'a2a' ? 'https://agent.example.com/a2a' : 'https://agent.example.com/api/v1'}
                        value={endpointUrl}
                        onChange={e => setEndpointUrl(e.target.value)}
                        disabled={isReadOnly || isStandaloneMode}
                    />
                </div>

                {/* ─── Authentication ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <div className="flex items-center gap-x-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Authentication</Label>
                        {isStandaloneMode && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <Select
                        label=""
                        helperInfo="Authentication method for service-to-service communication with the external agent"
                        placeholder="Select authentication mode"
                        options={[
                            ...(isStandaloneMode ? [{ name: 'Platform Managed', value: 'platform_managed' }] : []),
                            { name: 'None', value: 'none' },
                            { name: 'Bearer Token', value: 'bearer' },
                            { name: 'API Key', value: 'apikey' },
                            { name: 'OAuth 2.0 (Client Credentials)', value: 'oauth' },
                            { name: 'JWT', value: 'jwt' },
                        ]}
                        value={authMode}
                        onChange={e => setAuthMode(e.target.value as AuthMode)}
                        disabled={isReadOnly || isStandaloneMode}
                    />
                    {authMode === 'bearer' && <Input label="Bearer Token" placeholder="Enter bearer token" type="password" value={bearerToken} onChange={e => setBearerToken(e.target.value)} disabled={isReadOnly || isStandaloneMode} />}
                    {authMode === 'apikey' && (
                        <>
                            <Input label="API Key Header" placeholder="X-API-Key" value={apiKeyHeader} onChange={e => setApiKeyHeader(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            <Input label="API Key" placeholder="Enter API key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        </>
                    )}
                    {authMode === 'oauth' && (
                        <>
                            <Input label="Token URL" placeholder="https://auth.example.com/oauth/token" value={oauthTokenUrl} onChange={e => setOauthTokenUrl(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            <Input label="Client ID" placeholder="Enter OAuth client ID" value={oauthClientId} onChange={e => setOauthClientId(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            <Input label="Client Secret" placeholder="Enter OAuth client secret" type="password" value={oauthClientSecret} onChange={e => setOauthClientSecret(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            <Input label="Scopes" placeholder="agent:invoke agent:read (space-separated)" value={oauthScopes} onChange={e => setOauthScopes(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        </>
                    )}
                    {authMode === 'jwt' && (
                        <>
                            <Input label="JWT Signing Secret" placeholder="Enter signing secret" type="password" value={jwtSecret} onChange={e => setJwtSecret(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                            <Input label="Issuer (iss)" placeholder="e.g. kaya-platform" value={jwtIssuer} onChange={e => setJwtIssuer(e.target.value)} disabled={isReadOnly || isStandaloneMode} />
                        </>
                    )}
                </div>

                {/* ─── Execution Mode ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Execution Mode</Label>
                    <div className="flex flex-col gap-y-2">
                        {([
                            { value: 'sync', label: 'Synchronous (SSE)', desc: 'Block until response — streams tokens via SSE in real-time' },
                            { value: 'async_wait', label: 'Async (Wait)', desc: 'Poll / push notification until task completes' },
                            { value: 'async_fire_forget', label: 'Fire & Forget', desc: 'Send and continue workflow without waiting' },
                        ] as const).map(option => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex items-start gap-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                                    executionMode === option.value
                                        ? 'border-[#6c3def] bg-violet-50 dark:bg-gray-700'
                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                                    isReadOnly && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <input type="radio" name="executionMode" value={option.value} checked={executionMode === option.value} onChange={() => setExecutionMode(option.value)} disabled={isReadOnly} className="accent-[#6c3def] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    {showTimeout && <Input label="Timeout (ms)" helperInfo="Maximum time to wait for a response before the request is considered failed" type="number" placeholder="30000" value={String(timeoutMs)} onChange={e => setTimeoutMs(Number(e.target.value))} disabled={isReadOnly} />}
                    {showPolling && <Input label="Polling Interval (ms)" helperInfo="How often to poll the agent for task completion status in async mode" type="number" placeholder="5000" value={String(pollingIntervalMs)} onChange={e => setPollingIntervalMs(Number(e.target.value))} disabled={isReadOnly} />}
                </div>

                {/* ─── Metadata ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <div className="flex flex-col gap-y-0.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Workflow Variable Metadata</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Variables are automatically passed as metadata — no explicit mapping needed</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-0.5">
                            <Label className="text-sm text-gray-700 dark:text-gray-100">Send Workflow Variables</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Attach all workflow variables as metadata</p>
                        </div>
                        <Switch checked={sendWorkflowVarsAsMetadata} onCheckedChange={setSendWorkflowVarsAsMetadata} disabled={isReadOnly} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-0.5">
                            <Label className="text-sm text-gray-700 dark:text-gray-100">Include Execution Context</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Add workflow ID, execution ID, node ID to metadata</p>
                        </div>
                        <Switch checked={includeExecutionContext} onCheckedChange={setIncludeExecutionContext} disabled={isReadOnly} />
                    </div>
                    <Input label="Metadata Key Prefix (optional)" helperInfo="Prefix added to all metadata keys to avoid naming collisions with the agent's own metadata" placeholder="e.g. kaya_ — prefixes all metadata keys" value={metadataKeyPrefix} onChange={e => setMetadataKeyPrefix(e.target.value)} disabled={isReadOnly} />
                </div>

                {/* ─── Session Mode ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Select
                        label="Session Mode"
                        helperInfo="Controls conversation state persistence. Single: one shared session. Per-Workflow: isolated per workflow instance. Per-Execution: fresh session each run"
                        placeholder="Select session mode"
                        options={[
                            { name: 'Single Session', value: 'single' },
                            { name: 'Per-Workflow', value: 'per_workflow' },
                            { name: 'Per-Execution', value: 'per_execution' },
                        ]}
                        value={sessionOverride}
                        onChange={e => setSessionOverride(e.target.value as SessionOverride)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ─── Tracing & Observability ─── */}
                <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-0.5">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Tracing & Observability</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Distributed tracing, metrics collection, and data lineage</p>
                        </div>
                        <Switch checked={tracingEnabled} onCheckedChange={setTracingEnabled} disabled={isReadOnly} />
                    </div>

                    {tracingEnabled && (
                        <div className="flex flex-col gap-y-3">
                            <Select label="Trace Context Propagation" helperInfo="How distributed trace context is forwarded to the external agent for end-to-end tracing" placeholder="Select propagation method" options={protocol === 'a2a' ? [{ name: 'W3C traceparent header', value: 'w3c_traceparent' }, { name: 'Both (W3C + OTel _meta)', value: 'both' }] : [{ name: 'OTel via params._meta', value: 'otel_meta' }, { name: 'W3C traceparent header', value: 'w3c_traceparent' }, { name: 'Both (W3C + OTel _meta)', value: 'both' }]} value={tracePropagation} onChange={e => setTracePropagation(e.target.value as TracePropagation)} disabled={isReadOnly} />
                            <Select label="Trace Log Level" helperInfo="Minimum severity level for trace span logs captured from this agent" placeholder="Select log level" options={[{ name: 'None', value: 'none' }, { name: 'Error', value: 'error' }, { name: 'Warn', value: 'warn' }, { name: 'Info', value: 'info' }, { name: 'Debug', value: 'debug' }, { name: 'Trace', value: 'trace' }]} value={traceLogLevel} onChange={e => setTraceLogLevel(e.target.value as TraceLogLevel)} disabled={isReadOnly} />

                            <SectionHeader title="Metrics & Data Capture" description="Token usage, latency, cost, data lineage" expanded={showTracingDetails} onToggle={() => setShowTracingDetails(!showTracingDetails)} />
                            {showTracingDetails && (
                                <div className="flex flex-col gap-y-3 pl-6">
                                    <div className="flex items-center justify-between"><Label className="text-sm text-gray-700 dark:text-gray-100">Capture Task State Transitions</Label><Switch checked={captureTaskStateTransitions} onCheckedChange={setCaptureTaskStateTransitions} disabled={isReadOnly} /></div>
                                    <div className="flex items-center justify-between"><Label className="text-sm text-gray-700 dark:text-gray-100">Capture Token Usage</Label><Switch checked={captureTokenUsage} onCheckedChange={setCaptureTokenUsage} disabled={isReadOnly} /></div>
                                    <div className="flex items-center justify-between"><Label className="text-sm text-gray-700 dark:text-gray-100">Capture Latency Metrics</Label><Switch checked={captureLatencyMetrics} onCheckedChange={setCaptureLatencyMetrics} disabled={isReadOnly} /></div>
                                    <div className="flex items-center justify-between"><Label className="text-sm text-gray-700 dark:text-gray-100">Capture Cost Metrics</Label><Switch checked={captureCostMetrics} onCheckedChange={setCaptureCostMetrics} disabled={isReadOnly} /></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-y-0.5"><Label className="text-sm text-gray-700 dark:text-gray-100">Data Lineage</Label><p className="text-xs text-gray-500 dark:text-gray-400">Record input/output artifacts for lineage tracking</p></div>
                                        <Switch checked={dataLineageEnabled} onCheckedChange={setDataLineageEnabled} disabled={isReadOnly} />
                                    </div>
                                </div>
                            )}

                            <SectionHeader title="Protocol Metric Mappings" description={`Map ${protocol === 'a2a' ? 'A2A Task.metadata' : 'ACP output part'} keys to platform metrics`} expanded={showMetricMappings} onToggle={() => setShowMetricMappings(!showMetricMappings)} />
                            {showMetricMappings && (
                                <div className="flex flex-col gap-y-3 pl-6">
                                    <InfoBanner text={isStandaloneMode
                                        ? 'Standalone agents use Kaya default metric keys. Mappings are auto-configured.'
                                        : `Map the external agent's metadata keys to platform metric names. The platform reads these keys from ${protocol === 'a2a' ? 'A2A Task.metadata or push notification metadata' : 'ACP output parts with trajectory metadata'}.`
                                    } />
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[1fr_1fr_32px] gap-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                                            <span>Platform Metric</span>
                                            <span>{protocol === 'a2a' ? 'A2A Metadata Key' : 'ACP Metrics Key'}</span>
                                            <span />
                                        </div>
                                        {customMetricMappings.map((mapping, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
                                                <input
                                                    className="rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 font-mono"
                                                    placeholder="agent.token.input"
                                                    value={mapping.metricName}
                                                    onChange={e => {
                                                        const updated = [...customMetricMappings];
                                                        updated[idx] = { ...updated[idx], metricName: e.target.value };
                                                        setCustomMetricMappings(updated);
                                                    }}
                                                    disabled={isReadOnly || isStandaloneMode}
                                                />
                                                <input
                                                    className="rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 font-mono"
                                                    placeholder="token_input"
                                                    value={mapping.protocolKey}
                                                    onChange={e => {
                                                        const updated = [...customMetricMappings];
                                                        updated[idx] = { ...updated[idx], protocolKey: e.target.value };
                                                        setCustomMetricMappings(updated);
                                                    }}
                                                    disabled={isReadOnly || isStandaloneMode}
                                                />
                                                {!isStandaloneMode && !isReadOnly && (
                                                    <button
                                                        onClick={() => setCustomMetricMappings(customMetricMappings.filter((_, i) => i !== idx))}
                                                        className="text-gray-400 hover:text-red-500 text-xs font-mono"
                                                    >×</button>
                                                )}
                                            </div>
                                        ))}
                                        {!isStandaloneMode && !isReadOnly && (
                                            <button
                                                onClick={() => setCustomMetricMappings([...customMetricMappings, { metricName: '', protocolKey: '' }])}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                            >+ Add mapping</button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <SectionHeader title="OpenTelemetry Exporter" description="OTLP endpoint, service name, custom span attributes" expanded={showOtelConfig} onToggle={() => setShowOtelConfig(!showOtelConfig)} />
                            {showOtelConfig && (
                                <div className="flex flex-col gap-y-3 pl-6">
                                    <Input label="OTLP Exporter Endpoint" helperInfo="OpenTelemetry collector endpoint for exporting trace data. Defaults to the platform collector if empty" placeholder="http://otel-collector:4318/v1/traces" value={otelExporterEndpoint} onChange={e => setOtelExporterEndpoint(e.target.value)} disabled={isReadOnly} />
                                    <Input label="Service Name" helperInfo="Service identifier in trace data, used to distinguish this agent's spans in observability dashboards" placeholder="e.g. kaya-external-agent" value={otelServiceName} onChange={e => setOtelServiceName(e.target.value)} disabled={isReadOnly} />
                                    <Input label="Custom Span Attributes (JSON)" helperInfo="Additional key-value pairs attached to every trace span for filtering and grouping in your observability tool" placeholder='{"team":"platform","env":"prod"}' value={customSpanAttributes} onChange={e => setCustomSpanAttributes(e.target.value)} disabled={isReadOnly} />
                                    <InfoBanner text="If left empty, the platform's default OpenTelemetry collector endpoint and service name will be used." />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Form Actions ─── */}
                <div className="external-agent-form-footer flex gap-x-3 justify-end pb-4">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData}>
                        Save
                    </Button>
                </div>
            </div>

            {/* ─── Standalone Agent Config Modal (reuses CreationWizard in edit mode) ─── */}
            {selectedAgent && (
                <CreationWizard
                    open={showAgentConfigModal}
                    onOpenChange={setShowAgentConfigModal}
                    agent={selectedAgent}
                />
            )}
        </div>
    );
};
