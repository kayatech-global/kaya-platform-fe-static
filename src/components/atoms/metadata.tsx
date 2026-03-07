'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { cn, isNullOrEmpty } from '@/lib/utils';
import { Button, Label, Input, MultiSelect } from '@/components/atoms';
import { Plus, X } from 'lucide-react';
import {
    UseFormRegister,
    FieldArrayWithId,
    Control,
    FieldErrors,
    Controller,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { IOption, IWorkspaceMetadata } from '@/models';
import { get } from 'lodash';
import { toast } from 'sonner';

interface InputProps {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    namePrefix: string;
    fields: FieldArrayWithId<any, string, 'id'>[];
    control: Control<any, any>;
    disabledInputs?: boolean;
    disabledAdd?: boolean;
    isRequired?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
    list: IWorkspaceMetadata[];
    className?: string;
    errors?: FieldErrors<any>;
    metadataList: IOption[];
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    remove: (index: number) => void;
    append: () => void;
    onCreate: (value: string) => void;
}

const Metadata = React.forwardRef<HTMLInputElement, InputProps>((props: InputProps, ref) => {
    const {
        isDestructive,
        label,
        supportiveText,
        namePrefix,
        fields,
        disabledInputs = false,
        disabledAdd = false,
        isRequired = false,
        namePlaceholder = 'Name',
        valuePlaceholder = 'Value',
        control,
        list,
        className,
        errors,
        metadataList,
        register,
        setValue,
        watch,
        remove,
        append,
        onCreate,
    } = props;
    const [isDisable, setDisable] = React.useState(false);
    const [maxNameLength] = React.useState<number>(50);
    const [maxValueLength] = React.useState<number>(255);

    React.useEffect(() => {
        onTextChange();
    }, [list, list?.length]);

    const onTextChange = () => {
        if (
            list &&
            list?.length > 0 &&
            (list?.filter(header => isNullOrEmpty(header.name) || isNullOrEmpty(header.value))?.length > 0 ||
                list?.filter(header => header.name?.length > maxNameLength || header.value?.length > maxValueLength)
                    ?.length > 0)
        ) {
            setDisable(true);
        } else {
            setDisable(false);
        }
    };

    const validateName = (value: string) => {
        if (value) {
            const validHeaderRegex = /^[A-Za-z_]\w*$/;
            if (value.startsWith(' ')) {
                return 'No leading spaces in name';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in name';
            }
            if (value?.length > maxNameLength) {
                return `Name cannot exceed ${maxNameLength} characters`;
            }
            if (!validHeaderRegex.test(value)) {
                return 'Name must be a valid key';
            }
        }
        return true;
    };

    const onNameCreate = (value: string, index: number) => {
        if (isNullOrEmpty(value)) {
            toast.error('Cannot create a empty value. Please enter a valid name to continue');
        } else {
            const result = metadataList?.find(x => x.value?.toLowerCase() === value?.toLowerCase()?.trim());
            const metadataName = result?.value ?? value?.trim();
            setValue(
                `${namePrefix}[${index}].modelNameOption`,
                { label: metadataName, value: metadataName },
                { shouldValidate: true }
            );
            setValue(`${namePrefix}[${index}].name`, metadataName);
            if (validateName(metadataName) === true) {
                onCreate(metadataName);
            }
            onTextChange();
        }
    };

    return (
        <div
            ref={ref}
            className={cn('flex flex-col items-start gap-y-[6px] w-full p-2 rounded-lg border', className, {
                'border-red-300': isDestructive,
                'border-gray-300 dark:border-gray-700': !isDestructive,
            })}
        >
            {label && <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">{label}</Label>}
            {fields.map((item: any, index) => (
                <div key={item.id} className="w-full flex flex-col sm:flex-row gap-2 mb-2">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col items-start gap-y-[6px] w-full">
                            <div className="relative flex items-center w-full">
                                <Controller
                                    name={`${namePrefix}[${index}].modelNameOption`}
                                    control={control}
                                    rules={{
                                        required: isRequired
                                            ? { value: isRequired, message: 'Please select or create a name' }
                                            : false,
                                        validate: option => validateName(option?.value),
                                    }}
                                    render={({ field, fieldState }) => (
                                        <MultiSelect
                                            {...field}
                                            menuPlacement="auto"
                                            options={metadataList}
                                            isMenuHeightAuto={true}
                                            isDestructive={!!fieldState?.error?.message}
                                            value={watch(`${namePrefix}[${index}].modelNameOption`) || null}
                                            menuPortalTarget={document.body}
                                            isSearchable
                                            placeholder={namePlaceholder}
                                            onChange={(selectedOptions: any) => {
                                                field.onChange({
                                                    label: selectedOptions?.value?.trim(),
                                                    value: selectedOptions?.value?.trim(),
                                                });
                                                setValue(
                                                    `${namePrefix}[${index}].name`,
                                                    selectedOptions?.value?.trim() ?? ''
                                                );
                                                onTextChange();
                                            }}
                                            menuPosition="fixed"
                                            menuClass="!z-50"
                                            menuPortalClass="!z-50 pointer-events-auto"
                                            menuListClass="break-all"
                                            isDisabled={disabledInputs}
                                            isCreatable={true}
                                            onCreateOption={value => onNameCreate(value, index)}
                                        />
                                    )}
                                />
                            </div>
                            {!!get(errors, `${namePrefix}.${index}.modelNameOption.message`) && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500">
                                    {(() => {
                                        const err = get(errors, `${namePrefix}.${index}.modelNameOption`);
                                        const msg = err?.message;
                                        if (!msg) return undefined;
                                        return typeof msg === 'string' ? msg : JSON.stringify(msg);
                                    })()}
                                </p>
                            )}
                        </div>
                        <Input
                            {...register(`${namePrefix}[${index}].value`, {
                                required: isRequired ? { value: isRequired, message: 'Please enter a value' } : false,
                                maxLength: {
                                    value: maxValueLength,
                                    message: `Value cannot exceed ${maxValueLength} characters`,
                                },
                            })}
                            placeholder={valuePlaceholder}
                            defaultValue={item.value}
                            disabled={disabledInputs}
                            isDestructive={!!get(errors, `${namePrefix}.${index}.value.message`)}
                            supportiveText={(() => {
                                const err = get(errors, `${namePrefix}.${index}.value`);
                                const msg = err?.message;
                                if (!msg) return undefined;
                                return typeof msg === 'string' ? msg : JSON.stringify(msg);
                            })()}
                            onKeyUp={onTextChange}
                        />
                    </div>
                    <div className="mt-1.5">
                        <Button
                            className="w-full sm:w-max disabled:cursor-not-allowed disabled:bg-transparent"
                            disabled={disabledInputs}
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                        >
                            <X />
                        </Button>
                    </div>
                </div>
            ))}
            <div className="mb-2">
                <Button size="sm" disabled={disabledInputs || isDisable || disabledAdd} onClick={append}>
                    <span className="flex gap-2">
                        <Plus /> Add
                    </span>
                </Button>
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

Metadata.displayName = 'Metadata';

export { Metadata };
