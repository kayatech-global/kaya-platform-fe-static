import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';

interface GraphRagFooterProps {
    isOpen: boolean; // Is form open
    currentStep: number;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    hasAnyChanges: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onCancel: () => void;
    onApply: () => void;
}

export const GraphRagFooter = ({
    isOpen,
    currentStep,
    isValid,
    isSaving,
    isEdit,
    hasAnyChanges,
    onPrevious,
    onNext,
    onSubmit,
    onCancel,
    onApply,
}: GraphRagFooterProps) => {
    const buttonLabel = (() => {
        if (currentStep === 3) {
            if (isSaving) return 'Saving';
            return isEdit ? 'Update' : 'Create';
        }
        return 'Next';
    })();

    if (isOpen) {
        return (
            <div className="h-fit flex justify-end gap-x-2 mr-4">
                {currentStep >= 2 ? (
                    <Button variant={'secondary'} size={'sm'} onClick={onPrevious}>
                        Previous
                    </Button>
                ) : (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    variant="primary"
                    disabled={!isValid || isSaving}
                    onClick={currentStep === 3 ? onSubmit : onNext}
                >
                    {buttonLabel}
                </Button>
            </div>
        );
    }

    return (
        <div className="h-fit flex justify-end gap-x-2 mr-4">
            <Button variant="secondary" onClick={onCancel}>
                Cancel
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="primary" onClick={onApply} disabled={!hasAnyChanges}>
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
        </div>
    );
};
