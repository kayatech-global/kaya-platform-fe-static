'use client';
import React from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { getSubmitButtonLabel } from '@/lib/utils';
import { Play } from 'lucide-react';

interface ApiSelectorFooterProps {
    isOpen: boolean;
    canTestApi: boolean;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    onHandleSubmit: () => void;
    onTestClick: () => void;
    onAddClick: () => void;
    onModalClose: (open: boolean, cancel?: boolean) => void;
    hasAnyChanges: boolean;
}

export const ApiSelectorFooter: React.FC<ApiSelectorFooterProps> = ({
    isOpen,
    canTestApi,
    isValid,
    isSaving,
    isEdit,
    onHandleSubmit,
    onTestClick,
    onAddClick,
    onModalClose,
    hasAnyChanges,
}) => {
    return (
        <>
            {isOpen ? (
                <div className="flex justify-between items-center w-full gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="primary" size="sm" onClick={onTestClick} disabled={!canTestApi}>
                                    <Play className="h-4 w-4 mr-1" />
                                    Test API
                                </Button>
                            </TooltipTrigger>
                            {!canTestApi && (
                                <TooltipContent side="right" align="center">
                                    Please specify the API name, URL and the type to test the connection
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <div className="flex justify-end gap-2 ml-auto">
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="sm" disabled={!isValid || isSaving} onClick={onHandleSubmit}>
                                        {getSubmitButtonLabel(isSaving, isEdit)}
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
