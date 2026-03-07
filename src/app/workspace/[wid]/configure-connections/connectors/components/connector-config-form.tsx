import {
    Button,
    DatabaseConnectionSelector,
    Input,
    OptionModel,
    Select,
    Spinner,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VaultSelector,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { IConnectorAuthorizationType } from '@/enums';
import {
    cn,
    formatIntellisenseTokens,
    getSubmitButtonLabel,
    isNullOrEmpty,
    validateSpaces,
    validateSql,
    validateUrl,
} from '@/lib/utils';
import { ConnectorType, IConnectorForm, IDatabase, IPlatformSettingData } from '@/models';
import { DatabaseItemType } from '@/enums/database-type';
import { validateField } from '@/utils/validation';
import { Link2, PlayCircle, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { RunQueryModalContainer } from './run-query-modal-container';
import PlatformMonacoEditor from '@/components/molecules/platform-monaco-editor/platform-monaco-editor';
import GenerateQueryModal from '@/components/molecules/generate-query-modal/generate-query-modal';

type ConnectorConfigFormProps = {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IConnectorForm>;
    secrets: OptionModel[];
    isSaving: boolean;
    hasTestConnection?: boolean;
    loadingSecrets?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IConnectorForm>;
    watch: UseFormWatch<IConnectorForm>;
    trigger: UseFormTrigger<IConnectorForm>;
    setValue: UseFormSetValue<IConnectorForm>;
    control: Control<IConnectorForm, unknown>;
    handleSubmit: UseFormHandleSubmit<IConnectorForm>;
    onHandleSubmit: (data: IConnectorForm) => void;
    refetch: () => void;
    allIntellisenseValues: string[];
    loadingIntellisense: boolean;
    onRefetchVariables: () => Promise<void>;
    editorContent: string;
    isEnhance?: boolean;
    intelligentSource: IPlatformSettingData | undefined;
    handleEditorChange: (value: string) => void;
    intellisenseOptions: never[];
    databases?: IDatabase[];
    databaseLoading?: boolean;
    refetchDatabase: () => void;
};

export const FormBody = (props: ConnectorConfigFormProps) => {
    const {
        register,
        watch,
        loadingSecrets,
        errors,
        secrets,
        isEdit,
        refetch,
        loadingIntellisense,
        onRefetchVariables,
        control,
        editorContent,
        intellisenseOptions,
        trigger,
        databases,
        databaseLoading,
        refetchDatabase,
        setValue,
    } = props;

    const [showTestModal, setShowTestModal] = useState(false);
    const dbId = watch('configurations.databaseId');
    const database = useMemo(() => {
        if (dbId && databases && databases.length > 0) {
            return databases.find(db => db.id === dbId);
        }
        return undefined;
    }, [dbId, databases]);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const isReadOnlyValue = watch('isReadOnly');
    const isReadOnly = useMemo(() => {
        return !!isReadOnlyValue;
    }, [isReadOnlyValue]);

    const onDatabaseChange = async (db: IDatabase | undefined) => {
        if (db) {
            setValue(`configurations.databaseId`, db?.id as string);
        } else {
            setValue(`configurations.databaseId`, '');
        }
        await trigger(`configurations.databaseId`);
    };

    // Handle insert generated query to main editor
    const handleInsertGeneratedQuery = (query: string) => {
        setValue('configurations.query', query);
        trigger('configurations.query');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* name */}
            <div className="col-span-1 sm:col-span-12">
                <Input
                    {...register('name', {
                        required: validateField('Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'Name'),
                    })}
                    placeholder="Enter Name"
                    readOnly={isEdit && isReadOnly}
                    label="Name"
                    helperInfo={
                        watch('type') === ConnectorType.DataBase
                            ? "The connector's name must accurately reflect the type of data it returns."
                            : undefined
                    }
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            {/* type */}
            <div className="col-span-1 sm:col-span-12">
                <Select
                    {...register('type', {
                        required: { value: true, message: 'Please select Connector Type' },
                    })}
                    label="Connector Type"
                    placeholder="Select your Connector Type"
                    disabled={isEdit && isReadOnly}
                    options={[
                        { value: ConnectorType.Pega, name: 'Pega' },
                        { value: ConnectorType.DataBase, name: 'Database' },
                    ]}
                    value={watch('type') === undefined ? '' : watch('type')}
                    isDestructive={!!errors?.type?.message}
                    supportiveText={errors?.type?.message}
                />
            </div>
            {/* description */}
            <div className="col-span-1 sm:col-span-12">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                    })}
                    label="Description"
                    placeholder="Enter your description"
                    readOnly={isEdit && isReadOnly}
                    helperInfo={
                        watch('type') === ConnectorType.DataBase
                            ? 'The description should provide clear, actionable guidance to the LLM on how and when the connector should be used.'
                            : undefined
                    }
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                    rows={6}
                />
            </div>

            {/* Data connector specific fields */}
            {watch('type') == ConnectorType.Pega && (
                <>
                    <div className="col-span-1 sm:col-span-12">
                        <Select
                            {...register('configurations.authorization.authType', {
                                required: { value: true, message: 'Please select Authorization Method' },
                            })}
                            label="Authorization Method"
                            placeholder="Select your Authorization Method"
                            disabled={isEdit && isReadOnly}
                            options={[
                                { value: IConnectorAuthorizationType.NoAuthorization, name: 'No Authorization' },
                                { value: IConnectorAuthorizationType.clientCredentials, name: 'Client Credentials' },
                            ]}
                            currentValue={watch('configurations.authorization.authType')}
                            isDestructive={!!errors?.configurations?.authorization?.authType?.message}
                            supportiveText={errors?.configurations?.authorization?.authType?.message}
                        />
                    </div>

                    {watch('configurations.authorization.authType') !== IConnectorAuthorizationType.NoAuthorization && (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 col-span-12 border-[1px] border-gray-200 rounded-md p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                            <div className="col-span1 sm:col-span-12">
                                <Input
                                    {...register('configurations.authorization.meta.tokenEndpointURL', {
                                        required: {
                                            value: true,
                                            message: 'Please enter a Token Endpoint URL',
                                        },
                                        validate: value => validateUrl(value, 'Token Endpoint URL'),
                                    })}
                                    placeholder="Enter Token Endpoint URL"
                                    readOnly={isEdit && isReadOnly}
                                    label="Token Endpoint URL"
                                    isDestructive={
                                        !!errors?.configurations?.authorization?.meta?.tokenEndpointURL?.message
                                    }
                                    supportiveText={
                                        errors?.configurations?.authorization?.meta?.tokenEndpointURL?.message
                                    }
                                />
                            </div>

                            {watch('configurations.authorization.authType') ==
                                IConnectorAuthorizationType.BasicAuth && (
                                <>
                                    {/* username */}
                                    <div className="col-span-1 sm:col-span-6">
                                        <Input
                                            {...register('configurations.authorization.meta.username', {
                                                required: validateField('Username', { required: { value: true } })
                                                    .required,
                                            })}
                                            placeholder="Enter Username"
                                            readOnly={isEdit && isReadOnly}
                                            label="Username"
                                            isDestructive={
                                                !!errors?.configurations?.authorization?.meta?.username?.message
                                            }
                                            supportiveText={
                                                errors?.configurations?.authorization?.meta?.username?.message
                                            }
                                        />
                                    </div>

                                    {/* password */}
                                    <div className="col-span-1 sm:col-span-6">
                                        <VaultSelector
                                            {...register('configurations.authorization.meta.passwordReference', {
                                                required: { value: true, message: 'Please select Password' },
                                            })}
                                            placeholder={secrets.length > 0 ? 'Select Password' : 'No Password found'}
                                            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                            options={secrets}
                                            currentValue={watch('configurations.authorization.meta.passwordReference')}
                                            isDestructive={
                                                !!errors?.configurations?.authorization?.meta?.passwordReference
                                                    ?.message
                                            }
                                            supportiveText={
                                                errors?.configurations?.authorization?.meta?.passwordReference?.message
                                            }
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetch()}
                                            label="Password"
                                        />
                                    </div>
                                </>
                            )}

                            {/* clientID */}
                            <div className="col-span-1 sm:col-span-6">
                                <Input
                                    {...register('configurations.authorization.meta.clientID', {
                                        required: {
                                            value: true,
                                            message: 'Please enter a Client ID',
                                        },
                                    })}
                                    placeholder="Enter Client ID"
                                    readOnly={isEdit && isReadOnly}
                                    label="Client ID"
                                    isDestructive={!!errors?.configurations?.authorization?.meta?.clientID?.message}
                                    supportiveText={errors?.configurations?.authorization?.meta?.clientID?.message}
                                />
                            </div>

                            {/* clientSecret */}
                            <div className="col-span-1 sm:col-span-6">
                                <VaultSelector
                                    {...register('configurations.authorization.meta.clientSecretReference', {
                                        required: { value: true, message: 'Please select Client Secret' },
                                    })}
                                    placeholder={secrets.length > 0 ? 'Select Client Secret' : 'No Client Secret found'}
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    currentValue={watch('configurations.authorization.meta.clientSecretReference')}
                                    isDestructive={
                                        !!errors?.configurations?.authorization?.meta?.clientSecretReference?.message
                                    }
                                    supportiveText={
                                        errors?.configurations?.authorization?.meta?.clientSecretReference?.message
                                    }
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                    label="Client Secret"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
            {watch('type') === ConnectorType.DataBase && (
                <>
                    {/* Database Type Dropdown */}
                    <div className="col-span-1 sm:col-span-12">
                        <div className="col-span-1 sm:col-span-2">
                            <Controller
                                name={`configurations.databaseId`}
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Please select a database' },
                                }}
                                render={() => (
                                    <div
                                        className={`mt-2 border rounded-lg p-2 sm:p-4 ${
                                            errors?.configurations?.databaseId?.message
                                                ? 'border-red-300'
                                                : 'border-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        <DatabaseConnectionSelector
                                            database={database}
                                            allDatabases={databases as IDatabase[]}
                                            databaseType={DatabaseItemType.RELATIONAL}
                                            databaseLoading={databaseLoading}
                                            isReadonly={isEdit && isReadOnly}
                                            setDatabase={() => {}}
                                            onModalChange={async () => await trigger(`configurations.databaseId`)}
                                            onRefetch={() => refetchDatabase()}
                                            onDatabaseChange={onDatabaseChange}
                                            onlyRelationalTypeEnabled={true}
                                        />
                                    </div>
                                )}
                            />
                            {!!errors?.configurations?.databaseId?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {errors?.configurations?.databaseId?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-12 relative">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            leadingIcon={<Sparkles />}
                                            onClick={() => setShowGenerateModal(true)}
                                            className="absolute top-3 right-0 z-10"
                                            disabled={isNullOrEmpty(watch('configurations.databaseId'))}
                                        >
                                            Generate Query
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {isNullOrEmpty(watch('configurations.databaseId')) && (
                                    <TooltipContent className="absolute left-[130px] w-max top-4">
                                        Please select a database to generate query
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <div className="col-span-1 sm:col-span-2 max-h-[60vh] mt-7">
                            {loadingIntellisense ? (
                                <div className="w-full h-full flex items-center justify-center min-h-[500px]">
                                    <div className="flex flex-col items-center gap-y-2">
                                        <Spinner />
                                        <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                            {'Hold on, Prompt editor is getting ready...'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Controller
                                    name="configurations.query"
                                    control={control}
                                    defaultValue={editorContent}
                                    rules={{
                                        required: validateField('query', { required: { value: true } }).required,
                                        validate: value => validateSql(value, ['select']),
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <PlatformMonacoEditor
                                            value={formatIntellisenseTokens(field.value ?? '', 'unwrap')}
                                            onChange={(val: string) => {
                                                const transformed = formatIntellisenseTokens(val, 'wrap');
                                                field.onChange(transformed);
                                            }}
                                            intellisenseData={intellisenseOptions ?? []}
                                            isDestructive={!!error}
                                            supportiveText={errors?.configurations?.query?.message}
                                            onRefetchVariables={onRefetchVariables}
                                            height="h-[375px]"
                                            onBlur={() => trigger('configurations.query')}
                                            language="custom-sql"
                                            label="Query"
                                            helperInfo="Type @ for adding variables for your query. Use Generate Query option for converting natural language to query."
                                        />
                                    )}
                                />
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 flex items-center gap-1 z-10"
                            onClick={() => setShowTestModal(true)}
                            disabled={
                                isNullOrEmpty(watch('configurations.query')) ||
                                isNullOrEmpty(watch('configurations.databaseId')) ||
                                !!errors?.configurations?.query?.message
                            }
                        >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Run query
                        </Button>
                    </div>

                    {/* Test Modal */}
                    <RunQueryModalContainer
                        showTestModal={showTestModal}
                        intellisenseOptions={intellisenseOptions}
                        databaseId={watch('configurations.databaseId')}
                        query={watch('configurations.query')}
                        setShowTestModal={setShowTestModal}
                    />

                    {/* Generate Query Modal */}
                    <GenerateQueryModal
                        open={showGenerateModal}
                        setShowGenerateModal={setShowGenerateModal}
                        onInsert={handleInsertGeneratedQuery}
                        databaseId={watch('configurations.databaseId')}
                    />
                </>
            )}
        </div>
    );
};

export const ConnectorConfigForm = (props: ConnectorConfigFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Link2 />}
            header={isEdit ? 'Edit Connector' : 'New Connector'}
            footer={
                <div className="flex justify-end">
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
export default ConnectorConfigForm;
