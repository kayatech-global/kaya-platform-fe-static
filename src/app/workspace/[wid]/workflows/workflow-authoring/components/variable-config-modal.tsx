/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    OptionModel,
    Select,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VariablePicker,
    VariableValuePicker,
} from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { IVariableOption, ISharedItem } from '@/models';
import { FileX, LoaderCircle, Plus, Variable, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

interface VariableConfigModalProps {
    isLoading?: boolean;
    variables: ISharedItem[] | undefined;
    isOpen: boolean;
    currentVariable: IVariableOption[] | undefined;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onApplyVariables: (variables: IVariableOption[] | undefined) => void;
    /** When provided, replaces the value input with a column selector for upload mode */
    excelHeaders?: string[];
}

interface VariableConfigForm {
    variables: IVariableOption[];
}

export const VariableConfigModal = (props: VariableConfigModalProps) => {
    const { isLoading, variables, currentVariable, isOpen, setOpen, onApplyVariables, excelHeaders } = props;
    const isColumnMode = !!excelHeaders && excelHeaders.length > 0;
    const columnOptions = useMemo(
        () => (excelHeaders ?? []).map(h => ({ name: h, value: h })),
        [excelHeaders]
    );
    const [forceRender, setForceRender] = useState<number>(0);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        control,
        trigger,
        setValue,
        watch,
        reset,
    } = useForm<VariableConfigForm>({ defaultValues: { variables: [{ label: '', value: '', type:'' }] }, mode: 'all' });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'variables',
    });

    useEffect(() => {
        if (currentVariable && currentVariable?.length > 0 && isOpen && variables && variables?.length > 0) {
            const expectedValues = new Set(variables.map(x => x.name));
            const expectedVariables = currentVariable.filter(x => expectedValues.has(x.label));
            replace(expectedVariables?.length > 0 ? expectedVariables : [{ label: '', value: '', type: '' }]);
        } else if (isOpen) {
            replace([{ label: '', value: '', type: '' }]);
        } else {
            setForceRender(0);
        }
    }, [currentVariable, isOpen, variables]);

    useEffect(() => {
        if (!isOpen) {
            reset({ variables: [{ label: '', value: '',type:'' }] });
        }
    }, [isOpen, reset]);

    const limit = useMemo(() => {
        if (variables) {
            return variables.length;
        }
        return 0;
    }, [variables]);

    const usedLabels = new Set((watch('variables') ?? []).map(o => o.label));
    const availableOptions: OptionModel[] = variables
        ? variables.map(x => ({
              name: x.name,
              value: x.name,
              disabled: usedLabels.has(x.name),
          }))
        : [];

    const onCancel = () => {
        onApplyVariables(currentVariable);
        setOpen(false);
    };

    const onHandleSubmit = (data: VariableConfigForm) => {
        onApplyVariables(data?.variables);
        setOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[680px] z-[999999]" overlayClassname="z-[999999]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            <Variable />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                {isColumnMode ? 'Map Variables to Columns' : 'Workflow Variables'}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] drawer-overflow">
                        {isLoading || !variables || variables?.length === 0 || availableOptions?.length <= 0 ? (
                            <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                {isLoading ? (
                                    <>
                                        <LoaderCircle
                                            className="animate-spin"
                                            size={25}
                                            width={25}
                                            height={25}
                                            absoluteStrokeWidth={undefined}
                                        />
                                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                            Please wait! loading the workflow variables data for you...
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                            No Workflow Variables have been
                                            <br /> configured
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-y-4 sm:gap-4">
                                {isColumnMode && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2 rounded-md">
                                        Select which Excel column to use as the value for each workflow variable. The column value will be read per row during test execution.
                                    </p>
                                )}
                                <div className="flex flex-col items-start gap-y-[6px] w-full">
                                    {fields?.map((variable, index) => (
                                        <div key={variable.id ?? `var-${index}`} className="w-full flex flex-col sm:flex-row gap-2 mb-2">
                                            <VariablePicker
                                                {...register(`variables.${index}.label`, { required: true })}
                                                placeholder="Select a variable"
                                                options={availableOptions}
                                                variables={variables}
                                                labelField={`variables.${index}.label`}
                                                valueField={`variables.${index}.value`}
                                                typeField={`variables.${index}.type`}
                                                index={index}
                                                forceRender={forceRender}
                                                setForceRender={setForceRender}
                                                setValue={setValue}
                                                trigger={trigger}
                                                watch={watch}
                                            />
                                            {isColumnMode ? (
                                                <Controller
                                                    control={control}
                                                    name={`variables.${index}.value`}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Select
                                                            options={columnOptions}
                                                            value={String(field.value || '')}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                                field.onChange(e.target.value)
                                                            }
                                                            placeholder="Select column"
                                                            className="flex-1"
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <VariableValuePicker
                                                    fieldType={`variables.${index}.type`}
                                                    fieldName={`variables.${index}.value`}
                                                    data={{
                                                        type: watch(`variables.${index}.type`),
                                                        value: watch(`variables.${index}.value`),
                                                    }}
                                                    errorMessage={errors?.variables?.[index]?.value?.message}
                                                    control={control}
                                                    register={register}
                                                    setValue={setValue}
                                                    watch={watch}
                                                    trigger={trigger}
                                                />
                                            )}
                                            <Button
                                                className="w-full sm:w-max"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="mb-2">
                                        {limit !== watch('variables')?.length && (
                                            <Button
                                                disabled={limit === watch('variables')?.length || !isValid}
                                                onClick={() => append({ label: '', value: '',type:'' })}
                                            >
                                                <span className="flex gap-2">
                                                    <Plus /> Add
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="primary" onClick={handleSubmit(onHandleSubmit)} disabled={!isValid}>
                                    Apply
                                </Button>
                            </TooltipTrigger>
                            {!isValid && (
                                <TooltipContent side="left" align="center">
                                    All details needs to be filled before the variable can be applied
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VariableConfigModal;
