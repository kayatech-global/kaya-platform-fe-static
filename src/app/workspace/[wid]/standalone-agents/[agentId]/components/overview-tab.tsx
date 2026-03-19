'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components';
import { Play, Square, RotateCcw, Trash2, Copy, CheckCheck, ExternalLink, Clock, Cpu, MemoryStick, Layers, Server, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandaloneAgent } from '../../mock-data';

interface OverviewTabProps {
    agent: StandaloneAgent;
}

const statusConfig: Record<string, { label: string; class: string; dotClass: string }> = {
    running: { label: 'Running', class: 'border-green-500/30 text-green-400 bg-green-500/10', dotClass: 'bg-green-400 animate-pulse' },
    stopped: { label: 'Stopped', class: 'border-gray-500/30 text-gray-400 bg-gray-500/10', dotClass: 'bg-gray-400' },
    error: { label: 'Error', class: 'border-red-500/30 text-red-400 bg-red-500/10', dotClass: 'bg-red-400 animate-pulse' },
    deploying: { label: 'Deploying', class: 'border-amber-500/30 text-amber-400 bg-amber-500/10', dotClass: 'bg-amber-400 animate-pulse' },
};

export const OverviewTab = ({ agent }: OverviewTabProps) => {
    const [copied, setCopied] = useState(false);
    const status = statusConfig[agent.status];

    const handleCopy = () => {
        navigator.clipboard.writeText(agent.endpointUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid gap-6">
            {/* Status & Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', status.dotClass)} />
                    <Badge variant="outline" className={cn('text-xs border', status.class)}>
                        {status.label}
                    </Badge>
                </div>
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                    {agent.framework}
                </Badge>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    v{agent.version}
                </Badge>
                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
                        <Play size={12} className="text-green-400" /> Start
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
                        <Square size={12} className="text-gray-400" /> Stop
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
                        <RotateCcw size={12} className="text-blue-400" /> Restart
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8 text-red-400 hover:text-red-300">
                        <Trash2 size={12} /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Config Summary */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {[
                            { label: 'Name', value: agent.name },
                            { label: 'Description', value: agent.description },
                            { label: 'Model', value: agent.model },
                            { label: 'Session Mode', value: agent.sessionMode },
                            { label: 'Created', value: new Date(agent.createdAt).toLocaleDateString() },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-3">
                                <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{item.label}</span>
                                <span className="text-xs text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Runtime Stats */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Runtime Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Clock, label: 'Uptime', value: agent.uptime || '—', color: 'text-green-400' },
                            { icon: Layers, label: 'Replicas', value: String(agent.replicas), color: 'text-blue-400' },
                            { icon: Cpu, label: 'CPU', value: agent.cpu, color: 'text-amber-400' },
                            { icon: MemoryStick, label: 'Memory', value: agent.memory, color: 'text-purple-400' },
                        ].map(stat => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                                    <Icon size={16} className={stat.color} />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                        <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Endpoint & Protocol */}
                <Card className="border-border lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Globe size={14} className="text-blue-400" />
                            Endpoint & Protocol
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                            <code className="text-xs text-blue-300 flex-1 font-mono truncate">{agent.endpointUrl}</code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleCopy}>
                                {copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} className="text-muted-foreground" />}
                            </Button>
                            <a href={agent.endpointUrl} target="_blank" rel="noopener noreferrer" className="h-7 w-7 flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                                <ExternalLink size={13} className="text-muted-foreground" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">A2A</Badge>
                                    <span className="text-xs font-medium text-foreground">Agent-to-Agent Protocol</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Supports Google A2A protocol for peer-to-peer agent communication. 
                                    Agent card available at <code className="text-cyan-400">{agent.endpointUrl}/.well-known/agent.json</code>
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400">ACP</Badge>
                                    <span className="text-xs font-medium text-foreground">Agent Communication Protocol</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    OpenClaw ACP endpoint for cross-platform agent coordination. 
                                    REST API at <code className="text-teal-400">{agent.endpointUrl}/acp/v1</code>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tools & Connectors */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {agent.tools.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No tools configured</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {agent.tools.map(t => (
                                    <Badge key={t} variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/5">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Connectors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {agent.connectors.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No connectors configured</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {agent.connectors.map(c => (
                                    <Badge key={c} variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/5">
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
