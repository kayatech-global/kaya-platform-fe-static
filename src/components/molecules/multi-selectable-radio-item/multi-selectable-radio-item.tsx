'use client';
import { Label } from '@/components/atoms';
import { cn } from '@/lib/utils';
import React from 'react';

interface MultiSelectableRadioItemProps {
    id: string;
    label: string;
    description: string;
    isChecked: boolean;
    imagePath: string;
    handleClick?: () => void;
    imageClassname?: string;
}

export const MultiSelectableRadioItem = ({
    label,
    description,
    isChecked,
    imagePath,
    handleClick,
    imageClassname,
}: MultiSelectableRadioItemProps) => {
    return (
        <button
            type="button"
            className={cn('radio-selectable-item p-2 flex gap-x-[10px] rounded-lg cursor-pointer hover:bg-gray-600 w-full text-left', {
                'bg-[rgba(97,148,250,0.2)] hover:bg-[rgba(97,148,250,0.2)]': isChecked,
            })}
            onClick={() => handleClick?.()}
        >
            <img src={imagePath} alt={label} className={cn('h-[59px]', imageClassname)} />
            <div className="flex w-full flex-col">
                <Label className="text-sm font-medium text-gray-100">{label}</Label>
                <p className="text-sm font-normal text-gray-300">{description}</p>
            </div>
            <div className="h-full self-center justify-center">
                {isChecked ? (
                    <i className="ri-checkbox-circle-fill text-[20px] text-blue-600" />
                ) : (
                    <i className="ri-circle-line text-[20px]" />
                )}
            </div>
        </button>
    );
};
