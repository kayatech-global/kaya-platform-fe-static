'use client';
import { useState } from 'react';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components';

type ToolExecutionItemProps = {
    toolExecution: {
        stepName: string;
        stepType: string;
        toolOutput: string;
        status: string;
        entityName: string;
    } & Record<string, unknown>;
    stepIndex: number;
    toolIndex: number;
};

export const ToolExecutionItem = ({ toolExecution }: ToolExecutionItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Parse toolOutput if it's a JSON string
    let parsedOutput: unknown;
    try {
        parsedOutput = typeof toolExecution.toolOutput === 'string' 
            ? JSON.parse(toolExecution.toolOutput) 
            : toolExecution.toolOutput;
    } catch {
        parsedOutput = toolExecution.toolOutput;
    }

    const isSuccess = toolExecution.status === 'SUCCESS';
    
    // Check if stepName contains "mock" (case-insensitive) to determine if it's a mocked response
    const isMocked = toolExecution.stepName?.toLowerCase().includes('mock');
    
    // Use entityName as the tool name
    const toolName = toolExecution.entityName;
    
    // Check if parsedOutput has content
    const hasOutput = parsedOutput !== null && parsedOutput !== undefined && parsedOutput !== '';

    return (
        <div className={`rounded-lg border p-3 ${
            isSuccess 
                ? 'bg-green-50 dark:bg-green-50 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 ">
                        <Check size={14} className={isSuccess ? 'text-green-600 dark:text-green-600' : 'text-red-600 dark:text-red-400'} />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-900">{toolName}</span>
                        <Badge variant={isSuccess ? 'success' : 'destructive'} className="text-[10px] h-6">
                            {isSuccess ? (isMocked ? 'Mocked' : 'Called') : 'Failed'}
                        </Badge>
                    </div>
                    {/* <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">{toolExecution.stepType}</p> */}
                </div>

                {hasOutput && (
                    <button
                        onClick={() => setIsExpanded(prev => !prev)}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={14} />
                                Hide Response
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} />
                                {isMocked ? 'View Mock Response' : 'View Response'}
                            </>
                        )}
                    </button>
                )}
            </div>

            {isExpanded && hasOutput && (
                <div className="mt-2 bg-white dark:bg-gray-600 rounded border border-green-200 dark:border-green-800 p-2">
                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        {isMocked ? 'Mock Response' : 'Response'}
                    </div>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-64 overflow-y-auto">
                        {typeof parsedOutput === 'string' ? parsedOutput : JSON.stringify(parsedOutput, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
