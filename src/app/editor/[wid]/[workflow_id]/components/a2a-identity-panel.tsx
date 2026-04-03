'use client';

import React, { useState, useMemo } from 'react';
import {
    Button,
    Badge,
    Switch,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/molecules/table/table';
import { cn } from '@/lib/utils';
import {
    Copy,
    Check,
    Info,
    ChevronDown,
    ChevronUp,
    Eye,
    Globe,
    Lock,
    AlertTriangle,
    Zap,
    Link2,
    Shield,
    FileJson,
    Server,
} from 'lucide-react';

// Types for A2A Identity
export interface A2AToolMapping {
    toolId: string;
    toolName: string;
    toolType: 'API' | 'MCP' | 'Vector RAG' | 'Graph RAG' | 'Executable' | 'Connector';
    skillName?: string;
    skillDescription?: string;
    hasMetadata: boolean;
    warningMessage?: string;
}

export interface A2AIdentityConfig {
    enabled: boolean;
    uri?: string;
    schemaVersion: string;
    discoveryVisibility: 'public' | 'private';
    skills: string[];
    streaming: boolean;
    authRequired: boolean;
    toolMappings: A2AToolMapping[];
}

interface A2AIdentityPanelProps {
    agentName?: string;
    agentDescription?: string;
    config?: A2AIdentityConfig;
    tools?: { id: string; name: string; type: string }[];
    isReadOnly?: boolean;
    onConfigChange?: (config: A2AIdentityConfig) => void;
}

export const A2AIdentityPanel = ({
    agentName = 'My Agent',
    agentDescription = 'Agent description',
    config,
    tools = [],
    isReadOnly = false,
    onConfigChange,
}: A2AIdentityPanelProps) => {
    // Default config if not provided
    const defaultConfig: A2AIdentityConfig = {
        enabled: false,
        uri: '',
        schemaVersion: '1.0',
        discoveryVisibility: 'private',
        skills: [],
        streaming: true,
        authRequired: true,
        toolMappings: [],
    };

    const currentConfig = config || defaultConfig;

    // Local state
    const [isEnabled, setIsEnabled] = useState(currentConfig.enabled);
    const [visibility, setVisibility] = useState<'public' | 'private'>(currentConfig.discoveryVisibility);
    const [copiedUri, setCopiedUri] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMappingExpanded, setIsMappingExpanded] = useState(false);

    // Generate A2A URI based on agent name
    const a2aUri = useMemo(() => {
        if (!agentName) return '';
        const slug = agentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `https://api.kaya.ai/agents/${slug}/.well-known/agent.json`;
    }, [agentName]);

    // Aggregate skill types from tools
    const skillTypes = useMemo(() => {
        const types = new Set<string>();
        tools.forEach(tool => {
            if (tool.type === 'API') types.add('REST');
            else if (tool.type === 'MCP') types.add('MCP');
            else if (tool.type === 'VECTOR_RAG') types.add('Vector RAG');
            else if (tool.type === 'GRAPH_RAG') types.add('Graph RAG');
            else if (tool.type === 'EXECUTABLE_FUNCTION') types.add('Executable');
            else if (tool.type === 'CONNECTOR') types.add('Connector');
        });
        return Array.from(types);
    }, [tools]);

    // Mock tool mappings for display
    const toolMappings: A2AToolMapping[] = useMemo(() => {
        return tools.map(tool => ({
            toolId: tool.id,
            toolName: tool.name,
            toolType: tool.type as A2AToolMapping['toolType'],
            skillName: tool.name?.replace(/\s+/g, '_').toLowerCase(),
            skillDescription: `Skill derived from ${tool.name}`,
            hasMetadata: Math.random() > 0.3, // Mock: some tools missing metadata
            warningMessage: Math.random() > 0.7 ? 'Missing skill description' : undefined,
        }));
    }, [tools]);

    const toolsWithWarnings = toolMappings.filter(t => !t.hasMetadata || t.warningMessage);

    // Generate mock Agent Card JSON
    const agentCardJson = useMemo(() => {
        return {
            name: agentName,
            description: agentDescription,
            url: a2aUri.replace('/.well-known/agent.json', ''),
            version: '1.0.0',
            schemaVersion: '1.0',
            provider: {
                name: 'KAYA Platform',
                url: 'https://kaya.ai',
            },
            documentationUrl: 'https://docs.kaya.ai/agents',
            capabilities: {
                streaming: true,
                pushNotifications: false,
                stateTransitionHistory: true,
            },
            authentication: {
                schemes: ['bearer', 'oauth2'],
            },
            defaultInputModes: ['text', 'data'],
            defaultOutputModes: ['text', 'data'],
            skills: tools.slice(0, 5).map((tool, idx) => ({
                id: `skill-${idx + 1}`,
                name: tool.name?.replace(/\s+/g, '_').toLowerCase() || `skill_${idx + 1}`,
                description: `Skill capability for ${tool.name}`,
                tags: [tool.type?.toLowerCase() || 'general'],
                inputModes: ['text'],
                outputModes: ['text'],
            })),
        };
    }, [agentName, agentDescription, a2aUri, tools]);

    // Handlers
    const handleToggleEnabled = (checked: boolean) => {
        setIsEnabled(checked);
        onConfigChange?.({
            ...currentConfig,
            enabled: checked,
            uri: checked ? a2aUri : '',
        });
    };

    const handleToggleVisibility = () => {
        const newVisibility = visibility === 'public' ? 'private' : 'public';
        setVisibility(newVisibility);
        onConfigChange?.({
            ...currentConfig,
            discoveryVisibility: newVisibility,
        });
    };

    const copyUri = () => {
        navigator.clipboard.writeText(a2aUri);
        setCopiedUri(true);
        setTimeout(() => setCopiedUri(false), 2000);
    };

    const copyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(agentCardJson, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    const getToolTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'API':
            case 'REST':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'MCP':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Vector RAG':
            case 'VECTOR_RAG':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Graph RAG':
            case 'GRAPH_RAG':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Executable':
            case 'EXECUTABLE_FUNCTION':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'Connector':
            case 'CONNECTOR':
                return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">A2A Identity</span>
                    <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                        NEW
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-xs',
                            isEnabled
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        )}
                    >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 flex flex-col gap-4">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-gray-200">Enable A2A Protocol</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        Enable this agent to be discovered and invoked by other agents using the Agent-to-Agent (A2A) protocol
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Switch checked={isEnabled} onCheckedChange={handleToggleEnabled} disabled={isReadOnly} />
                    </div>

                    {isEnabled && (
                        <>
                            {/* URI Chip */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400">Agent Card URI</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Server className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
                                            {a2aUri}
                                        </span>
                                    </div>
                                    <button
                                        onClick={copyUri}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        disabled={isReadOnly}
                                    >
                                        {copiedUri ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Skill Type Tags */}
                            {skillTypes.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Exposed Skills</label>
                                    <div className="flex flex-wrap gap-1">
                                        {skillTypes.map(type => (
                                            <Badge
                                                key={type}
                                                variant="outline"
                                                className={cn('text-xs', getToolTypeBadgeColor(type))}
                                            >
                                                {type}
                                            </Badge>
                                        ))}
                                        <Badge variant="secondary" className="text-xs">
                                            {tools.length} total
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Discovery Visibility Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {visibility === 'public' ? (
                                        <Globe className="w-4 h-4 text-blue-400" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-amber-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-200">Discovery Visibility</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-3 h-3 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[250px]">
                                                <p className="font-medium mb-1">Discovery Visibility</p>
                                                <p className="text-xs">
                                                    <strong>Public:</strong> Agent is discoverable in the A2A registry
                                                </p>
                                                <p className="text-xs">
                                                    <strong>Private:</strong> Agent requires explicit URI sharing
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs cursor-pointer transition-colors',
                                            visibility === 'public'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        )}
                                        onClick={() => !isReadOnly && handleToggleVisibility()}
                                    >
                                        {visibility === 'public' ? 'Public' : 'Private'}
                                    </Badge>
                                </div>
                            </div>

                            {/* View A2A Card CTA */}
                            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full gap-2">
                                        <Eye className="w-4 h-4" />
                                        View A2A Card
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <FileJson className="w-5 h-5 text-violet-500" />
                                            Agent Card Preview
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Card Info Header */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                        {agentName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Schema v{agentCardJson.schemaVersion}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                >
                                                    {agentCardJson.skills.length} Skills
                                                </Badge>
                                                {agentCardJson.capabilities.streaming && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                    >
                                                        <Zap className="w-3 h-3 mr-1" />
                                                        Streaming
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                >
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Auth Required
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* JSON Preview */}
                                        <div className="relative">
                                            <button
                                                onClick={copyJson}
                                                className="absolute top-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors z-10"
                                            >
                                                {copiedJson ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-300" />
                                                )}
                                            </button>
                                            <pre className="p-4 bg-gray-900 rounded-lg text-xs text-gray-300 overflow-x-auto font-mono">
                                                {JSON.stringify(agentCardJson, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Tool-to-Skill Mapping Table */}
                            {toolMappings.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                Tool-to-Skill Mappings
                                            </span>
                                            {toolsWithWarnings.length > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                >
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    {toolsWithWarnings.length} warnings
                                                </Badge>
                                            )}
                                        </div>
                                        {isMappingExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {isMappingExpanded && (
                                        <div className="max-h-[200px] overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                                                        <TableHead className="text-xs">Tool</TableHead>
                                                        <TableHead className="text-xs">Type</TableHead>
                                                        <TableHead className="text-xs">Skill Name</TableHead>
                                                        <TableHead className="text-xs">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {toolMappings.map(mapping => (
                                                        <TableRow
                                                            key={mapping.toolId}
                                                            className={cn(
                                                                !mapping.hasMetadata || mapping.warningMessage
                                                                    ? 'bg-amber-500/5'
                                                                    : ''
                                                            )}
                                                        >
                                                            <TableCell className="text-xs font-medium">
                                                                {mapping.toolName}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[10px]',
                                                                        getToolTypeBadgeColor(mapping.toolType)
                                                                    )}
                                                                >
                                                                    {mapping.toolType}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-gray-500 font-mono">
                                                                {mapping.skillName}
                                                            </TableCell>
                                                            <TableCell>
                                                                {!mapping.hasMetadata || mapping.warningMessage ? (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {mapping.warningMessage ||
                                                                                    'Missing metadata'}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ) : (
                                                                    <Check className="w-4 h-4 text-green-400" />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default A2AIdentityPanel;
