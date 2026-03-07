/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, OptionModel } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { IMessageBroker } from '@/models';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFieldArrayRemove,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { MessageBrokerFormBody } from './message-broker-form-body';

export interface MessageBrokerFormProps {
    isOpen: boolean;
    isEdit: boolean;
    errors: FieldErrors<IMessageBroker>;
    isSaving: boolean;
    isValid: boolean;
    control: Control<IMessageBroker>;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    isTopicsTitleValid: boolean;
    loadingIntellisense: boolean;
    intellisenseOptions: any;
    messageBrokerProviders: OptionModel[];
    allIntellisenseValues: string[];
    topicFields: FieldArrayWithId<IMessageBroker, 'configurations.topics', 'internalId'>[];
    selectedTopicId?: string;
    isModalRequest?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IMessageBroker>;
    setValue: UseFormSetValue<IMessageBroker>;
    watch: UseFormWatch<IMessageBroker>;
    trigger: UseFormTrigger<IMessageBroker>;
    validateUniqueTitle: (value: string, currentIndex: number) => true | string;
    appendTopic: () => void;
    removeTopic: UseFieldArrayRemove;
    handleSubmit: UseFormHandleSubmit<IMessageBroker>;
    onHandleSubmit: (data: IMessageBroker) => void;
    refetch: () => void;
    refetchVariables: () => Promise<void>;
}

export const MessageBrokerForm = (props: MessageBrokerFormProps) => {
    const { isOpen, isEdit, isSaving, isValid, setOpen, watch, handleSubmit, onHandleSubmit } = props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<MessageSquare />}
            header={<h3>{isEdit ? 'Edit Message Broker' : 'New Message Broker'}</h3>}
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <MessageBrokerFormBody {...props} />
                </div>
            }
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {getSubmitButtonLabel(isSaving, isEdit)}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All fields need to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            }
        />
    );
};
