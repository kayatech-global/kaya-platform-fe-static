'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { StatsBar } from './stats-bar';
import { AgentCard } from './agent-card';
import { CreationWizard } from './creation-wizard';
import { mockAgents } from '../mock-data';
import type { AgentFramework, AgentStatus } from '../mock-data';

export const AgentListingContainer = () => {
    const router = useRouter();
    const params = useParams();
    const [search, setSearch] = useState('');
    const [frameworkFilter, setFrameworkFilter] = useState<AgentFramework | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
    const [wizardOpen, setWizardOpen] = useState(false);

    const filteredAgents = useMemo(() => {
        return mockAgents.filter(agent => {
            const matchesSearch =
                agent.name.toLowerCase().includes(search.toLowerCase()) ||
                agent.description.toLowerCase().includes(search.toLowerCase());
            const matchesFramework = frameworkFilter === 'all' || agent.framework === frameworkFilter;
            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
            return matchesSearch && matchesFramework && matchesStatus;
        });
    }, [search, frameworkFilter, statusFilter]);

    const handleAgentClick = (agentId: string) => {
        router.push(`/workspace/${params.wid}/standalone-agents/${agentId}`);
    };

    return (
        <div className="pb-4 max-w-[1280px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Standalone Agents</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Manage external and standalone AI agents connected to your workspace
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setWizardOpen(true)} leadingIcon={<Plus className="h-4 w-4" />}>
                    Create Agent
                </Button>
            </div>

            <StatsBar agents={mockAgents} />

            <div className="flex items-center gap-3 mt-6 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        value={frameworkFilter}
                        onChange={e => setFrameworkFilter(e.target.value as AgentFramework | 'all')}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                    >
                        <option value="all">All Frameworks</option>
                        <option value="pi-agents">PI Agents</option>
                        <option value="openclaw">OpenClaw</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as AgentStatus | 'all')}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                    >
                        <option value="all">All Statuses</option>
                        <option value="running">Running</option>
                        <option value="stopped">Stopped</option>
                        <option value="error">Error</option>
                        <option value="deploying">Deploying</option>
                    </select>
                </div>
            </div>

            {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No agents found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
            )}

            <CreationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
        </div>
    );
};
