'use client';

import { Input, Switch, Label } from '@/components';
import { IAgentForm } from '@/models';
import { Database, HardDrive, Brain, FileArchive } from 'lucide-react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';

interface PersistenceSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    isReadOnly?: boolean;
}

export const PersistenceSection = ({ control, watch, isReadOnly }: PersistenceSectionProps) => {
    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Database size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Persistence Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Configure what data should be persisted across agent executions.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-y-3">
                    {/* Task State */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-x-3">
                            <HardDrive size={18} className="text-gray-500" />
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Task State Persistence
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Preserve task state for resumable executions
                                </p>
                            </div>
                        </div>
                        <Controller
                            name="horizonConfig.persistence.taskState"
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

                    {/* Memory */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-x-3">
                            <Brain size={18} className="text-gray-500" />
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Memory Persistence
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Retain agent memory between sessions
                                </p>
                            </div>
                        </div>
                        <Controller
                            name="horizonConfig.persistence.memory"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    checked={field.value ?? false}
                                    disabled={isReadOnly}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    {/* Artifacts */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-x-3">
                            <FileArchive size={18} className="text-gray-500" />
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Artifact Storage
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Store generated artifacts and outputs
                                </p>
                            </div>
                        </div>
                        <Controller
                            name="horizonConfig.persistence.artifacts"
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

                    {/* Retention Days */}
                    <div className="mt-2">
                        <Controller
                            name="horizonConfig.persistence.retentionDays"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Retention Period (days)"
                                    type="number"
                                    min={1}
                                    max={365}
                                    placeholder="30"
                                    value={field.value ?? 30}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                                    helperInfo="How long to retain persisted data"
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersistenceSection;
