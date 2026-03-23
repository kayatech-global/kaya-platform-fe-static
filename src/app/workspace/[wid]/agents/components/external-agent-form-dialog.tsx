'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input, Label, Select, Switch } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/atoms/dialog';
import { Globe, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExternalAgentDefinition, ExternalAgentProtocol, ExternalAgentAuthMode } from './external-agent-tab';
import { toast } from 'sonner';

interface ExternalAgentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent?: ExternalAgentDefinition;
    onSave: (agent: ExternalAgentDefinition) => void;
}

const SectionHeader = ({ title, description, expanded, onToggle }: { title: string; description?: string; expanded: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} className="flex items-start gap-x-2 w-full text-left">
        {expanded ? <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" /> : <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />}
        <div className="flex flex-col gap-y-0.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{title}</span>
            {description && <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>}
        </div>
    </button>
);

export const ExternalAgentFormDialog = ({ open, onOpenChange, agent, onSave }: ExternalAgentFormDialogProps) => {
    const isEdit = !!agent;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [protocol, setProtocol] = useState<ExternalAgentProtocol>('a2a');
    const [endpointUrl, setEndpointUrl] = useState('');
    const [authMode, setAuthMode] = useState<ExternalAgentAuthMode>('none');
    const [bearerToken, setBearerToken] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
    const [oauthTokenUrl, setOauthTokenUrl] = useState('');
    const [oauthClientId, setOauthClientId] = useState('');
    const [oauthClientSecret, setOauthClientSecret] = useState('');
    const [oauthScopes, setOauthScopes] = useState('');
    const [jwtSecret, setJwtSecret] = useState('');
    const [jwtIssuer, setJwtIssuer] = useState('');
    const [agentCardUrl, setAgentCardUrl] = useState('');
    const [acpAgentName, setAcpAgentName] = useState('');
    const [executionMode, setExecutionMode] = useState<'sync' | 'async_wait' | 'async_fire_forget'>('sync');
    const [sessionMode, setSessionMode] = useState<'single' | 'per-workflow' | 'per-execution'>('per-execution');
    const [timeoutMs, setTimeoutMs] = useState(30000);
    const [pollingIntervalMs, setPollingIntervalMs] = useState(5000);
    const [tracingEnabled, setTracingEnabled] = useState(true);
    const [showObservability, setShowObservability] = useState(false);
    const [showMetricMappings, setShowMetricMappings] = useState(false);
    const [customMetricMappings, setCustomMetricMappings] = useState<Array<{ metricName: string; protocolKey: string }>>([
        { metricName: 'agent.token.input', protocolKey: 'token_input' },
        { metricName: 'agent.token.output', protocolKey: 'token_output' },
        { metricName: 'agent.execution.duration', protocolKey: 'execution_time_ms' },
        { metricName: 'agent.llm.calls', protocolKey: 'llm_call_count' },
        { metricName: 'agent.tool.calls', protocolKey: 'tool_call_count' },
    ]);

    useEffect(() => {
        if (agent) {
            setName(agent.name);
            setDescription(agent.description);
            setProtocol(agent.protocol);
            setEndpointUrl(agent.endpointUrl);
            setAuthMode(agent.authMode);
            setAgentCardUrl(agent.agentCardUrl ?? '');
            setAcpAgentName(agent.acpAgentName ?? '');
            setExecutionMode(agent.executionMode);
            setSessionMode(agent.sessionMode);
        } else {
            setName('');
            setDescription('');
            setProtocol('a2a');
            setEndpointUrl('');
            setAuthMode('none');
            setAgentCardUrl('');
            setAcpAgentName('');
            setExecutionMode('sync');
            setSessionMode('per-execution');
        }
    }, [agent, open]);

    const handleSave = () => {
        const result: ExternalAgentDefinition = {
            id: agent?.id ?? `ext-${Date.now()}`,
            name, description, protocol, endpointUrl, authMode,
            agentCardUrl: agentCardUrl || undefined,
            acpAgentName: acpAgentName || undefined,
            executionMode, sessionMode,
            connectionStatus: 'unknown',
            createdAt: agent?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        onSave(result);
        toast.success(isEdit ? `"${name}" updated` : `"${name}" created`);
    };

    const isValid = name.trim() && endpointUrl.trim() && (protocol === 'a2a' || acpAgentName.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto !gap-0">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        {isEdit ? 'Edit External Agent' : 'New External Agent'}
                    </DialogTitle>
                </DialogHeader>

                <DialogBody className="py-4 flex flex-col gap-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input label="Agent Name" helperInfo="A display name for this external agent connection" placeholder="e.g. OpenAI Assistant" value={name} onChange={e => setName(e.target.value)} />
                        <Input label="Description" helperInfo="Short description of what this agent does" placeholder="e.g. GPT-4 powered assistant" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <Label className="text-sm font-medium">Protocol</Label>
                        <div className="flex gap-2">
                            {(['a2a', 'acp'] as const).map(p => (
                                <button key={p} type="button" onClick={() => setProtocol(p)}
                                    className={cn('flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                                        protocol === p ? 'bg-[#6c3def] text-white border-[#6c3def]' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
                                    )}>
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">{protocol === 'a2a' ? 'Google Agent-to-Agent — JSON-RPC 2.0 over HTTP, Agent Card discovery, SSE streaming' : 'Agent Communication Protocol — RESTful API, OpenAPI schema, config-then-invoke pattern'}</p>
                    </div>

                    <Input label={protocol === 'a2a' ? 'JSON-RPC Endpoint URL' : 'REST API Base URL'} helperInfo={protocol === 'a2a' ? 'A2A JSON-RPC 2.0 endpoint' : 'ACP REST API base URL'} placeholder={protocol === 'a2a' ? 'https://agent.example.com/a2a' : 'https://agent.example.com/api/v1'} value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} />

                    {protocol === 'a2a' && (
                        <Input label="Agent Card URL" helperInfo="URL to the agent's .well-known/agent.json metadata" placeholder="https://agent.example.com/.well-known/agent.json" value={agentCardUrl} onChange={e => setAgentCardUrl(e.target.value)} />
                    )}
                    {protocol === 'acp' && (
                        <Input label="ACP Agent Name" helperInfo="The agent_name parameter for POST /runs" placeholder="e.g. research-agent" value={acpAgentName} onChange={e => setAcpAgentName(e.target.value)} />
                    )}

                    <div className="flex flex-col gap-y-2">
                        <Select label="Authentication" helperInfo="How to authenticate with the external agent" placeholder="Select mode" options={[
                            { name: 'None', value: 'none' }, { name: 'Bearer Token', value: 'bearer' }, { name: 'API Key', value: 'apikey' }, { name: 'OAuth 2.0', value: 'oauth' }, { name: 'JWT', value: 'jwt' },
                        ]} value={authMode} onChange={e => setAuthMode(e.target.value as ExternalAgentAuthMode)} />
                        {authMode === 'bearer' && <Input label="Bearer Token" type="password" value={bearerToken} onChange={e => setBearerToken(e.target.value)} />}
                        {authMode === 'apikey' && (<div className="flex flex-col gap-y-2"><Input label="API Key Header" value={apiKeyHeader} onChange={e => setApiKeyHeader(e.target.value)} /><Input label="API Key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} /></div>)}
                        {authMode === 'oauth' && (<div className="flex flex-col gap-y-2"><Input label="Token URL" value={oauthTokenUrl} onChange={e => setOauthTokenUrl(e.target.value)} /><Input label="Client ID" value={oauthClientId} onChange={e => setOauthClientId(e.target.value)} /><Input label="Client Secret" type="password" value={oauthClientSecret} onChange={e => setOauthClientSecret(e.target.value)} /><Input label="Scopes" value={oauthScopes} onChange={e => setOauthScopes(e.target.value)} /></div>)}
                        {authMode === 'jwt' && (<div className="flex flex-col gap-y-2"><Input label="JWT Secret" type="password" value={jwtSecret} onChange={e => setJwtSecret(e.target.value)} /><Input label="Issuer" value={jwtIssuer} onChange={e => setJwtIssuer(e.target.value)} /></div>)}
                    </div>

                    <div className="flex flex-col gap-y-2">
                        <Select label="Default Execution Mode" helperInfo="How the workflow engine invokes this agent (overridable per node)" options={[
                            { name: 'Synchronous (SSE)', value: 'sync' }, { name: 'Async (Wait)', value: 'async_wait' }, { name: 'Fire & Forget', value: 'async_fire_forget' },
                        ]} value={executionMode} onChange={e => setExecutionMode(e.target.value as 'sync' | 'async_wait' | 'async_fire_forget')} />
                        {(executionMode === 'sync' || executionMode === 'async_wait') && (
                            <Input label="Timeout (ms)" type="number" value={String(timeoutMs)} onChange={e => setTimeoutMs(Number(e.target.value))} />
                        )}
                        {executionMode === 'async_wait' && (
                            <Input label="Polling Interval (ms)" type="number" value={String(pollingIntervalMs)} onChange={e => setPollingIntervalMs(Number(e.target.value))} />
                        )}
                    </div>

                    <Select label="Default Session Mode" helperInfo="Conversation state persistence (overridable per node)" options={[
                        { name: 'Single Session', value: 'single' }, { name: 'Per-Workflow', value: 'per-workflow' }, { name: 'Per-Execution', value: 'per-execution' },
                    ]} value={sessionMode} onChange={e => setSessionMode(e.target.value as 'single' | 'per-workflow' | 'per-execution')} />

                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Tracing & Observability</Label>
                            <Switch checked={tracingEnabled} onCheckedChange={setTracingEnabled} />
                        </div>
                        {tracingEnabled && (
                            <>
                                <SectionHeader title="Protocol Metric Mappings" description="Map agent metadata keys to platform metrics" expanded={showMetricMappings} onToggle={() => setShowMetricMappings(!showMetricMappings)} />
                                {showMetricMappings && (
                                    <div className="flex flex-col gap-y-2 pl-6">
                                        <div className="flex items-start gap-x-2 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-gray-700/50 border border-blue-200 dark:border-gray-600">
                                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                                            <p className="text-xs text-gray-600 dark:text-gray-300">Map the external agent&apos;s metadata keys to platform metric names for observability dashboards.</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="grid grid-cols-[1fr_1fr_32px] gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider px-1">
                                                <span>Platform Metric</span>
                                                <span>{protocol === 'a2a' ? 'A2A Metadata Key' : 'ACP Metrics Key'}</span>
                                                <span />
                                            </div>
                                            {customMetricMappings.map((mapping, idx) => (
                                                <div key={idx} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
                                                    <input className="rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-mono" value={mapping.metricName} onChange={e => { const u = [...customMetricMappings]; u[idx] = { ...u[idx], metricName: e.target.value }; setCustomMetricMappings(u); }} />
                                                    <input className="rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-mono" value={mapping.protocolKey} onChange={e => { const u = [...customMetricMappings]; u[idx] = { ...u[idx], protocolKey: e.target.value }; setCustomMetricMappings(u); }} />
                                                    <button onClick={() => setCustomMetricMappings(customMetricMappings.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 text-xs font-mono">×</button>
                                                </div>
                                            ))}
                                            <button onClick={() => setCustomMetricMappings([...customMetricMappings, { metricName: '', protocolKey: '' }])} className="text-xs text-blue-600 hover:underline mt-1">+ Add mapping</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogBody>

                <DialogFooter className="gap-2">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!isValid}>{isEdit ? 'Save Changes' : 'Create Agent'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
