'use client';

import React from 'react';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { Button, OptionModel, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { BulkApiImportWizardView } from '@/components/molecules/api-step-wizard/bulk-api-import-wizard-view';
import { UploadCloud } from 'lucide-react';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { BulkApiStepType } from '@/enums';
import { useApiImport } from '@/hooks/use-api-import';

export interface BulkApiImportDrawerProps {
    open: boolean;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    setOpen: (open: boolean) => void;
    refetch: () => void;
    refetchApiConfigs: () => void;
}

export const BulkApiImportDrawer = (props: BulkApiImportDrawerProps) => {
    const { isMobile } = useBreakpoint();
    const apiImportHook = useApiImport({ data: props });
    const { open, secrets, loadingSecrets, setOpen, refetch } = props;
    const {
        activeStep,
        hasUploadErrors,
        isValid,
        errors,
        getUploadErrorMessage,
        swaggerLoading,
        selectedCount,
        setActiveStep,
        resetWizard,
        handleImport,
    } = apiImportHook;

    return (
        <AppDrawer
            open={open}
            direction={isMobile ? 'bottom' : 'right'}
            isPlainContentSheet={false}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            setOpen={(next: boolean) => {
                if (!next) resetWizard();
                setOpen(next);
            }}
            headerIcon={<UploadCloud />}
            header={'Import APIs'}
            content={
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-10">
                        Import multiple APIs from Swagger/OpenAPI specification files
                    </p>
                    <BulkApiImportWizardView
                        {...apiImportHook}
                        secrets={secrets}
                        loadingSecrets={loadingSecrets}
                        refetch={refetch}
                    />
                </div>
            }
            footer={
                <div className="flex justify-between items-center w-full">
                    <div>
                        {activeStep > 1 && activeStep < 4 && (
                            <Button
                                variant={'secondary'}
                                size={'sm'}
                                onClick={() => setActiveStep(s => (s > 1 ? ((s - 1) as BulkApiStepType) : s))}
                            >
                                Previous
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            onClick={() => {
                                resetWizard();
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        {activeStep < 3 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            onClick={() => setActiveStep(s => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s))}
                                            disabled={
                                                (activeStep === 1 && hasUploadErrors) || (activeStep === 2 && !isValid)
                                            }
                                        >
                                            Next
                                        </Button>
                                    </TooltipTrigger>
                                    {((activeStep === 1 && hasUploadErrors) ||
                                        (activeStep === 2 && (!!errors?.baseUrl || !isValid))) && (
                                        <TooltipContent>
                                            {(() => {
                                                if (activeStep === 1) return getUploadErrorMessage;
                                                if (activeStep === 2 && !!errors?.baseUrl)
                                                    return 'Please fix base URL validation errors';
                                                if (activeStep === 2 && !isValid)
                                                    return 'Please complete all required authentication fields (header name and vault key)';
                                                return 'Please complete required fields';
                                            })()}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {activeStep === 3 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            disabled={swaggerLoading || selectedCount === 0 || !isValid}
                                            onClick={handleImport}
                                        >
                                            Import
                                        </Button>
                                    </TooltipTrigger>
                                    {(swaggerLoading || selectedCount === 0 || activeStep === 3) && (
                                        <TooltipContent side="left" align="center" className="text-red-500">
                                            {(() => {
                                                if (swaggerLoading) return 'Loading API preview, please wait...';
                                                if (selectedCount === 0)
                                                    return 'Please select at least one API to import';
                                                return 'Please fix validation errors in selected APIs';
                                            })()}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            }
        />
    );
};
