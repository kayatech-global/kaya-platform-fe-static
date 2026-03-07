'use client';
import React from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';

interface ExecutableFunctionSelectorFooter {
    isOpen: boolean;
    isValid: boolean;
    isDeploying: boolean;
    isEdit: boolean;
    onHandleSubmit: () => void;
    onAddClick: () => void;
    onModalClose: (open: boolean, cancel?: boolean) => void;
    hasAnyChanges: boolean;
}

export const ExecutableFunctionSelectorFooter: React.FC<ExecutableFunctionSelectorFooter> = ({
    isOpen,
    isValid,
    isDeploying,
    isEdit,
    onHandleSubmit,
    onAddClick,
    onModalClose,
    hasAnyChanges,
}) => {
    return (
        <>
            {isOpen ? (
                <div className="flex justify-between items-center w-full gap-2">
                    <div className="flex justify-end gap-2 ml-auto">
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        size="sm" 
                                        disabled={!isValid || isDeploying} 
                                        loading={isDeploying}
                                        onClick={onHandleSubmit}
                                    >
                                        {(() => {
                                            if (isDeploying && isEdit) return 'Redeploying';
                                            if (isDeploying) return 'Deploying';
                                            if (isEdit) return 'Update & Redeploy';
                                            return 'Save & Deploy';
                                        })()}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            ) : (
                <>
                    <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                        Cancel
                    </Button>
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
                </>
            )}
        </>
    );
};
