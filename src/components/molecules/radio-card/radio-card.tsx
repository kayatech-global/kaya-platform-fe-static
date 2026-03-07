'use client';

import { RadioGroupItem } from '@/components/atoms/radio-group';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import * as React from 'react';

interface RadioCardProps {
    value: string;
    label: string;
    description?: string;
    checked?: boolean;
    isInline?: boolean;
    disabled?: boolean;
    hideCheckCircle?: boolean;
    isSmallWidget?: boolean;
    labelClassName?: string;
    image?: React.ReactNode;
    alert?: React.ReactNode;
    descriptionClass?: string;
}

const RadioCard = ({
    value,
    label,
    description,
    checked = false,
    isInline = true,
    disabled = false,
    hideCheckCircle = false,
    isSmallWidget,
    labelClassName,
    image,
    alert,
    descriptionClass,
}: RadioCardProps) => {
    return (
        <div className="relative h-full">
            <RadioGroupItem disabled={disabled} id={value} value={value} className="peer sr-only" />
            <label
                htmlFor={value}
                className={cn('flex h-full rounded-lg border p-4 shadow-sm transition-all hover:shadow-md', {
                    'flex-row items-start gap-3': isInline,
                    'flex-col': !isInline,
                    'border-blue-400 bg-blue-100 ring-1 ring-blue-400 dark:border-blue-400 dark:bg-blue-50': checked,
                    'border-blue-200 bg-blue-50 dark:border-gray-700 dark:bg-gray-700': !checked,
                    'opacity-70 cursor-not-allowed': disabled,
                    'cursor-pointer hover:shadow-md': !disabled,
                    'flex-wrap': isSmallWidget,
                })}
            >
                {isInline ? (
                    <>
                        {/* Inline Layout */}
                        <div className="flex items-start gap-3 flex-1">
                            {!hideCheckCircle && (
                                <div
                                    className={cn(
                                        'relative flex h-5 w-5 items-center justify-center rounded-full border transition-all flex-shrink-0',
                                        {
                                            'border-blue-600 bg-blue-600': checked,
                                            'border-blue-400 bg-transparent dark:border-blue-400 dark:bg-gray-700':
                                                !checked,
                                        }
                                    )}
                                >
                                    <Check
                                        className={cn('h-3 w-3 text-white transition-opacity', {
                                            'opacity-100': checked,
                                            'opacity-0': !checked,
                                        })}
                                        strokeWidth={3}
                                    />
                                </div>
                            )}

                            <div className="flex flex-col flex-1 gap-3 h-[-webkit-fill-available] justify-between">
                                <div className="flex flex-col">
                                    <div
                                        className={cn('text-md font-semibold text-gray-900', {
                                            'dark:text-blue-400': checked,
                                            'dark:text-gray-100': !checked,
                                        })}
                                    >
                                        {label}
                                    </div>
                                    {description && (
                                        <div
                                            className={cn(
                                                'text-sm font-normal text-gray-700 pt-3',
                                                {
                                                    'dark:text-blue-400': checked,
                                                    'dark:text-gray-300': !checked,
                                                    'w-[80%] mt-1': !isSmallWidget,
                                                },
                                                descriptionClass
                                            )}
                                        >
                                            {description}
                                        </div>
                                    )}
                                </div>
                                {alert && !isSmallWidget && <div className="w-full">{alert}</div>}
                            </div>
                            {image && (
                                <div
                                    className={cn('flex items-center justify-center', {
                                        'ml-4': !isSmallWidget,
                                    })}
                                >
                                    {image}
                                </div>
                            )}
                        </div>
                        {alert && isSmallWidget && <div className="w-full">{alert}</div>}
                    </>
                ) : (
                    <>
                        {/* Stacked Layout */}
                        {!hideCheckCircle && (
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'relative flex h-5 w-5 items-center justify-center rounded-full border transition-all',
                                            {
                                                'border-blue-600 bg-blue-600': checked,
                                                'border-blue-400 bg-transparent dark:border-blue-400 dark:bg-gray-800':
                                                    !checked,
                                            }
                                        )}
                                    >
                                        <Check
                                            className={cn('h-3 w-3 text-white transition-opacity', {
                                                'opacity-100': checked,
                                                'opacity-0': !checked,
                                            })}
                                            strokeWidth={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pl-0 pt-2">
                            <div
                                className={cn(
                                    'text-sm font-semibold text-gray-900',
                                    {
                                        'dark:text-blue-400': checked,
                                        'dark:text-gray-100': !checked,
                                    },
                                    labelClassName
                                )}
                            >
                                {label}
                            </div>
                            {description && (
                                <div
                                    className={cn('text-xs font-normal text-gray-700 mt-2', {
                                        'dark:text-gray-900': checked,
                                        'dark:text-gray-400': !checked,
                                    })}
                                >
                                    {description}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </label>
        </div>
    );
};

export default RadioCard;
