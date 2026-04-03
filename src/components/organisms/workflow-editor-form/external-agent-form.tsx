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
} from '@/components/atoms';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
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
    ChevronDown,
    ChevronUp,
    Link2,
    Play,
    XCircle,
    Timer,
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
        retryStrategy?: 'none' | 'linear' | 'exponential';
        maxRetries?: number;
    };
    branchTargets?: {
        onSuccess?: string;
        onError?: string;
        onTimeout?: string;
    };
}

interface ExternalAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

export const ExternalAgentForm = ({ selectedNode, isReadOnly }: ExternalAgentFormProps) => {
    const { updateNodeData } = useReactFlow();
    const { trigger, setTrigger } = useDnD();

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
    const [timeout, setTimeout] = useState<number>(30);
    const [retryStrategy, setRetryStrategy] = useState<'none' | 'linear' | 'exponential'>('none');
    const [maxRetries, setMaxRetries] = useState<number>(3);

    // UI state
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        skills: true,
        auth: true,
        runtime: true,
        branches: false,
    });
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Initialize from node data
    useEffect(() => {
        const data = selectedNode.data as ExternalAgentData;
        if (data) {
            setAgentCardUrl(data.agentCardUrl || '');
            setFriendlyName(data.friendlyName || '');
            setDescription(data.description || '');
            setIconUrl(data.iconUrl || '');
            setSchemaVersion(data.schemaVersion || '');
            setAgentCard(data.agentCard || null);
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
                setTimeout(data.runtimeOptions.timeout || 30);
                setRetryStrategy(data.runtimeOptions.retryStrategy || 'none');
                setMaxRetries(data.runtimeOptions.maxRetries || 3);
            }
            if (data.agentCard) {
                setFetchStatus('success');
            }
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
            setFetchStatus('success');
            toast.success('Agent Card fetched successfully');
        } catch (error) {
            setFetchStatus('error');
            setFetchError('Failed to fetch Agent Card. Please check the URL and try again.');
            toast.error('Failed to fetch Agent Card');
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
    const filteredSkills =
        agentCard?.skills.filter(
            skill =>
                skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
                skill.description?.toLowerCase().includes(skillSearch.toLowerCase()) ||
                skill.tags?.some(tag => tag.toLowerCase().includes(skillSearch.toLowerCase()))
        ) || [];

    // Save node data
    const handleSave = () => {
        if (!validateConfig()) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        const nodeData: ExternalAgentData = {
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
                timeout,
                retryStrategy,
                maxRetries: retryStrategy !== 'none' ? maxRetries : undefined,
            },
        };

        updateNodeData(selectedNode.id, nodeData);
        setTrigger(!trigger);
        toast.success('External Agent configuration saved');
    };

    // Copy URL to clipboard
    const copyUrl = () => {
        navigator.clipboard.writeText(agentCardUrl);
        setCopiedUrl(true);
        window.setTimeout(() => setCopiedUrl(false), 2000);
    };

    // Toggle section expansion
    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
            <div className="external-agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
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
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Friendly Name</Label>
                                <Input
                                    value={friendlyName}
                                    onChange={e => setFriendlyName(e.target.value)}
                                    placeholder="Agent name"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Schema Version</Label>
                                <Input value={schemaVersion} disabled className="bg-gray-100 dark:bg-gray-800" />
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

                        {/* Icon Preview */}
                        {iconUrl && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {friendlyName}
                                    </span>
                                    <span className="text-xs text-gray-500">v{agentCard.version}</span>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {agentCard.capabilities?.streaming && (
                                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                            Streaming
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skills Selection Section */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection('skills')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-violet-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Remote Skills
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedSkills.length}/{agentCard.skills.length}
                                    </Badge>
                                </div>
                                {expandedSections.skills ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {expandedSections.skills && (
                                <div className="p-3 flex flex-col gap-3">
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
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSkills.map(skill => (
                                                <Badge
                                                    key={skill.id}
                                                    variant="outline"
                                                    className="gap-1 pr-1 bg-violet-500/10 text-violet-400 border-violet-500/30"
                                                >
                                                    {skill.name}
                                                    <button
                                                        onClick={() => toggleSkill(skill)}
                                                        className="ml-1 hover:bg-violet-500/20 rounded p-0.5"
                                                        disabled={isReadOnly}
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skill list */}
                                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                                        {filteredSkills.map(skill => (
                                            <div
                                                key={skill.id}
                                                onClick={() => toggleSkill(skill)}
                                                className={cn(
                                                    'p-3 rounded-lg border cursor-pointer transition-all',
                                                    selectedSkills.find(s => s.id === skill.id)
                                                        ? 'border-violet-500 bg-violet-500/10'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={!!selectedSkills.find(s => s.id === skill.id)}
                                                                disabled={isReadOnly}
                                                            />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                {skill.name}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn('text-xs', getToolTypeBadgeColor(skill.toolType))}
                                                            >
                                                                {skill.toolType}
                                                            </Badge>
                                                        </div>
                                                        {skill.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                                {skill.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2 ml-6">
                                                            {skill.inputModes && (
                                                                <span className="text-xs text-gray-400">
                                                                    In: {skill.inputModes.join(', ')}
                                                                </span>
                                                            )}
                                                            {skill.outputModes && (
                                                                <span className="text-xs text-gray-400">
                                                                    Out: {skill.outputModes.join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {skill.tags && skill.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2 ml-6">
                                                                {skill.tags.map(tag => (
                                                                    <Badge
                                                                        key={tag}
                                                                        variant="secondary"
                                                                        className="text-xs px-1.5 py-0"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Authentication Section */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection('auth')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Authentication
                                    </span>
                                </div>
                                {expandedSections.auth ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {expandedSections.auth && (
                                <div className="p-3 flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
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
                                    </div>

                                    {authType === 'bearer' && (
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                Secret Reference
                                            </Label>
                                            <Input
                                                value={secretRef}
                                                onChange={e => setSecretRef(e.target.value)}
                                                placeholder="vault://secrets/agent-token"
                                                disabled={isReadOnly}
                                            />
                                            <span className="text-xs text-gray-400">
                                                Reference to your secrets vault
                                            </span>
                                        </div>
                                    )}

                                    {authType === 'oauth2' && (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">Client ID</Label>
                                                <Input
                                                    value={clientId}
                                                    onChange={e => setClientId(e.target.value)}
                                                    placeholder="client_id"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Client Secret Reference
                                                </Label>
                                                <Input
                                                    value={clientSecret}
                                                    onChange={e => setClientSecret(e.target.value)}
                                                    placeholder="vault://secrets/client-secret"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
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
                            )}
                        </div>

                        {/* Runtime Options Section */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection('runtime')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Runtime Options
                                    </span>
                                </div>
                                {expandedSections.runtime ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {expandedSections.runtime && (
                                <div className="p-3 flex flex-col gap-4">
                                    {/* Streaming toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm text-gray-700 dark:text-gray-200">
                                                Enable Streaming
                                            </Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-3 h-3 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Stream responses as they are generated
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Switch
                                            checked={streaming}
                                            onCheckedChange={setStreaming}
                                            disabled={isReadOnly || !agentCard.capabilities?.streaming}
                                        />
                                    </div>

                                    {/* Timeout slider */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-gray-700 dark:text-gray-200">
                                                Timeout
                                            </Label>
                                            <span className="text-sm text-gray-500">{timeout}s</span>
                                        </div>
                                        <Slider
                                            value={[timeout]}
                                            onValueChange={([v]) => setTimeout(v)}
                                            min={5}
                                            max={300}
                                            step={5}
                                            disabled={isReadOnly}
                                        />
                                    </div>

                                    {/* Retry strategy */}
                                    <div className="flex flex-col gap-2">
                                        <Select
                                            label="Retry Strategy"
                                            currentValue={retryStrategy}
                                            onChange={(e) => setRetryStrategy(e.target.value as 'none' | 'linear' | 'exponential')}
                                            disabled={isReadOnly}
                                            options={[
                                                { name: 'No Retry', value: 'none' },
                                                { name: 'Linear Backoff', value: 'linear' },
                                                { name: 'Exponential Backoff', value: 'exponential' },
                                            ]}
                                        />
                                    </div>

                                    {retryStrategy !== 'none' && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm text-gray-700 dark:text-gray-200">
                                                    Max Retries
                                                </Label>
                                                <span className="text-sm text-gray-500">{maxRetries}</span>
                                            </div>
                                            <Slider
                                                value={[maxRetries]}
                                                onValueChange={([v]) => setMaxRetries(v)}
                                                min={1}
                                                max={10}
                                                step={1}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    )}

                                    {/* Branch targets */}
                                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Label className="text-sm text-gray-700 dark:text-gray-200">
                                            Branch Targets
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className="gap-1 bg-green-500/10 text-green-400 border-green-500/30"
                                            >
                                                <Play className="w-3 h-3" />
                                                onSuccess
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="gap-1 bg-red-500/10 text-red-400 border-red-500/30"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                onError
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/30"
                                            >
                                                <Timer className="w-3 h-3" />
                                                onTimeout
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            Connect edges from these output ports to handle different outcomes
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Save Button */}
                <div className="pt-3">
                    <Button onClick={handleSave} disabled={isReadOnly || !agentCard} className="w-full">
                        Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExternalAgentForm;
