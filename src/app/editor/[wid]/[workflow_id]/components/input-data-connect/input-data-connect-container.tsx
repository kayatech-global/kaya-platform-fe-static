import { Button } from '@/components';
import { Boxes, PackagePlus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { InputDataConnectModal, InputConnectKey } from './input-data-connect-modal';
import { APISelectorProps } from '../api-selector';
import { VectorRagSelectorProps } from '../vector-rag-selector';
import { GraphRagSelectorProps } from '../graph-rag-selector';
import { ConnectorSelectorProps } from '../connector-selector';
import { ExecutableFunctionSelector } from '../executable-function-selector';
import { AgentType } from '@/components/organisms';
import { MCPSelectorProps } from '../mcp-selector/types';

interface InputDataConnectContainerProps {
    agent?: AgentType;
    apiSelectorProps: APISelectorProps;
    mcpSelectorProps: MCPSelectorProps;
    vectorSelectorProps: VectorRagSelectorProps;
    graphSelectorProps: GraphRagSelectorProps;
    connectorSelectorProps: ConnectorSelectorProps;
    executableSelectorProps: ExecutableFunctionSelector;
    enabledCategories?: InputConnectKey[];
}

export const InputDataConnectContainer = ({
    agent,
    apiSelectorProps,
    mcpSelectorProps,
    vectorSelectorProps,
    graphSelectorProps,
    connectorSelectorProps,
    executableSelectorProps,
    enabledCategories,
}: InputDataConnectContainerProps) => {
    const [openModal, setOpenModal] = useState(false);

    const selectedCounts = useMemo(
        () => ({
            [InputConnectKey.API]: apiSelectorProps.apis?.length ?? 0,
            [InputConnectKey.MCP_SERVER]: mcpSelectorProps.mcpServers?.length ?? 0,
            [InputConnectKey.VECTOR_RAG]: vectorSelectorProps.vectorRags?.length ?? 0,
            [InputConnectKey.GRAPH_RAG]: graphSelectorProps.graphRags?.length ?? 0,
            [InputConnectKey.CONNECTOR]: connectorSelectorProps.connectors?.length ?? 0,
            [InputConnectKey.EXECUTABLE_FUNCTIONS]: executableSelectorProps.functions?.length ?? 0,
        }),
        [
            apiSelectorProps.apis?.length,
            mcpSelectorProps.mcpServers?.length,
            vectorSelectorProps.vectorRags?.length,
            graphSelectorProps.graphRags?.length,
            connectorSelectorProps.connectors?.length,
            executableSelectorProps.functions?.length,
        ]
    );
    const hasExistingConnections = useMemo(() => {
        return Object.values(selectedCounts).some(count => count > 0);
    }, [selectedCounts]);
    return (
        <>
            <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-[10px]">
                    <PackagePlus size={20} absoluteStrokeWidth={false} className="stroke-[2px]" />
                    <p>Input Data Connect</p>
                </div>
                <p className="text-xs font-normal text-gray-400">
                    Select Input Data Connects that required for this agent to run efficiently.
                </p>
                {!agent?.isReusableAgentSelected && (
                    <div className="w-full flex justify-center mt-4 gap-x-3">
                        <Boxes size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <Button variant="link" onClick={() => setOpenModal(true)}>
                            {hasExistingConnections ? 'Change Input Data Connects' : 'Add Input Data Connects'}
                        </Button>
                    </div>
                )}
            </div>
            <InputDataConnectModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                apiSelectorProps={apiSelectorProps}
                mcpSelectorProps={mcpSelectorProps}
                vectorSelectorProps={vectorSelectorProps}
                graphSelectorProps={graphSelectorProps}
                connectorSelectorProps={connectorSelectorProps}
                executableSelectorProps={executableSelectorProps}
                selectedCounts={selectedCounts}
                enabledCategories={enabledCategories}
            />
        </>
    );
};
