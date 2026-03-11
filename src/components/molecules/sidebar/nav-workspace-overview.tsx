'use client';

import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import { useSidebar } from './sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import { cn, getWorkspacePath } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';

export const NavWorkspaceOverview = () => {
    const { state } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [workspaceInfo] = useLocalStorage('workspaceInfo');

    // Get workspace ID from URL params or localStorage
    const workspaceId = (params?.wid as string) || workspaceInfo?.id;
    const workspaceName = workspaceInfo?.name || 'Workspace';

    // Check if current path is the overview page
    const isActive = pathname?.includes('/overview');

    const handleClick = () => {
        if (workspaceId) {
            router.push(getWorkspacePath('/workspace/[wid]/overview', workspaceId));
        }
    };

    // Don't render if no workspace is selected
    if (!workspaceId) return null;

    return (
        <div
            className={cn('mb-2', {
                'px-[10px]': state === 'expanded',
                'px-[3px]': state === 'collapsed',
            })}
        >
            <motion.div
                onClick={handleClick}
                whileTap={{ scale: 0.97 }}
                className={cn(
                    'flex items-center gap-x-3 w-full py-2.5 px-3 rounded-md cursor-pointer transition-all duration-200',
                    'bg-[rgba(97,148,250,0.3)] border border-blue-500',
                    'dark:bg-[rgba(31,41,55,0.5)] dark:border-gray-700',
                    'hover:bg-[rgba(59,122,247,0.5)] dark:hover:bg-[rgba(31,41,55,0.7)]',
                    {
                        'bg-[rgba(59,122,247,0.6)] dark:bg-[rgba(55,65,81,0.6)]': isActive,
                        'justify-center': state === 'collapsed',
                    }
                )}
            >
                {state === 'expanded' ? (
                    <>
                        <LayoutDashboard
                            size={18}
                            className="text-gray-100 dark:text-gray-300 flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-normal text-gray-200 dark:text-gray-400 truncate">
                                Workspace Overview
                            </span>
                            <span className="text-sm font-medium text-gray-100 dark:text-gray-200 truncate">
                                {workspaceName}
                            </span>
                        </div>
                    </>
                ) : (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <LayoutDashboard
                                    size={20}
                                    className="text-gray-100 dark:text-gray-300"
                                />
                            </TooltipTrigger>
                            <TooltipContent sideOffset={12} align="center" side="right">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Workspace Overview</span>
                                    <span className="font-medium">{workspaceName}</span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </motion.div>
        </div>
    );
};
