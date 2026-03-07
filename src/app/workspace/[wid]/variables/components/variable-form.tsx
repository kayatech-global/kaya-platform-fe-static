import {
    Button,
    Input,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateIdentifier, validateSpaces } from '@/lib/utils';
import { IVariable } from '@/models';
import { validateField } from '@/utils/validation';
import { Braces } from 'lucide-react';
import { useMemo } from 'react';
import {
    Control,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';

export interface VariableProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IVariable>;
    isSaving: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IVariable>;
    watch: UseFormWatch<IVariable>;
    setValue: UseFormSetValue<IVariable>;
    handleSubmit: UseFormHandleSubmit<IVariable>;
    onHandleSubmit: (data: IVariable) => void;
    control: Control<IVariable, unknown>;
}

export const FormBody = (props: VariableProps) => {
    const { register, watch, setValue, errors, isEdit } = props;

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const isReadOnlyValue = watch('isReadOnly');
    const isReadOnly = useMemo(() => !!isReadOnlyValue, [isReadOnlyValue]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        {...register('name', {
                            required: { value: true, message: 'Please enter a variable name' },
                            validate: value => validateIdentifier(value),
                        })}
                        placeholder="Enter your variable name"
                        readOnly={isEdit && isReadOnly}
                        label="Variable Name"
                        autoComplete="off"
                        isDestructive={!!errors?.name?.message}
                        supportiveText={errors?.name?.message}
                        onBlur={e => {
                            const lower = e.target.value.toLowerCase();
                            setValue('name', lower, { shouldValidate: true });
                        }}
                    />
                    <Select
                        {...register('dataType', {
                            required: { value: true, message: 'Please select a data type' },
                        })}
                        placeholder="Select your Data Type"
                        disabled={isEdit && isReadOnly}
                        label="Data Type"
                        options={[
                            { value: 'string', name: 'string' },
                            { value: 'int', name: 'int' },
                            { value: 'float', name: 'float' },
                            { value: 'bool', name: 'bool' },
                        ]}
                        currentValue={watch('dataType')}
                        isDestructive={!!errors?.dataType?.message}
                        supportiveText={errors?.dataType?.message}
                    />
                </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        validate: value => validateSpaces(value, 'description'),
                    })}
                    placeholder="Enter your Description"
                    readOnly={isEdit && isReadOnly}
                    label="Description"
                    autoComplete="off"
                    rows={8}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
        </div>
    );
};

export const VariableForm = (props: VariableProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Braces />}
            header={isEdit ? 'Edit Variable' : 'New Variable'}
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
