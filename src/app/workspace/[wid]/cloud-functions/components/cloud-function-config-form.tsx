import {
    Button,
    Input,
    OptionModel,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VaultSelector,
    HeaderInput,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, validateSpaces } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import { Braces } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { useTheme } from '@/theme';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { autocompletion } from '@codemirror/autocomplete';
import { placeholder } from '@codemirror/view';
import { ICloudFunctionForm } from '@/models/cloud-function.model';

interface CloudFunctionProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<ICloudFunctionForm>;
    isSaving: boolean;
    loadingSecrets?: boolean;
    secrets: OptionModel[];
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<ICloudFunctionForm>;
    watch: UseFormWatch<ICloudFunctionForm>;
    setValue: UseFormSetValue<ICloudFunctionForm>;
    handleSubmit: UseFormHandleSubmit<ICloudFunctionForm>;
    onHandleSubmit: (data: ICloudFunctionForm) => void;
    control: Control<ICloudFunctionForm, unknown>;
    refetch: () => void;
    payload: FieldArrayWithId<ICloudFunctionForm, 'payload', 'id'>[];
    appendPayload: (type: number) => void;
    removePayload: (index: number) => void;
}

const VaultSecretSection = ({ provider, children }: { provider?: string; children: ReactNode }) => {
    const type = provider === 'aws' ? 'aws' : 'azure';
    console.log(type);
    return <>{children}</>;
};

