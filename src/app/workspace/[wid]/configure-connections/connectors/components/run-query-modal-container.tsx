import { Button, VariableValuePicker } from '@/components';
import { VariableHighlighter } from '@/components/molecules/variable-highlighter/VariableHighlighter';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DataType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { IConnectorTestQuery, IConnectorTestQueryParams, IIntellisenseOption } from '@/models';
import { FetchError, logger } from '@/utils';
import { Copy, FlaskConical } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { connectorService } from '@/services';

interface RunQueryModalContainerProps {
    databaseId: string | undefined;
    query: string | undefined;
    intellisenseOptions: IIntellisenseOption[];
    showTestModal: boolean;
    setShowTestModal: Dispatch<SetStateAction<boolean>>;
}

export const RunQueryModalContainer = ({
    databaseId,
    query,
    intellisenseOptions,
    showTestModal,
    setShowTestModal,
}: RunQueryModalContainerProps) => {
    const params = useParams();
    const [tested, setTested] = useState<boolean>(false);
    const [queryResult, setQueryResult] = useState<string>('');

    const {
        register,
        watch,
        control,
        formState: { errors, isValid },
        setValue,
        reset,
        handleSubmit,
        trigger,
    } = useForm<IConnectorTestQuery>({
        mode: 'all',
        defaultValues: {
            databaseId: '',
            query: '',
            parameters: [],
        },
    });

    const { fields } = useFieldArray({
        name: 'parameters',
        control,
    });

    const { isLoading: testing, mutate: mutateCreate } = useMutation(
        (data: IConnectorTestQuery) => {
            const wid = params.wid as string | undefined;
            if (!wid) {
                return Promise.reject(new Error('Workspace ID is missing'));
            }
            return connectorService.testQuery(data, wid);
        },
        {
            onSuccess: data => {
                try {
                    const result = JSON.stringify(data, null, 2);
                    setQueryResult(result);
                } catch {
                    setQueryResult(String(data));
                }
                setTested(true);
            },
            onError: (error: FetchError) => {
                const msg = error?.message ?? 'Unknown error';
                toast.error(msg);
                logger.error('Error while testing query:', msg);
                setQueryResult(JSON.stringify({ error: msg }, null, 2));
                setTested(true);
            },
        }
    );

    useEffect(() => {
        if (showTestModal) {
            const results = intellisenseOptions?.find(x => x.name === 'Variables');
            if (results && query) {
                const matches = [...query.matchAll(/\{\{Variable:(\w+)\}\}/g)];
                const extractedVariables = matches.map(m => m[1]);
                const variables = results?.options?.filter(x => extractedVariables.includes(x.label));

                if (extractedVariables.length > 0) {
                    reset({
                        databaseId,
                        query,
                            parameters: variables?.map(
                                x => {
                                    let defaultValue: string | null;
                                    if (x.type === DataType.bool) defaultValue = 'true';
                                    else if (x.type === DataType.string) defaultValue = '';
                                    else defaultValue = null;
                                    return {
                                        key: x.label,
                                        type: x.type,
                                        value: defaultValue,
                                    } as IConnectorTestQueryParams;
                                }
                            ),
                    });
                } else {
                    // Auto-run the query if there are no variables
                    setTested(true);
                    setQueryResult('');
                    mutateCreate({
                        databaseId: databaseId as string,
                        query,
                        parameters: [],
                    });
                }
            } else {
                reset({
                    databaseId,
                    query,
                    parameters: [],
                });
            }
        } else {
            reset({
                databaseId: '',
                query: '',
                parameters: [],
            });
            setQueryResult('');
            setTested(false);
        }
    }, [showTestModal, intellisenseOptions, query, databaseId, mutateCreate, reset]);

    const onHandleSubmit = (data: IConnectorTestQuery) => {
        const body: IConnectorTestQuery = {
            ...data,
            parameters: data?.parameters?.map(x => ({
                key: x.key,
                value: x.type === DataType.bool ? x.value === 'true' : x.value,
            })),
        };
        mutateCreate(body);
    };

    return (
        <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-primary" />
                        {tested ? 'Result' : 'Set Values'}
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-fit overflow-y-auto max-h-[351px] pb-4">
                        {/* --- Query Preview Section --- */}
                        {query && (
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Query to Test</p>
                                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-md p-3 text-xs font-mono text-blue-800 dark:text-blue-200 whitespace-pre-wrap break-words max-h-32 overflow-auto">
                                    <VariableHighlighter query={query} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-y-4 sm:gap-4">
                            {(() => {
                                if (testing && isNullOrEmpty(queryResult)) {
                                    return (
                                        <div className="flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Running query...</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (isNullOrEmpty(queryResult)) {
                                    return (
                                        <>
                                            {fields?.map((variable, index) => (
                                                <div key={variable.key ?? `param-${index}`}>
                                                    <VariableValuePicker
                                                        fieldType={`parameters.${index}.type`}
                                                        fieldName={`parameters.${index}.value`}
                                                        data={{
                                                            type: watch(`parameters.${index}.type`),
                                                            value: watch(`parameters.${index}.value`),
                                                        }}
                                                        placeholder={(() => {
                                                            if (variable.type === 'int') return 'Enter an integer value';
                                                            return `Enter a ${variable.type} value`;
                                                        })()}
                                                        required="Please enter a value"
                                                        errorMessage={errors?.parameters?.[index]?.value?.message}
                                                        label={variable.key}
                                                        control={control}
                                                        register={register}
                                                        setValue={setValue}
                                                        watch={watch}
                                                        trigger={trigger}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    );
                                }
                                return (
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">Result</p>
                                        <div className="bg-surface-secondary p-3 rounded text-xs font-mono overflow-auto max-h-48">
                                            <pre className="whitespace-pre-wrap break-words">{queryResult}</pre>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard
                                                        ?.writeText(queryResult)
                                                        .then(() => toast.success('Copied result'));
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </DialogDescription>

                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => setShowTestModal(false)}>
                        Cancel
                    </Button>
                    {!tested && (
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={!isValid || testing}
                            onClick={handleSubmit(onHandleSubmit)}
                        >
                            {testing ? 'Testing...' : 'Test'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
