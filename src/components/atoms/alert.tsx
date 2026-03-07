import React from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AlertVariant } from '@/enums/component-type';

interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    message: string | React.ReactNode;
    className?: string;
    noBorder?: boolean;
    noBackground?: boolean;
    small?: boolean;
}

const VARIANT_STYLES = {
    [AlertVariant.Info]: {
        container: 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700',
        icon: 'text-blue-600 dark:text-blue-600',
        text: 'text-blue-600 dark:text-blue-600',
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
        icon: 'text-red-500 dark:text-red-500',
        text: 'text-red-500 dark:text-red-500',
        Icon: XCircle,
    },
};

export const Alert = ({
    variant = AlertVariant.Info,
    title,
    message,
    className = '',
    noBorder = false,
    noBackground = false,
    small = false,
}: AlertProps) => {
    const styles = VARIANT_STYLES[variant];
    const IconComponent = styles.Icon;

    const gapSize = small ? 'gap-2' : 'gap-3';
    const containerClasses = `flex items-start ${gapSize} p-4 rounded-lg ${noBackground ? '' : styles.container} ${
        noBorder ? '' : 'border'
    } ${className}`;

    const iconSize = small ? 16 : 20;
    const textSize = small ? 'text-xs' : 'text-sm';

    return (
        <div className={containerClasses}>
            <IconComponent className={`${styles.icon} flex-shrink-0 mt-0.5`} size={iconSize} />
            <div className="flex-1">
                {title && <h5 className={`font-medium mb-1 ${styles.text}`}>{title}</h5>}
                <div className={`${textSize} ${styles.text} ${title ? 'opacity-90' : ''}`}>{message}</div>
            </div>
        </div>
    );
};
