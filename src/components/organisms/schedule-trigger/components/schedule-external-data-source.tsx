import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/atoms';
import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_TOOLTIP, SCHEDULE_DATA_SOURCE_TYPES } from '@/constants';
import { Info, ScanEye } from 'lucide-react';
import { ScheduleTriggerDataSourceType, ScheduleTriggerFileSourceType } from '@/enums';
import {
    Button,
    Checkbox,
    ConnectorQueryVariableRef,
    ConnectorQueryVariables,
    Input,
    RadioChips,
    Spinner,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components';
import { API } from '../../workflow-editor-form/agent-form';
import { IConnectorForm } from '@/models';
import { APISelector } from '@/app/editor/[wid]/[workflow_id]/components/api-selector';
import FileUploader from '@/components/atoms/file-uploader';
import { cn, isNullOrEmpty, sanitizeNumericInput } from '@/lib/utils';
import { ScheduleTriggerResponseStructure } from './schedule-trigger-response-structure';
import { ConnectorSelector } from '@/app/editor/[wid]/[workflow_id]/components/connector-selector';

export const ScheduleExternalDataSource = (props: ScheduleTriggerFormProps) => {
    const {
        control,
        errors,
        queryVariableFields,
        sharedVariables,
        allApiTools,
        apiLoading,
        loadingConnectors,
        connectors,
        loadingIntellisense,
        isEdit,
        isReadOnly,
        register,
        watch,
        getValues,
        setValue,
        trigger,
        validateFile,
        validateFileUrl,
        onPreview,
        refetchApiTools,
        refetchConnector,
    } = props;
    const connectorQueryVariableRef = useRef<ConnectorQueryVariableRef>(null);
    const [tools, setTools] = useState<API[]>();
    const [connector, setConnector] = useState<IConnectorForm[]>();

    useEffect(() => {
        if (connectors && connectors?.length > 0 && connector && connector?.length > 0) {
            const result = connectors?.find(x => x.id === connector[0].id);
            if (result) {
                setConnector([result]);
            }
        }
    }, [connectors]);

    useEffect(() => {
        const _variables = getValues('configurations.data.externalDataSource.connector.variables');
        if (isEdit && getValues('configurations.data.externalDataSource.connector.id')) {
            const result = connectors?.find(
                x => x.id === getValues('configurations.data.externalDataSource.connector.id')
            );
            if (result) {
                setConnector([result]);
            } else {
                setConnector(undefined);
            }
            connectorQueryVariableRef?.current?.onRegenerateVariable(result?.configurations?.query, _variables ?? []);
        }
        if (isEdit && getValues('configurations.data.externalDataSource.toolId')) {
            const result = allApiTools?.find(x => x.id === getValues('configurations.data.externalDataSource.toolId'));
            if (result) {
                setTools([result]);
            } else {
                setTools(undefined);
            }
        }
    }, [isEdit, connectors, allApiTools, getValues]);

    const onApiChange = async (items: API[] | undefined) => {
        if (items && items?.length <= 0) return null;

        if (items && items.length > 0) {
            const value = items?.find(x => x.id);
            setValue('configurations.data.externalDataSource.toolId', value?.id as string, { shouldDirty: true });
        } else {
            setValue('configurations.data.externalDataSource.toolId', '');
        }
        await trigger('configurations.data.externalDataSource.toolId');
    };

    const onConnectorChange = async (data: IConnectorForm[] | undefined) => {
        if (data && data?.length > 0) {
            setValue('configurations.data.externalDataSource.connector.id', data[0]?.id as string);
        } else {
            setValue('configurations.data.externalDataSource.connector.id', '');
        }
        await trigger('configurations.data.externalDataSource.connector.id');
        connectorQueryVariableRef?.current?.onGenerateVariable(data?.[0]?.configurations?.query);
    };

    return (
        <>
            <div className="col-span-1 sm:col-span-2">
                <div className="w-full p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                    <div className="flex gap-2">
                        <Info size={14} className="min-w-[14px] mt-[2px]" />
                        <p className="font-medium">Data Source Iteration Rules:</p>
                    </div>
                    <div className="ml-[23px]">
                        <ul className="list-disc ml-5 space-y-1">
                            <li>
                                <span className="font-semibold">Array at top level: </span>
                                <span>Each object in the array creates one workflow execution</span>
                            </li>
                            <li>
                                <span className="font-semibold">Object at top level: </span>
                                <span>Single workflow execution with that object&apos;s data</span>
                            </li>
                            <li>
                                <span className="font-semibold">Multiple top-level objects: </span>
                                <span>Invalid structure - please wrap in an array</span>
                            </li>
                        </ul>
                        <p className="mt-2">{`Example: {"data": [...]} - The array in "data" will be iterated`}</p>
                    </div>
                </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name="configurations.data.externalDataSource.externalDataSourceType"
                    control={control}
                    rules={{ required: { value: true, message: 'Please select a feedback type' } }}
                    render={({ field, fieldState }) => (
                        <>
                            <RadioChips
                                value={field.value}
                                onValueChange={field.onChange}
                                options={SCHEDULE_DATA_SOURCE_TYPES}
                                disabled={isEdit && isReadOnly}
                            />
                            {!!fieldState?.error?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {fieldState?.error?.message}
                                </p>
                            )}
                        </>
                    )}
                />
            </div>

            {watch('configurations.data.externalDataSource.externalDataSourceType') ===
                ScheduleTriggerDataSourceType.API && (
                <div className="col-span-1 sm:col-span-2">
                    <Controller
                        name="configurations.data.externalDataSource.toolId"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: 'Please select an API',
                            },
                        }}
                        render={() => (
                            <div
                                className={`mt-2 p-2 border-2 border-solid rounded-lg ${
                                    errors?.configurations?.data?.externalDataSource?.toolId?.message
                                        ? 'border-red-300'
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <APISelector
                                    agent={undefined}
                                    apis={tools}
                                    isMultiple={false}
                                    apiLoading={apiLoading}
                                    setApis={setTools}
                                    allApiTools={allApiTools as never}
                                    isSelfLearning={true}
                                    label="API"
                                    description="Choose the API that automatically initiates actions based on scheduled times or recurring intervals, ensuring timely execution and consistent workflow automation."
                                    labelClassName="text-xs font-medium font-normal"
                                    isReadonly={isEdit && isReadOnly}
                                    onModalChange={open => {
                                        setTimeout(() => {
                                            if (!open) {
                                                trigger('configurations.data.externalDataSource.toolId');
                                            }
                                        }, 0);
                                    }}
                                    onRefetch={() => refetchApiTools?.()}
                                    onApiChange={onApiChange}
                                />
                            </div>
                        )}
                    />
                    {errors?.configurations?.data?.externalDataSource?.toolId?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.configurations?.data?.externalDataSource?.toolId?.message}
                        </p>
                    )}
                </div>
            )}

            {watch('configurations.data.externalDataSource.externalDataSourceType') ===
                ScheduleTriggerDataSourceType.CONNECTOR && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Controller
                            name="configurations.data.externalDataSource.connector.id"
                            control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: 'Please select a connector',
                                },
                            }}
                            render={() => (
                                <div
                                    className={`mt-2 p-2 border-2 border-solid rounded-lg ${
                                        errors?.configurations?.data?.externalDataSource?.connector?.id?.message
                                            ? 'border-red-300'
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    <ConnectorSelector
                                        agent={undefined}
                                        connectors={connector || []}
                                        isMultiple={false}
                                        setConnectors={setConnector}
                                        allConnectors={connectors ?? []}
                                        connectorLoading={loadingConnectors}
                                        label="Connector"
                                        description="Creates a new scheduled trigger that executes predefined database connector actions at specified times or intervals, enabling automated maintenance, data updates, or reporting tasks."
                                        labelClassName="text-xs font-medium font-normal"
                                        isReadonly={isEdit && isReadOnly}
                                        onModalChange={open => {
                                            setTimeout(() => {
                                                if (!open) {
                                                    trigger('configurations.data.externalDataSource.connector.id');
                                                }
                                            }, 0);
                                        }}
                                        onRefetch={() => refetchConnector?.()}
                                        onConnectorsChange={onConnectorChange}
                                    />
                                </div>
                            )}
                        />
                        {errors?.configurations?.data?.externalDataSource?.connector?.id?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.configurations?.data?.externalDataSource?.connector?.id?.message}
                            </p>
                        )}
                    </div>
                    <ConnectorQueryVariables
                        ref={connectorQueryVariableRef}
                        namePrefix="configurations.data.externalDataSource.connector.variables"
                        control={control}
                        fields={queryVariableFields}
                        variables={sharedVariables}
                        errors={errors}
                        disabled={isEdit && isReadOnly}
                        register={register}
                        setValue={setValue}
                        watch={watch}
                        trigger={trigger}
                    />
                </>
            )}

            {watch('configurations.data.externalDataSource.externalDataSourceType') ===
                ScheduleTriggerDataSourceType.FILE && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Controller
                            name="configurations.data.externalDataSource.file.source"
                            control={control}
                            rules={{ required: { value: true, message: 'Please select a file source' } }}
                            render={({ field }) => (
                                <>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="flex items-center gap-x-4"
                                        disabled={isEdit && isReadOnly}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={ScheduleTriggerFileSourceType.UPLOAD}
                                                id="file-source-upload"
                                            />
                                            <Label
                                                className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                                htmlFor="file-source-upload"
                                            >
                                                Upload File
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={ScheduleTriggerFileSourceType.FILE_URL}
                                                id="file-source-url"
                                            />
                                            <Label
                                                className="text-gray-700 dark:text-gray-300 cursor-pointer flex items-baseline gap-x-1"
                                                htmlFor="file-source-url"
                                            >
                                                File URL
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info size={13} />
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="right"
                                                        align="center"
                                                        className="max-w-[250px]"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400">
                                                                Only an OneDrive file in Excel or CSV format is
                                                                supported
                                                            </p>
                                                            <p className="text-xs font-normal text-gray-400">
                                                                Examples:
                                                            </p>
                                                            <ul className="list-disc pl-4 space-y-1 pt-2 pb-2">
                                                                <li>https://1drv.ms/...</li>
                                                                <li>https://onedrive.live.com/...</li>
                                                            </ul>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    {!!errors?.configurations?.data?.externalDataSource?.file?.source?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {errors?.configurations?.data?.externalDataSource?.file?.source?.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        {watch('configurations.data.externalDataSource.file.source') ===
                        ScheduleTriggerFileSourceType.UPLOAD ? (
                            <div>
                                <Controller
                                    name="configurations.data.externalDataSource.file.schema"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: 'Please upload a file' },
                                        validate: (file: File | null | undefined) =>
                                            !file ||
                                            file.size <= 25 * 1024 * 1024 ||
                                            'File size must be 25 MB or smaller',
                                    }}
                                    render={({ field }) => (
                                        <FileUploader
                                            placeholder="Excel or CSV file"
                                            hideInbuiltUploadHandler
                                            supportMultiUpload={false}
                                            accept={[
                                                'text/csv',
                                                'application/vnd.ms-excel',
                                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                '.csv',
                                                '.xls',
                                                '.xlsx',
                                            ]}
                                            value={field.value ? [field.value] : undefined}
                                            disabled={isEdit && isReadOnly}
                                            onChange={async value => {
                                                const file = value?.length > 0 ? value[0] : undefined;
                                                field.onChange(file);
                                                validateFile();
                                                await trigger('configurations.data.externalDataSource.file.schema');
                                            }}
                                            onFileClick={async () =>
                                                await trigger('configurations.data.externalDataSource.file.schema')
                                            }
                                            onClear={() => {
                                                validateFile();
                                                setValue('configurations.data.externalDataSource.file.schema', null);
                                            }}
                                            hasError={
                                                !!errors?.configurations?.data?.externalDataSource?.file?.schema
                                                    ?.message
                                            }
                                        />
                                    )}
                                />
                                {!!errors?.configurations?.data?.externalDataSource?.file?.schema?.message && (
                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                        {errors?.configurations?.data?.externalDataSource?.file?.schema?.message}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2 items-start">
                                <Input
                                    {...register('configurations.data.externalDataSource.file.fileUrl', {
                                        required: { value: true, message: 'Please enter a file URL' },
                                        validate: value => validateFileUrl(value as string),
                                    })}
                                    placeholder="Enter a File URL"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={
                                        !!errors?.configurations?.data?.externalDataSource?.file?.fileUrl?.message
                                    }
                                    supportiveText={
                                        errors?.configurations?.data?.externalDataSource?.file?.fileUrl?.message
                                    }
                                />
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="mt-[1.5px] p-1"
                                    disabled={
                                        isNullOrEmpty(watch('configurations.data.externalDataSource.file.fileUrl')) ||
                                        !!errors?.configurations?.data?.externalDataSource?.file?.fileUrl?.message
                                    }
                                    onClick={() =>
                                        onPreview(
                                            watch('configurations.data.externalDataSource.file.fileUrl') as string
                                        )
                                    }
                                >
                                    <ScanEye />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                {...register('configurations.data.externalDataSource.file.sheetName')}
                                placeholder="Enter a Sheet Name"
                                label="Sheet Name (Optional)"
                                readOnly={isEdit && isReadOnly}
                                isDestructive={
                                    !!errors?.configurations?.data?.externalDataSource?.file?.sheetName?.message
                                }
                                supportiveText={
                                    errors?.configurations?.data?.externalDataSource?.file?.sheetName?.message
                                }
                            />
                            <div
                                className={cn('flex items-center gap-2 flex-shrink-0', {
                                    'mt-1': errors?.configurations?.data?.externalDataSource?.file?.hasHeaderRow
                                        ?.message,
                                    'mt-6': !errors?.configurations?.data?.externalDataSource?.file?.hasHeaderRow
                                        ?.message,
                                })}
                            >
                                <Checkbox
                                    id="header-row"
                                    checked={watch('configurations.data.externalDataSource.file.hasHeaderRow')}
                                    onCheckedChange={checked => {
                                        setValue(
                                            'configurations.data.externalDataSource.file.hasHeaderRow',
                                            checked === true
                                        );
                                    }}
                                    disabled={isEdit && isReadOnly}
                                />
                                <Label
                                    className="text-sm font-medium text-gray-700 dark:text-gray-100"
                                    htmlFor="header-row"
                                >
                                    First row contains headers
                                </Label>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register('configurations.data.externalDataSource.file.startFromRow', {
                                min: {
                                    value: 1,
                                    message: 'Start from row must be at least 1',
                                },
                                valueAsNumber: true,
                            })}
                            placeholder="Enter a Start from Row"
                            label="Start from Row (Optional)"
                            type="number"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={
                                !!errors?.configurations?.data?.externalDataSource?.file?.startFromRow?.message
                            }
                            supportiveText={
                                errors?.configurations?.data?.externalDataSource?.file?.startFromRow?.message
                            }
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                </>
            )}

            <div className="col-span-1 sm:col-span-2 relative">
                <div className="col-span-1 sm:col-span-2 max-h-[50vh]">
                    <div className="mb-2 text-xs flex items-center gap-x-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                            Response Structure & Variable Mapping
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={13} />
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center" className="max-w-[460px]">
                                    {SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_TOOLTIP}
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                    {loadingIntellisense ? (
                        <div className="w-full h-full flex items-center justify-center min-h-[480px]">
                            <div className="flex flex-col items-center gap-y-2">
                                <Spinner />
                                <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                    {'Hold on, Response structure & Variable mapping editor is getting ready...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ScheduleTriggerResponseStructure {...props} />
                    )}
                </div>
            </div>
        </>
    );
};
