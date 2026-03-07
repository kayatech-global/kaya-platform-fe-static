'use client';
import React from 'react';
import { useSidebar } from './sidebar';
import { SidebarMainMenuItemsType } from '@/constants';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms';
import { getWorkspacePath } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';

interface SidebarSingleLinkProps {
    item: SidebarMainMenuItemsType;
    IconComponent: React.ElementType;
    setSelectedMenuGroup: (value: React.SetStateAction<string | undefined>) => void;
}

export const SidebarSingleLink = ({ IconComponent, item, setSelectedMenuGroup }: SidebarSingleLinkProps) => {
    const { state } = useSidebar();
    const router = useRouter();

    const [workspaceInfo] = useLocalStorage('workspaceInfo');

    const handleClick = () => {
        if (item.isDisabled) return;
        setSelectedMenuGroup(item.id);
        router.push(getWorkspacePath(item.url, workspaceInfo?.id));
    };

    const renderExpandedContent = () => (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className="flex items-start gap-x-2">
                        <IconComponent
                            width={20}
                            height={20}
                            className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                        />
                        <p className="text-[13px] text-gray-100 border-none dark:text-gray-300">{item.title}</p>
                    </div>
                </TooltipTrigger>
                {item.isDisabled && (
                    <TooltipContent sideOffset={12} align="start" alignOffset={0} side="right">
                        <p>{item.disabledMessage}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );

    const renderCollapsedContent = () => (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <IconComponent width={20} height={20} className="text-gray-100 stroke-[1.5px] dark:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent sideOffset={12} align="start" alignOffset={0} side="right">
                    <p>{item.isDisabled ? item.disabledMessage ?? 'Disabled' : item.title}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <motion.div
            className="flex items-start gap-x-2 w-full py-[6px]"
            onClick={handleClick}
            whileTap={!item.isDisabled ? { scale: 0.97 } : undefined}
        >
            {(() => {
                if (state === 'expanded') {
                    return item.isDisabled ? renderExpandedContent() : (
                        <>
                            <IconComponent
                                width={20}
                                height={20}
                                className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                            />
                            <p className="text-[13px] text-gray-100 border-none dark:text-gray-300">{item.title}</p>
                        </>
                    );
                }
                return renderCollapsedContent();
            })()}
        </motion.div>
    );
};
