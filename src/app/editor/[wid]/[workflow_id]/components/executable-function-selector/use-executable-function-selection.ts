import { useState, useEffect, useMemo } from 'react';
import { ExecutableFunction } from '@/components/organisms';
import { IExecutableFunctionTool } from '@/models';
import { toast } from 'sonner';

interface UseExecutableFunctionSelectionProps {
    functions: ExecutableFunction[] | undefined;
    allExecutableFunctions: IExecutableFunctionTool[];
    isMultiple?: boolean;
    setFunctions: React.Dispatch<React.SetStateAction<ExecutableFunction[] | undefined>>;
    onExecutableFunctionChange?: (executableFunctions: ExecutableFunction[] | undefined) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    isOpen?: boolean; // configuration form open state
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useExecutableFunctionSelection = ({
    functions,
    allExecutableFunctions,
    isMultiple = true,
    setFunctions,
    onExecutableFunctionChange,
    showListOnly = false,
    setInputDataConnectModalOpen,
    isOpen,
    setIsOpen,
}: UseExecutableFunctionSelectionProps) => {
    const [checkedItemId, setCheckedItemId] = useState<string[] | undefined>(undefined);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [allSearchableExecutableFunction, setAllSearchableExecutableFunction] =
        useState<IExecutableFunctionTool[]>(allExecutableFunctions);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isReordered, setIsReordered] = useState<boolean>(false);
    const [userIntentToRemove, setUserIntentToRemove] = useState<boolean>(false);

    // Search Effect
    useEffect(() => {
        if (searchTerm === '') {
            setAllSearchableExecutableFunction(allExecutableFunctions);
        } else {
            const filteredExecutableFunctions = allExecutableFunctions.filter(exFunc =>
                exFunc.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAllSearchableExecutableFunction(filteredExecutableFunctions);
        }
    }, [searchTerm, allExecutableFunctions]);

    // Reset search on form close or modal close
    useEffect(() => {
        if (!isOpen || !openModal) {
            setSearchTerm('');
        }
    }, [isOpen, openModal]);

    // Sync checked state with props when modal opens or in list-only mode
    useEffect(() => {
        if (openModal && functions) {
            setCheckedItemId(functions?.map(x => x.id));
        } else if (!openModal && !showListOnly) {
            setCheckedItemId(undefined);
        }
        if (showListOnly && functions) {
            setCheckedItemId(functions?.map(x => x.id));
        }
    }, [showListOnly, openModal, functions]);

    // Reordering logic to show selected items first
    useEffect(() => {
        if (Array.isArray(functions) && functions.length > 0 && allExecutableFunctions?.length > 0) {
            // Only apply reordering if not already done to avoid constant shifting if not desired
            if (!isReordered) {
                const selectedIds = new Set(functions.map(x => x.id));
                const selected = allExecutableFunctions.filter(x => selectedIds.has(x.id));
                const unselected = allExecutableFunctions.filter(x => !selectedIds.has(x.id));

                setAllSearchableExecutableFunction([...selected, ...unselected]);
                setIsReordered(true);
            }
        } else if (!isReordered) {
            setAllSearchableExecutableFunction(allExecutableFunctions);
        }
    }, [allExecutableFunctions, functions, isReordered]);

    // Sync external changes to functions back to internal list if showListOnly (similar to api-selector)
    useEffect(() => {
        if (showListOnly && functions && functions?.length > 0 && allExecutableFunctions?.length > 0) {
            const ids = new Set(functions.map(c => c.id));
            setFunctions(allExecutableFunctions?.filter(x => ids.has(x.id)));
        }
    }, [allExecutableFunctions, showListOnly, setFunctions]);

    const selectedFunctions = useMemo(() => {
        if (showListOnly && functions && functions?.length > 0 && allExecutableFunctions?.length > 0) {
            const functionIds = functions?.map(x => x.id) ?? [];
            return allExecutableFunctions?.filter(x => functionIds.includes(x.id));
        }
        return [];
    }, [functions, allExecutableFunctions, showListOnly]);

    const handleItemCheck = (execFunc: ExecutableFunction | IExecutableFunctionTool) => {
        setCheckedItemId(prevCheckedItemId => {
            let updated: string[] | undefined = [];

            if (isMultiple) {
                if (prevCheckedItemId?.includes(execFunc.id)) {
                    updated = prevCheckedItemId.filter(id => id !== execFunc.id);
                } else {
                    updated = [...(prevCheckedItemId ?? []), execFunc.id];
                    setUserIntentToRemove(false);
                }
            } else {
                updated = prevCheckedItemId?.includes(execFunc.id) ? undefined : [execFunc.id];
            }
            return updated;
        });
    };

    // Handle removal when unchecked (if userIntentToRemove involved? Original Logic line 190)
    useEffect(() => {
        if (checkedItemId === undefined && functions !== undefined && userIntentToRemove) {
            setFunctions([]);
            if (onExecutableFunctionChange) {
                onExecutableFunctionChange([]);
            }
            setAllSearchableExecutableFunction(allExecutableFunctions);
            setIsReordered(false);
            setUserIntentToRemove(false);
        }
    }, [
        checkedItemId,
        functions,
        userIntentToRemove,
        setFunctions,
        onExecutableFunctionChange,
        allExecutableFunctions,
    ]);

    const handleApplyChanges = () => {
        const checkedFunctions = allExecutableFunctions
            ?.filter(execFunc => checkedItemId?.includes(execFunc.id))
            ?.map(x => ({
                id: x.id,
                toolId: x.toolId,
                name: x.name,
                description: x.description,
            }));

        const selectedIds = new Set(checkedFunctions.map(execFunc => execFunc.id));
        const selected = allExecutableFunctions.filter(execFunc => selectedIds.has(execFunc.id));
        const unselected = allExecutableFunctions.filter(execFunc => !selectedIds.has(execFunc.id));
        const reorderedList = [...selected, ...unselected];

        setAllSearchableExecutableFunction(reorderedList);
        setIsReordered(true);
        setFunctions(checkedFunctions);
        setOpenModal(false);

        if (showListOnly) {
            toast.success('Function updated successfully');
        }

        if (onExecutableFunctionChange) {
            onExecutableFunctionChange(checkedFunctions);
        }
    };

    const handleRemoveAll = () => {
        setCheckedItemId(undefined);
        setFunctions(undefined);
        if (onExecutableFunctionChange) {
            onExecutableFunctionChange(undefined);
        }
    };

    const hasAnyChanges = useMemo(() => {
        const originalIds = functions?.map(execFunc => execFunc.id) ?? [];
        const currentIds = checkedItemId ?? [];
        if (originalIds.length !== currentIds.length) return true;
        // check if any id differs
        return !originalIds.every(id => currentIds.includes(id));
    }, [checkedItemId, functions]);

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (cancel) {
            if (isOpen && setIsOpen) {
                // Return to list view
                setIsOpen(false);
            } else {
                setOpenModal(false);
                setInputDataConnectModalOpen?.(false);
                setAllSearchableExecutableFunction(allExecutableFunctions);
            }
        } else {
            setOpenModal(open);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        allSearchableExecutableFunction,
        checkedItemId,
        handleItemCheck,
        openModal,
        setOpenModal,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedFunctions,
        onModalClose,
        setIsReordered, // exposed in case parent needs it, though hook handles it mostly
        setAllSearchableExecutableFunction,
    };
};
