/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ElementProps = React.ComponentProps<'div'>;

interface DynamicObjectProps extends ElementProps {
    length: number;
    containerTop?: number;
    containerHeight?: number;
    children: React.ReactNode;
}

interface DynamicObjectBodyProps extends ElementProps {
    disabledAdd?: boolean;
    children: React.ReactNode;
    onAdd: () => void;
}

interface DynamicObjectFieldProps extends ElementProps {
    rowId: unknown;
    hiddenClose?: boolean;
    disabledClose?: boolean;
    forceValidation?: boolean;
    removeRow: (rowId: unknown) => void;
}

interface DynamicObjectFieldItemProps extends ElementProps {
    label?: string;
    helperInfo?: React.ReactNode;
    helperInfoWidthClass?: string;
    labelClassName?: string;
    iconClassName?: string;
    iconSize?: number;
    children: React.ReactNode;
}

const DynamicObject = React.forwardRef<HTMLDivElement, DynamicObjectProps>(
    ({ length, containerTop = 27, containerHeight = 40, children, className, ...props }, ref) => {
        if (!React.isValidElement(children) || children.type !== DynamicObjectBody) {
            throw new Error('[DynamicObject] Invalid child: Expected a single <DynamicObjectBody> as its only child.');
        }

        return (
            <div ref={ref} className={cn('relative', className)} {...props}>
                {length > 0 && (
                    <div
                        className="absolute left-[0px] w-[1px] bg-gray-400 z-0"
                        style={{
                            top: containerTop, // distance from the top to align with start-line
                            height: `calc(100% - ${containerHeight}px)`, // subtract top and bottom paddings/margins (adjust as needed)
                        }}
                    />
                )}
                {children}
            </div>
        );
    }
);
DynamicObject.displayName = 'DynamicObject';

const DynamicObjectBody = React.forwardRef<HTMLDivElement, DynamicObjectBodyProps>(
    ({ children, className, disabledAdd, onAdd, ...props }, ref) => {
        const childrenArray = React.Children.toArray(children);

        const allValid = childrenArray.every(
            child =>
                React.isValidElement(child) &&
                (child.type === DynamicObjectField || (child as React.ReactElement & { type?: { displayName?: string } }).type?.displayName === 'DynamicObjectField')
        );

        if (!allValid) {
            throw new Error('[DynamicObjectBody] Invalid child: Expected one or more <DynamicObjectField> components.');
        }

        return (
            <>
                <div ref={ref} className={cn('flex flex-col w-full gap-y-[22px] relative z-10', className)} {...props}>
                    {children}
                </div>
                <div className="mt-[22px] flex items-center relative z-10">
                    <div className="end-line w-[10px] bg-gray-400 h-[1px]" />
                    <button
                        className="min-h-7 dark:bg-gray-700 border dark:border-gray-600 bg-blue-600 border-blue-600 text-white py-1 px-2 rounded text-xs active:scale-95 transition-transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabledAdd}
                        onClick={onAdd}
                    >
                        + Add a set
                    </button>
                </div>
            </>
        );
    }
);
DynamicObjectBody.displayName = 'DynamicObjectBody';

const DynamicObjectField = React.forwardRef<HTMLDivElement, DynamicObjectFieldProps>(
    ({ hiddenClose, rowId, removeRow, className, children, forceValidation = true, disabledClose, ...props }, ref) => {
        const flatChildren = React.Children.toArray(children);

        const allValid = flatChildren.every(child => React.isValidElement(child) && child.type === DynamicObjectItem);

        if (!allValid && forceValidation) {
            throw new Error('[DynamicObjectField] Invalid child: Expected one or more <DynamicObjectItem> components.');
        }

        return (
            <div ref={ref} className={cn('w-full flex items-center relative', className)} {...props}>
                <div className="start-line w-[10px] bg-gray-400 h-[1px] z-10" />
                <div className="flex justify-between items-center gap-x-3 px-3 pt-1 pb-2 dark:bg-gray-900 border-gray-400 border dark:border-0 rounded w-full">
                    {forceValidation ? (
                        <div className="flex flex-wrap gap-x-3 w-full">{children}</div>
                    ) : (
                        <>{children}</>
                    )}
                    <Button
                        variant="semi-secondary"
                        size="icon"
                        className={cn(
                            'mt-3 disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed',
                            {
                                hidden: hiddenClose,
                            }
                        )}
                        disabled={disabledClose}
                    >
                        <X onClick={() => removeRow(rowId)} className="dark:text-gray-200 text-gray-500" size={14} />
                    </Button>
                </div>
            </div>
        );
    }
);
DynamicObjectField.displayName = 'DynamicObjectField';

const DynamicObjectItem = React.forwardRef<HTMLDivElement, DynamicObjectFieldItemProps>(
    (
        {
            label,
            helperInfo,
            labelClassName = 'text-[12px] font-normal flex items-baseline gap-x-1',
            helperInfoWidthClass = 'max-w-[250px]',
            iconClassName,
            iconSize = 10,
            children,
            className,
            ...props
        },
        ref
    ) => (
        <div ref={ref} className={cn('flex flex-col flex-1 gap-y-[2px]', className)} {...props}>
            {label && (
                <Label
                    className={cn(
                        'dark:text-white text-gray-700 font-normal flex items-center gap-x-1',
                        labelClassName
                    )}
                >
                    {label}
                    {helperInfo && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info size={iconSize} className={iconClassName} />
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center" className={helperInfoWidthClass}>
                                {helperInfo}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Label>
            )}
            {children}
        </div>
    )
);
DynamicObjectItem.displayName = 'DynamicObjectItem';

export { DynamicObject, DynamicObjectBody, DynamicObjectField, DynamicObjectItem };
