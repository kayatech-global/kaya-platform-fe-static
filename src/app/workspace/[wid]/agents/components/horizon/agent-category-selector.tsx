'use client';

import { RadioChips } from '@/components/molecules/radio-chips/radio-chips';
import { cn } from '@/lib/utils';
import { AgentCategory } from '@/models';
import { Bot, Compass } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { IAgentForm } from '@/models';

interface AgentCategorySelectorProps {
    control: Control<IAgentForm>;
    isReadOnly?: boolean;
    isEdit?: boolean;
    onCategoryChange?: (category: AgentCategory) => void;
}

export const AgentCategorySelector = ({
    control,
    isReadOnly,
    isEdit,
    onCategoryChange,
}: AgentCategorySelectorProps) => {
    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-3">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Bot size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Agent Category</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Select the type of agent you want to create. Horizon Agents provide additional deployment and
                        runtime configuration options.
                    </p>
                </div>
                <Controller
                    name="agentCategory"
                    control={control}
                    render={({ field }) => (
                        <div className="flex flex-col gap-y-3">
                            <RadioChips
                                value={field.value || AgentCategory.REUSABLE}
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    onCategoryChange?.(value as AgentCategory);
                                }}
                                disabled={isReadOnly || isEdit}
                                options={[
                                    {
                                        value: AgentCategory.REUSABLE,
                                        label: 'Reusable Agent',
                                    },
                                    {
                                        value: AgentCategory.HORIZON,
                                        label: 'Horizon Agent',
                                    },
                                ]}
                            />
                            <div
                                className={cn(
                                    'flex items-start gap-x-3 p-3 rounded-md border',
                                    field.value === AgentCategory.HORIZON
                                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                )}
                            >
                                {field.value === AgentCategory.HORIZON ? (
                                    <>
                                        <Compass
                                            size={18}
                                            className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                                        />
                                        <div className="flex flex-col gap-y-0.5">
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                Horizon Agent Selected
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Configure deployment settings, identity, skills metadata, execution
                                                policies, and notification options below.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Bot
                                            size={18}
                                            className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0"
                                        />
                                        <div className="flex flex-col gap-y-0.5">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Reusable Agent Selected
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Standard agent configuration with prompts, tools, and knowledge sources.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default AgentCategorySelector;
