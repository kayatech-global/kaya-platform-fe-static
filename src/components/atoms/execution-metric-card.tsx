'use client';

import { LucideIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { ReactNode } from 'react';

type ExecutionMetricCardProps = {
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    title: string;
    value: string | number;
    subtitle?: ReactNode;
    tooltip?: string;
};

export const ExecutionMetricCard = ({
    icon: Icon,
    iconColor,
    bgColor,
    title,
    value,
    subtitle,
    tooltip,
}: ExecutionMetricCardProps) => {
    return (
        <div className={`flex flex-col gap-1 items-center ${bgColor} p-3 rounded-md`}>
            <div className="flex items-center gap-4 text-gray-500 mb-1">
                <Icon size={60} className={iconColor} />
                <div className="flex flex-col justify-start">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase">{title}</span>
                        {tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info size={14} className="text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>{tooltip}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{value}</div>
                    {subtitle && <div className="text-[10px] text-gray-500">{subtitle}</div>}
                </div>
            </div>
        </div>
    );
};
