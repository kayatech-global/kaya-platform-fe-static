/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    OptionModel,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VariablePicker,
} from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { FileX, Info, LoaderCircle, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { TagsInput } from '@/components/atoms/tags-input';
import { Checkbox } from '@/components/atoms/checkbox';
import { cn } from '@/lib/utils';
import {IVariableDefinitions} from "@/hooks/use-generate-synthetic-data";
import { VariableData } from '@/app/workspace/[wid]/variables/components/variable-table-container';

interface BulkVariableConfigModalProps {
    isLoading?: boolean;
    variables: VariableData[] | undefined;
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onApplyVariables: (variables:IVariableDefinitions[]) => void;
    autoInputCount: number;
    initialData?: IVariableDefinitions[];
    testCaseMessage?: string;
}

interface VariableConfigForm {
    variables: IVariableDefinitions[];
}

export const BulkVariableConfigModal = (props: BulkVariableConfigModalProps) => {
    const { isLoading, variables, isOpen, setOpen, onApplyVariables, autoInputCount, initialData, testCaseMessage } =
        props;
    const [forceRender, setForceRender] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        control,
        trigger,
        setValue,
        watch,
    } = useForm<VariableConfigForm>({
        defaultValues: { variables: [] },
        mode: 'all',
    });

    useEffect(() => {
        if (initialData){
            setValue('variables', initialData, { shouldValidate: true });
        } else if (isOpen) {
            setValue('variables', [{ key: '', allowedValues: [], strict: false, description:'', dataType:''}]);
        } else {
            setForceRender(0);
        }
    }, [isOpen, initialData, variables, setValue]);

    useEffect(() => {
        if (!isOpen) {
            setIsExpanded(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const subscription = watch((formValues, { name }) => {
            if (!name || !variables) return;
            const keyMatch = name.match(/^variables\.(\d+)\.key$/);
            if (!keyMatch) return;
            const index = Number.parseInt(keyMatch[1], 10);
            const key = formValues.variables?.[index]?.key;
            if (key) {
                const sharedItem = variables.find(v => v.name === key);
                if (sharedItem) {
                    setValue(`variables.${index}.description`, sharedItem.description);
                }
            } else {
                setValue(`variables.${index}.description`, '');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, variables, setValue]);

    const limit = useMemo(() => {
        if (variables) {
            return variables.length;
        }
        return 0;
    }, [variables]);

    const variablesForPicker = useMemo(() => {
        return variables?.map(v => ({ ...v, type: v.dataType }));
    }, [variables]);

    const usedKeys = new Set((watch('variables') ?? []).map(v => v.key));
    const availableOptions: OptionModel[] = variables
        ? variables.map(x => ({
              name: x.name,
              value: x.name,
              dataType: x.dataType,
              disabled: usedKeys.has(x.name),
          }))
        : [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variables',
    });

    const onCancel = () => {
        setOpen(false);
    };

    const onHandleSubmit = (data: VariableConfigForm) => {
        onApplyVariables(data?.variables);
        setOpen(false);
    };

    const charLimit = 150;
    const isLongMessage = testCaseMessage && testCaseMessage.length > charLimit;
    const displayMessage =
        isLongMessage && !isExpanded ? `${testCaseMessage.substring(0, charLimit)}...` : testCaseMessage;

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[800px] z-[999999]" overlayClassname="z-[999999]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {/* <Variable /> */}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                Variable Configuration
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[500px] drawer-overflow overflow-y-auto">
                        {testCaseMessage && (
                            <div className="flex flex-col gap-1.5 p-3 rounded-md bg-blue-50/50 border border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-800/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500/80">
                                    Sample Input
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line italic leading-relaxed">
                                        &quot;{displayMessage}&quot;
                                    </p>
                                    {isLongMessage && (
                                        <button
                                            type="button"
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-tight"
                                        >
                                            {isExpanded ? 'Show Less' : 'See More'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {testCaseMessage && (
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Variables</p>
                        )}
                        {isLoading || !variables || variables?.length === 0 || availableOptions?.length <= 0 ? (
                            <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
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
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-5 py-3 rounded-md text-sm flex items-center gap-3">
                                    <Info size={18} className="shrink-0" />
                                    <p>Enter keywords and press Enter to add values for each variable</p>
                                </div>
                                <div className="flex flex-col items-start gap-y-[6px] w-full">
                                    {fields?.map((variable, index) => {
                                        const values = watch(`variables.${index}.allowedValues`) || [];
                                        const isStrict = watch(`variables.${index}.strict`);
                                        const isComplete = values.length === autoInputCount;

                                        return (
                                            <div
                                                key={variable.id}
                                                className={cn(
                                                    'w-full flex flex-col gap-3 mb-6 p-4 border rounded-md transition-all group',
                                                    isStrict
                                                        ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
                                                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 dark:bg-gray-900'
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-64">
                                                            <VariablePicker
                                                                {...register(`variables.${index}.key`, {
                                                                    required: true,
                                                                })}
                                                                valueField={`variables.${index}.value`}
                                                                placeholder="Select variable"
                                                                options={availableOptions}
                                                                variables={variablesForPicker}
                                                                labelField={`variables.${index}.key`}
                                                                typeField={`variables.${index}.dataType`}
                                                                index={index}
                                                                forceRender={forceRender}
                                                                setForceRender={setForceRender}
                                                                setValue={setValue}
                                                                trigger={trigger}
                                                                watch={watch}
                                                                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-help">
                                                                            <Controller
                                                                                control={control}
                                                                                name={`variables.${index}.strict`}
                                                                                render={({ field }) => (
                                                                                    <Checkbox
                                                                                        id={`strict-${index}`}
                                                                                        checked={field.value}
                                                                                        onCheckedChange={field.onChange}
                                                                                    />
                                                                                )}
                                                                            />
                                                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 select-none">
                                                                                Pick from the list
                                                                            </span>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        side="top"
                                                                        className="max-w-[280px] p-3 text-xs leading-relaxed z-[1000000]"
                                                                    >
                                                                        <p className="font-bold mb-1 text-indigo-600 dark:text-indigo-400">
                                                                            Strict Value Enforcement
                                                                        </p>
                                                                        <p>
                                                                            If enabled, the LLM will strictly use the
                                                                            provided variable values as-is. If disabled,
                                                                            the LLM has full control to generate
                                                                            contextually relevant variations.
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>

                                                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
                                                        <div
                                                            className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                                                isComplete
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {values.length} / {autoInputCount} Values
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-full"
                                                    >
                                                        <X size={18} />
                                                    </Button>
                                                </div>
                                                <div className="w-full">
                                                    <Controller
                                                        control={control}
                                                        name={`variables.${index}.allowedValues`}
                                                        // rules={{
                                                        //     validate: value =>
                                                        //         value.length === autoInputCount ||
                                                        //         `Must have exactly ${autoInputCount} values (current: ${value.length})`,
                                                        // }}
                                                        render={({ field }) => (
                                                            <TagsInput
                                                                name={field.name}
                                                                control={control}
                                                                helperInfo={`Enter exactly ${autoInputCount} values for generated test cases.`}
                                                            />
                                                        )}
                                                    />
                                                    {errors.variables?.[index]?.allowedValues && (
                                                        <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1.5 px-1">
                                                            <Info size={12} />
                                                            {errors.variables[index]?.allowedValues?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="mb-4">
                                        {limit !== watch('variables')?.length && (
                                            <Button
                                                variant="primary"
                                                disabled={limit === watch('variables')?.length}
                                                onClick={() =>
                                                    append({ key: '', allowedValues: [], strict: false, description:'', dataType:''})
                                                }
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Plus size={18} /> Add Variable
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
                                    All details must be valid before applying. Ensure all variables have exactly{' '}
                                    {autoInputCount} values.
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BulkVariableConfigModal;
