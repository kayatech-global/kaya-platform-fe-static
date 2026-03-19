'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components';
import { Button } from '@/components';
import {
    SelectV2 as Select,
    SelectContentV2 as SelectContent,
    SelectItemV2 as SelectItem,
    SelectTriggerV2 as SelectTrigger,
    SelectValueV2 as SelectValue,
} from '@/components/atoms/select-v2';
import { Search, Plus } from 'lucide-react';
import { StandaloneAgentSummaryCards } from './standalone-agent-summary-cards';
import { StandaloneAgentCard } from './standalone-agent-card';
import { CreateAgentWizard } from './standalone-agent-create-wizard';
import { MOCK_AGENTS, AgentStatus, AgentFramework } from '../mock-data';

export const StandaloneAgentListingContainer = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
    const [frameworkFilter, setFrameworkFilter] = useState<AgentFramework | 'all'>('all');
    const [wizardOpen, setWizardOpen] = useState(false);

    const filteredAgents = useMemo(() => {
        return MOCK_AGENTS.filter(agent => {
            const matchesSearch =
                !search ||
                agent.name.toLowerCase().includes(search.toLowerCase()) ||
                agent.description.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
            const matchesFramework = frameworkFilter === 'all' || agent.framework === frameworkFilter;
            return matchesSearch && matchesStatus && matchesFramework;
        });
    }, [search, statusFilter, frameworkFilter]);

    return (
        <div className="w-full flex flex-col gap-y-6 py-6 px-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">Standalone Agents</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Deploy and manage autonomous agents accessible via A2A / ACP protocols
                    </p>
                </div>
                <Button size="sm" onClick={() => setWizardOpen(true)} className="gap-2">
                    <Plus size={14} />
                    Create Agent
                </Button>
            </div>

            <StandaloneAgentSummaryCards agents={MOCK_AGENTS} />

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 text-sm"
                    />
                </div>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as AgentStatus | 'all')}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="stopped">Stopped</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="deploying">Deploying</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={frameworkFilter} onValueChange={v => setFrameworkFilter(v as AgentFramework | 'all')}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Framework" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Frameworks</SelectItem>
                        <SelectItem value="PI Agents">PI Agents</SelectItem>
                        <SelectItem value="OpenClaw">OpenClaw</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground ml-auto">
                    {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                </span>
            </div>

            {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map(agent => (
                        <StandaloneAgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Search size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No agents found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                </div>
            )}

            <CreateAgentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
        </div>
    );
};
