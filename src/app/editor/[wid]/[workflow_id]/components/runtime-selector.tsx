'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Server, Cloud, ChevronDown, Check, ExternalLink, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/atoms/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/atoms/popover';
import { Button } from '@/components';
import { ExecutionRuntimeForm } from '@/app/workspace/[wid]/execution-runtimes/components/execution-runtime-form';
import { ExecutionRuntimeData } from '@/mocks/execution-runtimes-data';

interface RuntimeOption {
    id: string;
    name: string;
    provider: 'kaya-runtime' | 'aws-agentcore';
    region?: string;
    status: 'active' | 'provisioning' | 'error' | 'inactive';
}

const initialRuntimeOptions: RuntimeOption[] = [
    {
        id: 'rt-001',
        name: 'kaya-default-runtime',
        provider: 'kaya-runtime',
        status: 'active',
    },
    {
        id: 'rt-002',
        name: 'agentcore-production',
        provider: 'aws-agentcore',
        region: 'us-east-1',
        status: 'active',
    },
    {
        id: 'rt-003',
        name: 'agentcore-staging',
        provider: 'aws-agentcore',
        region: 'us-west-2',
        status: 'active',
    },
    {
        id: 'rt-004',
        name: 'agentcore-eu-prod',
        provider: 'aws-agentcore',
        region: 'eu-central-1',
        status: 'provisioning',
    },
];

export const RuntimeSelector = () => {
    const params = useParams();
    const router = useRouter();
    const wid = params.wid as string;

    const [runtimeOptions, setRuntimeOptions] = useState<RuntimeOption[]>(initialRuntimeOptions);
    const [selectedRuntime, setSelectedRuntime] = useState<RuntimeOption>(initialRuntimeOptions[0]);
    const [open, setOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleSelect = (runtime: RuntimeOption) => {
        if (runtime.status !== 'active') return;
        setSelectedRuntime(runtime);
        setOpen(false);
    };

    const handleManageClick = () => {
        setOpen(false);
        router.push(`/workspace/${wid}/execution-runtimes`);
    };

    const handleCreateClick = () => {
        setOpen(false);
        setShowCreateForm(true);
    };

    const handleCreateSubmit = (data: Partial<ExecutionRuntimeData>) => {
        const newRuntime: RuntimeOption = {
            id: `rt-${Date.now()}`,
            name: data.name || 'new-runtime',
            provider: (data.provider as RuntimeOption['provider']) || 'kaya-runtime',
            region: data.region,
            status: data.provider === 'aws-agentcore' ? 'provisioning' : 'active',
        };
        setRuntimeOptions((prev) => [...prev, newRuntime]);
        setShowCreateForm(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="bg-white border-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {selectedRuntime.provider === 'kaya-runtime' ? (
                        <Server size={12} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                        <Cloud size={12} className="text-amber-600 dark:text-amber-400" />
                    )}
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
                        {selectedRuntime.name}
                    </p>
                    <ChevronDown size={12} className="text-gray-500" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Execution Runtime
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700" onClick={handleManageClick}>
                            <Settings size={12} className="mr-1" />
                            Manage
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Select the runtime to execute this workflow
                    </p>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                    {runtimeOptions.map((runtime) => (
                        <button
                            key={runtime.id}
                            className={cn(
                                'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
                                runtime.status === 'active'
                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed',
                                selectedRuntime.id === runtime.id && 'bg-blue-50 dark:bg-blue-900/20'
                            )}
                            onClick={() => handleSelect(runtime)}
                            disabled={runtime.status !== 'active'}
                        >
                            <div className="mt-0.5">
                                {runtime.provider === 'kaya-runtime' ? (
                                    <Server size={16} className="text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Cloud size={16} className="text-amber-600 dark:text-amber-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {runtime.name}
                                    </p>
                                    {selectedRuntime.id === runtime.id && (
                                        <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-[10px] px-1.5 py-0',
                                            runtime.provider === 'kaya-runtime'
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                        )}
                                    >
                                        {runtime.provider === 'kaya-runtime' ? 'Kaya' : 'AgentCore'}
                                    </Badge>
                                    {runtime.region && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{runtime.region}</span>
                                    )}
                                    {runtime.status === 'provisioning' && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                        >
                                            Provisioning
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        className="w-full flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        onClick={handleCreateClick}
                    >
                        <ExternalLink size={12} />
                        Create new runtime configuration
                    </button>
                </div>
            </PopoverContent>
            <ExecutionRuntimeForm
                isOpen={showCreateForm}
                isEdit={false}
                editingRuntime={null}
                setOpen={setShowCreateForm}
                onSubmit={handleCreateSubmit}
            />
        </Popover>
    );
};
