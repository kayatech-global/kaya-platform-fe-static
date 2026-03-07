/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

export type valuesProps = {
    imagePath: string;
    title: string;
    titleTooltip?: string;
    description: string;
    descriptionTooltip?: string;
    descriptionTagTitle?: string;
    tag?: ReactNode;
    info?: ReactNode;
};

interface DetailItemInputProps {
    label: string;
    imagePath: string;
    imageWidth: string;
    description: string;
    footer: ReactNode;
    values: valuesProps[] | undefined;
    imageType: 'png' | 'svg';
    other?: ReactNode;
    labelClassName?: string;
    hideDescription?: boolean;
}

export const DetailItemInput = ({
    label,
    imagePath,
    imageWidth,
    description,
    footer,
    values,
    imageType,
    other,
    labelClassName,
    hideDescription = false,
}: DetailItemInputProps) => {
    const EmptyStateDisplay = () => {
        if (other) {
            return (
                <div className="p-2 flex flex-col gap-y-3">
                    <div className="flex gap-x-[10px] items-start justify-start">
                        <img src={imagePath ?? '/png/api.png'} alt="api_image" width={40} />
                        <div className="flex flex-col items-start">{other}</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-y-[10px] items-center">
                <img src={imagePath} width={imageWidth} alt="placeholder_illustration" />
                <div className={cn('flex flex-col gap-y-1 items-center', { hidden: hideDescription })}>
                    <p className="text-center text-xs font-normal">{description}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="modal-single-input flex flex-col gap-y-[10px]">
            <p className={labelClassName ?? 'text-md font-medium text-gray-700 dark:text-gray-100'}>{label}</p>
            {values !== undefined ? (
                <div className="p-2 flex flex-col gap-y-3">
                    {values?.map((v, index) => {
                        return (
                            <div key={v.title ?? `value-${index}`} className="flex gap-x-[10px] items-start justify-start">
                                {imageType === 'png' ? (
                                    <img src={v.imagePath} alt="paksdd" width={40} />
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: v.imagePath }} />
                                )}
                                <div className="flex flex-col items-start">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100" title={v.titleTooltip ?? v.title}>{v.title}</p>
                                    <p
                                        className="text-sm font-regular text-gray-500 dark:text-gray-300"
                                        title={v.descriptionTooltip ?? v.descriptionTagTitle ?? v.description}
                                    >
                                        {v.description} {v.tag ?? ''}
                                    </p>
                                    {v.info}
                                </div>
                            </div>
                        );
                    })}
                    {values !== undefined && other && <div className="ml-[52px]">{other}</div>}
                    {values !== undefined && <div className="w-full flex justify-center">{footer}</div>}
                </div>
            ) : (
                <EmptyStateDisplay />
            )}
            {values === undefined && <div className="w-full flex justify-center">{footer}</div>}
        </div>
    );
};
