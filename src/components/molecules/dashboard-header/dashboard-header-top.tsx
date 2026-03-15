import React, { useEffect, useRef, useState } from 'react';
import { SidebarTrigger } from '../sidebar/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/atoms';
import { BellDot, ChevronDown, Info, Maximize, Moon, Sun } from 'lucide-react';
import { cn, goFullScreen } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { useTheme } from '@/theme';
import { DashboardHeaderProps } from './dashboard-header';
import Image from 'next/image';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useBreakpoint } from '@/hooks/use-breakpoints';

interface DashboardHeaderTopProps extends DashboardHeaderProps {
    value: string;
}

const DashboardHeaderTop = ({ isFullWidth }: Readonly<DashboardHeaderTopProps>) => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [workspaceInfo] = useLocalStorage('workspaceInfo');
    const { isSm, isMobile } = useBreakpoint();
    const [infoOpen, setInfoOpen] = useState(false);
    const infoRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
                setInfoOpen(false);
            }
        };
        if (infoOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [infoOpen]);

    return (
        <div
            className={cn('header-top flex items-center justify-between py-3 border-b border-b-blue-400', {
                'px-16': isFullWidth,
                'px-6': !isFullWidth,
            })}
        >
            <div
                className={cn('left-section flex items-center gap-x-6', {
                    'gap-x-2': isMobile,
                })}
            >
                {isFullWidth ? (
                    <div className="logo w-fit h-fit py-[6.5px]">
                        <Image alt="kaya-logo" width={142} height={29} src={'/png/kaya-logo-light.png'} />
                    </div>
                ) : (
                    <React.Fragment>
                        {!isSm && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <SidebarTrigger />
                            </motion.div>
                        )}
                        <p className={cn('text-gray-100 text-xl font-semibold', { 'text-sm': isMobile })}>
                            {workspaceInfo?.name}
                        </p>
                    </React.Fragment>
                )}
            </div>
            <div className="right-section flex gap-x-8">
                {!isMobile && (
                    <div className="section-one border-r border-r-blue-400 flex items-center gap-x-8 pr-8">
                        <motion.div
                            onClick={toggleTheme}
                            className="cursor-pointer p-2 rounded-full flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                        >
                            <motion.div
                                key={theme}
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {theme === 'light' ? (
                                    <Sun className="text-white" size={20} />
                                ) : (
                                    <Moon className="text-white" size={20} />
                                )}
                            </motion.div>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <BellDot width={20} height={20} className="text-white stroke-[1.8px] cursor-pointer" />
                        </motion.div>
                        <div ref={infoRef} className="relative">
                            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setInfoOpen((prev) => !prev)}>
                                <Info width={20} height={20} className="text-white stroke-[1.8px] cursor-pointer" />
                            </motion.div>
                            <AnimatePresence>
                                {infoOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute right-0 top-8 z-50 w-52 rounded-lg border border-blue-400/30 bg-[#0d1117] shadow-xl shadow-black/40"
                                    >
                                        <div className="flex flex-col items-center gap-y-3 px-4 py-4">
                                            <Image
                                                alt="kaya-logo"
                                                width={80}
                                                height={16}
                                                src="/png/kaya-logo-light.png"
                                                className="opacity-90"
                                            />
                                            <div className="w-full border-t border-blue-400/20" />
                                            <div className="flex w-full flex-col gap-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Platform</span>
                                                    <span className="text-xs font-medium text-white">KAYA AI Platform</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Version</span>
                                                    <span className="text-xs font-medium text-white">v2.4.0</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Build</span>
                                                    <span className="text-xs font-medium text-white">2026.03.15</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Maximize
                                onClick={goFullScreen}
                                width={20}
                                height={20}
                                className="text-white stroke-[1.8px] cursor-pointer"
                            />
                        </motion.div>
                    </div>
                )}

                <div className="section-two avatar-section flex gap-x-3 items-center">
                    <div className="avatar-container flex items-center gap-x-3">
                        <Avatar className="w-7 h-7 cursor-pointer">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-x-1">
                            <p className="text-sm font-medium text-white">{user?.name ?? ''}</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <ChevronDown
                                        className="stroke-1 text-gray-100 cursor-pointer dark:text-gray-200"
                                        size={16}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="bottom"
                                    sideOffset={12}
                                    className="flex flex-col gap-y-2"
                                    align="end"
                                >
                                    {isMobile && (
                                        <DropdownMenuItem className="flex items-center justify-evenly w-full ">
                                            <motion.div
                                                onClick={toggleTheme}
                                                className="cursor-pointer rounded-full flex items-start justify-start"
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <motion.div
                                                    key={theme}
                                                    initial={{ rotate: 90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: -90, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                                >
                                                    {theme === 'light' ? (
                                                        <Sun className="text-gray-700" size={18} />
                                                    ) : (
                                                        <Moon className="text-gray-200" size={18} />
                                                    )}
                                                </motion.div>
                                            </motion.div>
                                            <motion.div whileTap={{ scale: 0.9 }}>
                                                <Maximize
                                                    onClick={goFullScreen}
                                                    width={20}
                                                    height={20}
                                                    className="text-gray-700 dark:text-gray-200 stroke-[1.8px] cursor-pointer"
                                                />
                                            </motion.div>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeaderTop;
