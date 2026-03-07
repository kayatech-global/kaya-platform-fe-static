import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { MCP, MCPSelectorProps } from './types';
import { IConnectorTool } from '@/models';
import { AgentType } from '@/components/organisms';

interface UseMcpSelectionProps {
    mcpServers: IMCPBody[];
    allMcpTools: MCPSelectorProps['allMcpTools'];
    isMultiple?: boolean;
    setMcpServers: (mcpServers: IMCPBody[]) => void;
    onMcpChange?: (mcp: IMCPBody[]) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    agent?: AgentType;
}

export const useMcpSelection = ({
    mcpServers,
    allMcpTools,
    isMultiple = true,
    setMcpServers,
    onMcpChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
    isOpen,
    setIsOpen,
    agent,
}: UseMcpSelectionProps) => {
    const [checkedItemId, setCheckedItemId] = useState<string[]>();
    const [searchTerm, setSearchTerm] = useState('');
    const [allSearchableMcps, setAllSearchableMcps] = useState<IConnectorTool[]>(allMcpTools ?? []);
    const [isReordered, setIsReordered] = useState(false);
    const [userIntentToRemove, setUserIntentToRemove] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    // Search effect
    useEffect(() => {
        if (searchTerm === '') {
            setAllSearchableMcps(allMcpTools);
        } else {
            const filteredMcps = allMcpTools.filter(api => api.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setAllSearchableMcps(filteredMcps);
        }
    }, [searchTerm, allMcpTools]);

    // Reorder effect - Maintain selected items at the top
    useEffect(() => {
        if (mcpServers?.length > 0 && allMcpTools?.length > 0) {
            const selectedIds = new Set(mcpServers.map(config => config.id));
            const selected = allMcpTools.filter(config => selectedIds.has(config.id));
            const unselected = allMcpTools.filter(config => !selectedIds.has(config.id));

            setAllSearchableMcps([...selected, ...unselected]);
            setIsReordered(true);
        } else if (!isReordered) {
            setAllSearchableMcps(allMcpTools);
        }

        if (showListOnly) {
            setCheckedItemId(mcpServers.map(config => config.id).filter((id): id is string => id != null));
        } else {
            setCheckedItemId([]);
        }
    }, [allMcpTools, showListOnly, mcpServers, isReordered]);

    // Handle check item
    const handleItemCheck = (mcp: MCP) => {
        setCheckedItemId((prevCheckedItemId: string[] | undefined) => {
            let updated: string[] | undefined = [];

            if (!isMultiple) {
                updated = prevCheckedItemId?.includes(mcp.id) ? undefined : [mcp.id];
            } else if (prevCheckedItemId?.includes(mcp.id)) {
                updated = prevCheckedItemId.filter((id: string) => id !== mcp.id);
            } else {
                updated = [...(prevCheckedItemId || []), mcp.id];
                setUserIntentToRemove(false);
            }
            return updated;
        });
    };

    // Apply changes
    const handleClick = () => {
        const checkedApis = allMcpTools?.filter(api => checkedItemId?.includes(api.id ?? ''));

        const selectedIds = new Set(checkedApis.map(api => api.id));
        const selected = allMcpTools.filter(config => selectedIds.has(config.id));
        const unselected = allMcpTools.filter(config => !selectedIds.has(config.id));

        setAllSearchableMcps([...selected, ...unselected]);
        setIsReordered(true);
        setMcpServers(checkedApis);
        setOpenModal(false);

        if (showListOnly) {
            toast.success('MCP Servers updated successfully');
        }

        if (onMcpChange) {
            onMcpChange(checkedApis);
        }
    };

    // Handle modal close
    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setIsOpen(false);
        } else if (cancel) {
            setOpenModal(false);
            setInputDataConnectModalOpen?.(false);
            setAllSearchableMcps(allMcpTools);
        } else {
            setOpenModal(open);
        }
    };

    // Logic for Change button
    const handleChange = () => {
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && mcpServers.length > 0) {
            const selectedServers = mcpServers.map(server => server.id).filter((id): id is string => id != null);
            setCheckedItemId(selectedServers);

            const selected = allMcpTools.filter(tool => selectedServers.includes(tool.id ?? ''));
            const unselected = allMcpTools.filter(tool => !selectedServers.includes(tool.id ?? ''));

            setAllSearchableMcps([...selected, ...unselected]);
            setIsReordered(true);
        }
    };

    // Logic for Remove All button
    const handleRemove = () => {
        setCheckedItemId([]);
        setMcpServers([]);
        if (onMcpChange) {
            onMcpChange([]);
        }
    };

    // User intent to remove logic
    useEffect(() => {
        if (checkedItemId === undefined && mcpServers !== undefined && userIntentToRemove) {
            setMcpServers([]);
            if (onMcpChange) {
                onMcpChange([]);
            }
            setAllSearchableMcps(allMcpTools);
            setIsReordered(false);
            setUserIntentToRemove(false);
        }
    }, [checkedItemId, userIntentToRemove, mcpServers, allMcpTools, setMcpServers, onMcpChange]);

    const hasAnyChanges = useMemo(() => {
        const originalIds = mcpServers?.map(mcp => mcp.id).filter((id): id is string => Boolean(id)) ?? [];
        const currentIds = checkedItemId || [];

        if (originalIds.length !== currentIds.length) return true;
        return !originalIds.every(id => currentIds.includes(id));
    }, [checkedItemId, mcpServers]);

    // Compute selected servers for showListOnly
    const selectedMcpServers = useMemo(() => {
        if (showListOnly && mcpServers?.length > 0 && allMcpTools?.length > 0) {
            const mcpServerIds = mcpServers?.map(x => x.id).filter((id): id is string => id != null) ?? [];
            return allMcpTools?.filter(x => mcpServerIds.includes(x.id));
        }
        return [];
    }, [mcpServers, allMcpTools, showListOnly]);

    // Sync selected MCPs with latest data from allMcpTools when showListOnly is true
    useEffect(() => {
        if (showListOnly && mcpServers && mcpServers.length > 0 && allMcpTools && allMcpTools.length > 0) {
            const ids = new Set(mcpServers.map(c => c.id));
            const updatedMcps = allMcpTools
                .filter(x => ids.has(x.id))
                .map(x => ({
                    id: x.id,
                    toolId: x.toolId,
                    name: x.name,
                    description: x.description,
                    configurations: x.configurations,
                }));

            const hasChanges = updatedMcps.some(updated => {
                const current = mcpServers.find(a => a.id === updated.id);
                return (
                    current &&
                    (current.name !== updated.name ||
                        current.description !== updated.description ||
                        JSON.stringify(current.configurations) !== JSON.stringify(updated.configurations))
                );
            });

            if (hasChanges) {
                setMcpServers(updatedMcps);
                if (onMcpChange) {
                    onMcpChange(updatedMcps);
                }
            }
        }
    }, [allMcpTools, showListOnly, mcpServers, setMcpServers, onMcpChange]);

    return {
        checkedItemId,
        setCheckedItemId,
        searchTerm,
        setSearchTerm,
        allSearchableMcps,
        setAllSearchableMcps,
        openModal,
        setOpenModal,
        hasAnyChanges,
        handleItemCheck,
        handleClick,
        onModalClose,
        handleChange,
        handleRemove,
        selectedMcpServers,
        setIsReordered,
    };
};
