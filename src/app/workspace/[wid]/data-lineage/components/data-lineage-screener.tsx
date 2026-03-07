import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, Spinner } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { DataLineageGraphRenderer } from './data-lineage-graph-renderer';
import { FileText } from 'lucide-react';
import { IDataLineageGraph, IDataLineageSessionExecution, IDataLineageVisualGraph } from '@/models';
import { useDataLineageScreener } from '@/hooks/use-data-lineage-screener';

export interface IDataLineageScreenerProps {
    isOpen: boolean;
    loadingView: boolean;
    selectedExecution: IDataLineageSessionExecution | undefined;
    modular: IDataLineageGraph | undefined;
    linear: IDataLineageVisualGraph | undefined;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    workflowId?: string;
}

export const DataLineageScreener = (props: IDataLineageScreenerProps) => {
    const { isOpen, loadingView, selectedExecution, setIsOpen, workflowId, modular, linear } = props;
    const { tabs, activeTab, mounted, screenerTitle, setActiveTab, handleAddTab, handleCloseTab } =
        useDataLineageScreener(props);

    console.log(modular, linear);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="bottom" className="p-0 dark:bg-gray-900 z-[100010] h-[95%]">
                <SheetTitle className="flex flex-col !px-6 !py-4 !space-y-0 h-[60px]">
                    <p>{screenerTitle}</p>
                </SheetTitle>
                <SheetDescription className="bg-gray-200 dark:bg-gray-700 h-[calc(100%-60px)] p-1" asChild>
                    <div className="tab-container">
                        {/* <button onClick={handleAddTab} className="mb-2 px-4 py-2 bg-blue-600 text-white rounded">
                            Add Tab
                        </button> */}
                        {loadingView && (
                            <div className="flex items-center flex-col gap-y-2 absolute z-[9999] right-[50%] top-[50%]">
                                <Spinner />
                                <p>Loading</p>
                            </div>
                        )}

                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="h-full bg-white dark:bg-gray-900"
                        >
                            <TabsList className="justify-start w-full rounded-none bg-transparent border-b border-gray-200 dark:border-gray-600 h-fit p-0">
                                {tabs.map(tab => (
                                    <div key={tab.value} className="flex items-center gap-x-1">
                                        <TabsTrigger
                                            className="flex gap-x-2 px-3 py-3 text-sm font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-foreground data-[state=active]:text-white rounded-none"
                                            value={tab.value}
                                            disabled={loadingView}
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                        {tab.isCustom && (
                                            <button
                                                type="button"
                                                onClick={() => handleCloseTab(tab.value)}
                                                className="ml-1 text-sm text-gray-300 hover:text-red-500 cursor-pointer bg-transparent border-none p-0"
                                                title="Close Tab"
                                                aria-label="Close tab"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </TabsList>
                            {tabs.map(tab => (
                                <TabsContent
                                    key={tab.value}
                                    className="h-[calc(100%-46px)] w-full mt-0 relative"
                                    value={tab.value}
                                >
                                    <div className="bg-transparent absolute top-2 right-4 z-50">
                                        <button
                                            disabled={loadingView}
                                            className="dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded flex items-center px-2 py-1 gap-x-2"
                                        >
                                            <FileText size={16} className="text-gray-700 dark:text-gray-300" />
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                                Export PDF
                                            </p>
                                        </button>
                                    </div>
                                    {!loadingView && mounted && (
                                        <DataLineageGraphRenderer
                                            activeTab={activeTab}
                                            graphData={tab.content}
                                            steps={tab.steps}
                                            selectedExecution={selectedExecution}
                                            handleAddTab={handleAddTab}
                                            workflowId={workflowId}
                                        />
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </SheetDescription>
            </SheetContent>
        </Sheet>
    );
};
