'use client';

import React, { useState, useMemo } from 'react';
import {
    Button,
    Badge,
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
    workspaceSlug?: string;
    config?: A2AIdentityConfig;
    tools?: { id: string; name: string; type: string }[];
    isReadOnly?: boolean;
    onConfigChange?: (config: A2AIdentityConfig) => void;
}

export const A2AIdentityPanel = ({
    agentName = 'My Agent',
    agentDescription = 'Agent description',
    workspaceSlug = 'bgc',
    config,
    tools = [],
    isReadOnly = false,
    onConfigChange,
}: A2AIdentityPanelProps) => {
    // Default config if not provided
    const defaultConfig: A2AIdentityConfig = {
        enabled: true,
        uri: '',
        schemaVersion: '1.0',
        discoveryVisibility: 'public',
        skills: [],
        streaming: true,
        authRequired: true,
        toolMappings: [],
    };

    const currentConfig = config || defaultConfig;

    // Local state
    const [isEnabled] = useState(currentConfig.enabled);
    const [visibility, setVisibility] = useState<'public' | 'private'>(currentConfig.discoveryVisibility);
    const [copiedUri, setCopiedUri] = useState(false);
    const [copiedDiscovery, setCopiedDiscovery] = useState(false);
    const [copiedAgentCard, setCopiedAgentCard] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isMappingExpanded, setIsMappingExpanded] = useState(false);

    // Generate A2A URI based on agent name
    const agentSlug = useMemo(() => {
        if (!agentName) return '';
        return agentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }, [agentName]);

    const a2aUri = useMemo(() => {
        return `agent://kaya/${workspaceSlug}/${agentSlug}-v1`;
    }, [workspaceSlug, agentSlug]);

    const discoveryEndpoint = useMemo(() => {
        return `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/.well-known/agents`;
    }, [workspaceSlug]);

    const agentCardPath = useMemo(() => {
        return `/ws/${workspaceSlug}/agents/${agentSlug}/.well-known/agent-card.json`;
    }, [workspaceSlug, agentSlug]);

    // Aggregate skill types from tools with counts
    const skillTypeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        tools.forEach(tool => {
            let type = '';
            if (tool.type === 'API') type = 'REST API';
            else if (tool.type === 'MCP') type = 'MCP';
            else if (tool.type === 'VECTOR_RAG') type = 'Vector RAG';
            else if (tool.type === 'GRAPH_RAG') type = 'Graph RAG';
            else if (tool.type === 'EXECUTABLE_FUNCTION') type = 'Function';
            else if (tool.type === 'CONNECTOR') type = 'DB Connector';
            else type = tool.type;
            
            if (type) {
                counts[type] = (counts[type] || 0) + 1;
            }
        });
        return counts;
    }, [tools]);

    // Mock tool mappings for display
    const toolMappings: A2AToolMapping[] = useMemo(() => {
        return tools.map(tool => ({
            toolId: tool.id,
            toolName: tool.name,
            toolType: tool.type as A2AToolMapping['toolType'],
            skillName: tool.name?.replace(/\s+/g, '_').toLowerCase(),
            skillDescription: `Skill derived from ${tool.name}`,
            hasMetadata: Math.random() > 0.3,
            warningMessage: Math.random() > 0.7 ? 'Missing skill description' : undefined,
        }));
    }, [tools]);

    const toolsWithWarnings = toolMappings.filter(t => !t.hasMetadata || t.warningMessage);

    // Generate mock Agent Card JSON
    const agentCardJson = useMemo(() => {
        return {
            name: agentName,
            description: agentDescription,
            url: `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/agents/${agentSlug}`,
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
    }, [agentName, agentDescription, workspaceSlug, agentSlug, tools]);

    // Handlers
    const handleSetVisibility = (newVisibility: 'public' | 'private') => {
        setVisibility(newVisibility);
        onConfigChange?.({
            ...currentConfig,
            discoveryVisibility: newVisibility,
        });
    };

    const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const copyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(agentCardJson, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    // Icons as inline SVGs for consistency with mockup
    const ShieldIcon = () => (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z"/>
        </svg>
    );

    const CopyIcon = () => (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
    );

    const CheckIcon = () => (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
    );

    const GlobeIcon = () => (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
    );

    const LockIcon = () => (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
    );

    const FileIcon = () => (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
    );

    const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
        <svg className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
    );

    const WarningIcon = () => (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
    );

    if (!isEnabled) {
        return null;
    }

    return (
        <div className="relative bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-y border-sky-200 dark:border-sky-800 p-4">
            {/* NEW Badge */}
            <span className="absolute top-3 right-4 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                NEW
            </span>

            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-sky-500 rounded-md flex items-center justify-center text-white">
                    <ShieldIcon />
                </div>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                    A2A Identity
                </span>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">A2A Enabled</span>
                </span>
            </div>

            {/* Agent URI Chip */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-sky-100 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-700 rounded-md px-2 py-1.5">
                    <span className="text-[11px] font-mono text-sky-800 dark:text-sky-200 break-all leading-tight">
                        {a2aUri}
                    </span>
                </div>
                <button
                    onClick={() => copyToClipboard(a2aUri, setCopiedUri)}
                    className="w-7 h-7 bg-sky-100 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-700 rounded-md flex items-center justify-center text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors flex-shrink-0"
                    title="Copy A2A URI"
                >
                    {copiedUri ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>

            {/* Discovery Visibility Toggle */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                    Discovery Visibility
                </span>
                <div className="flex bg-sky-100 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-700 rounded-lg p-0.5 gap-0.5">
                    <button
                        onClick={() => !isReadOnly && handleSetVisibility('public')}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                            visibility === 'public'
                                ? "bg-green-500 text-white shadow-sm"
                                : "text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800"
                        )}
                    >
                        <GlobeIcon />
                        Public
                    </button>
                    <button
                        onClick={() => !isReadOnly && handleSetVisibility('private')}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                            visibility === 'private'
                                ? "bg-gray-500 text-white shadow-sm"
                                : "text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800"
                        )}
                    >
                        <LockIcon />
                        Private
                    </button>
                </div>
            </div>

            {/* Public: Externally Discoverable Box */}
            {visibility === 'public' && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                        <GlobeIcon />
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">
                            Externally Discoverable (US-A2A-004)
                        </span>
                    </div>
                    
                    {/* Discovery Endpoint URL */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex-1 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded px-2 py-1">
                            <span className="text-[10px] font-mono text-green-800 dark:text-green-200 break-all leading-tight">
                                {discoveryEndpoint}
                            </span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(discoveryEndpoint, setCopiedDiscovery)}
                            className="w-5 h-5 bg-green-200 dark:bg-green-800 border border-green-300 dark:border-green-700 rounded flex items-center justify-center text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700 transition-colors flex-shrink-0"
                            title="Copy discovery endpoint"
                        >
                            {copiedDiscovery ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                    
                    {/* Agent Card Path */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex-1 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded px-2 py-1">
                            <span className="text-[10px] font-mono text-green-800 dark:text-green-200 break-all leading-tight">
                                {agentCardPath}
                            </span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(agentCardPath, setCopiedAgentCard)}
                            className="w-5 h-5 bg-green-200 dark:bg-green-800 border border-green-300 dark:border-green-700 rounded flex items-center justify-center text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700 transition-colors flex-shrink-0"
                            title="Copy agent card endpoint"
                        >
                            {copiedAgentCard ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                    
                    <p className="text-[10px] text-green-600 dark:text-green-400">
                        🌐 Listed in workspace agent registry · Auth required for full card
                    </p>
                </div>
            )}

            {/* Private: Internal Access Notice */}
            {visibility === 'private' && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                    <div className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                        <LockIcon />
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong className="text-amber-600 dark:text-amber-400">Internal access only (US-A2A-005).</strong>{' '}
                        This agent is not listed in the workspace discovery endpoint. It can only be invoked by agents within the <strong>{workspaceSlug.toUpperCase()} workspace</strong> using a scoped bearer token.
                    </p>
                </div>
            )}

            {/* Skill Type Tags */}
            {Object.keys(skillTypeCounts).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(skillTypeCounts).map(([type, count]) => (
                        <span
                            key={type}
                            className="bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-[10px] font-medium px-1.5 py-0.5 rounded"
                        >
                            {type} {count > 1 ? `×${count}` : ''}
                        </span>
                    ))}
                </div>
            )}

            {/* Tool-to-Skill Mapping Table (Collapsible) */}
            {toolMappings.length > 0 && (
                <div className="mb-3">
                    <button
                        onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                        className="flex items-center justify-between w-full text-left py-1.5"
                    >
                        <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                            Tool-to-Skill Mapping
                            {toolsWithWarnings.length > 0 && (
                                <span className="text-amber-500 flex items-center gap-0.5">
                                    <WarningIcon />
                                    <span className="text-[10px]">{toolsWithWarnings.length}</span>
                                </span>
                            )}
                        </span>
                        <ChevronIcon expanded={isMappingExpanded} />
                    </button>
                    
                    {isMappingExpanded && (
                        <div className="mt-2 border border-sky-200 dark:border-sky-800 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-sky-50 dark:bg-sky-950/50">
                                        <TableHead className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 py-2 px-2">Tool</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 py-2 px-2">Type</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 py-2 px-2">Skill</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 py-2 px-2 w-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {toolMappings.map((mapping) => (
                                        <TableRow
                                            key={mapping.toolId}
                                            className={cn(
                                                "text-[10px]",
                                                (!mapping.hasMetadata || mapping.warningMessage) && "bg-amber-50 dark:bg-amber-950/20"
                                            )}
                                        >
                                            <TableCell className="py-1.5 px-2 font-medium text-gray-700 dark:text-gray-200">
                                                {mapping.toolName}
                                            </TableCell>
                                            <TableCell className="py-1.5 px-2">
                                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                                    {mapping.toolType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-1.5 px-2 font-mono text-gray-600 dark:text-gray-400">
                                                {mapping.skillName}
                                            </TableCell>
                                            <TableCell className="py-1.5 px-2">
                                                {(!mapping.hasMetadata || mapping.warningMessage) && (
                                                    <span className="text-amber-500" title={mapping.warningMessage || 'Missing metadata'}>
                                                        <WarningIcon />
                                                    </span>
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

            {/* View A2A Card Button */}
            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogTrigger asChild>
                    <button className="w-full py-2 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:from-sky-600 hover:to-cyan-600 transition-all">
                        <FileIcon />
                        View A2A Card
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                                <FileIcon />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                                    A2A Agent Card
                                </DialogTitle>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {agentName} · Schema v{agentCardJson.schemaVersion}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    {/* Meta Chips */}
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1">
                            <span className="text-[10px] text-gray-500">Schema</span>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">v{agentCardJson.schemaVersion}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1">
                            <span className="text-[10px] text-gray-500">Skills</span>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">{agentCardJson.skills.length}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Streaming</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1">
                            <span className="text-[10px] text-gray-500">Auth</span>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Bearer, OAuth2</span>
                        </div>
                    </div>
                    
                    {/* JSON Preview */}
                    <div className="flex-1 overflow-y-auto bg-slate-900 p-4">
                        <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(agentCardJson, null, 2)}
                        </pre>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-[11px] text-gray-500">
                            Based on <a href="https://google.github.io/A2A" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">A2A Protocol Spec</a>
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={copyJson}>
                                {copiedJson ? <CheckIcon /> : <CopyIcon />}
                                <span className="ml-1.5">{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsCardModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
