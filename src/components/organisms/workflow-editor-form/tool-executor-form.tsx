/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
    Button,
    Input,
    Textarea,
    Label,
    Select,
    OptionModel,
} from '@/components/atoms';
import { Switch } from '@/components/atoms/switch';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { Plus, X, ArrowRight, Database, Wrench, AlertCircle, ChevronDown, ChevronUp, Link2 } from 'lucide-react';

// ============================================
// MOCK DATA - Replace with real API data later
// ============================================

interface MockTool {
    id: string;
    name: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    baseUrl: string;
    defaultHeaders: HeaderItem[];
    bodySchema: BodyField[];
    category: 'integration' | 'custom';
}

const MOCK_TOOLS: MockTool[] = [
    {
        id: 'jira-create-issue',
        name: 'Jira - Create Issue',
        description: 'Create a new issue in Jira',
        method: 'POST',
        baseUrl: 'https://api.atlassian.com/ex/jira/{{cloudId}}/rest/api/3/issue',
        defaultHeaders: [
            { id: 'h1', key: 'Content-Type', value: 'application/json' },
            { id: 'h2', key: 'Authorization', value: 'Bearer {{jira_token}}' },
        ],
        bodySchema: [
            { id: 'f1', fieldName: 'project.key', fieldType: 'string', required: true, description: 'Project key (e.g. PROJ)' },
            { id: 'f2', fieldName: 'summary', fieldType: 'string', required: true, description: 'Issue summary' },
            { id: 'f3', fieldName: 'description', fieldType: 'string', required: false, description: 'Issue description' },
            { id: 'f4', fieldName: 'issuetype.name', fieldType: 'string', required: true, description: 'Issue type (Bug, Task, Story)' },
            { id: 'f5', fieldName: 'priority.name', fieldType: 'string', required: false, description: 'Priority level' },
        ],
        category: 'integration',
    },
    {
        id: 'slack-send-message',
        name: 'Slack - Send Message',
        description: 'Send a message to a Slack channel',
        method: 'POST',
        baseUrl: 'https://slack.com/api/chat.postMessage',
        defaultHeaders: [
            { id: 'h1', key: 'Content-Type', value: 'application/json' },
            { id: 'h2', key: 'Authorization', value: 'Bearer {{slack_token}}' },
        ],
        bodySchema: [
            { id: 'f1', fieldName: 'channel', fieldType: 'string', required: true, description: 'Channel ID or name' },
            { id: 'f2', fieldName: 'text', fieldType: 'string', required: true, description: 'Message text' },
            { id: 'f3', fieldName: 'thread_ts', fieldType: 'string', required: false, description: 'Thread timestamp for replies' },
            { id: 'f4', fieldName: 'mrkdwn', fieldType: 'boolean', required: false, description: 'Enable markdown formatting' },
        ],
        category: 'integration',
    },
    {
        id: 'http-custom',
        name: 'HTTP - Custom Request',
        description: 'Make a custom HTTP request to any endpoint',
        method: 'GET',
        baseUrl: '',
        defaultHeaders: [
            { id: 'h1', key: 'Content-Type', value: 'application/json' },
        ],
        bodySchema: [],
        category: 'custom',
    },
    {
        id: 'salesforce-create-lead',
        name: 'Salesforce - Create Lead',
        description: 'Create a new lead in Salesforce',
        method: 'POST',
        baseUrl: 'https://{{instance}}.salesforce.com/services/data/v58.0/sobjects/Lead',
        defaultHeaders: [
            { id: 'h1', key: 'Content-Type', value: 'application/json' },
            { id: 'h2', key: 'Authorization', value: 'Bearer {{sf_token}}' },
        ],
        bodySchema: [
            { id: 'f1', fieldName: 'FirstName', fieldType: 'string', required: false, description: 'Lead first name' },
            { id: 'f2', fieldName: 'LastName', fieldType: 'string', required: true, description: 'Lead last name' },
            { id: 'f3', fieldName: 'Company', fieldType: 'string', required: true, description: 'Company name' },
            { id: 'f4', fieldName: 'Email', fieldType: 'string', required: false, description: 'Email address' },
            { id: 'f5', fieldName: 'Phone', fieldType: 'string', required: false, description: 'Phone number' },
        ],
        category: 'integration',
    },
];

