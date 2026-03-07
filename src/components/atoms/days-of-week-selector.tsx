'use client';

import { DaysOfWeekType } from '@/enums';
import React, { useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface DaysOfWeekSelectorProps {
    label?: string;
    value?: DaysOfWeekType[];
    disabled?: boolean;
    onValueChange?: (days: DaysOfWeekType[]) => void;
}

const DAYS = [
    DaysOfWeekType.SUN,
    DaysOfWeekType.MON,
    DaysOfWeekType.TUE,
    DaysOfWeekType.WED,
    DaysOfWeekType.THU,
    DaysOfWeekType.FRI,
    DaysOfWeekType.SAT,
];

export const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
    label,
    value = [],
    disabled,
    onValueChange,
}) => {
    const [selected, setSelected] = useState<DaysOfWeekType[]>(value);

    const toggleDay = (day: DaysOfWeekType) => {
        const updated = selected.includes(day) ? selected.filter(d => d !== day) : [...selected, day];

        setSelected(updated);
        onValueChange?.(updated);
    };

    return (
        <div>
            {label && <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">{label}</Label>}
            <div
                className={cn('flex flex-wrap gap-2', {
                    'mt-2': !!label,
                })}
            >
                {DAYS.map(day => {
                    const isSelected = selected.includes(day);
                    return (
                        <Button
                            key={day}
                            onClick={() => toggleDay(day)}
                            size="sm"
                            disabled={disabled}
                            className={cn(
                                'bg-gray-400 border-gray-400 hover:!bg-gray-800 dark:bg-gray-500 dark:border-gray-500 focus:ring-0 focus:outline-none focus:ring-transparent',
                                {
                                    '!bg-blue-600 hover:!bg-blue-700': isSelected,
                                }
                            )}
                        >
                            {day}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};
