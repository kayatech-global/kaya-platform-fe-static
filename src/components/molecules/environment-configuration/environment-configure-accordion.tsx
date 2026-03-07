/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
    Badge,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { cn, isNullOrEmpty, propertyToTitle } from '@/lib/utils';
import { WorkflowEnvConfigFormBase, WorkflowEnvConfigItemForm } from '@/models/workflow-pull.model';
import { ChevronDown, Info } from 'lucide-react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { EnvironmentConfigFieldMapper } from '../workflow-configure/environment-config-field-mapper';
import { getArticle } from '@/utils/string-helpers';

interface EnvironmentConfigurationProps {
    fieldCount: number;
    configuredCount: number;
    hasErrors: boolean;
    config: WorkflowEnvConfigItemForm;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    configIndex: number;
    control: Control<WorkflowEnvConfigFormBase, any>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
}

export const EnvironmentConfiguration = ({
    fieldCount,
    configuredCount,
    hasErrors,
    config,
    errors,
    configIndex,
    control,
    register,
    watch,
    setValue,
}: EnvironmentConfigurationProps) => {
    const [open, setOpen] = useState<boolean>(configIndex === 0);
    const paths = config?.fields?.flatMap(x => x?.meta?.paths ?? []) ?? [];

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="dark:border-gray-700 border border-border rounded-md bg-muted/40"
        >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="max-w-[40%] text-start text-sm font-semibold break-all text-gray-900 dark:text-gray-100">
                        {isNullOrEmpty(config.name) ? 'N/A' : config.name}
                    </span>
                    {!isNullOrEmpty(config.type) && (
                        <Badge variant="default" size="sm" className="rounded-full text-xs px-2 py-0.5">
                            {config.type}
                        </Badge>
                    )}
                    {!isNullOrEmpty(config.reference) && (
                        <Badge variant="success" size="sm" className="rounded-full text-xs px-2 py-0.5">
                            {config.reference}
                        </Badge>
                    )}
                    {paths?.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="cursor-help p-0.5 bg-transparent border-none"
                                        onClick={e => e.stopPropagation()}
                                        aria-label="Path information"
                                    >
                                        <Info
                                            size={12}
                                            className="text-gray-400 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <div className="text-xs space-y-1 max-h-[150px] overflow-y-auto">
                                        <p className="font-semibold mb-2 text-gray-700 dark:text-gray-100">
                                            Paths where this value will be used:
                                        </p>
                                        {paths?.map((path, idx) => (
                                            <p key={`path-${idx}-${path}`} className="font-normal text-gray-400">
                                                {path}
                                            </p>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <span
                        className={cn('text-xs ml-1', {
                            'text-red-500': hasErrors,
                            'text-green-600': configuredCount === fieldCount,
                            'text-gray-700 dark:text-gray-400': !hasErrors && configuredCount !== fieldCount,
                        })}
                    >
                        {configuredCount}/{fieldCount} filled
                    </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>

            <CollapsibleContent forceMount className="px-3 pb-3 pt-4 data-[state=closed]:hidden">
                <div className="space-y-4">
                    {config?.fields?.map((field, index) => {
                        const isHeaderValue = field?.name?.startsWith('header--');
                        const cleanValue = field?.name?.replace(/^header--/, '');
                        const placeholderName = `${getArticle(cleanValue?.toLocaleLowerCase())} ${propertyToTitle(cleanValue)}`;
                        const propertyName = `${getArticle(cleanValue?.toLocaleLowerCase())} ${propertyToTitle(cleanValue, true)}`;

                        return (
                            <div key={field?.name ?? `field-${index}`} className="flex gap-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 w-[160px] flex-shrink-0 mt-2">
                                    {field?.name?.replace(/^header--/, '')}
                                </p>
                                <EnvironmentConfigFieldMapper
                                    fieldIndex={index}
                                    configIndex={configIndex}
                                    errors={errors}
                                    control={control}
                                    defaultPlaceholder={`Enter ${isHeaderValue ? cleanValue : placeholderName}`}
                                    defaultPropertyName={isHeaderValue ? cleanValue : propertyName}
                                    watch={watch}
                                    register={register}
                                    setValue={setValue}
                                    value={watch(`configs.${configIndex}.fields.${index}.meta.finalValue`)}
                                />
                            </div>
                        );
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
