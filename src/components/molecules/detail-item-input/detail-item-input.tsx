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
    label?: string;
    imagePath: string;
    description: string;
    footer: ReactNode;
    values: valuesProps[] | undefined;
    imageType: 'png' | 'svg';
    other?: ReactNode;
    labelClassName?: string;
    hideDescription?: boolean;
}

/** Compact inline empty state with a summary ("other" content is provided) */
const EmptyStateWithOther = ({ imagePath, other }: { imagePath: string; other: ReactNode }) => (
    <div className="p-2 flex flex-col gap-y-3">
        <div className="flex gap-x-[10px] items-start justify-start">
            <img src={imagePath ?? '/png/api.png'} alt="api_image" width={40} />
            <div className="flex flex-col items-start">{other}</div>
        </div>
    </div>
);

/** Compact inline empty state — small icon + description side by side */
const EmptyStatePlaceholder = ({
    imagePath,
    description,
    hideDescription,
}: {
    imagePath: string;
    description: string;
    hideDescription: boolean;
}) => (
    <div className="flex items-start gap-x-3 py-1">
        <img
            src={imagePath}
            width={36}
            alt="placeholder_illustration"
            className="shrink-0 mt-0.5 opacity-60"
        />
        <div className={cn('flex flex-col gap-y-1', { hidden: hideDescription })}>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);

export const DetailItemInput = ({
    label,
    imagePath,
    description,
    footer,
    values,
    imageType,
    other,
    labelClassName,
    hideDescription = false,
}: DetailItemInputProps) => {
    return (
        <div className="modal-single-input flex flex-col gap-y-[10px]">
            {label && (
                <p className={labelClassName ?? 'text-md font-medium text-gray-700 dark:text-gray-100'}>{label}</p>
            )}
            {values !== undefined ? (
                <div className="p-2 flex flex-col gap-y-3">
                    {values?.map((v, index) => (
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
                    ))}
                    {values !== undefined && other && <div className="ml-[52px]">{other}</div>}
                    {values !== undefined && <div className="w-full flex justify-center">{footer}</div>}
                </div>
            ) : other ? (
                <EmptyStateWithOther imagePath={imagePath} other={other} />
            ) : (
                <EmptyStatePlaceholder
                    imagePath={imagePath}
                    description={description}
                    hideDescription={hideDescription}
                />
            )}
            {values === undefined && (
                <div className="w-full flex justify-start">{footer}</div>
            )}
        </div>
    );
};
