'use client';

import { useMCPConfiguration } from '@/hooks/use-mcp-configuration';
import { FormBody as McpConfigurationFormBody } from '@/app/workspace/[wid]/mcp-configurations/components/mcp-configuration-form';
import { AuthorizationType } from '@/enums';
import { TransportType } from '@/enums/transport-type';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { useMcpSelection } from './mcp-selector/use-mcp-selection';
import { McpList } from './mcp-selector/mcp-list';
import { McpDialog } from './mcp-selector/mcp-dialog';
import { McpSelectorFooter } from './mcp-selector/mcp-selector-footer';
import { MCPSelectorProps } from './mcp-selector/types';
import { UseFormSetValue } from 'react-hook-form';
import { IMcpConfigForm } from '@/models';

const populateMcpConfigurationForm = (
    id: string,
    allMcpTools: MCPSelectorProps['allMcpTools'],
    setValue: UseFormSetValue<IMcpConfigForm>
) => {
    const obj = allMcpTools.find(x => x.id === id);
    if (obj) {
        setValue('id', obj.id);
        setValue('timeout', obj.configurations?.timeout);
        setValue('retryCount', obj.configurations?.retryCount);
        setValue('transport', obj.configurations?.transport as TransportType);
        setValue('name', obj.name);
        setValue('url', obj.configurations?.url);
        setValue('isReadOnly', obj?.isReadOnly);
        setValue('description', obj.description ?? '');
        setValue(
            'availableTools',
            obj?.configurations?.selected_tools?.map(tool => ({
                label: tool,
                value: tool,
            }))
        );
        setValue('authorization.authType', obj.configurations?.authorization?.authType ?? AuthorizationType?.Empty);
        if (obj.configurations?.authorization?.meta) {
            setValue('authorization.meta.username', obj.configurations?.authorization?.meta?.username);
            setValue('authorization.meta.password', obj.configurations?.authorization?.meta?.password);
            setValue('authorization.meta.token', obj.configurations?.authorization?.meta?.token);
            setValue('authorization.meta.headerName', obj.configurations?.authorization?.meta?.headerName);
            setValue('authorization.meta.headerValue', obj.configurations?.authorization?.meta?.headerValue);
        }
    }
};

const getMcpSelectionItems = (
    agent: MCPSelectorProps['agent'],
    mcpServers: MCPSelectorProps['mcpServers']
): valuesProps[] | undefined => {
    if (!agent && (!mcpServers || mcpServers.length === 0)) {
        return undefined;
    }

    let value: valuesProps[] = [];

    if (agent?.isReusableAgentSelected && agent.mcpServers && agent.mcpServers.length > 0) {
        const mcpListFromReusableAgent = agent.mcpServers?.map(server => ({
            title: server.name,
            description: server.description as string,
            imagePath: '/png/mcp-icon.png',
        }));
        value = [...mcpListFromReusableAgent];
    } else if (mcpServers && mcpServers.length > 0) {
        const selectedServers = mcpServers.map(server => ({
            title: server.name as string,
            description: server.description as string,
            imagePath: '/png/mcp-icon.png',
        }));

        value = [...selectedServers];
    }

    return value.length > 0 ? value : undefined;
};

export const MCPSelector = ({
    agent,
    mcpServers,
    setMcpServers,

    isReadonly,
    isMultiple = true,
    loading,
    allMcpTools,
    onMcpChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
}: MCPSelectorProps) => {
    const {
        isValid,
        handleSubmit,
        onHandleSubmit,
        isSaving,
        isOpen,
        errors,
        secrets,
        control,
        loadingSecrets,
        isEdit,
        setEdit,
        setIsOpen,
        register,
        watch,
        setValue,
        refetch,
        tools,
        getAllTool,
        toolLoading,
    } = useMCPConfiguration();

    const {
        checkedItemId,
        searchTerm,
        setSearchTerm,
        allSearchableMcps,
        openModal,
        hasAnyChanges,
        handleItemCheck,
        handleClick,
        onModalClose,
        handleChange,
        handleRemove,
        selectedMcpServers,
    } = useMcpSelection({
        mcpServers,
        allMcpTools,
        isMultiple,
        setMcpServers,
        onMcpChange,
        showListOnly,
        setInputDataConnectModalOpen,
        isOpen,
        setIsOpen,
        agent,
    });

    const onEdit = (id: string) => {
        populateMcpConfigurationForm(id, allMcpTools, setValue);
        getAllTool();
        setEdit(true);
        setIsOpen(true);
    };

    const formProps = {
        isOpen,
        isEdit,
        isValid,
        errors,
        secrets,
        isSaving,
        hasTestConnection: false,
        control,
        loadingSecrets,
        setOpen: setIsOpen,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        refetch,
        tools,
        getAllTool,
        toolLoading,
    };

    const mcpListProps = {
        mcps: allSearchableMcps,
        checkedItemId,
        handleItemCheck,
        onEdit,
        searchTerm,
        onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
        loading,
        showSelectedSection: showListOnly,
        selectedMcps: selectedMcpServers,
        mcpServers,
    };

    const footerProps = {
        isOpen,
        isEdit,
        isValid,
        isSaving,
        handleSubmit: () => handleSubmit(onHandleSubmit)(),
        handleClick,
        onModalClose,
        hasAnyChanges,
    };

    if (showListOnly) {
        return (
            <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                {isOpen ? (
                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                        <McpConfigurationFormBody {...formProps} />
                    </div>
                ) : (
                    <McpList
                        {...mcpListProps}
                        showAddNewButton={!isOpen}
                        isReadonly={isReadonly}
                        onAddNewClicked={() => setIsOpen(true)}
                    />
                )}
                <div className="h-fit flex justify-end gap-x-2 mr-4">
                    <McpSelectorFooter {...footerProps} />
                </div>
            </div>
        );
    }

    return (
        <>
            <DetailItemInput
                label="MCP Servers"
                values={getMcpSelectionItems(agent, mcpServers)}
                imagePath="/png/api_empty.png"
                imageType="png"
                imageWidth="120"
                description="Select the Model Context Protocol servers that will be used with your agent."
                footer={
                    mcpServers.length > 0 && !agent?.isReusableAgentSelected ? (
                        <div className="w-full flex justify-start items-center gap-x-3">
                            <button className="text-blue-400 text-sm hover:underline" onClick={handleChange}>
                                Change
                            </button>
                            <button
                                className="text-red-500 hover:text-red-400 text-sm hover:underline"
                                onClick={handleRemove}
                            >
                                Remove all
                            </button>
                        </div>
                    ) : (
                        <>
                            {mcpServers.length === 0 && !agent && !isReadonly && (
                                <button
                                    className="text-blue-400 text-sm hover:underline"
                                    onClick={() => onModalClose(true)}
                                >
                                    Add MCP Servers
                                </button>
                            )}
                        </>
                    )
                }
            />

            <McpDialog
                open={openModal}
                onOpenChange={onModalClose}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isEdit={isEdit}
                isReadonly={isReadonly}
                formProps={formProps}
                mcpListProps={mcpListProps}
                footerProps={footerProps}
            />
        </>
    );
};
