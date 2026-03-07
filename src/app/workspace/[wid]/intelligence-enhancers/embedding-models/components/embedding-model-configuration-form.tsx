/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, OptionModel, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { IEmbedding, IProvider } from '@/models';
import { Layers } from 'lucide-react';
import React from 'react';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { FormBody } from './form-body';

export interface EmbeddingModelConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IEmbedding>;
    secrets: OptionModel[];
    isSaving: boolean;
    loadingSecrets?: boolean;
    providers: IProvider[];
    control: Control<IEmbedding, any>;
    isModalRequest?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IEmbedding>;
    watch: UseFormWatch<IEmbedding>;
    setValue: UseFormSetValue<IEmbedding>;
    handleSubmit: UseFormHandleSubmit<IEmbedding>;
    onHandleSubmit: (data: IEmbedding) => void;
    refetch: () => void;
}

export const EmbeddingModelConfigurationForm = (props: EmbeddingModelConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Layers />}
            header={<h3>{isEdit ? 'Edit Embedding Model' : 'New Embedding Model'}</h3>}
            footer={
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        {/* <Button variant="secondary" size={'sm'} disabled>
                            Test Connection
                        </Button> */}
                    </div>
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
                                            All details need to be filled before the form can be saved
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};

export default EmbeddingModelConfigurationForm;
