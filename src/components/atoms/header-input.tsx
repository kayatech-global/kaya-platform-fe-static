'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { cn, isNullOrEmpty, validateIdentifier } from '@/lib/utils';
import {
    Button,
    Label,
    Input,
    Select,
    Textarea,
    OptionModel,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    Checkbox,
    TooltipContent,
    VaultSelector,
} from '@/components/atoms';
import { Plus, X } from 'lucide-react';
import { UseFormRegister, FieldArrayWithId, Control, FieldErrors, Controller, UseFormWatch } from 'react-hook-form';
import { IHeaderValues } from '@/models';
import { get } from 'lodash';
import { HeaderType } from '@/hooks/use-guardrails-api-configuration';

// Mock query param options for dropdown selection
export const MOCK_QUERY_PARAM_OPTIONS: OptionModel[] = [
    { name: 'user_id', value: 'user_id' },
    { name: 'email', value: 'email' },
    { name: 'username', value: 'username' },
    { name: 'page', value: 'page' },
    { name: 'limit', value: 'limit' },
    { name: 'offset', value: 'offset' },
    { name: 'sort_by', value: 'sort_by' },
    { name: 'order', value: 'order' },
    { name: 'search', value: 'search' },
    { name: 'filter', value: 'filter' },
    { name: 'category', value: 'category' },
    { name: 'status', value: 'status' },
    { name: 'start_date', value: 'start_date' },
    { name: 'end_date', value: 'end_date' },
    { name: 'include_deleted', value: 'include_deleted' },
];

// Mock response field options for dropdown selection  
export const MOCK_RESPONSE_FIELD_OPTIONS: OptionModel[] = [
    { name: 'id', value: 'id' },
    { name: 'name', value: 'name' },
    { name: 'email', value: 'email' },
    { name: 'status', value: 'status' },
    { name: 'created_at', value: 'created_at' },
    { name: 'updated_at', value: 'updated_at' },
    { name: 'total', value: 'total' },
    { name: 'count', value: 'count' },
    { name: 'data', value: 'data' },
    { name: 'items', value: 'items' },
    { name: 'message', value: 'message' },
    { name: 'success', value: 'success' },
    { name: 'error_code', value: 'error_code' },
    { name: 'metadata', value: 'metadata' },
    { name: 'pagination', value: 'pagination' },
];

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
    typePlaceholder?: string;
    list: IHeaderValues[];
    onInputsValid?: () => void;
    className?: string;
    useTextarea?: boolean;
    textareaPlaceholder?: string;
    errors?: FieldErrors<any>;
    isIncludeSecrets?: boolean;
    loadingSecrets?: boolean;
    secrets?: OptionModel[];
    watch?: UseFormWatch<any>;
    customNameValidator?: (value: string, index?: number) => string | true;
    customValueValidator?: (value: string, index?: number) => string | true;
    onSecretRefetch?: () => void;
    useSelectableParamName?: boolean;
    paramNameOptions?: OptionModel[];
}

