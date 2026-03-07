/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useController, Control } from 'react-hook-form';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Info } from 'lucide-react';

interface TagsInputProps {
    name: string;
    control: Control<any>;
    rules?: any;
    label?: string;
    disabled?: boolean;
    helperInfo?: string;
}

export const TagsInput = ({ name, control, rules, label, disabled, helperInfo }: TagsInputProps) => {
    const {
        field: { value, onChange, onBlur },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules,
        defaultValue: [] as string[],
    });

    const [input, setInput] = useState<string>('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            const newTag = input.trim();
            if (!value.includes(newTag)) {
                onChange([...value, newTag]);
            }
            setInput('');
        }
    };

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_tag: string, i: number) => i !== indexToRemove));
        onBlur();
    };

    const handleBlur = () => {
        onBlur();
    };

    return (
        <div className="w-full">
            {label && (
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                    {label}
                    {helperInfo && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info size={13} />
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center" className="max-w-[250px]">
                                {helperInfo}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Label>
            )}
            <div
                {...(label && {
                    className: 'pt-1 min-h-[36px]',
                })}
            >
                <div
                    className={`border border-solid border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg sm:p-2 flex flex-wrap gap-2 ${
                        error ? '!border-red-300' : ''
                    }`.trimEnd()}
                >
                    {value.map((tag: string, index: number) => (
                        <div
                            key={`tag-${index}-${tag}`}
                            className="flex h-6 items-center bg-blue-100 dark:bg-blue-300 border border-blue-300 dark:border-blue-400 text-blue-700 dark:text-blue-900 px-2 py-1 rounded-lg text-xs font-normal"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                disabled={disabled}
                                className="ml-2 text-blue-700"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <input
                        className="flex-grow outline-none px-2 bg-transparent items-center text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder="Type and press enter..."
                    />
                </div>
            </div>
            {error && <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">{error.message}</p>}
        </div>
    );
};
