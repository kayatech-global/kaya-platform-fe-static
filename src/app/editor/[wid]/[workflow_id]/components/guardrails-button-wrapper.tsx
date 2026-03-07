import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { cn } from '@/lib/utils';
import React from 'react';

interface IGuardrailsButtonWrapper {
    onGuardrail: () => void;
    isReadOnly: boolean | undefined;
    supportDropdown?: boolean;
}

export const GuardrailsButtonWrapper = ({
    onGuardrail,
    isReadOnly,
    supportDropdown = false,
}: IGuardrailsButtonWrapper) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {supportDropdown ? (
                        <button
                            type="button"
                            disabled={isReadOnly}
                            className={cn(
                                'flex items-center gap-x-2 border-0 bg-transparent p-0',
                                {
                                    'cursor-not-allowed opacity-50': isReadOnly,
                                }
                            )}
                            onClick={isReadOnly ? undefined : onGuardrail}
                        >
                            <i className="ri-lock-line text-lg stroke-1 text-gray-700 dark:text-gray-300" />
                            <span>Guardrail Setup</span>
                        </button>
                    ) : (
                        <button
                            className={cn(
                                'bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700',
                                'rounded flex items-center px-2 py-1 gap-x-2',
                                'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200',
                                'dark:disabled:bg-gray-900 dark:disabled:text-gray-600 dark:disabled:border-gray-800'
                            )}
                            onClick={onGuardrail}
                            disabled={isReadOnly}
                        >
                            <i className="ri-lock-line text-xs text-gray-700 dark:text-gray-300" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Guardrail Setup</p>
                        </button>
                    )}
                </TooltipTrigger>
                {isReadOnly && (
                    <TooltipContent side="right" align="center">
                        {isReadOnly ? '' : "You don't have permission to setup the guardrail"}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};
