import React from 'react';
import { Terminal, ChevronDown } from 'lucide-react';
import { Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { ITestSuite } from '../../data-generation';
import { EditableField } from './editable-field';
import { IToolData } from './review-test-case-detail';

interface ReviewAgentToolsProps {
    toolsData: IToolData[];
    isUpload: boolean;
    control?: Control<ITestSuite>;
}

export const ReviewAgentTools = ({ toolsData, isUpload, control }: ReviewAgentToolsProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!toolsData || toolsData.length === 0) {
        return null;
    }

    return (
        <div className="border border-gray-200 rounded-md bg-gray-100 overflow-hidden">
            <button
                type="button"
                className={cn(
                    'w-full px-3 py-2 text-sm font-medium text-gray-600 transition-colors cursor-pointer flex items-center justify-between text-left',
                    isOpen ? 'bg-white border-b border-gray-100' : 'hover:bg-white'
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gray-400" />
                    Tool Usage
                    <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
                        {toolsData.length}
                    </span>
                </div>
                <div className="text-gray-400">
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                    ) : (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="p-0 bg-white animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="divide-y divide-gray-50">
                        {toolsData.map((tool) => (
                            <div key={tool.key} className="p-3 flex flex-col gap-2 hover:bg-gray-50/50 transition-colors">
                                <EditableField
                                    name={`toolOutputDefinitions.${tool.key}`}
                                    label={tool.toolName}
                                    value={tool.output}
                                    readOnly={isUpload || !control}
                                    control={control}
                                    placeholder="No tool output"
                                    icon={<Terminal className="h-4 w-4" />}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
