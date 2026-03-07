import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { truncate } from 'lodash';

interface TruncateCellProps {
    value: string;
    length: number;
    className?: string;
    isDefault?: boolean;
    side?: 'left' | 'top' | 'right' | 'bottom';
    align?: 'center' | 'start' | 'end';
}

export const TruncateCell = ({
    value,
    length,
    className,
    isDefault = true,
    side = 'left',
    align = 'center',
}: TruncateCellProps) => {
    return (
        <>
            {isDefault ? (
                <p
                    {...(value?.length > length && {
                        title: value,
                    })}
                    {...(className && {
                        className,
                    })}
                >
                    {truncate(value, { length })}
                </p>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p
                                {...(className && {
                                    className,
                                })}
                            >
                                {truncate(value, { length })}
                            </p>
                        </TooltipTrigger>
                        {value?.length > length && (
                            <TooltipContent side={side} align={align}>
                                {value}
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
    );
};
