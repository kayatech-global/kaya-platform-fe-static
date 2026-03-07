import React from 'react';
import { Button } from '@/components';
import { Check, X, Pencil } from 'lucide-react';

type TestCaseActionButtonsProps = {
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
};

export const TestCaseActionButtons = ({ isEditing, onEdit, onSave, onCancel }: TestCaseActionButtonsProps) => {
    if (isEditing) {
        return (
            <>
                <Button size="sm" variant="ghost" onClick={onSave} className="p-1 h-7 w-7">
                    <Check size={16} className="text-green-600" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel} className="p-1 h-7 w-7">
                    <X size={16} className="text-red-600" />
                </Button>
            </>
        );
    }

    return (
        <Button size="sm" variant="ghost" onClick={onEdit} className="p-1 h-7 w-7">
            <Pencil size={16} className="text-blue-600" />
        </Button>
    );
};