const HeaderInput = React.forwardRef<HTMLInputElement, InputProps>((props: InputProps, ref) => {
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
        control,
        hasType = true,
        disabledInputs = false,
        isQueryParams = false,
        isRequired = false,
        isResponseField = false,
        namePlaceholder = 'Name',
        valuePlaceholder = 'Value',
        typePlaceholder = 'Type',
        list,
        onInputsValid,
        className,
        useTextarea,
        errors,
        isIncludeSecrets,
        loadingSecrets,
        secrets,
        watch,
        customNameValidator,
        customValueValidator,
        onSecretRefetch,
        useSelectableParamName = false,
        paramNameOptions = [],
    } = props;
    const [isDisable, setDisable] = React.useState(false);

    React.useEffect(() => {
        onTextChange();
    }, [list, list?.length]);

    React.useEffect(() => {
        if (list?.length > 0 && isIncludeSecrets && !loadingSecrets) {
            onTextChange();
        }
    }, [list, list?.length, isIncludeSecrets, loadingSecrets, secrets?.length]);

    const dataTypeOptions = React.useMemo(() => {
        if (isQueryParams || isResponseField) {
            return [
                { value: 'string', name: 'string' },
                { value: 'int', name: 'int' },
                { value: 'float', name: 'float' },
                { value: 'bool', name: 'bool' },
            ];
        }
        return [
            { value: 'string', name: 'string' },
            { value: 'int', name: 'int' },
            { value: 'float', name: 'float' },
            { value: 'bool', name: 'bool' },
            { value: 'list', name: 'list' },
            { value: 'dict', name: 'dict' },
        ];
    }, [isQueryParams, isResponseField]);

    const onTextChange = () => {
        if (
            list &&
            list?.length > 0 &&
            list?.filter(header => isNullOrEmpty(header.name) || isNullOrEmpty(header.value))?.length > 0
        ) {
            setDisable(true);
        } else if (
            isIncludeSecrets &&
            list &&
            list?.length > 0 &&
            list?.some(x => x.isSecret && !(secrets ?? [])?.map(p => p.value).includes(x.value))
        ) {
            setDisable(true);
        } else if (type === HeaderType.PromotedVariables) {
            const invalidHeaders = list?.filter(header => validateIdentifier(header.name) !== true);
            if (invalidHeaders.length > 0) {
                setDisable(true);
            } else {
                setDisable(false);
            }
            onInputsValid?.();
        } else if (type === HeaderType.ApiHeader && customNameValidator) {
            const invalidHeaders = list?.filter((header, index) => customNameValidator(header.name, index) !== true);
            if (invalidHeaders.length > 0) {
                setDisable(true);
            } else {
                setDisable(false);
            }
            onInputsValid?.();
        } else {
            setDisable(false);
            onInputsValid?.();
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'flex flex-col items-start gap-y-[6px] w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700',
                className
            )}
        >
            {label && <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">{label}</Label>}
            {fields.map((item: any, index) => (
                <React.Fragment key={item.id}>
                    {isIncludeSecrets && (
                        <Controller
                            name={`${namePrefix}[${index}].isSecret`}
                            control={control}
                            render={({ field }) => (
                                <TooltipProvider>
                                    <Tooltip delayDuration={2000}>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Checkbox
                                                    id={`secret-field-${index}`}
                                                    checked={field.value}
                                                    onCheckedChange={checked => {
                                                        field.onChange(checked === true);
                                                        onTextChange();
                                                    }}
                                                />
                                                <Label
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-100"
                                                    htmlFor={`secret-field-${index}`}
                                                >
                                                    Secret Value
                                                </Label>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center">
                                            Select a secret from the vault instead of entering a plain value
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        />
                    )}
                    <div
                        className={cn('w-full flex flex-col sm:flex-row gap-2 mb-2', {
                            'relative bg-gray-50 border-[1px] border-gray-200 p-2 rounded-md dark:bg-gray-800 dark:border-gray-700':
                                useTextarea,
                        })}
                    >
                        <div
                            className={cn(
                                'flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2',
                                (useTextarea || !hasType) && 'sm:grid-cols-2'
                            )}
                        >
                            {useSelectableParamName && paramNameOptions.length > 0 ? (
                                <Controller
                                    name={`${namePrefix}[${index}].name`}
                                    control={control}
                                    rules={{
                                        required: isRequired,
                                        validate: value =>
                                            type === HeaderType.PromotedVariables
                                                ? validateIdentifier(value, namePlaceholder?.toLocaleLowerCase())
                                                : customNameValidator?.(value, index),
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onChange={e => {
                                                field.onChange(e.target.value);
                                                onTextChange();
                                            }}
                                            options={paramNameOptions}
                                            placeholder={namePlaceholder}
                                            disabled={disabledInputs}
                                            currentValue={field.value}
                                            isDestructive={!!get(errors, `${namePrefix}.${index}.name.message`)}
                                            supportiveText={(() => {
                                                const err = get(errors, `${namePrefix}.${index}.name`);
                                                const msg = err?.message;
                                                if (!msg) return undefined;
                                                return typeof msg === 'string' ? msg : JSON.stringify(msg);
                                            })()}
                                        />
                                    )}
                                />
                            ) : (
                                <Input
                                    {...register(`${namePrefix}[${index}].name`, {
                                        required: isRequired,
                                        validate: value =>
                                            type === HeaderType.PromotedVariables
                                                ? validateIdentifier(value, namePlaceholder?.toLocaleLowerCase())
                                                : customNameValidator?.(value, index),
                                    })}
                                    placeholder={namePlaceholder}
                                    defaultValue={item.name}
                                    disabled={disabledInputs}
                                    isDestructive={!!get(errors, `${namePrefix}.${index}.name.message`)}
                                    supportiveText={(() => {
                                        const err = get(errors, `${namePrefix}.${index}.name`);
                                        const msg = err?.message;
                                        if (!msg) return undefined;
                                        return typeof msg === 'string' ? msg : JSON.stringify(msg);
                                    })()}
                                    onKeyUp={onTextChange}
                                />
                            )}
                            {hasType && (
                                <Select
                                    {...register(`${namePrefix}[${index}].dataType`)}
                                    defaultValue={item.dataType}
                                    options={dataTypeOptions}
                                    disabled={disabledInputs}
                                    placeholder={typePlaceholder}
                                />
                            )}

                            {watch?.(`${namePrefix}[${index}].isSecret`) ? (
                                <Controller
                                    name={`${namePrefix}[${index}].value`}
                                    control={control}
                                    rules={{
                                        required: isRequired ? { value: isRequired, message: 'Required' } : false,
                                        validate: value => customValueValidator?.(value, index),
                                    }}
                                    render={({ field }) => (
                                        <VaultSelector
                                            value={field.value}
                                            disabled={secrets?.length === 0 || disabledInputs}
                                            options={secrets ?? []}
                                            currentValue={secrets?.find(x => x.value === field.value)?.value ?? ''}
                                            placeholder={
                                                secrets && secrets?.length > 0
                                                    ? 'Select vault key'
                                                    : 'No vault key found'
                                            }
                                            disableCreate={disabledInputs}
                                            loadingSecrets={loadingSecrets}
                                            isDestructive={!!get(errors, `${namePrefix}.${index}.value.message`)}
                                            supportiveText={(() => {
                                                const err = get(errors, `${namePrefix}.${index}.value`);
                                                const msg = err?.message;
                                                if (!msg) return undefined;
                                                return typeof msg === 'string' ? msg : JSON.stringify(msg);
                                            })()}
                                            onChange={e => {
                                                field.onChange(e?.target?.value);
                                                onTextChange();
                                            }}
                                            onRefetch={() => onSecretRefetch?.()}
                                        />
                                    )}
                                />
                            ) : (
                                <>
                                    {!useTextarea && (
                                        <Input
                                            {...register(`${namePrefix}[${index}].value`, {
                                                required: isRequired
                                                    ? { value: isRequired, message: 'Required' }
                                                    : false,
                                                validate: value => customValueValidator?.(value, index),
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
                                    )}

                                    {useTextarea && (
                                        <div className="col-span-1 sm:col-span-3 w-full">
                                            <Textarea
                                                {...register(`${namePrefix}[${index}].value`, {
                                                    required: isRequired,
                                                    validate: value => customValueValidator?.(value, index),
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
                                    )}
                                </>
                            )}
                        </div>
                        <div className="mt-1.5">
                            <Button
                                className={cn(
                                    'w-full sm:w-max',
                                    useTextarea &&
                                        'absolute -right-[10px] -top-[10px] p-1 rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 border-[1px] border-gray-500'
                                )}
                                disabled={disabledInputs}
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index, type)}
                            >
                                <X className={cn(useTextarea && 'size-[14px]')} />
                            </Button>
                        </div>
                    </div>
                </React.Fragment>
            ))}
            <div className="mb-2">
                <Button size="sm" disabled={disabledInputs || isDisable} onClick={() => append(type)}>
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

HeaderInput.displayName = 'HeaderInput';

export { HeaderInput };
