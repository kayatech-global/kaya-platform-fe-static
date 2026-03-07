import { BulkApiImportDrawerProps } from '@/app/workspace/[wid]/api-configurations/components/api-configuration-bulkApi-Import';
import { AuthenticationGrantType, AuthorizationType, BulkApiStepType } from '@/enums';
import { BulkApiImportStats, IHookProps, PreviewApiItem, TBulkConfigForm, TransformedApiOutput } from '@/models';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ISwaggerImportApiConfigType, useSwaggerParser } from './use-swagger-parser';
import { getSecureRandom } from '@/lib/utils';
import { FetchError } from '@/utils';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { apiService } from '@/services';

export const useApiImport = (props: IHookProps) => {
    const params = useParams();
    const [activeStep, setActiveStep] = useState<BulkApiStepType>(BulkApiStepType.UPLOAD);
    const [bulkFiles, setBulkFiles] = useState<File[]>([]);
    const [importProgress, setImportProgress] = useState<number>(0);
    const [hasShownImportToast, setHasShownImportToast] = useState<boolean>(false);
    const [importStats, setImportStats] = useState<BulkApiImportStats | null>(null);

    const { open, refetchApiConfigs } = props?.data as BulkApiImportDrawerProps;
    const {
        importedApiConfigs,
        isValidSwagger,
        importedBaseUrl,
        importedAuthTypes,
        loading: swaggerLoading,
        error: swaggerError,
        parseSwaggerFile,
    } = useSwaggerParser();

    // React Hook Form setup
    const {
        register,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors, isValid },
        control,
    } = useForm<TBulkConfigForm>({
        mode: 'all',
        defaultValues: {
            baseUrl: '',
            authorization: [
                {
                    authType: '',
                    meta: {
                        username: '',
                        password: '',
                        token: '',
                        headerName: '',
                        headerValue: '',
                        apiKeyIn: 'header',
                        authorizationUrl: '',
                        tokenUrl: '',
                        scopes: {},
                        openIdConnectUrl: '',
                        scheme: '',
                        grantType: AuthenticationGrantType.Empty,
                        headerPrefix: '',
                        clientId: '',
                        clientSecret: '',
                        audience: '',
                        scope: '',
                    },
                },
            ],
            previewApis: [],
        },
    });

    const previewApis = useWatch({
        control,
        name: 'previewApis',
    });

    const { fields } = useFieldArray({
        control: control,
        name: 'previewApis',
    });

    const { fields: authFields } = useFieldArray({
        control: control,
        name: 'authorization',
    });

    const watchedAuthFields = useWatch({
        control: control,
        name: 'authorization',
    });

    const watchedBaseUrl = useWatch({
        control: control,
        name: 'baseUrl',
    });

    // Default config used to reset the form
    const defaultBulkConfig: TBulkConfigForm = useMemo(
        () => ({
            baseUrl: '',
            authorization: [
                {
                    authType: '',
                    meta: {
                        username: '',
                        password: '',
                        token: '',
                        headerName: '',
                        headerValue: '',
                        apiKeyIn: 'header',
                        authorizationUrl: '',
                        tokenUrl: '',
                        scopes: {},
                        openIdConnectUrl: '',
                        scheme: '',
                        clientId: '',
                        clientSecret: '',
                        audience: '',
                        scope: '',
                        headerPrefix: '',
                        grantType: AuthenticationGrantType.Empty,
                    },
                },
            ],
            previewApis: [],
        }),
        []
    );

    // Preview counters
    const foundCount = useMemo(() => previewApis?.length, [previewApis]);

    const selectedCount = useMemo(() => previewApis?.filter(a => a.selected).length, [previewApis]);

    const testedCount = useMemo(() => {
        // Count total number of tests executed across all APIs
        return previewApis?.reduce((total, api) => total + (api.testCount || 0), 0);
    }, [previewApis]);

    // File upload validation for Next button (Upload step)
    const hasUploadErrors = useMemo(() => {
        // No files uploaded
        if (bulkFiles.length === 0) return true;

        // File is being processed
        if (swaggerLoading) return true;

        // Processing error occurred
        if (swaggerError) return true;

        // Invalid swagger file
        if (!isValidSwagger) return true;

        // No APIs found in valid swagger file
        if (
            bulkFiles.length > 0 &&
            isValidSwagger &&
            !swaggerLoading &&
            !swaggerError &&
            (!importedApiConfigs || importedApiConfigs.length === 0)
        ) {
            return true;
        }

        return false;
    }, [bulkFiles.length, swaggerLoading, swaggerError, isValidSwagger, importedApiConfigs]);

    // Get upload error message for tooltip
    const getUploadErrorMessage = useMemo(() => {
        if (bulkFiles.length === 0) return 'Please upload a file to continue';
        if (swaggerLoading) return 'Processing file, please wait...';
        if (swaggerError) return 'File processing failed. Please try uploading a different file';
        if (!isValidSwagger) return 'Please upload a valid Swagger/OpenAPI specification file';
        if (bulkFiles.length > 0 && isValidSwagger && (!importedApiConfigs || importedApiConfigs.length === 0)) {
            return 'No API endpoints found in the uploaded file. Please upload a different Swagger/OpenAPI file';
        }
        return '';
    }, [bulkFiles.length, swaggerLoading, swaggerError, isValidSwagger, importedApiConfigs]);

    // One place to reset all wizard state + RHF values
    const resetWizard = useCallback(() => {
        setActiveStep(BulkApiStepType.UPLOAD);
        setValue('previewApis', []);
        setImportProgress(0);
        setHasShownImportToast(false);
        reset(defaultBulkConfig);
    }, [reset, defaultBulkConfig]);

    // Reset on open to always start fresh
    useEffect(() => {
        if (open) {
            resetWizard();
        }
    }, [open, resetWizard]);

    useEffect(() => {
        if (!open) {
            onFileClear();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // When imported API configs or base URL changes, update the RHF values
    useEffect(() => {
        if (!importedApiConfigs) return;

        if (importedBaseUrl) {
            setValue('baseUrl', importedBaseUrl ?? '');
        }

        if (importedAuthTypes?.length) {
            const formattedAuths = importedAuthTypes.map(auth => ({
                authType: auth.authType,
                meta: {
                    username: auth.meta?.username ?? '',
                    password: auth.meta?.password ?? '',
                    token: auth.meta?.token ?? '',
                    headerName: auth.meta?.headerName ?? '',
                    headerValue: auth.meta?.headerValue ?? '',
                    apiKeyIn: auth.meta?.apiKeyIn ?? 'header',
                    authorizationUrl: auth.meta?.authorizationUrl ?? '',
                    tokenUrl: auth.meta?.tokenUrl ?? '',
                    scopes: auth.meta?.scopes ?? {},
                    openIdConnectUrl: auth.meta?.openIdConnectUrl ?? '',
                    scheme: auth.meta?.scheme ?? '',
                    clientId: auth.meta?.clientId ?? '',
                    clientSecret: auth.meta?.clientSecret ?? '',
                    audience: auth.meta?.audience ?? '',
                    scope: auth.meta?.scope ?? '',
                    headerPrefix: auth.meta?.headerPrefix ?? '',
                    grantType: auth.meta?.grantType ?? AuthenticationGrantType.Empty,
                },
            }));
            //  using setValue directly on the field array
            setValue('authorization', formattedAuths, { shouldValidate: true });
        }
    }, [importedApiConfigs, importedBaseUrl, importedAuthTypes, setValue]);

    // Show success toast when progress reaches 100%
    useEffect(() => {
        if (activeStep === 4 && importProgress >= 100 && !hasShownImportToast) {
            setHasShownImportToast(true);
        }
    }, [activeStep, importProgress, hasShownImportToast, selectedCount]);

    useEffect(() => {
        // Run this effect when activeStep, previewApis length, importedApiConfigs, or baseUrl changes
        if (previewApis?.length === 0) {
            // Build a list of preview API items by combining base URL and API path
            const val = importedApiConfigs?.map((apiConfig: ISwaggerImportApiConfigType) => {
                // Construct the full API URL from base URL + API path
                const updatedApiUrl = joinUrl(watch('baseUrl'), apiConfig.apiPath);

                // Return a new PreviewApiItem with selected and tested defaults
                return {
                    ...apiConfig,
                    apiUrl: updatedApiUrl,
                    selected: true,
                    tested: false,
                    testCount: 0,
                } as PreviewApiItem;
            });

            // Update previewApis state with the newly created list
            setValue('previewApis', val);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, previewApis?.length, importedApiConfigs]);

    useEffect(() => {
        const updatedApiOperationsWithApiUrl = watch('previewApis')?.map(api => {
            const updatedApiUrl = joinUrl(watch('baseUrl'), api.apiPath);
            return { ...api, apiUrl: updatedApiUrl };
        });

        setValue('previewApis', updatedApiOperationsWithApiUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedBaseUrl]);

    useEffect(() => {
        if (!watchedAuthFields?.length) return;
        const data = watch('previewApis')?.map(api => {
            const updatedAuth = api.authorization.map(apiAuth => {
                // Find the corresponding auth field from the form
                const matchingField = watchedAuthFields.find(f => f.authType === apiAuth.authType);
                if (!matchingField) return apiAuth; // no change if not found

                const { meta: watchedMeta } = matchingField;

                // Update only the relevant meta fields based on authType
                const newMeta = { ...apiAuth.meta };

                switch (apiAuth.authType) {
                    case AuthorizationType.BasicAuth:
                        newMeta.username = watchedMeta.username;
                        newMeta.password = watchedMeta.password;
                        break;
                    case AuthorizationType.BearerToken:
                        newMeta.token = watchedMeta.token;
                        break;
                    case AuthorizationType.APIKey:
                        newMeta.headerName = watchedMeta.headerName;
                        newMeta.headerValue = watchedMeta.headerValue;
                        newMeta.apiKeyIn = watchedMeta.apiKeyIn;
                        break;
                    case AuthorizationType.OAUTH2:
                        newMeta.grantType = watchedMeta.grantType;
                        newMeta.headerPrefix = watchedMeta.headerPrefix;
                        newMeta.clientId = watchedMeta.clientId;
                        newMeta.clientSecret = watchedMeta.clientSecret;
                        newMeta.audience = watchedMeta.audience;
                        newMeta.scope = watchedMeta.scope;
                        newMeta.tokenUrl = watchedMeta.tokenUrl;
                        break;
                    default:
                        Object.assign(newMeta, watchedMeta);
                        break;
                }

                return { ...apiAuth, meta: newMeta };
            });

            return { ...api, authorization: updatedAuth };
        });
        setValue('previewApis', data);
    }, [watchedAuthFields]);

    // Handle file upload and parsing
    const onUploadChange = async (files: File[]) => {
        // If no files, clear all related state and validation errors
        if (files.length === 0) {
            onFileClear();
            return;
        }

        // First clear all previous data completely before uploading new file
        onFileClear();

        // Then set the new file and parse it
        setBulkFiles(files);
        await parseSwaggerFile(files);
    };

    // Handle file clearing - reset all validation states
    const onFileClear = useCallback(() => {
        setBulkFiles([]); // Clear the file array
        setValue('previewApis', []);
        setActiveStep(BulkApiStepType.UPLOAD); // Go back to Upload step when file is cleared
        reset(defaultBulkConfig); // This clears form validation errors
        // parseSwaggerFile([]) will handle resetting swagger validation states
        parseSwaggerFile([]);
    }, [reset, defaultBulkConfig, parseSwaggerFile]);

    // Handlers
    const handleSelectAll = () => {
        if (watch('previewApis')?.length === 0) return;
        const data = watch('previewApis')?.map(item => ({ ...item, selected: true }));
        setValue('previewApis', data);
    };
    const handleDeselectAll = () => {
        if (watch('previewApis')?.length === 0) return;
        const data = watch('previewApis')?.map(item => ({ ...item, selected: false }));
        setValue('previewApis', data);
    };

    const handleToggleSelect = (apiName: string, checked: boolean) => {
        const data = watch('previewApis')?.map(item =>
            item.apiName === apiName ? { ...item, selected: checked } : item
        );
        setValue('previewApis', data);
    };

    const handleTestedChange = useCallback((apiName: string, tested: boolean) => {
        const data = watch('previewApis')?.map(item => {
            if (item.apiName === apiName) {
                // Only increment count if this is the first time testing (tested was false before)
                const wasNotTestedBefore = !item.tested;
                const currentTestCount = item.testCount || 0;
                const newTestCount = tested && wasNotTestedBefore ? currentTestCount + 1 : currentTestCount;
                return { ...item, tested, testCount: newTestCount };
            }
            return item;
        });
        setValue('previewApis', data);
    }, []);

    // Compose base URL with path for preview
    // const baseUrl = (bulkWatch('authorization') && bulkWatch('baseUrl')) || '';
    const joinUrl = (base: string, path: string) => {
        if (!path) return base || '/';
        // If path is absolute, return as-is
        if (/^https?:\/\//i.test(path)) return path;
        if (!base) return path;
        // Normalize slashes
        const b = base.replace(/\/$/, '');
        const p = path.startsWith('/') ? path : `/${path}`;
        return `${b}${p}`;
    };

    const simulateProgress = (setProgress: (n: number) => void) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += getSecureRandom() * 10;
            if (progress >= 95) {
                clearInterval(interval);
            }
            setProgress(Math.floor(progress));
        }, 200);
        return interval;
    };

    const { mutateAsync: mutateCreate, isError: isErrorOnCreate } = useMutation(
        async (data: TransformedApiOutput) => await apiService.batch(data, params.wid as string),
        {
            onSuccess: data => {
                // Handle different scenarios based on stats
                const { stats, message: responseMessage } = data;

                // Store stats for display in ImportProgress
                setImportStats(stats);

                if (stats.created === 0 && stats.duplicate > 0) {
                    // All duplicates - show warning message
                    toast.warning(responseMessage ?? 'No APIs to create after filtering duplicates');
                } else if (stats.created > 0 && stats.duplicate > 0) {
                    // Mixed - some created, some duplicates
                    toast.success(
                        `Successfully imported ${stats.created} API${stats.created !== 1 ? 's' : ''} and ignored ${
                            stats.duplicate
                        } duplicate${stats.duplicate !== 1 ? 's' : ''}`
                    );
                } else if (stats.created > 0 && stats.duplicate === 0) {
                    // All created - standard success message
                    toast.success('API(s) saved successfully');
                } else {
                    // Fallback - should not reach here but just in case
                    toast.success('API(s) operation completed');
                }
                setImportProgress(100);
                refetchApiConfigs();
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                setImportProgress(100);
            },
        }
    );

    const handleImport = async () => {
        setActiveStep(BulkApiStepType.IMPORT);
        const interval = simulateProgress(setImportProgress);

        // Trigger child function
        try {
            const selectedAPIs = watch('previewApis')?.filter(api => api.selected);

            const apis = selectedAPIs.map(api => {
                const auth = api.authorization?.[0] ?? {
                    authType: AuthorizationType.NoAuthorization,
                    meta: {},
                };

                // Convert bodyParams to JSON string with descriptions and types
                let payload = '{}';
                if (Array.isArray(api.bodyParams)) {
                    const payloadObj: Record<string, unknown> = {};
                    api.bodyParams.forEach(param => {
                        payloadObj[param.name] = {
                            description: param.description ?? '',
                            type: param.dataType ?? 'string',
                        };
                    });
                    payload = JSON.stringify(payloadObj);
                } else if (typeof api.bodyParams === 'object' && api.bodyParams !== null) {
                    payload = JSON.stringify(api.bodyParams);
                }

                // Convert promotedVariables to JSON with same structure
                let promotedVariables = '{}';
                if (Array.isArray(api.promotedVariables)) {
                    const promotedObj: Record<string, unknown> = {};
                    api.promotedVariables.forEach(v => {
                        promotedObj[v.name] = {
                            description: v.value ?? '',
                            type: v.dataType ?? 'string',
                        };
                    });
                    promotedVariables = JSON.stringify(promotedObj);
                }

                const authorizationMeta =
                    auth.authType === AuthorizationType.OAUTH2
                        ? {
                              tokenUrl: auth.meta?.tokenUrl || undefined,
                              clientId: auth.meta?.clientId || undefined,
                              clientSecret: auth.meta?.clientSecret || undefined,
                              audience: auth.meta?.audience || undefined,
                              scope: auth.meta?.scope || undefined,
                              headerPrefix: auth.meta?.headerPrefix || undefined,
                              grantType: auth.meta?.grantType || undefined,
                          }
                        : {
                              username: auth.meta?.username || undefined,
                              password: auth.meta?.password || undefined,
                              token: auth.meta?.token || undefined,
                              headerName: auth.meta?.headerName || undefined,
                              headerValue: auth.meta?.headerValue || undefined,
                          };

                return {
                    name: api.apiName,
                    description: api.description,
                    configurations: {
                        defaultApiParameters: '',
                        url: api.apiUrl,
                        method: api.apiMethod,
                        headers: api.apiHeaders ?? [],
                        payload,
                        promotedVariables,
                        authorization: {
                            authType: auth.authType,
                            meta: authorizationMeta,
                        },
                    },
                };
            });

            // Final transformation object
            const finalObject = { apis };

            await mutateCreate(finalObject);
        } catch {
            setHasShownImportToast(true);
            setImportProgress(100);
        } finally {
            clearInterval(interval);
        }
    };

    return {
        activeStep,
        isValidSwagger,
        swaggerLoading,
        baseUrl: String(importedBaseUrl ?? ''),
        bulkFiles,
        foundCount,
        selectedCount,
        testedCount,
        importProgress,
        control,
        errors,
        hasUploadErrors,
        getUploadErrorMessage,
        isValid,
        isLoadingPreview: swaggerLoading,
        importStats,
        isErrorOnCreate,
        fields,
        authFields,
        watchedBaseUrl,
        setImportStats,
        setActiveStep,
        register,
        watch,
        setValue,
        trigger,
        resetWizard,
        onUploadChange,
        onFileClear,
        handleSelectAll,
        handleDeselectAll,
        handleToggleSelect,
        handleTestedChange,
        handleImport,
    };
};
