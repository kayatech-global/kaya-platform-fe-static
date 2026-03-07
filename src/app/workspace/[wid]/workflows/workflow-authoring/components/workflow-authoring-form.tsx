import {
    Button,
    Input,
    Label,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    MultiSelect,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { IGroupOption, IWorkflowAuthoringForm } from '@/models';
import { validateField } from '@/utils/validation';
import { Workflow } from 'lucide-react';
import { useMemo } from 'react';
import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormWatch } from 'react-hook-form';

interface WorkflowAuthoringFProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    isSaving: boolean;
    tagNames: IGroupOption[];
    errors: FieldErrors<IWorkflowAuthoringForm>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<IWorkflowAuthoringForm, any>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IWorkflowAuthoringForm>;
    watch: UseFormWatch<IWorkflowAuthoringForm>;
    handleSubmit: UseFormHandleSubmit<IWorkflowAuthoringForm>;
    onHandleSubmit: (data: IWorkflowAuthoringForm) => void;
}

export const FormBody = (props: WorkflowAuthoringFProps) => {
    const { register, watch, isEdit, tagNames, control, errors } = props;
    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const isReadOnlyValue = watch('isReadOnly');
    const isReadOnly = useMemo(() => !!isReadOnlyValue, [isReadOnlyValue]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Workflow Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'workflow name'),
                    })}
                    placeholder="Enter Workflow Name"
                    readOnly={isEdit && isReadOnly}
                    label="Workflow Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        validate: value => validateSpaces(value, 'workflow description'),
                    })}
                    placeholder="Enter Workflow Description"
                    readOnly={isEdit && isReadOnly}
                    label="Workflow Description"
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <div className="flex flex-col items-start gap-y-[6px] w-full">
                    <div className="flex flex-col items-start gap-y-[6px] w-full">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Tags</Label>
                        <div className="relative flex items-center w-full">
                            <Controller
                                name="options"
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => (
                                    <MultiSelect
                                        {...field}
                                        options={tagNames as never}
                                        menuPortalTarget={document.body}
                                        isMulti
                                        placeholder="Select Workflow Tags"
                                        onChange={selectedOptions => field.onChange(selectedOptions)}
                                        menuClass="!z-50"
                                        menuPortalClass="!z-50 pointer-events-auto"
                                        isDisabled={isEdit && isReadOnly}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorkflowAuthoringForm = (props: WorkflowAuthoringFProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content"
            dismissible={false}
            headerIcon={<Workflow />}
            header={isEdit ? 'Edit Workflow' : 'New Workflow'}
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

export default WorkflowAuthoringForm;
