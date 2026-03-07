import React from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';

interface ConnectorSelectorFooterProps {
    isOpen: boolean; // Form is open
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    onHandleSubmit: () => void;
    onAddClick: () => void;
    onModalClose: (open: boolean, cancel: boolean) => void;
    hasAnyChanges: boolean;
}

export const ConnectorSelectorFooter: React.FC<ConnectorSelectorFooterProps> = ({
    isOpen,
    isValid,
    isSaving,
    isEdit,
    onHandleSubmit,
    onAddClick,
    onModalClose,
    hasAnyChanges,
}) => {
    return (
        <div className="h-fit flex justify-end gap-x-2 mr-4">
            <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                Cancel
            </Button>
            {isOpen ? (
                <Button variant="primary" disabled={!isValid || isSaving} onClick={onHandleSubmit}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="primary" onClick={onAddClick} disabled={!hasAnyChanges}>
                                Apply Changes
                            </Button>
                        </TooltipTrigger>
                        {!hasAnyChanges && (
                            <TooltipContent side="left" align="center">
                                No changes to apply
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};
