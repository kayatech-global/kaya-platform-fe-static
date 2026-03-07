import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type EditorButtonProps = {
    /**
     * Icon can be:
     * - Remix icon class (string starting with "ri-")
     * - Image path (.png, .svg, .jpg)
     * - Lucide icon component (either <Save /> or Save)
     * - Custom React node (inline SVG)
     */
    icon?: string | LucideIcon | React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    children: React.ReactNode; // Label or any JSX content
    textClassName?: string;
};

const EditorButton: React.FC<EditorButtonProps> = ({
    children,
    icon,
    onClick,
    variant = 'primary',
    disabled = false,
    textClassName,
}) => {
    const baseStyles = 'rounded flex items-center px-2 py-1 gap-x-2 text-xs font-semibold transition-all duration-200';

    const primaryStyles =
        'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed';

    const secondaryStyles = cn(
        'bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700',
        'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200',
        'dark:disabled:bg-gray-900 dark:disabled:text-gray-600 dark:disabled:border-gray-800'
    );

    const renderIcon = () => {
        if (!icon) return null;

        // Case 1: Remix icon (string)
        if (typeof icon === 'string' && icon.startsWith('ri-')) {
            return <i className={`text-xs text-gray-700 ${icon}`} />;
        }

        // Case 2: Image path (png/jpg/svg)
        if (typeof icon === 'string' && (icon.endsWith('.png') || icon.endsWith('.svg') || icon.endsWith('.jpg'))) {
            return <img src={icon} alt="" className="w-3.5 h-3.5 object-contain" />;
        }

        // Case 3: Lucide icon component (function reference)
        if (typeof icon === 'function') {
            const LucideComp = icon as LucideIcon;
            return <LucideComp size={14} strokeWidth={2} />;
        }

        // Case 4: React element (inline SVG or Lucide JSX)
        if (React.isValidElement(icon)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const element = icon as React.ReactElement<any>;
            return React.cloneElement(element, {
                className: cn('w-3.5 h-3.5', element.props?.className),
                size: element.props?.size ?? 14,
                strokeWidth: element.props?.strokeWidth ?? 2,
            });
        }

        return null;
    };

    return (
        <button
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={cn(baseStyles, variant === 'primary' ? primaryStyles : secondaryStyles)}
        >
            {renderIcon()}
            <span className={cn('text-xs text-gray-700 dark:text-gray-300 font-semibold', textClassName)}>
                {children}
            </span>
        </button>
    );
};

export default EditorButton;
