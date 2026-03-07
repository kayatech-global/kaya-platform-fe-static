/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { cn } from '@/lib/utils';
import {
    Button,
    Label,
    Input,
    Select,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    OptionModel,
} from '@/components/atoms';
import { Plus, X } from 'lucide-react';
import { UseFormRegister, FieldArrayWithId, Control } from 'react-hook-form';
import { IMetadataFilterValues } from '@/models';

interface InputProps {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    register: UseFormRegister<any>;
    namePrefix: string;
    fields: FieldArrayWithId<any, string, 'id'>[];
    remove: (index: number, type: number) => void;
    append: (type: number) => void;
    type?: number;
    control: Control<any, any>;
    hasType?: boolean;
    disabledInputs?: boolean;
    isQueryParams?: boolean;
    isRequired?: boolean;
    isResponseField?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
    list: IMetadataFilterValues[];
    disabledInputsMessage?: string;
    dataTypeOptions?: OptionModel[];
}

const FilterKeyValueInput = React.forwardRef<HTMLInputElement, InputProps>((props: InputProps, ref) => {
    const {
        isDestructive,
        label,
        supportiveText,
        register,
        namePrefix,
        fields,
        type = 0,
        remove,
        append,
        disabledInputs = false,
        isRequired = false,
        valuePlaceholder = 'Value',
        list,
        disabledInputsMessage,
        dataTypeOptions,
    } = props;
    // const [isDisable, setDisable] = React.useState<boolean>(false);

    React.useEffect(() => {
        onTextChange();
    }, [list, list?.length]);

    const onTextChange = () => {
        // Need to work on this
        // if (
        //     list &&
        //     list?.length > 0 &&
        //     list?.filter(header => isNullOrEmpty(header.key) || isNullOrEmpty(header.value))?.length > 0
        // ) {
        //     setDisable(true);
        // } else {
        //     setDisable(false);
        // }
    };

    return (
        <div
            ref={ref}
            className="flex flex-col items-start gap-y-[6px] w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700"
        >
            {label && <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">{label}</Label>}
            {fields.map((item: any, index) => (
                <div key={item.id} className="w-full flex flex-col sm:flex-row gap-2 mb-2">
                    <Select
                        {...register(`${namePrefix}[${index}].key`)}
                        defaultValue={item.dataType}
                        options={dataTypeOptions?.length ? dataTypeOptions : []}
                        disabled={disabledInputs}
                    />
                    <Input
                        {...register(`${namePrefix}[${index}].value`, { required: isRequired })}
                        placeholder={valuePlaceholder}
                        defaultValue={item.value}
                        disabled={disabledInputs}
                        onKeyUp={onTextChange}
                    />
                    <Button
                        className="w-full sm:w-max"
                        disabled={disabledInputs}
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index, type)}
                    >
                        <X />
                    </Button>
                </div>
            ))}
            <div className="mb-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button disabled={disabledInputs} onClick={() => append(type)}>
                                <span className="flex gap-2">
                                    <Plus /> Add
                                </span>
                            </Button>
                        </TooltipTrigger>
                        {disabledInputsMessage && (
                            <TooltipContent side="top" align="center" className="max-w-[300px]">
                                {disabledInputsMessage}
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
            {supportiveText && (
                <p
                    className={cn('text-xs font-normal', {
                        'text-red-500 dark:text-red-500': isDestructive,
                        'text-gray-500 dark:text-gray-300': !isDestructive,
                    })}
                >
                    {supportiveText}
                </p>
            )}
        </div>
    );
});

FilterKeyValueInput.displayName = 'FilterKeyValueInput';

export { FilterKeyValueInput };
