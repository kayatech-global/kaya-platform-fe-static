'use client';
import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { AlertVariant } from '@/enums/component-type';

interface DetailAlertProps {
    variant?: AlertVariant;
    title?: string;
    message: string | React.ReactNode;
    details?: React.ReactNode;
    className?: string;
}

const VARIANT_STYLES = {
    [AlertVariant.Info]: {
        container: 'bg-blue-50 dark:bg-gray-900 border-blue-300 dark:border-blue-700',
        icon: 'text-blue-600 dark:text-blue-600',
        text: 'text-gray-800 dark:text-blue-100',
        Icon: Info,
    },
    [AlertVariant.Warning]: {
        container: 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700',
        icon: 'text-amber-600 dark:text-amber-600',
        text: 'text-amber-600 dark:text-amber-600',
        Icon: AlertTriangle,
    },
    [AlertVariant.Success]: {
        container: 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700',
        icon: 'text-green-600 dark:text-green-600',
        text: 'text-green-600 dark:text-green-600',
        Icon: CheckCircle,
    },
    [AlertVariant.Error]: {
        container: 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700',
        icon: 'text-red-600 dark:text-red-600',
        text: 'text-red-600 dark:text-red-600',
        Icon: XCircle,
    },
};

export const DetailAlert = ({ variant = AlertVariant.Info, title, message, details, className = '' }: DetailAlertProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const styles = VARIANT_STYLES[variant];
    const IconComponent = styles.Icon;

    return (
        <div
            className={cn(
                'flex flex-col rounded-md border py-2 px-3 transition-all duration-200 ',
                styles.container,
                className
            )}
        >
            <div className="flex items-start gap-3">
                <IconComponent className={cn('shrink-0 mt-[2px]', styles.icon)} size={20} />
                <div className="flex-1">
                    {title && <h5 className={cn('mb-1 font-medium', styles.text)}>{title}</h5>}
                    <div className={cn('text-sm mt-[2px]', styles.text, title ? 'opacity-90' : '')}>{message}</div>
                </div>
                {details && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            'h-6 px-2 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10',
                            styles.text
                        )}
                    >
                        {isExpanded ? 'Hide Guide' : 'View Guide'}
                        {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>
                )}
            </div>

            {details && (
                <div
                    className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isExpanded ? 'mt-3 pb-3 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className={cn('ml-8 text-sm border-t border-black/5 dark:border-white/5 pt-3', styles.text)}>
                        {details}
                    </div>
                </div>
            )}
        </div>
    );
};
