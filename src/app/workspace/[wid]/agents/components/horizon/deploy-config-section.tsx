'use client';

import { Input, Select, Switch, Label } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, HostingModel } from '@/models';
import { Cloud, Server } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface DeployConfigSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    isReadOnly?: boolean;
}

const hostingModelOptions = [
    { name: 'Managed (KAYA Internal)', value: 'managed' },
    { name: 'External (AgentCore)', value: 'agentcore' },
];

const runtimeOptions = [
    { name: 'Python 3.11 (LangChain, CrewAI)', value: 'python311' },
    { name: 'Python 3.12 (AutoGen, OpenAI Agents SDK)', value: 'python312' },
    { name: 'Node.js 20 LTS (LangChain.js)', value: 'nodejs20' },
    { name: 'Node.js 22 (Vercel AI SDK)', value: 'nodejs22' },
    { name: 'Java 21 LTS (Spring AI, LangChain4j)', value: 'java21' },
    { name: '.NET 8 (Semantic Kernel, AutoGen.NET)', value: 'dotnet8' },
];

export const DeployConfigSection = ({ control, watch, setValue, isReadOnly }: DeployConfigSectionProps) => {
    const horizonConfig = watch('horizonConfig');
    const autoScale = horizonConfig?.deploy?.scalingPolicy?.autoScale ?? true;
    const hostingModel = horizonConfig?.deploy?.hostingModel || 'managed';
    const isAgentCore = hostingModel === 'agentcore';

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Cloud size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Deploy Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Configure how and where this Horizon Agent will be deployed.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Hosting Model */}
                    <Controller
                        name="horizonConfig.deploy.hostingModel"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Hosting Model"
                                placeholder="Select hosting model"
                                options={hostingModelOptions}
                                currentValue={field.value || 'managed'}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(e.target.value as HostingModel)}
                            />
                        )}
                    />

                    

                    {/* Runtime - shown when AgentCore (External) */}
                    {isAgentCore && (
                        <Controller
                            name="horizonConfig.deploy.runtime"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Runtime"
                                    placeholder="Select runtime"
                                    options={runtimeOptions}
                                    currentValue={field.value || 'python312'}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    )}
                </div>

                {/* Scaling Policy Section */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-x-2 mb-4">
                        <Server size={16} className="text-gray-500" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Scaling Policy</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Min Instances */}
                        <Controller
                            name="horizonConfig.deploy.scalingPolicy.minInstances"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Min Instances"
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="1"
                                    value={field.value ?? 1}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                            )}
                        />

                        {/* Max Instances */}
                        <Controller
                            name="horizonConfig.deploy.scalingPolicy.maxInstances"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Max Instances"
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="3"
                                    value={field.value ?? 3}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                                />
                            )}
                        />

                        {/* Auto Scale Toggle */}
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Scale
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Automatically scale instances based on load
                                </p>
                            </div>
                            <Controller
                                name="horizonConfig.deploy.scalingPolicy.autoScale"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value ?? true}
                                        disabled={isReadOnly}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* Conditional Threshold Fields */}
                        {autoScale && (
                            <>
                                <Controller
                                    name="horizonConfig.deploy.scalingPolicy.scaleUpThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Scale Up Threshold (%)"
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="80"
                                            value={field.value ?? 80}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horizonConfig.deploy.scalingPolicy.scaleDownThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Scale Down Threshold (%)"
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="20"
                                            value={field.value ?? 20}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                                        />
                                    )}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployConfigSection;
