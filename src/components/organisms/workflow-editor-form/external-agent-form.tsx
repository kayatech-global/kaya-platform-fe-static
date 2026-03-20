/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Button, Input, Label, Select, Switch } from '@/components/atoms';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';

type ProtocolType = 'a2a' | 'acp';
type AuthMode = 'none' | 'bearer' | 'apikey' | 'oauth' | 'jwt';
type ExecutionMode = 'sync' | 'async_wait' | 'async_fire_forget' | 'streaming';
type SessionOverride = 'none' | 'single' | 'per_workflow' | 'per_execution';
type TracePropagation = 'w3c_traceparent' | 'otel_meta' | 'both';
type TraceLogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type ExternalAgentNodeData = {
    name?: string;
    protocol?: ProtocolType;

    // --- Shared Connection ---
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

    // --- A2A-specific ---
    agentCardUrl?: string;
    a2aSkillId?: string;
    a2aInputModes?: string;
    a2aOutputModes?: string;
    a2aStreamingEnabled?: boolean;
    a2aPushNotificationUrl?: string;

    // --- ACP-specific ---
    acpAgentName?: string;
    acpConfigId?: string;
    acpAwaitResumeEnabled?: boolean;
    acpStreamingEnabled?: boolean;

    // --- Execution ---
    executionMode?: ExecutionMode;
    timeoutMs?: number;
    pollingIntervalMs?: number;

    // --- Metadata ---
    sendWorkflowVarsAsMetadata?: boolean;
    includeExecutionContext?: boolean;
    metadataKeyPrefix?: string;

    // --- Session ---
    sessionOverride?: SessionOverride;

    // --- Tracing & Observability ---
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
};

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

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
    <div className="flex items-start gap-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-gray-700/50 border border-blue-200 dark:border-gray-600">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#0DA2E7]" />
        <p className="text-xs text-gray-600 dark:text-gray-300">{text}</p>
    </div>
);

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

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
    const [a2aSkillId, setA2aSkillId] = useState('');
    const [a2aInputModes, setA2aInputModes] = useState('text/plain, application/json');
    const [a2aOutputModes, setA2aOutputModes] = useState('text/plain, application/json');
    const [a2aStreamingEnabled, setA2aStreamingEnabled] = useState(false);
    const [a2aPushNotificationUrl, setA2aPushNotificationUrl] = useState('');

    // --- ACP-specific ---
    const [acpAgentName, setAcpAgentName] = useState('');
    const [acpConfigId, setAcpConfigId] = useState('');
    const [acpAwaitResumeEnabled, setAcpAwaitResumeEnabled] = useState(false);
    const [acpStreamingEnabled, setAcpStreamingEnabled] = useState(false);

    // --- Execution ---
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('sync');
    const [timeoutMs, setTimeoutMs] = useState<number>(30000);
    const [pollingIntervalMs, setPollingIntervalMs] = useState<number>(5000);

    // --- Metadata ---
    const [sendWorkflowVarsAsMetadata, setSendWorkflowVarsAsMetadata] = useState(true);
    const [includeExecutionContext, setIncludeExecutionContext] = useState(true);
    const [metadataKeyPrefix, setMetadataKeyPrefix] = useState('');

    // --- Session ---
    const [sessionOverride, setSessionOverride] = useState<SessionOverride>('none');

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

    // --- Section toggles ---
    const [showA2aAdvanced, setShowA2aAdvanced] = useState(false);
    const [showAcpAdvanced, setShowAcpAdvanced] = useState(false);
    const [showTracingDetails, setShowTracingDetails] = useState(false);
    const [showOtelConfig, setShowOtelConfig] = useState(false);

    const initFormData = useCallback(() => {
        const d = selectedNode?.data as ExternalAgentNodeData;
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
        setA2aSkillId(d?.a2aSkillId ?? '');
        setA2aInputModes(d?.a2aInputModes ?? 'text/plain, application/json');
        setA2aOutputModes(d?.a2aOutputModes ?? 'text/plain, application/json');
        setA2aStreamingEnabled(d?.a2aStreamingEnabled ?? false);
        setA2aPushNotificationUrl(d?.a2aPushNotificationUrl ?? '');
        setAcpAgentName(d?.acpAgentName ?? '');
        setAcpConfigId(d?.acpConfigId ?? '');
        setAcpAwaitResumeEnabled(d?.acpAwaitResumeEnabled ?? false);
        setAcpStreamingEnabled(d?.acpStreamingEnabled ?? false);
        setExecutionMode(d?.executionMode ?? 'sync');
        setTimeoutMs(d?.timeoutMs ?? 30000);
        setPollingIntervalMs(d?.pollingIntervalMs ?? 5000);
        setSendWorkflowVarsAsMetadata(d?.sendWorkflowVarsAsMetadata ?? true);
        setIncludeExecutionContext(d?.includeExecutionContext ?? true);
        setMetadataKeyPrefix(d?.metadataKeyPrefix ?? '');
        setSessionOverride(d?.sessionOverride ?? 'none');
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
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    const constructNodeData = useCallback((): ExternalAgentNodeData => {
        const base: ExternalAgentNodeData = {
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
                a2aSkillId: a2aSkillId || undefined,
                a2aInputModes,
                a2aOutputModes,
                a2aStreamingEnabled,
                a2aPushNotificationUrl: a2aPushNotificationUrl || undefined,
            });
        } else {
            Object.assign(base, {
                acpAgentName: acpAgentName || undefined,
                acpConfigId: acpConfigId || undefined,
                acpAwaitResumeEnabled,
                acpStreamingEnabled,
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
            });
        }

        return base;
    }, [
        name, protocol, endpointUrl, authMode, bearerToken, apiKey, apiKeyHeader,
        oauthTokenUrl, oauthClientId, oauthClientSecret, oauthScopes, jwtSecret, jwtIssuer,
        executionMode, timeoutMs, pollingIntervalMs,
        sendWorkflowVarsAsMetadata, includeExecutionContext, metadataKeyPrefix,
        sessionOverride,
        agentCardUrl, a2aSkillId, a2aInputModes, a2aOutputModes, a2aStreamingEnabled, a2aPushNotificationUrl,
        acpAgentName, acpConfigId, acpAwaitResumeEnabled, acpStreamingEnabled,
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
                {/* ─── Name ─── */}
                <div className="flex flex-col gap-y-5 pb-4 bottom-gradient-border">
                    <Input
                        label="Name"
                        placeholder="Name of the external agent"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ─── Protocol Selection ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Protocol</Label>
                    <div className="flex gap-2">
                        {(['a2a', 'acp'] as const).map(p => (
                            <button
                                key={p}
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => setProtocol(p)}
                                className={cn(
                                    'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                                    protocol === p
                                        ? 'bg-[#0DA2E7] text-white border-[#0DA2E7]'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
                                    isReadOnly && 'opacity-50 cursor-not-allowed'
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
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">A2A Agent Discovery</Label>
                        <Input
                            label="Agent Card URL"
                            placeholder="https://agent.example.com/.well-known/agent.json"
                            value={agentCardUrl}
                            onChange={e => setAgentCardUrl(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InfoBanner text="The Agent Card (JSON) describes the agent's identity, capabilities, skills, and supported auth schemes. Typically at /.well-known/agent.json" />

                        <Input
                            label="Skill ID (optional)"
                            placeholder="e.g. summarize, translate, code-review"
                            value={a2aSkillId}
                            onChange={e => setA2aSkillId(e.target.value)}
                            disabled={isReadOnly}
                        />

                        <SectionHeader
                            title="A2A Advanced Settings"
                            description="Input/output modes, streaming, push notifications"
                            expanded={showA2aAdvanced}
                            onToggle={() => setShowA2aAdvanced(!showA2aAdvanced)}
                        />
                        {showA2aAdvanced && (
                            <div className="flex flex-col gap-y-3 pl-6">
                                <Input
                                    label="Supported Input Modes"
                                    placeholder="text/plain, application/json"
                                    value={a2aInputModes}
                                    onChange={e => setA2aInputModes(e.target.value)}
                                    disabled={isReadOnly}
                                />
                                <Input
                                    label="Supported Output Modes"
                                    placeholder="text/plain, application/json"
                                    value={a2aOutputModes}
                                    onChange={e => setA2aOutputModes(e.target.value)}
                                    disabled={isReadOnly}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-y-0.5">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">SSE Streaming</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Stream task updates via Server-Sent Events</p>
                                    </div>
                                    <Switch checked={a2aStreamingEnabled} onCheckedChange={setA2aStreamingEnabled} disabled={isReadOnly} />
                                </div>
                                <Input
                                    label="Push Notification URL (optional)"
                                    placeholder="https://your-platform.com/a2a/callback"
                                    value={a2aPushNotificationUrl}
                                    onChange={e => setA2aPushNotificationUrl(e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ACP-specific Configuration ─── */}
                {protocol === 'acp' && (
                    <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">ACP Agent Configuration</Label>
                        <Input
                            label="Agent Name"
                            placeholder="Required — the agent_name for POST /runs"
                            value={acpAgentName}
                            onChange={e => setAcpAgentName(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <Input
                            label="Configuration ID (optional)"
                            placeholder="Pre-configured instance ID from /configure endpoint"
                            value={acpConfigId}
                            onChange={e => setAcpConfigId(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InfoBanner text="ACP uses a config-then-invoke pattern. If a Configuration ID is provided, it will be sent with each run request to use a pre-configured agent instance." />

                        <SectionHeader
                            title="ACP Advanced Settings"
                            description="Await/resume, streaming"
                            expanded={showAcpAdvanced}
                            onToggle={() => setShowAcpAdvanced(!showAcpAdvanced)}
                        />
                        {showAcpAdvanced && (
                            <div className="flex flex-col gap-y-3 pl-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-y-0.5">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Await / Resume</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow agent to pause and request additional input</p>
                                    </div>
                                    <Switch checked={acpAwaitResumeEnabled} onCheckedChange={setAcpAwaitResumeEnabled} disabled={isReadOnly} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-y-0.5">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Streaming</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Stream run output via SSE</p>
                                    </div>
                                    <Switch checked={acpStreamingEnabled} onCheckedChange={setAcpStreamingEnabled} disabled={isReadOnly} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Endpoint URL ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Input
                        label={protocol === 'a2a' ? 'JSON-RPC Endpoint URL' : 'REST API Base URL'}
                        placeholder={protocol === 'a2a'
                            ? 'https://agent.example.com/a2a'
                            : 'https://agent.example.com/api/v1'}
                        value={endpointUrl}
                        onChange={e => setEndpointUrl(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ─── Authentication ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Select
                        label="Authentication"
                        placeholder="Select authentication mode"
                        options={[
                            { name: 'None', value: 'none' },
                            { name: 'Bearer Token', value: 'bearer' },
                            { name: 'API Key', value: 'apikey' },
                            { name: 'OAuth 2.0 (Client Credentials)', value: 'oauth' },
                            { name: 'JWT', value: 'jwt' },
                        ]}
                        value={authMode}
                        onChange={e => setAuthMode(e.target.value as AuthMode)}
                        disabled={isReadOnly}
                    />
                    {authMode === 'bearer' && (
                        <Input
                            label="Bearer Token"
                            placeholder="Enter bearer token"
                            type="password"
                            value={bearerToken}
                            onChange={e => setBearerToken(e.target.value)}
                            disabled={isReadOnly}
                        />
                    )}
                    {authMode === 'apikey' && (
                        <>
                            <Input
                                label="API Key Header"
                                placeholder="X-API-Key"
                                value={apiKeyHeader}
                                onChange={e => setApiKeyHeader(e.target.value)}
                                disabled={isReadOnly}
                            />
                            <Input
                                label="API Key"
                                placeholder="Enter API key"
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </>
                    )}
                    {authMode === 'oauth' && (
                        <>
                            <Input
                                label="Token URL"
                                placeholder="https://auth.example.com/oauth/token"
                                value={oauthTokenUrl}
                                onChange={e => setOauthTokenUrl(e.target.value)}
                                disabled={isReadOnly}
                            />
                            <Input
                                label="Client ID"
                                placeholder="Enter OAuth client ID"
                                value={oauthClientId}
                                onChange={e => setOauthClientId(e.target.value)}
                                disabled={isReadOnly}
                            />
                            <Input
                                label="Client Secret"
                                placeholder="Enter OAuth client secret"
                                type="password"
                                value={oauthClientSecret}
                                onChange={e => setOauthClientSecret(e.target.value)}
                                disabled={isReadOnly}
                            />
                            <Input
                                label="Scopes"
                                placeholder="agent:invoke agent:read (space-separated)"
                                value={oauthScopes}
                                onChange={e => setOauthScopes(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </>
                    )}
                    {authMode === 'jwt' && (
                        <>
                            <Input
                                label="JWT Signing Secret"
                                placeholder="Enter signing secret"
                                type="password"
                                value={jwtSecret}
                                onChange={e => setJwtSecret(e.target.value)}
                                disabled={isReadOnly}
                            />
                            <Input
                                label="Issuer (iss)"
                                placeholder="e.g. kaya-platform"
                                value={jwtIssuer}
                                onChange={e => setJwtIssuer(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </>
                    )}
                </div>

                {/* ─── Execution Mode ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Execution Mode</Label>
                    <div className="flex flex-col gap-y-2">
                        {([
                            { value: 'sync', label: 'Synchronous', desc: 'Block until response' },
                            { value: 'async_wait', label: 'Async (Wait)', desc: 'Poll until task completes' },
                            { value: 'async_fire_forget', label: 'Fire & Forget', desc: 'Send and continue workflow' },
                            { value: 'streaming', label: 'Streaming (SSE)', desc: 'Stream task updates in real-time' },
                        ] as const).map(option => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex items-start gap-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                                    executionMode === option.value
                                        ? 'border-[#0DA2E7] bg-blue-50 dark:bg-gray-700'
                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                                    isReadOnly && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <input
                                    type="radio"
                                    name="executionMode"
                                    value={option.value}
                                    checked={executionMode === option.value}
                                    onChange={() => setExecutionMode(option.value)}
                                    disabled={isReadOnly}
                                    className="accent-[#0DA2E7] mt-0.5"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    {showTimeout && (
                        <Input
                            label="Timeout (ms)"
                            type="number"
                            placeholder="30000"
                            value={String(timeoutMs)}
                            onChange={e => setTimeoutMs(Number(e.target.value))}
                            disabled={isReadOnly}
                        />
                    )}
                    {showPolling && (
                        <Input
                            label="Polling Interval (ms)"
                            type="number"
                            placeholder="5000"
                            value={String(pollingIntervalMs)}
                            onChange={e => setPollingIntervalMs(Number(e.target.value))}
                            disabled={isReadOnly}
                        />
                    )}
                </div>

                {/* ─── Metadata (replaces input/output mapping) ─── */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <div className="flex flex-col gap-y-0.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            Workflow Variable Metadata
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Variables are automatically passed as metadata — no explicit mapping needed
                        </p>
                    </div>
                    <InfoBanner
                        text={protocol === 'a2a'
                            ? 'Workflow variables are sent as DataPart metadata in A2A messages and returned in the task artifact metadata.'
                            : 'Workflow variables are sent via the ACP params._meta field in the run request and returned in the run output metadata.'}
                    />
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
                    <Input
                        label="Metadata Key Prefix (optional)"
                        placeholder="e.g. kaya_ — prefixes all metadata keys"
                        value={metadataKeyPrefix}
                        onChange={e => setMetadataKeyPrefix(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ─── Session Override ─── */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Select
                        label="Session Type Override"
                        placeholder="Select session type"
                        options={[
                            { name: 'None (inherit workflow setting)', value: 'none' },
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
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Tracing & Observability
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Distributed tracing, metrics collection, and data lineage
                            </p>
                        </div>
                        <Switch checked={tracingEnabled} onCheckedChange={setTracingEnabled} disabled={isReadOnly} />
                    </div>

                    {tracingEnabled && (
                        <div className="flex flex-col gap-y-3">
                            <Select
                                label="Trace Context Propagation"
                                placeholder="Select propagation method"
                                options={protocol === 'a2a'
                                    ? [
                                        { name: 'W3C traceparent header', value: 'w3c_traceparent' },
                                        { name: 'Both (W3C + OTel _meta)', value: 'both' },
                                    ]
                                    : [
                                        { name: 'OTel via params._meta', value: 'otel_meta' },
                                        { name: 'W3C traceparent header', value: 'w3c_traceparent' },
                                        { name: 'Both (W3C + OTel _meta)', value: 'both' },
                                    ]}
                                value={tracePropagation}
                                onChange={e => setTracePropagation(e.target.value as TracePropagation)}
                                disabled={isReadOnly}
                            />

                            <Select
                                label="Trace Log Level"
                                placeholder="Select log level"
                                options={[
                                    { name: 'None', value: 'none' },
                                    { name: 'Error', value: 'error' },
                                    { name: 'Warn', value: 'warn' },
                                    { name: 'Info', value: 'info' },
                                    { name: 'Debug', value: 'debug' },
                                    { name: 'Trace', value: 'trace' },
                                ]}
                                value={traceLogLevel}
                                onChange={e => setTraceLogLevel(e.target.value as TraceLogLevel)}
                                disabled={isReadOnly}
                            />

                            {/* Metric capture toggles */}
                            <SectionHeader
                                title="Metrics & Data Capture"
                                description="Token usage, latency, cost, data lineage"
                                expanded={showTracingDetails}
                                onToggle={() => setShowTracingDetails(!showTracingDetails)}
                            />
                            {showTracingDetails && (
                                <div className="flex flex-col gap-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Capture Task State Transitions</Label>
                                        <Switch checked={captureTaskStateTransitions} onCheckedChange={setCaptureTaskStateTransitions} disabled={isReadOnly} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Capture Token Usage</Label>
                                        <Switch checked={captureTokenUsage} onCheckedChange={setCaptureTokenUsage} disabled={isReadOnly} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Capture Latency Metrics</Label>
                                        <Switch checked={captureLatencyMetrics} onCheckedChange={setCaptureLatencyMetrics} disabled={isReadOnly} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-700 dark:text-gray-100">Capture Cost Metrics</Label>
                                        <Switch checked={captureCostMetrics} onCheckedChange={setCaptureCostMetrics} disabled={isReadOnly} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-y-0.5">
                                            <Label className="text-sm text-gray-700 dark:text-gray-100">Data Lineage</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Record input/output artifacts for lineage tracking</p>
                                        </div>
                                        <Switch checked={dataLineageEnabled} onCheckedChange={setDataLineageEnabled} disabled={isReadOnly} />
                                    </div>
                                </div>
                            )}

                            {/* OpenTelemetry exporter config */}
                            <SectionHeader
                                title="OpenTelemetry Exporter"
                                description="OTLP endpoint, service name, custom span attributes"
                                expanded={showOtelConfig}
                                onToggle={() => setShowOtelConfig(!showOtelConfig)}
                            />
                            {showOtelConfig && (
                                <div className="flex flex-col gap-y-3 pl-6">
                                    <Input
                                        label="OTLP Exporter Endpoint"
                                        placeholder="http://otel-collector:4318/v1/traces"
                                        value={otelExporterEndpoint}
                                        onChange={e => setOtelExporterEndpoint(e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                    <Input
                                        label="Service Name"
                                        placeholder="e.g. kaya-external-agent"
                                        value={otelServiceName}
                                        onChange={e => setOtelServiceName(e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                    <Input
                                        label="Custom Span Attributes (JSON)"
                                        placeholder='{"team":"platform","env":"prod"}'
                                        value={customSpanAttributes}
                                        onChange={e => setCustomSpanAttributes(e.target.value)}
                                        disabled={isReadOnly}
                                    />
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
        </div>
    );
};
