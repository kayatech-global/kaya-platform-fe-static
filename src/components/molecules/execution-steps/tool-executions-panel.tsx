import { Wrench } from 'lucide-react';
import { Badge } from '@/components';
import { ToolExecutionItem } from './tool-execution-item';

type ToolExecutionsPanelProps = {
    toolExecutions: Array<{
        stepName: string;
        stepType: string;
        toolOutput: string;
        entityType: string;
        status: string;
        entityName: string;
    } & Record<string, unknown>>;
    stepIndex: number;
};

export const ToolExecutionsPanel = ({ toolExecutions, stepIndex }: ToolExecutionsPanelProps) => {
    if (toolExecutions.length === 0) return null;

    return (
        <div className="mt-4 pt-0">
            <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center gap-2 mb-3">
                    <Wrench size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Data connectors executions
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5 ml-auto">
                        {toolExecutions.length} Tool(s) Called
                    </Badge>
                </div>

                <div className="space-y-2">
                    {toolExecutions.map((toolExecution, toolIdx) => (
                        <ToolExecutionItem
                            key={`${stepIndex}-${toolExecution.stepName}-${toolIdx}`}
                            toolExecution={toolExecution}
                            stepIndex={stepIndex}
                            toolIndex={toolIdx}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
