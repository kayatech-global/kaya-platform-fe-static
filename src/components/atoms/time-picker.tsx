/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import TimePickerLib from 'react-time-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { Input } from './input';
import { cn } from '@/lib/utils';
import 'react-time-picker/dist/TimePicker.css';
import './styles/time-picker-overrides.css';

interface TimePickerProps extends React.ComponentProps<'input'> {
    value?: string;
    label?: string;
    placeholder?: string;
    triggerInputClassName?: string;
    isDestructive?: boolean;
    supportiveText?: string;
    onValueChange?: (time: any) => void;
}

export const TimePicker = (props: TimePickerProps) => {
    const {
        value,
        placeholder = 'Pick a time',
        triggerInputClassName,
        label,
        isDestructive,
        supportiveText,
        onValueChange,
        ...rest
    } = props;

    const [open, setOpen] = useState<boolean>(false);

    const formattedValue = useMemo(() => value ?? '', [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Input
                    {...rest}
                    className={cn('w-full', triggerInputClassName)}
                    value={formattedValue}
                    type="text"
                    label={label}
                    placeholder={placeholder}
                    readOnly={true}
                    trailingIcon={<Clock onClick={() => setOpen(true)} />}
                    trailingIconClass="text-gray-700 dark:text-gray-100"
                    onKeyDown={e => e.preventDefault()}
                    isDestructive={isDestructive}
                    supportiveText={supportiveText}
                />
            </PopoverTrigger>
            <PopoverContent sideOffset={4} className="date-content">
                <TimePickerLib
                    value={value}
                    onChange={(time: any) => {
                        onValueChange?.(time ?? null);
                    }}
                    disableClock
                    format="HH:mm"
                />
            </PopoverContent>
        </Popover>
    );
};
