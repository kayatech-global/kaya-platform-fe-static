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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/atoms/collapsible';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, validateSpaces } from '@/lib/utils';
import { validateField, validateName } from '@/utils/validation';
import { Braces, Info, ChevronDown, X } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
    Control,
    Controller,
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
import { IExecutableFunctionForm } from '@/models/executable-function.model';

interface ExecutableFunctionProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IExecutableFunctionForm>;
    isDeploying: boolean;
    loadingSecrets?: boolean;
    secrets: OptionModel[];
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IExecutableFunctionForm>;
    watch: UseFormWatch<IExecutableFunctionForm>;
    setValue: UseFormSetValue<IExecutableFunctionForm>;
    handleSubmit: UseFormHandleSubmit<IExecutableFunctionForm>;
    onHandleSubmit: (data: IExecutableFunctionForm) => void;
    control: Control<IExecutableFunctionForm, unknown>;
    refetch: () => void;
    payload: FieldArrayWithId<IExecutableFunctionForm, 'payload', 'id'>[];
    appendPayload: () => void;
    removePayload: (index: number) => void;
    dependencies?: FieldArrayWithId<IExecutableFunctionForm, 'dependencies', 'id'>[];
    appendDependency?: () => void;
    removeDependency?: (index: number) => void;
    environmentVariables?: FieldArrayWithId<IExecutableFunctionForm, 'environmentVariables', 'id'>[];
    appendEnvironmentVariable?: () => void;
    removeEnvironmentVariable?: (index: number) => void;
}

const VaultSecretSection = ({ children }: { children: ReactNode }) => <>{children}</>;

function getSubmitButtonLabel(isDeploying: boolean, isEdit: boolean): string {
    if (isDeploying && isEdit) return 'Redeploying';
    if (isDeploying) return 'Deploying';
    if (isEdit) return 'Update & Redeploy';
    return 'Save & Deploy';
}

