/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, OptionModel, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { IProvider } from '@/models';
import { BarChart2 } from 'lucide-react';
import React from 'react';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { IReRanking } from '@/models/re-ranking.models';
import { FormBody } from './form-body';

export interface ReRankingModelConfigurationFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IReRanking>;
    secrets: OptionModel[];
    isSaving: boolean;
    loadingSecrets?: boolean;
    providers: IProvider[];
    control: Control<IReRanking, any>;
    isModalRequest?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IReRanking>;
    watch: UseFormWatch<IReRanking>;
    setValue: UseFormSetValue<IReRanking>;
    handleSubmit: UseFormHandleSubmit<IReRanking>;
    onHandleSubmit: (data: IReRanking) => void;
    refetch: () => void;
}

export const ReRankingModelConfigurationForm = (props: ReRankingModelConfigurationFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<BarChart2 />}
            header={<h3>{isEdit ? 'Edit Re-ranking Model' : 'New Re-ranking Model'}</h3>}
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

export default ReRankingModelConfigurationForm;
