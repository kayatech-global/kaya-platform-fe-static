'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/atoms/dialog';
import { Button, OptionModel, Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HttpMethodBadge } from '@/components/molecules';
import ParameterInput from './parameter-input';
import { ISwaggerParameter } from '@/hooks/use-swagger-parser';
import { IAuthorization } from '@/models';
import { FetchError, logger } from '@/utils';
import { useMutation } from 'react-query';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { apiService } from '@/services';

export type ApiResponse<T = unknown> = {
    message: string;
    data: {
        data: {
            success: boolean;
            status: number;
            statusText: string;
            data: T;
        };
    };
};

export type ApiTestConfig = {
    name?: string;
    url: string;
    method: string;
    pathParams: ISwaggerParameter[];
    queryParams: ISwaggerParameter[];
    defaultQueryParams?: ISwaggerParameter[];
    bodyParams: ISwaggerParameter[];
    headers: ISwaggerParameter[];
    auth: IAuthorization;
};

type TestApiModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiConfig: ApiTestConfig;
    className?: string;
    title?: string;
    secrets: OptionModel[];
    loadingSecrets?: boolean;
    icon?: React.ReactNode;
    onTestSuccess?: () => void;
    onVaultRefetch: () => void;
};

export default function TestApiModal({
    open,
    onOpenChange,
    apiConfig,
    className,
    title = 'Test API Configuration',
    icon = <Play className="text-blue-600" size={18} />,
    secrets,
    loadingSecrets,
    onTestSuccess,
    onVaultRefetch,
}: Readonly<TestApiModalProps>) {
    const { control, setValue, getValues } = useForm<ApiTestConfig>({
        defaultValues: apiConfig,
    });

    const pathArray = useFieldArray({ control, name: 'pathParams' });
    const queryArray = useFieldArray({ control, name: 'queryParams' });
    const defaultQueryArray = useFieldArray({ control, name: 'defaultQueryParams' });
    const bodyArray = useFieldArray({ control, name: 'bodyParams' });
    const headerArray = useFieldArray({ control, name: 'headers' });

    const resultRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [apiResult, setApiResult] = useState<any>(null);
    const [hasExecutedTest, setHasExecutedTest] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const params = useParams();

    const { mutate, isLoading } = useMutation((data: ApiTestConfig) => apiService.test(data, params.wid as string), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (data: any) => {
            toast.success('API tested successfully');
            setApiResult({ status: data.data.status, data: { message: data } });
            setHasExecutedTest(true); // Mark that test was executed
        },
        onError: (error: FetchError) => {
            toast.error(error?.message);
            logger.error('Error testing API:', error?.message);
            setHasExecutedTest(true); // Mark that test was executed even on error
        },
    });

    const onSubmit = async (data: ApiTestConfig) => {
        // Clear previous response before starting new test
        setApiResult(null);

        const payload: ApiTestConfig = {
            url: data.url,
            method: data.method,
            pathParams: data.pathParams,
            queryParams: data.queryParams,
            defaultQueryParams: data.defaultQueryParams,
            bodyParams: data.bodyParams,
            headers: data.headers,
            auth: data.auth,
        };

        // Mock API result for scrolling demo
        await mutate(payload);
    };

    const handleOnCancel = () => {
        setApiResult(undefined);
    };

    useEffect(() => {
        // Helper to remove params that have empty name and value
        const cleanParams = (params: ISwaggerParameter[] = []) =>
            params.filter(p => p.name?.trim() || p.value?.toString().trim());

        setValue('pathParams', cleanParams(apiConfig.pathParams));
        setValue('queryParams', cleanParams(apiConfig.queryParams));
        setValue('defaultQueryParams', cleanParams(apiConfig.defaultQueryParams));
        setValue('bodyParams', cleanParams(apiConfig.bodyParams));
        setValue('headers', cleanParams(apiConfig.headers));
        setValue('auth', apiConfig.auth ?? {});
        setValue('method', apiConfig.method);
        setValue('url', apiConfig.url);
        // not setting value is the issue
    }, [apiConfig, setValue]);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setHasExecutedTest(false);
            setApiResult(null);
        }
    }, [open]);

    // When modal closes and test was executed, call onTestSuccess
    useEffect(() => {
        if (!open && hasExecutedTest) {
            onTestSuccess?.();
            setHasExecutedTest(false); // Reset for next time
        }
    }, [open, hasExecutedTest, onTestSuccess]);

    // Scroll to result when apiResult updates
    useEffect(() => {
        if (apiResult) {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [apiResult]);

    const hasMissingParam = () => {
        // Removed empty value check - parameters are now optional
        // Only block execution if there are type validation errors
        return false;
    };

    const isDisabled = hasMissingParam();
    const hasErrors = Object.values(errors).some(err => err !== '');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('max-w-2xl flex flex-col h-fit', className)}>
                {!apiConfig ? (
                    <div className="p-4 text-sm text-gray-500">Loading API data...</div>
                ) : (
                    <div className="flex flex-col">
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100 dark:bg-blue-900">
                                    {icon}
                                </div>
                                <DialogTitle>{title}</DialogTitle>
                            </div>
                        </DialogHeader>

                        <DialogBody className="space-y-2 pb-4 pt-4  max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                            {(apiConfig.method || apiConfig.url) && (
                                <div className="mt-3 mb-0 text-sm rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                                        <div className="min-w-0">
                                            {apiConfig.name && (
                                                <div className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                                                    {apiConfig.name}
                                                </div>
                                            )}
                                            {apiConfig.url && (
                                                <div className="text-gray-600 dark:text-gray-300 break-all">
                                                    {apiConfig.url}
                                                </div>
                                            )}
                                        </div>
                                        {apiConfig.method && (
                                            <HttpMethodBadge method={apiConfig.method} className="justify-self-end" />
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col pr-2">
                                {/* Parameters */}
                                {pathArray.fields.length > 0 && (
                                    <Controller
                                        name="pathParams"
                                        control={control}
                                        render={({ field }) => (
                                            <ParameterInput
                                                title="Path Parameters"
                                                parameters={field.value}
                                                onChange={field.onChange}
                                                errors={errors}
                                                setErrors={setErrors}
                                            />
                                        )}
                                    />
                                )}
                                {queryArray.fields.length > 0 && (
                                    <Controller
                                        name="queryParams"
                                        control={control}
                                        render={({ field }) => (
                                            <ParameterInput
                                                title="Query Parameters"
                                                parameters={field.value}
                                                onChange={field.onChange}
                                                errors={errors}
                                                setErrors={setErrors}
                                            />
                                        )}
                                    />
                                )}
                                {defaultQueryArray.fields.length > 0 && (
                                    <Controller
                                        name="defaultQueryParams"
                                        control={control}
                                        render={({ field }) => (
                                            <ParameterInput
                                                title="Default Query Parameters"
                                                parameters={field?.value ?? []}
                                                onChange={field.onChange}
                                                errors={errors}
                                                setErrors={setErrors}
                                            />
                                        )}
                                    />
                                )}
                                {bodyArray.fields.length > 0 && (
                                    <Controller
                                        name="bodyParams"
                                        control={control}
                                        render={({ field }) => (
                                            <ParameterInput
                                                title="Body Parameters"
                                                parameters={field.value}
                                                onChange={field.onChange}
                                                errors={errors}
                                                setErrors={setErrors}
                                            />
                                        )}
                                    />
                                )}
                                {headerArray.fields.length > 0 && (
                                    <Controller
                                        name="headers"
                                        control={control}
                                        render={({ field }) => (
                                            <ParameterInput
                                                title="Headers"
                                                parameters={field.value}
                                                onChange={field.onChange}
                                                errors={errors}
                                                setErrors={setErrors}
                                                secrets={secrets}
                                                loadingSecrets={loadingSecrets}
                                                onVaultRefetch={onVaultRefetch}
                                            />
                                        )}
                                    />
                                )}
                            </div>

                            {/* Result Box */}
                            {apiResult && (
                                <div
                                    ref={resultRef}
                                    className="mt-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            Response
                                        </span>
                                        {apiResult.status && (
                                            <span
                                                className={cn(
                                                    'px-2 py-1 text-xs font-semibold rounded-md',
                                                    (() => {
                                                        const s = apiResult.status;
                                                        if (s >= 200 && s < 300)
                                                            return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100';
                                                        if (s >= 400 && s < 500)
                                                            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100';
                                                        if (s >= 500)
                                                            return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100';
                                                        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
                                                    })()
                                                )}
                                            >
                                                {apiResult.status}
                                            </span>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-4">
                                        <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed overflow-auto max-h-80 text-gray-800 dark:text-gray-200">
                                            {JSON.stringify(apiResult.data ?? apiResult, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </DialogBody>

                        <DialogFooter className="flex-shrink-0 flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        onOpenChange(false);
                                        handleOnCancel();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            disabled={isDisabled || hasErrors || isLoading}
                                            onClick={() => onSubmit(getValues())}
                                            loading={isLoading}
                                        >
                                            Execute
                                        </Button>
                                    </TooltipTrigger>
                                    {(isDisabled || hasErrors) && (
                                        <TooltipContent side="top" align="end">
                                            <div className="text-xs">
                                                Please fill in all parameters with correct values before executing.
                                            </div>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </div>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
