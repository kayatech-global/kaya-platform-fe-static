import React, { useState } from 'react';
import { Control, Controller, Path } from 'react-hook-form';
import { Textarea } from '@/components/atoms/textarea';
import { Edit2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
// Generic interface to allow flexible usage
// We'll use use a generic T for Control if possible, but simplest is to just use 'any' or loosen internal type
// to avoid strict dependency on ITest everywhere if not needed, but for now assuming ITest is fine.
// Actually, to make it decoupled, let's use 'any' for the control type or a generic.
import { ITestSuite } from '../../data-generation';

// Helper component for individual editable fields
export const EditableField = ({
    control,
    name,
    label,
    value,
    readOnly,
    placeholder,
    icon,
    defaultExpanded,
    children,
}: {
    control?: Control<ITestSuite>;
    name: string;
    label: string;
    value: string;
    readOnly: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
    defaultExpanded?: boolean;
    children?: React.ReactNode;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? true);

    const toggleExpand = (e: React.MouseEvent) => {
        // Prevent toggle if clicking edit controls
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Common header part
    const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(prev => !prev);
        }
    };

    const Header = () => (
        <button
            type="button"
            className={cn(
                'flex w-full items-center justify-between cursor-pointer select-none transition-colors duration-200 text-left border-0 bg-transparent',
                isExpanded ? 'px-2 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600' : 'px-2 py-2'
            )}
            onClick={toggleExpand}
            onKeyDown={handleHeaderKeyDown}
        >
            <div className="flex items-center gap-2 justify-between w-full">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div
                            className={cn(
                                'p-1.5 bg-gray-50 dark:bg-gray-600 rounded-sm text-gray-600 dark:text-gray-300',
                                isExpanded ? 'text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600' : ''
                            )}
                        >
                            {icon}
                        </div>
                    )}
                    <label
                        className={cn(
                            'text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer',
                            isExpanded ? 'text-gray-700 dark:text-gray-200' : ''
                        )}
                    >
                        {label}
                    </label>
                </div>
                <div className="text-blue-400 hover:text-blue-600 transition-colors">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
            </div>
            {isExpanded &&
                (isEditing ? (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-100/50 text-green-600"
                        onClick={e => {
                            e.stopPropagation();
                            setIsEditing(false);
                        }}
                        title="Done"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                ) : (
                    !readOnly && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 transition-opacity text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={e => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            title="Edit"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    )
                ))}
        </button>
    );

    // Wrapper container style based on state
    const containerClass = cn(
        'border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 transition-all duration-200 group overflow-hidden',
        !isExpanded && 'hover:bg-gray-50 dark:hover:bg-gray-700'
    );

    return (
        <div className={containerClass}>
            <Header />
            {isExpanded && (
                <div className="p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {isEditing && control && !readOnly ? (
                        <Controller
                            name={name as Path<ITestSuite>}
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    autoFocus
                                    value={field.value || ''}
                                    className="min-h-[60px] font-mono text-sm bg-white dark:bg-gray-900 border-blue-400 text-gray-800 dark:text-gray-200 resize-y transition-all focus:ring-0 focus:border-blue-500 overflow-hidden"
                                    placeholder={placeholder}
                                    onBlur={() => setIsEditing(false)}
                                    onInput={e => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    ref={e => {
                                        field.ref(e);
                                        if (e) {
                                            e.style.height = 'auto';
                                            e.style.height = `${e.scrollHeight}px`;
                                        }
                                    }}
                                />
                            )}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => !readOnly && !isEditing && setIsEditing(true)}
                            className={cn(
                                'min-h-[60px] p-3 text-sm font-mono bg-blue-50/50 dark:bg-gray-900 border border-blue-100 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-y-auto transition-all w-full text-left',
                                !readOnly && 'hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700 cursor-text'
                            )}
                        >
                            {value || <span className="text-gray-400 dark:text-gray-500 italic">{placeholder}</span>}
                        </button>
                    )}
                    {children && <div className="mt-4 border-t dark:border-gray-700 pt-4">{children}</div>}
                </div>
            )}
        </div>
    );
};
