import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { CodeDiffViewer } from '../code-diff-viewer/code-diff-viewer';
import { AIDiffNote } from './component/ai-diff-note';
import { Maximize2, Minimize2 } from 'lucide-react';

interface WorkflowComparisonProps {
    aiNote: string;
    incomingChanges: string;
    currentChanges: string;
}

export const WorkflowComparison = ({ aiNote, incomingChanges, currentChanges }: WorkflowComparisonProps) => {
    const [activeTab, setActiveTab] = useState('notes');
    const [isMaximized, setIsMaximized] = useState(false);

    const enterFullscreen = () => {
        setActiveTab('json'); // must activate JSON tab
        setIsMaximized(true);
    };

    const exitFullscreen = () => {
        setActiveTab('json'); // ensure json tab still visible
        setIsMaximized(false);
    };

    return (
        <>
            {/* MAIN TABS */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full border dark:border-gray-500 rounded-md h-full"
            >
                <TabsList className="w-full justify-between rounded-none bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-fit p-0">
                    <div className="flex">
                        <TabsTrigger
                            value="notes"
                            className="rounded-none border-b-2 border-transparent bg-gray-100 dark:bg-gray-800 data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900 px-4 py-2"
                        >
                            <i className={`ri-file-text-fill mr-2 ${activeTab === 'notes' ? 'text-blue-600' : ''}`} />
                            {' '}
                            What has changed
                        </TabsTrigger>

                        <TabsTrigger
                            value="json"
                            className="rounded-none border-b-2 border-transparent bg-gray-100 dark:bg-gray-800 data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900 data-[state=active]:after:content-none px-4 py-2 relative after:content-[''] after:absolute after:right-[-1] after:top-1/2 after:-translate-y-1/2 after:h-4 after:w-px after:bg-gray-300 dark:after:bg-gray-600"
                        >
                            <i className={`ri-code-line mr-2 ${activeTab === 'json' ? 'text-blue-600' : ''}`} />
                            {' '}
                            View changes in JSON
                        </TabsTrigger>
                    </div>

                    {activeTab === 'json' && (
                        <button
                            onClick={enterFullscreen}
                            className="relative px-4 py-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        >
                            <Maximize2 size={14} />
                        </button>
                    )}
                </TabsList>

                <TabsContent value="notes" className="mt-0 overflow-y-auto">
                    <AIDiffNote aiNote={aiNote} />
                </TabsContent>

                {/* NORMAL JSON MODE */}
                {!isMaximized && (
                    <TabsContent value="json" className="mt-0 p-0">
                        <div className="h-full">
                            <CodeDiffViewer currentChanges={currentChanges} incomingChanges={incomingChanges} />
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            {/* FULLSCREEN OVERLAY */}
            {isMaximized && (
                <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex flex-col m-1">
                    {/* FULLSCREEN HEADER */}
                    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-sm">
                        <div className="w-full flex justify-between items-center px-0">
                            <div className="flex">
                                <div className="rounded-none border-b-2 border-blue-600 bg-white dark:bg-blue-900 px-4 py-2 flex items-center">
                                    <i className="ri-code-line mr-2 text-blue-600" />
                                    <p className="text-sm font-medium">View changes in JSON</p>
                                </div>
                            </div>

                            <button
                                onClick={exitFullscreen}
                                className="relative px-4 py-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            >
                                <Minimize2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* FULLSCREEN JSON VIEW */}
                    <div className="flex-1 overflow-hidden">
                        <div className="w-full h-full">
                            <CodeDiffViewer currentChanges={currentChanges} incomingChanges={incomingChanges} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
