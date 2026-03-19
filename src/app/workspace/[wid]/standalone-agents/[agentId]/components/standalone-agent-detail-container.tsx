'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { ChevronLeft } from 'lucide-react';
import { MOCK_AGENTS } from '../../mock-data';
import { OverviewTab } from './overview-tab';
import { MonitoringTab } from './monitoring-tab';
import { LogsTab } from './logs-tab';
import { SessionsTab } from './sessions-tab';
import { VersionsTab } from './versions-tab';
import { DeploymentTab } from './deployment-tab';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'logs', label: 'Logs' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'versions', label: 'Versions' },
    { id: 'deployment', label: 'Deployment' },
];

export const StandaloneAgentDetailContainer = () => {
    const params = useParams();
    const router = useRouter();
    const agentId = params.agentId as string;
    const wid = params.wid as string;
    const [activeTab, setActiveTab] = useState('overview');

    const agent = MOCK_AGENTS.find(a => a.id === agentId);

    if (!agent) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
                <p className="text-sm text-muted-foreground">Agent not found: {agentId}</p>
                <Button variant="secondary" size="sm" onClick={() => router.push(`/workspace/${wid}/standalone-agents`)}>
                    <ChevronLeft size={14} className="mr-1" /> Back to Agents
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-y-5 py-6 px-2 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/workspace/${wid}/standalone-agents`)}
                    className="gap-1.5 text-xs text-muted-foreground h-8 px-2"
                >
                    <ChevronLeft size={14} />
                    Standalone Agents
                </Button>
                <span className="text-muted-foreground text-xs">/</span>
                <span className="text-xs text-foreground font-medium">{agent.name}</span>
            </div>

            <div>
                <h1 className="text-lg font-semibold text-foreground">{agent.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{agent.description}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/40 h-9 flex-wrap">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="overview" className="m-0">
                        <OverviewTab agent={agent} />
                    </TabsContent>
                    <TabsContent value="monitoring" className="m-0">
                        <MonitoringTab />
                    </TabsContent>
                    <TabsContent value="logs" className="m-0">
                        <LogsTab />
                    </TabsContent>
                    <TabsContent value="sessions" className="m-0">
                        <SessionsTab />
                    </TabsContent>
                    <TabsContent value="versions" className="m-0">
                        <VersionsTab />
                    </TabsContent>
                    <TabsContent value="deployment" className="m-0">
                        <DeploymentTab agent={agent} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};
