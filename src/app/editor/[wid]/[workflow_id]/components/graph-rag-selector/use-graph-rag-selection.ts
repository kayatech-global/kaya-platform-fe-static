import { ActivationType } from '@/enums';
import { IGraphRag } from '@/models';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface UseGraphRagSelectionProps {
    graphRags: IGraphRag[];
    allGraphRags: IGraphRag[];
    setGraphRags: (configs: IGraphRag[]) => void;
    isMultiple?: boolean;
    onGraphRagChange?: (mcp: IGraphRag[] | undefined) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    // Form open state management
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export const useGraphRagSelection = ({
    graphRags,
    allGraphRags,
    setGraphRags,
    isMultiple = true,
    onGraphRagChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
    isOpen,
    setIsOpen,
}: UseGraphRagSelectionProps) => {
    const [openModal, setOpenModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [allSearchableConfigs, setAllSearchableConfigs] = useState<IGraphRag[]>(graphRags ?? []);
    const [checkedItemId, setCheckedItemId] = useState<string[]>([]);
    const [mounted, setMounted] = useState<ActivationType>(ActivationType.DEACTIVATE);
    const [isReordered, setIsReordered] = useState(false);
    const [userIntentToRemove, setUserIntentToRemove] = useState(false);

    // Sync graphRags with allGraphRags on initial load if data exists
    useEffect(() => {
        if (mounted === ActivationType.ACTIVATE) return;

        if (graphRags?.length > 0 && allGraphRags?.length > 0) {
            setMounted(ActivationType.ACTIVATE);
            const ids = graphRags?.map(x => x.id);
            const data = allGraphRags.filter(x => ids.includes(x.id as string));
            setGraphRags([...data]);
        }
    }, [graphRags, allGraphRags, mounted, setGraphRags]);

    // Handle removal of all items
    const handleRemoveAll = () => {
        setCheckedItemId([]);
        setGraphRags([]);
        if (onGraphRagChange) {
            onGraphRagChange(undefined);
        }
        setUserIntentToRemove(true);
    };

    // Handle individual item check
    const handleItemCheck = (config: IGraphRag) => {
        const configID = config.id;
        if (!configID) return;

        setCheckedItemId(prevCheckedItemId => {
            let updated: string[] = [];

            if (!isMultiple) {
                updated = prevCheckedItemId?.includes(configID) ? [] : [configID];
            } else if (prevCheckedItemId?.includes(configID)) {
                // unselect -> remove from list
                updated = prevCheckedItemId.filter(id => id !== configID);
            } else {
                // select -> add to end
                updated = [...(prevCheckedItemId ?? []), configID];
            }
            return updated;
        });
    };

    // Apply changes from modal
    const handleApplyChanges = () => {
        const checkedConfigs = allSearchableConfigs.filter(config => checkedItemId?.includes(config.id as string));

        // Reorder: selected on top, others below (keep original relative order)
        const selected = allGraphRags.filter(config => checkedItemId?.includes(config.id as string));
        const unselected = allGraphRags.filter(config => !checkedItemId?.includes(config.id as string));
        const reorderedList = [...selected, ...unselected];

        setAllSearchableConfigs(reorderedList);
        setIsReordered(true); // Mark as reordered

        setGraphRags(checkedConfigs ?? []);
        setOpenModal(false);

        if (showListOnly) {
            toast.success('Graph RAGs updated successfully');
        }
        if (onGraphRagChange) {
            onGraphRagChange(checkedConfigs);
        }
    };

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

    // Computed property for filtered list
    const filteredGraphRAGs = useMemo(() => {
        return allSearchableConfigs.filter(
            grag =>
                grag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grag.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSearchableConfigs, searchTerm]);

    // Detect if there are changes to apply
    const hasAnyChanges = useMemo(() => {
        const originalIds = graphRags?.map(config => config.id).filter((id): id is string => id != null) ?? [];
        const currentIds = checkedItemId ?? [];

        if (originalIds.length !== currentIds.length) return true;

        // check if any id differs
        return !originalIds.every(id => currentIds.includes(id));
    }, [checkedItemId, graphRags]);

    // Cleanup removal intent
    useEffect(() => {
        if (
            (checkedItemId === undefined || checkedItemId.length === 0) &&
            graphRags !== undefined &&
            userIntentToRemove
        ) {
            setGraphRags([]);
            if (onGraphRagChange) {
                onGraphRagChange([]);
            }
            setAllSearchableConfigs(allGraphRags);
            setIsReordered(false);
            setUserIntentToRemove(false);
        }
    }, [checkedItemId, graphRags, userIntentToRemove, allGraphRags, onGraphRagChange, setGraphRags]);

    // Logic to reorder list when opening modal or receiving new data
    useEffect(() => {
        if (graphRags?.length > 0 && allGraphRags?.length > 0) {
            // Always update searchable configs to reflect latest data, re-applying sort order
            // If there are selected vector rags, maintain them at the top. Use graphRags directly for selected items as they are the source of truth for updates.
            // If there are selected vector rags, maintain them at the top.
            const selectedIds = new Set(graphRags.map(config => config.id));
            // Use the fresh object from allGraphRags for the selected items to ensure we display the latest version (e.g. v10)
            const selected = allGraphRags.filter(config => selectedIds.has(config.id));
            const unselected = allGraphRags.filter(config => !selectedIds.has(config.id));
            setAllSearchableConfigs([...selected, ...unselected]);
            if (!isReordered) {
                setIsReordered(true);
            }
        } else {
            // No selection or no data, just show all
            setAllSearchableConfigs(allGraphRags);
        }

        if (showListOnly || !openModal) {
            const newIds = graphRags?.map(config => config.id as string) ?? [];
            setCheckedItemId(prev => {
                if (prev.length === newIds.length && prev.every((val, index) => val === newIds[index])) {
                    return prev;
                }
                return newIds;
            });
        }
    }, [allGraphRags, showListOnly, graphRags, isReordered, openModal, isOpen]);

    // Ensure graphRags reflects updated allGraphRags data (e.g. after edit)
    useEffect(() => {
        if (graphRags?.length > 0 && allGraphRags?.length > 0) {
            const ids = new Set(graphRags.map(c => c.id as string));
            // Get fresh objects from allGraphRags
            const newGraphRags = allGraphRags?.filter(x => ids.has(x.id as string));

            // Deep equality check to avoid infinite loop
            // We check if the properties actually changed (e.g. name, description)
            // or if the IDs are different
            const isDifferent =
                newGraphRags.length !== graphRags.length ||
                !newGraphRags.every((val, index) => {
                    const current = graphRags[index];
                    return (
                        val.id === current.id && val.name === current.name && val.description === current.description
                    );
                });

            if (isDifferent) {
                setGraphRags(newGraphRags);
            }
        }
    }, [allGraphRags, graphRags, setGraphRags]);

    // Handle modal changing state
    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen && setIsOpen) {
            setIsOpen(false);
        } else if (cancel) {
            setOpenModal(false);
            // trigger only when showListOnly is true
            setInputDataConnectModalOpen?.(false);
            setAllSearchableConfigs(allGraphRags);
            // Reset checked items to actual selected items on cancel
            setCheckedItemId(graphRags?.map(g => g.id as string) ?? []);
            setIsReordered(false);
        } else {
            setOpenModal(open);
            if (!open) {
                setIsReordered(false);
            }
        }
    };

    return {
        openModal,
        setOpenModal,
        searchTerm,
        setSearchTerm,
        allSearchableConfigs,
        setAllSearchableConfigs,
        checkedItemId,
        setCheckedItemId,
        handleRemoveAll,
        handleItemCheck,
        handleApplyChanges,
        handleSearch,
        filteredGraphRAGs,
        hasAnyChanges,
        onModalClose,
        setIsReordered,
        setMounted,
    };
};
