'use client';

import type React from 'react';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    ChevronRight,
    BotIcon as Robot,
    Globe,
    Variable,
    MSquareIcon,
    Library,
    Atom,
    Tags,
    Tag,
    Usb,
    Signpost,
    Zap,
} from 'lucide-react';
import { Button } from '@/components';
import { IntellisenseTools } from './monaco-editor';

type IntellisenseOption = {
    label: string;
    value: string;
    children?: IntellisenseOption[];
};

type IntellisenseCategory = {
    name: string;
    options: IntellisenseOption[];
};

type IntellisenseWidgetProps = {
    categories: IntellisenseCategory[];
    onSelect: (option: IntellisenseOption) => void;
    onClose: () => void;
    isAtTrigger: boolean;
    readOnly?: boolean;
    enableCategoryIcon?: boolean;
    onNewVariable: () => void;
    onHeightChange?: (height: number) => void;
};

export type IntellisenseWidgetHandle = {
    moveSelectionDown: () => void;
    moveSelectionUp: () => void;
    selectCurrent: () => void;
};

const IntellisenseWidget = forwardRef<IntellisenseWidgetHandle, IntellisenseWidgetProps>(
    (
        { readOnly, categories, onSelect, onClose, onNewVariable, onHeightChange, isAtTrigger, enableCategoryIcon },
        ref
    ) => {
        const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
        const [selectedIndex, setSelectedIndex] = useState(0);
        const widgetRef = useRef<HTMLDivElement>(null);
        const [flattenedOptions, setFlattenedOptions] = useState<
            { option: IntellisenseOption; categoryName: string }[]
        >([]);
        const [showingFlatOptions, setShowingFlatOptions] = useState(false);
        const [categoryStack, setCategoryStack] = useState<IntellisenseOption[]>([]);

        // Flatten options for direct selection when searching (but not when using @ trigger)
        useEffect(() => {
            if (isAtTrigger) {
                // In @ trigger mode, always use category view
                setShowingFlatOptions(false);
                setSelectedCategory(null);
                setCategoryStack([]);
            } else {
                const flattened = categories.flatMap(category =>
                    category.options.map(option => ({
                        option,
                        categoryName: category.name,
                    }))
                );
                setFlattenedOptions(flattened);
                setShowingFlatOptions(flattened.length > 0);
            }
        }, [categories, isAtTrigger]);

        // Get current options based on selected category
        // const currentOptions = selectedCategory
        //     ? categories.find(cat => cat.name === selectedCategory)?.options ?? []
        //     : [];
        const currentOptions = (() => {
            if (categoryStack.length > 0) return categoryStack[categoryStack.length - 1].children ?? [];
            if (selectedCategory) {
                return categories.find(cat => cat.name === selectedCategory)?.options ?? [];
            }
            return [];
        })();

        useImperativeHandle(ref, () => ({
            moveSelectionDown: () => {
                if (showingFlatOptions) {
                    setSelectedIndex(prev => (prev < flattenedOptions.length - 1 ? prev + 1 : prev));
                } else if (selectedCategory === null) {
                    setSelectedIndex(prev => (prev < categories.length - 1 ? prev + 1 : prev));
                } else {
                    setSelectedIndex(prev => (prev < currentOptions.length - 1 ? prev + 1 : prev));
                }
            },
            moveSelectionUp: () => {
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            },
            selectCurrent: () => {
                if (showingFlatOptions) {
                    // Select from flattened options
                    if (flattenedOptions[selectedIndex]) {
                        onSelect(flattenedOptions[selectedIndex].option);
                    }
                } else if (selectedCategory === null) {
                    // Select category
                    if (categories[selectedIndex]) {
                        setSelectedCategory(categories[selectedIndex].name);
                        setSelectedIndex(0);
                        setCategoryStack([]);
                    }
                } else if (currentOptions[selectedIndex]) {
                    onSelect(currentOptions[selectedIndex]);
                }
            },
        }));

        // Reset selected index when category changes
        useEffect(() => {
            setSelectedIndex(0);
        }, [selectedCategory, showingFlatOptions]);

        // Handle click outside to close the widget
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [onClose]);

        useEffect(() => {
            if (!widgetRef.current || !onHeightChange) return;
            const element = widgetRef.current;

            onHeightChange(element.clientHeight);

            const observer = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const newHeight = entry.contentRect.height;
                    onHeightChange(newHeight);
                }
            });

            observer.observe(element);

            return () => observer.disconnect();
        }, [onHeightChange]);

        const getCategoryIcon = (categoryName: string) => {
            switch (categoryName) {
                case 'Agents':
                    return <Robot className="h-4 w-4 text-blue-500" />;
                case 'APIs':
                    return <Globe className="h-4 w-4 text-green-500" />;
                case 'Variables':
                    return <Variable className="h-4 w-4 text-amber-500" />;
                case 'MCPs':
                    return <MSquareIcon className="h-4 w-4 text-green-500" />;
                case 'Vector RAGs':
                    return <Library className="h-4 w-4 text-sky-400" />;
                case 'Graph RAGs':
                    return <Atom className="h-4 w-4 text-sky-500" />;
                case 'Database Connectors':
                    return <Usb className="h-4 w-4 text-red-400" />;
                case 'Executable Functions':
                    return <Zap className="h-4 w-4 text-purple-500" />;
                case 'Metadata':
                    return <Tags className="h-4 w-4 text-blue-500" />;
                case 'Attributes':
                    return <Signpost className="h-4 w-4 text-green-500" />;
                default:
                    return null;
            }
        };

        const onNewVariableClick = () => {
            setSelectedCategory(null);
            setCategoryStack([]);
            setSelectedIndex(0);
            onNewVariable();
            onClose();
        };

        const handleSelectOption = (option: IntellisenseOption) => {
            if (option.children && option.children.length > 0) {
                // Push into stack
                setCategoryStack(prev => [...prev, option]);
                setSelectedIndex(0);
            } else {
                // Final selection
                onSelect(option);
            }
        };

        const handleGoBack = () => {
            if (categoryStack.length > 0) {
                // go one step back in the stack
                setCategoryStack(prev => prev.slice(0, -1));
                setSelectedIndex(0);
            } else {
                // back to category list
                setSelectedCategory(null);
                setSelectedIndex(0);
            }
        };

        return (
            <div
                ref={widgetRef}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-hidden min-w-[300px] max-w-[300px] max-h-[200px] overflow-y-auto"
            >
                {(() => {
                    if (showingFlatOptions) {
                        return (
                            <div className="p-1">
                                <div className="p-2 text-sm font-medium text-gray-500 rounded-sm border-b-[1px] dark:border-gray-600 dark:text-gray-300 mb-2">
                                    Select an option
                                </div>
                                {flattenedOptions.map((item, index) => (
                                    <button
                                        type="button"
                                        key={item.option.value}
                                        className={`flex items-center p-2 text-sm hover:bg-gray-100 hover:dark:bg-gray-800 my-2 cursor-pointer w-full rounded-md break-all ${
                                            index === selectedIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`.trimEnd()}
                                        onClick={e => {
                                            e.stopPropagation();
                                            onSelect(item.option);
                                        }}
                                    >
                                        <div className="flex items-center  !text-left">
                                            {getCategoryIcon(item.categoryName)}
                                            <span className="ml-2">{item.option.label}</span>
                                            <span className="ml-2 text-gray-500 text-[9px] dark:text-gray-400">
                                                ({item.categoryName})
                                            </span>
                                        </div>
                                    </button>
                        ))}
                            </div>
                        );
                    }
                    if (selectedCategory === null) {
                        return (
                            <div className="p-1">
                                <div className="p-2 text-sm font-medium text-gray-500 rounded-sm border-b-[1px] dark:border-gray-600 dark:text-gray-300 mb-2">
                                    Select a category
                                </div>
                                {categories.map((category, index) => (
                                    <button
                                        type="button"
                                        key={category.name}
                                        className={`flex items-center p-2 text-sm hover:bg-gray-100 hover:dark:bg-gray-800 my-2 cursor-pointer w-full rounded-md break-all text-left ${
                                            index === selectedIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`.trimEnd()}
                                        onClick={e => {
                                            e.stopPropagation();
                                            setSelectedCategory(category.name);
                                            setSelectedIndex(0);
                                        }}
                                    >
                                        <div className="flex items-center">
                                            {getCategoryIcon(category.name)}
                                            <span className="ml-2">{category.name}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </button>
                        ))}
                            </div>
                        );
                    }
                    return (
                        <div className="p-1">
                        <button
                            type="button"
                            className="p-2 text-sm font-medium text-gray-500 rounded-sm border-b-[1px] dark:border-gray-600 dark:text-gray-300 mb-2 flex items-center gap-x-1 w-full text-left bg-transparent border-0"
                            onClick={e => {
                                e.stopPropagation();
                                handleGoBack();
                            }}
                        >
                            <ChevronRight className="h-4 w-4 text-gray-400 rotate-180 mr-1" />
                            {selectedCategory === 'Variables' ? (
                                <div className="flex items-center w-full">
                                    <div className="flex items-center">
                                        {getCategoryIcon(selectedCategory)}
                                        <span className="ml-2">{selectedCategory}</span>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="ml-auto"
                                        disabled={readOnly}
                                        onClick={e => {
                                            e.stopPropagation();
                                            onNewVariableClick();
                                        }}
                                    >
                                        New Variable
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    {getCategoryIcon(selectedCategory)}
                                    <span className="ml-2">
                                        {categoryStack.length > 0
                                            ? categoryStack[categoryStack.length - 1].label
                                            : selectedCategory}
                                    </span>
                                </div>
                            )}
                        </button>

                        {currentOptions.length > 0 ? (
                            currentOptions.map((option, index) => (
                                <button
                                    type="button"
                                    key={option.value}
                                    className={`flex items-center p-2 text-sm hover:bg-gray-100 hover:dark:bg-gray-800 my-2 cursor-pointer w-full rounded-md break-all text-left ${
                                        index === selectedIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                                    }`.trimEnd()}
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleSelectOption(option);
                                    }}
                                >
                                    {enableCategoryIcon && selectedCategory === IntellisenseTools.Metadata ? (
                                        <span className="flex gap-2 items-center">
                                            {option?.children && option?.children?.length > 0 ? (
                                                <Tags className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <Tag className="h-4 w-4 text-blue-500" />
                                            )}
                                            <span>{option.label}</span>
                                        </span>
                                    ) : (
                                        option.label
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-xs text-gray-400">No {selectedCategory} found.</div>
                        )}
                        </div>
                    );
                })()}
            </div>
        );
    }
);

IntellisenseWidget.displayName = 'IntellisenseWidget';

export default IntellisenseWidget;
