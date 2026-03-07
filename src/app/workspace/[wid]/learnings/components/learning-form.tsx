/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { BrainCircuit } from 'lucide-react';
import { Button, Input, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, validateSpaces } from '@/lib/utils';
import { ILearningForm } from '@/models';

interface LearningProps {
    isOpen: boolean;
    isValid: boolean;
    errors: FieldErrors<ILearningForm>;
    isSaving: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<ILearningForm>;
    watch: UseFormWatch<ILearningForm>;
    handleSubmit: UseFormHandleSubmit<ILearningForm>;
    onHandleSubmit: (data: ILearningForm) => void;
}

export const FormBody = (props: LearningProps) => {
    const { register, watch, errors } = props;

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid grid-cols-1 gap-y-4 sm:gap-4">
            <Input
                {...register('name', {
                    required: { value: true, message: 'Please enter a record name' },
                    validate: value => validateSpaces(value, 'name'),
                })}
                placeholder="Enter record name"
                readOnly={isReadOnly}
                label="Record Name"
                autoComplete="off"
                isDestructive={!!errors?.name?.message}
                supportiveText={errors?.name?.message}
            />
            <Textarea
                {...register('description', {
                    required: { value: true, message: 'Please enter a description' },
                    minLength: { value: 20, message: 'Description must be at least 20 characters long' },
                    validate: value => validateSpaces(value, 'description'),
                })}
                label="Description"
                placeholder="Enter your description"
                readOnly={isReadOnly}
                isDestructive={!!errors?.description?.message}
                supportiveText={errors?.description?.message}
            />
        </div>
    );
};

export const LearningForm = (props: LearningProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isValid, isSaving } = props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content"
            dismissible={false}
            headerIcon={<BrainCircuit />}
            header="Edit Learning"
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
                                        disabled={!isValid || isSaving || !!watch('isReadOnly')}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {isSaving ? 'Saving' : 'Update'}
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
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};

export default LearningForm;
