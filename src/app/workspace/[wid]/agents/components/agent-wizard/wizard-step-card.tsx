'use client';

import { cn } from '@/lib/utils';

interface WizardStepCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const WizardStepCard = ({
    title,
    description,
    icon,
    children,
    className,
}: WizardStepCardProps) => {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Step Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                {icon && (
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <div className="text-blue-600 dark:text-blue-400">
                            {icon}
                        </div>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Step Content */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

interface WizardFieldGroupProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const WizardFieldGroup = ({
    title,
    description,
    children,
    className,
}: WizardFieldGroupProps) => {
    return (
        <div className={cn(
            'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700',
            className
        )}>
            {(title || description) && (
                <div className="mb-4">
                    {title && (
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {title}
                        </h4>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

interface WizardSectionDividerProps {
    label?: string;
}

export const WizardSectionDivider = ({ label }: WizardSectionDividerProps) => {
    return (
        <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            {label && (
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {label}
                </span>
            )}
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
    );
};

export default WizardStepCard;
