import { Button } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { API } from '@/components/organisms';
import { Unplug } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { GuardrailsFormWrapper } from './guardrails-form-wrapper';
import { GuardrailsList } from './guardrails-list';
import { IGuardrailsApiTool, SelectionMode } from './types';

interface GuardrailsSelectionDialogProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    guardrailsApis: API[] | undefined;
    allGuardrailsApiTools: IGuardrailsApiTool[];
    setGuardrailsApis: React.Dispatch<React.SetStateAction<API[] | undefined>>;
    onGuardrailsApiChange?: (guardrailsApis: API[] | undefined) => void;
    onRefetch: () => void;
    apiLoading?: boolean;
    isMultiple?: boolean;
}

export const GuardrailsSelectionDialog = ({
    openModal,
    setOpenModal,
    guardrailsApis,
    allGuardrailsApiTools,
    setGuardrailsApis,
    onGuardrailsApiChange,
    onRefetch,
    apiLoading,
    isMultiple,
}: GuardrailsSelectionDialogProps) => {
    const [mode, setMode] = useState<SelectionMode>('SELECTING');
    const [checkedItemId, setCheckedItemId] = useState<string[]>();
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState<string>();

    // Reset state when modal opens/closes
    useEffect(() => {
        if (openModal) {
            if (guardrailsApis) {
                setCheckedItemId(guardrailsApis.map(x => x.id));
            } else {
                setCheckedItemId(undefined);
            }
        } else {
            setMode('SELECTING');
            setSearchTerm('');
            setEditId(undefined);
        }
    }, [openModal, guardrailsApis]);

    const handleItemCheck = (guardrailsApi: IGuardrailsApiTool) => {
        setCheckedItemId(prevCheckedItemId => {
            if (isMultiple) {
                if (prevCheckedItemId?.includes(guardrailsApi.id)) {
                    return prevCheckedItemId.filter(id => id !== guardrailsApi.id);
                }
                return [...(prevCheckedItemId || []), guardrailsApi.id];
            }
            return prevCheckedItemId?.includes(guardrailsApi.id) ? [] : [guardrailsApi.id];
        });
    };

    const handleClick = () => {
        const checkedGuardrailsApis = allGuardrailsApiTools
            ?.filter(guardrailsApi => checkedItemId?.includes(guardrailsApi.id))
            ?.map(x => ({
                id: x.id,
                toolId: x.toolId,
                name: x.name,
                description: x.description,
            }));
        setGuardrailsApis(checkedGuardrailsApis);
        setOpenModal(false);
        if (onGuardrailsApiChange) {
            onGuardrailsApiChange(checkedGuardrailsApis);
        }
    };

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (id: string) => {
        setEditId(id);
        setMode('Editing');
    };

    const handleClose = (open: boolean, cancel?: boolean) => {
        if (mode !== 'SELECTING' && cancel) {
            // If in create/edit mode and cancel is clicked, go back to list
            setMode('SELECTING');
            setEditId(undefined);
        } else {
            setOpenModal(open);
        }
    };

    const onFormClose = (open: boolean) => {
        if (!open) {
            // Form success or cancel that effectively closes the form view
            setMode('SELECTING');
            setEditId(undefined);
            onRefetch(); // Refresh list after save
        }
    };

    const getDialogTitle = () => {
        if (mode === 'SELECTING') {
            return 'Guardrails API Configurations';
        }
        return `${mode === 'Editing' ? 'Edit' : 'New'} Guardrails API Configurations`;
    };

    return (
        <Dialog open={openModal} onOpenChange={handleClose}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {openModal && <Unplug />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{getDialogTitle()}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4">
                        {mode === 'SELECTING' ? (
                            <GuardrailsList
                                allGuardrailsApiTools={allGuardrailsApiTools}
                                checkedItemId={checkedItemId}
                                handleSearch={onSearch}
                                handleItemCheck={handleItemCheck}
                                onEdit={handleEdit}
                                loading={!!apiLoading}
                                setOpenForm={() => setMode('Creating')}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            <GuardrailsFormWrapper
                                isEdit={mode === 'Editing'}
                                onRefetch={onRefetch}
                                setOpen={onFormClose}
                                editId={editId}
                                allGuardrailsApiTools={allGuardrailsApiTools}
                                onCancel={() => setMode('SELECTING')}
                            />
                        )}
                    </div>
                </DialogDescription>
                {mode === 'SELECTING' && (
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setOpenModal(false)}>
                            Cancel
                        </Button>
                        <Button disabled={checkedItemId === undefined} variant="primary" onClick={handleClick}>
                            Add Guardrails APIs
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
