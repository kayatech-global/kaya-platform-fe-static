'use client';

import { cn } from '@/lib/utils';
import { ExecutionStepBadgeType } from '@/enums/component-type';

type ExecutionStepBadgeProps = {
    score: number;
    type: ExecutionStepBadgeType;
};

const getStatusColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', label: 'Passed' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', label: 'Warning' };
    return { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-200', label: 'Failed' };
};

export const ExecutionStepBadge = ({ score, type }: ExecutionStepBadgeProps) => {
    const statusColor = getStatusColor(score);

    if (type === ExecutionStepBadgeType.Score) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                <span className="text-[11px] font-semibold">{score}/100</span>
            </div>
        );
    }

    return (
        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border', statusColor.bg, statusColor.border)}>
            <div className={cn('w-1.5 h-1.5 rounded-full bg-current', statusColor.text)} />
            <span className={cn('text-[11px] font-bold', statusColor.text)}>{statusColor.label}</span>
        </div>
    );
};
