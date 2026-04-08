'use client';

import { Input, Textarea, Select, Button, Label, Badge, Switch, Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, AuthType, IAuthScheme, A2AVisibility, IA2AAgentCard, IA2ASkill, A2AToolType, IConnectorForm, IGraphRag, IVectorRag } from '@/models';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { User, Plus, X, Key, Copy, Check, ExternalLink, Eye, Shield, Globe, Lock, FileJson, Sparkles, Zap, Database, Network, Code, Server, Tag, Info } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors, UseFormGetValues } from 'react-hook-form';
import { useState, useMemo, useCallback } from 'react';
import { Tool } from '@/models';

interface IdentitySectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    getValues: UseFormGetValues<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
    isEdit?: boolean;
    workspaceSlug?: string;
    // Tool attachments for A2A skill generation
    tools?: Tool[];
    mcpServers?: IMCPBody[];
    graphRags?: IGraphRag[];
    vectorRags?: IVectorRag[];
    connectors?: IConnectorForm[];
}

const authTypeOptions = [
    { name: 'None', value: 'none' },
    { name: 'API Key', value: 'api_key' },
    { name: 'OAuth 2.0', value: 'oauth2' },
    { name: 'Bearer Token', value: 'bearer' },
    { name: 'Basic Auth', value: 'basic' },
];

const visibilityOptions = [
    { name: 'Private (Internal Only)', value: 'private' },
    { name: 'Public (Discoverable)', value: 'public' },
];

const inputModeOptions = [
    { name: 'Plain Text', value: 'text/plain' },
    { name: 'JSON', value: 'application/json' },
    { name: 'Form Data', value: 'multipart/form-data' },
    { name: 'XML', value: 'application/xml' },
];

const outputModeOptions = [
    { name: 'JSON', value: 'application/json' },
    { name: 'Plain Text', value: 'text/plain' },
    { name: 'Streaming Text', value: 'text/event-stream' },
    { name: 'XML', value: 'application/xml' },
];

// Tool type to A2A tool type mapping
const getA2AToolType = (toolType: string): A2AToolType => {
    const mapping: Record<string, A2AToolType> = {
        'API': 'KAYA_REST_API_CONNECTOR',
        'EXECUTABLE_FUNCTION': 'KAYA_EXECUTABLE_FUNCTION',
        'MCP': 'KAYA_MCP_CONNECTOR',
        'VECTOR_RAG': 'KAYA_VECTOR_RAG',
        'GRAPH_RAG': 'KAYA_GRAPH_RAG',
        'DB_CONNECTOR': 'KAYA_DB_CONNECTOR',
    };
    return mapping[toolType] || 'KAYA_REST_API_CONNECTOR';
};

// Get icon for tool type
const getToolTypeIcon = (toolType: A2AToolType) => {
    const icons: Record<A2AToolType, typeof Server> = {
        'KAYA_REST_API_CONNECTOR': Globe,
        'KAYA_MCP_CONNECTOR': Server,
        'KAYA_VECTOR_RAG': Database,
        'KAYA_GRAPH_RAG': Network,
        'KAYA_DB_CONNECTOR': Database,
        'KAYA_EXECUTABLE_FUNCTION': Code,
    };
    return icons[toolType] || Zap;
};

// Get label for tool type
const getToolTypeLabel = (toolType: A2AToolType): string => {
    const labels: Record<A2AToolType, string> = {
        'KAYA_REST_API_CONNECTOR': 'REST API',
        'KAYA_MCP_CONNECTOR': 'MCP',
        'KAYA_VECTOR_RAG': 'Vector RAG',
        'KAYA_GRAPH_RAG': 'Graph RAG',
        'KAYA_DB_CONNECTOR': 'Database',
        'KAYA_EXECUTABLE_FUNCTION': 'Function',
    };
    return labels[toolType] || 'Tool';
};

