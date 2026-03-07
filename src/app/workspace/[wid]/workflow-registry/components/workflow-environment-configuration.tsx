/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { FieldErrors, useForm, UseFormWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { Cog, FileX } from 'lucide-react';
import { Button, EnvironmentConfiguration, LoadingPlaceholder } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import {
    FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS,
    FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER,
    FIELD_TYPE_REGION,
    FIELD_TYPE_SECRETS,
    FIELD_TYPES_TEXT,
} from '@/constants';
import { useAuth } from '@/context';
import { IWorkflowEnvironmentVariableResponse } from '@/models';
import {
    FieldMeta,
    WorkflowEnvConfigFieldForm,
    WorkflowEnvConfigFormBase,
    WorkflowEnvConfigItemForm,
} from '@/models/workflow-pull.model';
import { registryService } from '@/services';
import { QueryKeyType } from '@/enums';

interface WorkflowEnvironmentConfigurationProps {
    open: boolean;
    artifactPath: string | null;
    artifactVersion: string | null;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const mapEnvironmentVariables = (data: WorkflowEnvConfigItemForm[]): WorkflowEnvConfigItemForm[] => {
    const generateAsVariable = (itemName: string, name: string) => {
        if (!itemName || !name) return '';

        const sanitize = (value: string) => {
            return (
                value
                    ?.toUpperCase()
                    .replaceAll(/[^A-Z0-9]/g, '_')
                    .replaceAll(/_+/g, '_')
                    .replaceAll(/^_+|_+$/g, '') ?? ''
            );
        };

        const sanitizedItem = sanitize(itemName);
        const sanitizedName = sanitize(name);

        if (!sanitizedName) return '';

        const MAX_LENGTH = 180;

        const reservedLength = sanitizedName.length + 1;

        const maxItemLength = MAX_LENGTH - reservedLength;

        let finalItemPart = sanitizedItem;

        if (maxItemLength <= 0) {
            const truncatedName = sanitizedName.substring(0, MAX_LENGTH);
            return `\${${truncatedName}}`;
        }

        if (sanitizedItem.length > maxItemLength) {
            finalItemPart = sanitizedItem.substring(0, maxItemLength);
            finalItemPart = finalItemPart.replaceAll(/_+$/g, '');
        }

        const result = `${finalItemPart}_${sanitizedName}`.replaceAll(/_+/g, '_').replaceAll(/^_+|_+$/g, '');

        return `\${${result}}`;
    };

    return (
        data?.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            fields: item.fields.map((f: WorkflowEnvConfigFieldForm) => {
                const generatedVariable = generateAsVariable(item.name, f.name)?.trim();

                return {
                    name: f.name,
                    meta: {
                        // copy the meta object fully
                        ...f.meta,
                        initFinalValue: f.meta.finalValue,
                        finalValue: generatedVariable,
                        finalValueOption: { label: generatedVariable, value: generatedVariable },
                        originalValue: generatedVariable,
                    } as FieldMeta,
                    readOnly: false,
                };
            }),
            reference: item.reference,
        })) ?? []
    );
};

export const generateRecordsFromItem = (item: WorkflowEnvConfigItemForm): IWorkflowEnvironmentVariableResponse[] => {
    return (
        item?.fields?.map(
            x =>
                ({
                    key: `${item.id}__${x.name}`,
                    value: x?.meta?.finalValue,
                    name: item.name,
                    type: item.type,
                    reference: item.reference ?? '',
                    is_secret:
                        FIELD_TYPE_SECRETS.includes(x.name) ||
                        (FIELD_TYPES_TEXT.includes(x.name) && item?.type === 'database' && x?.name === 'userName') ||
                        x?.name.startsWith('header--'),
                }) as IWorkflowEnvironmentVariableResponse
        ) ?? []
    );
};

