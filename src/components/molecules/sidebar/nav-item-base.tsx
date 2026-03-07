'use client';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/atoms';
import { SidebarMainMenuItemsType } from '@/constants';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import useLocalStorage from '@/hooks/useLocalStorage';
import { cn, getWorkspacePath } from '@/lib/utils';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SidebarMenuButton, useSidebar } from './sidebar';
import { SidebarSingleLink } from './sidebar-single-link';

interface NavItemBaseProps {
    index: number;
    item: SidebarMainMenuItemsType;
    selectedMenuGroup?: string;
    setSelectedMenuGroup: React.Dispatch<React.SetStateAction<string | undefined>>;
    pathName: string;
    getParentIdByPath: (pathname: string) => string | undefined;
}

const NavItemBase = ({ index, item, selectedMenuGroup, setSelectedMenuGroup, pathName }: NavItemBaseProps) => {
    const { push } = useRouter();
    const { isMobile } = useBreakpoint();
    const [workspaceInfo] = useLocalStorage('workspaceInfo');
    const { state } = useSidebar();
    const [isOpen, setIsOpen] = useState(selectedMenuGroup === item.id);
    const IconComponent = LucideIcons[item.icon] as React.ElementType;

    return (
        <div
            key={item.id}
            className={cn('nav-item-bas pl-2 pr-3 rounded-[6px] items-center', {
                'hover:bg-blue-600 hover:dark:bg-[rgba(31,41,55,0.5)]': !item.isDisabled,
                'cursor-not-allowed opacity-50': item.isDisabled,
                'selected-menu-bg dark:border-gray-700 dark:bg-[rgba(31,41,55,0.5)]':
                    selectedMenuGroup === item.id || getWorkspacePath(item.url, workspaceInfo?.id) === pathName,
                'px-2': state === 'collapsed',
                'mt-4': index === 0,
            })}
        >
            <div className="menu-item-header flex justify-between items-center cursor-pointer">
                {item.isSingleLink ? (
                    <SidebarSingleLink
                        item={item}
                        setSelectedMenuGroup={setSelectedMenuGroup}
                        IconComponent={IconComponent}
                    />
                ) : (
                    <>
                        {state === 'expanded' ? (
                            <Collapsible
                                defaultOpen={selectedMenuGroup === item.id}
                                onOpenChange={open => setIsOpen(open)}
                                className={cn('group/collapsible w-full flex flex-col gap-y-3', {})}
                            >
                                <CollapsibleTrigger className="flex items-start justify-between w-full py-2">
                                    <div className="flex items-start gap-x-2">
                                        <IconComponent
                                            width={20}
                                            height={20}
                                            className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                                        />
                                        <p className="text-[13px] text-gray-100 border-none dark:text-gray-300 text-left">
                                            {item.title}
                                        </p>
                                    </div>
                                    <LucideIcons.ChevronRight
                                        height={16}
                                        width={16}
                                        className="text-gray-100 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 dark:text-gray-300"
                                    />
                                </CollapsibleTrigger>
                                {isOpen && (
                                    <CollapsibleContent className="flex flex-col gap-y-2 pl-3 pb-2">
                                        {item.items?.map((subMenu) => {
                                            return (
                                                <motion.div
                                                    key={subMenu.id}
                                                    className={cn('sidebar-menu-item flex items-center px-3 py-[6px]', {
                                                        'hover:bg-blue-600 hover:dark:bg-[rgba(31,41,55,0.3)]':
                                                            !subMenu.isDisabled,
                                                        'cursor-not-allowed opacity-50': subMenu.isDisabled,
                                                        'selected-menu-bg border-l-white rounded-lg dark:border-gray-700 dark:bg-[rgba(31,41,55,0.5)] selected':
                                                            getWorkspacePath(subMenu.url, workspaceInfo?.id) ===
                                                            pathName,
                                                    })}
                                                    whileTap={!subMenu.isDisabled ? { scale: 0.97 } : undefined}
                                                    onClick={() => {
                                                        if (subMenu.isDisabled) return;
                                                        setSelectedMenuGroup(subMenu.id);
                                                        push(getWorkspacePath(subMenu.url, workspaceInfo?.id));
                                                    }}
                                                >
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={0}>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-xs text-gray-100 dark:text-gray-300 w-full">
                                                                    {subMenu.title}
                                                                </span>
                                                            </TooltipTrigger>
                                                            {subMenu.isDisabled && (
                                                                <TooltipContent
                                                                    sideOffset={12}
                                                                    align="start"
                                                                    alignOffset={0}
                                                                    side="right"
                                                                >
                                                                    <p>{subMenu.disabledMessage ?? 'Disabled'}</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </motion.div>
                                            );
                                        })}
                                    </CollapsibleContent>
                                )}
                            </Collapsible>
                        ) : (
                            <DropdownMenu>
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton className="flex items-center justify-between w-full px-0">
                                                    <div className="flex items-center gap-x-2">
                                                        <IconComponent
                                                            width={20}
                                                            height={20}
                                                            className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                                                        />
                                                    </div>
                                                    <LucideIcons.ChevronRight
                                                        height={16}
                                                        width={16}
                                                        className="text-gray-100 transition-transform duration-200 dark:text-gray-300"
                                                    />
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent sideOffset={12} align="start" alignOffset={0} side="right">
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {item.items?.length ? (
                                    <DropdownMenuContent
                                        side={isMobile ? 'bottom' : 'right'}
                                        align={isMobile ? 'end' : 'start'}
                                        className="min-w-56 rounded-lg"
                                    >
                                        {item.items.map((subMenu) => (
                                            <DropdownMenuItem
                                                key={subMenu.id}
                                                disabled={subMenu.isDisabled}
                                                className={cn({
                                                    'cursor-not-allowed opacity-50': subMenu.isDisabled,
                                                })}
                                                onSelect={e => {
                                                    if (subMenu.isDisabled) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                onClick={e => {
                                                                    if (subMenu.isDisabled) {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    setSelectedMenuGroup(subMenu.id);
                                                                }}
                                                                href={
                                                                    subMenu.isDisabled
                                                                        ? '#'
                                                                        : getWorkspacePath(
                                                                              subMenu.url,
                                                                              workspaceInfo?.id
                                                                          )
                                                                }
                                                                className="text-xs text-gray-500 dark:text-gray-300 w-full px-3 py-[6px]"
                                                            >
                                                                {subMenu.title}
                                                            </Link>
                                                        </TooltipTrigger>
                                                        {subMenu.isDisabled && (
                                                            <TooltipContent side="right">
                                                                <p>{subMenu.disabledMessage ?? 'Disabled'}</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                ) : null}
                            </DropdownMenu>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NavItemBase;
