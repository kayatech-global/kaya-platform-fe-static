import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { IntellisenseTools } from '@/components/molecules/platform-monaco-editor/types';
import {
    DataType,
    ScheduleTriggerDataModeType,
    ScheduleTriggerDataSourceType,
    ScheduleTriggerFileSourceType,
    ScheduleTriggerStepType,
    ScheduleTriggerTimezoneType,
    ScheduleTriggerType,
    TimeUnitType,
} from '@/enums';
import { formatUtcToLocalDate, validateUrl, isNullOrEmpty } from '@/lib/utils';
import { IScheduleTrigger, IScheduleTriggerData, IScheduleTriggerStructure, ISharedItem } from '@/models';
import { FetchError, logger } from '@/utils';
import { toast } from 'sonner';
import { scheduleTriggerService } from '@/services';

interface ScheduleTriggerHookProps {
    sharedVariables: ISharedItem[];
    scheduleTriggers: IScheduleTrigger[];
    onModalClose: (open: boolean, cancel?: boolean | undefined) => void;
    onRefetch?: () => Promise<void>;
    onManage?: () => void;
}

const defaultForm = {
    name: '',
    description: '',
    configurations: {
        scheduler: {
            scheduleType: ScheduleTriggerType.DAILY,
            timeOfDay: '',
            daysOfWeek: [],
            dayOfMonth: undefined,
            interval: 1,
            unit: TimeUnitType.HOURS,
            cronExpression: '',
            time: '',
            timezone: ScheduleTriggerTimezoneType.EMPTY,
            startDate: undefined,
            endDate: undefined,
        },
        data: {
            message: '',
            dataMode: ScheduleTriggerDataModeType.STATIC_VARIABLES,
            workflowVariables: [],
            externalDataSource: {
                externalDataSourceType: ScheduleTriggerDataSourceType.API,
                toolId: '',
                connector: {
                    id: '',
                    variables: [],
                },
                file: {
                    source: ScheduleTriggerFileSourceType.UPLOAD,
                    schema: null,
                    reference: undefined,
                    fileUrl: '',
                    sheetName: '',
                    hasHeaderRow: false,
                    startFromRow: 1,
                },
                responseStructure: '',
            },
        },
    },
};

const isOneDriveDomain = (url: string) => {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('onedrive.live.com') || host === '1drv.ms';
};