export const FormBody = (props: CloudFunctionProps) => {
    const {
        register,
        watch,
        setValue,
        loadingSecrets,
        secrets,
        errors,
        isEdit,
        refetch,
        control,
        payload,
        appendPayload,
        removePayload,
    } = props;
    const { theme } = useTheme();
    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const getLanguageExtension = (language: string) => {
        switch (language) {
            case 'python':
                return python();
            case 'typescript':
                return javascript({ typescript: true });
            case 'javascript':
            default:
                return javascript();
        }
    };

    const validateName = (value: string) => {
        if (value) {
            const validHeaderRegex = /^\w+$/;
            if (value.startsWith(' ')) {
                return 'No leading spaces in variable name';
            }
            if (value.endsWith(' ')) {
                return 'No trailing spaces in variable name';
            }
            if (!validHeaderRegex.test(value)) {
                return 'Letters, digits and _ only allowed';
            }
        }
        return true;
    };

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: { value: true, message: 'Please enter a function name' },
                        validate: value => validateName(value),
                    })}
                    placeholder="Enter your function name"
                    readOnly={isEdit && isReadOnly}
                    label="Function Name"
                    autoComplete="off"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                    onBlur={e => {
                        const lower = e.target.value.toLowerCase();
                        setValue('name', lower, { shouldValidate: true });
                    }}
                />
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
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('provider', {
                        required: { value: true, message: 'Please select a cloud provider' },
                    })}
                    placeholder="Select your Cloud Provider"
                    disabled={isEdit && isReadOnly}
                    label="Cloud Provider"
                    options={[
                        { value: 'aws', name: 'AWS' },
                        { value: 'azure', name: 'Azure' },
                    ]}
                    currentValue={watch('provider')}
                    isDestructive={!!errors?.provider?.message}
                    supportiveText={errors?.provider?.message}
                />
            </div>

            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        {...register('region', {
                            required: { value: true, message: 'Please enter the region' },
                        })}
                        placeholder="Enter your cloud function region"
                        // readOnly={isEdit && isReadOnly}
                        readOnly={isEdit || isReadOnly}
                        label="Region"
                        autoComplete="off"
                        isDestructive={!!errors?.region?.message}
                        supportiveText={errors?.region?.message}
                        onBlur={e => {
                            const lower = e.target.value.toLowerCase();
                            setValue('region', lower, { shouldValidate: false });
                        }}
                    />
                    <Select
                        {...register('startupOption', {
                            required: { value: true, message: 'Please select a cloud provider' },
                        })}
                        placeholder="Select your Cloud Provider"
                        disabled={isEdit && isReadOnly}
                        label="Startup Options"
                        options={[
                            { value: 'on_demand', name: 'On Demand' },
                            { value: 'always_available', name: 'Always Available' },
                        ]}
                        currentValue={watch('startupOption')}
                        isDestructive={!!errors?.startupOption?.message}
                        supportiveText={errors?.startupOption?.message}
                    />
                </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('credentials.authType', {
                        required: { value: true, message: 'Please select a cloud provider' },
                    })}
                    placeholder="Select your Provider"
                    disabled={isEdit && isReadOnly}
                    label="Credentials"
                    options={[
                        { value: 'key-access', name: 'Key Access' },
                        { value: 'managed-access', name: 'Managed Access' },
                    ]}
                    currentValue={watch('credentials.authType')}
                    isDestructive={!!errors?.credentials?.authType?.message}
                    supportiveText={errors?.credentials?.authType?.message}
                />
            </div>
            {watch('credentials.authType') == 'key-access' && (
                <>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSecretSection provider={watch('credentials.meta.accessKey')}>
                            <VaultSelector
                                {...register('credentials.meta.accessKey', {
                                    required: { value: true, message: 'Please select an API key/vault' },
                                })}
                                label="Access Key"
                                placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('credentials.meta.accessKey')}
                                isDestructive={!!errors?.credentials?.meta?.accessKey?.message}
                                supportiveText={errors?.credentials?.meta?.accessKey?.message}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                        </VaultSecretSection>
                    </div>

                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSecretSection provider={watch('credentials.meta.secretKey')}>
                            <VaultSelector
                                {...register('credentials.meta.secretKey', {
                                    required: { value: true, message: 'Please select an API key/vault' },
                                })}
                                label="Secret Key"
                                placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('credentials.meta.secretKey')}
                                isDestructive={!!errors?.credentials?.meta?.secretKey?.message}
                                supportiveText={errors?.credentials?.meta?.secretKey?.message}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                        </VaultSecretSection>
                    </div>
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                        <VaultSecretSection provider={watch('credentials.meta.lambdaExecutionRoleArn')}>
                            <VaultSelector
                                {...register('credentials.meta.lambdaExecutionRoleArn', {
                                    required: { value: true, message: 'Please select the role' },
                                })}
                                label="Role"
                                placeholder={secrets.length > 0 ? 'Select API Key/Vault' : 'No API Key/Vault found'}
                                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                options={secrets}
                                currentValue={watch('credentials.meta.lambdaExecutionRoleArn')}
                                isDestructive={!!errors?.credentials?.meta?.lambdaExecutionRoleArn?.message}
                                supportiveText={errors?.credentials?.meta?.lambdaExecutionRoleArn?.message}
                                disableCreate={isEdit && isReadOnly}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                        </VaultSecretSection>
                    </div>
                </>
            )}
            <div className="col-span-1 sm:col-span-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Function Code</span>
                        <div className="w-48">
                            <Select
                                {...register('language', {
                                    required: { value: true, message: 'Please select a code language' },
                                })}
                                placeholder="Select Language"
                                disabled={isEdit && isReadOnly}
                                options={[
                                    { value: 'javascript', name: 'Node.js (20.x)' },
                                    { value: 'typescript', name: 'TypeScript (5.3)' },
                                    { value: 'python', name: 'Python (3.12)' },
                                ]}
                                currentValue={watch('language')}
                                isDestructive={!!errors?.language?.message}
                                supportiveText={errors?.language?.message}
                            />
                        </div>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <input
                            type="hidden"
                            {...register('code', {
                                required: { value: true, message: 'Please provide function code' },
                            })}
                        />
                        <CodeMirror
                            height={'300px'}
                            theme={theme === 'light' ? 'light' : 'dark'}
                            value={watch('code')}
                            extensions={[
                                getLanguageExtension(watch('language') || 'javascript'),
                                autocompletion(),
                                EditorView.lineWrapping,
                                placeholder(
                                    "def handler(event, context):\n    return {'statusCode': 200, 'body': 'Hello World'}"
                                ),
                            ]}
                            basicSetup={{
                                lineNumbers: true,
                                foldGutter: true,
                                highlightActiveLine: true,
                                dropCursor: true,
                            }}
                            onChange={value => {
                                setValue('code', value, { shouldValidate: true });
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Write your cloud function code above. Please adhere to the method signature.
                    </p>
                    {errors?.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
                    {errors?.language && <p className="text-xs text-red-500">{errors.language.message}</p>}
                </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <HeaderInput
                    label="Function Parameters"
                    register={register}
                    fields={payload}
                    namePrefix="payload"
                    append={appendPayload}
                    remove={removePayload}
                    control={control}
                    hasType={true}
                    list={watch('payload')}
                    disabledInputs={isEdit && isReadOnly}
                    valuePlaceholder="Description"
                />
            </div>
        </div>
    );
};

export const CloudFunctionForm = (props: CloudFunctionProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;

    const getButtonLabel = () => {
        if (isSaving) return 'Saving';
        if (isEdit) return 'Update';
        return 'Create';
    };

    const buttonLabel = getButtonLabel();

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Braces />}
            header={isEdit ? 'Edit Cloud Function' : 'New Cloud Function'}
            bodyClassName="overflow-y-auto"
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
                                        {buttonLabel}
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
