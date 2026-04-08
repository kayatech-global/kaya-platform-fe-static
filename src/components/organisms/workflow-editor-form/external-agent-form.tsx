'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Button,
    Input,
    Textarea,
    Select,
    Switch,
    Slider,
    Badge,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Checkbox,
    Label,
    VaultSelector,
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '@/components/atoms';
import { useDnD } from '@/context';
import { cn, sanitizeNumericInput } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import { useVaultSecretsFetcher } from '@/hooks/use-vault-common';
import { toast } from 'sonner';
import {
    Globe,
    Copy,
    Check,
    AlertTriangle,
    RefreshCw,
    Search,
    ExternalLink,
    Shield,
    Clock,
    Zap,
    Info,
    Link2,
    XCircle,
    ChevronDown,
    ChevronRight,
    Activity,
    Settings2,
    FileJson,
    ArrowRightLeft,
    Play,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RotateCcw,
    Eye,
    Code2,
    Wifi,
    Plus,
    Trash2,
    X,
} from 'lucide-react';

// Types for A2A Agent Card
export interface A2ASkill {
    id: string;
    name: string;
    description?: string;
    toolType: 'REST' | 'MCP' | 'Vector RAG' | 'Graph RAG' | 'Executable' | 'Connector';
    tags?: string[];
    inputModes?: ('text' | 'file' | 'data')[];
    outputModes?: ('text' | 'file' | 'data')[];
}

export interface A2AAgentCard {
    name: string;
    description?: string;
    url: string;
    version: string;
    schemaVersion: string;
    documentationUrl?: string;
    provider?: { name: string; url?: string };
    authentication?: {
        schemes: ('none' | 'bearer' | 'oauth2')[];
        credentials?: string;
    };
    defaultInputModes?: string[];
    defaultOutputModes?: string[];
    skills: A2ASkill[];
    capabilities?: {
        streaming?: boolean;
        pushNotifications?: boolean;
        stateTransitionHistory?: boolean;
    };
}

export interface MethodMapping {
    id: string;
    methodName: string;
    inputSchema: string;
    outputMapping: string;
}

export interface RetryConfig {
    retryEnabled?: boolean;
    retryAttempts?: number | null;
    retryWaitType?: 'fixed' | 'exponential';
    retryMultiplier?: number | null;
    retryMinWait?: number | null;
    retryMaxWait?: number | null;
}