export const useScheduleTrigger = ({
    sharedVariables,
    scheduleTriggers,
    onModalClose,
    onRefetch,
    onManage,
}: ScheduleTriggerHookProps) => {
    const params = useParams();
    const windowRef = useRef<Window | null>(null);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [dummyFile, setDummyFile] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [openScheduleTrigger, setOpenScheduleTrigger] = useState<boolean>(false);
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>([]);
    const [activeStep, setActiveStep] = useState<ScheduleTriggerStepType>(ScheduleTriggerStepType.BASIC);
    const [scheduler, setScheduler] = useState<string>();
    const [editorContent, setEditorContent] = useState<string>('');
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        reset,
        getValues,
        formState: { errors, isValid },
        control,
    } = useForm<IScheduleTrigger>({
        mode: 'all',
        defaultValues: defaultForm,
    });

    useEffect(() => {
        if (!openScheduleTrigger) {
            setDummyFile(false);
            setEdit(false);
            reset(defaultForm);
        }
    }, [openScheduleTrigger, reset, setDummyFile]);

    useEffect(() => {
        (async () => {
            await handleEditorContentChange(editorContent);
        })();
    }, [editorContent, allIntellisenseValues]);

    useEffect(() => {
        const initialContent = watch('configurations.data.externalDataSource.responseStructure') || '';
        const formattedInitialContent = initialContent.replace(/{{|}}/g, '');
        setEditorContent(formattedInitialContent);

        setValue('configurations.data.externalDataSource.responseStructure', initialContent);
    }, [watch('configurations.data.externalDataSource.responseStructure')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const allIntellisense = useMemo(() => {
        return {
            variables: sharedVariables
                ?.filter((variable: ISharedItem) => variable?.name)
                ?.map((variable: ISharedItem) => ({
                    label: variable.name,
                    value: `${IntellisenseTools.Variable}:${variable.name}`,
                })),
        };
    }, [sharedVariables]);

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense?.variables) return [];

        const allValues = Object.values(allIntellisense)
            .flat()
            .map(item => item.value);

        setAllIntellisenseValues(allValues);

        return [
            {
                name: 'Variables',
                options: allIntellisense?.variables,
            },
        ];
    }, [allIntellisense]);

    const {
        fields: workflowVariableFields,
        append: addWorkflowVariable,
        remove: removeWorkflowVariable,
    } = useFieldArray({
        name: 'configurations.data.workflowVariables',
        control,
    });

    const { fields: queryVariableFields } = useFieldArray({
        name: 'configurations.data.externalDataSource.connector.variables',
        control,
    });

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        (data: FormData) => scheduleTriggerService.create(data, params.wid as string, params.workflow_id as string),
        {
            onSuccess: () => {
                if (onRefetch) {
                    onRefetch();
                }
                onModalClose(false, true);
                toast.success('Schedule trigger saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating schedule trigger:', error?.message);
            },
        }
    );

    const { isLoading: updating, mutate: mutateUpdate } = useMutation(
        ({ data, id }: { data: FormData; id: string }) =>
            scheduleTriggerService.update(data, params.wid as string, params.workflow_id as string, id),
        {
            onSuccess: () => {
                if (onRefetch) {
                    onRefetch();
                }
                onManage?.();
                onModalClose(false, true);
                setEdit(false);
                toast.success('Schedule trigger updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating schedule trigger:', error?.message);
            },
        }
    );

    const { mutateAsync: mutateDelete } = useMutation(
        async ({ id }: { id: string }) =>
            await scheduleTriggerService.delete(params.wid as string, params.workflow_id as string, id),
        {
            onSuccess: () => {
                toast.success('Schedule trigger deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting schedule trigger:', error?.message);
            },
        }
    );

    const appendWorkflowVariable = useCallback(() => {
        addWorkflowVariable({ key: '', value: '' });
    }, [addWorkflowVariable]);

    const validateFile = useCallback(() => {
        if (isEdit && !dummyFile) setDummyFile(true);
    }, [isEdit, dummyFile]);

    const validateFileUrl = useCallback((url: string) => {
        const result = validateUrl(url, 'file URL');
        if (!isOneDriveDomain(url)) return 'Please provide a valid OneDrive file URL';
        return result;
    }, []);

    const wrapMatchingWords = useCallback(
        (value: string): string => {
            if (!value) return value;

            const sortedWords = [...allIntellisenseValues].sort((a, b) => b.length - a.length);

            for (const word of sortedWords) {
                const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(?<!{{)\\b${escapedWord}\\b(?!}})`, 'g');
                value = value.replace(regex, `{{${word}}}`);
            }

            return value;
        },
        [allIntellisenseValues]
    );

    const handleEditorContentChange = useCallback(
        async (value: string) => {
            const updatedValue = wrapMatchingWords(value);
            setValue('configurations.data.externalDataSource.responseStructure', updatedValue);
        },
        [wrapMatchingWords, setValue]
    );

    const handleEditorChange = useCallback(
        async (value: string) => {
            setEditorContent(value);
            await trigger('configurations.data.externalDataSource.responseStructure');
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(async () => {
                await trigger('configurations.data.externalDataSource.responseStructure');
            }, 1000);
            setDebounceTimer(timer);
        },
        [debounceTimer, trigger]
    );

    const mapSchedularTrigger = (result: IScheduleTrigger) => {
        const generateByScheduleType = () => {
            if (result.configurations.scheduler.scheduleType === ScheduleTriggerType.DAILY) {
                return {
                    timeOfDay: result.configurations.scheduler.timeOfDay ?? undefined,
                    daysOfWeek: undefined,
                    dayOfMonth: undefined,
                    interval: undefined,
                    unit: undefined,
                    cronExpression: undefined,
                    time: undefined,
                } as IScheduleTriggerStructure;
            } else if (result.configurations.scheduler.scheduleType === ScheduleTriggerType.WEEKLY) {
                return {
                    daysOfWeek: result.configurations.scheduler.daysOfWeek,
                    time: result.configurations.scheduler.time ?? undefined,
                    timeOfDay: undefined,
                    dayOfMonth: undefined,
                    interval: undefined,
                    unit: undefined,
                    cronExpression: undefined,
                } as IScheduleTriggerStructure;
            } else if (result.configurations.scheduler.scheduleType === ScheduleTriggerType.MONTHLY) {
                return {
                    dayOfMonth: result.configurations.scheduler.dayOfMonth,
                    time: result.configurations.scheduler.time ?? undefined,
                    timeOfDay: undefined,
                    daysOfWeek: undefined,
                    interval: undefined,
                    unit: undefined,
                    cronExpression: undefined,
                } as IScheduleTriggerStructure;
            } else if (result.configurations.scheduler.scheduleType === ScheduleTriggerType.INTERVAL) {
                return {
                    interval: result.configurations.scheduler.interval,
                    unit: result.configurations.scheduler.unit,
                    timeOfDay: undefined,
                    daysOfWeek: undefined,
                    dayOfMonth: undefined,
                    cronExpression: undefined,
                    time: undefined,
                } as IScheduleTriggerStructure;
            } else {
                return {
                    cronExpression: result.configurations.scheduler.cronExpression,
                    timeOfDay: undefined,
                    daysOfWeek: undefined,
                    dayOfMonth: undefined,
                    interval: undefined,
                    unit: undefined,
                    time: undefined,
                } as IScheduleTriggerStructure;
            }
        };

        const generateByDataMode = () => {
            if (result.configurations.data.dataMode === ScheduleTriggerDataModeType.STATIC_VARIABLES) {
                return {
                    workflowVariables: result.configurations.data.workflowVariables?.map(x => ({
                        ...x,
                        value: x.type === DataType.bool ? x.value === 'true' : x.value,
                    })),
                    externalDataSource: undefined,
                } as IScheduleTriggerData;
            } else {
                const type = result.configurations.data.externalDataSource?.externalDataSourceType;
                if (type === ScheduleTriggerDataSourceType.API) {
                    return {
                        externalDataSource: {
                            ...result.configurations.data.externalDataSource,
                            connector: undefined,
                            file: undefined,
                        },
                        workflowVariables: undefined,
                    } as IScheduleTriggerData;
                } else if (type === ScheduleTriggerDataSourceType.CONNECTOR) {
                    return {
                        externalDataSource: {
                            ...result.configurations.data.externalDataSource,
                            connector: {
                                ...result.configurations.data.externalDataSource?.connector,
                                variables:
                                    result.configurations.data.externalDataSource?.connector?.variables &&
                                    result.configurations.data.externalDataSource?.connector?.variables?.length > 0
                                        ? result.configurations.data.externalDataSource?.connector?.variables?.map(
                                              x => ({
                                                  ...x,
                                                  value: x.type === DataType.bool ? x.value === 'true' : x.value,
                                              })
                                          )
                                        : undefined,
                            },
                            toolId: undefined,
                            file: undefined,
                        },
                        workflowVariables: undefined,
                    } as IScheduleTriggerData;
                } else {
                    const type = result.configurations.data.externalDataSource?.file?.source;
                    return {
                        externalDataSource: {
                            ...result.configurations.data.externalDataSource,
                            file: {
                                ...result.configurations.data.externalDataSource?.file,
                                fileUrl:
                                    type === ScheduleTriggerFileSourceType.FILE_URL
                                        ? result.configurations.data.externalDataSource?.file?.fileUrl
                                        : undefined,
                                reference:
                                    type === ScheduleTriggerFileSourceType.FILE_URL
                                        ? undefined
                                        : result.configurations.data.externalDataSource?.file?.reference,
                                sheetName: isNullOrEmpty(result.configurations.data.externalDataSource?.file?.sheetName)
                                    ? undefined
                                    : result.configurations.data.externalDataSource?.file?.sheetName,
                                startFromRow:
                                    result.configurations.data.externalDataSource?.file?.startFromRow ?? undefined,
                                schema: undefined,
                            },
                            toolId: undefined,
                            connector: undefined,
                        },
                        workflowVariables: undefined,
                    } as IScheduleTriggerData;
                }
            }
        };

        const scheduler = {
            ...result.configurations.scheduler,
            endDate: result.configurations.scheduler?.endDate ?? undefined,
            ...generateByScheduleType(),
        } as IScheduleTriggerStructure;

        const data = {
            ...result.configurations.data,
            ...generateByDataMode(),
        } as IScheduleTriggerData;

        return {
            ...result,
            configurations: {
                scheduler,
                data,
            },
        } as IScheduleTrigger;
    };

    const onEdit = useCallback(
        (id: string) => {
            if (id) {
                const obj = scheduleTriggers?.find(x => x.id === id);
                if (obj) {
                    setValue('id', obj?.id);
                    setValue('name', obj?.name);
                    setValue('description', obj?.description);
                    setValue('configurations', obj?.configurations);
                    setValue('isReadOnly', obj?.isReadOnly);
                    setValue(
                        'configurations.data.workflowVariables',
                        obj?.configurations?.data?.workflowVariables?.map(x => {
                            let value: string | null = x.value;
                            if (x.type === DataType.bool) {
                                value = (() => {
                                    if (x.value) return 'true';
                                    return 'false';
                                })();
                            }
                            return { ...x, value };
                        })
                    );
                    setValue(
                        'configurations.data.externalDataSource.connector.variables',
                        obj?.configurations?.data?.externalDataSource?.connector?.variables?.map(x => {
                            let value: string | null = x.value;
                            if (x.type === DataType.bool) {
                                value = (() => {
                                    if (x.value) return 'true';
                                    return 'false';
                                })();
                            }
                            return { ...x, value };
                        })
                    );
                    if (
                        obj?.configurations?.data?.externalDataSource?.file?.source ===
                        ScheduleTriggerFileSourceType.FILE_URL
                    ) {
                        setValue(
                            'configurations.data.externalDataSource.file.startFromRow',
                            obj?.configurations?.data?.externalDataSource?.file?.startFromRow ?? null
                        );
                    }

                    if (obj?.configurations?.scheduler?.startDate) {
                        const startDate = formatUtcToLocalDate(obj?.configurations?.scheduler?.startDate?.toString());
                        if (startDate) {
                            setValue('configurations.scheduler.startDate', new Date(startDate));
                        }
                    }
                    if (obj?.configurations?.scheduler?.endDate) {
                        const endDate = formatUtcToLocalDate(obj?.configurations?.scheduler?.endDate?.toString());
                        if (endDate) {
                            setValue('configurations.scheduler.endDate', new Date(endDate));
                        }
                    }
                    if (obj?.configurations?.data?.externalDataSource?.file?.reference) {
                        const content = new Uint8Array(
                            obj?.configurations?.data?.externalDataSource?.file?.reference?.size ?? 20
                        );
                        const fileName =
                            obj?.configurations?.data?.externalDataSource?.file?.reference?.originalName ??
                            'sample.xlsx';
                        const mimeType = obj?.configurations?.data?.externalDataSource?.file?.reference?.mimeType;
                        const file = new File([content], fileName, {
                            type: mimeType,
                            lastModified: Date.now(),
                        });
                        setValue('configurations.data.externalDataSource.file.schema', file);
                    }

                    setEdit(true);
                    setOpenScheduleTrigger(true);
                }
            }
        },
        [scheduleTriggers, setValue, setEdit, setOpenScheduleTrigger]
    );

    const onHandleSubmit = useCallback(
        (data: IScheduleTrigger) => {
            const body = mapSchedularTrigger(data);
            let schema: string | File | undefined;
            if (!isEdit) {
                schema = data.configurations.data.externalDataSource?.file?.schema ?? undefined;
            } else if (dummyFile) {
                schema = data.configurations.data.externalDataSource?.file?.schema ?? undefined;
            } else {
                schema = undefined;
            }
            const formData = new FormData();
            formData.append('name', body.name);
            formData.append('description', body.description);
            formData.append('configurations', JSON.stringify(body.configurations));

            if (schema) formData.append('schema', schema);

            if (data.id) mutateUpdate({ data: formData, id: data.id });
            else mutateCreate(formData);
        },
        [isEdit, dummyFile, mutateCreate, mutateUpdate]
    );

    const onDelete = useCallback(
        async (id: string) => {
            if (id) await mutateDelete({ id });
        },
        [mutateDelete]
    );

    const onPreview = (url: string) => {
        const width = 500;
        const height = 350;

        const left = window.screenX + Math.floor((window.outerWidth - width) / 2);
        const top = window.screenY + Math.floor((window.outerHeight - height) / 2);

        windowRef.current = window.open(
            url,
            'OneDriveWindow',
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
        );

        const closePopup = () => {
            if (windowRef.current && !windowRef.current.closed) {
                windowRef.current.close();
            }
            windowRef.current = null;
            window.removeEventListener('focus', handleFocus);
        };

        const handleFocus = () => {
            if (windowRef.current && !windowRef.current.closed) {
                closePopup();
            }
        };

        window.addEventListener('focus', handleFocus);

        const popupInterval = setInterval(() => {
            if (!windowRef.current || windowRef.current.closed) {
                clearInterval(popupInterval);
                window.removeEventListener('focus', handleFocus);
                windowRef.current = null;
            }
        }, 500);
    };

    return {
        isValid,
        errors,
        control,
        workflowVariableFields,
        queryVariableFields,
        allIntellisenseValues,
        intellisenseOptions,
        openScheduleTrigger,
        activeStep,
        isEdit,
        isSaving: creating || updating,
        scheduler,
        isReadOnly,
        editorContent,
        loading,
        setLoading,
        setScheduler,
        setEdit,
        setActiveStep,
        setOpenScheduleTrigger,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        appendWorkflowVariable,
        removeWorkflowVariable,
        validateFile,
        validateFileUrl,
        handleEditorChange,
        handleSubmit,
        onPreview,
        onEdit,
        onDelete,
        onHandleSubmit,
    };
};
