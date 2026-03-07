import { FileText, TrendingUp, Target } from 'lucide-react';
import { CodeDisplayBox } from '@/components/atoms/code-display-box';
import { AgentStepDetail } from '@/app/workspace/[wid]/test-studio/data-generation';
import { CodeDisplayBoxVariant } from '@/enums/component-type';

type ExecutionStepInputOutputProps = {
    agentStep: Partial<AgentStepDetail>;
};

// Helper to safely display any value as string
const safeDisplay = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

export const ExecutionStepInputOutput = ({ agentStep }: ExecutionStepInputOutputProps) => {
    return (
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 gap-4">
            {/* Input Payload - Full Width */}
            <div className="w-full">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Input Payload</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 max-h-[150px] overflow-y-auto">
                        <p className="text-xs font-mono text-gray-900 dark:text-gray-300 whitespace-pre-wrap">
                            {safeDisplay(agentStep.agentActualInput) || 'No input recorded.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Group */}
            <div className="border border-gray-100 dark:border-gray-700 rounded-md p-3 bg-gray-50/30 dark:bg-gray-900">
                <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Output Comparison
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Actual Output */}
                    <CodeDisplayBox
                        icon={TrendingUp}
                        title="Actual Output"
                        content={safeDisplay(agentStep.agentActualOutput) || 'No output recorded.'}
                        variant={CodeDisplayBoxVariant.Primary}
                    />

                    {/* Expected Output */}
                    <CodeDisplayBox
                        icon={Target}
                        title="Expected Output"
                        content={
                            safeDisplay(
                                agentStep.agentExpectedGroundTruth ||
                                agentStep.agentExpectedOutput
                            ) || 'No expectation defined.'
                        }
                        variant={CodeDisplayBoxVariant.Secondary}
                    />
                </div>
            </div>
        </div>
    );
};
