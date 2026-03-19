'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Switch } from '@/components/atoms/switch';
import { Badge } from '@/components/atoms/badge';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Plus, Trash2, X } from 'lucide-react';
import type { VariableMapping } from '../../mock-data';

interface ConfigPanelProps {
    open: boolean;
    onClose: () => void;
}

export const ConfigPanel = ({ open, onClose }: ConfigPanelProps) => {
    const [protocol, setProtocol] = useState<'a2a' | 'acp'>('a2a');
    const [endpointUrl, setEndpointUrl] = useState('https://agents.kaya.ai/a2a/customer-support');
    const [authType, setAuthType] = useState<'bearer' | 'apikey' | 'none'>('bearer');
    const [authCredential, setAuthCredential] = useState('');
    const [executionMode, setExecutionMode] = useState<'sync' | 'async-wait' | 'async-fire'>('sync');
    const [timeout, setTimeout] = useState('30000');
    const [pollingInterval, setPollingInterval] = useState('5000');
    const [sessionOverride, setSessionOverride] = useState<'none' | 'single' | 'per-workflow' | 'per-execution'>('none');
    const [tracingEnabled, setTracingEnabled] = useState(true);

    const [inputMappings, setInputMappings] = useState<VariableMapping[]>([
        { id: '1', sourceVar: 'user_query', targetVar: 'input_text' },
        { id: '2', sourceVar: 'context_data', targetVar: 'context' },
    ]);
    const [outputMappings, setOutputMappings] = useState<VariableMapping[]>([
        { id: '1', sourceVar: 'response', targetVar: 'agent_output' },
        { id: '2', sourceVar: 'artifacts', targetVar: 'agent_artifacts' },
    ]);

    const addInputMapping = () => {
        setInputMappings(prev => [...prev, { id: Date.now().toString(), sourceVar: '', targetVar: '' }]);
    };
    const removeInputMapping = (id: string) => {
        setInputMappings(prev => prev.filter(m => m.id !== id));
    };
    const addOutputMapping = () => {
        setOutputMappings(prev => [...prev, { id: Date.now().toString(), sourceVar: '', targetVar: '' }]);
    };
    const removeOutputMapping = (id: string) => {
        setOutputMappings(prev => prev.filter(m => m.id !== id));
    };

    if (!open) return null;

    return (
        <div className="w-[380px] shrink-0 border-l border-gray-700 bg-gray-800 flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-semibold text-gray-100">External Agent Config</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                    {/* Protocol Selection */}
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-2 block">Protocol</label>
                        <div className="flex rounded-lg border border-gray-600 overflow-hidden">
                            {(['a2a', 'acp'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setProtocol(p)}
                                    className={cn(
                                        'flex-1 py-2 text-xs font-medium transition-all',
                                        protocol === p
                                            ? 'bg-sky-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    )}
                                >
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Endpoint URL */}
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Agent Endpoint URL</label>
                        <input
                            type="text"
                            value={endpointUrl}
                            onChange={e => setEndpointUrl(e.target.value)}
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-100 font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Authentication */}
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Authentication</label>
                        <select
                            value={authType}
                            onChange={e => setAuthType(e.target.value as typeof authType)}
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 mb-2"
                        >
                            <option value="bearer">Bearer Token</option>
                            <option value="apikey">API Key</option>
                            <option value="none">No Auth</option>
                        </select>
                        {authType !== 'none' && (
                            <input
                                type="password"
                                value={authCredential}
                                onChange={e => setAuthCredential(e.target.value)}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-100 font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                placeholder={authType === 'bearer' ? 'Enter token...' : 'Enter API key...'}
                            />
                        )}
                    </div>

                    {/* Execution Mode */}
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-2 block">Execution Mode</label>
                        <div className="space-y-2">
                            {([
                                { value: 'sync' as const, label: 'Synchronous', desc: 'Wait for response inline' },
                                { value: 'async-wait' as const, label: 'Async (Wait Until Complete)', desc: 'Poll until done' },
                                { value: 'async-fire' as const, label: 'Async (Fire and Forget)', desc: 'Send and continue' },
                            ]).map(opt => (
                                <label
                                    key={opt.value}
                                    className={cn(
                                        'flex items-start gap-3 rounded-md border p-2.5 cursor-pointer transition-all',
                                        executionMode === opt.value
                                            ? 'border-sky-500 bg-sky-500/10'
                                            : 'border-gray-600 hover:border-gray-500'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="executionMode"
                                        checked={executionMode === opt.value}
                                        onChange={() => setExecutionMode(opt.value)}
                                        className="mt-0.5 accent-sky-500"
                                    />
                                    <div>
                                        <p className="text-xs font-medium text-gray-200">{opt.label}</p>
                                        <p className="text-[10px] text-gray-500">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Timeout & Polling */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Timeout (ms)</label>
                            <input
                                type="number"
                                value={timeout}
                                onChange={e => setTimeout(e.target.value)}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Poll Interval (ms)</label>
                            <input
                                type="number"
                                value={pollingInterval}
                                onChange={e => setPollingInterval(e.target.value)}
                                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                    </div>

                    {/* Input Variable Mapping */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-400">Input Variable Mapping</label>
                            <button onClick={addInputMapping} className="text-sky-400 hover:text-sky-300">
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-[1fr_20px_1fr_24px] gap-1 items-center">
                                <span className="text-[10px] text-gray-500 font-medium">Workflow Var</span>
                                <span />
                                <span className="text-[10px] text-gray-500 font-medium">Agent Var</span>
                                <span />
                            </div>
                            {inputMappings.map(m => (
                                <div key={m.id} className="grid grid-cols-[1fr_20px_1fr_24px] gap-1 items-center">
                                    <input
                                        value={m.sourceVar}
                                        onChange={e => setInputMappings(prev => prev.map(p => p.id === m.id ? { ...p, sourceVar: e.target.value } : p))}
                                        className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-[11px] text-gray-200 font-mono"
                                        placeholder="source"
                                    />
                                    <span className="text-center text-gray-500 text-xs">→</span>
                                    <input
                                        value={m.targetVar}
                                        onChange={e => setInputMappings(prev => prev.map(p => p.id === m.id ? { ...p, targetVar: e.target.value } : p))}
                                        className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-[11px] text-gray-200 font-mono"
                                        placeholder="target"
                                    />
                                    <button onClick={() => removeInputMapping(m.id)} className="text-gray-500 hover:text-red-400">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Output Variable Mapping */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-400">Output Variable Mapping</label>
                            <button onClick={addOutputMapping} className="text-sky-400 hover:text-sky-300">
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-[1fr_20px_1fr_24px] gap-1 items-center">
                                <span className="text-[10px] text-gray-500 font-medium">Agent Var</span>
                                <span />
                                <span className="text-[10px] text-gray-500 font-medium">Workflow Var</span>
                                <span />
                            </div>
                            {outputMappings.map(m => (
                                <div key={m.id} className="grid grid-cols-[1fr_20px_1fr_24px] gap-1 items-center">
                                    <input
                                        value={m.sourceVar}
                                        onChange={e => setOutputMappings(prev => prev.map(p => p.id === m.id ? { ...p, sourceVar: e.target.value } : p))}
                                        className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-[11px] text-gray-200 font-mono"
                                        placeholder="source"
                                    />
                                    <span className="text-center text-gray-500 text-xs">→</span>
                                    <input
                                        value={m.targetVar}
                                        onChange={e => setOutputMappings(prev => prev.map(p => p.id === m.id ? { ...p, targetVar: e.target.value } : p))}
                                        className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-[11px] text-gray-200 font-mono"
                                        placeholder="target"
                                    />
                                    <button onClick={() => removeOutputMapping(m.id)} className="text-gray-500 hover:text-red-400">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Session Type Override */}
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Session Type Override</label>
                        <select
                            value={sessionOverride}
                            onChange={e => setSessionOverride(e.target.value as typeof sessionOverride)}
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200"
                        >
                            <option value="none">None (Use Agent Default)</option>
                            <option value="single">Single</option>
                            <option value="per-workflow">Per Workflow</option>
                            <option value="per-execution">Per Execution</option>
                        </select>
                    </div>

                    {/* Tracing & Observability */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-300">Tracing & Observability</p>
                            <p className="text-[10px] text-gray-500">Capture spans and metrics</p>
                        </div>
                        <Switch checked={tracingEnabled} onCheckedChange={setTracingEnabled} />
                    </div>

                    {/* Agent Card Preview */}
                    <div className="rounded-lg border border-gray-600 bg-gray-700/50 p-3">
                        <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-medium">Connected Agent</p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
                                <Bot className="h-4 w-4 text-sky-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-200">Customer Support Agent</p>
                                <p className="text-[10px] text-gray-500 font-mono">v2.1.0 • PI Agents</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            <span className="text-[10px] text-green-400">Running</span>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
                <Button variant="secondary" size="sm">
                    Reset
                </Button>
                <Button variant="primary" size="sm">
                    Apply
                </Button>
            </div>
        </div>
    );
};
