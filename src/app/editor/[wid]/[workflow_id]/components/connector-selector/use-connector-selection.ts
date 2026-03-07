import { useState, useEffect, useMemo } from 'react';
import { IConnectorForm } from '@/models';
import { toast } from 'sonner';

interface UseConnectorSelectionProps {
    connectors: IConnectorForm[];
    allConnectors: IConnectorForm[];
    isMultiple?: boolean;
    setConnectors: React.Dispatch<React.SetStateAction<IConnectorForm[] | undefined>>;
    onConnectorsChange?: (connectors: IConnectorForm[] | undefined) => void;
    onModalChange?: (open: boolean) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    isOpen?: boolean;
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useConnectorSelection = ({
    connectors,
    allConnectors,
    isMultiple = true,
    setConnectors,
    onConnectorsChange,
    onModalChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
    isOpen,
    setIsOpen,
}: UseConnectorSelectionProps) => {
    const [checkedItemId, setCheckedItemId] = useState<string[]>();
    const [searchTerm, setSearchTerm] = useState('');
    const [allSearchableConnectors, setAllSearchableConnectors] = useState<IConnectorForm[]>(allConnectors);
    const [isReordered, setIsReordered] = useState(false);
    const [userIntentToRemove, setUserIntentToRemove] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    // Search Effect
    useEffect(() => {
        if (searchTerm === '') {
            setAllSearchableConnectors(allConnectors);
        } else {
            const filteredConnectors = allConnectors.filter(connector =>
                connector.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAllSearchableConnectors(filteredConnectors);
        }
    }, [searchTerm, allConnectors]);

    // Reset search on close
    useEffect(() => {
        if (!openModal) {
            setSearchTerm('');
        }
    }, [openModal]);

    // Modal Change Callback
    useEffect(() => {
        if (onModalChange) {
            onModalChange(openModal);
        }
    }, [openModal, onModalChange]);

    // Sync checked state with props
    useEffect(() => {
        if (openModal && connectors) {
            setCheckedItemId(connectors.map(x => x.id as string));
        } else {
            setCheckedItemId(undefined);
        }
        if (showListOnly && connectors) {
            setCheckedItemId(connectors.map(x => x.id as string));
        }
    }, [showListOnly, openModal, connectors]);

    // Reordering logic
    useEffect(() => {
        if (Array.isArray(connectors) && connectors.length > 0 && allConnectors?.length > 0) {
            if (!isReordered) {
                // Only reorder once initially or when list changes significantly
                const selectedIds = new Set(connectors.map(x => x.id as string));
                const selected = allConnectors.filter(x => selectedIds.has(x.id as string));
                const unselected = allConnectors.filter(x => !selectedIds.has(x.id as string));
                setAllSearchableConnectors([...selected, ...unselected]);
                setIsReordered(true);
            }
        } else if (!isReordered) {
            setAllSearchableConnectors(allConnectors);
        }
    }, [allConnectors, connectors, isReordered]);

    // Sync logic to ensure selected connectors reflect updates from allConnectors
    useEffect(() => {
        if (connectors && connectors.length > 0 && allConnectors && allConnectors.length > 0) {
            const ids = new Set(connectors.map(c => c.id as string));
            // Sync selected connectors with the latest data from allConnectors
            const updatedConnectors = allConnectors.filter(x => ids.has(x.id as string));

            const hasChanges = updatedConnectors.some(updated => {
                const current = connectors.find(c => c.id === updated.id);
                return (
                    current &&
                    (current.name !== updated.name ||
                        current.description !== updated.description ||
                        current.type !== updated.type)
                );
            });

            if (hasChanges) {
                setConnectors(updatedConnectors);
                if (onConnectorsChange) {
                    onConnectorsChange(updatedConnectors);
                }
            }
        }
    }, [allConnectors, connectors, setConnectors, onConnectorsChange]);

    // Computed selected Connectors for display
    const selectedConnectors = useMemo(() => {
        if (showListOnly && connectors && connectors.length > 0 && allConnectors?.length > 0) {
            const connectorIds = new Set(connectors.map(x => x.id as string));
            return allConnectors.filter(x => connectorIds.has(x.id as string));
        }
        return [];
    }, [connectors, allConnectors, showListOnly]);

    const handleItemCheck = (connector: IConnectorForm) => {
        const connectorID = connector.id;
        if (!connectorID) return;

        setCheckedItemId(prevCheckedItemId => {
            if (isMultiple) {
                if (prevCheckedItemId?.includes(connectorID)) {
                    return prevCheckedItemId.filter(id => id !== connectorID);
                }
                const updated = [...(prevCheckedItemId ?? []), connectorID];
                setUserIntentToRemove(false);
                return updated;
            }

            return prevCheckedItemId?.includes(connectorID) ? undefined : [connectorID];
        });
    };

    // Effect to handle removal when unchecked
    useEffect(() => {
        if (checkedItemId === undefined && connectors !== undefined && userIntentToRemove) {
            setConnectors([]);
            if (onConnectorsChange) {
                onConnectorsChange([]);
            }
            setAllSearchableConnectors(allConnectors);
            setIsReordered(false);
            setUserIntentToRemove(false);
        }
    }, [checkedItemId, connectors, userIntentToRemove, setConnectors, onConnectorsChange, allConnectors]);

    const handleApplyChanges = () => {
        const checkedConnectors = allSearchableConnectors.filter(connector =>
            checkedItemId?.includes(connector.id as string)
        );

        // Maintain order logic
        const selected = allConnectors.filter(connector => checkedItemId?.includes(connector.id as string));
        const unselected = allConnectors.filter(connector => !checkedItemId?.includes(connector.id as string));
        const reorderedList = [...selected, ...unselected];

        setAllSearchableConnectors(reorderedList);
        setIsReordered(true);
        setConnectors(checkedConnectors);
        setOpenModal(false);

        if (showListOnly) {
            toast.success('Connectors updated successfully');
        }

        if (onConnectorsChange) {
            onConnectorsChange(checkedConnectors);
        }
    };

    const handleRemoveAll = () => {
        setCheckedItemId(undefined);
        setConnectors([]);
        if (onConnectorsChange) {
            onConnectorsChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openModal);
        }
    };

    const hasAnyChanges = useMemo(() => {
        const originalIds = connectors?.map(connector => connector.id).filter((id): id is string => !!id) ?? [];
        const currentIds = checkedItemId ?? [];

        if (originalIds.length !== currentIds.length) return true;
        return !originalIds.every(id => currentIds.includes(id));
    }, [checkedItemId, connectors]);

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (cancel) {
            if (isOpen && setIsOpen) {
                // If form is open, close it to return to list
                setIsOpen(false);
            } else {
                // If list is open, close the modal
                setOpenModal(false);
                setInputDataConnectModalOpen?.(false);
                setAllSearchableConnectors(allConnectors);
            }
        } else {
            setOpenModal(open);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        allSearchableConnectors,
        checkedItemId,
        handleItemCheck,
        openModal,
        setOpenModal,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedConnectors,
        onModalClose,
        setAllSearchableConnectors,
        setIsReordered,
    };
};