export interface ExternalAgentData {
    agentCardUrl?: string;
    friendlyName?: string;
    description?: string;
    iconUrl?: string;
    schemaVersion?: string;
    agentCard?: A2AAgentCard | null;
    selectedSkills?: A2ASkill[];
    authentication?: {
        type: 'none' | 'bearer' | 'oauth2';
        secretRef?: string;
        clientId?: string;
        clientSecret?: string;
        tokenUrl?: string;
    };
    runtimeOptions?: {
        streaming?: boolean;
        timeout?: number;
    };
    branchTargets?: {
        onSuccess?: string;
        onError?: string;
        onTimeout?: string;
    };
    // Discovery Configuration
    autoDiscovery?: boolean;
    discoveryInterval?: number; // in minutes
    // Task Mapping Configuration - now supports multiple methods
    methodMappings?: MethodMapping[];
    // Execution Mode
    executionMode?: 'synchronous' | 'asynchronous';
    pollingInterval?: number; // in seconds, for async mode
    // Service Endpoint (auto-filled from Agent Card)
    serviceEndpoint?: string;
    // Retry Configuration (like sub-workflow)
    retryConfig?: RetryConfig;
}

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { updateNodeData } = useReactFlow();
    const { trigger, setTrigger } = useDnD();
    const params = useParams();
    const workspaceId = params?.wid as string;

    // Vault secrets for authentication
    const { data: vaultSecrets, isLoading: loadingSecrets, refetch: refetchSecrets } = useVaultSecretsFetcher(workspaceId);
    const secretOptions = vaultSecrets?.map((secret) => ({
        name: secret.keyName || '',
        value: secret.keyName || '',
    })) || [];

    // Form state
    const [agentCardUrl, setAgentCardUrl] = useState<string>('');
    const [friendlyName, setFriendlyName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [iconUrl, setIconUrl] = useState<string>('');
    const [schemaVersion, setSchemaVersion] = useState<string>('');

    // Agent Card state
    const [agentCard, setAgentCard] = useState<A2AAgentCard | null>(null);
    const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Skills selection
    const [selectedSkills, setSelectedSkills] = useState<A2ASkill[]>([]);
    const [skillSearch, setSkillSearch] = useState<string>('');

    // Authentication
    const [authType, setAuthType] = useState<'none' | 'bearer' | 'oauth2'>('none');
    const [secretRef, setSecretRef] = useState<string>('');
    const [clientId, setClientId] = useState<string>('');
    const [clientSecret, setClientSecret] = useState<string>('');
    const [tokenUrl, setTokenUrl] = useState<string>('');

    // Runtime options
    const [streaming, setStreaming] = useState<boolean>(false);
    const [timeout, setTimeout] = useState<number | null>(30);

    // Retry Configuration (like sub-workflow)
    const [retryEnabled, setRetryEnabled] = useState<boolean>(false);
    const [retryAttempts, setRetryAttempts] = useState<number | null>(3);
    const [retryWaitType, setRetryWaitType] = useState<'fixed' | 'exponential'>('fixed');
    const [retryMultiplier, setRetryMultiplier] = useState<number | null>(2);
    const [retryMinWait, setRetryMinWait] = useState<number | null>(1);
    const [retryMaxWait, setRetryMaxWait] = useState<number | null>(60);

    // Discovery Configuration
    const [autoDiscovery, setAutoDiscovery] = useState<boolean>(false);
    const [discoveryInterval, setDiscoveryInterval] = useState<number>(60); // minutes

    // Task Mapping - now supports multiple methods
    const [methodMappings, setMethodMappings] = useState<MethodMapping[]>([
        { id: '1', methodName: 'execute_task', inputSchema: '{\n  "prompt": "{{workflow.user_query}}"\n}', outputMapping: 'result.data' }
    ]);

    // Execution Mode
    const [executionMode, setExecutionMode] = useState<'synchronous' | 'asynchronous'>('synchronous');
    const [pollingInterval, setPollingInterval] = useState<number>(5);

    // Service Endpoint
    const [serviceEndpoint, setServiceEndpoint] = useState<string>('');
    const [copiedEndpoint, setCopiedEndpoint] = useState(false);

    // Connection Test state
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState<string>('');

    // Agent Card dialog state
    const [showAgentCardDialog, setShowAgentCardDialog] = useState(false);

    // UI state
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Section collapse states
    const [sectionsOpen, setSectionsOpen] = useState({
        discovery: true,
        skills: true,
        taskMapping: false,
        auth: true,
        runtime: false,
        monitoring: false,
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Default mock agent card for demonstration
    const defaultMockAgentCard: A2AAgentCard = {
        name: 'External Analysis Agent',
        description: 'A powerful agent that provides data analysis and insights through A2A protocol',
        url: 'http://localhost:8001/.well-known/agent.json',
        version: '2.1.0',
        schemaVersion: '1.0',
        documentationUrl: 'https://docs.example.com/agent',
        provider: { name: 'KAYA Partner', url: 'https://partner.example.com' },
        capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: true },
        authentication: { schemes: ['bearer', 'oauth2'] },
        defaultInputModes: ['text', 'data'],
        defaultOutputModes: ['text', 'data'],
        skills: [
            { id: 'skill-1', name: 'Data Analysis', description: 'Analyze structured data and generate insights', toolType: 'REST', tags: ['analytics', 'insights', 'reporting'], inputModes: ['text', 'data'], outputModes: ['text', 'data'] },
            { id: 'skill-2', name: 'Document Processing', description: 'Extract and process information from documents', toolType: 'Vector RAG', tags: ['documents', 'extraction', 'nlp'], inputModes: ['text'], outputModes: ['text', 'data'] },
            { id: 'skill-3', name: 'Knowledge Graph Query', description: 'Query and traverse knowledge graphs for insights', toolType: 'Graph RAG', tags: ['graph', 'knowledge', 'reasoning'], inputModes: ['text'], outputModes: ['text', 'data'] },
            { id: 'skill-4', name: 'Custom Function Execution', description: 'Execute custom analysis functions', toolType: 'Executable', tags: ['custom', 'function', 'compute'], inputModes: ['data'], outputModes: ['data'] },
        ],
    };

    // Toggle section helper
    const toggleSection = (key: keyof typeof sectionsOpen) => {
        setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Initialize from node data or use defaults for demo
    useEffect(() => {
        const data = selectedNode.data as ExternalAgentData;
        if (data?.agentCard) {
            setAgentCardUrl(data.agentCardUrl || '');
            setFriendlyName(data.friendlyName || '');
            setDescription(data.description || '');
            setIconUrl(data.iconUrl || '');
            setSchemaVersion(data.schemaVersion || '');
            setAgentCard(data.agentCard);
            setSelectedSkills(data.selectedSkills || []);
            if (data.authentication) {
                setAuthType(data.authentication.type || 'none');
                setSecretRef(data.authentication.secretRef || '');
                setClientId(data.authentication.clientId || '');
                setClientSecret(data.authentication.clientSecret || '');
                setTokenUrl(data.authentication.tokenUrl || '');
            }
            if (data.runtimeOptions) {
                setStreaming(data.runtimeOptions.streaming || false);
                setTimeout(data.runtimeOptions.timeout ?? 30);
            }
            // Load retry configuration
            if (data.retryConfig) {
                setRetryEnabled(data.retryConfig.retryEnabled || false);
                setRetryAttempts(data.retryConfig.retryAttempts ?? 3);
                setRetryWaitType(data.retryConfig.retryWaitType || 'fixed');
                setRetryMultiplier(data.retryConfig.retryMultiplier ?? 2);
                setRetryMinWait(data.retryConfig.retryMinWait ?? 1);
                setRetryMaxWait(data.retryConfig.retryMaxWait ?? 60);
            }
            // Load new fields
            setAutoDiscovery(data.autoDiscovery || false);
            setDiscoveryInterval(data.discoveryInterval || 60);
            if (data.methodMappings && data.methodMappings.length > 0) {
                setMethodMappings(data.methodMappings);
            }
            setExecutionMode(data.executionMode || 'synchronous');
            setPollingInterval(data.pollingInterval || 5);
            setServiceEndpoint(data.serviceEndpoint || data.agentCard?.url || '');
            setFetchStatus('success');
        } else {
            // Initialize empty for new nodes - user must enter URL and fetch
            setAgentCardUrl('');
            setFriendlyName('');
            setDescription('');
            setSchemaVersion('');
            setAgentCard(null);
            setFetchStatus('idle');
        }
    }, [selectedNode.id]);

    // Validate configuration
    const validateConfig = useCallback(() => {
        const errors: string[] = [];

        if (authType === 'bearer' && !secretRef) {
            errors.push('Bearer token secret reference is required');
        }
        if (authType === 'oauth2') {
            if (!clientId) errors.push('OAuth2 Client ID is required');
            if (!clientSecret) errors.push('OAuth2 Client Secret is required');
            if (!tokenUrl) errors.push('OAuth2 Token URL is required');
        }
        if (agentCard && selectedSkills.length === 0) {
            errors.push('At least one skill must be selected');
        }
        if (agentCard && agentCard.schemaVersion !== '1.0' && agentCard.schemaVersion !== schemaVersion) {
            errors.push(`Schema version mismatch: expected 1.0, got ${agentCard.schemaVersion}`);
        }

        setValidationErrors(errors);
        return errors.length === 0;
    }, [authType, secretRef, clientId, clientSecret, tokenUrl, agentCard, selectedSkills, schemaVersion]);

    // Fetch Agent Card
    const fetchAgentCard = async () => {
        if (!agentCardUrl) {
            toast.error('Please enter an Agent Card URL');
            return;
        }

        setFetchStatus('loading');
        setFetchError(null);

        try {
            // Simulated fetch - in real implementation, this would be an actual API call
            await new Promise(resolve => window.setTimeout(resolve, 1500));

            // Mock agent card data for demonstration
            const mockCard: A2AAgentCard = {
                name: 'External Analysis Agent',
                description: 'A powerful agent that provides data analysis and insights through A2A protocol',
                url: agentCardUrl,
                version: '2.1.0',
                schemaVersion: '1.0',
                documentationUrl: 'https://docs.example.com/agent',
                provider: { name: 'KAYA Partner', url: 'https://partner.example.com' },
                authentication: {
                    schemes: ['bearer', 'oauth2'],
                },
                defaultInputModes: ['text', 'data'],
                defaultOutputModes: ['text', 'data'],
                skills: [
                    {
                        id: 'skill-1',
                        name: 'Data Analysis',
                        description: 'Analyze structured data and generate insights',
                        toolType: 'REST',
                        tags: ['analytics', 'insights', 'reporting'],
                        inputModes: ['text', 'data'],
                        outputModes: ['text', 'data'],
                    },
                    {
                        id: 'skill-2',
                        name: 'Document Processing',
                        description: 'Extract and process information from documents',
                        toolType: 'Vector RAG',
                        tags: ['documents', 'extraction', 'nlp'],
                        inputModes: ['text', 'file'],
                        outputModes: ['text'],
                    },
                    {
                        id: 'skill-3',
                        name: 'Knowledge Graph Query',
                        description: 'Query and traverse knowledge graphs for relationships',
                        toolType: 'Graph RAG',
                        tags: ['knowledge', 'graphs', 'relationships'],
                        inputModes: ['text'],
                        outputModes: ['text', 'data'],
                    },
                    {
                        id: 'skill-4',
                        name: 'MCP Integration',
                        description: 'Connect with MCP-compatible tools and services',
                        toolType: 'MCP',
                        tags: ['integration', 'tools', 'mcp'],
                        inputModes: ['text', 'data'],
                        outputModes: ['text', 'data'],
                    },
                ],
                capabilities: {
                    streaming: true,
                    pushNotifications: false,
                    stateTransitionHistory: true,
                },
            };

            setAgentCard(mockCard);
            setFriendlyName(mockCard.name);
            setDescription(mockCard.description || '');
            setSchemaVersion(mockCard.schemaVersion);
            setServiceEndpoint(mockCard.url);
            setFetchStatus('success');
            toast.success('Agent Card fetched successfully');
        } catch (error) {
            setFetchStatus('error');
            setFetchError('Failed to fetch Agent Card. Please check the URL and try again.');
            toast.error('Failed to fetch Agent Card');
        }
    };

    // Test Connection - Capability Check
    const testConnection = async () => {
        if (!agentCardUrl) {
            toast.error('Please enter an Agent Card URL first');
            return;
        }

        setTestStatus('testing');
        setTestMessage('');

        try {
            // Simulated connection test
            await new Promise(resolve => window.setTimeout(resolve, 2000));
            
            // Mock success response
            setTestStatus('success');
            setTestMessage('Agent is A2A-compliant and reachable. Schema version 1.0 detected.');
            toast.success('Connection test successful');
        } catch (error) {
            setTestStatus('error');
            setTestMessage('Unable to reach agent endpoint. Please verify the URL and network connectivity.');
            toast.error('Connection test failed');
        }
    };

    // Open A2A Inspector
    const openInspector = () => {
        if (agentCardUrl) {
            window.open(agentCardUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // Toggle skill selection
    const toggleSkill = (skill: A2ASkill) => {
        if (isReadOnly) return;
        setSelectedSkills(prev => {
            const exists = prev.find(s => s.id === skill.id);
            if (exists) {
                return prev.filter(s => s.id !== skill.id);
            }
            return [...prev, skill];
        });
    };

    // Filter skills by search
    const filteredSkills = (agentCard?.skills || []).filter(
        skill =>
            skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
            skill.description?.toLowerCase().includes(skillSearch.toLowerCase()) ||
            skill.tags?.some(tag => tag.toLowerCase().includes(skillSearch.toLowerCase()))
    );

    // Save node data
    const handleSave = () => {
        if (!validateConfig()) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        updateNodeData(selectedNode.id, {
            agentCardUrl,
            friendlyName,
            description,
            iconUrl,
            schemaVersion,
            agentCard,
            selectedSkills,
            authentication: {
                type: authType,
                secretRef: authType === 'bearer' ? secretRef : undefined,
                clientId: authType === 'oauth2' ? clientId : undefined,
                clientSecret: authType === 'oauth2' ? clientSecret : undefined,
                tokenUrl: authType === 'oauth2' ? tokenUrl : undefined,
            },
            runtimeOptions: {
                streaming,
                timeout: timeout ?? undefined,
            },
            retryConfig: {
                retryEnabled,
                retryAttempts: retryEnabled ? retryAttempts : undefined,
                retryWaitType: retryEnabled ? retryWaitType : undefined,
                retryMultiplier: retryEnabled && retryWaitType === 'exponential' ? retryMultiplier : undefined,
                retryMinWait: retryEnabled ? retryMinWait : undefined,
                retryMaxWait: retryEnabled ? retryMaxWait : undefined,
            },
            // New fields
            autoDiscovery,
            discoveryInterval: autoDiscovery ? discoveryInterval : undefined,
            methodMappings,
            executionMode,
            pollingInterval: executionMode === 'asynchronous' ? pollingInterval : undefined,
            serviceEndpoint,
        });
        setTrigger((trigger ?? 0) + 1);
        toast.success('External Agent configuration saved');
    };

    // Copy URL to clipboard
    const copyUrl = () => {
        navigator.clipboard.writeText(agentCardUrl);
        setCopiedUrl(true);
        window.setTimeout(() => setCopiedUrl(false), 2000);
    };

    // Copy service endpoint to clipboard
    const copyServiceEndpoint = () => {
        navigator.clipboard.writeText(serviceEndpoint);
        setCopiedEndpoint(true);
        window.setTimeout(() => setCopiedEndpoint(false), 2000);
        toast.success('Service endpoint copied to clipboard');
    };

    // Method mappings helpers
    const addMethodMapping = () => {
        const newMapping: MethodMapping = {
            id: String(Date.now()),
            methodName: '',
            inputSchema: '{\n  \n}',
            outputMapping: '',
        };
        setMethodMappings(prev => [...prev, newMapping]);
    };

    const updateMethodMapping = (id: string, field: keyof MethodMapping, value: string) => {
        setMethodMappings(prev =>
            prev.map(mapping => (mapping.id === id ? { ...mapping, [field]: value } : mapping))
        );
    };

    const removeMethodMapping = (id: string) => {
        setMethodMappings(prev => prev.filter(mapping => mapping.id !== id));
    };

  // Get tool type badge color
    const getToolTypeBadgeColor = (toolType: string) => {
        switch (toolType) {
            case 'REST':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'MCP':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Vector RAG':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Graph RAG':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Executable':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'Connector':
                return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="group">
            <div
                className={cn(
                    'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700'
                )}
            >
                {/* Validation Banners */}
                {validationErrors.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-red-400">Validation Errors</span>
                                {validationErrors.map((error, idx) => (
                                    <span key={idx} className="text-xs text-red-300">
                                        {error}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Agent Card URL Input */}
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Card URL</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={agentCardUrl}
                                onChange={e => setAgentCardUrl(e.target.value)}
                                placeholder="https://agent.example.com/.well-known/agent.json"
                                className="pl-10 pr-10"
                                disabled={isReadOnly}
                            />
                            {agentCardUrl && (
                                <button
                                    onClick={copyUrl}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={fetchAgentCard}
                            disabled={isReadOnly || fetchStatus === 'loading' || !agentCardUrl}
                            className="gap-2"
                        >
                            {fetchStatus === 'loading' ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <ExternalLink className="w-4 h-4" />
                            )}
                            Fetch
                        </Button>
                    </div>

                    {/* Fetch status */}
                    {fetchStatus === 'error' && fetchError && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            {fetchError}
                        </div>
                    )}
                    {fetchStatus === 'success' && agentCard && (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <Check className="w-3 h-3" />
                            Agent Card loaded: {agentCard.name} v{agentCard.version}
                        </div>
                    )}
                </div>

                {/* Agent Info (after fetch) */}
                {agentCard && (
                    <>
                        {/* Basic Agent Info - Title section with aligned badges */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block truncate" title={friendlyName || agentCard.name}>
                                            {friendlyName || agentCard.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Schema {schemaVersion}</span>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0 items-center">
                                        <Badge variant="outline" className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 whitespace-nowrap">
                                            v{agentCard.version}
                                        </Badge>
                                        {agentCard.capabilities?.streaming && (
                                            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 whitespace-nowrap">
                                                <Wifi className="w-3 h-3 mr-1" />
                                                Stream
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Friendly Name field */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Friendly Name</Label>
                            <Input
                                value={friendlyName}
                                onChange={e => setFriendlyName(e.target.value)}
                                placeholder="Agent name"
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Service Endpoint - placed right below Friendly Name with copy option */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Service Endpoint</Label>
                            <div className="relative">
                                <Input 
                                    value={serviceEndpoint} 
                                    disabled 
                                    className="bg-gray-100 dark:bg-gray-800 text-xs font-mono pr-10" 
                                    title={serviceEndpoint}
                                />
                                {serviceEndpoint && (
                                    <button
                                        onClick={copyServiceEndpoint}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        title="Copy service endpoint"
                                    >
                                        {copiedEndpoint ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Description</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Agent description"
                                rows={2}
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 1. Discovery Configuration Section */}
                        <Collapsible open={sectionsOpen.discovery} onOpenChange={() => toggleSection('discovery')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-sky-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Discovery Configuration
                                    </span>
                                </div>
                                {sectionsOpen.discovery ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm text-gray-700 dark:text-gray-200">
                                                Auto-Discovery
                                            </Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[200px]">
                                                        <p className="text-xs">Periodically refresh the Agent Card to detect new skills or endpoint changes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Switch
                                            checked={autoDiscovery}
                                            onCheckedChange={setAutoDiscovery}
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    {autoDiscovery && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Refresh Interval
                                                </Label>
                                                <span className="text-xs font-mono text-gray-500">{discoveryInterval} min</span>
                                            </div>
                                            <Slider
                                                value={[discoveryInterval]}
                                                onValueChange={([v]) => setDiscoveryInterval(v)}
                                                min={5}
                                                max={1440}
                                                step={5}
                                                disabled={isReadOnly}
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                <span>5 min</span>
                                                <span>24 hrs</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 2. Skills Selection Section */}
                        <Collapsible open={sectionsOpen.skills} onOpenChange={() => toggleSection('skills')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Remote Skills
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {selectedSkills.length}/{agentCard?.skills?.length || 0}
                                    </Badge>
                                </div>
                                {sectionsOpen.skills ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            value={skillSearch}
                                            onChange={e => setSkillSearch(e.target.value)}
                                            placeholder="Search skills..."
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Selected chips */}
                                    {selectedSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedSkills.map(skill => (
                                                <Badge
                                                    key={skill.id}
                                                    variant="outline"
                                                    className="gap-1 pr-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px]"
                                                >
                                                    {skill.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSkill(skill)}
                                                        className="ml-0.5 hover:bg-blue-500/20 rounded p-0.5"
                                                        disabled={isReadOnly}
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skill list */}
                                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                                        {filteredSkills.map(skill => (
                                            <div
                                                key={skill.id}
                                                onClick={() => toggleSkill(skill)}
                                                className={cn(
                                                    'p-2.5 rounded-lg border cursor-pointer transition-all',
                                                    selectedSkills.find(s => s.id === skill.id)
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                )}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Checkbox
                                                        checked={!!selectedSkills.find(s => s.id === skill.id)}
                                                        disabled={isReadOnly}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                                {skill.name}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn('text-[9px] px-1.5 py-0', getToolTypeBadgeColor(skill.toolType))}
                                                            >
                                                                {skill.toolType}
                                                            </Badge>
                                                        </div>
                                                        {skill.description && (
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                                {skill.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 3. Task Mapping Section - supports multiple JSON-RPC methods */}
                        <Collapsible open={sectionsOpen.taskMapping} onOpenChange={() => toggleSection('taskMapping')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Task Mapping
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {methodMappings.length} {methodMappings.length === 1 ? 'method' : 'methods'}
                                    </Badge>
                                </div>
                                {sectionsOpen.taskMapping ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-4">
                                    {/* Description */}
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Configure task mappings for each JSON-RPC method the agent supports.
                                    </p>

                                    {/* Method Mappings List */}
                                    {methodMappings.map((mapping, index) => (
                                        <div 
                                            key={mapping.id} 
                                            className="flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            {/* Method Header */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                    Method {index + 1}
                                                </span>
                                                {methodMappings.length > 1 && !isReadOnly && (
                                                    <button
                                                        onClick={() => removeMethodMapping(mapping.id)}
                                                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Remove method"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Method Name */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Method Name</Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="w-3 h-3 text-gray-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[200px]">
                                                                <p className="text-xs">The JSON-RPC method the agent supports (e.g., execute_task, generate_report)</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <Input
                                                    value={mapping.methodName}
                                                    onChange={e => updateMethodMapping(mapping.id, 'methodName', e.target.value)}
                                                    placeholder="execute_task"
                                                    className="font-mono text-xs"
                                                    disabled={isReadOnly}
                                                />
                                            </div>

                                            {/* Input Schema */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Input Schema (JSON)</Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="w-3 h-3 text-gray-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[220px]">
                                                                <p className="text-xs">Map workflow variables to agent params using {'{{workflow.variable}}'} syntax</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <div className="relative">
                                                    <Code2 className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                                                    <Textarea
                                                        value={mapping.inputSchema}
                                                        onChange={e => updateMethodMapping(mapping.id, 'inputSchema', e.target.value)}
                                                        placeholder={'{\n  "prompt": "{{workflow.user_query}}"\n}'}
                                                        rows={4}
                                                        className="font-mono text-xs pl-7 resize-none"
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                            </div>

                                            {/* Output Mapping */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Output Mapping</Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="w-3 h-3 text-gray-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[200px]">
                                                                <p className="text-xs">JSONPath to extract from agent result (e.g., result.data, response.output)</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <Input
                                                    value={mapping.outputMapping}
                                                    onChange={e => updateMethodMapping(mapping.id, 'outputMapping', e.target.value)}
                                                    placeholder="result.data"
                                                    className="font-mono text-xs"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Method Button */}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addMethodMapping}
                                            className="w-full gap-2 text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Method Mapping
                                        </Button>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 4. Authentication Section */}
                        <Collapsible open={sectionsOpen.auth} onOpenChange={() => toggleSection('auth')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Authentication
                                    </span>
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            'text-[10px] h-5',
                                            authType === 'none' 
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                                : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                                        )}
                                    >
                                        {authType === 'none' ? 'None' : authType === 'bearer' ? 'Bearer' : 'OAuth2'}
                                    </Badge>
                                </div>
                                {sectionsOpen.auth ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-3">
                                    <Select
                                        label="Auth Type"
                                        currentValue={authType}
                                        onChange={(e) => setAuthType(e.target.value as 'none' | 'bearer' | 'oauth2')}
                                        disabled={isReadOnly}
                                        options={[
                                            { name: 'None', value: 'none' },
                                            { name: 'Bearer Token', value: 'bearer' },
                                            { name: 'OAuth2 Client Credentials', value: 'oauth2' },
                                        ]}
                                    />

                                    {authType === 'none' && (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                                No auth configured. Ensure endpoint is publicly accessible or network-scoped.
                                            </p>
                                        </div>
                                    )}

                                    {authType === 'bearer' && (
                                        <VaultSelector
                                            label="Bearer Token Secret"
                                            placeholder={secretOptions.length > 0 ? 'Select vault secret' : 'No vault secrets found'}
                                            options={secretOptions}
                                            currentValue={secretRef}
                                            onChange={e => setSecretRef(e.target.value)}
                                            disabled={isReadOnly || secretOptions.length === 0}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetchSecrets()}
                                            helperInfo="Select the vault secret containing the bearer token"
                                        />
                                    )}

                                    {authType === 'oauth2' && (
                                        <div className="flex flex-col gap-3">
                                            <VaultSelector
                                                label="Client ID Secret"
                                                placeholder={secretOptions.length > 0 ? 'Select vault secret' : 'No vault secrets found'}
                                                options={secretOptions}
                                                currentValue={clientId}
                                                onChange={e => setClientId(e.target.value)}
                                                disabled={isReadOnly || secretOptions.length === 0}
                                                loadingSecrets={loadingSecrets}
                                                onRefetch={() => refetchSecrets()}
                                                helperInfo="OAuth2 client ID from vault"
                                            />
                                            <VaultSelector
                                                label="Client Secret"
                                                placeholder={secretOptions.length > 0 ? 'Select vault secret' : 'No vault secrets found'}
                                                options={secretOptions}
                                                currentValue={clientSecret}
                                                onChange={e => setClientSecret(e.target.value)}
                                                disabled={isReadOnly || secretOptions.length === 0}
                                                loadingSecrets={loadingSecrets}
                                                onRefetch={() => refetchSecrets()}
                                                helperInfo="OAuth2 client secret from vault"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">Token URL</Label>
                                                <Input
                                                    value={tokenUrl}
                                                    onChange={e => setTokenUrl(e.target.value)}
                                                    placeholder="https://auth.example.com/oauth/token"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 5. Runtime & Execution Options Section */}
                        <Collapsible open={sectionsOpen.runtime} onOpenChange={() => toggleSection('runtime')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Runtime & Execution
                                    </span>
                                </div>
                                {sectionsOpen.runtime ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-4">
                                    {/* Execution Mode */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-xs text-gray-500 dark:text-gray-400">Execution Mode</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[220px]">
                                                        <p className="text-xs">Sync: wait for response. Async: receive job_id and poll for completion.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setExecutionMode('synchronous')}
                                                disabled={isReadOnly}
                                                className={cn(
                                                    'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                                                    executionMode === 'synchronous'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                )}
                                            >
                                                Synchronous
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExecutionMode('asynchronous')}
                                                disabled={isReadOnly}
                                                className={cn(
                                                    'flex-1 px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700',
                                                    executionMode === 'asynchronous'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                )}
                                            >
                                                Asynchronous
                                            </button>
                                        </div>
                                    </div>

                                    {executionMode === 'asynchronous' && (
                                        <div className="flex flex-col gap-2 pl-2 border-l-2 border-blue-500/30">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Polling Interval
                                                </Label>
                                                <span className="text-xs font-mono text-gray-500">{pollingInterval}s</span>
                                            </div>
                                            <Slider
                                                value={[pollingInterval]}
                                                onValueChange={([v]) => setPollingInterval(v)}
                                                min={1}
                                                max={60}
                                                step={1}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    )}

                                    {/* Streaming toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wifi className="w-3.5 h-3.5 text-gray-400" />
                                            <Label className="text-xs text-gray-700 dark:text-gray-200">
                                                Enable Streaming
                                            </Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">Stream responses as they are generated</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Switch
                                            checked={streaming}
                                            onCheckedChange={setStreaming}
                                            disabled={isReadOnly || !agentCard?.capabilities?.streaming}
                                        />
                                    </div>

                                    {/* Timeout - textbox based number control */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            <Label className="text-xs text-gray-700 dark:text-gray-200">
                                                Timeout Limit (seconds)
                                            </Label>
                                        </div>
                                        <Input
                                            type="number"
                                            value={timeout ?? ''}
                                            onChange={e => setTimeout(e.target.value ? Number(e.target.value) : null)}
                                            placeholder="Enter timeout in seconds (leave empty for default)"
                                            disabled={isReadOnly}
                                            onInput={sanitizeNumericInput}
                                            min={0}
                                        />
                                    </div>

                                    {/* Retry Configuration - same as sub-workflow node */}
                                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Retry Configuration</p>
                                        <div className="flex items-center gap-x-2">
                                            <Checkbox
                                                id="retryEnabled"
                                                checked={retryEnabled}
                                                onCheckedChange={(checked: boolean) => setRetryEnabled(checked)}
                                                disabled={isReadOnly}
                                            />
                                            <label htmlFor="retryEnabled" className="text-sm text-gray-600 dark:text-gray-300">
                                                Enable Retry
                                            </label>
                                        </div>
                                        {retryEnabled && (
                                            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                                <Input
                                                    type="number"
                                                    value={retryAttempts ?? ''}
                                                    onChange={e => setRetryAttempts(e.target.value ? Number(e.target.value) : null)}
                                                    label="Retry Attempts"
                                                    placeholder="Number of retry attempts"
                                                    disabled={isReadOnly}
                                                    onInput={sanitizeNumericInput}
                                                    min={0}
                                                />
                                                <Select
                                                    label="Wait Type"
                                                    options={[
                                                        { name: 'Fixed', value: 'fixed' },
                                                        { name: 'Exponential', value: 'exponential' },
                                                    ]}
                                                    currentValue={retryWaitType}
                                                    onChange={e => setRetryWaitType(e.target.value as 'fixed' | 'exponential')}
                                                    placeholder="Select wait type"
                                                    disabled={isReadOnly}
                                                />
                                                <Input
                                                    type="number"
                                                    value={retryMinWait ?? ''}
                                                    onChange={e => setRetryMinWait(e.target.value ? Number(e.target.value) : null)}
                                                    label="Min Wait (seconds)"
                                                    placeholder="Minimum wait between retries"
                                                    disabled={isReadOnly}
                                                    onInput={sanitizeNumericInput}
                                                    min={0}
                                                />
                                                <Input
                                                    type="number"
                                                    value={retryMaxWait ?? ''}
                                                    onChange={e => setRetryMaxWait(e.target.value ? Number(e.target.value) : null)}
                                                    label="Max Wait (seconds)"
                                                    placeholder="Maximum wait between retries"
                                                    disabled={isReadOnly}
                                                    onInput={sanitizeNumericInput}
                                                    min={0}
                                                />
                                                {retryWaitType === 'exponential' && (
                                                    <Input
                                                        type="number"
                                                        value={retryMultiplier ?? ''}
                                                        onChange={e => setRetryMultiplier(e.target.value ? Number(e.target.value) : null)}
                                                        label="Backoff Multiplier"
                                                        placeholder="Exponential backoff multiplier"
                                                        disabled={isReadOnly}
                                                        onInput={sanitizeNumericInput}
                                                        min={0}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Branch Targets Info */}
                                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">Branch Targets</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                                                onSuccess
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                                                onError
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                                onTimeout
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Connect downstream nodes to these branch ports in the canvas.</p>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Section Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* 6. Advanced Monitoring Section (NEW) */}
                        <Collapsible open={sectionsOpen.monitoring} onOpenChange={() => toggleSection('monitoring')}>
                            <CollapsibleTrigger className="w-full flex items-center justify-between py-2 group">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rose-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        Advanced Monitoring
                                    </span>
                                </div>
                                {sectionsOpen.monitoring ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="flex flex-col gap-3">
                                    {/* Connection Check (renamed from Capability Check) */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">Connection Check</Label>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={testConnection}
                                            disabled={isReadOnly || testStatus === 'testing' || !agentCardUrl}
                                            className="w-full gap-2 text-xs"
                                        >
                                            {testStatus === 'testing' ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : testStatus === 'success' ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            ) : testStatus === 'error' ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5" />
                                            )}
                                            Test Connection
                                        </Button>
                                        {testMessage && (
                                            <div className={cn(
                                                'flex items-start gap-2 px-3 py-2 rounded-md text-[11px]',
                                                testStatus === 'success'
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                            )}>
                                                {testStatus === 'success' ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span>{testMessage}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* View Agent Card - KAYA standard button with popup dialog */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">Agent Card</Label>
                                        <Button
                                            size="sm"
                                            onClick={() => setShowAgentCardDialog(true)}
                                            disabled={!agentCard}
                                            className="w-full gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Agent Card
                                        </Button>
                                        <p className="text-[10px] text-gray-400">View the agent&apos;s JSON card for debugging and inspection.</p>
                                    </div>

                                    {/* Provider Info */}
                                    {agentCard.provider && (
                                        <div className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Label className="text-[10px] uppercase tracking-wide text-gray-400">Provider</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                    {agentCard.provider.name}
                                                </span>
                                                {agentCard.provider.url && (
                                                    <a 
                                                        href={agentCard.provider.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                                    >
                                                        Visit
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                            {agentCard.documentationUrl && (
                                                <a 
                                                    href={agentCard.documentationUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 mt-1"
                                                >
                                                    <FileJson className="w-3 h-3" />
                                                    Documentation
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </>
                )}

                {/* Action Buttons */}
                <div className="pt-3 flex flex-col gap-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={isReadOnly || !agentCard} 
                        className="w-full gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Save Configuration
                    </Button>
                    {agentCard && (
                        <Button 
                            variant="outline"
                            onClick={fetchAgentCard}
                            disabled={isReadOnly || fetchStatus === 'loading'}
                            className="w-full gap-2 text-xs"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", fetchStatus === 'loading' && 'animate-spin')} />
                            Refresh Agent Card
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* Agent Card JSON Dialog */}
        <Dialog open={showAgentCardDialog} onOpenChange={setShowAgentCardDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-blue-500" />
                        Agent Card
                    </DialogTitle>
                </DialogHeader>
                <DialogBody className="overflow-auto max-h-[60vh]">
                    <div className="relative">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(agentCard, null, 2));
                                toast.success('Agent Card JSON copied to clipboard');
                            }}
                            className="absolute top-2 right-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Copy JSON"
                        >
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs font-mono overflow-auto text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {JSON.stringify(agentCard, null, 2)}
                        </pre>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
};

export default ExternalAgentForm;