const MOCK_WORKFLOW_VARIABLES = [
    { id: 'var1', name: 'input.user_query', type: 'string', source: 'Start Node' },
    { id: 'var2', name: 'input.user_id', type: 'string', source: 'Start Node' },
    { id: 'var3', name: 'agent_1.output.summary', type: 'string', source: 'Agent: Data Analyzer' },
    { id: 'var4', name: 'agent_1.output.category', type: 'string', source: 'Agent: Data Analyzer' },
    { id: 'var5', name: 'agent_2.output.response', type: 'string', source: 'Agent: Response Writer' },
    { id: 'var6', name: 'decision_1.output.selected_path', type: 'string', source: 'Decision Agent' },
    { id: 'var7', name: 'context.timestamp', type: 'string', source: 'System' },
    { id: 'var8', name: 'context.workflow_id', type: 'string', source: 'System' },
];

// ============================================
// TYPE DEFINITIONS
// ============================================

interface HeaderItem {
    id: string;
    key: string;
    value: string;
}

interface BodyField {
    id: string;
    fieldName: string;
    fieldType: string;
    required: boolean;
    description?: string;
}

interface BodyMapping {
    id: string;
    fieldName: string;
    mappedVariable: string;
    staticValue: string;
    useStaticValue: boolean;
}

interface OutputExtraction {
    id: string;
    variableName: string;
    jsonPath: string;
}

interface ErrorHandlingConfig {
    continueOnError: boolean;
    timeoutMs: number;
    retryCount: number;
    retryDelayMs: number;
}

export interface ToolExecutorConfig {
    name?: string;
    description?: string;
    selectedToolId?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url?: string;
    headers?: HeaderItem[];
    bodyMappings?: BodyMapping[];
    outputVariableName?: string;
    outputExtractions?: OutputExtraction[];
    errorHandling?: ErrorHandlingConfig;
    lineageEnabled?: boolean;
    executionStatus?: 'idle' | 'running' | 'success' | 'error';
}

interface ToolExecutorFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Collapsible Section Component
const CollapsibleSection: React.FC<{
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    badge?: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</span>
                    {badge}
                </div>
                {isOpen ? (
                    <ChevronUp size={16} className="text-gray-500" />
                ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                )}
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};

// Key-Value Editor Component
const KeyValueEditor: React.FC<{
    items: HeaderItem[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: 'key' | 'value', newValue: string) => void;
    disabled?: boolean;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
}> = ({ items, onAdd, onRemove, onUpdate, disabled, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }) => {
    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start">
                    <Input
                        placeholder={keyPlaceholder}
                        value={item.key}
                        onChange={(e) => onUpdate(item.id, 'key', e.target.value)}
                        disabled={disabled}
                        className="flex-1"
                    />
                    <Input
                        placeholder={valuePlaceholder}
                        value={item.value}
                        onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
                        disabled={disabled}
                        className="flex-1"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id)}
                        disabled={disabled}
                        className="shrink-0"
                    >
                        <X size={16} />
                    </Button>
                </div>
            ))}
            <Button size="sm" variant="secondary" onClick={onAdd} disabled={disabled}>
                <Plus size={14} className="mr-1" />
                Add Header
            </Button>
        </div>
    );
};

