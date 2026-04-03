'use client';

import React, { useState, useMemo } from 'react';
import {
    Button,
    Badge,
    Label,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/atoms/collapsible';
import { cn } from '@/lib/utils';
import { Copy, Check, Globe, Lock, Shield, ChevronDown, AlertTriangle, FileText, Eye } from 'lucide-react';

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
    workflowSlug?: string;
    config?: A2AIdentityConfig;
    tools?: { id: string; name: string; type: string }[];
    isReadOnly?: boolean;
    onConfigChange?: (config: A2AIdentityConfig) => void;
}

export const A2AIdentityPanel = ({
    agentName = 'Provider Roster Validation Agent',
    agentDescription = 'Ingests, validates, and transforms healthcare provider roster data across 50+ input formats. Applies unified validation rules, credential verification via NPPES/CAQH, and maintains immutable audit trail for CMS/NCQA regulatory compliance.',
    workspaceSlug = 'bgc-workspace',
    workflowSlug = 'bgc-prv',
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

    // Generate A2A URI based on workflow
    const a2aUri = useMemo(() => {
        return `agent://kaya/${workspaceSlug}/${workflowSlug}/provider-roster-validation-v1.4.0`;
    }, [workspaceSlug, workflowSlug]);

    const discoveryEndpoint = useMemo(() => {
        return `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/wf/${workflowSlug}/.well-known/agents`;
    }, [workspaceSlug, workflowSlug]);

    const agentCardPath = useMemo(() => {
        return `/ws/${workspaceSlug}/wf/${workflowSlug}/agents/provider-roster-validation/.well-known/agent-card.json`;
    }, [workspaceSlug, workflowSlug]);

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

    // Generate mock Agent Card JSON based on A2A Protocol spec
    const agentCardJson = useMemo(() => {
        return {
            schemaVersion: '0.3',
            name: agentName || 'Provider Roster Validation Agent',
            description: agentDescription || 'Ingests, validates, and transforms healthcare provider roster data across 50+ input formats. Applies unified validation rules, credential verification via NPPES/CAQH, and maintains immutable audit trail for CMS/NCQA regulatory compliance.',
            url: `https://kaya.techlabsglobal.com/ws/${workspaceSlug}/wf/${workflowSlug}/agents/provider-roster-validation/a2a`,
            version: '1.4.0',
            provider: {
                organization: `TechLabs Global — ${workspaceSlug.toUpperCase()} Workspace`,
            },
            capabilities: {
                streaming: true,
                pushNotifications: true,
                stateTransitionHistory: true,
            },
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                oauth2: { type: 'oauth2', flows: { clientCredentials: { tokenUrl: 'https://kaya.techlabsglobal.com/oauth/token' } } },
            },
            defaultInputModes: ['text/plain', 'application/json'],
            defaultOutputModes: ['application/json', 'text/plain'],
            skills: [
                {
                    id: 'validate-roster-data',
                    name: 'Roster Data Validation',
                    toolType: 'KAYA_EXECUTABLE_FUNCTION',
                    tags: ['healthcare', 'validation', 'roster', 'npi', 'taxonomy'],
                    inputModes: ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                    outputModes: ['application/json'],
                },
                {
                    id: 'nppes-credential-verification',
                    name: 'NPPES Credential Verification',
                    toolType: 'KAYA_REST_API_CONNECTOR',
                    tags: ['rest-api', 'nppes', 'credentialing', 'npi'],
                },
                {
                    id: 'caqh-proview-lookup',
                    name: 'CAQH ProView Provider Lookup',
                    toolType: 'KAYA_REST_API_CONNECTOR',
                    tags: ['rest-api', 'caqh', 'proview', 'credentialing'],
                },
                {
                    id: 'pdm-system-mcp',
                    name: 'Provider Data Management System',
                    toolType: 'KAYA_MCP_CONNECTOR',
                    tags: ['mcp', 'pdm', 'provider-management', 'reconciliation'],
                },
                {
                    id: 'plm-lifecycle-mcp',
                    name: 'Provider Lifecycle Management',
                    toolType: 'KAYA_MCP_CONNECTOR',
                    tags: ['mcp', 'lifecycle', 'onboarding', 'termination'],
                },
                {
                    id: 'compliance-vector-rag',
                    name: 'Healthcare Compliance Knowledge Retrieval',
                    toolType: 'KAYA_VECTOR_RAG',
                    tags: ['vector-rag', 'cms', 'ncqa', 'compliance', 'knowledge-base'],
                },
                {
                    id: 'provider-network-graph-rag',
                    name: 'Provider Network Graph Reasoning',
                    toolType: 'KAYA_GRAPH_RAG',
                    tags: ['graph-rag', 'network-analysis', 'affiliations', 'coverage-gaps'],
                },
                {
                    id: 'roster-db-query',
                    name: 'Roster Database Query',
                    toolType: 'KAYA_DB_CONNECTOR',
                    tags: ['database', 'postgresql', 'reconciliation', 'bulk-ops'],
                },
            ],
        };
    }, [agentName, agentDescription, workspaceSlug, workflowSlug]);

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

    if (!isEnabled) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    A2A IDENTITY
                </span>
            </div>

            {/* Status Badge */}
            <div>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-2.5 py-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">A2A Enabled</span>
                </span>
            </div>

            {/* Agent URI */}
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <code className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
                        {a2aUri}
                    </code>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 flex-shrink-0"
                                onClick={() => copyToClipboard(a2aUri, setCopiedUri)}
                            >
                                {copiedUri ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{copiedUri ? 'Copied!' : 'Copy URI'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Discovery Visibility */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Discovery Visibility
                </Label>
                <div className="flex bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => !isReadOnly && handleSetVisibility('public')}
                        disabled={isReadOnly}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                            visibility === 'public'
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Public
                    </button>
                    <button
                        onClick={() => !isReadOnly && handleSetVisibility('private')}
                        disabled={isReadOnly}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                            visibility === 'private'
                                ? "bg-gray-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        <Lock className="w-3.5 h-3.5" />
                        Private
                    </button>
                </div>
            </div>

            {/* Public: Externally Discoverable */}
            {visibility === 'public' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                            Externally Discoverable
                        </span>
                    </div>
                    
                    {/* Discovery Endpoint */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded px-2 py-1.5">
                            <code className="text-[11px] text-blue-700 dark:text-blue-300 font-mono break-all">
                                {discoveryEndpoint}
                            </code>
                        </div>
                        <button
                            onClick={() => copyToClipboard(discoveryEndpoint, setCopiedDiscovery)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            {copiedDiscovery ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    
                    {/* Agent Card Path */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded px-2 py-1.5">
                            <code className="text-[11px] text-blue-700 dark:text-blue-300 font-mono break-all">
                                {agentCardPath}
                            </code>
                        </div>
                        <button
                            onClick={() => copyToClipboard(agentCardPath, setCopiedAgentCard)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            {copiedAgentCard ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Listed in workflow agent registry · Auth required for full card
                    </p>
                </div>
            )}

            {/* Private: Internal Access Notice */}
            {visibility === 'private' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong className="font-semibold">Internal access only.</strong>{' '}
                        This agent is not listed in the workflow discovery endpoint. It can only be invoked by agents within the <strong>{workspaceSlug.toUpperCase()}</strong> workspace using a scoped bearer token.
                    </p>
                </div>
            )}

            {/* Skill Type Tags */}
            {Object.keys(skillTypeCounts).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(skillTypeCounts).map(([type, count]) => (
                        <Badge
                            key={type}
                            variant="outline"
                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-medium"
                        >
                            {type} {count > 1 ? `×${count}` : ''}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Tool-to-Skill Mapping (Collapsible) */}
            {toolMappings.length > 0 && (
                <Collapsible open={isMappingExpanded} onOpenChange={setIsMappingExpanded}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            Tool-to-Skill Mapping
                            {toolsWithWarnings.length > 0 && (
                                <span className="flex items-center gap-1 text-amber-500">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">{toolsWithWarnings.length}</span>
                                </span>
                            )}
                        </span>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-gray-500 transition-transform",
                            isMappingExpanded && "rotate-180"
                        )} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-4 gap-2">
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Tool</span>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</span>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Skill</span>
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase text-right">Status</span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-40 overflow-y-auto">
                                {toolMappings.map((mapping) => (
                                    <div
                                        key={mapping.toolId}
                                        className={cn(
                                            "px-3 py-2 grid grid-cols-4 gap-2 items-center",
                                            (!mapping.hasMetadata || mapping.warningMessage) && "bg-amber-50 dark:bg-amber-900/10"
                                        )}
                                    >
                                        <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate" title={mapping.toolName}>
                                            {mapping.toolName}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] w-fit">
                                            {mapping.toolType}
                                        </Badge>
                                        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-mono truncate" title={mapping.skillName}>
                                            {mapping.skillName}
                                        </span>
                                        <div className="flex justify-end">
                                            {mapping.hasMetadata && !mapping.warningMessage ? (
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{mapping.warningMessage || 'Missing metadata'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* View A2A Card Button */}
            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        className="w-full"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        View A2A Card
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Agent Card Preview
                        </DialogTitle>
                        {/* Agent Context Info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Workspace:</span>
                                {workspaceSlug}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Workflow:</span>
                                {workflowSlug}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Agent:</span>
                                {agentCardJson.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                v{agentCardJson.version}
                            </Badge>
                        </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-hidden flex flex-col gap-4">
                        {/* Card Metadata */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                                Schema v{agentCardJson.schemaVersion}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                Streaming
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                {agentCardJson.skills.length} Skills
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                Auth Required
                            </Badge>
                        </div>
                        
                        {/* JSON Preview */}
                        <div className="flex-1 overflow-auto bg-gray-900 rounded-lg p-4">
                            <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap">
                                {JSON.stringify(agentCardJson, null, 2)}
                            </pre>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsCardModalOpen(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={copyJson}>
                                {copiedJson ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copiedJson ? 'Copied!' : 'Copy JSON'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
