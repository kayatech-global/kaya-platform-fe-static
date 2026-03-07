import { cn } from '@/lib/utils';
import React from 'react';

interface ISmallSpinnerProps {
    classNames?: string;
}

export const Spinner = () => {
    return <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>;
};

export const SmallSpinner = ({ classNames }: ISmallSpinnerProps) => {
    return (
        <div
            className={cn(
                'w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin shrink-1 absolute right-[14px]',
                classNames
            )}
        ></div>
    );
};
