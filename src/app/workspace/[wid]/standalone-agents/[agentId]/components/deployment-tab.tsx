'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Container, Server, Layers, Cpu, MemoryStick, Variable } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandaloneAgent } from '../../mock-data';

interface DeploymentTabProps {
    agent: StandaloneAgent;
}

const podStatuses = [
    { name: 'agent-pod-1', status: 'Running', ready: true, restarts: 0, age: '14d' },
    { name: 'agent-pod-2', status: 'Running', ready: true, restarts: 1, age: '14d' },
];

export const DeploymentTab = ({ agent }: DeploymentTabProps) => {
    return (
        <div className="grid gap-6">
            {/* Docker Image */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Container size={14} className="text-blue-400" />
                        Container Image
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <code className="text-sm font-mono text-blue-300">{agent.image}</code>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                        <div>
                            <p className="text-muted-foreground mb-1">Registry</p>
                            <p className="text-foreground font-medium">kayatech (private)</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Pull Policy</p>
                            <p className="text-foreground font-medium">IfNotPresent</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Port</p>
                            <p className="text-foreground font-medium">8080 / TCP</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* K8s Info */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Server size={14} className="text-blue-400" />
                        Kubernetes Deployment
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="text-muted-foreground mb-1">Namespace</p>
                            <code className="text-foreground font-mono font-medium">{agent.namespace}</code>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Deployment Name</p>
                            <code className="text-foreground font-mono font-medium">kaya-agent-{agent.id}</code>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Service Name</p>
                            <code className="text-foreground font-mono font-medium">svc-agent-{agent.id}</code>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Replicas</p>
                            <p className="text-foreground font-medium">{agent.replicas} / {agent.replicas}</p>
                        </div>
                    </div>

                    {/* Pod Status */}
                    <div>
                        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Pods</p>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border">
                                        <th className="text-left p-2.5 font-medium text-muted-foreground">Pod Name</th>
                                        <th className="text-left p-2.5 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-2.5 font-medium text-muted-foreground">Ready</th>
                                        <th className="text-left p-2.5 font-medium text-muted-foreground">Restarts</th>
                                        <th className="text-left p-2.5 font-medium text-muted-foreground">Age</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {podStatuses.slice(0, agent.replicas).map(pod => (
                                        <tr key={pod.name} className="border-b border-border/50 hover:bg-muted/20">
                                            <td className="p-2.5 font-mono text-foreground">{pod.name}</td>
                                            <td className="p-2.5">
                                                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                                                    {pod.status}
                                                </Badge>
                                            </td>
                                            <td className="p-2.5 text-green-400 font-medium">1/1</td>
                                            <td className="p-2.5 text-muted-foreground">{pod.restarts}</td>
                                            <td className="p-2.5 text-muted-foreground">{pod.age}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Limits */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Layers size={14} className="text-blue-400" />
                            Resource Limits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-xs">
                        {[
                            { icon: Cpu, label: 'CPU Request', value: agent.cpu, color: 'text-amber-400' },
                            { icon: Cpu, label: 'CPU Limit', value: String(parseInt(agent.cpu) * 2) + 'm', color: 'text-amber-400' },
                            { icon: MemoryStick, label: 'Memory Request', value: agent.memory, color: 'text-purple-400' },
                            { icon: MemoryStick, label: 'Memory Limit', value: agent.memory, color: 'text-purple-400' },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
                                    <Icon size={14} className={item.color} />
                                    <div>
                                        <p className="text-muted-foreground text-[10px]">{item.label}</p>
                                        <p className="text-foreground font-semibold font-mono">{item.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Environment Variables */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Variable size={14} className="text-blue-400" />
                            Environment Variables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {agent.envVars.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No environment variables configured.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {agent.envVars.map((env, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs font-mono">
                                        <span className="text-amber-400 font-semibold">{env.key}</span>
                                        <span className="text-muted-foreground">=</span>
                                        <span className="text-foreground">{env.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
