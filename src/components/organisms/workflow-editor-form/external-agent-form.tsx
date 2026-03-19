/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Button, Input, Label, Select, Switch } from '@/components/atoms';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

type ProtocolType = 'a2a' | 'acp';
type AuthMode = 'none' | 'bearer' | 'apikey';
type ExecutionMode = 'sync' | 'async_wait' | 'async_fire_forget';
type SessionOverride = 'none' | 'single' | 'per_workflow' | 'per_execution';

interface VariableMapping {
    id: string;
    sourceVar: string;
    targetVar: string;
}

export type ExternalAgentNodeData = {
    name?: string;
    protocol?: ProtocolType;
    endpointUrl?: string;
    authMode?: AuthMode;
    bearerToken?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    executionMode?: ExecutionMode;
    timeoutMs?: number;
    pollingIntervalMs?: number;
    inputMapping?: VariableMapping[];
    outputMapping?: VariableMapping[];
    sessionOverride?: SessionOverride;
    tracingEnabled?: boolean;
};

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

interface MappingInputProps {
    label: string;
    description?: string;
    items: VariableMapping[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: 'sourceVar' | 'targetVar', value: string) => void;
    disabled?: boolean;
    sourcePlaceholder?: string;
    targetPlaceholder?: string;
}

const MappingInput: React.FC<MappingInputProps> = ({
    label,
    description,
    items,
    onAdd,
    onRemove,
    onUpdate,
    disabled = false,
    sourcePlaceholder = 'Source variable',
    targetPlaceholder = 'Target variable',
}) => {
    return (
        <div className="flex flex-col items-start gap-y-[6px] w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">{label}</Label>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
            )}

            {items.map((item) => (
                <div
                    key={item.id}
                    className="w-full flex flex-col sm:flex-row gap-2 mb-2"
                >
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                            placeholder={sourcePlaceholder}
                            value={item.sourceVar}
                            onChange={(e) => onUpdate(item.id, 'sourceVar', e.target.value)}
                            disabled={disabled}
                        />
                        <Input
                            placeholder={targetPlaceholder}
                            value={item.targetVar}
                            onChange={(e) => onUpdate(item.id, 'targetVar', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div className="mt-1.5">
                        <Button
                            className="w-full sm:w-max"
                            disabled={disabled}
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(item.id)}
                        >
                            <X />
                        </Button>
                    </div>
                </div>
            ))}

            <div className="mb-2">
                <Button size="sm" disabled={disabled} onClick={onAdd}>
                    <span className="flex gap-2">
                        <Plus /> Add
                    </span>
                </Button>
            </div>
        </div>
    );
};

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    const [name, setName] = useState('');
    const [protocol, setProtocol] = useState<ProtocolType>('a2a');
    const [endpointUrl, setEndpointUrl] = useState('');
    const [authMode, setAuthMode] = useState<AuthMode>('none');
    const [bearerToken, setBearerToken] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('sync');
    const [timeoutMs, setTimeoutMs] = useState<number>(30000);
    const [pollingIntervalMs, setPollingIntervalMs] = useState<number>(5000);
    const [inputMapping, setInputMapping] = useState<VariableMapping[]>([]);
    const [outputMapping, setOutputMapping] = useState<VariableMapping[]>([]);
    const [sessionOverride, setSessionOverride] = useState<SessionOverride>('none');
    const [tracingEnabled, setTracingEnabled] = useState(false);

    const generateId = () => `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const initFormData = useCallback(() => {
        const data = selectedNode?.data as ExternalAgentNodeData;
        setName(data?.name ?? '');
        setProtocol(data?.protocol ?? 'a2a');
        setEndpointUrl(data?.endpointUrl ?? '');
        setAuthMode(data?.authMode ?? 'none');
        setBearerToken(data?.bearerToken ?? '');
        setApiKey(data?.apiKey ?? '');
        setApiKeyHeader(data?.apiKeyHeader ?? 'X-API-Key');
        setExecutionMode(data?.executionMode ?? 'sync');
        setTimeoutMs(data?.timeoutMs ?? 30000);
        setPollingIntervalMs(data?.pollingIntervalMs ?? 5000);
        setInputMapping(data?.inputMapping ?? []);
        setOutputMapping(data?.outputMapping ?? []);
        setSessionOverride(data?.sessionOverride ?? 'none');
        setTracingEnabled(data?.tracingEnabled ?? false);
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    const constructNodeData = useCallback(() => ({
        name,
        protocol,
        endpointUrl,
        authMode,
        ...(authMode === 'bearer' ? { bearerToken } : {}),
        ...(authMode === 'apikey' ? { apiKey, apiKeyHeader } : {}),
        executionMode,
        ...(executionMode !== 'async_fire_forget' ? { timeoutMs } : {}),
        ...(executionMode === 'async_wait' ? { pollingIntervalMs } : {}),
        inputMapping: inputMapping.length > 0 ? inputMapping : undefined,
        outputMapping: outputMapping.length > 0 ? outputMapping : undefined,
        sessionOverride,
        tracingEnabled,
    }), [
        name, protocol, endpointUrl, authMode, bearerToken, apiKey, apiKeyHeader,
        executionMode, timeoutMs, pollingIntervalMs, inputMapping, outputMapping,
        sessionOverride, tracingEnabled,
    ]);

    const handleSaveNodeData = () => {
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('External Agent updated');
        setTrigger((trigger ?? 0) + 1);
    };

    // Input mapping handlers
    const handleAddInput = () => setInputMapping(prev => [...prev, { id: generateId(), sourceVar: '', targetVar: '' }]);
    const handleRemoveInput = (id: string) => setInputMapping(prev => prev.filter(i => i.id !== id));
    const handleUpdateInput = (id: string, field: 'sourceVar' | 'targetVar', value: string) =>
        setInputMapping(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));

    // Output mapping handlers
    const handleAddOutput = () => setOutputMapping(prev => [...prev, { id: generateId(), sourceVar: '', targetVar: '' }]);
    const handleRemoveOutput = (id: string) => setOutputMapping(prev => prev.filter(i => i.id !== id));
    const handleUpdateOutput = (id: string, field: 'sourceVar' | 'targetVar', value: string) =>
        setOutputMapping(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));

    const showTimeout = executionMode === 'sync' || executionMode === 'async_wait';
    const showPolling = executionMode === 'async_wait';

    return (
        <div className="group">
            <div
                className={cn(
                    'external-agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700'
                )}
            >
                {/* Name */}
                <div className="flex flex-col gap-y-5 pb-4 bottom-gradient-border">
                    <Input
                        label="Name"
                        placeholder="Name of the external agent"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Protocol Selection */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Protocol</Label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setProtocol('a2a')}
                            className={cn(
                                'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                                protocol === 'a2a'
                                    ? 'bg-[#0DA2E7] text-white border-[#0DA2E7]'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
                                isReadOnly && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            A2A
                        </button>
                        <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setProtocol('acp')}
                            className={cn(
                                'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                                protocol === 'acp'
                                    ? 'bg-[#0DA2E7] text-white border-[#0DA2E7]'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
                                isReadOnly && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            ACP
                        </button>
                    </div>
                </div>

                {/* Endpoint URL */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Input
                        label="Agent Endpoint URL"
                        placeholder="https://agent.example.com/api"
                        value={endpointUrl}
                        onChange={e => setEndpointUrl(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Authentication */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Select
                        label="Authentication"
                        placeholder="Select authentication mode"
                        options={[
                            { name: 'None', value: 'none' },
                            { name: 'Bearer Token', value: 'bearer' },
                            { name: 'API Key', value: 'apikey' },
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
                </div>

                {/* Execution Mode */}
                <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Execution Mode</Label>
                    <div className="flex flex-col gap-y-2">
                        {([
                            { value: 'sync', label: 'Synchronous' },
                            { value: 'async_wait', label: 'Async (Wait Until Complete)' },
                            { value: 'async_fire_forget', label: 'Async (Fire and Forget)' },
                        ] as const).map(option => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex items-center gap-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
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
                                    className="accent-[#0DA2E7]"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
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

                {/* Input Variable Mapping */}
                <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                    <div className="flex flex-col gap-y-1">
                        <p className="text-md font-medium text-gray-700 dark:text-gray-100">Input Mapping</p>
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                            Map workflow variables to agent input variables
                        </p>
                    </div>
                    <MappingInput
                        label="Input Variables"
                        items={inputMapping}
                        onAdd={handleAddInput}
                        onRemove={handleRemoveInput}
                        onUpdate={handleUpdateInput}
                        disabled={isReadOnly}
                        sourcePlaceholder="workflow_var"
                        targetPlaceholder="agent_var"
                    />
                </div>

                {/* Output Variable Mapping */}
                <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                    <div className="flex flex-col gap-y-1">
                        <p className="text-md font-medium text-gray-700 dark:text-gray-100">Output Mapping</p>
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                            Map agent output variables back to workflow variables
                        </p>
                    </div>
                    <MappingInput
                        label="Output Variables"
                        items={outputMapping}
                        onAdd={handleAddOutput}
                        onRemove={handleRemoveOutput}
                        onUpdate={handleUpdateOutput}
                        disabled={isReadOnly}
                        sourcePlaceholder="agent_var"
                        targetPlaceholder="workflow_var"
                    />
                </div>

                {/* Session Override */}
                <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                    <Select
                        label="Session Type Override"
                        placeholder="Select session type"
                        options={[
                            { name: 'None', value: 'none' },
                            { name: 'Single', value: 'single' },
                            { name: 'Per-Workflow', value: 'per_workflow' },
                            { name: 'Per-Execution', value: 'per_execution' },
                        ]}
                        value={sessionOverride}
                        onChange={e => setSessionOverride(e.target.value as SessionOverride)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Tracing & Observability */}
                <div className="flex items-center justify-between pb-4 bottom-gradient-border">
                    <div className="flex flex-col gap-y-0.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            Tracing & Observability
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable trace collection for this agent
                        </p>
                    </div>
                    <Switch
                        checked={tracingEnabled}
                        onCheckedChange={setTracingEnabled}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Form Actions */}
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
