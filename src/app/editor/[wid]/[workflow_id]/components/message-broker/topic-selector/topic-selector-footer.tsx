import React from 'react';
import { Button, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components';
import { ScheduleTriggerStepType } from '@/enums';
import { UseFormHandleSubmit } from 'react-hook-form';
import { IMessageBroker, IScheduleTrigger } from '@/models';

interface TopicSelectorFooterProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    isSaving: boolean;
    isValidEntry: boolean;
    openScheduleTrigger: boolean;
    activeStep: ScheduleTriggerStepType;
    isSavingScheduler: boolean;
    isValidScheduler: boolean;
    isEditScheduler: boolean;
    isReadOnlyScheduler: boolean;
    saveButtonLabel?: string;
    setActiveStep: React.Dispatch<React.SetStateAction<ScheduleTriggerStepType>>;
    handleClick: () => void;
    handleSubmit: UseFormHandleSubmit<IMessageBroker, undefined>;
    triggerHandleSubmit: UseFormHandleSubmit<IScheduleTrigger, undefined>;
    onHandleSubmit: (data: IMessageBroker) => void;
    triggerOnHandleSubmit: (data: IScheduleTrigger) => void;
    onModalClose: (open: boolean, cancel?: boolean | undefined) => void;
}

export const TopicSelectorFooter = ({
    isOpen,
    isEdit,
    isValid,
    isSaving,
    isValidEntry,
    openScheduleTrigger,
    activeStep,
    isSavingScheduler,
    isValidScheduler,
    isEditScheduler,
    isReadOnlyScheduler,
    saveButtonLabel,
    setActiveStep,
    handleClick,
    handleSubmit,
    triggerHandleSubmit,
    onHandleSubmit,
    triggerOnHandleSubmit,
    onModalClose,
}: TopicSelectorFooterProps) => {
    if (openScheduleTrigger) {
        return (
            <>
                <Button
                    variant="secondary"
                    onClick={() => {
                        if (activeStep === ScheduleTriggerStepType.BASIC) {
                            onModalClose(false, true);
                        } else {
                            setActiveStep(s => (s > 1 ? ((s - 1) as ScheduleTriggerStepType) : s));
                        }
                    }}
                >
                    {activeStep === ScheduleTriggerStepType.BASIC ? 'Cancel' : 'Previous'}
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="primary"
                                disabled={
                                    !isValidScheduler ||
                                    isSavingScheduler ||
                                    (activeStep === ScheduleTriggerStepType.REVIEW &&
                                        isEditScheduler &&
                                        isReadOnlyScheduler)
                                }
                                onClick={() => {
                                    if (activeStep === ScheduleTriggerStepType.REVIEW) {
                                        triggerHandleSubmit(triggerOnHandleSubmit)();
                                    } else {
                                        setActiveStep(s => (s < 4 ? ((s + 1) as ScheduleTriggerStepType) : s));
                                    }
                                }}
                            >
                                {(() => {
                                    if (activeStep !== ScheduleTriggerStepType.REVIEW) return 'Next';
                                    return isEditScheduler ? 'Update' : 'Create';
                                })()}
                            </Button>
                        </TooltipTrigger>
                        {!isValidScheduler && (
                            <TooltipContent side="left" align="center">
                                All details need to be filled before the form can be saved
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </>
        );
    }

    return (
        <>
            <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                Cancel
            </Button>
            {isOpen ? (
                <Button variant="primary" disabled={!isValid || isSaving} onClick={handleSubmit(onHandleSubmit)}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            ) : (
                <Button disabled={!isValidEntry} variant="primary" onClick={handleClick}>
                    {saveButtonLabel ?? 'Add Message Broker'}
                </Button>
            )}
        </>
    );
};
