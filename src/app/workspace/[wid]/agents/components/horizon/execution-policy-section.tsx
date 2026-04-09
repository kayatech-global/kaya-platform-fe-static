'use client';

import { Input, Select, Switch, Label } from '@/components';
import { IAgentForm, PriorityStrategy } from '@/models';
import { Settings2 } from 'lucide-react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';

interface ExecutionPolicySectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    isReadOnly?: boolean;
}

const priorityOptions = [
    { name: 'First In, First Out (FIFO)', value: 'fifo' },
    { name: 'Priority-based', value: 'priority' },
    { name: 'Fair Scheduling', value: 'fair' },
];

export const ExecutionPolicySection = ({ control, watch, isReadOnly }: ExecutionPolicySectionProps) => {
    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Settings2 size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Execution Policies</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Configure runtime behavior, timeouts, retries, and concurrency settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Async Default Toggle */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Async Default
                            </Label>
                            <p className="text-xs text-gray-400">
                                Execute tasks asynchronously by default
                            </p>
                        </div>
                        <Controller
                            name="horizonConfig.executionPolicy.asyncDefault"
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

                    {/* Max Duration */}
                    <Controller
                        name="horizonConfig.executionPolicy.maxDurationSeconds"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Max Duration (seconds)"
                                type="number"
                                min={1}
                                max={86400}
                                placeholder="3600"
                                value={field.value ?? 3600}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 3600)}
                                helperInfo="Maximum task execution time"
                            />
                        )}
                    />

                    {/* Timeout */}
                    <Controller
                        name="horizonConfig.executionPolicy.timeoutSeconds"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Timeout (seconds)"
                                type="number"
                                min={1}
                                max={3600}
                                placeholder="300"
                                value={field.value ?? 300}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 300)}
                                helperInfo="Request timeout before retry"
                            />
                        )}
                    />

                    {/* Max Retries */}
                    <Controller
                        name="horizonConfig.executionPolicy.maxRetries"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Max Retries"
                                type="number"
                                min={0}
                                max={10}
                                placeholder="3"
                                value={field.value ?? 3}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                helperInfo="Number of retry attempts on failure"
                            />
                        )}
                    />

                    {/* Concurrency Limit */}
                    <Controller
                        name="horizonConfig.executionPolicy.concurrencyLimit"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Concurrency Limit"
                                type="number"
                                min={1}
                                max={1000}
                                placeholder="10"
                                value={field.value ?? 10}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                                helperInfo="Max concurrent task executions"
                            />
                        )}
                    />

                    
                </div>
            </div>
        </div>
    );
};

export default ExecutionPolicySection;
