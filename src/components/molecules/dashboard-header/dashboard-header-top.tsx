import React from 'react';
import { SidebarTrigger } from '../sidebar/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/atoms';
import { BellDot, ChevronDown, Maximize, Moon, Sun, Smile } from 'lucide-react';
import { cn, goFullScreen } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { useTheme } from '@/theme';
import { DashboardHeaderProps } from './dashboard-header';
import Image from 'next/image';
import { useAuth } from '@/context';
import { motion } from 'framer-motion';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { toast } from 'sonner';

const comedyJokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Why don't scientists trust atoms? Because they make up everything!",
    "I'm reading a book about anti-gravity. It's impossible to put down!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "I used to hate facial hair, but then it grew on me.",
    "What do you call a fake noodle? An impasta!",
    "Why did the coffee file a police report? It got mugged!",
    "I'm on a seafood diet. I see food and I eat it.",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "I told my computer I needed a break, and now it won't stop sending me vacation ads.",
    "Why did the developer go broke? Because he used up all his cache!",
    "There are only 10 types of people in the world: those who understand binary and those who don't.",
    "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
];

interface DashboardHeaderTopProps extends DashboardHeaderProps {
    value: string;
}

const DashboardHeaderTop = ({ isFullWidth }: Readonly<DashboardHeaderTopProps>) => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [workspaceInfo] = useLocalStorage('workspaceInfo');
    const { isSm, isMobile } = useBreakpoint();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleHappyClick = () => {
        const randomJoke = comedyJokes[Math.floor(Math.random() * comedyJokes.length)];
        toast.success(randomJoke, {
            duration: 5000,
            icon: '😂',
        });
    };

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
                        <motion.button
                            onClick={handleHappyClick}
                            className="flex items-center gap-x-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <Smile className="text-white" size={18} />
                            <span className="text-white text-sm font-medium">Happy Click</span>
                        </motion.button>
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