// Body Mapping Component - Visual mapper for request body fields
const BodyMappingEditor: React.FC<{
    bodySchema: BodyField[];
    mappings: BodyMapping[];
    workflowVariables: typeof MOCK_WORKFLOW_VARIABLES;
    onUpdateMapping: (fieldName: string, mappedVariable: string, staticValue: string, useStaticValue: boolean) => void;
    disabled?: boolean;
}> = ({ bodySchema, mappings, workflowVariables, onUpdateMapping, disabled }) => {
    const getMapping = (fieldName: string): BodyMapping | undefined => {
        return mappings.find((m) => m.fieldName === fieldName);
    };

    const variableOptions: OptionModel[] = [
        { name: 'Select variable...', value: '' },
        ...workflowVariables.map((v) => ({
            name: `${v.name} (${v.source})`,
            value: v.name,
        })),
    ];

    if (bodySchema.length === 0) {
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                No body fields defined for this tool. Add custom fields below or select a different tool.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
                <span>Request Field</span>
                <span className="w-8" />
                <span>Mapped Value</span>
            </div>

            {/* Mapping rows */}
            {bodySchema.map((field) => {
                const mapping = getMapping(field.fieldName);
                const useStatic = mapping?.useStaticValue ?? false;

                return (
                    <div
                        key={field.id}
                        className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        {/* Field info (left side) */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{field.fieldName}</code>
                                {field.required && (
                                    <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                                        Required
                                    </span>
                                )}
                            </div>
                            {field.description && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">{field.description}</span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500">Type: {field.fieldType}</span>
                        </div>

                        {/* Arrow connector */}
                        <div className="flex items-center justify-center w-8">
                            <ArrowRight size={16} className="text-gray-400" />
                        </div>

                        {/* Value mapping (right side) */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useStatic}
                                        onChange={(e) =>
                                            onUpdateMapping(
                                                field.fieldName,
                                                mapping?.mappedVariable ?? '',
                                                mapping?.staticValue ?? '',
                                                e.target.checked
                                            )
                                        }
                                        disabled={disabled}
                                        className="rounded border-gray-300"
                                    />
                                    Static value
                                </label>
                            </div>

                            {useStatic ? (
                                <Input
                                    placeholder="Enter static value..."
                                    value={mapping?.staticValue ?? ''}
                                    onChange={(e) =>
                                        onUpdateMapping(field.fieldName, mapping?.mappedVariable ?? '', e.target.value, true)
                                    }
                                    disabled={disabled}
                                />
                            ) : (
                                <Select
                                    options={variableOptions}
                                    value={mapping?.mappedVariable ?? ''}
                                    onChange={(e) =>
                                        onUpdateMapping(
                                            field.fieldName,
                                            e.target.value,
                                            mapping?.staticValue ?? '',
                                            false
                                        )
                                    }
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Output Extraction Editor Component
const OutputExtractionEditor: React.FC<{
    extractions: OutputExtraction[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: 'variableName' | 'jsonPath', value: string) => void;
    disabled?: boolean;
}> = ({ extractions, onAdd, onRemove, onUpdate, disabled }) => {
    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Extract specific fields from the API response using JSONPath expressions.
            </p>

            {extractions.map((extraction) => (
                <div key={extraction.id} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 space-y-2">
                        <Input
                            label="Variable Name"
                            placeholder="e.g. issue_id"
                            value={extraction.variableName}
                            onChange={(e) => onUpdate(extraction.id, 'variableName', e.target.value)}
                            disabled={disabled}
                        />
                        <Input
                            label="JSONPath Expression"
                            placeholder="e.g. $.data.id or $.response[0].name"
                            value={extraction.jsonPath}
                            onChange={(e) => onUpdate(extraction.id, 'jsonPath', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(extraction.id)}
                        disabled={disabled}
                        className="shrink-0 mt-6"
                    >
                        <X size={16} />
                    </Button>
                </div>
            ))}

            <Button size="sm" variant="secondary" onClick={onAdd} disabled={disabled}>
                <Plus size={14} className="mr-1" />
                Add Extraction
            </Button>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ToolExecutorForm = ({
    selectedNode,
    isReadOnly,
}: ToolExecutorFormProps) => {
    // Form state
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedToolId, setSelectedToolId] = useState<string>('');
    const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
    const [url, setUrl] = useState<string>('');
    const [headers, setHeaders] = useState<HeaderItem[]>([]);
    const [bodyMappings, setBodyMappings] = useState<BodyMapping[]>([]);
    const [outputVariableName, setOutputVariableName] = useState<string>('');
    const [outputExtractions, setOutputExtractions] = useState<OutputExtraction[]>([]);
    const [errorHandling, setErrorHandling] = useState<ErrorHandlingConfig>({
        continueOnError: false,
        timeoutMs: 30000,
        retryCount: 0,
        retryDelayMs: 1000,
    });
    const [lineageEnabled, setLineageEnabled] = useState<boolean>(true);

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get selected tool
    const selectedTool = useMemo(() => {
        return MOCK_TOOLS.find((t) => t.id === selectedToolId);
    }, [selectedToolId]);

    // Tool options for dropdown
    const toolOptions: OptionModel[] = useMemo(() => {
        return [
            { name: 'Select a tool...', value: '' },
            ...MOCK_TOOLS.map((tool) => ({
                name: tool.name,
                value: tool.id,
            })),
        ];
    }, []);

    // Method options
    const methodOptions: OptionModel[] = [
        { name: 'GET', value: 'GET' },
        { name: 'POST', value: 'POST' },
        { name: 'PUT', value: 'PUT' },
        { name: 'DELETE', value: 'DELETE' },
        { name: 'PATCH', value: 'PATCH' },
    ];

    // Initialize form with node data
    const initFormData = useCallback(() => {
        const data = selectedNode?.data as ToolExecutorConfig;

        setName(data?.name ?? '');
        setDescription(data?.description ?? '');
        setSelectedToolId(data?.selectedToolId ?? '');
        setMethod(data?.method ?? 'GET');
        setUrl(data?.url ?? '');
        setHeaders(data?.headers ?? [{ id: generateId(), key: 'Content-Type', value: 'application/json' }]);
        setBodyMappings(data?.bodyMappings ?? []);
        setOutputVariableName(data?.outputVariableName ?? '');
        setOutputExtractions(data?.outputExtractions ?? []);
        setErrorHandling(data?.errorHandling ?? {
            continueOnError: false,
            timeoutMs: 30000,
            retryCount: 0,
            retryDelayMs: 1000,
        });
        setLineageEnabled(data?.lineageEnabled ?? true);
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    // Handle tool selection change - auto-populate fields
    const handleToolChange = (toolId: string) => {
        setSelectedToolId(toolId);
        const tool = MOCK_TOOLS.find((t) => t.id === toolId);

        if (tool) {
            setMethod(tool.method);
            setUrl(tool.baseUrl);
            setHeaders(tool.defaultHeaders.map((h) => ({ ...h, id: generateId() })));

            // Initialize body mappings for the tool's schema
            const newMappings: BodyMapping[] = tool.bodySchema.map((field) => ({
                id: generateId(),
                fieldName: field.fieldName,
                mappedVariable: '',
                staticValue: '',
                useStaticValue: false,
            }));
            setBodyMappings(newMappings);

            // Set default output variable name
            if (!outputVariableName) {
                setOutputVariableName(`${tool.id.replace(/-/g, '_')}_response`);
            }
        }
    };

    // Header handlers
    const handleAddHeader = () => {
        setHeaders((prev) => [...prev, { id: generateId(), key: '', value: '' }]);
    };

    const handleRemoveHeader = (id: string) => {
        setHeaders((prev) => prev.filter((h) => h.id !== id));
    };

    const handleUpdateHeader = (id: string, field: 'key' | 'value', value: string) => {
        setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
    };

    // Body mapping handler
    const handleUpdateBodyMapping = (
        fieldName: string,
        mappedVariable: string,
        staticValue: string,
        useStaticValue: boolean
    ) => {
        setBodyMappings((prev) => {
            const existing = prev.find((m) => m.fieldName === fieldName);
            if (existing) {
                return prev.map((m) =>
                    m.fieldName === fieldName ? { ...m, mappedVariable, staticValue, useStaticValue } : m
                );
            }
            return [...prev, { id: generateId(), fieldName, mappedVariable, staticValue, useStaticValue }];
        });
    };

    // Output extraction handlers
    const handleAddExtraction = () => {
        setOutputExtractions((prev) => [...prev, { id: generateId(), variableName: '', jsonPath: '' }]);
    };

    const handleRemoveExtraction = (id: string) => {
        setOutputExtractions((prev) => prev.filter((e) => e.id !== id));
    };

    const handleUpdateExtraction = (id: string, field: 'variableName' | 'jsonPath', value: string) => {
        setOutputExtractions((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // Construct node data for saving
    const constructNodeData = useCallback((): ToolExecutorConfig => ({
        name,
        description,
        selectedToolId,
        method,
        url,
        headers,
        bodyMappings,
        outputVariableName,
        outputExtractions,
        errorHandling,
        lineageEnabled,
    }), [
        name,
        description,
        selectedToolId,
        method,
        url,
        headers,
        bodyMappings,
        outputVariableName,
        outputExtractions,
        errorHandling,
        lineageEnabled,
    ]);

    // Save handler
    const handleSaveNodeData = () => {
        if (!name.trim()) {
            toast.error('Please enter a name for the tool executor');
            return;
        }
        if (!selectedToolId && !url.trim()) {
            toast.error('Please select a tool or enter a URL');
            return;
        }

        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('Tool Executor configuration saved');
        setTrigger((trigger ?? 0) + 1);
    };

    const isCustomTool = selectedToolId === 'http-custom' || !selectedToolId;

    return (
        <div className="group">
            <div
                className={cn(
                    'tool-executor-form pr-1 flex flex-col gap-y-4 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700'
                )}
            >
                {/* Basic Information Section */}
                <CollapsibleSection
                    title="Basic Information"
                    icon={<Wrench size={16} className="text-cyan-600" />}
                    defaultOpen={true}
                >
                    <Input
                        label="Name"
                        placeholder="Name of the tool executor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isReadOnly}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Describe what this tool executor does"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isReadOnly}
                    />
                </CollapsibleSection>

                {/* Tool Selection Section */}
                <CollapsibleSection
                    title="Tool Selection"
                    icon={<Database size={16} className="text-cyan-600" />}
                    defaultOpen={true}
                >
                    <Select
                        label="Select Tool"
                        options={toolOptions}
                        value={selectedToolId}
                        onChange={(e) => handleToolChange(e.target.value)}
                        disabled={isReadOnly}
                        helperInfo="Choose a pre-configured tool or use HTTP Custom Request for custom APIs"
                    />

                    {selectedTool && (
                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                            <p className="text-sm text-cyan-700 dark:text-cyan-300">{selectedTool.description}</p>
                        </div>
                    )}
                </CollapsibleSection>

                {/* Method & URL Section */}
                <CollapsibleSection
                    title="Method & URL"
                    icon={<Link2 size={16} className="text-cyan-600" />}
                    defaultOpen={true}
                >
                    <div className="flex gap-3">
                        <div className="w-32">
                            <Select
                                label="Method"
                                options={methodOptions}
                                value={method}
                                onChange={(e) => setMethod(e.target.value as any)}
                                disabled={isReadOnly || (!isCustomTool && selectedToolId !== '')}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="URL"
                                placeholder="https://api.example.com/endpoint"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isReadOnly || (!isCustomTool && selectedToolId !== '')}
                                helperInfo="Use {{variable}} syntax for dynamic values"
                            />
                        </div>
                    </div>
                    {!isCustomTool && selectedToolId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Method and URL are pre-configured for this tool. Select &quot;HTTP - Custom Request&quot; to customize.
                        </p>
                    )}
                </CollapsibleSection>

                {/* Headers Section */}
                <CollapsibleSection
                    title="Request Headers"
                    icon={<span className="text-xs font-mono text-cyan-600">H</span>}
                    defaultOpen={false}
                    badge={
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            {headers.length}
                        </span>
                    }
                >
                    <KeyValueEditor
                        items={headers}
                        onAdd={handleAddHeader}
                        onRemove={handleRemoveHeader}
                        onUpdate={handleUpdateHeader}
                        disabled={isReadOnly}
                        keyPlaceholder="Header name"
                        valuePlaceholder="Header value"
                    />
                </CollapsibleSection>

                {/* Request Body Mapping Section */}
                {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                    <CollapsibleSection
                        title="Request Body Mapping"
                        icon={<ArrowRight size={16} className="text-cyan-600" />}
                        defaultOpen={true}
                        badge={
                            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded">
                                Map variables
                            </span>
                        }
                    >
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Map workflow variables from upstream nodes to request body fields. Variables can be selected from the dropdown or you can enter static values.
                            </p>
                        </div>
                        <BodyMappingEditor
                            bodySchema={selectedTool?.bodySchema ?? []}
                            mappings={bodyMappings}
                            workflowVariables={MOCK_WORKFLOW_VARIABLES}
                            onUpdateMapping={handleUpdateBodyMapping}
                            disabled={isReadOnly}
                        />
                    </CollapsibleSection>
                )}

                {/* Output Configuration Section */}
                <CollapsibleSection
                    title="Output Configuration"
                    icon={<Database size={16} className="text-cyan-600" />}
                    defaultOpen={true}
                >
                    <Input
                        label="Output Variable Name"
                        placeholder="e.g. api_response"
                        value={outputVariableName}
                        onChange={(e) => setOutputVariableName(e.target.value)}
                        disabled={isReadOnly}
                        helperInfo="This variable will contain the full API response and be available to downstream nodes"
                    />

                    <div className="pt-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 block">
                            Field Extractions (Optional)
                        </Label>
                        <OutputExtractionEditor
                            extractions={outputExtractions}
                            onAdd={handleAddExtraction}
                            onRemove={handleRemoveExtraction}
                            onUpdate={handleUpdateExtraction}
                            disabled={isReadOnly}
                        />
                    </div>
                </CollapsibleSection>

                {/* Error Handling Section */}
                <CollapsibleSection
                    title="Error Handling"
                    icon={<AlertCircle size={16} className="text-cyan-600" />}
                    defaultOpen={false}
                >
                    <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Continue on Error
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                If enabled, workflow continues even if this tool fails
                            </p>
                        </div>
                        <Switch
                            checked={errorHandling.continueOnError}
                            onCheckedChange={(checked) =>
                                setErrorHandling((prev) => ({ ...prev, continueOnError: checked }))
                            }
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Input
                            label="Timeout (ms)"
                            type="number"
                            placeholder="30000"
                            value={errorHandling.timeoutMs.toString()}
                            onChange={(e) =>
                                setErrorHandling((prev) => ({ ...prev, timeoutMs: parseInt(e.target.value) || 30000 }))
                            }
                            disabled={isReadOnly}
                        />
                        <Input
                            label="Retry Count"
                            type="number"
                            placeholder="0"
                            value={errorHandling.retryCount.toString()}
                            onChange={(e) =>
                                setErrorHandling((prev) => ({ ...prev, retryCount: parseInt(e.target.value) || 0 }))
                            }
                            disabled={isReadOnly}
                        />
                    </div>

                    {errorHandling.retryCount > 0 && (
                        <Input
                            label="Retry Delay (ms)"
                            type="number"
                            placeholder="1000"
                            value={errorHandling.retryDelayMs.toString()}
                            onChange={(e) =>
                                setErrorHandling((prev) => ({ ...prev, retryDelayMs: parseInt(e.target.value) || 1000 }))
                            }
                            disabled={isReadOnly}
                        />
                    )}
                </CollapsibleSection>

                {/* Data Lineage Section */}
                <CollapsibleSection
                    title="Data Lineage"
                    icon={<Link2 size={16} className="text-cyan-600" />}
                    defaultOpen={false}
                >
                    <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Enable Lineage Tracking
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Record input/output data flow for audit and debugging
                            </p>
                        </div>
                        <Switch
                            checked={lineageEnabled}
                            onCheckedChange={setLineageEnabled}
                            disabled={isReadOnly}
                        />
                    </div>
                </CollapsibleSection>

                {/* Form Actions */}
                <div className="tool-executor-form-footer flex gap-x-3 justify-end py-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData} disabled={isReadOnly}>
                        Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    );
};
