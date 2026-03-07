import React from 'react';
import { motion } from 'framer-motion';
import { BellDot, ChevronDown, Maximize, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/atoms';
import { goFullScreen } from '@/lib/utils';
import { useTheme } from '@/theme';
import { useAuth } from '@/context';

export const WorkflowHeaderRight = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="right-section flex gap-x-8">
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
                <motion.div whileTap={{ scale: 0.9 }}>
                    <Maximize
                        onClick={goFullScreen}
                        width={20}
                        height={20}
                        className="text-white stroke-[1.8px] cursor-pointer"
                    />
                </motion.div>
            </div>
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
                            <DropdownMenuContent side="bottom" sideOffset={12}></DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};
