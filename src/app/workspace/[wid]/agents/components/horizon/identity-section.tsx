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
    const [newInputMode, setNewInputMode] = useState<string>('');
    const [newOutputMode, setNewOutputMode] = useState<string>('');
    const [copiedField, setCopiedField] = useState<string | null>(null);
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
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'unnamed-agent';
    }, [displayName, agentName]);

    const a2aUri = useMemo(() => {
        return `agent://kaya/${workspaceSlug}/${agentSlug}-${version}`;
    }, [workspaceSlug, agentSlug, version]);

    // Auto-generated Endpoint URL (mock data format)
    const endpointUrl = useMemo(() => {
        return `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/agents/${agentSlug}/a2a`;
    }, [workspaceSlug, agentSlug]);

    // Auto-generated Discovery Path (mock data format)  
    const discoveryPath = useMemo(() => {
        return `/ws/${workspaceSlug}/agents/${agentSlug}/.well-known/agent-card.json`;
    }, [workspaceSlug, agentSlug]);

    // Full well-known URL
    const wellKnownUrl = useMemo(() => {
        return `https://kaya.techlabsglobal.com${discoveryPath}`;
    }, [discoveryPath]);

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
            url: endpointUrl,
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
    }, [getValues, authSchemes, agentName, description, workspaceSlug, endpointUrl, generateA2ASkills]);

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

    const copyToClipboard = async (text: string, fieldName: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyJsonToClipboard = async () => {
        await navigator.clipboard.writeText(JSON.stringify(a2aCard, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    const toggleInputMode = (mode: string) => {
        const current = defaultInputModes || [];
        if (current.includes(mode)) {
            // Only remove if there's more than one mode
            if (current.length > 1) {
                setValue('horizonConfig.identity.defaultInputModes', current.filter(m => m !== mode));
            }
        } else {
            setValue('horizonConfig.identity.defaultInputModes', [...current, mode]);
        }
    };

    const toggleOutputMode = (mode: string) => {
        const current = defaultOutputModes || [];
        if (current.includes(mode)) {
            // Only remove if there's more than one mode
            if (current.length > 1) {
                setValue('horizonConfig.identity.defaultOutputModes', current.filter(m => m !== mode));
            }
        } else {
            setValue('horizonConfig.identity.defaultOutputModes', [...current, mode]);
        }
    };

    const addInputMode = () => {
        if (newInputMode && !defaultInputModes.includes(newInputMode)) {
            setValue('horizonConfig.identity.defaultInputModes', [...defaultInputModes, newInputMode]);
            setNewInputMode('');
        }
    };

    const addOutputMode = () => {
        if (newOutputMode && !defaultOutputModes.includes(newOutputMode)) {
            setValue('horizonConfig.identity.defaultOutputModes', [...defaultOutputModes, newOutputMode]);
            setNewOutputMode('');
        }
    };

    const toggleVisibility = () => {
        const newVisibility = a2aVisibility === 'public' ? 'private' : 'public';
        setValue('horizonConfig.identity.a2aVisibility', newVisibility);
    };

    return (
        <>
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                {/* Section Header */}
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <User size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">A2A Identity Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Define the agent&apos;s A2A identity, versioning, and authentication for external discovery.
                    </p>
                </div>

                {/* A2A Identity Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    {/* A2A Header with Toggle */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Sparkles size={20} className="text-gray-600 dark:text-gray-400" />
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
                            {/* Agent URI Display */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
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
                                        {copiedField === 'uri' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </Button>
                                </div>
                            </div>

                            {/* Basic Identity Fields */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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
                                                    placeholder="Describe what this agent does for A2A discovery"
                                                    value={field.value || ''}
                                                    disabled={isReadOnly}
                                                    onChange={field.onChange}
                                                    rows={2}
                                                    className="w-full resize-none"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Discovery & Endpoint - Visibility first, then Discovery Path */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <Globe size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Discovery & Endpoint</p>
                                </div>
                                <div className="space-y-4">
                                    {/* Visibility Toggle */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Visibility
                                        </Label>
                                        <div 
                                            className={cn(
                                                "inline-flex rounded-lg p-1 bg-gray-100 dark:bg-gray-700",
                                                isReadOnly && "opacity-50 pointer-events-none"
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => !isReadOnly && setValue('horizonConfig.identity.a2aVisibility', 'private')}
                                                className={cn(
                                                    "flex items-center gap-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                    a2aVisibility === 'private'
                                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                )}
                                            >
                                                <Lock size={14} />
                                                Private
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => !isReadOnly && setValue('horizonConfig.identity.a2aVisibility', 'public')}
                                                className={cn(
                                                    "flex items-center gap-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                    a2aVisibility === 'public'
                                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                )}
                                            >
                                                <Globe size={14} />
                                                Public
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {a2aVisibility === 'public' 
                                                ? 'Agent is discoverable by external A2A systems' 
                                                : 'Agent is only accessible within this workspace'}
                                        </p>
                                    </div>

                                    {/* Discovery Path - Auto-populated with copy */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Discovery Path
                                        </Label>
                                        <div className="flex items-center gap-x-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                {discoveryPath}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(wellKnownUrl, 'discovery')}
                                                className="shrink-0"
                                            >
                                                {copiedField === 'discovery' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Endpoint URL - Auto-populated with copy */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Endpoint URL
                                        </Label>
                                        <div className="flex items-center gap-x-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                {endpointUrl}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(endpointUrl, 'endpoint')}
                                                className="shrink-0"
                                            >
                                                {copiedField === 'endpoint' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input/Output Modes */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <FileJson size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Input/Output Modes</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Input Modes */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Default Input Modes
                                        </Label>
                                        
                                        {/* Existing Input Modes */}
                                        {defaultInputModes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {defaultInputModes.map((mode) => {
                                                    const option = inputModeOptions.find(o => o.value === mode);
                                                    return (
                                                        <Badge
                                                            key={mode}
                                                            variant="secondary"
                                                            className="flex items-center gap-x-1 px-3 py-1.5"
                                                        >
                                                            {option?.name || mode}
                                                            {!isReadOnly && defaultInputModes.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleInputMode(mode)}
                                                                    className="ml-1 hover:text-red-500"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        
                                        {/* Add Input Mode */}
                                        {!isReadOnly && (
                                            <div className="flex gap-x-2">
                                                <Select
                                                    options={inputModeOptions.filter(opt => !defaultInputModes.includes(opt.value))}
                                                    currentValue={newInputMode}
                                                    onChange={(e) => setNewInputMode(e.target.value)}
                                                    className="flex-1"
                                                    placeholder="Select input mode..."
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={addInputMode}
                                                    disabled={!newInputMode || defaultInputModes.includes(newInputMode)}
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Output Modes */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Default Output Modes
                                        </Label>
                                        
                                        {/* Existing Output Modes */}
                                        {defaultOutputModes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {defaultOutputModes.map((mode) => {
                                                    const option = outputModeOptions.find(o => o.value === mode);
                                                    return (
                                                        <Badge
                                                            key={mode}
                                                            variant="secondary"
                                                            className="flex items-center gap-x-1 px-3 py-1.5"
                                                        >
                                                            {option?.name || mode}
                                                            {!isReadOnly && defaultOutputModes.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleOutputMode(mode)}
                                                                    className="ml-1 hover:text-red-500"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        
                                        {/* Add Output Mode */}
                                        {!isReadOnly && (
                                            <div className="flex gap-x-2">
                                                <Select
                                                    options={outputModeOptions.filter(opt => !defaultOutputModes.includes(opt.value))}
                                                    currentValue={newOutputMode}
                                                    onChange={(e) => setNewOutputMode(e.target.value)}
                                                    className="flex-1"
                                                    placeholder="Select output mode..."
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={addOutputMode}
                                                    disabled={!newOutputMode || defaultOutputModes.includes(newOutputMode)}
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Authentication Schemes */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-x-2">
                                        <Shield size={14} className="text-gray-500" />
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Authentication Schemes</p>
                                    </div>
                                </div>

                                {/* Existing Auth Schemes */}
                                {authSchemes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {authSchemes.map((scheme) => (
                                            <Badge
                                                key={scheme.type}
                                                variant="secondary"
                                                className="flex items-center gap-x-1 px-3 py-1.5"
                                            >
                                                <Key size={12} />
                                                {getAuthLabel(scheme.type)}
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAuthScheme(scheme.type)}
                                                        className="ml-1 hover:text-red-500"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add Auth Scheme */}
                                {!isReadOnly && (
                                    <div className="flex gap-x-2">
                                        <Select
                                            options={authTypeOptions}
                                            currentValue={newAuthType}
                                            onChange={(e) => setNewAuthType(e.target.value as AuthType)}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={addAuthScheme}
                                            disabled={authSchemes.some((s) => s.type === newAuthType)}
                                        >
                                            <Plus size={14} className="mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                )}

                                {authSchemes.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        No authentication schemes configured. Agent will be accessible without authentication.
                                    </p>
                                )}
                            </div>

                            {/* Attached Skills Summary */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <Zap size={14} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                                        Attached Skills
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalSkills} total
                                    </Badge>
                                </div>

                                {totalSkills > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(toolTypeCounts)
                                            .filter(([, count]) => count > 0)
                                            .map(([type, count]) => {
                                                const Icon = getToolTypeIcon(type as A2AToolType);
                                                return (
                                                    <Badge 
                                                        key={type} 
                                                        variant="secondary"
                                                        className="flex items-center gap-x-1.5 px-2 py-1"
                                                    >
                                                        <Icon size={12} />
                                                        <span>{getToolTypeLabel(type as A2AToolType)}</span>
                                                        <span className="text-gray-400">x{count}</span>
                                                    </Badge>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">
                                        No tools attached. Add tools to this agent to auto-generate A2A skills.
                                    </p>
                                )}
                            </div>

                            {/* View A2A Card Button */}
                            <div className="pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowA2ACardModal(true)}
                                    className="w-full justify-center"
                                >
                                    <Eye size={14} className="mr-2" />
                                    View A2A Card
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* A2A Card Modal */}
        <Dialog open={showA2ACardModal} onOpenChange={setShowA2ACardModal}>
            <DialogContent className="max-w-3xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2 text-base font-semibold">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <FileJson size={18} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        A2A Agent Card
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">
                        Agent-to-Agent protocol specification for {displayName || agentName || 'this agent'}
                    </p>
                </DialogHeader>
                <DialogBody className="overflow-auto">
                    {/* Metadata Summary */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Schema v{a2aCard.schemaVersion}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                {a2aCard.skills.length} Skill{a2aCard.skills.length !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary" className={cn(
                                "text-xs",
                                a2aCard.capabilities.streaming 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            )}>
                                {a2aCard.capabilities.streaming ? 'Streaming Enabled' : 'No Streaming'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {Object.keys(a2aCard.securitySchemes).length > 0 
                                    ? Object.keys(a2aCard.securitySchemes).join(', ')
                                    : 'No Auth'}
                            </Badge>
                            <Badge variant="secondary" className={cn(
                                "text-xs",
                                a2aVisibility === 'public'
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            )}>
                                {a2aVisibility === 'public' ? 'Public' : 'Private'}
                            </Badge>
                        </div>
                    </div>

                    {/* JSON Display */}
                    <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={copyJsonToClipboard}
                                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                            >
                                {copiedJson ? <Check size={14} className="mr-1.5 text-green-400" /> : <Copy size={14} className="mr-1.5" />}
                                {copiedJson ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-auto max-h-[350px] border border-gray-800">
                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(a2aCard, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Well-known URL */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-x-2">
                            <ExternalLink size={14} className="text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Discovery Endpoint</p>
                                <a 
                                    href={wellKnownUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-mono truncate block"
                                >
                                    {wellKnownUrl}
                                </a>
                            </div>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button variant="secondary" size="sm" onClick={() => setShowA2ACardModal(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default IdentitySection;
