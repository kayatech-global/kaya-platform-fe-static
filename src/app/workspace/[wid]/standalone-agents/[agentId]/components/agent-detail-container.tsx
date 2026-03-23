'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { LayoutDashboard, Activity, ScrollText, Users, History } from 'lucide-react';
import { mockAgents } from '../../mock-data';
import { OverviewTab } from './overview-tab';
import { MonitoringTab } from './monitoring-tab';
import { LogsTab } from './logs-tab';
import { SessionsTab } from './sessions-tab';
import { VersionsTab } from './versions-tab';

export const AgentDetailContainer = () => {
    const params = useParams();
    const agent = mockAgents.find(a => a.id === params.agentId) ?? mockAgents[0];

    return (
        <div className="pb-4">
            <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                    <TabsTrigger value="overview" className="gap-1.5 text-xs">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="gap-1.5 text-xs">
                        <Activity className="h-3.5 w-3.5" />
                        Monitoring
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-1.5 text-xs">
                        <ScrollText className="h-3.5 w-3.5" />
                        Logs
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="gap-1.5 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        Sessions
                    </TabsTrigger>
                    <TabsTrigger value="versions" className="gap-1.5 text-xs">
                        <History className="h-3.5 w-3.5" />
                        Versions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <OverviewTab agent={agent} />
                </TabsContent>
                <TabsContent value="monitoring">
                    <MonitoringTab />
                </TabsContent>
                <TabsContent value="logs">
                    <LogsTab />
                </TabsContent>
                <TabsContent value="sessions">
                    <SessionsTab />
                </TabsContent>
                <TabsContent value="versions">
                    <VersionsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};
