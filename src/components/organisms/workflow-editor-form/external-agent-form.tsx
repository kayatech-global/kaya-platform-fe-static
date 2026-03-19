'use client';

import React, { useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { Button, Input, Switch, Label } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Globe, Key, Lock, Zap, Clock, RefreshCw, Eye } from 'lucide-react';

interface VariableMapping {
    id: string;
    from: string;
    to: string;
}

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

const PROTOCOL_OPTIONS = ['A2A', 'ACP'] as const;
const AUTH_MODES = ['Bearer Token', 'API Key', 'No Auth'] as const;
const EXEC_MODES = ['Synchronous', 'Async (Wait Until Complete)', 'Async (Fire and Forget)'] as const;
const SESSION_TYPES = ['None', 'Single', 'Per-Workflow', 'Per-Execution'] as const;

type Protocol = (typeof PROTOCOL_OPTIONS)[number];
type AuthMode = (typeof AUTH_MODES)[number];
type ExecMode = (typeof EXEC_MODES)[number];
type SessionType = (typeof SESSION_TYPES)[number];

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { updateNodeData } = useReactFlow();

    const data = selectedNode.data as Record<string, unknown>;

    const [protocol, setProtocol] = useState<Protocol>((data.protocol as Protocol) ?? 'A2A');
    const [endpointUrl, setEndpointUrl] = useState<string>((data.endpointUrl as string) ?? '');
    const [authMode, setAuthMode] = useState<AuthMode>((data.authMode as AuthMode) ?? 'Bearer Token');
    const [bearerToken, setBearerToken] = useState<string>((data.bearerToken as string) ?? '');
    const [apiKey, setApiKey] = useState<string>((data.apiKey as string) ?? '');
    const [apiKeyHeader, setApiKeyHeader] = useState<string>((data.apiKeyHeader as string) ?? 'X-API-Key');
    const [execMode, setExecMode] = useState<ExecMode>(
        (data.execMode as ExecMode) ?? 'Synchronous'
    );
    const [timeout, setTimeout_] = useState<string>((data.timeout as string) ?? '30');
    const [pollingInterval, setPollingInterval] = useState<string>((data.pollingInterval as string) ?? '2');
    const [inputMappings, setInputMappings] = useState<VariableMapping[]>(
        (data.inputMappings as VariableMapping[]) ?? [{ id: '1', from: 'userInput', to: 'query' }]
    );
    const [outputMappings, setOutputMappings] = useState<VariableMapping[]>(
        (data.outputMappings as VariableMapping[]) ?? [{ id: '1', from: 'result', to: 'agentOutput' }]
    );
    const [sessionType, setSessionType] = useState<SessionType>((data.sessionType as SessionType) ?? 'None');
    const [tracingEnabled, setTracingEnabled] = useState<boolean>((data.tracingEnabled as boolean) ?? true);
    const [showAgentCard, setShowAgentCard] = useState(false);

    const save = (patch: Record<string, unknown>) => {
        updateNodeData(selectedNode.id, { ...data, ...patch });
    };

    const addMapping = (type: 'input' | 'output') => {
        const newEntry: VariableMapping = { id: Date.now().toString(), from: '', to: '' };
        if (type === 'input') {
            const updated = [...inputMappings, newEntry];
            setInputMappings(updated);
            save({ inputMappings: updated });
        } else {
            const updated = [...outputMappings, newEntry];
            setOutputMappings(updated);
            save({ outputMappings: updated });
        }
    };

    const removeMapping = (type: 'input' | 'output', id: string) => {
        if (type === 'input') {
            const updated = inputMappings.filter(m => m.id !== id);
            setInputMappings(updated);
            save({ inputMappings: updated });
        } else {
            const updated = outputMappings.filter(m => m.id !== id);
            setOutputMappings(updated);
            save({ outputMappings: updated });
        }
    };

    const updateMapping = (
        type: 'input' | 'output',
        id: string,
        field: 'from' | 'to',
        value: string
    ) => {
        if (type === 'input') {
            const updated = inputMappings.map(m => (m.id === id ? { ...m, [field]: value } : m));
            setInputMappings(updated);
            save({ inputMappings: updated });
        } else {
            const updated = outputMappings.map(m => (m.id === id ? { ...m, [field]: value } : m));
            setOutputMappings(updated);
            save({ outputMappings: updated });
        }
    };

    const sectionClass = 'flex flex-col gap-y-3 pb-4 border-b border-gray-200 dark:border-gray-700';
    const labelClass = 'text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide';
    const fieldLabelClass = 'text-xs text-gray-600 dark:text-gray-400';

    return (
        <div className="flex flex-col gap-y-5 overflow-y-auto h-[calc(100vh-220px)] pr-2 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {/* Protocol */}
            <div className={sectionClass}>
                <p className={labelClass}>Protocol</p>
                <div className="flex gap-x-2">
                    {PROTOCOL_OPTIONS.map(p => (
                        <button
                            key={p}
                            disabled={isReadOnly}
                            onClick={() => { setProtocol(p); save({ protocol: p }); }}
                            className={cn(
                                'flex-1 py-1.5 text-xs font-medium rounded border transition-colors',
                                protocol === p
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Endpoint URL */}
            <div className={sectionClass}>
                <p className={labelClass}>Agent Endpoint</p>
                <Input
                    label="Endpoint URL"
                    placeholder="https://agent.example.com/api/v1"
                    value={endpointUrl}
                    disabled={isReadOnly}
                    leadingIcon={<Globe size={14} />}
                    onChange={e => { setEndpointUrl(e.target.value); save({ endpointUrl: e.target.value }); }}
                />
            </div>

            {/* Authentication */}
            <div className={sectionClass}>
                <p className={labelClass}>Authentication</p>
                <div>
                    <label className={fieldLabelClass}>Auth Mode</label>
                    <select
                        disabled={isReadOnly}
                        value={authMode}
                        onChange={e => { setAuthMode(e.target.value as AuthMode); save({ authMode: e.target.value }); }}
                        className="mt-1 w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {AUTH_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                {authMode === 'Bearer Token' && (
                    <Input
                        label="Bearer Token"
                        placeholder="eyJhbGciOiJIUzI1NiIs..."
                        value={bearerToken}
                        disabled={isReadOnly}
                        leadingIcon={<Key size={14} />}
                        onChange={e => { setBearerToken(e.target.value); save({ bearerToken: e.target.value }); }}
                    />
                )}
                {authMode === 'API Key' && (
                    <div className="flex flex-col gap-y-2">
                        <Input
                            label="Header Name"
                            placeholder="X-API-Key"
                            value={apiKeyHeader}
                            disabled={isReadOnly}
                            leadingIcon={<Lock size={14} />}
                            onChange={e => { setApiKeyHeader(e.target.value); save({ apiKeyHeader: e.target.value }); }}
                        />
                        <Input
                            label="API Key Value"
                            placeholder="sk-..."
                            value={apiKey}
                            disabled={isReadOnly}
                            leadingIcon={<Key size={14} />}
                            onChange={e => { setApiKey(e.target.value); save({ apiKey: e.target.value }); }}
                        />
                    </div>
                )}
            </div>

            {/* Execution Mode */}
            <div className={sectionClass}>
                <p className={labelClass}>Execution Mode</p>
                <div className="flex flex-col gap-y-2">
                    {EXEC_MODES.map(mode => (
                        <label
                            key={mode}
                            className={cn(
                                'flex items-center gap-x-2 cursor-pointer p-2 rounded border transition-colors',
                                execMode === mode
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                            )}
                        >
                            <input
                                type="radio"
                                name="execMode"
                                value={mode}
                                checked={execMode === mode}
                                disabled={isReadOnly}
                                onChange={() => { setExecMode(mode); save({ execMode: mode }); }}
                                className="accent-blue-600"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{mode}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Timeout & Polling */}
            <div className={sectionClass}>
                <p className={labelClass}>Timing</p>
                <div className="grid grid-cols-2 gap-x-2">
                    <Input
                        label="Timeout (s)"
                        placeholder="30"
                        value={timeout}
                        disabled={isReadOnly}
                        leadingIcon={<Clock size={14} />}
                        onChange={e => { setTimeout_(e.target.value); save({ timeout: e.target.value }); }}
                    />
                    <Input
                        label="Poll Interval (s)"
                        placeholder="2"
                        value={pollingInterval}
                        disabled={isReadOnly || execMode === 'Synchronous'}
                        leadingIcon={<RefreshCw size={14} />}
                        onChange={e => { setPollingInterval(e.target.value); save({ pollingInterval: e.target.value }); }}
                    />
                </div>
            </div>

            {/* Input Variable Mapping */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <p className={labelClass}>Input Variable Mapping</p>
                    {!isReadOnly && (
                        <button
                            onClick={() => addMapping('input')}
                            className="flex items-center gap-x-1 text-xs text-blue-600 hover:text-blue-500"
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-y-1.5">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-x-1 items-center">
                        <span className={cn(fieldLabelClass, 'text-center')}>Workflow Var</span>
                        <span />
                        <span className={cn(fieldLabelClass, 'text-center')}>Agent Var</span>
                        <span />
                    </div>
                    {inputMappings.map(m => (
                        <div key={m.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-x-1 items-center">
                            <input
                                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full"
                                placeholder="var_name"
                                value={m.from}
                                disabled={isReadOnly}
                                onChange={e => updateMapping('input', m.id, 'from', e.target.value)}
                            />
                            <span className="text-gray-400 text-xs px-0.5">→</span>
                            <input
                                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full"
                                placeholder="agent_var"
                                value={m.to}
                                disabled={isReadOnly}
                                onChange={e => updateMapping('input', m.id, 'to', e.target.value)}
                            />
                            {!isReadOnly && (
                                <button onClick={() => removeMapping('input', m.id)} className="text-red-400 hover:text-red-500 p-0.5">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Output Variable Mapping */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <p className={labelClass}>Output Variable Mapping</p>
                    {!isReadOnly && (
                        <button
                            onClick={() => addMapping('output')}
                            className="flex items-center gap-x-1 text-xs text-blue-600 hover:text-blue-500"
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-y-1.5">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-x-1 items-center">
                        <span className={cn(fieldLabelClass, 'text-center')}>Agent Var</span>
                        <span />
                        <span className={cn(fieldLabelClass, 'text-center')}>Workflow Var</span>
                        <span />
                    </div>
                    {outputMappings.map(m => (
                        <div key={m.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-x-1 items-center">
                            <input
                                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full"
                                placeholder="agent_var"
                                value={m.from}
                                disabled={isReadOnly}
                                onChange={e => updateMapping('output', m.id, 'from', e.target.value)}
                            />
                            <span className="text-gray-400 text-xs px-0.5">→</span>
                            <input
                                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 w-full"
                                placeholder="var_name"
                                value={m.to}
                                disabled={isReadOnly}
                                onChange={e => updateMapping('output', m.id, 'to', e.target.value)}
                            />
                            {!isReadOnly && (
                                <button onClick={() => removeMapping('output', m.id)} className="text-red-400 hover:text-red-500 p-0.5">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Session Type */}
            <div className={sectionClass}>
                <p className={labelClass}>Session Type Override</p>
                <select
                    disabled={isReadOnly}
                    value={sessionType}
                    onChange={e => { setSessionType(e.target.value as SessionType); save({ sessionType: e.target.value }); }}
                    className="w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {SESSION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Tracing */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={labelClass}>Tracing & Observability</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            Capture span traces for this external call
                        </p>
                    </div>
                    <Switch
                        checked={tracingEnabled}
                        disabled={isReadOnly}
                        onCheckedChange={v => { setTracingEnabled(v); save({ tracingEnabled: v }); }}
                    />
                </div>
            </div>

            {/* Agent Card Preview */}
            <div className="flex flex-col gap-y-3 pb-4">
                <div className="flex items-center justify-between">
                    <p className={labelClass}>Agent Card Preview</p>
                    <button
                        onClick={() => setShowAgentCard(v => !v)}
                        className="flex items-center gap-x-1 text-xs text-blue-600 hover:text-blue-500"
                    >
                        <Eye size={12} />
                        {showAgentCard ? 'Hide' : 'Preview'}
                    </button>
                </div>
                {showAgentCard && (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Zap size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                    {endpointUrl ? new URL(endpointUrl.startsWith('http') ? endpointUrl : `https://${endpointUrl}`).hostname : 'Unnamed External Agent'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Protocol: {protocol}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="bg-white dark:bg-gray-800 rounded p-1.5">
                                <span className="text-gray-500">Auth</span>
                                <p className="text-gray-700 dark:text-gray-300 font-medium truncate">{authMode}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-1.5">
                                <span className="text-gray-500">Execution</span>
                                <p className="text-gray-700 dark:text-gray-300 font-medium truncate">
                                    {execMode === 'Synchronous' ? 'Sync' : execMode === 'Async (Wait Until Complete)' ? 'Async/Wait' : 'Fire & Forget'}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-1.5">
                                <span className="text-gray-500">Timeout</span>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">{timeout}s</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-1.5">
                                <span className="text-gray-500">Session</span>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">{sessionType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-x-1.5">
                            <div className={cn('w-1.5 h-1.5 rounded-full', tracingEnabled ? 'bg-green-500' : 'bg-gray-400')} />
                            <span className="text-xs text-gray-500">
                                Tracing {tracingEnabled ? 'enabled' : 'disabled'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
