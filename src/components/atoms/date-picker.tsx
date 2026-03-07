/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Calendar } from 'lucide-react';
import { DateRange, DayPicker, DayPickerProps } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import 'react-day-picker/dist/style.css';
import { Input } from './input';
import { cn } from '@/lib/utils';

type CommonProps = {
    label?: string;
    placeholder?: string;
    triggerInputClassName?: string;
    isDestructive?: boolean;
    supportiveText?: string;
    disabledTrigger?: boolean;
    onSelect?: (date: any) => void;
    onBlur?: () => void;
} & Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect'>;

type DatePickerProps =
    | ({
          mode: 'single';
          value?: Date;
          onSelect?: (date: Date | undefined | null) => void;
      } & CommonProps)
    | ({
          mode: 'multiple';
          value?: Date[];
          onSelect?: (date: Date[] | undefined | null) => void;
      } & CommonProps)
    | ({
          mode: 'range';
          value?: DateRange;
          onSelect?: (date: DateRange | undefined | null) => void;
      } & CommonProps);

export const DatePicker = (props: DatePickerProps) => {
    const {
        value,
        mode,
        placeholder = 'Pick a date',
        triggerInputClassName,
        label,
        isDestructive,
        supportiveText,
        disabledTrigger,
        onSelect,
        onBlur,
        ...rest
    } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        if (!open && mounted) {
            onBlur?.();
        } else if (!mounted) {
            setMounted(true);
        }
    }, [open]);

    const formattedValue = useMemo(() => {
        if (mode === 'single' && value instanceof Date) {
            return moment(value).format('DD/MM/YYYY');
        }

        if (mode === 'multiple' && Array.isArray(value)) {
            return value.map(date => moment(date).format('DD/MM/YYYY')).join(', ');
        }

        if (mode === 'range' && value && 'from' in value) {
            const { from, to } = value;
            const fromStr = from ? moment(from).format('DD/MM/YYYY') : '';
            const toStr = to ? moment(to).format('DD/MM/YYYY') : '';
            return `${fromStr} - ${toStr}`;
        }

        return '';
    }, [value, mode]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Input
                    className={cn('w-full', triggerInputClassName)}
                    value={formattedValue}
                    type="text"
                    label={label}
                    placeholder={placeholder}
                    readOnly={true}
                    disabled={disabledTrigger}
                    trailingIcon={<Calendar onClick={() => setOpen(true)} />}
                    trailingIconClass="text-gray-700 dark:text-gray-100"
                    onKeyDown={e => e.preventDefault()}
                    isDestructive={isDestructive}
                    supportiveText={supportiveText}
                />
            </PopoverTrigger>
            <PopoverContent sideOffset={4} className="date-content">
                <DayPicker
                    {...rest}
                    mode={mode}
                    selected={value as any}
                    onSelect={(date: any) => {
                        onSelect?.(date);
                        setOpen(false);
                    }}
                />
                {value && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => {
                                onSelect?.(null);
                                setOpen(false);
                            }}
                        >
                            Clear
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
