'use client';

import React, { useState } from 'react';
import { Button, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { SelectableType } from '@/enums';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';

interface SelectableRadioItemProps {
    id: string;
    label: string;
    labelTitle?: string;
    description: string;
    isChecked: boolean;
    imagePath: string | React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    handleClick?: Function;
    imageClassname?: string;
    imageType?: 'png' | 'svg' | 'component';
    expandDetails?: string;
    expandTriggerName?: string;
    title?: string;
    hasEdit?: boolean;
    hasDelete?: boolean;
    type?: SelectableType;
    disabled?: boolean;
    isReadOnly?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const SelectableRadioItem = ({
    id,
    label,
    labelTitle,
    description,
    isChecked,
    imagePath,
    handleClick,
    imageClassname,
    imageType = 'png',
    expandDetails,
    expandTriggerName,
    title,
    hasEdit = true,
    hasDelete = false,
    type,
    disabled = false,
    isReadOnly,
    onEdit,
    onDelete,
}: SelectableRadioItemProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [expandMoreDetails, setExpandMoreDetails] = useState(false);

    const onEditClick = () => {
        if (onEdit) {
            onEdit(id);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(id);
            setOpen(false);
        }
    };

    const promptFormatter = (value: string) => {
        if (value) {
            return value.replace(/{{|}}/g, '');
        }
        return value;
    };

    const onSelect = () => {
        if (!disabled) {
            handleClick?.();
        }
    };

    return (
        <>
            <div
                className={cn(
                    'rounded-lg cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col gap-y-2',
                    {
                        'bg-[rgba(97,148,250,0.2)] hover:bg-[rgba(97,148,250,0.2)]': isChecked,
                        'opacity-70 hover:!bg-[rgba(97,148,250,0.2)]': disabled,
                    }
                )}
            >
                <button type="button" className={cn('radio-selectable-item flex gap-x-[10px] w-full text-left bg-transparent border-none cursor-pointer')} onClick={onSelect}>
                    {(() => {
                        if (imageType === 'png' && typeof imagePath === 'string') {
                            return <img src={imagePath} alt={label} className={cn('h-[59px]', imageClassname)} />;
                        }
                        if (typeof imagePath === 'string') {
                            return <div dangerouslySetInnerHTML={{ __html: imagePath }} />;
                        }
                        return imagePath;
                    })()}
                    <div className="flex w-full flex-col">
                        <Label
                            className="text-sm font-medium text-gray-700 dark:text-gray-100"
                            title={labelTitle ?? label}
                        >
                            {label}
                        </Label>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-300">{description}</p>
                    </div>
                    <div className="h-full self-center justify-center">
                        {isChecked ? (
                            <i className="ri-checkbox-circle-fill text-[20px] text-blue-600" />
                        ) : (
                            <i className="ri-circle-line text-[20px]" />
                        )}
                    </div>
                    {hasDelete && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn('bg-transparent border-none p-0 inline-flex', {
                                            'text-gray-300 cursor-not-allowed dark:text-gray-600': isReadOnly,
                                            'text-gray-500 cursor-pointer dark:text-gray-200': !isReadOnly,
                                        })}
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (isReadOnly) return;
                                            setOpen(true);
                                        }}
                                        aria-label={`Delete ${title ?? ''}`.trimEnd()}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center">
                                    {`Delete ${title ?? ''}`.trimEnd()}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {hasEdit && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-500 cursor-pointer dark:text-gray-200 bg-transparent border-none p-0 inline-flex"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onEditClick();
                                        }}
                                        aria-label={`Edit ${title ?? ''}`.trimEnd()}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center">
                                    {`Edit ${title ?? ''}`.trimEnd()}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </button>
                {expandDetails && (
                    <div className="w-full flex flex-col gap-y-3 ">
                        <button
                            type="button"
                            className="flex w-full items-center gap-x-2 bg-transparent border-none cursor-pointer text-left"
                            onClick={() => setExpandMoreDetails(!expandMoreDetails)}
                        >
                            <Button variant="link" size="sm">
                                {expandTriggerName}
                            </Button>
                            {expandMoreDetails ? (
                                <ChevronUp size={16} className="text-blue-500" />
                            ) : (
                                <ChevronDown size={16} className="text-blue-500" />
                            )}
                        </button>
                        {expandMoreDetails && (
                            <div className="px-1 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                                <p className="text-sm font-normal text-gray-700 dark:text-gray-300">
                                    {type === SelectableType.PROMPT ? promptFormatter(expandDetails) : expandDetails}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {hasDelete && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="overflow-y-auto max-h-[80%]">
                        <DialogHeader>
                            <DialogTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure, do you want to delete this?
                                </p>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 p-3">
                            <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                                No
                            </Button>
                            <Button variant={'primary'} size="sm" onClick={handleDelete}>
                                Yes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
