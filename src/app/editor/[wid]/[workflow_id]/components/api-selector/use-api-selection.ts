import { useState, useEffect, useMemo } from 'react';
import { API } from '@/components/organisms';
import { IApiTool } from '@/models';
import { toast } from 'sonner';

interface UseApiSelectionProps {
    apis: API[] | undefined;
    allApiTools: IApiTool[];
    isMultiple?: boolean;
    setApis: React.Dispatch<React.SetStateAction<API[] | undefined>>;
    onApiChange?: (apis: API[] | undefined) => void;
    onModalChange?: (open: boolean) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    isOpen?: boolean;
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useApiSelection = ({
    apis,
    allApiTools,
    isMultiple = true,
    setApis,
    onApiChange,
    onModalChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
    isOpen,
    setIsOpen,
}: UseApiSelectionProps) => {
    const [checkedItemId, setCheckedItemId] = useState<string[]>();
    const [searchTerm, setSearchTerm] = useState('');
    const [allSearchableApiTools, setAllSearchableApiTools] = useState<IApiTool[]>(allApiTools);
    const [isReordered, setIsReordered] = useState(false);
    const [userIntentToRemove, setUserIntentToRemove] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    // Search Effect
    useEffect(() => {
        if (searchTerm === '') {
            setAllSearchableApiTools(allApiTools);
        } else {
            const filteredApis = allApiTools.filter(api => api.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setAllSearchableApiTools(filteredApis);
        }
    }, [searchTerm, allApiTools]);

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
        if (openModal && apis) {
            setCheckedItemId(apis?.map(x => x.id));
        } else {
            setCheckedItemId(undefined);
        }
        if (showListOnly && apis) {
            setCheckedItemId(apis?.map(x => x.id));
        }
    }, [showListOnly, openModal, apis]);

    // Reordering logic
    useEffect(() => {
        if (Array.isArray(apis) && apis.length > 0 && allApiTools?.length > 0) {
            if (!isReordered) {
                // Only reorder once initially or when list changes significantly
                const selectedIds = new Set(apis.map(x => x.id));
                const selected = allApiTools.filter(x => selectedIds.has(x.id));
                const unselected = allApiTools.filter(x => !selectedIds.has(x.id));
                setAllSearchableApiTools([...selected, ...unselected]);
                setIsReordered(true);
            }
        } else if (!isReordered) {
            setAllSearchableApiTools(allApiTools);
        }
    }, [allApiTools, apis, isReordered]);

    // If showListOnly is true, we want to reflect external API changes in the internal list immediately if needed
    // If showListOnly is true, we want to reflect external API changes in the internal list immediately if needed
    useEffect(() => {
        if (showListOnly && apis && apis.length > 0 && allApiTools && allApiTools.length > 0) {
            const ids = new Set(apis.map(c => c.id));
            // Sync selected apis with the latest data from allApiTools
            const updatedApis = allApiTools
                .filter(x => ids.has(x.id))
                .map(x => ({
                    id: x.id,
                    toolId: x.toolId,
                    name: x.name,
                    description: x.description,
                }));

            // Check if there are actual changes to avoid infinite loop
            const hasChanges = updatedApis.some(updated => {
                const current = apis.find(a => a.id === updated.id);
                return current && (current.name !== updated.name || current.description !== updated.description);
            });

            if (hasChanges) {
                setApis(updatedApis);
                if (onApiChange) {
                    onApiChange(updatedApis);
                }
            }
        }
    }, [allApiTools, showListOnly, apis, setApis, onApiChange]);

    // Computed selected APIs for display
    const selectedApis = useMemo(() => {
        if (showListOnly && apis && apis?.length > 0 && allApiTools?.length > 0) {
            const apiIds = apis?.map(x => x.id) || [];
            return allApiTools?.filter(x => apiIds.includes(x.id));
        }
        // In modal mode, we might want to show selected ones at top usage
        return [];
    }, [apis, allApiTools, showListOnly]);

    const handleItemCheck = (api: IApiTool) => {
        setCheckedItemId(prevCheckedItemId => {
            let updated: string[] | undefined = [];

            if (isMultiple) {
                if (prevCheckedItemId?.includes(api.id)) {
                    updated = prevCheckedItemId.filter(id => id !== api.id);
                } else {
                    updated = [...(prevCheckedItemId ?? []), api.id];
                    setUserIntentToRemove(false);
                }
                return updated;
            }

            return prevCheckedItemId?.includes(api.id) ? undefined : [api.id];
        });
    };

    // Effect to handle removal when unchecked (complex original logic)
    useEffect(() => {
        if (checkedItemId === undefined && apis !== undefined && userIntentToRemove) {
            setApis([]);
            if (onApiChange) {
                onApiChange([]);
            }
            setAllSearchableApiTools(allApiTools);
            setIsReordered(false);
            setUserIntentToRemove(false);
        }
    }, [checkedItemId, apis, userIntentToRemove, setApis, onApiChange, allApiTools]);

    const handleApplyChanges = () => {
        const checkedApis = allApiTools
            ?.filter(api => checkedItemId?.includes(api.id))
            ?.map(x => ({
                id: x.id,
                toolId: x.toolId,
                name: x.name,
                description: x.description,
            }));

        // Maintain order logic
        const selectedIds = new Set(checkedApis.map(api => api.id));
        const selected = allApiTools.filter(api => selectedIds.has(api.id));
        const unselected = allApiTools.filter(api => !selectedIds.has(api.id));
        const reorderedList = [...selected, ...unselected];

        setAllSearchableApiTools(reorderedList);
        setIsReordered(true);
        setApis(checkedApis);

        setOpenModal(false);

        if (showListOnly) {
            toast.success('APIs updated successfully');
        }

        if (onApiChange) {
            onApiChange(checkedApis);
        }
    };

    const handleRemoveAll = () => {
        setCheckedItemId(undefined);
        setApis(undefined);
        if (onApiChange) {
            onApiChange(undefined);
        }
        // If modal was open, we might want to keep it open or behave as cancel?
        // Original code: if (onModalChange) onModalChange(openModal);
    };

    const hasAnyChanges = useMemo(() => {
        const originalIds = apis?.map(api => api.id) ?? [];
        const currentIds = checkedItemId ?? [];
        if (originalIds.length !== currentIds.length) return true;
        return !originalIds.every(id => currentIds.includes(id));
    }, [checkedItemId, apis]);

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (cancel) {
            if (isOpen && setIsOpen) {
                // If form is open, close it to return to list
                setIsOpen(false);
            } else {
                // If list is open, close the modal
                setOpenModal(false);
                setInputDataConnectModalOpen?.(false);
                setAllSearchableApiTools(allApiTools);
            }
        } else {
            setOpenModal(open);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        allSearchableApiTools,
        checkedItemId,
        handleItemCheck,
        openModal,
        setOpenModal,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedApis,
        onModalClose,
        setAllSearchableApiTools, // Needed if we want to manually reset from outside
        setIsReordered,
    };
};
