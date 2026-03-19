'use client';

import React, { useState } from 'react';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components';
import { Button } from '@/components';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Switch } from '@/components/atoms/switch';
import { Badge } from '@/components/atoms/badge';
import { Plus, Trash2, Bot, X, Globe, Zap, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExternalAgentConfigPanelProps {
    onClose?: () => void;
}

interface VarMapping {
    workflowVar: string;
    agentVar: string;
}

export const ExternalAgentConfigPanel = ({ onClose }: ExternalAgentConfigPanelProps) => {
    const [protocol, setProtocol] = useState<'A2A' | 'ACP'>('A2A');
    const [endpointUrl, setEndpointUrl] = useState('https://agents.kaya.io/v1/agent/agent-001');
    const [authType, setAuthType] = useState<'none' | 'bearer' | 'api-key'>('bearer');
    const [authToken, setAuthToken] = useState('');
    const [executionMode, setExecutionMode] = useState<'synchronous' | 'asynchronous' | 'fire-and-forget'>('synchronous');
    const [timeout, setTimeout] = useState(30);
    const [pollingInterval, setPollingInterval] = useState(5);
    const [sessionOverride, setSessionOverride] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [enableTracing, setEnableTracing] = useState(true);
    const [inputMappings, setInputMappings] = useState<VarMapping[]>([
        { workflowVar: '{{workflow.userInput}}', agentVar: 'query' },
        { workflowVar: '{{workflow.context}}', agentVar: 'context' },
    ]);
    const [outputMappings, setOutputMappings] = useState<VarMapping[]>([
        { workflowVar: '{{node.agentResponse}}', agentVar: 'response' },
    ]);

    const addMapping = (type: 'input' | 'output') => {
        const empty: VarMapping = { workflowVar: '', agentVar: '' };
        if (type === 'input') setInputMappings(prev => [...prev, empty]);
        else setOutputMappings(prev => [...prev, empty]);
    };

    const removeMapping = (type: 'input' | 'output', index: number) => {
        if (type === 'input') setInputMappings(prev => prev.filter((_, i) => i !== index));
        else setOutputMappings(prev => prev.filter((_, i) => i !== index));
    };

    const updateMapping = (type: 'input' | 'output', index: number, field: keyof VarMapping, value: string) => {
        if (type === 'input') {
            setInputMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
        } else {
            setOutputMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-border w-[340px] flex-shrink-0">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15">
                        <Bot size={14} className="text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">External Agent</p>
                        <p className="text-[10px] text-muted-foreground">Node Configuration</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-600">

                {/* Protocol */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Protocol</Label>
                    <div className="flex gap-2">
                        {(['A2A', 'ACP'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setProtocol(p)}
                                className={cn(
                                    'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                    protocol === p
                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                        : 'border-border text-muted-foreground hover:border-border/80'
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        {protocol === 'A2A'
                            ? 'Google Agent-to-Agent protocol. Discovers agent capabilities from .well-known/agent.json.'
                            : 'OpenClaw Agent Communication Protocol. REST-based cross-platform messaging.'}
                    </p>
                </div>

                {/* Endpoint URL */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Endpoint URL</Label>
                    <Input
                        value={endpointUrl}
                        onChange={e => setEndpointUrl(e.target.value)}
                        placeholder="https://..."
                        className="text-xs font-mono h-8"
                    />
                </div>

                {/* Authentication */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Authentication</Label>
                    <Select value={authType} onValueChange={v => setAuthType(v as typeof authType)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" className="text-xs">None</SelectItem>
                            <SelectItem value="bearer" className="text-xs">Bearer Token</SelectItem>
                            <SelectItem value="api-key" className="text-xs">API Key</SelectItem>
                        </SelectContent>
                    </Select>
                    {authType === 'bearer' && (
                        <Input
                            placeholder="Bearer token or {{vault.agentToken}}"
                            value={authToken}
                            onChange={e => setAuthToken(e.target.value)}
                            className="text-xs font-mono h-8"
                        />
                    )}
                    {authType === 'api-key' && (
                        <div className="flex flex-col gap-1.5">
                            <Input placeholder="Header name (e.g. X-API-Key)" className="text-xs h-8" />
                            <Input
                                placeholder="Key value or {{vault.apiKey}}"
                                value={authToken}
                                onChange={e => setAuthToken(e.target.value)}
                                className="text-xs font-mono h-8"
                            />
                        </div>
                    )}
                </div>

                {/* Execution Mode */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Execution Mode</Label>
                    <RadioGroup
                        value={executionMode}
                        onValueChange={v => setExecutionMode(v as typeof executionMode)}
                        className="flex flex-col gap-1.5"
                    >
                        {[
                            { value: 'synchronous', label: 'Synchronous', desc: 'Wait for agent to complete' },
                            { value: 'asynchronous', label: 'Asynchronous', desc: 'Poll for completion' },
                            { value: 'fire-and-forget', label: 'Fire-and-Forget', desc: 'No wait, no result' },
                        ].map(opt => (
                            <label
                                key={opt.value}
                                className={cn(
                                    'flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors',
                                    executionMode === opt.value
                                        ? 'border-cyan-500/40 bg-cyan-500/8'
                                        : 'border-border hover:border-border/80'
                                )}
                            >
                                <RadioGroupItem value={opt.value} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className={cn('font-medium', executionMode === opt.value ? 'text-cyan-400' : 'text-foreground')}>{opt.label}</p>
                                    <p className="text-muted-foreground text-[10px]">{opt.desc}</p>
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                </div>

                {/* Timeout / Polling */}
                {executionMode !== 'fire-and-forget' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Timeout (s)</Label>
                            <Input
                                type="number"
                                value={timeout}
                                onChange={e => setTimeout(parseInt(e.target.value) || 30)}
                                className="h-8 text-xs"
                            />
                        </div>
                        {executionMode === 'asynchronous' && (
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Poll Interval (s)</Label>
                                <Input
                                    type="number"
                                    value={pollingInterval}
                                    onChange={e => setPollingInterval(parseInt(e.target.value) || 5)}
                                    className="h-8 text-xs"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Variable Mapping */}
                <div className="flex flex-col gap-3">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variable Mapping</Label>

                    {/* Input Mapping */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-medium text-foreground flex items-center gap-1">
                                <Link size={10} className="text-blue-400" /> Input Variables
                            </p>
                            <button
                                onClick={() => addMapping('input')}
                                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                            >
                                <Plus size={10} /> Add
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {inputMappings.map((m, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <Input
                                        value={m.workflowVar}
                                        onChange={e => updateMapping('input', i, 'workflowVar', e.target.value)}
                                        placeholder="{{workflow.var}}"
                                        className="text-[10px] h-7 font-mono flex-1"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">→</span>
                                    <Input
                                        value={m.agentVar}
                                        onChange={e => updateMapping('input', i, 'agentVar', e.target.value)}
                                        placeholder="agent_var"
                                        className="text-[10px] h-7 font-mono flex-1"
                                    />
                                    <button onClick={() => removeMapping('input', i)} className="text-muted-foreground hover:text-red-400 flex-shrink-0">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Output Mapping */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-medium text-foreground flex items-center gap-1">
                                <Link size={10} className="text-green-400" /> Output Variables
                            </p>
                            <button
                                onClick={() => addMapping('output')}
                                className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-0.5"
                            >
                                <Plus size={10} /> Add
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {outputMappings.map((m, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <Input
                                        value={m.agentVar}
                                        onChange={e => updateMapping('output', i, 'agentVar', e.target.value)}
                                        placeholder="agent_output"
                                        className="text-[10px] h-7 font-mono flex-1"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">→</span>
                                    <Input
                                        value={m.workflowVar}
                                        onChange={e => updateMapping('output', i, 'workflowVar', e.target.value)}
                                        placeholder="{{node.var}}"
                                        className="text-[10px] h-7 font-mono flex-1"
                                    />
                                    <button onClick={() => removeMapping('output', i)} className="text-muted-foreground hover:text-red-400 flex-shrink-0">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Session Override */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session Override</Label>
                            <p className="text-[10px] text-muted-foreground">Force a specific session ID</p>
                        </div>
                        <Switch checked={sessionOverride} onCheckedChange={setSessionOverride} />
                    </div>
                    {sessionOverride && (
                        <Input
                            placeholder="sess-abc123 or {{workflow.sessionId}}"
                            value={sessionId}
                            onChange={e => setSessionId(e.target.value)}
                            className="text-xs font-mono h-8"
                        />
                    )}
                </div>

                {/* Enable Tracing */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                        <Label className="text-xs font-semibold text-foreground">Enable Tracing</Label>
                        <p className="text-[10px] text-muted-foreground">Capture observability & data lineage events</p>
                    </div>
                    <Switch checked={enableTracing} onCheckedChange={setEnableTracing} />
                </div>

                {/* Agent Card Preview */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent Card Preview</Label>
                    <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-cyan-500/15">
                                <Bot size={12} className="text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">Customer Support Agent</p>
                                <p className="text-[10px] text-muted-foreground">v1.3.2 · PI Agents</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Handles tier-1 customer support queries using knowledge base retrieval and ticket escalation.
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {['query', 'context', 'history'].map(cap => (
                                <Badge key={cap} variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 px-1.5 py-0">
                                    {cap}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-cyan-500/20">
                            <Badge variant="outline" className="text-[9px] border-teal-500/30 text-teal-400">A2A</Badge>
                            <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Running</Badge>
                            <span className="text-[9px] text-muted-foreground ml-auto">2 min ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1 text-xs h-8">
                    Reset
                </Button>
                <Button size="sm" className="flex-1 text-xs h-8 gap-1.5">
                    <Zap size={12} /> Apply
                </Button>
            </div>
        </div>
    );
};
