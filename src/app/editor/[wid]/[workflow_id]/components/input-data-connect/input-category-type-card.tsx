import React from 'react';
import { InputConnectCategoryType, InputConnectKey } from './input-data-connect-modal';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components';

interface InputCategoryTypeCardProps {
    category: InputConnectCategoryType;
    selectedCategory: InputConnectCategoryType;
    setSelectedCategory: React.Dispatch<React.SetStateAction<InputConnectCategoryType>>;
    selectedCounts: Record<InputConnectKey, number>;
}

export const InputCategoryTypeCard = ({
    category,
    selectedCategory,
    setSelectedCategory,
    selectedCounts,
}: InputCategoryTypeCardProps) => {
    return (
        <button
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={cn(
                'h-[38px] px-3 py-2 dark:bg-gray-700 border dark:border-gray-600 border-gray-300 rounded mb-1 w-full cursor-pointer hover:bg-[rgba(97,148,250,0.2)] hover:border-[rgba(97,148,250,0.5)] transition-all duration-100 text-left',
                {
                    'bg-[rgba(97,148,250,0.2)] border-[rgba(97,148,250,0.5)]':
                        selectedCategory.categoryKey === category.categoryKey,
                }
            )}
        >
            <div className="w-full flex items-center justify-between">
                <div className="text-sm font-medium flex items-center justify-center dark:text-white">
                    {category.categoryName}
                    {selectedCounts[category.categoryKey] > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold cursor-pointer">
                                        {selectedCounts[category.categoryKey]}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                    {selectedCounts[category.categoryKey]} {category.categoryName} configs attached to
                                    this agent
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {selectedCategory.categoryKey === category.categoryKey && (
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0.5, x: 0 }}
                        animate={{ scale: 1, opacity: 1, x: [0, 10] }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="flex items-center gap-2"
                    >
                        <ChevronRight size={18} className="dark:text-white" />
                    </motion.div>
                )}
            </div>
        </button>
    );
};
