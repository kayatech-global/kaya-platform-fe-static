'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { SIDEBAR_MAIN_MENU_ITEMS, SidebarMainMenuGroupsType } from '@/constants';
import { SidebarGroup, useSidebar } from './sidebar';
import NavItemBase from './nav-item-base';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface NavGroupBaseProps {
    menuGroupItem: SidebarMainMenuGroupsType;
    selectedMenuGroupId?: string;
    setSelectedMenuGroupId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const NavGroupBase = ({ menuGroupItem, selectedMenuGroupId, setSelectedMenuGroupId }: NavGroupBaseProps) => {
    const { state } = useSidebar();
    const getParentIdByPath = (pathname: string) => {
        for (const parent of SIDEBAR_MAIN_MENU_ITEMS) {
            const matchingChild = parent.items?.find(item => item.url === pathname);

            if (matchingChild) {
                return parent.id;
            }
        }
        return undefined;
    };

    const pathName = usePathname();
    const [selectedMenuGroup, setSelectedMenuGroup] = useState(getParentIdByPath(pathName));

    useEffect(() => {
        setSelectedMenuGroup(getParentIdByPath(pathName));
    }, [pathName]);

    const sidebarVariants = {
        initial: { rotate: 0, scale: 1 },
        hover: {
            rotate: 10,
            scale: 1.1,
            transition: { type: 'spring', stiffness: 300 },
        },
    };

    const handleMenuGroupClick = (id: string) => {
        if (selectedMenuGroupId === id) {
            setSelectedMenuGroupId(undefined);
        } else {
            setSelectedMenuGroupId(id);
        }
    };

    return (
        <div
            key={menuGroupItem.id}
            className="sidebar-group w-full border bg-[rgba(97,148,250,0.2)] border-blue-500 dark:bg-[rgba(31,41,55,0.5)] dark:border-gray-800 rounded-md"
        >
            <motion.div
                onClick={() => handleMenuGroupClick(menuGroupItem.id)}
                whileHover="hover"
                initial="initial"
                className={cn(
                    'relative nav-group-header rounded-[6px_6px_0_0] border-blue-600 dark:border-gray-700 px-3 pb-3 pt-2 overflow-clip cursor-pointer hover:bg-[rgba(59,122,247,0.5)] dark:hover:bg-[rgba(31,41,55,0.7)] transition-all duration-200',
                    {
                        'border-b': selectedMenuGroupId === menuGroupItem.id,
                        'bg-[rgba(97,148,250,0.3)] dark:bg-[rgba(55,65,81,0.3)]':
                            selectedMenuGroupId === menuGroupItem.id,
                        'p-0 flex justify-center rounded-[0px_0px_0_0]': state === 'collapsed',
                    }
                )}
            >
                {/* Background Icon */}
                <TooltipProvider>
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <motion.i
                                className={cn(
                                    `${menuGroupItem.icon} absolute text-[80px] -top-[5px] -right-[13px] z-0 text-blue-400 dark:text-[rgba(55,65,81,0.5)]`,
                                    {
                                        'relative text-[24px] top-0 right-0 !text-gray-100 !dark:text-gray-400':
                                            state === 'collapsed',
                                        'pointer-events-none': state === 'expanded',
                                    }
                                )}
                                variants={sidebarVariants}
                            />
                        </TooltipTrigger>
                        {state === 'collapsed' && (
                            <TooltipContent sideOffset={12} align="center" alignOffset={0} side="right">
                                <p>{menuGroupItem.title}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
                {/* Foreground Content */}
                <div className={cn('relative z-10', { hidden: state === 'collapsed' })}>
                    <div className="flex items-center justify-between">
                        <p className="text-md font-medium text-gray-100">{menuGroupItem.title}</p>
                        <i className="ri-arrow-down-s-line text-gray-100" />
                    </div>
                    <p className="text-xs font-normal text-gray-100">{menuGroupItem.description}</p>
                </div>
            </motion.div>
            <AnimatePresence initial={false}>
                {selectedMenuGroupId === menuGroupItem.id && (
                    <motion.div
                        key="submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="sub-menu-items-container overflow-hidden"
                    >
                        <SidebarGroup>
                            {menuGroupItem.items.map((item, index) => {
                                return (
                                    <NavItemBase
                                        index={index}
                                        key={item.id}
                                        selectedMenuGroup={selectedMenuGroup}
                                        setSelectedMenuGroup={setSelectedMenuGroup}
                                        item={item}
                                        pathName={pathName}
                                        getParentIdByPath={getParentIdByPath}
                                    />
                                );
                            })}
                        </SidebarGroup>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
