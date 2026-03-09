import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import React from 'react';
import { InputCategoryCardContainer } from './input-category-card-container';
import { APISelector, APISelectorProps } from '../api-selector';
import { MCPSelector } from '../mcp-selector';
import { VectorRagSelector, VectorRagSelectorProps } from '../vector-rag-selector';
import { GraphRagSelectorProps, GraphRagConfigSelector } from '../graph-rag-selector';
import { ConnectorSelector, ConnectorSelectorProps } from '../connector-selector';
import { ExecutableFunctionSelector } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector';
import { MCPSelectorProps } from '../mcp-selector/types';

export enum InputConnectKey {
    API = 'api',
    MCP_SERVER = 'mcp_server',
    VECTOR_RAG = 'vector_rag',
    GRAPH_RAG = 'graph_rag',
    CONNECTOR = 'connector',
    EXECUTABLE_FUNCTIONS = 'executable_functions',
}

export type InputConnectCategoryType = {
    categoryName: string;
    categoryKey: InputConnectKey;
};

interface InputDataConnectModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    apiSelectorProps: APISelectorProps;
    mcpSelectorProps: MCPSelectorProps;
    vectorSelectorProps: VectorRagSelectorProps;
    graphSelectorProps: GraphRagSelectorProps;
    executableSelectorProps: ExecutableFunctionSelector;
    connectorSelectorProps: ConnectorSelectorProps;
    selectedCounts: Record<InputConnectKey, number>;
    enabledCategories?: InputConnectKey[];
}

export const INPUT_CONNECT_CATEGORY_TYPE: InputConnectCategoryType[] = [
    { categoryName: 'APIs', categoryKey: InputConnectKey.API },
    { categoryName: 'MCP Servers', categoryKey: InputConnectKey.MCP_SERVER },
    { categoryName: 'Vector RAGs', categoryKey: InputConnectKey.VECTOR_RAG },
    { categoryName: 'Graph RAGs', categoryKey: InputConnectKey.GRAPH_RAG },
    { categoryName: 'Connectors', categoryKey: InputConnectKey.CONNECTOR },
    { categoryName: 'Functions', categoryKey: InputConnectKey.EXECUTABLE_FUNCTIONS },
];

export const InputDataConnectModal = ({
    openModal,
    setOpenModal,
    apiSelectorProps,
    mcpSelectorProps,
    vectorSelectorProps,
    graphSelectorProps,
    executableSelectorProps,
    connectorSelectorProps,
    selectedCounts,
    enabledCategories,
}: InputDataConnectModalProps) => {
    const [selectedCategory, setSelectedCategory] = React.useState<InputConnectCategoryType>(
        INPUT_CONNECT_CATEGORY_TYPE[0]
    );
    return (
        <div>
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-[unset] w-[824px]">
                    <DialogHeader className="px-0 h-fit">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <p>Input Data Connects</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="px-3 pb-3 w-full" asChild>
                        <div className="flex gap-x-2 h-[498px] w-full overflow-y-auto">
                            {/* List of all available input data connects */}
                            <InputCategoryCardContainer
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                selectedCounts={selectedCounts}
                                enabledCategories={enabledCategories}
                            />
                            {/* Display input data connects based on selected category */}
                            <div className="w-max-full flex-1">
                                {selectedCategory.categoryKey === InputConnectKey.API && (
                                    <APISelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...apiSelectorProps}
                                    />
                                )}
                                {selectedCategory.categoryKey === InputConnectKey.MCP_SERVER && (
                                    <MCPSelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...mcpSelectorProps}
                                    />
                                )}
                                {selectedCategory.categoryKey === InputConnectKey.VECTOR_RAG && (
                                    <VectorRagSelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...vectorSelectorProps}
                                    />
                                )}
                                {selectedCategory.categoryKey === InputConnectKey.GRAPH_RAG && (
                                    <GraphRagConfigSelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...graphSelectorProps}
                                    />
                                )}
                                {selectedCategory.categoryKey === InputConnectKey.CONNECTOR && (
                                    <ConnectorSelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...connectorSelectorProps}
                                    />
                                )}

                                {selectedCategory.categoryKey === InputConnectKey.EXECUTABLE_FUNCTIONS && (
                                    <ExecutableFunctionSelector
                                        showListOnly
                                        setInputDataConnectModalOpen={setOpenModal}
                                        {...executableSelectorProps}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </div>
    );
};