export const useVariableAccordionValidationState = (
    configs: WorkflowEnvConfigFormBase['configs'] | undefined,
    watch: UseFormWatch<WorkflowEnvConfigFormBase>,
    errors: FieldErrors<WorkflowEnvConfigFormBase>
) => {
    if (!configs) return [];

    return configs.map((config, configIndex) => {
        let configuredCount = 0;
        let hasErrors = false;
        const fieldType = watch(`configs.${configIndex}.type`);

        config.fields.forEach((_, fieldIndex) => {
            const fieldName = watch(`configs.${configIndex}.fields.${fieldIndex}.name`);
            let value = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`);
            let error = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValue;

            if (
                FIELD_TYPE_REGION.includes(fieldName) ||
                (FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker') ||
                (FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails')
            ) {
                value = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValueOption.value`);
                error = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValueOption as any;
            }

            const isConfigured = value !== '' && !error;

            if (isConfigured) configuredCount++;
            if (error) hasErrors = true;
        });

        return {
            configuredCount,
            total: config.fields.length,
            hasErrors,
        };
    });
};

export const WorkflowEnvironmentConfiguration = ({
    open,
    artifactPath,
    artifactVersion,
    setOpen,
}: WorkflowEnvironmentConfigurationProps) => {
    const params = useParams();
    const { token } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const {
        watch,
        formState: { errors },
        control,
        trigger,
        reset,
        register,
        getValues,
        setValue,
    } = useForm<WorkflowEnvConfigFormBase>({
        mode: 'all',
        defaultValues: {
            configs: [],
        },
    });
    const configs = watch('configs');
    const accordionStats = useVariableAccordionValidationState(configs, watch, errors);

    useEffect(() => {
        if (!open) {
            reset({ configs: undefined });
            setLoading(false);
            setCopied(false);
        }
    }, [open, setLoading, setCopied]);

    const { isFetching, data: variables } = useQuery(
        [QueryKeyType.WORKFLOW_ENVIRONMENT_VARIABLES, artifactPath, artifactVersion],
        () =>
            registryService.environmentVariables(
                params.wid as string,
                artifactPath as string,
                artifactVersion as string
            ),
        {
            enabled: !!token && open,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                const mappedData = mapEnvironmentVariables(data?.environmentVariables);
                reset({ configs: mappedData });
                setTimeout(async () => {
                    await trigger('configs');
                }, 100);
            },
            onError: error => {
                console.error('Error fetching:', error);
            },
        }
    );

    const onCopyClick = async () => {
        const arr: IWorkflowEnvironmentVariableResponse[] = [];
        const data = getValues()?.configs;

        try {
            setLoading(true);
            data?.forEach(item => {
                const results = generateRecordsFromItem(item);
                arr.push(...results);
            });

            const formattedText = arr
                .map(
                    item =>
                        `    - key: ${item.key}\n      value: ${item.value}\n      item_name: ${item.name}\n      type: ${item.type}\n      reference: ${item.reference}\n      is_secret: ${item.is_secret}`
                )
                .join('\n\n');

            const output = `- workflow_id: "${variables?.workflowId}"\n  workflow_name: "${variables?.workflowName}"\n  description: "${variables?.description}"\n  artifact_name: "${variables?.artifactName ?? ''}"\n  version: "${variables?.artifactVersion}"\n  target_workspace_name: ""\n  priority: 1
            \n  env_overrides:\n${formattedText}`;

            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-none w-[calc(100vw-800px)]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex items-center gap-2">
                            <Cog />
                            <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    Environment Configuration
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Configure environment values and copy the YAML output
                                </p>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col h-[calc(100vh-300px)] overflow-y-auto">
                        {isFetching ? (
                            <LoadingPlaceholder text="Please wait! loading the environment variable data for you..." />
                        ) : (
                            <>
                                {configs?.length > 0 ? (
                                    configs.map((item, index) => {
                                        const { configuredCount, total, hasErrors } = accordionStats[index];

                                        return (
                                            <div
                                                key={(item as { name?: string })?.name ?? `config-${index}`}
                                                className="flex flex-col gap-3 px-1 py-1"
                                            >
                                                <EnvironmentConfiguration
                                                    fieldCount={total}
                                                    configuredCount={configuredCount}
                                                    hasErrors={hasErrors}
                                                    config={item}
                                                    errors={errors}
                                                    control={control}
                                                    configIndex={index}
                                                    register={register}
                                                    watch={watch}
                                                    setValue={setValue}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                            No environment configurations found
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <div className="relative inline-block">
                        <Button size="sm" disabled={loading} onClick={onCopyClick}>
                            {loading ? 'Generating' : 'Copy'}
                        </Button>
                        {copied && (
                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                                style={{ zIndex: 10 }}
                            >
                                Copied!
                            </div>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