export const FormBody = (props: ExecutableFunctionProps) => {
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
        isOpen,
        dependencies = [],
        appendDependency,
        removeDependency,
        environmentVariables = [],
        appendEnvironmentVariable,
        removeEnvironmentVariable,
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

    const getStarterCode = (language: string) => {
        if (language === 'python') {
            return `def handler(event, context):\n    name = event.get("name")\n    return {\n        "statusCode": 200,\n        "body": f"Hello {name} from Python Lambda!"\n    }`;
        }
        if (language === 'typescript') {
            return `export const handler = async (event: any, context: any): Promise<any> => {\n  const name = event.name || "World";\n  return {\n    statusCode: 200,\n    body: \`Hello ${name} from TypeScript Lambda!\`\n  };\n};`;
        }
        // javascript/node default
        return `exports.handler = async (event, context) => {\n  const name = event.name || "World";\n  return {\n    statusCode: 200,\n    body: \`Hello ${name} from Node.js Lambda!\`\n  };\n};`;
    };

    const isReadOnlyVal = watch('isReadOnly');
    const isReadOnly = useMemo(() => {
        return !!isReadOnlyVal;
    }, [isReadOnlyVal]);

    const provider = watch('provider');
    const language = watch('language');
    const code = watch('code');
    const previousLanguageRef = useRef<string | undefined>(undefined);
    const isSettingCodeRef = useRef<boolean>(false);
    const pendingCodeUpdateRef = useRef<string | null>(null);
    const [codeUpdateTrigger, setCodeUpdateTrigger] = useState(0);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) {
            setCodeByLanguage({});
            previousLanguageRef.current = undefined;
            isSettingCodeRef.current = false;
            pendingCodeUpdateRef.current = null;
            setCodeUpdateTrigger(0);
        }
    }, [isOpen]);

    const normalizeCode = (code: string) => code.replaceAll(/\s+/g, ' ').trim();

    const isStarterCode = (codeToCheck: string) => {
        if (!codeToCheck || codeToCheck.trim() === '') return true;
        const normalized = normalizeCode(codeToCheck);
        const starters = ['javascript', 'typescript', 'python'].map(lang => normalizeCode(getStarterCode(lang)));
        return starters.includes(normalized);
    };

    useEffect(() => {
        if (isEdit) {
            previousLanguageRef.current = language;
            return;
        }

        if (!language) {
            return;
        }

        const languageChanged = language !== previousLanguageRef.current;

        if (languageChanged) {
            const currentCode = (code || '').trim();
            const previousLang = previousLanguageRef.current;

            const updatedCodeByLanguage = { ...codeByLanguage };
            if (previousLang !== undefined && currentCode && !isStarterCode(currentCode)) {
                updatedCodeByLanguage[previousLang] = currentCode;
            }

            const savedCode: string | undefined = updatedCodeByLanguage[language];
            const codeToSet = savedCode ?? getStarterCode(language);

            setCodeByLanguage(updatedCodeByLanguage);

            pendingCodeUpdateRef.current = codeToSet;
            setCodeUpdateTrigger(prev => prev + 1);
        } else if (!previousLanguageRef.current && language) {
            const currentCode = (code || '').trim();
            if (!currentCode || isStarterCode(currentCode)) {
                const newStarterCode = getStarterCode(language);
                pendingCodeUpdateRef.current = newStarterCode;
                setCodeUpdateTrigger(prev => prev + 1);
            }
        }

        previousLanguageRef.current = language;
    }, [language, isEdit, codeByLanguage, code]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (pendingCodeUpdateRef.current !== null && codeUpdateTrigger > 0) {
            const codeToSet = pendingCodeUpdateRef.current;
            pendingCodeUpdateRef.current = null;
            
            requestAnimationFrame(() => {
                isSettingCodeRef.current = true;
                setValue('code', codeToSet, { shouldValidate: true, shouldDirty: false });
                setTimeout(() => {
                    isSettingCodeRef.current = false;
                }, 100);
            });
        }
    }, [codeUpdateTrigger, setValue]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className={cn('col-span-1 sm:col-span-2', isEdit && 'opacity-60')}>
                <Input
                    {...register('name', {
                        required: { value: true, message: 'Please enter a function name' },
                        validate: value => validateName(value, 'function'),
                    })}
                    placeholder="Enter your function name"
                    readOnly={isEdit && isReadOnly}
                    disabled={isEdit && isReadOnly}
                    label="Function Name"
                    autoComplete="off"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                    onBlur={e => {
                        const lower = e.target.value.toLowerCase();
                        requestAnimationFrame(() => {
                            setValue('name', lower, { shouldValidate: true });
                        });
                    }}
                />
            </div>

            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        validate: value => validateSpaces(value, 'function description'),
                    })}
                    placeholder="Enter your Description"
                    readOnly={isEdit && isReadOnly}
                    label="Description"
                    autoComplete="off"
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            {isEdit && (
                <div className="col-span-1 sm:col-span-2 opacity-60">
                    <Input
                        {...register('deployedUrl')}
                        placeholder="No deployment yet"
                        readOnly
                        disabled
                        label="Deployed URL"
                        autoComplete="off"
                    />
                </div>
            )}
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
                        // { value: 'azure', name: 'Azure' },
                    ]}
                    currentValue={watch('provider')}
                    isDestructive={!!errors?.provider?.message}
                    supportiveText={errors?.provider?.message}
                />
            </div>

            {provider && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="opacity-60">
                                <Input
                                    {...register('region', {
                                        required: { value: true, message: 'Please enter the region' },
                                    })}
                                    placeholder="Enter your executable function region"
                                    readOnly
                                    disabled
                                    label="Region"
                                    autoComplete="off"
                                    isDestructive={!!errors?.region?.message}
                                    supportiveText={errors?.region?.message}
                                />
                            </div>
                            <Select
                                {...register('startupOption', {
                                    required: { value: true, message: 'Please select a startup option' },
                                })}
                                placeholder="Select your startup option"
                                disabled={isEdit && isReadOnly}
                                label="Startup Option"
                                options={[
                                    { value: 'on-demand', name: 'On Demand' },
                                    { value: 'always-available', name: 'Always Available' },
                                ]}
                                currentValue={watch('startupOption')}
                                isDestructive={!!errors?.startupOption?.message}
                                supportiveText={errors?.startupOption?.message}
                            />
                        </div>
                    </div>

                    <div className={cn('col-span-1 sm:col-span-2', isEdit && 'opacity-60')}>
                        <Select
                            {...register('credentials.authType', {
                                required: { value: true, message: 'Please select a authentication method' },
                            })}
                            placeholder="Select your Credential Type"
                            disabled={isEdit && isReadOnly}
                            label="Credential Type"
                            options={[
                                { value: 'key-access', name: 'Key Access' },
                                { value: 'managed-access', name: 'Managed Access' },
                            ]}
                            currentValue={watch('credentials.authType')}
                            isDestructive={!!errors?.credentials?.authType?.message}
                            supportiveText={errors?.credentials?.authType?.message}
                            helperInfo={
                                watch('credentials.authType') === 'managed-access'
                                    ? 'Credentials are read from ~/.aws/credentials or environment variables.'
                                    : undefined
                            }
                        />
                    </div>

                    {watch('credentials.authType') == 'key-access' && (
                        <>
                            <div className={cn('col-span-1 sm:col-span-2', isEdit && 'opacity-60')}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <VaultSecretSection>
                                        <VaultSelector
                                            {...register('credentials.meta.accessKey', {
                                                required: { value: true, message: 'Please select an Access key/vault' },
                                            })}
                                            label="Access Key"
                                            placeholder={
                                                secrets.length > 0 ? 'Select Access Key/Vault' : 'No Access Key/Vault found'
                                            }
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
                                    <VaultSecretSection>
                                        <VaultSelector
                                            {...register('credentials.meta.secretKey', {
                                                required: { value: true, message: 'Please select a secret key/vault' },
                                            })}
                                            label="Secret Key"
                                            placeholder={
                                                secrets.length > 0 ? 'Select Secret Key/Vault' : 'No Secret Key/Vault found'
                                            }
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
                            </div>
                            <div className={cn('col-span-1 sm:col-span-2 md:col-span-2', isEdit && 'opacity-60')}>
                                <VaultSecretSection>
                                    <VaultSelector
                                        {...register('credentials.meta.lambdaExecutionRoleArn', {
                                            required: { value: false, message: 'Please select a role key/vault' },
                                        })}
                                        label="Role"
                                        helperInfo="Role is optional. If not selected, a role will be automatically created."
                                        placeholder={secrets.length > 0 ? 'Select Role Key/Vault' : 'No Role Key/Vault found'}
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
                    {watch('credentials.authType') == 'managed-access' && (
                        <div className={cn('col-span-1 sm:col-span-2 md:col-span-2', isEdit && 'opacity-60')}>
                            <VaultSecretSection>
                                <VaultSelector
                                    {...register('credentials.meta.lambdaExecutionRoleArn', {
                                        required: { value: false, message: 'Please select a role key/vault' },
                                    })}
                                    label="Role"
                                    helperInfo="Role is optional. If not selected, a role will be automatically created."
                                    placeholder={secrets.length > 0 ? 'Select Role Key/Vault' : 'No Role Key/Vault found'}
                                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                                    options={secrets}
                                    isDestructive={!!errors?.credentials?.meta?.lambdaExecutionRoleArn?.message}
                                    supportiveText={errors?.credentials?.meta?.lambdaExecutionRoleArn?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetch()}
                                />
                            </VaultSecretSection>
                        </div>
                    )}
                </>
            )}
            <div className="col-span-1 sm:col-span-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                            Function Code
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={13} className="cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center" className="max-w-[300px]">
                                    <div className="space-y-2">
                                        <p>
                                            Your function automatically gets two inputs — <strong>event</strong> and{' '}
                                            <strong>context</strong>.
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 pl-2">
                                            <li>
                                                <strong>event</strong> has all the data you send when the function runs
                                                (including the Event Parameters you add below).
                                            </li>
                                            <li>
                                                <strong>context (optional)</strong> gives extra info about the function
                                                run, like its name or request ID.
                                            </li>
                                        </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </label>
                        <div className="w-54">
                            <Select
                                {...register('language', {
                                    required: { value: true, message: 'Please select a code language' },
                                })}
                                placeholder="Select Language"
                                disabled={isEdit}
                                options={[
                                    { value: 'javascript', name: 'Javascript (Node.js (22.x))' },
                                    { value: 'typescript', name: 'TypeScript (Node.js (22.x))' },
                                    { value: 'python', name: 'Python (3.13)' },
                                ]}
                                currentValue={watch('language')}
                                isDestructive={!!errors?.language?.message}
                                supportiveText={errors?.language?.message}
                            />
                        </div>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <Controller
                            name="code"
                            control={control}
                            rules={{
                                required: { value: true, message: 'Please provide function code' },
                            }}
                            render={({ field }) => (
                                <CodeMirror
                                    key={`codemirror-${watch('language')}`}
                                    height={'300px'}
                                    theme={theme === 'light' ? 'light' : 'dark'}
                                    value={field.value || ''}
                                    extensions={[
                                        getLanguageExtension(watch('language') || 'javascript'),
                                        autocompletion(),
                                        EditorView.lineWrapping,
                                        placeholder(getStarterCode(watch('language') || 'javascript')),
                                    ]}
                                    basicSetup={{
                                        lineNumbers: true,
                                        foldGutter: true,
                                        highlightActiveLine: true,
                                        dropCursor: true,
                                    }}
                                    onChange={value => {
                                        field.onChange(value);
                                        if (!isSettingCodeRef.current && !isEdit && language) {
                                            const currentCode = (value || '').trim();
                                            if (currentCode && !isStarterCode(currentCode)) {
                                                setCodeByLanguage(prev => {
                                                    if (prev[language] !== currentCode) {
                                                        return { ...prev, [language]: currentCode };
                                                    }
                                                    return prev;
                                                });
                                            }
                                        }
                                    }}
                                />
                            )}
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Write your executable function code above. Please adhere to the method signature.
                    </p>
                    {errors?.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
                    {errors?.language && <p className="text-xs text-red-500">{errors.language.message}</p>}
                </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <Collapsible className="border border-gray-300 rounded-md dark:border-gray-700">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            Function Configurations
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 pt-2 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100" id="dependencies-label">
                                        Dependencies
                                    </span>
                                    {appendDependency && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => appendDependency()}
                                            disabled={isEdit && isReadOnly}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            + Add Dependency
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Specify package versions (e.g., &quot;1.2.3&quot;, &quot;^1.0.0&quot;, &quot;latest&quot;). Detected dependencies are auto-added.
                                </p>
                                {dependencies.length > 0 && (
                                    <fieldset className="space-y-2 border-0 p-0 m-0" aria-labelledby="dependencies-label">
                                        {dependencies.map((item, index) => (
                                            <div key={item.id} className="flex gap-2 items-start">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <Input
                                                        {...register(`dependencies.${index}.name`, {
                                                            required: { value: true, message: 'Package name is required' },
                                                        })}
                                                        placeholder="Package name"
                                                        disabled={isEdit && isReadOnly}
                                                        defaultValue={item.name}
                                                        isDestructive={!!errors?.dependencies?.[index]?.name?.message}
                                                        supportiveText={errors?.dependencies?.[index]?.name?.message}
                                                    />
                                                    <Input
                                                        {...register(`dependencies.${index}.value`, {
                                                            required: { value: true, message: 'Version is required' },
                                                        })}
                                                        placeholder="Version (e.g., 1.2.3)"
                                                        disabled={isEdit && isReadOnly}
                                                        defaultValue={item.value}
                                                        isDestructive={!!errors?.dependencies?.[index]?.value?.message}
                                                        supportiveText={errors?.dependencies?.[index]?.value?.message}
                                                    />
                                                </div>
                                                {removeDependency && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeDependency(index)}
                                                        disabled={isEdit && isReadOnly}
                                                        className="mt-0"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </fieldset>
                                )}
                                {dependencies.length === 0 && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No dependencies added</p>
                                )}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100" id="env-vars-label">
                                        Environment Variables
                                    </span>
                                    {appendEnvironmentVariable && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => appendEnvironmentVariable()}
                                            disabled={isEdit && isReadOnly}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            + Add Variable
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Define environment variables that will be available to your function at runtime.
                                </p>
                                {environmentVariables.length > 0 && (
                                    <fieldset className="space-y-2 border-0 p-0 m-0" aria-labelledby="env-vars-label">
                                        {environmentVariables.map((item, index) => (
                                            <div key={item.id} className="flex gap-2 items-start">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <Input
                                                        {...register(`environmentVariables.${index}.name`, {
                                                            required: { value: true, message: 'Variable name is required' },
                                                        })}
                                                        placeholder="Variable name"
                                                        disabled={isEdit && isReadOnly}
                                                        defaultValue={item.name}
                                                        isDestructive={!!errors?.environmentVariables?.[index]?.name?.message}
                                                        supportiveText={errors?.environmentVariables?.[index]?.name?.message}
                                                    />
                                                    <Input
                                                        {...register(`environmentVariables.${index}.value`, {
                                                            required: { value: true, message: 'Value is required' },
                                                        })}
                                                        placeholder="Value"
                                                        disabled={isEdit && isReadOnly}
                                                        defaultValue={item.value}
                                                        isDestructive={!!errors?.environmentVariables?.[index]?.value?.message}
                                                        supportiveText={errors?.environmentVariables?.[index]?.value?.message}
                                                    />
                                                </div>
                                                {removeEnvironmentVariable && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeEnvironmentVariable(index)}
                                                        disabled={isEdit && isReadOnly}
                                                        className="mt-0"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </fieldset>
                                )}
                                {environmentVariables.length === 0 && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No environment variables added</p>
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="col-span-1 sm:col-span-2">
                <HeaderInput
                    label="Event Parameters"
                    register={register}
                    fields={payload}
                    namePrefix="payload"
                    append={() => appendPayload()}
                    remove={(index: number) => removePayload(index)}
                    control={control}
                    hasType={true}
                    list={watch('payload')}
                    disabledInputs={isEdit && isReadOnly}
                    valuePlaceholder="Description"
                    typePlaceholder="Type"
                />
            </div>

            <div className="col-span-1 sm:col-span-2">
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Package Size Limit:</strong> The total function package size (including code and dependencies) must not exceed 250 MB.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ExecutableFunctionForm = (props: ExecutableFunctionProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isDeploying } = props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Braces />}
            header={isEdit ? 'Edit Executable Function' : 'New Executable Function'}
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
                                        disabled={!isValid || isDeploying || (isEdit && !!watch('isReadOnly'))}
                                        loading={isDeploying}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {getSubmitButtonLabel(isDeploying, isEdit)}
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
