import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';

export interface McpSelectorFooterProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    isSaving: boolean;
    handleSubmit: () => void;
    handleClick: () => void;
    onModalClose: (open: boolean, cancel?: boolean) => void;
    hasAnyChanges: boolean;
}

export const McpSelectorFooter = ({
    isOpen,
    isEdit,
    isValid,
    isSaving,
    handleSubmit,
    handleClick,
    onModalClose,
    hasAnyChanges,
}: McpSelectorFooterProps) => {
    return (
        <div className="h-fit flex justify-end gap-x-2">
            <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                Cancel
            </Button>
            {isOpen ? (
                <Button variant="primary" disabled={!isValid || isSaving} onClick={handleSubmit}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="primary" onClick={handleClick} disabled={!hasAnyChanges}>
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