export const IdentitySection = ({ 
    control, 
    watch, 
    setValue, 
    getValues,
    errors, 
    isReadOnly, 
    isEdit,
    workspaceSlug = 'default-workspace',
    tools = [],
    mcpServers = [],
    graphRags = [],
    vectorRags = [],
    connectors = [],
}: IdentitySectionProps) => {
    const [newAuthType, setNewAuthType] = useState<AuthType>('api_key');
    const [copiedUri, setCopiedUri] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [showA2ACardModal, setShowA2ACardModal] = useState(false);

    const authSchemes = watch('horizonConfig.identity.authSchemes') || [];
    const a2aEnabled = watch('horizonConfig.identity.a2aEnabled') ?? true;
    const a2aVisibility = watch('horizonConfig.identity.a2aVisibility') || 'private';
    const displayName = watch('horizonConfig.identity.displayName') || '';
    const version = watch('horizonConfig.identity.version') || '1.0.0';
    const description = watch('horizonConfig.identity.description') || '';
    const agentName = watch('agentName') || '';
    const defaultInputModes = watch('horizonConfig.identity.defaultInputModes') || ['text/plain', 'application/json'];
    const defaultOutputModes = watch('horizonConfig.identity.defaultOutputModes') || ['application/json', 'text/plain'];

    // Generate A2A URI
    const agentSlug = useMemo(() => {
        const name = displayName || agentName;
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }, [displayName, agentName]);

    const a2aUri = useMemo(() => {
        return `agent://kaya/${workspaceSlug}/${agentSlug}-${version}`;
    }, [workspaceSlug, agentSlug, version]);

    // Count tool types for skill summary
    const toolTypeCounts = useMemo(() => {
        const counts: Record<A2AToolType, number> = {
            'KAYA_REST_API_CONNECTOR': 0,
            'KAYA_MCP_CONNECTOR': 0,
            'KAYA_VECTOR_RAG': 0,
            'KAYA_GRAPH_RAG': 0,
            'KAYA_DB_CONNECTOR': 0,
            'KAYA_EXECUTABLE_FUNCTION': 0,
        };

        // Count API tools
        tools.filter(t => t.type === 'API').forEach(() => counts['KAYA_REST_API_CONNECTOR']++);
        
        // Count Executable Functions
        tools.filter(t => t.type === 'EXECUTABLE_FUNCTION').forEach(() => counts['KAYA_EXECUTABLE_FUNCTION']++);
        
        // Count MCP Servers
        counts['KAYA_MCP_CONNECTOR'] = mcpServers.length;
        
        // Count RAGs
        counts['KAYA_VECTOR_RAG'] = vectorRags.length;
        counts['KAYA_GRAPH_RAG'] = graphRags.length;
        
        // Count Connectors (DB)
        counts['KAYA_DB_CONNECTOR'] = connectors.length;

        return counts;
    }, [tools, mcpServers, graphRags, vectorRags, connectors]);

    const totalSkills = useMemo(() => 
        Object.values(toolTypeCounts).reduce((sum, count) => sum + count, 0),
    [toolTypeCounts]);

    // Generate A2A Skills from tool attachments
    const generateA2ASkills = useCallback((): IA2ASkill[] => {
        const skills: IA2ASkill[] = [];

        // API Tools
        tools.filter(t => t.type === 'API').forEach((tool, idx) => {
            skills.push({
                id: `api-${tool.id || idx}`,
                name: `REST API Tool ${idx + 1}`,
                description: 'REST API connector skill',
                toolType: 'KAYA_REST_API_CONNECTOR',
                tags: ['rest-api', 'connector'],
            });
        });

        // Executable Functions
        tools.filter(t => t.type === 'EXECUTABLE_FUNCTION').forEach((tool, idx) => {
            skills.push({
                id: `func-${tool.id || idx}`,
                name: `Executable Function ${idx + 1}`,
                description: 'Executable function skill',
                toolType: 'KAYA_EXECUTABLE_FUNCTION',
                tags: ['function', 'executable'],
                inputModes: ['application/json'],
                outputModes: ['application/json'],
            });
        });

        // MCP Servers
        mcpServers.forEach((mcp, idx) => {
            skills.push({
                id: `mcp-${mcp.id || idx}`,
                name: mcp.name || `MCP Server ${idx + 1}`,
                description: mcp.description || 'MCP connector skill',
                toolType: 'KAYA_MCP_CONNECTOR',
                tags: ['mcp', 'connector'],
            });
        });

        // Vector RAGs
        vectorRags.forEach((rag, idx) => {
            skills.push({
                id: `vrag-${rag.id || idx}`,
                name: rag.name || `Vector RAG ${idx + 1}`,
                description: rag.description || 'Vector RAG knowledge retrieval',
                toolType: 'KAYA_VECTOR_RAG',
                tags: ['vector-rag', 'knowledge-base'],
            });
        });

        // Graph RAGs
        graphRags.forEach((rag, idx) => {
            skills.push({
                id: `grag-${rag.id || idx}`,
                name: rag.name || `Graph RAG ${idx + 1}`,
                description: rag.description || 'Graph RAG reasoning',
                toolType: 'KAYA_GRAPH_RAG',
                tags: ['graph-rag', 'knowledge-graph'],
            });
        });

        // Connectors (DB)
        connectors.forEach((conn, idx) => {
            skills.push({
                id: `db-${conn.id || idx}`,
                name: conn.name || `Database Connector ${idx + 1}`,
                description: conn.description || 'Database connector skill',
                toolType: 'KAYA_DB_CONNECTOR',
                tags: ['database', 'connector'],
            });
        });

        return skills;
    }, [tools, mcpServers, graphRags, vectorRags, connectors]);

    // Generate full A2A Agent Card
    const generateA2ACard = useCallback((): IA2AAgentCard => {
        const identity = getValues('horizonConfig.identity');
        const notifications = getValues('horizonConfig.notifications');
        
        const securitySchemes: Record<string, unknown> = {};
        authSchemes.forEach(scheme => {
            if (scheme.type === 'bearer') {
                securitySchemes['bearerAuth'] = { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' };
            } else if (scheme.type === 'oauth2') {
                securitySchemes['oauth2'] = { 
                    type: 'oauth2', 
                    flows: { 
                        clientCredentials: { 
                            tokenUrl: `https://kaya.techlabsglobal.com/oauth/token` 
                        } 
                    } 
                };
            } else if (scheme.type === 'api_key') {
                securitySchemes['apiKey'] = { type: 'apiKey', in: 'header', name: 'X-API-Key' };
            } else if (scheme.type === 'basic') {
                securitySchemes['basicAuth'] = { type: 'http', scheme: 'basic' };
            }
        });

        return {
            schemaVersion: '0.3',
            name: identity?.displayName || agentName || 'Unnamed Agent',
            description: identity?.description || description || '',
            url: `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/agents/${agentSlug}/a2a`,
            version: identity?.version || '1.0.0',
            provider: {
                organization: `KAYA Platform — ${workspaceSlug}`,
            },
            capabilities: {
                streaming: notifications?.streamingEnabled ?? true,
                pushNotifications: notifications?.mode === 'webhook' || notifications?.mode === 'both',
                stateTransitionHistory: true,
            },
            securitySchemes,
            defaultInputModes: identity?.defaultInputModes || ['text/plain', 'application/json'],
            defaultOutputModes: identity?.defaultOutputModes || ['application/json', 'text/plain'],
            skills: generateA2ASkills(),
        };
    }, [getValues, authSchemes, agentName, description, workspaceSlug, agentSlug, generateA2ASkills]);

    const a2aCard = useMemo(() => generateA2ACard(), [generateA2ACard]);

    const addAuthScheme = () => {
        const existing = authSchemes.find((s) => s.type === newAuthType);
        if (!existing) {
            setValue('horizonConfig.identity.authSchemes', [...authSchemes, { type: newAuthType, config: {} }]);
        }
    };

    const removeAuthScheme = (type: AuthType) => {
        setValue(
            'horizonConfig.identity.authSchemes',
            authSchemes.filter((s) => s.type !== type)
        );
    };

    const getAuthLabel = (type: AuthType): string => {
        const option = authTypeOptions.find((o) => o.value === type);
        return option?.name || type;
    };

    const copyToClipboard = async (text: string, type: 'uri' | 'json') => {
        await navigator.clipboard.writeText(text);
        if (type === 'uri') {
            setCopiedUri(true);
            setTimeout(() => setCopiedUri(false), 2000);
        } else {
            setCopiedJson(true);
            setTimeout(() => setCopiedJson(false), 2000);
        }
    };

    const toggleInputMode = (mode: string) => {
        const current = defaultInputModes || [];
        if (current.includes(mode)) {
            setValue('horizonConfig.identity.defaultInputModes', current.filter(m => m !== mode));
        } else {
            setValue('horizonConfig.identity.defaultInputModes', [...current, mode]);
        }
    };

    const toggleOutputMode = (mode: string) => {
        const current = defaultOutputModes || [];
        if (current.includes(mode)) {
            setValue('horizonConfig.identity.defaultOutputModes', current.filter(m => m !== mode));
        } else {
            setValue('horizonConfig.identity.defaultOutputModes', [...current, mode]);
        }
    };

    const wellKnownUrl = `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/agents/${agentSlug}/.well-known/agent-card.json`;

    return (
        <>
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                {/* Section Header */}
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <User size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Identity Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Define the agent&apos;s A2A identity, versioning, and authentication for external discovery.
                    </p>
                </div>

                {/* A2A Identity Section - Contains ALL Identity Configurations */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    {/* A2A Header with Toggle */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">A2A Identity</p>
                                    {a2aEnabled && (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                            <Check size={10} className="mr-1" />
                                            A2A Enabled
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Agent-to-Agent protocol identity for external discovery
                                </p>
                            </div>
                        </div>
                        <Controller
                            name="horizonConfig.identity.a2aEnabled"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    checked={field.value ?? true}
                                    onCheckedChange={field.onChange}
                                    disabled={isReadOnly}
                                />
                            )}
                        />
                    </div>

                    {a2aEnabled && (
                        <div className="space-y-5">
                            {/* A2A URI Display */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agent URI</p>
                                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                                            {a2aUri}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(a2aUri, 'uri')}
                                        className="ml-2 shrink-0"
                                    >
                                        {copiedUri ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </Button>
                                </div>
                            </div>

                            {/* Basic Identity Fields */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <Tag size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Basic Identity</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Display Name */}
                                    <Controller
                                        name="horizonConfig.identity.displayName"
                                        control={control}
                                        rules={{ required: 'Display name is required' }}
                                        render={({ field }) => (
                                            <Input
                                                label="Display Name"
                                                placeholder="Enter display name"
                                                value={field.value || ''}
                                                disabled={isReadOnly}
                                                onChange={field.onChange}
                                                isDestructive={!!errors?.horizonConfig?.identity?.displayName}
                                                supportiveText={errors?.horizonConfig?.identity?.displayName?.message}
                                            />
                                        )}
                                    />

                                    {/* Version */}
                                    <Controller
                                        name="horizonConfig.identity.version"
                                        control={control}
                                        rules={{
                                            required: 'Version is required',
                                            pattern: {
                                                value: /^\d+\.\d+\.\d+$/,
                                                message: 'Use semantic versioning (e.g., 1.0.0)',
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                label="Version"
                                                placeholder="1.0.0"
                                                value={field.value || ''}
                                                disabled={isReadOnly}
                                                onChange={field.onChange}
                                                helperInfo="Semantic versioning (e.g., 1.0.0)"
                                                isDestructive={!!errors?.horizonConfig?.identity?.version}
                                                supportiveText={errors?.horizonConfig?.identity?.version?.message}
                                            />
                                        )}
                                    />

                                    {/* Description */}
                                    <div className="col-span-1 sm:col-span-2">
                                        <Controller
                                            name="horizonConfig.identity.description"
                                            control={control}
                                            render={({ field }) => (
                                                <Textarea
                                                    label="Description"
                                                    placeholder="Describe the agent's purpose and capabilities"
                                                    value={field.value || ''}
                                                    disabled={isReadOnly}
                                                    onChange={field.onChange}
                                                    rows={3}
                                                    className="w-full resize-none"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Visibility & Endpoint */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <Globe size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Discovery & Endpoint</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Visibility */}
                                    <Controller
                                        name="horizonConfig.identity.a2aVisibility"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Visibility</Label>
                                                <div className="flex items-center gap-x-2">
                                                    {field.value === 'public' ? (
                                                        <Globe size={16} className="text-green-500 shrink-0" />
                                                    ) : (
                                                        <Lock size={16} className="text-orange-500 shrink-0" />
                                                    )}
                                                    <Select
                                                        options={visibilityOptions}
                                                        currentValue={field.value || 'private'}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => field.onChange(e.target.value as A2AVisibility)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* Discovery Location */}
                                    <Controller
                                        name="horizonConfig.identity.discoveryLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label="Discovery Path"
                                                placeholder="/.well-known/agent.json"
                                                value={field.value || ''}
                                                disabled={isReadOnly}
                                                onChange={field.onChange}
                                                helperInfo="Agent discovery endpoint path"
                                            />
                                        )}
                                    />

                                    {/* Endpoint URL */}
                                    <div className="col-span-1 sm:col-span-2">
                                        <Controller
                                            name="horizonConfig.identity.endpointUrl"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    label="Endpoint URL"
                                                    placeholder="https://api.example.com/agent"
                                                    value={field.value || ''}
                                                    disabled={isReadOnly}
                                                    onChange={field.onChange}
                                                    helperInfo="Optional: Override default A2A endpoint"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Input/Output Modes */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <Info size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Input/Output Modes</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Default Input Modes */}
                                    <div>
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Default Input Modes</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {inputModeOptions.map((option) => (
                                                <Badge
                                                    key={option.value}
                                                    variant="secondary"
                                                    className={cn(
                                                        "cursor-pointer transition-colors text-xs",
                                                        defaultInputModes.includes(option.value)
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    )}
                                                    onClick={() => !isReadOnly && toggleInputMode(option.value)}
                                                >
                                                    {defaultInputModes.includes(option.value) && <Check size={10} className="mr-1" />}
                                                    {option.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Default Output Modes */}
                                    <div>
                                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Default Output Modes</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {outputModeOptions.map((option) => (
                                                <Badge
                                                    key={option.value}
                                                    variant="secondary"
                                                    className={cn(
                                                        "cursor-pointer transition-colors text-xs",
                                                        defaultOutputModes.includes(option.value)
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700"
                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    )}
                                                    onClick={() => !isReadOnly && toggleOutputMode(option.value)}
                                                >
                                                    {defaultOutputModes.includes(option.value) && <Check size={10} className="mr-1" />}
                                                    {option.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Authentication Schemes */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-x-2">
                                        <Key size={14} className="text-gray-500" />
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                                            Authentication Schemes
                                        </p>
                                    </div>
                                </div>

                                {/* Current Auth Schemes */}
                                {authSchemes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {authSchemes.map((scheme) => (
                                            <Badge
                                                key={scheme.type}
                                                variant="secondary"
                                                className="flex items-center gap-x-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                            >
                                                <Shield size={12} />
                                                {getAuthLabel(scheme.type)}
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAuthScheme(scheme.type)}
                                                        className="ml-1 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add Auth Scheme */}
                                {!isReadOnly && (
                                    <div className="flex items-end gap-x-2">
                                        <div className="flex-1">
                                            <Select
                                                label="Add Authentication"
                                                placeholder="Select auth type"
                                                options={authTypeOptions.filter(
                                                    (opt) => !authSchemes.find((s) => s.type === opt.value)
                                                )}
                                                currentValue={newAuthType}
                                                onChange={(e) => setNewAuthType(e.target.value as AuthType)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={addAuthScheme}
                                            disabled={authSchemes.some((s) => s.type === newAuthType)}
                                        >
                                            <Plus size={16} className="mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                )}

                                {authSchemes.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        No authentication schemes configured. The agent will be accessible without authentication.
                                    </p>
                                )}
                            </div>

                            {/* Skills Summary */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-3">
                                    <Zap size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Attached Skills</p>
                                    <Badge variant="secondary" className="ml-auto text-xs bg-gray-100 dark:bg-gray-800">
                                        {totalSkills} Total
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(toolTypeCounts).map(([type, count]) => {
                                        if (count === 0) return null;
                                        const Icon = getToolTypeIcon(type as A2AToolType);
                                        return (
                                            <Badge 
                                                key={type} 
                                                variant="secondary" 
                                                className="text-xs flex items-center gap-x-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1"
                                            >
                                                <Icon size={12} />
                                                {getToolTypeLabel(type as A2AToolType)} x{count}
                                            </Badge>
                                        );
                                    })}
                                    {totalSkills === 0 && (
                                        <span className="text-xs text-gray-400">No tools attached — skills will be auto-generated from Input Data Connects</span>
                                    )}
                                </div>
                            </div>

                            {/* View A2A Card Button */}
                            <div className="flex items-center gap-x-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowA2ACardModal(true)}
                                    className="flex-1"
                                >
                                    <Eye size={14} className="mr-2" />
                                    View A2A Card
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(wellKnownUrl, '_blank')}
                                    title="Open live endpoint"
                                >
                                    <ExternalLink size={14} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* A2A Card Modal */}
        <Dialog open={showA2ACardModal} onOpenChange={setShowA2ACardModal}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2">
                        <FileJson size={20} className="text-blue-500" />
                        A2A Agent Card
                    </DialogTitle>
                </DialogHeader>
                <DialogBody className="overflow-y-auto">
                    {/* Metadata Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            Schema v{a2aCard.schemaVersion}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            {totalSkills} Skills
                        </Badge>
                        <Badge variant="secondary" className={cn(
                            a2aCard.capabilities.streaming 
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        )}>
                            {a2aCard.capabilities.streaming ? 'Streaming Enabled' : 'Streaming Disabled'}
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                            {Object.keys(a2aCard.securitySchemes).length > 0 
                                ? Object.keys(a2aCard.securitySchemes).join(', ')
                                : 'No Auth'}
                        </Badge>
                    </div>

                    {/* Live Endpoint Link */}
                    <div className="flex items-center gap-x-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <ExternalLink size={14} className="text-gray-500 shrink-0" />
                        <a 
                            href={wellKnownUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                            {wellKnownUrl}
                        </a>
                    </div>

                    {/* JSON Preview */}
                    <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-[400px]">
                            <code>{JSON.stringify(a2aCard, null, 2)}</code>
                        </pre>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowA2ACardModal(false)}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(a2aCard, null, 2), 'json')}
                    >
                        {copiedJson ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                        {copiedJson ? 'Copied!' : 'Copy JSON'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default IdentitySection;
